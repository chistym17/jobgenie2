"use client";
import React, { useState, useRef, useEffect } from "react";
import { Upload, FilePlus, Check, X, FileText, Loader2, Link } from "lucide-react";
import { Toaster, toast } from "sonner";
import Navbar from "../components/Navbar";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { useRouter } from "next/navigation";
import ResumeAnalysis from "../components/ResumeAnalysis";
import { pullEmbedderTask} from "../utils/startEmbedderTask";

export default function ResumeUploadSection() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [resumeData, setResumeData] = useState<any>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const analysisRef = useRef<HTMLDivElement>(null);
    const { user, loading } = useCurrentUser();
    const userEmail = user?.email || "";

    useEffect(() => {
        if (loading) {
            return;
        }
        if (!user) {
            router.push('/login');
        }
    }, [user, router, loading]);

    useEffect(() => {
        if (uploadSuccess && resumeData && analysisRef.current) {
            analysisRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
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
            const droppedFile = e.dataTransfer.files[0];
            validateAndSetFile(droppedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndSetFile(e.target.files[0]);
        }
    };

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

        const analyzingToastId = toast.loading("Analyzing your resume...");
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/resume/upload`, {
                method: "POST",
                body: formData,
            });
            if (!response.ok) {
                throw new Error("Upload failed");
            }
            
            const data = await response.json();

            const task_id = data.task_id;

            await pullEmbedderTask(task_id,userEmail)

            setResumeData(data.resume);
            setUploadSuccess(true);
            toast.success("Resume uploaded and analyzed successfully!", { id: analyzingToastId });
          

        } catch (error) {
            toast.error("Failed to upload/analyze resume. Please try again.", { id: analyzingToastId });
        } finally {
            setUploading(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const removeFile = () => {
        setFile(null);
        setUploadSuccess(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div>
            <Navbar />
            <div className="bg-blue-50 min-h-screen py-20 px-6">
                <Toaster position="top-center" richColors />

                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="grid md:grid-cols-5">
                            <div className="md:col-span-2 bg-gradient-to-br from-blue-500 to-blue-600 text-white p-10 flex flex-col justify-center min-h-[600px]">
                                <h2 className="text-3xl font-bold mb-8">Unlock Your Career Potential</h2>

                                <div className="space-y-8">
                                    <div className="flex items-start">
                                        <div className="bg-white bg-opacity-15 p-3 rounded-lg mr-5">
                                            <FileText className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-xl">Smart Job Matching</h3>
                                            <p className="text-blue-50 mt-2 text-lg">Our AI analyzes your skills and experience to find perfect job matches.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-white bg-opacity-15 p-3 rounded-lg mr-5">
                                            <Check className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-xl">Top Candidate Ranking</h3>
                                            <p className="text-blue-50 mt-2 text-lg">See jobs where you'll be a top candidate based on your qualifications.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-white bg-opacity-15 p-3 rounded-lg mr-5">
                                            <FilePlus className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-xl">Personalized Insights</h3>
                                            <p className="text-blue-50 mt-2 text-lg">Get tailored suggestions to improve your application success rate.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-3 p-12 min-h-[600px]">
                                <div className="text-center mb-10">
                                    <h2 className="text-3xl font-bold text-gray-800">Upload Your Resume</h2>
                                    <p className="text-gray-600 mt-3 text-lg">Get personalized job recommendations tailored to your skills and experience</p>
                                </div>

                                {!file ? (
                                    <div
                                        className="border-2 border-dashed border-blue-200 rounded-xl p-12 text-center cursor-pointer hover:bg-blue-50 transition min-h-[350px] flex flex-col justify-center"
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

                                        <div className="flex justify-center mb-6">
                                            <div className="bg-blue-100 p-6 rounded-full">
                                                <Upload className="h-10 w-10 text-blue-500" />
                                            </div>
                                        </div>

                                        <h3 className="font-medium text-xl text-gray-800">
                                            Drag and drop your resume here
                                        </h3>
                                        <p className="text-gray-500 mt-3 mb-6 text-lg">
                                            Support for PDF, DOC, and DOCX (Max 5MB)
                                        </p>

                                        <button
                                            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition font-medium text-lg mx-auto"
                                        >
                                            Browse Files
                                        </button>
                                    </div>
                                ) : (
                                    <div className="border-2 border-blue-100 bg-blue-50 rounded-xl p-8 min-h-[350px] flex flex-col">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="bg-blue-100 p-4 rounded-lg mr-5">
                                                    <FileText className="h-8 w-8 text-blue-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-xl text-gray-800 truncate max-w-xs">
                                                        {file.name}
                                                    </h3>
                                                    <p className="text-gray-500 text-lg">
                                                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type.split('/')[1].toUpperCase()}
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={removeFile}
                                                className="text-gray-500 hover:text-red-500 p-2"
                                            >
                                                <X className="h-6 w-6" />
                                            </button>
                                        </div>

                                        {!uploadSuccess ? (
                                            <button
                                                onClick={handleUpload}
                                                disabled={uploading}
                                                className={`mt-auto w-full bg-blue-500 text-white py-4 rounded-lg flex items-center justify-center transition text-lg font-medium ${uploading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'
                                                    }`}
                                            >
                                                {uploading ? (
                                                    <>
                                                        <Loader2 className="animate-spin mr-3 h-6 w-6" />
                                                        Uploading...
                                                    </>
                                                ) : (
                                                    <>
                                                        Upload Resume
                                                    </>
                                                )}
                                            </button>
                                        ) : (
                                            <div className="mt-auto bg-green-50 text-green-800 p-4 rounded-lg flex items-center text-lg">
                                                <Check className="h-6 w-6 mr-3" />
                                                Resume uploaded successfully! We're analyzing your profile.
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-8 text-center text-gray-600">
                                    <p>Your resume data is secure and will only be used to provide you with job recommendations.</p>
                                    <p className="mt-2">By uploading, you agree to our <a href="#" className="text-blue-500 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {uploadSuccess && resumeData && (
                        <div className="mt-10" ref={analysisRef}>
                            <ResumeAnalysis data={resumeData} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}