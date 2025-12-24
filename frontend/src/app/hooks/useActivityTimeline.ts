"use client";

import { useEffect, useState, useRef } from "react";

export interface ActivityEvent {
  step: string;
  message: string;
  status: "completed" | "in_progress" | "pending" | "failed";
  timestamp: string;
  error_message?: string | null;
}

export function useActivityTimeline(uploadId: string | null) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const shouldStopRef = useRef(false);

  const backendV2Base =
    (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace("/api/v1", "/api/v2");

  // Check if we should stop polling based on last activity status
  const shouldStopPollingCheck = (activities: ActivityEvent[]): boolean => {
    if (activities.length === 0) return false;
    
    const lastActivity = activities[activities.length - 1];
    const terminalStatuses: ActivityEvent["status"][] = ["completed", "failed"];
    
    // Stop polling if last activity is in a terminal state
    if (terminalStatuses.includes(lastActivity.status)) {
      return true;
    }
    
    // Also check if the step indicates completion or failure
    const terminalSteps = [
      "Recommendations Ready",
      "Processing Failed",
      "Parsing Failed",
      "Embedding Failed"
    ];
    
    if (terminalSteps.some(step => lastActivity.step.includes(step))) {
      return true;
    }
    
    return false;
  };

  useEffect(() => {
    if (!uploadId) {
      setActivities([]);
      setIsLoading(false);
      setIsInitialLoad(true);
      shouldStopRef.current = false;
      return;
    }

    let cancelled = false;
    let intervalId: NodeJS.Timeout | null = null;
    shouldStopRef.current = false;

    const fetchActivities = async (isInitial: boolean = false) => {
      // Don't poll if we should stop
      if (shouldStopRef.current && !isInitial) {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        return;
      }

      // Only show loading on initial fetch
      if (isInitial) {
        setIsLoading(true);
      }
      try {
        const res = await fetch(
          `${backendV2Base}/resume/upload/${uploadId}/activity`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch activity timeline");
        }
        const data = await res.json();
        if (cancelled) return;
        
        const newActivities = data.activity_timeline || [];
        
        // Check if we should stop polling
        const shouldStop = shouldStopPollingCheck(newActivities);
        if (shouldStop) {
          shouldStopRef.current = true;
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
        
        // Only update if activities have actually changed
        setActivities(prev => {
          // Quick check: compare length first
          if (prev.length !== newActivities.length) {
            return newActivities;
          }
          // If same length, check if last activity changed (most common case)
          if (prev.length > 0 && newActivities.length > 0) {
            const lastPrev = prev[prev.length - 1];
            const lastNew = newActivities[newActivities.length - 1];
            if (lastPrev.timestamp !== lastNew.timestamp || 
                lastPrev.step !== lastNew.step ||
                lastPrev.status !== lastNew.status) {
              return newActivities;
            }
          }
          // Deep comparison only if needed
          if (JSON.stringify(prev) === JSON.stringify(newActivities)) {
            return prev; // Return previous state to prevent re-render
          }
          return newActivities;
        });
        
        setError(null);
        if (isInitial) {
          setIsInitialLoad(false);
        }
      } catch (err: any) {
        if (cancelled) return;
        setError(err.message || "Unknown error");
        if (isInitial) {
          setIsInitialLoad(false);
        }
      } finally {
        if (!cancelled && isInitial) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchActivities(true);
    
    // Poll for updates every 2 seconds (without showing loading)
    intervalId = setInterval(() => {
      if (!shouldStopRef.current && !cancelled) {
        fetchActivities(false);
      } else if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }, 2000);

    return () => {
      cancelled = true;
      shouldStopRef.current = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [uploadId, backendV2Base]);

  return { activities, isLoading, error };
}

