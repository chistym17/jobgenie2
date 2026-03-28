"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCurrentUser } from "../../hooks/useCurrentUser";

const Navbar = () => {
  const { user, loading } = useCurrentUser();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="fixed top-0 w-full z-40 px-6 py-6 flex justify-between items-center mix-blend-difference text-[#E2E4E9]">
      <a href="/" className="text-xl font-semibold tracking-tight hover:text-brand-primary transition-colors">JOBGENIE</a>
      <div className="hidden md:flex gap-8 text-sm font-medium">
        <a href="/" className="hover:text-brand-primary transition-colors">Home</a>
        <a href="/explore-jobs" className="hover:text-brand-primary transition-colors">Find Jobs</a>
        {!loading && user ? (
          <>
            <a href="/upload" className="hover:text-brand-primary transition-colors">Upload Resume</a>
            <a href="/uploads" className="hover:text-brand-primary transition-colors">Dashboard</a>
            <a href="/observability" className="hover:text-brand-primary transition-colors">API trace</a>
          </>
        ) : null}
      </div>
      {loading ? (
        <div
          className="border border-[#E2E4E9]/30 px-5 py-2 rounded-full text-sm min-w-[5.5rem] flex items-center justify-center"
          aria-busy
        >
          <Loader2 className="h-4 w-4 animate-spin opacity-80" aria-hidden />
        </div>
      ) : user ? (
        <button
          type="button"
          onClick={handleLogout}
          className="border border-[#E2E4E9]/30 px-5 py-2 rounded-full text-sm hover:bg-[#E2E4E9] hover:text-black transition-all"
        >
          Logout
        </button>
      ) : (
        <a
          href="/login"
          className="border border-[#E2E4E9]/30 px-5 py-2 rounded-full text-sm hover:bg-[#E2E4E9] hover:text-black transition-all"
        >
          Login
        </a>
      )}
    </nav>
  );
};

export default Navbar;
