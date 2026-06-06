"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, ChevronRight, Link2, Sparkles, X } from "lucide-react";
import Navbar from "./Navbar";
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useQuotaStatus } from "../../hooks/useQuotaStatus";
import { useUploadHistory } from "../../hooks/useUploadHistory";

type Recommendation = {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;
  salary: string;
  matchScore: number;
  directLink?: string;
  stack: string[];
  description: string;
  keyRequirements: string;
  keyRequirementItems: string[];
};

type MatchCoachResult = {
  why_good_match: string[];
  improvements: string[];
};

function normalizeCoachBullets(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\n+/)
      .map((line) => line.replace(/^[-•*\d.)]+\s*/, "").trim())
      .filter(Boolean);
  }
  return [];
}

function CoachInsightBlock({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: string[];
}) {
  if (!items.length) return null;
  return (
    <section className="v2-coach-insight-block">
      <div className="mb-3">
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <p className="text-xs v2-text-muted mt-1">{description}</p>
      </div>
      <ul className="space-y-0">
        {items.map((line, i) => (
          <li key={i} className="v2-coach-point">
            <span className="v2-coach-point-index">{i + 1}</span>
            <p className="text-sm leading-relaxed">{line}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CoachInsightsResults({ result }: { result: MatchCoachResult }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <CoachInsightBlock
        title="Why you're a strong match"
        description="How your resume aligns with this role."
        items={result.why_good_match}
      />
      <CoachInsightBlock
        title="What to improve before you apply"
        description="Concrete changes to strengthen your application."
        items={result.improvements}
      />
    </div>
  );
}

function CoachBulletList({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-2 space-y-2">
      {items.map((line, i) => (
        <li key={i} className="text-sm v2-text-muted leading-relaxed">
          {line}
        </li>
      ))}
    </ul>
  );
}

const fallbackRecommendations: Recommendation[] = [
  {
    id: "rec-1",
    jobTitle: "Senior Frontend Engineer",
    companyName: "Aurora Labs",
    location: "Remote (US)",
    jobType: "Full-time",
    salary: "$165k–$195k",
    matchScore: 96,
    directLink: "https://example.com/apply-aurora",
    stack: ["React", "TypeScript", "Next.js", "Design Systems"],
    description:
      "Partner directly with clients to understand business objectives, translate ambiguous problems into technical requirements, and deliver production-ready AI and data workflows end to end.",
    keyRequirements:
      "Strong component architecture and TypeScript proficiency, Experience shipping user-facing performance improvements, “design-to-dev” workflow collaboration",
    keyRequirementItems: [
      "Strong component architecture and TypeScript proficiency",
      "Experience shipping user-facing performance improvements",
      "“design-to-dev” workflow collaboration",
    ],
  },
  {
    id: "rec-2",
    jobTitle: "Software Engineer (Full-Stack)",
    companyName: "Nebula Commerce",
    location: "New York, NY",
    jobType: "Hybrid",
    salary: "$145k–$175k",
    matchScore: 91,
    directLink: "https://example.com/apply-nebula",
    stack: ["Node.js", "Postgres", "React", "API Design"],
    description:
      "Design and build secure, scalable REST APIs, work across the stack with React and Node.js, and improve reliability through observability and continuous delivery.",
    keyRequirements:
      "API design and database modeling experience, React + Node.js in production, Ability to debug distributed issues",
    keyRequirementItems: [
      "API design and database modeling experience",
      "React + Node.js in production",
      "Ability to debug distributed issues",
    ],
  },
  {
    id: "rec-3",
    jobTitle: "Frontend Engineer, Growth",
    companyName: "Solstice Health",
    location: "Austin, TX",
    jobType: "On-site",
    salary: "$130k–$160k",
    matchScore: 87,
    directLink: "https://example.com/apply-solstice",
    stack: ["A/B Testing", "React", "Analytics", "Performance"],
    description:
      "Build and iterate on experimentation-driven features, improve UX performance, and ship analytics-based improvements with fast feedback loops.",
    keyRequirements:
      "Experience with experimentation frameworks, Strong UX + performance fundamentals, Collaborative product/design mindset",
    keyRequirementItems: [
      "Experience with experimentation frameworks",
      "Strong UX + performance fundamentals",
      "Collaborative product/design mindset",
    ],
  },
];

function MatchScoreBadge({ score }: { score: number }) {
  if (score <= 0) return null;
  return (
    <span className="v2-rec-score-badge shrink-0" aria-label={`${Math.round(score)} percent match`}>
      {Math.round(score)}%
    </span>
  );
}

function JobListItem({
  rec,
  isSelected,
  onSelect,
  onOpenMobile,
}: {
  rec: Recommendation;
  isSelected: boolean;
  onSelect: () => void;
  onOpenMobile: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        onSelect();
        if (typeof window !== "undefined" && window.innerWidth < 1024) {
          onOpenMobile();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
          if (typeof window !== "undefined" && window.innerWidth < 1024) {
            onOpenMobile();
          }
        }
      }}
      className={`v2-list-row w-full text-left rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? "v2-row-focused border-[hsl(var(--foreground)/0.15)]"
          : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted)/0.35)]"
      }`}
    >
      <div className="p-3 sm:p-4 flex items-start gap-3">
        <MatchScoreBadge score={rec.matchScore} />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-sm truncate">{rec.jobTitle}</div>
          <div className="v2-text-muted text-xs mt-0.5 truncate">{rec.companyName}</div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {rec.location && (
              <span className="text-[11px] v2-text-muted truncate max-w-full">{rec.location}</span>
            )}
            {rec.salary && (
              <span className="v2-badge text-[10px] py-0.5 px-2">{rec.salary}</span>
            )}
            {rec.jobType && (
              <span className="v2-badge text-[10px] py-0.5 px-2">{rec.jobType}</span>
            )}
          </div>
        </div>
        <ChevronRight className="h-4 w-4 v2-text-muted shrink-0 lg:hidden mt-1" />
      </div>
    </div>
  );
}

function JobDetailContent({ job }: { job: Recommendation }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold leading-tight">{job.jobTitle}</h2>
        <p className="v2-text-muted text-sm mt-1">{job.companyName}</p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          {job.matchScore > 0 && (
            <span className="v2-status v2-status-ready">{Math.round(job.matchScore)}% match</span>
          )}
          {job.location && <span className="v2-badge text-xs">{job.location}</span>}
          {job.jobType && <span className="v2-badge text-xs">{job.jobType}</span>}
          {job.salary && <span className="v2-badge text-xs">{job.salary}</span>}
        </div>
        {job.stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {job.stack.slice(0, 8).map((skill) => (
              <span key={skill} className="v2-badge text-[11px]">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="text-xs font-semibold tracking-wide uppercase v2-text-muted">Key requirements</div>
        {job.keyRequirementItems.length ? (
          <div className="mt-2 space-y-2">
            {job.keyRequirementItems.slice(0, 8).map((line) => (
              <div key={line} className="flex items-start gap-3 v2-text-muted text-sm">
                <span
                  className="mt-2 h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: "hsl(var(--foreground))" }}
                />
                <span>{line}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-2 v2-text-muted text-sm">No key requirements available.</p>
        )}
      </div>

      <div>
        <div className="text-xs font-semibold tracking-wide uppercase v2-text-muted">Description</div>
        <p className="mt-2 v2-text-muted text-sm leading-relaxed whitespace-pre-line">{job.description}</p>
      </div>

      <div>
        {job.directLink ? (
          <a
            href={job.directLink}
            target="_blank"
            rel="noreferrer"
            className="v2-btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg"
          >
            <Link2 size={16} />
            Apply
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="v2-btn-outline inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold opacity-50 cursor-not-allowed"
          >
            Apply
          </button>
        )}
      </div>
    </div>
  );
}

function MatchCoachSection({
  uploadId,
  quota,
  isQuotaLoading,
  coachResult,
  coachLoading,
  coachPrefetching,
  coachError,
  onExplain,
  inModal = false,
}: {
  uploadId: string | null;
  quota: ReturnType<typeof useQuotaStatus>["quota"];
  isQuotaLoading: boolean;
  coachResult: MatchCoachResult | null;
  coachLoading: boolean;
  coachPrefetching: boolean;
  coachError: string;
  onExplain: () => void;
  inModal?: boolean;
}) {
  return (
    <div className={inModal ? "space-y-5" : "border-t border-[hsl(var(--border))] pt-5 mt-5"}>
      {!inModal && (
        <div className="flex items-start gap-3 mb-4">
          <div className="v2-feature-icon h-9 w-9 rounded-xl flex items-center justify-center shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Match Coach</h3>
            <p className="v2-text-muted text-xs mt-0.5">
              Why this role fits your resume and how to improve your application.
            </p>
          </div>
        </div>
      )}

      {!coachResult && (
        <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.08)]">
          <span className="v2-text-muted uppercase tracking-wide">Coach quota today</span>
          <span className="font-medium">
            {isQuotaLoading ? "..." : `${quota?.coach_used ?? 0}/${quota?.coach_limit ?? 3}`}
          </span>
        </div>
      )}

      {coachPrefetching && !coachResult && (
        <p className="text-xs v2-text-muted mb-3">Loading saved insight…</p>
      )}

      {!coachResult && !coachPrefetching && (
        <button
          type="button"
          onClick={onExplain}
          disabled={coachLoading || !uploadId || (quota?.coach_used ?? 0) >= (quota?.coach_limit ?? 3)}
          className="w-full v2-btn-primary px-4 py-2.5 text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {coachLoading ? "Analyzing..." : "Explain + Improve"}
        </button>
      )}

      {!uploadId && (
        <p className="text-xs v2-text-muted mb-3">Open recommendations from your dashboard to use match coach.</p>
      )}

      {(quota?.coach_used ?? 0) >= (quota?.coach_limit ?? 3) && (
        <div className="text-xs v2-alert v2-alert-error px-3 py-2 rounded-lg mb-4">
          Daily coach limit reached. Try again tomorrow.
        </div>
      )}

      {coachError && <p className="text-sm v2-error mb-4">{coachError}</p>}

      {coachLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-4 rounded-md animate-pulse"
              style={{ background: "hsl(var(--muted))", width: `${90 - i * 10}%` }}
            />
          ))}
        </div>
      )}

      {!coachLoading && coachResult && (
        <>
          {inModal ? (
            <CoachInsightsResults result={coachResult} />
          ) : (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold tracking-wide uppercase v2-text-muted">
                  Why this is a good match
                </div>
                <CoachBulletList items={coachResult.why_good_match} />
              </div>
              <div>
                <div className="text-xs font-semibold tracking-wide uppercase v2-text-muted">
                  Improve your application
                </div>
                <CoachBulletList items={coachResult.improvements} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function CoachLaunchCard({
  onOpen,
  hasInsight,
  disabled,
}: {
  onOpen: () => void;
  hasInsight: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="mt-6 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.12)]">
      <div className="flex items-start gap-3">
        <div className="v2-feature-icon h-9 w-9 rounded-xl flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm">Match Coach</h3>
          <p className="v2-text-muted text-xs mt-1 leading-relaxed">
            {hasInsight
              ? "Saved feedback is ready for this role."
              : "Get AI feedback on why this role fits and how to strengthen your application."}
          </p>
          <button
            type="button"
            onClick={onOpen}
            disabled={disabled}
            className="mt-3 v2-btn-primary px-4 py-2 text-sm font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {hasInsight ? "View match coach" : "Open match coach"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, idx) => (
        <div key={idx} className="v2-flat-card rounded-xl p-4 space-y-2">
          <div className="h-4 w-[70%] rounded animate-pulse" style={{ background: "hsl(var(--muted))" }} />
          <div className="h-3 w-[45%] rounded animate-pulse opacity-80" style={{ background: "hsl(var(--muted))" }} />
        </div>
      ))}
    </div>
  );
}

export default function RecommendationsPreviewPage() {
  const searchParams = useSearchParams();
  const { user } = useCurrentUser();
  const userEmail = user?.email || null;
  const { quota, isLoading: isQuotaLoading, refetch: refetchQuota } = useQuotaStatus(userEmail);
  const { items: uploadHistoryItems } = useUploadHistory(userEmail);
  const uploadId = searchParams.get("upload_id");
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(!!uploadId);
  const workerBase = (process.env.NEXT_PUBLIC_WORKER_URL || "").replace(/\/$/, "");

  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    uploadId ? [] : fallbackRecommendations
  );
  const [selectedId, setSelectedId] = useState<string>(
    uploadId ? "" : fallbackRecommendations[0]?.id || ""
  );
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [coachModalOpen, setCoachModalOpen] = useState(false);

  const [coachResult, setCoachResult] = useState<MatchCoachResult | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachPrefetching, setCoachPrefetching] = useState(false);
  const [coachError, setCoachError] = useState("");
  const coachCacheRef = useRef<Record<string, MatchCoachResult>>({});

  const sortedRecommendations = useMemo(
    () => [...recommendations].sort((a, b) => b.matchScore - a.matchScore),
    [recommendations]
  );

  const selected = useMemo(() => {
    return sortedRecommendations.find((r) => r.id === selectedId) || sortedRecommendations[0];
  }, [sortedRecommendations, selectedId]);

  const linkedUpload = useMemo(
    () => uploadHistoryItems.find((u) => u.upload_id === uploadId),
    [uploadHistoryItems, uploadId]
  );

  const avgMatchScore = useMemo(() => {
    if (!recommendations.length) return 0;
    const sum = recommendations.reduce((acc, r) => acc + (r.matchScore || 0), 0);
    return Math.round(sum / recommendations.length);
  }, [recommendations]);

  const dashboardHref = uploadId
    ? `/uploads?upload_id=${encodeURIComponent(uploadId)}`
    : "/uploads";

  useEffect(() => {
    if (!sortedRecommendations.length) return;
    if (!sortedRecommendations.some((r) => r.id === selectedId)) {
      setSelectedId(sortedRecommendations[0].id);
    }
  }, [sortedRecommendations, selectedId]);

  useEffect(() => {
    if (!selected) {
      setCoachResult(null);
      setCoachError("");
      return;
    }
    const key = `${uploadId || "local"}:${selected.id}`;
    const cached = coachCacheRef.current[key];
    if (cached) {
      setCoachResult(cached);
      setCoachError("");
      return;
    }
    setCoachResult(null);
    setCoachError("");
  }, [selected, uploadId]);

  useEffect(() => {
    setCoachModalOpen(false);
  }, [selectedId]);

  useEffect(() => {
    if (!selected || !uploadId || !workerBase) {
      setCoachPrefetching(false);
      return;
    }
    const key = `${uploadId}:${selected.id}`;
    if (coachCacheRef.current[key]) {
      setCoachResult(coachCacheRef.current[key]);
      setCoachError("");
      setCoachPrefetching(false);
      return;
    }
    const ac = new AbortController();
    setCoachPrefetching(true);
    (async () => {
      try {
        const res = await fetch(
          `${workerBase}/match-coach/cache?upload_id=${encodeURIComponent(uploadId)}&job_id=${encodeURIComponent(selected.id)}`,
          { signal: ac.signal }
        );
        if (res.status === 404) {
          if (!ac.signal.aborted) {
            setCoachResult(null);
            setCoachError("");
          }
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        const nextResult: MatchCoachResult = {
          why_good_match: normalizeCoachBullets(data?.why_good_match),
          improvements: normalizeCoachBullets(data?.improvements),
        };
        if (!nextResult.why_good_match.length || !nextResult.improvements.length) return;
        coachCacheRef.current[key] = nextResult;
        if (!ac.signal.aborted) {
          setCoachResult(nextResult);
          setCoachError("");
        }
      } catch {
        if (!ac.signal.aborted) setCoachResult(null);
      } finally {
        if (!ac.signal.aborted) setCoachPrefetching(false);
      }
    })();
    return () => ac.abort();
  }, [selected?.id, uploadId, workerBase]);

  const normalizeRecommendations = (raw: any[]): Recommendation[] => {
    const splitKeyRequirements = (text: string): string[] => {
      const t = (text || "").trim();
      if (!t) return [];
      return t
        .split(/[\n;]/g)
        .flatMap((x) => x.split(","))
        .map((x) => x.trim())
        .filter(Boolean)
        .slice(0, 10);
    };

    const normalizeStack = (stackRaw: any): string[] => {
      if (!stackRaw) return [];
      if (Array.isArray(stackRaw)) return stackRaw.map((x) => String(x)).filter(Boolean);
      if (typeof stackRaw === "string") {
        const t = stackRaw.trim();
        if (!t) return [];
        return t
          .split(/[,/|]/g)
          .map((x) => x.trim())
          .filter(Boolean)
          .slice(0, 10);
      }
      return [];
    };

    return raw
      .filter(Boolean)
      .map((item, idx) => {
        const jobTitle = item["Job Title"] ?? item.jobTitle ?? "";
        const companyName = item["Company Name"] ?? item.companyName ?? "";
        const location = item["Location"] ?? item.location ?? "";
        const jobType = item["Job Type"] ?? item.jobType ?? "";
        const salary = item["Salary"] ?? item.salary ?? "";
        const matchScoreRaw = item["Match Score"] ?? item.matchScore ?? 0;
        const matchScore =
          typeof matchScoreRaw === "number"
            ? matchScoreRaw
            : Number.isFinite(Number(matchScoreRaw))
              ? Number(matchScoreRaw)
              : 0;
        const directLink = item["Direct Link"] ?? item.directLink ?? undefined;
        const stack = normalizeStack(item["Stack"] ?? item.stack ?? item["Bonus Skills"] ?? "");
        const description = item["Description"] ?? item.description ?? "";
        const keyRequirements = item["Key Requirements"] ?? item.keyRequirements ?? "";
        const keyRequirementItems = splitKeyRequirements(String(keyRequirements));

        return {
          id: item.id ?? item._id ?? `rec-${idx}`,
          jobTitle: String(jobTitle),
          companyName: String(companyName),
          location: String(location),
          jobType: String(jobType),
          salary: String(salary),
          matchScore,
          directLink: directLink ? String(directLink) : undefined,
          stack,
          description: String(description || ""),
          keyRequirements: String(keyRequirements || ""),
          keyRequirementItems,
        };
      });
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (typeof window === "undefined") return;
      if (!uploadId) return;
      if (!cancelled) setIsLoadingRecommendations(true);

      const storageKey = `recommendations_preview_jobs_${uploadId}`;
      const redirected = localStorage.getItem(storageKey);
      if (redirected) {
        try {
          const parsed = JSON.parse(redirected);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalized = normalizeRecommendations(parsed);
            if (!cancelled) {
              setRecommendations(normalized);
              setSelectedId(normalized[0]?.id || "");
              setMobileDetailOpen(false);
              setIsLoadingRecommendations(false);
            }
            return;
          }
        } catch {
        }
        localStorage.removeItem(storageKey);
      }

      const backendV2Base = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace("/api/v1", "/api/v2");
      if (!backendV2Base) {
        if (!cancelled) setIsLoadingRecommendations(false);
        return;
      }

      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

      try {
        for (let attempt = 0; attempt < 15; attempt++) {
          if (cancelled) return;
          const res = await fetch(`${backendV2Base}/recommendations/${uploadId}`);
          if (res.ok) {
            const data = await res.json();
            const jobs = Array.isArray(data?.recommendations) ? data.recommendations : [];
            const normalized = normalizeRecommendations(jobs);
            if (!cancelled) {
              setRecommendations(normalized);
              setSelectedId(normalized[0]?.id || "");
              setMobileDetailOpen(false);
              setIsLoadingRecommendations(false);
            }
            return;
          }
          if (res.status !== 404) break;
          await sleep(600 + attempt * 150);
        }
      } catch {
      }
      if (!cancelled) setIsLoadingRecommendations(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [uploadId]);

  const handleExplainAndImprove = async () => {
    if (!selected || !uploadId) {
      setCoachError("Select a saved recommendation to use the coach.");
      return;
    }
    if (!workerBase) {
      setCoachError("Match coach service is unavailable.");
      return;
    }

    const key = `${uploadId}:${selected.id}`;
    const cached = coachCacheRef.current[key];
    if (cached) {
      setCoachResult(cached);
      setCoachError("");
      return;
    }

    setCoachLoading(true);
    setCoachError("");
    try {
      const res = await fetch(`${workerBase}/match-coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upload_id: uploadId,
          job: {
            job_id: selected.id,
            title: selected.jobTitle,
            company: selected.companyName,
            location: selected.location,
            job_type: selected.jobType,
            salary: selected.salary,
            match_score: selected.matchScore,
            key_requirements: selected.keyRequirementItems,
            description: selected.description,
          },
        }),
      });
      if (!res.ok) {
        const payload = await res
          .json()
          .catch(() => ({ detail: "Failed to load match coach response" }));
        throw new Error(payload.detail || "Failed to load match coach response");
      }
      const data = await res.json();
      const nextResult: MatchCoachResult = {
        why_good_match: normalizeCoachBullets(data?.why_good_match),
        improvements: normalizeCoachBullets(data?.improvements),
      };
      if (!nextResult.why_good_match.length || !nextResult.improvements.length) {
        throw new Error("Invalid coach response");
      }
      coachCacheRef.current[key] = nextResult;
      setCoachResult(nextResult);
      if (!data?.cached) refetchQuota();
    } catch (err: any) {
      setCoachError(err.message || "Failed to load match coach response");
    } finally {
      setCoachLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="pt-6 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-6">
            <Link
              href={dashboardHref}
              className="inline-flex items-center gap-1.5 text-xs v2-text-muted hover:opacity-80 transition-opacity mb-4"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to dashboard
            </Link>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide v2-text-muted mb-1">
                  {linkedUpload?.file_name
                    ? `Matches for ${linkedUpload.file_name}`
                    : uploadId
                      ? "Job matches"
                      : "Sample recommendations"}
                </p>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Your recommendations</h1>
              </div>
              {!isLoadingRecommendations && recommendations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="v2-badge">{recommendations.length} matches</span>
                  {avgMatchScore > 0 && (
                    <span className="v2-badge">{avgMatchScore}% avg fit</span>
                  )}
                  <span className="v2-badge">
                    Coach {isQuotaLoading ? "…" : `${quota?.coach_used ?? 0}/${quota?.coach_limit ?? 3}`} today
                  </span>
                </div>
              )}
            </div>
          </header>

          {isLoadingRecommendations ? (
            <div className="v2-neumorphic-card p-4 sm:p-6">
              <ListSkeleton />
            </div>
          ) : !recommendations.length ? (
            <div className="v2-neumorphic-card p-10 text-center flex flex-col items-center gap-4">
              <Briefcase className="h-8 w-8 v2-text-muted" />
              <p className="text-sm v2-text-muted">No recommendations found.</p>
              <Link href={dashboardHref} className="v2-btn-primary px-5 py-2.5 text-sm rounded-lg">
                Back to dashboard
              </Link>
            </div>
          ) : (
            <div className="v2-rec-master-detail gap-5 lg:gap-6">
              <section className="v2-neumorphic-card p-3 sm:p-4 flex flex-col min-h-0">
                <div className="flex items-center justify-between gap-2 px-1 pb-3 border-b border-[hsl(var(--border))] shrink-0">
                  <h2 className="text-sm font-semibold">Roles</h2>
                  <span className="text-xs v2-text-muted">Sorted by match</span>
                </div>
                <div className="v2-rec-list-scroll mt-2 space-y-2 pr-1">
                  {sortedRecommendations.map((rec) => (
                    <JobListItem
                      key={rec.id}
                      rec={rec}
                      isSelected={rec.id === selected?.id}
                      onSelect={() => setSelectedId(rec.id)}
                      onOpenMobile={() => setMobileDetailOpen(true)}
                    />
                  ))}
                </div>
              </section>

              <section className="hidden lg:block v2-neumorphic-card p-5 sm:p-6">
                {selected ? (
                  <>
                    <JobDetailContent job={selected} />
                    <CoachLaunchCard
                      onOpen={() => setCoachModalOpen(true)}
                      hasInsight={!!coachResult}
                      disabled={!uploadId}
                    />
                  </>
                ) : (
                  <p className="v2-text-muted text-sm">Select a role to view details.</p>
                )}
              </section>
            </div>
          )}
        </div>

        {mobileDetailOpen && selected && (
          <div className="fixed inset-0 z-50 flex flex-col lg:hidden">
            <div
              className="absolute inset-0 v2-modal-backdrop"
              onClick={() => setMobileDetailOpen(false)}
            />
            <div className="relative mt-auto max-h-[92vh] w-full v2-modal-panel rounded-t-2xl rounded-b-none flex flex-col overflow-hidden">
              <div className="p-4 border-b border-[hsl(var(--border))] flex items-center justify-between shrink-0">
                <div className="min-w-0 pr-3">
                  <p className="font-semibold truncate">{selected.jobTitle}</p>
                  <p className="text-xs v2-text-muted truncate">{selected.companyName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDetailOpen(false)}
                  className="v2-btn-outline p-2 shrink-0"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4 sm:p-5">
                <JobDetailContent job={selected} />
                <CoachLaunchCard
                  onOpen={() => setCoachModalOpen(true)}
                  hasInsight={!!coachResult}
                  disabled={!uploadId}
                />
              </div>
            </div>
          </div>
        )}

        {coachModalOpen && selected && (
          <div className="fixed inset-0 z-[60] overflow-y-auto p-4 sm:p-8">
            <div
              className="fixed inset-0 v2-modal-backdrop"
              onClick={() => setCoachModalOpen(false)}
            />
            <div className="relative mx-auto w-full max-w-4xl min-h-[min(100%,1px)] flex items-center justify-center py-4">
              <div className="w-full v2-coach-modal-panel">
                <div className="px-6 py-5 border-b border-[hsl(var(--border))] flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide v2-text-muted mb-1">Match Coach</p>
                    <h2 className="text-lg font-semibold leading-snug">{selected.jobTitle}</h2>
                    <p className="text-sm v2-text-muted mt-1">
                      {selected.companyName}
                      {selected.location ? ` · ${selected.location}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoachModalOpen(false)}
                    className="v2-btn-outline p-2 shrink-0"
                    aria-label="Close match coach"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="px-6 py-6">
                  <MatchCoachSection
                    inModal
                    uploadId={uploadId}
                    quota={quota}
                    isQuotaLoading={isQuotaLoading}
                    coachResult={coachResult}
                    coachLoading={coachLoading}
                    coachPrefetching={coachPrefetching}
                    coachError={coachError}
                    onExplain={handleExplainAndImprove}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
