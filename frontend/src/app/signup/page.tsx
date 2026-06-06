"use client";

import React, { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SignupForm from "../v2/components/auth/SignupForm";
import AuthShell from "../v2/components/auth/AuthShell";
import "../v2/v2-theme.css";

function SignupFallback() {
  return (
    <AuthShell title="Join Jobgenie" subtitle="Create an account to get curated matches and guidance">
      <div className="flex justify-center py-12 v2-text-muted">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    </AuthShell>
  );
}

export default function SignupPage() {
  return (
    <div className="v2-shell">
      <Suspense fallback={<SignupFallback />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
