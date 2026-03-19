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
    success: 'bg-emerald-500/20 border-emerald-400/60 text-emerald-200',
    info: 'bg-blue-500/20 border-blue-400/60 text-blue-200',
    warning: 'bg-amber-500/20 border-amber-400/60 text-amber-200',
    error: 'bg-red-500/20 border-red-400/60 text-red-200',
  };

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-200" />,
    info: <Info className="h-5 w-5 text-blue-200" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-200" />,
    error: <AlertTriangle className="h-5 w-5 text-red-200" />,
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-base font-semibold backdrop-blur-sm ${typeStyles[type]} transition-all duration-300 transform translate-x-0 min-w-[280px] shadow-lg`}
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

