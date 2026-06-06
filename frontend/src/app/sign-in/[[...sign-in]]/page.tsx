"use client";

import { useSignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { safeRedirectPath } from "../../utils/auth";

function GoogleRedirect() {
  const { signIn, fetchStatus } = useSignIn();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url");
  const startedRef = useRef(false);

  useEffect(() => {
    if (!signIn || startedRef.current || fetchStatus === "fetching") return;
    startedRef.current = true;
    signIn.sso({
      strategy: "oauth_google",
      redirectUrl: safeRedirectPath(redirectUrl),
      redirectCallbackUrl: "/sso-callback",
    });
  }, [signIn, fetchStatus, redirectUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-[#E2E4E9]">
      <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-[#E2E4E9]">
          <Loader2 className="h-8 w-8 animate-spin" aria-hidden />
        </div>
      }
    >
      <GoogleRedirect />
    </Suspense>
  );
}
