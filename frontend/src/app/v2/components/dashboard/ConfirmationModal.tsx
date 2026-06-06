"use client";

import React from "react";
import { X, AlertTriangle } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6" onClick={onClose}>
      <div className="absolute inset-0 v2-modal-backdrop" />
      <div className="relative z-10 max-w-md w-full v2-neumorphic-card p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-6">
          <div className={`v2-modal-icon v2-modal-icon-${variant}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-sm v2-text-muted">{message}</p>
          </div>
          <button type="button" onClick={onClose} className="v2-btn-outline p-1 shrink-0">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="v2-btn-outline px-4 py-2 text-sm">
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`v2-btn-primary px-4 py-2 text-sm ${variant === "danger" ? "v2-btn-danger" : ""}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
