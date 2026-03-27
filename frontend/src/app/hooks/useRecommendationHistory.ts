"use client";

import { useCallback, useEffect, useState } from "react";

export interface RecommendationHistoryItem {
  _id: string;
  upload_id: string;
  user_email: string;
  resume_id?: string | null;
  recommendations: Array<Record<string, unknown>>;
  total_recommendations: number;
  avg_match_score?: number | null;
  created_at?: string;
  updated_at?: string;
}

export function useRecommendationHistory(userEmail: string | null) {
  const [items, setItems] = useState<RecommendationHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backendV2Base =
    (process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000").replace(
      "/api/v1",
      "/api/v2"
    );

  const fetchHistory = useCallback(async () => {
    if (!userEmail) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `${backendV2Base}/recommendations?user_email=${encodeURIComponent(
          userEmail
        )}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch recommendation history");
      }
      const data = (await res.json()) as RecommendationHistoryItem[];
      setItems(Array.isArray(data) ? data : []);
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

  const deleteRecommendation = useCallback(
    async (recommendationId: string): Promise<boolean> => {
      setIsDeleting(true);
      try {
        const res = await fetch(
          `${backendV2Base}/recommendations/item/${encodeURIComponent(
            recommendationId
          )}`,
          { method: "DELETE" }
        );
        if (!res.ok) {
          const errData = await res
            .json()
            .catch(() => ({ detail: "Failed to delete recommendation" }));
          throw new Error(errData.detail || "Failed to delete recommendation");
        }
        setItems((prev) => prev.filter((x) => x._id !== recommendationId));
        setError(null);
        return true;
      } catch (err: any) {
        setError(err.message || "Failed to delete recommendation");
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [backendV2Base]
  );

  return {
    items,
    isLoading,
    isDeleting,
    error,
    refetch: fetchHistory,
    deleteRecommendation,
  };
}
