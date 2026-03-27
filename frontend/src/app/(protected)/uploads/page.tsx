'use client';

import React, { useMemo, useState, useEffect, useRef } from "react";
import Navbar from "../../components/v2/Navbar";
import ConfirmationModal from "../../components/v2/ConfirmationModal";
import { Upload, Clock, CheckCircle2, AlertTriangle, ArrowUpRight, Bell, Sparkles, X, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useUploadHistory } from "../../hooks/useUploadHistory";
import { useUploadStatus } from "../../hooks/useUploadStatus";
import { useResumeDetail } from "../../hooks/useResumeDetail";
import { useDeleteUpload } from "../../hooks/useDeleteUpload";
import { useNotifications } from "../../hooks/useNotifications";
import { useResumeUploadV2 } from "../../hooks/useResumeUploadV2";
import { useRecommendationHistory } from "../../hooks/useRecommendationHistory";
import ToastContainer from "../../components/v2/ToastContainer";
import NotificationItem from "../../components/v2/NotificationItem";
import {
  UploadHistorySkeleton,
  ActivityTimelineSkeleton,
  RecommendationsTabSkeleton,
  ResumeDetailModalSkeleton,
} from "../../components/v2/DashboardSkeletons";
import { useActivityTimeline } from "../../hooks/useActivityTimeline";
import { useRouter } from "next/navigation";

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

interface NewUploadTabProps {
  file: File | null;
  setFile: (file: File | null) => void;
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  userEmail: string | null;
  uploadResume: (file: File, userEmail: string) => Promise<{ upload_id: string }>;
  isUploading: boolean;
  router: ReturnType<typeof useRouter>;
  setActiveTab: (tab: "history" | "new" | "recommendations" | "notifications") => void;
  refetchHistory: () => void;
}

