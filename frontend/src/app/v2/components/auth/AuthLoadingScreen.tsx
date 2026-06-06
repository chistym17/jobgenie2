"use client";

import { Loader2 } from "lucide-react";
import "../../v2-theme.css";

export default function AuthLoadingScreen() {
  return (
    <div className="v2-shell min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin v2-text-muted" aria-hidden />
    </div>
  );
}