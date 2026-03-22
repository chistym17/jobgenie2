"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";

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

  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a0f] text-[#E2E4E9]">
        <Loader2 className="h-10 w-10 animate-spin text-brand-primary" aria-hidden />
        <p className="text-sm text-[#E2E4E9]/70">Loading...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a0f] text-[#E2E4E9]">
        <Loader2 className="h-10 w-10 animate-spin text-brand-primary" aria-hidden />
        <p className="text-sm text-[#E2E4E9]/70">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#0a0a0f] text-[#E2E4E9]">
        <Loader2 className="h-10 w-10 animate-spin text-brand-primary" aria-hidden />
        <p className="text-sm text-[#E2E4E9]/70">Redirecting...</p>
      </div>
    );
  }

  return <>{children}</>;
}
