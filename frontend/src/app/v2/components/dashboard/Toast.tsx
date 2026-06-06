"use client";

import React, { useEffect } from "react";
import { X, CheckCircle2, AlertTriangle, Info } from "lucide-react";

export type ToastType = "success" | "info" | "warning" | "error";

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
  duration?: number;
}

export default function Toast({ id, message, type, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 shrink-0" />,
    info: <Info className="h-5 w-5 shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 shrink-0" />,
    error: <AlertTriangle className="h-5 w-5 shrink-0" />,
  };

  return (
    <div className={`v2-dashboard-toast v2-dashboard-toast-${type}`}>
      {icons[type]}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button type="button" onClick={() => onClose(id)} className="hover:opacity-70 transition-opacity">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
