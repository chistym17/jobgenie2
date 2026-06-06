"use client";

import React from "react";
import { CheckCircle2, Clock, AlertTriangle, Circle } from "lucide-react";

export type NotificationStatus = "completed" | "in_progress" | "pending" | "failed";

interface NotificationItemProps {
  step: string;
  message: string;
  status: NotificationStatus;
  timestamp?: string;
  isLast?: boolean;
  errorMessage?: string | null;
}

export default function NotificationItem({
  step,
  message,
  status,
  timestamp,
  isLast = false,
  errorMessage,
}: NotificationItemProps) {
  const statusClass = {
    completed: "v2-timeline-completed",
    in_progress: "v2-timeline-progress",
    pending: "v2-timeline-pending",
    failed: "v2-timeline-failed",
  }[status];

  const icons = {
    completed: <CheckCircle2 className="h-5 w-5" />,
    in_progress: <Clock className="h-5 w-5" />,
    pending: <Circle className="h-5 w-5" />,
    failed: <AlertTriangle className="h-5 w-5" />,
  };

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`v2-timeline-dot ${statusClass}`}>{icons[status]}</div>
        {!isLast && <div className={`v2-timeline-line ${status === "completed" ? "v2-timeline-line-done" : ""}`} />}
      </div>
      <div className="flex-1 pb-3">
        <div className={`v2-timeline-card ${statusClass}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-medium mb-1">{step}</p>
              <p className="text-sm v2-text-muted">{message}</p>
              {errorMessage && status === "failed" && (
                <div className="v2-timeline-error mt-2 p-2 rounded-lg text-xs">{errorMessage}</div>
              )}
            </div>
            {timestamp && <span className="text-xs v2-text-muted whitespace-nowrap">{formatDate(timestamp)}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatDate(timestamp: string) {
  try {
    return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    const dateMatch = timestamp.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return new Date(dateMatch[1]).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
    return timestamp.split("T")[0] || timestamp.split(" ")[0] || timestamp;
  }
}
