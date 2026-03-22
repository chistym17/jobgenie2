import React from "react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-40 px-6 py-6 flex justify-between items-center mix-blend-difference text-[#E2E4E9]">
      <a href="/" className="text-xl font-semibold tracking-tight hover:text-brand-primary transition-colors">JOBGENIE</a>
      <div className="hidden md:flex gap-8 text-sm font-medium">
        <a href="/" className="hover:text-brand-primary transition-colors">Home</a>
        <a href="/explore-jobs" className="hover:text-brand-primary transition-colors">Find Jobs</a>
        <a href="/upload" className="hover:text-brand-primary transition-colors">Upload Resume</a>
        <a href="/uploads" className="hover:text-brand-primary transition-colors">Dashboard</a>
      </div>
      <a
        href="/login"
        className="border border-[#E2E4E9]/30 px-5 py-2 rounded-full text-sm hover:bg-[#E2E4E9] hover:text-black transition-all"
      >
        Login
      </a>
    </nav>
  );
};

export default Navbar;
