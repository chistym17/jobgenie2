'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertTriangle, Circle } from 'lucide-react';

export type ActivityStatus = 'completed' | 'in_progress' | 'pending' | 'failed';

interface ActivityItemProps {
  step: string;
  message: string;
  status: ActivityStatus;
  timestamp?: string;
  isLast?: boolean;
  errorMessage?: string | null;
}

export default function ActivityItem({
  step,
  message,
  status,
  timestamp,
  isLast = false,
  errorMessage,
}: ActivityItemProps) {
  const iconConfig = {
    completed: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />,
    in_progress: <Clock className="h-3.5 w-3.5 text-amber-400" />,
    pending: <Circle className="h-3.5 w-3.5 text-brand-muted" />,
    failed: <AlertTriangle className="h-3.5 w-3.5 text-red-400" />,
  };

  const displayMessage = errorMessage && status === 'failed' 
    ? `${message}: ${errorMessage.length > 100 ? errorMessage.substring(0, 100) + '...' : errorMessage}` 
    : message;

  return (
    <div className="flex gap-2">
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/5 border border-white/10">
          {iconConfig[status]}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 mt-1 ${
            status === 'completed' ? 'bg-emerald-500/30' : 'bg-white/5'
          }`} />
        )}
      </div>
      <div className="flex-1 pb-2">
        <div className="rounded-lg border border-white/10 bg-white/5 p-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white mb-0.5 truncate">{step}</p>
              <p className="text-[10px] text-brand-muted leading-tight">{displayMessage}</p>
            </div>
            {timestamp && (
              <span className="text-[10px] text-brand-muted whitespace-nowrap flex-shrink-0">
                {new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