function NewUploadTab({
  file,
  setFile,
  uploading,
  setUploading,
  fileInputRef,
  userEmail,
  uploadResume,
  isUploading,
  router,
  setActiveTab,
  refetchHistory,
}: NewUploadTabProps) {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ['application/pdf'];
    if (!validTypes.includes(file.type)) {
      // Error will be shown via toast from uploadResume hook
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      // Error will be shown via toast from uploadResume hook
      return;
    }
    setFile(file);
  };

  const handleUpload = async () => {
    if (!file || !userEmail) return;
    setUploading(true);
    try {
      const data = await uploadResume(file, userEmail);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      // Switch to history tab and refresh
      setActiveTab("history");
      refetchHistory();
      router.push(`/uploads?upload_id=${data.upload_id}`);
    } catch (error) {
      // Error handling
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full">
      <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
        New upload
      </h2>
      <p className="text-sm sm:text-base text-brand-muted mb-4">
        Start a fresh analysis with an updated resume.
      </p>
      
      <div className="max-w-2xl mx-auto">
        <div className="glass-panel p-4 md:p-6 rounded-3xl border border-white/10">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-white mb-2">Upload Your Resume</h3>
            <p className="text-sm text-brand-muted">Get personalized job recommendations tailored to your skills</p>
          </div>

          {!file ? (
            <div
              className="border-2 border-dashed border-brand-border rounded-2xl p-6 text-center cursor-pointer hover:border-brand-primary-soft transition min-h-[280px] flex flex-col justify-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf"
                onChange={handleFileChange}
              />
              <div className="flex justify-center mb-4">
                <div className="bg-brand-primary-soft p-4 rounded-full">
                  <Upload className="h-6 w-6 text-brand-primary" />
                </div>
              </div>
              <h3 className="font-medium text-base text-white mb-2">Drag and drop your resume here</h3>
              <p className="text-brand-muted text-sm mb-4">Support for PDF (Max 5MB)</p>
              <button className="btn-primary px-5 py-2.5 rounded-lg text-sm font-medium mx-auto">
                Browse Files
              </button>
            </div>
          ) : (
            <div className="border-2 border-brand-primary-soft bg-brand-primary-soft/20 rounded-2xl p-4 min-h-[280px] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-brand-primary-soft p-2 rounded-xl shrink-0">
                    <FileText className="h-5 w-5 text-brand-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-base text-white truncate">{file.name}</h3>
                    <p className="text-brand-muted text-xs">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF
                    </p>
                  </div>
                </div>
                <button onClick={removeFile} className="text-brand-muted hover:text-brand-primary p-1.5 shrink-0">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={handleUpload}
                disabled={uploading || isUploading}
                className={`mt-auto w-full btn-primary py-3 rounded-lg flex items-center justify-center gap-2 text-sm font-medium ${
                  uploading || isUploading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {uploading || isUploading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    Uploading...
                  </>
                ) : (
                  <>Upload Resume</>
                )}
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-brand-muted">
            <p>Your resume data is secure and will only be used to provide you with job recommendations.</p>
            <p className="mt-2">By uploading, you agree to our <a href="#" className="text-brand-primary hover:opacity-80">Terms of Service</a> and <a href="#" className="text-brand-primary hover:opacity-80">Privacy Policy</a>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityTimelineTab({ focusedUploadId }: { focusedUploadId: string | null }) {
  const { activities, isLoading } = useActivityTimeline(focusedUploadId);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;

  const totalPages = Math.ceil(activities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedActivities = activities.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const getPaginationGroup = () => {
    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages, currentPage + 1);

    if (currentPage === 1 && totalPages > 2) {
      end = 3;
    }
    if (currentPage === totalPages && totalPages > 2) {
      start = totalPages - 2;
    }

    const pages = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-[500px]">
      <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
        Activity Timeline
      </h2>
      <p className="text-sm sm:text-base text-brand-muted mb-8">
        Track the progress of your resume processing step by step.
      </p>
      
      {!focusedUploadId ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center text-base text-brand-muted min-h-[300px] flex items-center justify-center">
          No active upload selected. Upload a resume to see progress here.
        </div>
      ) : isLoading ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-10 min-h-[300px]">
          <ActivityTimelineSkeleton />
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-12 text-center text-base text-brand-muted min-h-[300px] flex items-center justify-center">
          Waiting for processing to start...
        </div>
      ) : (
        <>
          <div className="space-y-0">
            {paginatedActivities.map((activity, index) => (
              <NotificationItem
                key={`${activity.step}-${activity.timestamp}-${startIndex + index}`}
                step={activity.step}
                message={activity.message}
                status={activity.status}
                timestamp={activity.timestamp}
                isLast={index === paginatedActivities.length - 1 && currentPage === totalPages}
                errorMessage={activity.error_message}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-6 border-t border-white/10">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-white/10 text-brand-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-white/10 text-brand-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {getPaginationGroup().map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`min-w-[32px] px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    currentPage === page
                      ? "bg-brand-primary text-brand-ink"
                      : "text-brand-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-white/10 text-brand-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-white/10 text-brand-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                title="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
              <span className="text-xs text-brand-muted ml-2">
                Showing {startIndex + 1}-{Math.min(endIndex, activities.length)} of {activities.length}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ResumeUploadsDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"history" | "new" | "recommendations" | "notifications">("history");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const focusedUploadId = searchParams.get("upload_id");
  const { user } = useCurrentUser();
  const userEmail = user?.email || null;
  const { items: historyItems, isLoading: isHistoryLoading, refetch: refetchHistory } = useUploadHistory(userEmail);
  const {
    items: recommendationHistoryItems,
    isLoading: isRecommendationHistoryLoading,
    error: recommendationHistoryError,
    refetch: refetchRecommendationHistory,
  } = useRecommendationHistory(userEmail);
  const {
    status: focusedStatus,
    errorMessage: focusedErrorMessage,
    isLoading: isFocusedStatusLoading,
  } = useUploadStatus(focusedUploadId, !!focusedUploadId);
  const [detailUploadId, setDetailUploadId] = useState<string | null>(null);
  const {
    data: detail,
    isLoading: isDetailLoading,
    error: detailError,
  } = useResumeDetail(detailUploadId);
  const { deleteUpload, isDeleting } = useDeleteUpload();
  const [deleteConfirmUploadId, setDeleteConfirmUploadId] = useState<string | null>(null);
  const { notifications, toasts, removeToast } = useNotifications(focusedUploadId, focusedStatus, focusedErrorMessage);

  const redirectInFlightRef = useRef(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!focusedUploadId) return;
    if (redirectInFlightRef.current) return;
    if (focusedStatus !== "completed" && focusedStatus !== "recommendations") return;

    const redirectKey = `recommendations_preview_redirected_${focusedUploadId}`;
    if (localStorage.getItem(redirectKey)) return;

    redirectInFlightRef.current = true;
    localStorage.setItem(redirectKey, "1");

    const backendV2Base = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace("/api/v1", "/api/v2");
    const storageKey = `recommendations_preview_jobs_${focusedUploadId}`;

    const run = async () => {
      try {
        if (backendV2Base) {
          const res = await fetch(`${backendV2Base}/recommendations/${focusedUploadId}`);
          if (res.ok) {
            const data = await res.json();
            const jobs = Array.isArray(data?.recommendations) ? data.recommendations : [];
            localStorage.setItem(storageKey, JSON.stringify(jobs));
          }
        }
      } catch {
      } finally {
        router.push(`/recommendations/preview?upload_id=${encodeURIComponent(focusedUploadId)}`);
      }
    };

    setTimeout(() => {
      run();
    }, 300);
  }, [focusedUploadId, focusedStatus, router]);

  useEffect(() => {
    if (focusedStatus === "completed" || focusedStatus === "recommendations") {
      refetchRecommendationHistory();
    }
  }, [focusedStatus, refetchRecommendationHistory]);
  
  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { isUploading, uploadResume } = useResumeUploadV2();

  const ITEMS_PER_PAGE = 3;

  const uploadsToShow = useMemo(() => {
    if (!historyItems.length && !focusedUploadId) return [];
    if (!focusedUploadId) return historyItems;
    const existing = historyItems.find((x) => x.upload_id === focusedUploadId);
    if (existing) return historyItems;
    return historyItems;
  }, [historyItems, focusedUploadId]);

  const totalPages = Math.ceil(uploadsToShow.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedUploads = uploadsToShow.slice(startIndex, endIndex);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

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
          <div className="pt-6 pb-6 px-6 lg:px-8 xl:px-10">
            <header className="mb-4 max-w-4xl mx-auto">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-white mb-1">
                Manage your workspace
              </h1>
              <p className="text-xs text-brand-muted max-w-2xl">
                A single place to upload resumes, track processing, review recommendations, and stay on top of notifications.
              </p>
            </header>

            <div className="max-w-4xl mx-auto">
              <div className="glass-panel rounded-3xl border border-white/10 p-4 sm:p-6 md:p-6">
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
                    {isHistoryLoading && <UploadHistorySkeleton rows={5} />}

                    {!isHistoryLoading && paginatedUploads.map((upload) => {
                      const isFocused = focusedUploadId === upload.upload_id;
                      const effectiveStatus =
                        isFocused && focusedStatus ? focusedStatus : upload.status;
                      const cfg =
                        statusConfig[effectiveStatus] || statusConfig.parsing;
                      return (
                        <div
                          key={upload.upload_id}
                          className={`flex items-center justify-between gap-4 rounded-2xl px-5 py-4 hover:bg-white/[0.03] transition-colors ${
                            isFocused ? "border border-brand-primary-soft bg-brand-primary-soft/10" : ""
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
                            <div className="h-10 w-10 rounded-full bg-brand-primary-soft flex items-center justify-center flex-shrink-0">
                              <Upload className="h-5 w-5 text-brand-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-base font-medium text-white truncate">
                                {upload.file_name}
                              </p>
                              <p className="text-sm text-brand-muted">
                                Uploaded {(upload.created_at || "").slice(0, 10)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${cfg.className}`}
                            >
                              {cfg.icon}
                              <span>{cfg.label}</span>
                            </span>
                            <button
                              onClick={() => setDetailUploadId(upload.upload_id)}
                              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border border-white/10 text-brand-muted hover:text-brand-ink hover:bg-brand-primary transition-colors"
                            >
                              View
                              <ArrowUpRight className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmUploadId(upload.upload_id)}
                              disabled={isDeleting}
                              className="inline-flex items-center justify-center p-2 rounded-full border border-red-500/40 text-red-300 hover:text-white hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Delete upload"
                            >
                              <Trash2 className="h-4 w-4" />
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

                    {!isHistoryLoading && uploadsToShow.length > 0 && totalPages > 1 && (
                      <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/10">
                        <div className="text-xs text-brand-muted">
                          Showing {startIndex + 1}-{Math.min(endIndex, uploadsToShow.length)} of {uploadsToShow.length}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-white/10 text-brand-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="First page"
                          >
                            <ChevronsLeft className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-white/10 text-brand-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Previous page"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </button>
                          <div className="flex items-center gap-1.5 px-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                              if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                              ) {
                                return (
                                  <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`min-w-[32px] px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                      currentPage === page
                                        ? "bg-brand-primary text-brand-ink"
                                        : "text-brand-muted hover:text-white hover:bg-white/5"
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              } else if (page === currentPage - 2 || page === currentPage + 2) {
                                return (
                                  <span key={page} className="text-brand-muted px-1">
                                    ...
                                  </span>
                                );
                              }
                              return null;
                            })}
                          </div>
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-white/10 text-brand-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Next page"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-white/10 text-brand-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Last page"
                          >
                            <ChevronsRight className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeTab === "new" && (
                <NewUploadTab
                  file={file}
                  setFile={setFile}
                  uploading={uploading}
                  setUploading={setUploading}
                  fileInputRef={fileInputRef}
                  userEmail={userEmail}
                  uploadResume={uploadResume}
                  isUploading={isUploading}
                  router={router}
                  setActiveTab={setActiveTab}
                  refetchHistory={refetchHistory}
                />
              )}

              {activeTab === "recommendations" && (
                <div className="min-h-[500px]">
                  <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
                    Your recommendations
                  </h2>

                  {(focusedStatus === "embedding" || focusedStatus === "embedding_completed") && (
                    <div className="rounded-2xl border border-brand-secondary/40 bg-brand-secondary-soft px-5 py-4 mb-6 flex items-start gap-3">
                      <Sparkles className="h-5 w-5 text-brand-secondary mt-0.5" />
                      <div>
                        <p className="text-sm text-white font-medium">Preparing new recommendations...</p>
                        <p className="text-xs text-brand-muted mt-1">
                          Your previous recommendation sets are still available below.
                        </p>
                      </div>
                    </div>
                  )}

                  {isRecommendationHistoryLoading ? (
                    <>
                      <div className="text-sm sm:text-base text-brand-muted mb-8 space-y-2">
                        <div className="h-4 w-full max-w-lg rounded-md bg-white/10 animate-pulse" />
                        <div className="h-4 w-2/3 max-w-md rounded-md bg-white/[0.06] animate-pulse" />
                      </div>
                      <RecommendationsTabSkeleton />
                    </>
                  ) : recommendationHistoryError ? (
                    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-8 min-h-[220px] flex flex-col items-center justify-center gap-3">
                      <p className="text-sm text-red-200">Failed to load recommendation history.</p>
                      <button
                        type="button"
                        onClick={refetchRecommendationHistory}
                        className="inline-flex items-center justify-center rounded-full px-5 py-2 text-xs sm:text-sm font-medium border border-red-400/60 text-red-100 hover:bg-red-500/20 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : recommendationHistoryItems.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-10 flex flex-col items-center justify-center gap-4 min-h-[300px]">
                      <Sparkles className="h-6 w-6 text-brand-secondary" />
                      <p className="text-sm text-white">No saved recommendations yet.</p>
                      <p className="text-xs text-brand-muted text-center max-w-md">
                        Upload and process a resume to generate your first personalized recommendation set.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendationHistoryItems.map((item) => {
                        const linkedUpload = historyItems.find((x) => x.upload_id === item.upload_id);
                        const created = item.created_at
                          ? new Date(item.created_at).toLocaleString()
                          : "Unknown date";
                        const avg = typeof item.avg_match_score === "number"
                          ? `${Math.round(item.avg_match_score)}% avg match`
                          : "Avg match N/A";

                        return (
                          <button
                            key={item._id}
                            type="button"
                            onClick={() =>
                              router.push(
                                `/recommendations/preview?upload_id=${encodeURIComponent(item.upload_id)}`
                              )
                            }
                            className="w-full text-left rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                          >
                            <div className="min-w-0">
                              <p className="text-base font-medium text-white truncate">
                                {linkedUpload?.file_name || `Upload ${item.upload_id.slice(0, 8)}`}
                              </p>
                              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                <span className="inline-flex items-center rounded-full px-2.5 py-1 border border-white/10 text-brand-muted">
                                  {item.total_recommendations} matches
                                </span>
                                <span className="inline-flex items-center rounded-full px-2.5 py-1 border border-white/10 text-brand-muted">
                                  {avg}
                                </span>
                                <span className="inline-flex items-center rounded-full px-2.5 py-1 border border-white/10 text-brand-muted">
                                  {created}
                                </span>
                              </div>
                            </div>

                            <span className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border border-white/10 text-brand-muted hover:text-brand-ink hover:bg-brand-primary transition-colors">
                              Open
                              <ArrowUpRight className="h-4 w-4" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "notifications" && (
                <ActivityTimelineTab focusedUploadId={focusedUploadId} />
              )}
              </div>
            </div>
          </div>
        </main>
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />

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

      {detailUploadId && (
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
                {!isDetailLoading && detail && (
                  <>
                    <h3 className="text-xl sm:text-2xl font-semibold text-white">
                      {detail.name || "Unnamed candidate"}
                    </h3>
                    {detail.contact?.email && (
                      <p className="text-xs sm:text-sm text-brand-muted mt-1">
                        {detail.contact.email}
                      </p>
                    )}
                  </>
                )}
              </div>
              <button
                onClick={() => setDetailUploadId(null)}
                className="text-brand-muted hover:text-white rounded-full p-1 shrink-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isDetailLoading && <ResumeDetailModalSkeleton />}

            {!isDetailLoading && detailError && (
              <div className="py-10 text-center">
                <p className="text-sm text-red-300">{detailError}</p>
                <button
                  type="button"
                  onClick={() => setDetailUploadId(null)}
                  className="mt-6 inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium border border-white/20 text-white hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            )}

            {!isDetailLoading && !detailError && detail && detail.skills && detail.skills.length > 0 && (
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

            {!isDetailLoading && !detailError && detail && detail.experience && detail.experience.length > 0 && (
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

            {!isDetailLoading &&
              !detailError &&
              detail &&
              (!detail.skills || detail.skills.length === 0) &&
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

