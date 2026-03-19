'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Circle } from 'lucide-react';

export type NotificationStatus = 'completed' | 'in_progress' | 'pending' | 'failed';

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
  const statusConfig = {
    completed: {
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/40',
      text: 'text-emerald-300',
    },
    in_progress: {
      icon: <Clock className="h-5 w-5 text-amber-400" />,
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/40',
      text: 'text-amber-300',
    },
    pending: {
      icon: <Circle className="h-5 w-5 text-brand-muted" />,
      bg: 'bg-white/5',
      border: 'border-white/10',
      text: 'text-brand-muted',
    },
    failed: {
      icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
      bg: 'bg-red-500/10',
      border: 'border-red-500/40',
      text: 'text-red-300',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-full border ${config.bg} ${config.border}`}
        >
          {config.icon}
        </div>
        {!isLast && (
          <div
            className={`w-0.5 flex-1 mt-2 ${
              status === 'completed' ? 'bg-emerald-500/40' : 'bg-white/10'
            }`}
          />
        )}
      </div>
      <div className="flex-1 pb-3">
        <div
          className={`rounded-xl border p-3 ${config.bg} ${config.border}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className={`text-base font-medium mb-1.5 ${config.text}`}>{step}</p>
              <p className="text-sm text-brand-muted">{message}</p>
              {errorMessage && status === 'failed' && (
                <div className="mt-1.5 p-1.5 rounded-md bg-red-500/10 border border-red-500/30">
                  <p className="text-xs text-red-300 font-medium mb-0.5">Error:</p>
                  <p className="text-xs text-red-300/80 break-words">
                    {errorMessage.length > 150 ? `${errorMessage.substring(0, 150)}...` : errorMessage}
                  </p>
                  <p className="text-xs text-red-300/60 mt-1 italic">
                    Please try uploading again or contact support if the issue persists.
                  </p>
                </div>
              )}
            </div>
            {timestamp && (
              <span className="text-sm text-brand-muted whitespace-nowrap">
                {(() => {
                  try {
                    const date = new Date(timestamp);
                    return date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    });
                  } catch {
                    // If timestamp is already formatted, try to extract just the date part
                    const dateMatch = timestamp.match(/(\d{4}-\d{2}-\d{2})/);
                    if (dateMatch) {
                      const date = new Date(dateMatch[1]);
                      return date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      });
                    }
                    // Fallback: remove time part if present
                    return timestamp.split('T')[0] || timestamp.split(' ')[0] || timestamp;
                  }
                })()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

