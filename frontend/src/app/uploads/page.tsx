'use client';

import React, { useMemo, useState } from "react";
import Navbar from "../components/v2/Navbar";
import { Upload, Clock, CheckCircle2, AlertTriangle, ArrowUpRight, Bell, Sparkles } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUploadHistory } from "../hooks/useUploadHistory";
import { useUploadStatus } from "../hooks/useUploadStatus";

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
                            <button className="hidden sm:inline-flex items-center gap-1.5 text-xs text-brand-muted hover:text-brand-primary transition-colors">
                              Open
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
                      <p
                        className={`text-sm ${
                          focusedStatus === "parsed" || focusedStatus === "completed"
                            ? "text-emerald-300"
                            : focusedStatus === "failed" || focusedStatus === "parsing_failed"
                            ? "text-red-300"
                            : "text-brand-muted"
                        }`}
                      >
                        {focusedUploadId
                          ? focusedStatus || "Fetching status..."
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
        </div>
      </main>
    </div>
  );
}


