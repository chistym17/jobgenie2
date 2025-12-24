"use client";

import { useEffect, useState, useCallback } from "react";

export interface UploadHistoryItem {
  upload_id: string;
  file_name: string;
  status: string;
  created_at?: string;
  completed_at?: string | null;
}

interface UploadHistoryResponse {
  uploads: UploadHistoryItem[];
  total: number;
  limit: number;
  offset: number;
}

export function useUploadHistory(userEmail: string | null) {
  const [items, setItems] = useState<UploadHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendV2Base =
    (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace("/api/v1", "/api/v2");

  const fetchHistory = useCallback(async () => {
    if (!userEmail) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${backendV2Base}/resume/uploads?user_email=${encodeURIComponent(
          userEmail
        )}&limit=20&offset=0`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch upload history");
      }
      const data: UploadHistoryResponse = await res.json();
      setItems(data.uploads);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, backendV2Base]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    items,
    isLoading,
    error,
    refetch: fetchHistory,
  };
}


