'use client';

import React, { useMemo, useState } from "react";
import Navbar from "../components/v2/Navbar";
import { Upload, Clock, CheckCircle2, AlertTriangle, ArrowUpRight, Bell, Sparkles, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUploadHistory } from "../hooks/useUploadHistory";
import { useUploadStatus } from "../hooks/useUploadStatus";
import { useResumeDetail } from "../hooks/useResumeDetail";

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ReactNode }
> = {
  completed: {
    label: "Ready",
    className:
      "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  parsed: {
    label: "Ready",
    className:
      "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  parsing: {
    label: "Processing",
    className: "bg-amber-500/10 text-amber-300 border border-amber-500/40",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  pending: {
    label: "Queued",
    className: "bg-amber-500/10 text-amber-300 border border-amber-500/40",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  queued: {
    label: "Queued",
    className: "bg-amber-500/10 text-amber-300 border border-amber-500/40",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  embedding: {
    label: "Embedding",
    className: "bg-amber-500/10 text-amber-300 border border-amber-500/40",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  failed: {
    label: "Failed",
    className: "bg-red-500/10 text-red-300 border border-red-500/40",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
  parsing_failed: {
    label: "Failed",
    className: "bg-red-500/10 text-red-300 border border-red-500/40",
    icon: <AlertTriangle className="h-3.5 w-3.5" />,
  },
};

export default function ResumeUploadsDashboard() {
  const [activeTab, setActiveTab] = useState<"history" | "new" | "recommendations" | "notifications">("history");
  const searchParams = useSearchParams();
  const focusedUploadId = searchParams.get("upload_id");
  const { user } = useCurrentUser();
  const userEmail = user?.email || null;
  const { items: historyItems, isLoading: isHistoryLoading } = useUploadHistory(userEmail);
  const { status: focusedStatus } = useUploadStatus(focusedUploadId, !!focusedUploadId);
  const [detailUploadId, setDetailUploadId] = useState<string | null>(null);
  const { data: detail, isLoading: isDetailLoading } = useResumeDetail(detailUploadId);

  const uploadsToShow = useMemo(() => {
    if (!historyItems.length && !focusedUploadId) return [];
    if (!focusedUploadId) return historyItems;
    const existing = historyItems.find((x) => x.upload_id === focusedUploadId);
    if (existing) return historyItems;
    return historyItems;
  }, [historyItems, focusedUploadId]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text relative overflow-hidden">
      <div className="noise-bg" aria-hidden="true" />
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          <header className="flex flex-col items-center gap-4 text-center">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white">
                Manage your workspace
              </h1>
              <p className="mt-3 text-sm md:text-base text-brand-muted max-w-2xl mx-auto">
                A single place to upload resumes, track processing, review recommendations, and stay on top of notifications.
              </p>
            </div>
          </header>

          <div className="flex justify-center">
            <div className="glass-panel inline-flex rounded-full border border-white/10 p-1.5 gap-1.5 bg-brand-surface/80">
              <button
                onClick={() => setActiveTab("history")}
                className={`px-3.5 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === "history"
                    ? "bg-brand-primary text-brand-ink"
                    : "text-brand-muted hover:text-white"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Upload history</span>
              </button>
              <button
                onClick={() => setActiveTab("new")}
                className={`px-3.5 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === "new"
                    ? "bg-brand-primary text-brand-ink"
                    : "text-brand-muted hover:text-white"
                }`}
              >
                <Upload className="h-3.5 w-3.5" />
                <span>New upload</span>
              </button>
              <button
                onClick={() => setActiveTab("recommendations")}
                className={`px-3.5 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === "recommendations"
                    ? "bg-brand-primary text-brand-ink"
                    : "text-brand-muted hover:text-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Your recommendations</span>
              </button>
              <button
                onClick={() => setActiveTab("notifications")}
                className={`px-3.5 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  activeTab === "notifications"
                    ? "bg-brand-primary text-brand-ink"
                    : "text-brand-muted hover:text-white"
                }`}
              >
                <Bell className="h-3.5 w-3.5" />
                <span>Notifications</span>
              </button>
            </div>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 glass-panel rounded-3xl border border-white/10 p-5 sm:p-6 md:p-7 min-h-[420px]">
              {activeTab === "history" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base sm:text-lg font-medium text-white">
                        Upload history
                      </h2>
                      <p className="text-xs sm:text-sm text-brand-muted">
                        Recent resumes you have analyzed with Jobgenie.
                      </p>
                    </div>
                    <button className="text-xs sm:text-sm text-brand-muted hover:text-brand-primary transition-colors">
                      View all
                    </button>
                  </div>

                  <div className="border-t border-white/10 mt-4 pt-3 space-y-2.5">
                    {isHistoryLoading && (
                      <div className="py-10 text-center text-sm text-brand-muted">
                        Loading your uploads...
                      </div>
                    )}

                    {!isHistoryLoading && uploadsToShow.map((upload) => {
                      const isFocused = focusedUploadId === upload.upload_id;
                      const effectiveStatus =
                        isFocused && focusedStatus ? focusedStatus : upload.status;
                      const cfg =
                        statusConfig[effectiveStatus] || statusConfig.parsing;
                      return (
                        <div
                          key={upload.upload_id}
                          className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5 hover:bg-white/[0.03] transition-colors ${
                            isFocused ? "border border-brand-primary-soft bg-brand-primary-soft/10" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-full bg-brand-primary-soft flex items-center justify-center flex-shrink-0">
                              <Upload className="h-4 w-4 text-brand-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm sm:text-base text-white truncate">
                                {upload.file_name}
                              </p>
                              <p className="text-xs text-brand-muted">
                                Uploaded {(upload.created_at || "").slice(0, 10)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] sm:text-xs font-medium ${cfg.className}`}
                            >
                              {cfg.icon}
                              <span>{cfg.label}</span>
                            </span>
                            <button
                              onClick={() => setDetailUploadId(upload.upload_id)}
                              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 text-brand-muted hover:text-brand-ink hover:bg-brand-primary transition-colors"
                            >
                              View
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {!isHistoryLoading && uploadsToShow.length === 0 && (
                      <div className="py-10 text-center text-sm text-brand-muted">
                        No uploads yet. Start by uploading your first resume.
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === "new" && (
                <div className="h-full flex flex-col justify-between">
                  <div>
                    <h2 className="text-base sm:text-lg font-medium text-white mb-2">
                      New upload
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-muted mb-6">
                      Start a fresh analysis with an updated resume.
                    </p>
                    <div className="border border-dashed border-brand-border rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-brand-primary-soft flex items-center justify-center">
                        <Upload className="h-6 w-6 text-brand-primary" />
                      </div>
                      <p className="text-sm text-white">
                        Drag and drop a file here or use the upload page.
                      </p>
                      <a
                        href="/upload"
                        className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-medium btn-primary"
                      >
                        Go to upload page
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "recommendations" && (
                <div>
                  <h2 className="text-base sm:text-lg font-medium text-white mb-2">
                    Your recommendations
                  </h2>
                  {focusedStatus === "completed" || focusedStatus === "recommendations" ? (
                    <>
                      <p className="text-xs sm:text-sm text-brand-muted mb-6">
                        Your latest resume has been processed and recommendations are ready. View them to see where you are the best fit.
                      </p>
                      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 flex flex-col items-center justify-center gap-3">
                        <Sparkles className="h-6 w-6 text-emerald-300" />
                        <p className="text-sm text-white">
                          Recommendations are ready based on your latest profile.
                        </p>
                        <a
                          href="/recommendations"
                          className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-medium bg-white text-brand-ink"
                        >
                          Go to recommendations
                          <ArrowUpRight className="h-4 w-4" />
                        </a>
                      </div>
                    </>
                  ) : focusedStatus === "embedding" || focusedStatus === "embedding_completed" ? (
                    <>
                      <p className="text-xs sm:text-sm text-brand-muted mb-6">
                        We are preparing embeddings and recommendations for your latest resume. This will only take a moment.
                      </p>
                      <div className="rounded-2xl border border-brand-secondary/40 bg-brand-secondary-soft p-6 flex flex-col items-center justify-center gap-3">
                        <Sparkles className="h-6 w-6 text-brand-secondary" />
                        <p className="text-sm text-white">
                          Preparing your recommendations...
                        </p>
                        <p className="text-xs text-brand-muted">
                          You can stay on this page while we finish the computation.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-xs sm:text-sm text-brand-muted mb-6">
                        Once your latest resume is processed, this space will highlight recommended roles and explain why they fit.
                      </p>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 flex flex-col items-center justify-center gap-3">
                        <Sparkles className="h-6 w-6 text-brand-secondary" />
                        <p className="text-sm text-white">
                          Recommendations will appear here after processing.
                        </p>
                        <p className="text-xs text-brand-muted">
                          Upload a resume or re-run matching from the recommendations page.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-base sm:text-lg font-medium text-white mb-2">
                    Notifications
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-muted mb-6">
                    Track important events like completed analyses, new recommendations, and system alerts.
                  </p>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center text-sm text-brand-muted">
                    No notifications yet. You will see updates here as you start using your workspace.
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-4">
              <div className="glass-panel rounded-3xl border border-white/10 p-5 sm:p-6 min-h-[220px] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium text-white">
                    Current activity
                  </h3>
                  <span className="text-[11px] uppercase tracking-wide text-brand-muted">
                    Preview
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-brand-primary-soft flex items-center justify-center">
                      <Clock className="h-4 w-4 text-brand-primary" />
                    </div>
                    <div>
                      <p className="text-base text-white">
                        {focusedUploadId
                          ? "Latest upload is being tracked"
                          : "No active upload selected"}
                      </p>
                      <p className="text-sm text-brand-muted">
                        {focusedUploadId
                          ? focusedStatus || "Fetching upload status..."
                          : "Upload a resume to see live progress here."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-brand-secondary-soft flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-brand-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-white">
                        Recommendations in progress
                      </p>
                      <p className="text-xs text-brand-muted">
                        Soon you will see updated job matches tailored to your
                        latest profile.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-3xl border border-white/10 p-5 sm:p-6">
                <h3 className="text-sm font-medium text-white mb-2">
                  Tips for best results
                </h3>
                <ul className="space-y-2.5 text-xs text-brand-muted">
                  <li>Keep your resume to 1–3 pages.</li>
                  <li>Highlight impact with metrics and concrete outcomes.</li>
                  <li>Use a recent version that reflects your latest role.</li>
                </ul>
              </div>
            </aside>
          </section>

          {detailUploadId && detail && (
            <div className="fixed inset-0 z-40 flex items-center justify-center px-4 sm:px-6" onClick={() => setDetailUploadId(null)}>
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
              <div
                className="relative z-10 max-w-3xl w-full max-h-[80vh] bg-black/80 rounded-3xl border border-white/20 p-6 sm:p-8 overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-brand-muted mb-1">
                      Parsed resume
                    </p>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      {detail.name || "Unnamed candidate"}
                    </h3>
                    {detail.contact?.email && (
                      <p className="text-xs sm:text-sm text-brand-muted mt-1">
                        {detail.contact.email}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setDetailUploadId(null)}
                    className="text-brand-muted hover:text-white rounded-full p-1"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {detail.skills && detail.skills.length > 0 && (
                  <div className="mb-5">
                    <p className="text-xs uppercase tracking-wide text-brand-muted mb-2">
                      Key skills
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {detail.skills.slice(0, 10).map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-brand-primary-soft text-brand-primary px-3 py-1 rounded-full text-xs border border-brand-primary-soft"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {detail.experience && detail.experience.length > 0 && (
                  <div className="space-y-3 mt-2 overflow-y-auto pr-1 thin-scroll">
                    <p className="text-xs uppercase tracking-wide text-brand-muted">
                      Experience
                    </p>
                    {detail.experience.map((exp, idx) => (
                      <div
                        key={idx}
                        className="border border-white/10 rounded-2xl p-3.5 bg-white/[0.02]"
                      >
                        <p className="text-sm text-white">
                          {exp.position || "Role"}{" "}
                          {exp.company && (
                            <span className="text-brand-muted">· {exp.company}</span>
                          )}
                        </p>
                        {exp.duration && (
                          <p className="text-xs text-brand-muted mt-0.5">
                            {exp.duration}
                          </p>
                        )}
                        {exp.description && (
                          <p className="text-xs text-brand-muted mt-1.5">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(!detail.skills || detail.skills.length === 0) &&
                  (!detail.experience || detail.experience.length === 0) && (
                    <p className="text-sm text-brand-muted mt-4">
                      Parsed data is not available yet for this resume.
                    </p>
                  )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

