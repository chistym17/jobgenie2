"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../hooks/useCurrentUser";
import AuthLoadingScreen from "../v2/components/auth/AuthLoadingScreen";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (user) return;
    const full =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/";
    router.replace(`/login?next=${encodeURIComponent(full)}`);
  }, [mounted, user, loading, router]);

  if (!mounted || loading) {
    return <AuthLoadingScreen message="Loading..." />;
  }

  if (!user) {
    return <AuthLoadingScreen message="Redirecting..." />;
  }

  return <>{children}</>;
}
