"use client";

import { useEffect, useState } from "react";

interface ResumeExperienceItem {
  position?: string;
  company?: string;
  duration?: string;
  description?: string;
}

interface ResumeData {
  _id: string;
  name?: string;
  contact?: {
    email?: string;
    phone?: string;
    linkedin?: string;
  };
  skills?: string[];
  experience?: ResumeExperienceItem[];
}

export function useResumeDetail(uploadId: string | null) {
  const [data, setData] = useState<ResumeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendV2Base =
    (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace("/api/v1", "/api/v2");

  useEffect(() => {
    if (!uploadId) return;

    let cancelled = false;

    const fetchDetail = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${backendV2Base}/resume/upload/${uploadId}/detail`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch resume detail");
        }
        const json = await res.json();
        if (cancelled) return;
        setData(json);
        setError(null);
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message || "Unknown error");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [uploadId, backendV2Base]);

  return {
    data,
    isLoading,
    error,
  };
}


