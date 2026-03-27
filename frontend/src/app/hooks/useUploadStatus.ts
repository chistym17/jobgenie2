"use client";

import { useEffect, useState } from "react";

export type UploadStatusValue =
  | "pending"
  | "queued"
  | "parsing"
  | "parsed"
  | "embedding"
  | "completed"
  | "failed"
  | "parsing_failed"
  | string;

interface UploadStatusResponse {
  upload_id: string;
  status: UploadStatusValue;
  resume_id?: string | null;
  error_message?: string | null;
}

const TERMINAL_UPLOAD_STATUSES = new Set([
  "completed",
  "failed",
  "parsing_failed",
  "embedding_failed",
]);

export function useUploadStatus(uploadId: string | null, enabled: boolean) {
  const [status, setStatus] = useState<UploadStatusValue | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendV2Base =
    (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace("/api/v1", "/api/v2");

  useEffect(() => {
    if (!uploadId || !enabled) {
      return;
    }

    let cancelled = false;

    const poll = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${backendV2Base}/resume/upload/${uploadId}/status`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch upload status");
        }
        const data: UploadStatusResponse = await res.json();
        if (cancelled) return;
        setStatus(data.status);
        setErrorMessage(data.error_message || null);
        setError(null);
        if (TERMINAL_UPLOAD_STATUSES.has(String(data.status))) {
          return;
        }
        setTimeout(poll, 2000);
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message || "Unknown error");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [uploadId, enabled, backendV2Base]);

  return {
    status,
    errorMessage,
    isLoading,
    error,
  };
}


