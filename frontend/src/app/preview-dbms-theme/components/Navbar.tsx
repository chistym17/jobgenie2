"use client";

import React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import ClerkUserMenu from "../../components/ClerkUserMenu";
import { useCurrentUser } from "../../hooks/useCurrentUser";

const Navbar = () => {
  const { user, loading } = useCurrentUser();

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
        <Link
          href="/login"
          className="dbms-btn-outline px-5 py-2 text-sm inline-flex items-center"
        >
          Login
        </Link>
      );
    }

    return (
      <Link href="/login" className="dbms-btn-outline px-5 py-2 text-sm inline-flex items-center">
        Login
      </Link>
    );
  };

  return (
    <nav
      className="sticky top-0 w-full z-40 px-6 py-4 flex justify-between items-center border-b"
      style={{
        background: "hsl(var(--background) / 0.95)",
        borderColor: "hsl(var(--border))",
        backdropFilter: "blur(8px)",
      }}
    >
      <Link href="/preview-dbms-theme" className="text-sm font-semibold tracking-tight">
        JOBGENIE
      </Link>
      <div className="hidden md:flex gap-6 text-sm font-medium dbms-text-muted">
        <Link href="/preview-dbms-theme" className="hover:text-[hsl(var(--foreground))] transition-colors">
          Home
        </Link>
        <Link href="/explore-jobs" className="hover:text-[hsl(var(--foreground))] transition-colors">
          Find Jobs
        </Link>
        {!loading && user ? (
          <>
            <Link href="/upload" className="hover:text-[hsl(var(--foreground))] transition-colors">
              Upload Resume
            </Link>
            <Link href="/uploads" className="hover:text-[hsl(var(--foreground))] transition-colors">
              Dashboard
            </Link>
          </>
        ) : null}
        <Link href="/" className="hover:text-[hsl(var(--foreground))] transition-colors">
          Current site
        </Link>
      </div>
      {renderAuthButton()}
    </nav>
  );
};

export default Navbar;
