'use client';

import React, { useEffect } from 'react';
import { X, CheckCircle2, Clock, AlertTriangle, Info } from 'lucide-react';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
  duration?: number;
}

export default function Toast({ id, message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const typeStyles = {
    success: 'bg-white/5 border-white/10 text-emerald-400',
    info: 'bg-white/5 border-white/10 text-brand-muted',
    warning: 'bg-white/5 border-white/10 text-amber-400',
    error: 'bg-white/5 border-white/10 text-red-400',
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    info: <Info className="h-5 w-5 text-brand-muted" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    error: <AlertTriangle className="h-5 w-5 text-red-400" />,
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium backdrop-blur-sm ${typeStyles[type]} transition-all duration-300 transform translate-x-0 min-w-[280px]`}
    >
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="hover:opacity-70 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

