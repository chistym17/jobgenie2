"use client";

import { useEffect, useState } from "react";
import { pullEmbedderTask } from "../utils/startEmbedderTask";

export type RecommendationFlowStatus = "idle" | "running" | "completed" | "error";

interface RecommendationFlowOptions {
  uploadStatus: string | null;
  userEmail: string | null;
  enabled: boolean;
}

export function useRecommendationFlow(
  uploadId: string | null,
  { uploadStatus, userEmail, enabled }: RecommendationFlowOptions
) {
  const [status, setStatus] = useState<RecommendationFlowStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [hasStartedForUpload, setHasStartedForUpload] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !uploadId || !userEmail) return;

    if (uploadStatus !== "parsed" && uploadStatus !== "completed") return;

    if (hasStartedForUpload === uploadId) return;

    let cancelled = false;

    const runFlow = async () => {
      setHasStartedForUpload(uploadId);
      setStatus("running");
      setError(null);

      try {
        const workerBase = process.env.NEXT_PUBLIC_WORKER_URL || "";
        const embedRes = await fetch(`${workerBase}/precompute-embedding`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        });

        if (!embedRes.ok) {
          throw new Error("Failed to start embedding task");
        }

        const embedData = await embedRes.json();
        const taskId = embedData.task_id as string | undefined;
        if (!taskId) {
          throw new Error("No embedding task id returned");
        }

        const result = await pullEmbedderTask(taskId, userEmail);

        if (cancelled) return;

        if (result.status === "completed") {
          setStatus("completed");
        } else {
          setStatus("error");
          setError(result.message || "Embedding flow failed");
        }
      } catch (err: any) {
        if (cancelled) return;
        setStatus("error");
        setError(err.message || "Unknown error");
      }
    };

    runFlow();

    return () => {
      cancelled = true;
    };
  }, [enabled, uploadId, userEmail, uploadStatus, hasStartedForUpload]);

  return { status, error };
}


