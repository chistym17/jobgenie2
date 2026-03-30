import argparse
import io
import json
from contextlib import redirect_stdout
from datetime import datetime, timezone
from pathlib import Path

from bson import ObjectId

from db import fetch_resume_data_by_upload_id, get_mongodb_client
from fetch_recommendations import fetch_recommendations
from services.recommender_service import RecommenderService


def get_first_upload_id() -> str:
    client = get_mongodb_client()
    try:
        db = client["jobs_db"]
        uploads = db["resume_uploads"]
        doc = uploads.find_one({}, sort=[("created_at", -1)])
        if not doc:
            raise ValueError("No uploads found in resume_uploads")
        return str(doc["_id"])
    finally:
        client.close()


def load_upload_context(upload_id: str) -> dict:
    client = get_mongodb_client()
    try:
        db = client["jobs_db"]
        uploads = db["resume_uploads"]
        upload = uploads.find_one({"_id": ObjectId(upload_id)})
        if not upload:
            raise ValueError(f"Upload not found: {upload_id}")
        user_email = str(upload.get("user_email") or "").strip()
        if not user_email:
            raise ValueError(f"user_email missing on upload: {upload_id}")
        resume = fetch_resume_data_by_upload_id(upload_id) or {}
        if not resume:
            raise ValueError(f"Resume not found for upload: {upload_id}")
        return {
            "upload_id": upload_id,
            "user_email": user_email,
            "upload_status": upload.get("status"),
            "resume": resume,
        }
    finally:
        client.close()


def run_retrieval(user_email: str) -> dict:
    buf = io.StringIO()
    with redirect_stdout(buf):
        candidates = fetch_recommendations(user_email)
    logs = [x for x in buf.getvalue().splitlines() if x.strip()]
    top_preview = []
    for idx, c in enumerate(candidates[:10], start=1):
        top_preview.append(
            {
                "rank": idx,
                "job_id": c.get("job_id"),
                "title": c.get("title"),
                "company": c.get("company"),
                "rrf_score": c.get("rrf_score"),
                "hybrid_sort_score": c.get("hybrid_sort_score"),
                "skill_overlap_count": c.get("skill_overlap_count"),
            }
        )
    return {
        "candidate_count": len(candidates),
        "top_candidates": top_preview,
        "logs": logs,
    }


def run_recommendation_generation(user_email: str) -> dict:
    service = RecommenderService()
    buf = io.StringIO()
    with redirect_stdout(buf):
        recommendations = service.generate_recommendations(user_email)
    logs = [x for x in buf.getvalue().splitlines() if x.strip()]
    return {
        "recommendation_count": len(recommendations or []),
        "recommendations": recommendations or [],
        "logs": logs,
    }


def write_output(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--upload-id", default="")
    parser.add_argument("--output", default="")
    args = parser.parse_args()

    started_at = datetime.now(timezone.utc)
    upload_id = args.upload_id.strip() or get_first_upload_id()
    ctx = load_upload_context(upload_id)

    retrieval = run_retrieval(ctx["user_email"])
    generation = run_recommendation_generation(ctx["user_email"])

    finished_at = datetime.now(timezone.utc)
    payload = {
        "started_at": started_at.isoformat(),
        "finished_at": finished_at.isoformat(),
        "duration_sec": round((finished_at - started_at).total_seconds(), 3),
        "upload_id": ctx["upload_id"],
        "user_email": ctx["user_email"],
        "upload_status": ctx["upload_status"],
        "resume_snapshot": {
            "name": ctx["resume"].get("name"),
            "skills_count": len(ctx["resume"].get("skills") or []),
            "experience_count": len(ctx["resume"].get("experience") or []),
            "projects_count": len(ctx["resume"].get("projects") or []),
        },
        "retrieval": retrieval,
        "generation": generation,
    }

    if args.output:
        output_path = Path(args.output)
    else:
        ts = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
        output_path = Path("test-logs") / f"hybrid-pipeline-{args.upload_id[:8]}-{ts}.json"

    write_output(output_path, payload)

    print(f"Saved: {output_path}")
    print(f"Upload: {ctx['upload_id']}")
    print(f"User: {ctx['user_email']}")
    print(f"Candidates: {retrieval['candidate_count']}")
    print(f"Recommendations: {generation['recommendation_count']}")


if __name__ == "__main__":
    main()
