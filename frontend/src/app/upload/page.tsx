"use client";
import React, { useState, useRef, useEffect } from "react";
import { Upload, FileText, Check, X, Loader2, Sparkles, Target, Zap } from "lucide-react";
import { Toaster, toast } from "sonner";
import Navbar from "../components/v2/Navbar";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import ResumeAnalysis from "../components/ResumeAnalysis";
import { startRecommendationTask } from "../utils/startrecommendationtask";

export default function ResumeUploadSection() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [resumeData, setResumeData] = useState<any>(null);
    const [uploadId, setUploadId] = useState<string | null>(null);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const analysisRef = useRef<HTMLDivElement>(null);
    const { user, loading } = useCurrentUser();
    const userEmail = user?.email || "";

    useEffect(() => {
        if (loading) return;
        if (!user) router.push('/login');
    }, [user, router, loading]);

    useEffect(() => {
        if (uploadSuccess && resumeData && analysisRef.current) {
            analysisRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [uploadSuccess, resumeData]);

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

    const backendV2Base =
        (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace("/api/v1", "/api/v2");

    const validateAndSetFile = (file: File) => {
        const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a PDF or Word document");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should not exceed 5MB");
            return;
        }
        setFile(file);
        setUploadSuccess(false);
        setUploadId(null);
        setUploadStatus(null);
    };

    const pollUploadStatus = async (id: string, attempt = 0) => {
        try {
            const res = await fetch(`${backendV2Base}/resume/upload/${id}/status`);
            if (!res.ok) {
                throw new Error("Failed to fetch upload status");
            }
            const data = await res.json();
            const status = data.status as string;
            setUploadStatus(status);

            if (status === "parsed" || status === "completed") {
                setUploadSuccess(true);
                toast.success("Resume processed successfully");
                if (userEmail) {
                    try {
                        await startRecommendationTask(userEmail);
                    } catch (err) {
                        console.error("Error starting recommendation task", err);
                    }
                }
                return;
            }

            if (status === "failed" || status === "parsing_failed") {
                toast.error("Resume processing failed. You can retry later.");
                return;
            }

            if (attempt < 150) {
                setTimeout(() => {
                    pollUploadStatus(id, attempt + 1);
                }, 2000);
            }
        } catch (err) {
            console.error("Error polling upload status", err);
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

        const formData = new FormData();
        formData.append("file", file);
        formData.append("user_email", userEmail);

        const analyzingToastId = toast.loading("Uploading your resume...");
        try {
            const response = await fetch(`${backendV2Base}/resume/upload`, {
                method: "POST",
                body: formData,
            });
            if (!response.ok) throw new Error("Upload failed");
            
            const data = await response.json();
            setUploadId(data.upload_id);
            setUploadStatus(data.status);
            toast.success("Resume upload queued for processing", { id: analyzingToastId });
            pollUploadStatus(data.upload_id);
        } catch (error) {
            toast.error("Failed to upload resume. Please try again.", { id: analyzingToastId });
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => fileInputRef.current?.click();
    const removeFile = () => {
        setFile(null);
        setUploadSuccess(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const closeModal = () => {
        setUploadSuccess(false);
    };

    return (
        <div className="min-h-screen bg-brand text-brand relative overflow-hidden">
            <div className="noise-bg" aria-hidden="true" />
            <Navbar />
            <Toaster position="top-center" richColors />
            
            <div className="pt-24 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid lg:grid-cols-2 gap-8 mb-12">
                        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10">
                            <h2 className="text-3xl md:text-4xl font-medium text-white mb-4">Unlock Your Career Potential</h2>
                            <p className="text-brand-muted text-base mb-8">Upload your resume and let AI match you with opportunities tailored to your skills.</p>
                            
                            <div className="space-y-5">
                                <div className="flex items-start gap-4">
                                    <div className="bg-brand-primary-soft p-2.5 rounded-xl shrink-0">
                                        <Target className="h-5 w-5 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-base text-white mb-1.5">Smart Job Matching</h3>
                                        <p className="text-brand-muted text-sm">Our AI analyzes your skills and experience to find perfect job matches.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-brand-primary-soft p-2.5 rounded-xl shrink-0">
                                        <Zap className="h-5 w-5 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-base text-white mb-1.5">Top Candidate Ranking</h3>
                                        <p className="text-brand-muted text-sm">See jobs where you'll be a top candidate based on your qualifications.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-brand-primary-soft p-2.5 rounded-xl shrink-0">
                                        <Sparkles className="h-5 w-5 text-brand-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-base text-white mb-1.5">Personalized Insights</h3>
                                        <p className="text-brand-muted text-sm">Get tailored suggestions to improve your application success rate.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-medium text-white mb-2">Upload Your Resume</h2>
                                <p className="text-brand-muted text-sm">Get personalized job recommendations tailored to your skills</p>
                            </div>

                            {!file ? (
                                <div
                                    className="border-2 border-dashed border-brand-border rounded-2xl p-12 text-center cursor-pointer hover:border-brand-primary-soft transition min-h-[350px] flex flex-col justify-center"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={triggerFileInput}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileChange}
                                    />
                                    <div className="flex justify-center mb-5">
                                        <div className="bg-brand-primary-soft p-5 rounded-full">
                                            <Upload className="h-8 w-8 text-brand-primary" />
                                        </div>
                                    </div>
                                    <h3 className="font-medium text-base text-white mb-2">Drag and drop your resume here</h3>
                                    <p className="text-brand-muted text-sm mb-6">Support for PDF, DOC, and DOCX (Max 5MB)</p>
                                    <button className="btn-primary px-6 py-2.5 rounded-lg text-sm font-medium mx-auto">
                                        Browse Files
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-brand-primary-soft bg-brand-primary-soft/20 rounded-2xl p-6 min-h-[350px] flex flex-col">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="bg-brand-primary-soft p-3 rounded-xl shrink-0">
                                                <FileText className="h-6 w-6 text-brand-primary" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-medium text-base text-white truncate">{file.name}</h3>
                                                <p className="text-brand-muted text-xs">
                                                    {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={removeFile} className="text-brand-muted hover:text-brand-primary p-2 shrink-0">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {!uploadSuccess ? (
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className={`mt-auto w-full btn-primary py-4 rounded-lg flex items-center justify-center gap-2 font-medium ${uploading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="animate-spin h-5 w-5" />
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>Upload Resume</>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="mt-auto bg-brand-secondary-soft text-brand-secondary p-4 rounded-lg flex items-center gap-3">
                                            <Check className="h-6 w-6" />
                                            <span>Resume uploaded successfully! We're analyzing your profile.</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="mt-8 text-center text-sm text-brand-muted">
                                <p>Your resume data is secure and will only be used to provide you with job recommendations.</p>
                                <p className="mt-2">By uploading, you agree to our <a href="#" className="text-brand-primary hover:opacity-80">Terms of Service</a> and <a href="#" className="text-brand-primary hover:opacity-80">Privacy Policy</a>.</p>
                            </div>

                            {uploadId && (
                                <div className="mt-4 text-xs text-brand-muted text-center">
                                    <p>Upload ID: {uploadId}</p>
                                    {uploadStatus && <p>Status: {uploadStatus}</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    {uploadSuccess && resumeData && (
                        <div
                            ref={analysisRef}
                            className="fixed inset-0 z-40 flex items-center justify-center px-4 sm:px-6"
                            onClick={closeModal}
                        >
                            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                            <div 
                                className="relative z-10 max-w-2xl w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ResumeAnalysis data={resumeData} onClose={closeModal} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
