"use client";

import { useCallback, useEffect, useState } from "react";

export type QuotaStatus = {
  user_email: string;
  date_key: string;
  uploads_used: number;
  uploads_limit: number;
  coach_used: number;
  coach_limit: number;
};

export function useQuotaStatus(userEmail: string | null) {
  const [quota, setQuota] = useState<QuotaStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendV2Base =
    (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace("/api/v1", "/api/v2");

  const fetchQuota = useCallback(async () => {
    if (!userEmail) return;
    setIsLoading(true);
    try {
      const res = await fetch(
        `${backendV2Base}/resume/quota/status?user_email=${encodeURIComponent(userEmail)}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch quota status");
      }
      const data: QuotaStatus = await res.json();
      setQuota(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [backendV2Base, userEmail]);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  return {
    quota,
    isLoading,
    error,
    refetch: fetchQuota,
  };
}

