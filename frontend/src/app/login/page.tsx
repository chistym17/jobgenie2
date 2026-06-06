"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import LoginForm from "../v2/components/auth/LoginForm";
import AuthShell from "../v2/components/auth/AuthShell";
import "../v2/v2-theme.css";

function LoginFallback() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to continue your Jobgenie journey">
      <div className="flex justify-center py-12 v2-text-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <div className="v2-shell">
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
