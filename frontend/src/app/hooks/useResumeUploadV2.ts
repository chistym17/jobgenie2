"use client";

import { useState } from "react";

export function useResumeUploadV2() {
  const [isUploading, setIsUploading] = useState(false);

  const backendV2Base =
    (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace("/api/v1", "/api/v2");

  const uploadResume = async (file: File, userEmail: string) => {
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_email", userEmail);

    const response = await fetch(`${backendV2Base}/resume/upload`, {
      method: "POST",
      body: formData,
    });

    setIsUploading(false);

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data as { upload_id: string; parse_task_id: string; status: string };
  };

  return {
    isUploading,
    uploadResume,
  };
}


