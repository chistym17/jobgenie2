"use client";

import React, { useRef, useState } from "react";
import { Upload, FileText, X, Loader2, Sparkles, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Navbar from "./Navbar";
import V2Toaster from "./V2Toaster";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useResumeUploadV2 } from "../../hooks/useResumeUploadV2";

const FEATURES = [
  {
    icon: Target,
    title: "Smart Job Matching",
    description: "Our AI analyzes your skills and experience to find roles that fit.",
  },
  {
    icon: Zap,
    title: "Top Candidate Ranking",
    description: "See jobs where your profile ranks among the strongest applicants.",
  },
  {
    icon: Sparkles,
    title: "Personalized Insights",
    description: "Get tailored suggestions to improve your application success rate.",
  },
];

const VALID_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useCurrentUser();
  const userEmail = user?.email || "";
  const { isUploading, uploadResume } = useResumeUploadV2();

  const validateAndSetFile = (nextFile: File) => {
    if (!VALID_TYPES.includes(nextFile.type)) {
      toast.error("Please upload a PDF or Word document");
      return;
    }
    if (nextFile.size > 5 * 1024 * 1024) {
      toast.error("File size should not exceed 5MB");
      return;
    }
    setFile(nextFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    if (!userEmail) {
      toast.error("User email not found");
      setUploading(false);
      return;
    }

    const analyzingToastId = toast.loading("Uploading your resume...");
    try {
      const data = await uploadResume(file, userEmail);
      toast.success("Resume upload queued for processing", { id: analyzingToastId });
      router.push(`/uploads?upload_id=${data.upload_id}`);
    } catch {
      toast.error("Failed to upload resume. Please try again.", { id: analyzingToastId });
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => fileInputRef.current?.click();
  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const busy = uploading || isUploading;

  return (
    <>
      <V2Toaster />
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 pt-10 pb-16">
        <div className="mb-10">
          <p className="text-xs font-medium uppercase tracking-wide v2-text-muted mb-2">Resume upload</p>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Upload your resume</h1>
          <p className="v2-text-muted text-sm max-w-xl">
            We&apos;ll parse your experience and queue personalized job matches. PDF or Word, up to 5MB.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6 items-start">
          <section className="lg:col-span-2 v2-flat-card p-6 md:p-8 order-2 lg:order-1">
            <h2 className="text-lg font-semibold mb-1">What happens next</h2>
            <p className="v2-text-muted text-sm mb-6">Three steps from upload to recommendations.</p>
            <ol className="space-y-4 mb-8">
              {["Upload resume", "AI parsing & embedding", "Curated job matches"].map((step, i) => (
                <li key={step} className="flex items-center gap-3 text-sm">
                  <span
                    className="v2-btn-primary w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                  >
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="space-y-4 pt-6 border-t" style={{ borderColor: "hsl(var(--border))" }}>
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="v2-feature-icon p-2 shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-0.5">{title}</h3>
                    <p className="v2-text-muted text-xs leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="lg:col-span-3 v2-neumorphic-card p-6 md:p-8 order-1 lg:order-2">
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-1">Select your file</h2>
              <p className="v2-text-muted text-sm">Drag and drop or browse from your device.</p>
            </div>

            {!file ? (
              <div
                role="button"
                tabIndex={0}
                className={`v2-dropzone p-10 md:p-12 text-center cursor-pointer min-h-[280px] flex flex-col justify-center ${
                  dragActive ? "v2-dropzone-active" : ""
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    triggerFileInput();
                  }
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
                <div className="flex justify-center mb-4">
                  <div className="v2-feature-icon p-4 rounded-full">
                    <Upload className="h-7 w-7" />
                  </div>
                </div>
                <h3 className="font-medium text-sm mb-2">Drag and drop your resume here</h3>
                <p className="v2-text-muted text-xs mb-5">PDF, DOC, or DOCX · Max 5MB</p>
                <span className="v2-btn-primary px-5 py-2.5 text-sm inline-flex mx-auto">Browse files</span>
              </div>
            ) : (
              <div className="v2-file-selected p-6 min-h-[280px] flex flex-col">
                <div className="flex items-center justify-between gap-3 mb-6">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="v2-feature-icon p-3 shrink-0">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm truncate">{file.name}</h3>
                      <p className="v2-text-muted text-xs">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB ·{" "}
                        {file.type.split("/")[1]?.toUpperCase() || "FILE"}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    disabled={busy}
                    className="v2-btn-outline p-2 shrink-0 disabled:opacity-50"
                    aria-label="Remove file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={busy}
                  className={`mt-auto w-full v2-btn-primary py-3.5 flex items-center justify-center gap-2 text-sm font-semibold ${
                    busy ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {busy ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5" />
                      Uploading...
                    </>
                  ) : (
                    <>Upload resume</>
                  )}
                </button>
              </div>
            )}

            <p className="mt-6 text-center text-xs v2-text-muted leading-relaxed">
              Your resume data is secure and used only for job recommendations. By uploading, you agree to
              our{" "}
              <a href="#" className="v2-link-accent">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="v2-link-accent">
                Privacy Policy
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
