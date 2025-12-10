import React from "react";

const Footer = () => {
  return (
    <footer className="py-12 border-t border-white/10 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-[#0F1115] to-[#0F1115]" aria-hidden="true" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 flex flex-col items-center">
        <h2 className="text-[12vw] md:text-[8vw] leading-none font-bold text-[#181B21] select-none">
          JOBGENIW
        </h2>
        <div className="mt-8 flex gap-6 text-gray-500">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
        </div>
        <p className="mt-8 text-xs text-gray-600">
          © 2024 Jobgeniw. Engineered for the modern era.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
