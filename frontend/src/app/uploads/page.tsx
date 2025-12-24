'use client';

import React, { useMemo, useState } from "react";
import Navbar from "../components/v2/Navbar";
import ConfirmationModal from "../components/v2/ConfirmationModal";
import { Upload, Clock, CheckCircle2, AlertTriangle, ArrowUpRight, Bell, Sparkles, X, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useUploadHistory } from "../hooks/useUploadHistory";
import { useUploadStatus } from "../hooks/useUploadStatus";
import { useResumeDetail } from "../hooks/useResumeDetail";
import { useDeleteUpload } from "../hooks/useDeleteUpload";

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const searchParams = useSearchParams();
  const focusedUploadId = searchParams.get("upload_id");
  const { user } = useCurrentUser();
  const userEmail = user?.email || null;
  const { items: historyItems, isLoading: isHistoryLoading, refetch: refetchHistory } = useUploadHistory(userEmail);
  const { status: focusedStatus } = useUploadStatus(focusedUploadId, !!focusedUploadId);
  const [detailUploadId, setDetailUploadId] = useState<string | null>(null);
  const { data: detail, isLoading: isDetailLoading } = useResumeDetail(detailUploadId);
  const { deleteUpload, isDeleting } = useDeleteUpload();
  const [deleteConfirmUploadId, setDeleteConfirmUploadId] = useState<string | null>(null);

  const uploadsToShow = useMemo(() => {
    if (!historyItems.length && !focusedUploadId) return [];
    if (!focusedUploadId) return historyItems;
    const existing = historyItems.find((x) => x.upload_id === focusedUploadId);
    if (existing) return historyItems;
    return historyItems;
  }, [historyItems, focusedUploadId]);

  const handleDelete = async (uploadId: string) => {
    const success = await deleteUpload(uploadId);
    if (success) {
      refetchHistory();
      if (focusedUploadId === uploadId) {
        window.history.replaceState({}, '', '/uploads');
      }
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text relative overflow-hidden">
      <div className="noise-bg" aria-hidden="true" />
      <Navbar />

      <div className="flex pt-20">
        <aside
          className={`fixed left-0 top-20 h-[calc(100vh-5rem)] glass-panel border-r border-white/10 transition-all duration-300 z-30 ${
            isSidebarCollapsed ? "w-20" : "w-64"
          }`}
        >
          <div className="h-full flex flex-col p-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="mb-4 p-2 rounded-lg hover:bg-white/5 transition-colors text-brand-muted hover:text-white self-end"
              title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>

            <nav className="flex-1 space-y-2">
              <button
                onClick={() => setActiveTab("history")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "history"
                    ? "bg-brand-primary text-brand-ink"
                    : "text-brand-muted hover:text-white hover:bg-white/5"
                }`}
                title="Upload history"
              >
                <Clock className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="text-sm font-medium">Upload history</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("new")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "new"
                    ? "bg-brand-primary text-brand-ink"
                    : "text-brand-muted hover:text-white hover:bg-white/5"
                }`}
                title="New upload"
              >
                <Upload className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="text-sm font-medium">New upload</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("recommendations")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "recommendations"
                    ? "bg-brand-primary text-brand-ink"
                    : "text-brand-muted hover:text-white hover:bg-white/5"
                }`}
                title="Your recommendations"
              >
                <Sparkles className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="text-sm font-medium">Recommendations</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === "notifications"
                    ? "bg-brand-primary text-brand-ink"
                    : "text-brand-muted hover:text-white hover:bg-white/5"
                }`}
                title="Notifications"
              >
                <Bell className="h-5 w-5 flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="text-sm font-medium">Notifications</span>
                )}
              </button>
            </nav>
          </div>
        </aside>

        <main
          className={`flex-1 transition-all duration-300 ${
            isSidebarCollapsed ? "ml-20" : "ml-64"
          }`}
        >
          <div className="pt-8 pb-12 px-6 lg:px-10 xl:px-12">
            <header className="mb-6 max-w-4xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-2">
                Manage your workspace
              </h1>
              <p className="text-xs md:text-sm text-brand-muted max-w-2xl">
                A single place to upload resumes, track processing, review recommendations, and stay on top of notifications.
              </p>
            </header>

            <div className="max-w-4xl mx-auto">
              <div className="glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 md:p-10 min-h-[600px]">
              {activeTab === "history" && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
                        Upload history
                      </h2>
                      <p className="text-sm sm:text-base text-brand-muted">
                        Recent resumes you have analyzed with Jobgenie.
                      </p>
                    </div>
                    <button className="text-sm text-brand-muted hover:text-brand-primary transition-colors">
                      View all
                    </button>
                  </div>

                  <div className="border-t border-white/10 mt-6 pt-6 space-y-3">
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
                          className={`flex items-center justify-between gap-4 rounded-2xl px-4 py-4 sm:px-5 sm:py-4 hover:bg-white/[0.03] transition-colors ${
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

                          <div className="flex items-center gap-2 flex-shrink-0">
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
                            <button
                              onClick={() => setDeleteConfirmUploadId(upload.upload_id)}
                              disabled={isDeleting}
                              className="inline-flex items-center justify-center p-1.5 rounded-full border border-red-500/40 text-red-300 hover:text-white hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete upload"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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
                <div className="h-full flex flex-col justify-center">
                  <div className="max-w-2xl mx-auto">
                    <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
                      New upload
                    </h2>
                    <p className="text-sm sm:text-base text-brand-muted mb-8">
                      Start a fresh analysis with an updated resume.
                    </p>
                    <div className="border border-dashed border-brand-border rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-6 min-h-[400px]">
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
                <div className="min-h-[500px]">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
                    Your recommendations
                  </h2>
                  {focusedStatus === "completed" || focusedStatus === "recommendations" ? (
                    <>
                      <p className="text-sm sm:text-base text-brand-muted mb-8">
                        Your latest resume has been processed and recommendations are ready. View them to see where you are the best fit.
                      </p>
                      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-10 flex flex-col items-center justify-center gap-4 min-h-[300px]">
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
                      <p className="text-sm sm:text-base text-brand-muted mb-8">
                        We are preparing embeddings and recommendations for your latest resume. This will only take a moment.
                      </p>
                      <div className="rounded-2xl border border-brand-secondary/40 bg-brand-secondary-soft p-10 flex flex-col items-center justify-center gap-4 min-h-[300px]">
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
                      <p className="text-sm sm:text-base text-brand-muted mb-8">
                        Once your latest resume is processed, this space will highlight recommended roles and explain why they fit.
                      </p>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 flex flex-col items-center justify-center gap-4 min-h-[300px]">
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
                <div className="min-h-[500px]">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
                    Notifications
                  </h2>
                  <p className="text-sm sm:text-base text-brand-muted mb-8">
                    Track important events like completed analyses, new recommendations, and system alerts.
                  </p>
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center text-base text-brand-muted min-h-[300px] flex items-center justify-center">
                    No notifications yet. You will see updates here as you start using your workspace.
                  </div>
                </div>
              )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <ConfirmationModal
        isOpen={!!deleteConfirmUploadId}
        onClose={() => setDeleteConfirmUploadId(null)}
        onConfirm={() => {
          if (deleteConfirmUploadId) {
            handleDelete(deleteConfirmUploadId);
          }
        }}
        title="Delete Resume Upload"
        message={`Are you sure you want to delete "${uploadsToShow.find(u => u.upload_id === deleteConfirmUploadId)?.file_name || 'this upload'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

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
  );
}

