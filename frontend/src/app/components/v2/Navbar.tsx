import React from "react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-40 px-6 py-6 flex justify-between items-center mix-blend-difference text-[#E2E4E9]">
      <div className="text-xl font-semibold tracking-tight">JOBGENIW</div>
      <div className="hidden md:flex gap-8 text-sm font-medium">
        <a href="#" className="hover:text-brand-primary transition-colors">Find Jobs</a>
        <a href="#" className="hover:text-brand-primary transition-colors">For Companies</a>
        <a href="#" className="hover:text-brand-primary transition-colors">Pricing</a>
      </div>
      <button className="border border-[#E2E4E9]/30 px-5 py-2 rounded-full text-sm hover:bg-[#E2E4E9] hover:text-black transition-all">
        Login
      </button>
    </nav>
  );
};

export default Navbar;
