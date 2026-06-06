"use client";

import { useSignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";
import { safeRedirectPath } from "../../utils/auth";
import AuthLoadingScreen from "../../v2/components/auth/AuthLoadingScreen";
import "../../v2/v2-theme.css";

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

  return <AuthLoadingScreen />;
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<AuthLoadingScreen />}>
      <GoogleRedirect />
    </Suspense>
  );
}
