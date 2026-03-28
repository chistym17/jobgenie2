"use client";

import { useCallback, useState } from "react";
import Navbar from "../../components/v2/Navbar";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { Activity, Trash2, ChevronDown, ChevronRight } from "lucide-react";

type LogEntry = {
  id: string;
  at: string;
  label: string;
  method: string;
  url: string;
  status: number | null;
  durationMs: number | null;
  ok: boolean;
  requestSummary: string;
  responseBody: unknown;
  error: string | null;
};

function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function ObservabilityPage() {
  const { user } = useCurrentUser();
  const email = user?.email || "";
  const backendV2 = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace("/api/v1", "/api/v2");
  const workerBase = (process.env.NEXT_PUBLIC_WORKER_URL || "").replace(/\/$/, "");

  const [log, setLog] = useState<LogEntry[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadId, setUploadId] = useState("");
  const [jobJson, setJobJson] = useState(
    `{
  "job_id": "sample-job-1",
  "title": "Software Engineer",
  "company": "Example Corp",
  "location": "Remote",
  "description": "Build features with React and Python."
}`
  );

  const pushLog = useCallback((entry: Omit<LogEntry, "id" | "at">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setLog((prev) => [
      {
        ...entry,
        id,
        at: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 50));
    setExpanded((e) => ({ ...e, [id]: true }));
  }, []);

  const runFetch = async (
    label: string,
    method: string,
    url: string,
    init: RequestInit | undefined,
    requestSummary: string
  ) => {
    const t0 = performance.now();
    let status: number | null = null;
    let responseBody: unknown = null;
    let err: string | null = null;
    try {
      const res = await fetch(url, init);
      status = res.status;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        responseBody = await res.json();
      } else {
        responseBody = await res.text();
      }
      pushLog({
        label,
        method,
        url,
        status,
        durationMs: Math.round(performance.now() - t0),
        ok: !!status && status < 400,
        requestSummary,
        responseBody,
        error: null,
      });
    } catch (e: unknown) {
      err = e instanceof Error ? e.message : "Request failed";
      pushLog({
        label,
        method,
        url,
        status,
        durationMs: Math.round(performance.now() - t0),
        ok: false,
        requestSummary,
        responseBody: null,
        error: err,
      });
    }
  };

  const onUpload = async () => {
    if (!uploadFile || !email || !backendV2) return;
    const fd = new FormData();
    fd.append("file", uploadFile);
    fd.append("user_email", email);
    await runFetch(
      "POST /resume/upload",
      "POST",
      `${backendV2}/resume/upload`,
      { method: "POST", body: fd },
      `FormData: file=${uploadFile.name}, user_email=${email}`
    );
  };

  const onStatus = async () => {
    if (!uploadId.trim() || !backendV2) return;
    await runFetch(
      "GET upload status",
      "GET",
      `${backendV2}/resume/upload/${encodeURIComponent(uploadId.trim())}/status`,
      undefined,
      `upload_id=${uploadId.trim()}`
    );
  };

  const onActivity = async () => {
    if (!uploadId.trim() || !backendV2) return;
    await runFetch(
      "GET upload activity",
      "GET",
      `${backendV2}/resume/upload/${encodeURIComponent(uploadId.trim())}/activity`,
      undefined,
      `upload_id=${uploadId.trim()}`
    );
  };

  const onStartRecommendations = async () => {
    if (!uploadId.trim() || !email || !backendV2) return;
    await runFetch(
      "POST start recommendations",
      "POST",
      `${backendV2}/resume/upload/${encodeURIComponent(uploadId.trim())}/recommendations?user_email=${encodeURIComponent(email)}`,
      { method: "POST" },
      `upload_id=${uploadId.trim()}, user_email=${email}`
    );
  };

  const onGetRecommendations = async () => {
    if (!uploadId.trim() || !backendV2) return;
    await runFetch(
      "GET recommendations by upload",
      "GET",
      `${backendV2}/recommendations/${encodeURIComponent(uploadId.trim())}`,
      undefined,
      `upload_id=${uploadId.trim()}`
    );
  };

  const onCoach = async () => {
    if (!uploadId.trim() || !workerBase) return;
    let job: Record<string, unknown>;
    try {
      job = JSON.parse(jobJson) as Record<string, unknown>;
    } catch {
      pushLog({
        label: "POST /match-coach",
        method: "POST",
        url: `${workerBase}/match-coach`,
        status: null,
        durationMs: null,
        ok: false,
        requestSummary: "Invalid JSON in job payload",
        responseBody: null,
        error: "Invalid JSON",
      });
      return;
    }
    const body = JSON.stringify({ upload_id: uploadId.trim(), job });
    await runFetch(
      "POST /match-coach",
      "POST",
      `${workerBase}/match-coach`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      },
      body.slice(0, 2000) + (body.length > 2000 ? "…" : "")
    );
  };

  const onCoachCache = async () => {
    if (!uploadId.trim() || !workerBase) return;
    const jid = (() => {
      try {
        const j = JSON.parse(jobJson) as { job_id?: string };
        return j.job_id || "sample-job-1";
      } catch {
        return "sample-job-1";
      }
    })();
    await runFetch(
      "GET /match-coach/cache",
      "GET",
      `${workerBase}/match-coach/cache?upload_id=${encodeURIComponent(uploadId.trim())}&job_id=${encodeURIComponent(String(jid))}`,
      undefined,
      `upload_id=${uploadId.trim()}, job_id=${jid}`
    );
  };

  const clearLog = () => {
    setLog([]);
    setExpanded({});
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text">
      <Navbar />
      <main className="pt-24 pb-16 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-brand-primary mb-2">
            <Activity className="h-6 w-6" />
            <h1 className="text-2xl font-semibold text-white">API observability</h1>
          </div>
          <p className="text-sm text-brand-muted max-w-2xl">
            Run calls against upload, recommendation, and coach endpoints and inspect responses and timings. Logged in the browser only (last 50 entries).
          </p>
          <p className="text-xs text-brand-muted mt-2">
            Backend: {backendV2 || "(set NEXT_PUBLIC_BACKEND_URL)"} · Worker: {workerBase || "(set NEXT_PUBLIC_WORKER_URL)"}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="glass-panel rounded-2xl border border-white/10 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-white">1. Upload</h2>
            <p className="text-xs text-brand-muted">POST /api/v2/resume/upload</p>
            <input
              type="file"
              accept=".pdf"
              className="text-xs text-brand-muted file:mr-2 file:rounded-lg file:border-0 file:bg-white/10 file:px-2 file:py-1"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            <button
              type="button"
              disabled={!uploadFile || !email}
              onClick={onUpload}
              className="w-full py-2 rounded-xl text-sm font-medium bg-brand-primary text-brand-ink disabled:opacity-40"
            >
              Send upload
            </button>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-white">2. Recommendations</h2>
            <p className="text-xs text-brand-muted">Status, activity, start, list</p>
            <input
              type="text"
              placeholder="upload_id"
              value={uploadId}
              onChange={(e) => setUploadId(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-brand-muted"
            />
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={onStatus} disabled={!uploadId.trim()} className="py-1.5 rounded-lg text-xs bg-white/10 text-white disabled:opacity-40">
                Status
              </button>
              <button type="button" onClick={onActivity} disabled={!uploadId.trim()} className="py-1.5 rounded-lg text-xs bg-white/10 text-white disabled:opacity-40">
                Activity
              </button>
              <button type="button" onClick={onStartRecommendations} disabled={!uploadId.trim() || !email} className="py-1.5 rounded-lg text-xs bg-brand-primary text-brand-ink disabled:opacity-40">
                Start recs
              </button>
              <button type="button" onClick={onGetRecommendations} disabled={!uploadId.trim()} className="py-1.5 rounded-lg text-xs bg-white/10 text-white disabled:opacity-40">
                GET recs
              </button>
            </div>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 p-4 space-y-3">
            <h2 className="text-sm font-semibold text-white">3. Match coach</h2>
            <p className="text-xs text-brand-muted">Worker POST /match-coach · GET cache</p>
            <textarea
              value={jobJson}
              onChange={(e) => setJobJson(e.target.value)}
              rows={6}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs font-mono text-brand-muted"
            />
            <div className="flex gap-2">
              <button type="button" onClick={onCoach} disabled={!uploadId.trim() || !workerBase} className="flex-1 py-2 rounded-xl text-xs font-medium bg-brand-primary text-brand-ink disabled:opacity-40">
                POST coach
              </button>
              <button type="button" onClick={onCoachCache} disabled={!uploadId.trim() || !workerBase} className="flex-1 py-2 rounded-xl text-xs bg-white/10 text-white disabled:opacity-40">
                GET cache
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Request log</h2>
            <button type="button" onClick={clearLog} className="inline-flex items-center gap-1 text-xs text-brand-muted hover:text-white">
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
          </div>
          {log.length === 0 ? (
            <p className="text-sm text-brand-muted">No calls yet.</p>
          ) : (
            <ul className="space-y-2">
              {log.map((e) => (
                <li key={e.id} className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                  <button
                    type="button"
                    className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-white/5"
                    onClick={() => setExpanded((x) => ({ ...x, [e.id]: !x[e.id] }))}
                  >
                    {expanded[e.id] ? <ChevronDown className="h-4 w-4 shrink-0 mt-0.5 text-brand-muted" /> : <ChevronRight className="h-4 w-4 shrink-0 mt-0.5 text-brand-muted" />}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`font-mono ${e.ok ? "text-emerald-400" : "text-red-400"}`}>
                          {e.status ?? "—"} {e.durationMs != null ? `${e.durationMs}ms` : ""}
                        </span>
                        <span className="text-white font-medium truncate">{e.label}</span>
                      </div>
                      <div className="text-[10px] text-brand-muted truncate font-mono mt-0.5">{e.method} {e.url}</div>
                    </div>
                  </button>
                  {expanded[e.id] && (
                    <div className="px-3 pb-3 pt-0 space-y-2 border-t border-white/5">
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-brand-muted mb-1">Request</div>
                        <pre className="text-[11px] font-mono text-brand-muted whitespace-pre-wrap break-all">{e.requestSummary}</pre>
                      </div>
                      {e.error && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wide text-red-400 mb-1">Error</div>
                          <pre className="text-[11px] font-mono text-red-300">{e.error}</pre>
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] uppercase tracking-wide text-brand-muted mb-1">Response</div>
                        <pre className="text-[11px] font-mono text-sky-200/90 whitespace-pre-wrap break-all max-h-64 overflow-auto">{safeJson(e.responseBody)}</pre>
                      </div>
                      <div className="text-[10px] text-brand-muted">{e.at}</div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
