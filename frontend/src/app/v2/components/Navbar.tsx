"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ClerkUserMenu from "../../components/ClerkUserMenu";
import { useCurrentUser } from "../../hooks/useCurrentUser";

const Navbar = () => {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
    router.refresh();
  };

  const renderAuthButton = () => {
    if (loading) {
      return (
        <div
          className="border px-5 py-2 rounded-md text-sm min-w-[5.5rem] flex items-center justify-center"
          style={{ borderColor: "hsl(var(--border))" }}
          aria-busy
        >
          <Loader2 className="h-4 w-4 animate-spin opacity-80" aria-hidden />
        </div>
      );
    }

    if (user?.authType === "clerk") {
      return <ClerkUserMenu />;
    }

    if (user?.authType === "local") {
      return (
        <button type="button" onClick={handleLogout} className="v2-btn-outline px-5 py-2 text-sm">
          Logout
        </button>
      );
    }

    return (
      <Link href="/login" className="v2-btn-outline px-5 py-2 text-sm inline-flex items-center">
        Login
      </Link>
    );
  };

  return (
    <nav className="v2-nav sticky top-0 w-full z-40 px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-sm font-semibold tracking-tight">
        JOBGENIE
      </Link>
      <div className="hidden md:flex gap-6 text-sm font-medium v2-text-muted">
        <Link href="/" className="v2-link transition-colors">
          Home
        </Link>
        <Link href="/explore-jobs" className="v2-link transition-colors">
          Find Jobs
        </Link>
        {!loading && user ? (
          <>
            <Link href="/upload" className="v2-link transition-colors">
              Upload Resume
            </Link>
            <Link href="/uploads" className="v2-link transition-colors">
              Dashboard
            </Link>
            <Link href="/observability" className="v2-link transition-colors">
              API trace
            </Link>
          </>
        ) : null}
      </div>
      {renderAuthButton()}
    </nav>
  );
};

export default Navbar;
