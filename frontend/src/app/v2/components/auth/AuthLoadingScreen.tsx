"use client";

import { Loader2 } from "lucide-react";
import "../../v2-theme.css";

type AuthLoadingScreenProps = {
  message?: string;
};

export default function AuthLoadingScreen({ message }: AuthLoadingScreenProps) {
  return (
    <div
      className="v2-shell min-h-screen flex flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
      aria-label={message || "Loading"}
    >
      <Loader2 className="h-8 w-8 animate-spin v2-text-muted" aria-hidden />
      {message ? <p className="text-sm v2-text-muted">{message}</p> : null}
    </div>
  );
}