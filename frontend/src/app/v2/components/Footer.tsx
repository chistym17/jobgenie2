import React from "react";

const Footer = () => {
  return (
    <footer className="v2-footer py-10 text-center">
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
        <p className="text-sm font-semibold tracking-wide mb-6">JOBGENIE</p>
        <div className="flex gap-6 text-sm v2-text-muted">
          <a href="#" className="v2-link transition-colors">
            Privacy
          </a>
          <a href="#" className="v2-link transition-colors">
            Terms
          </a>
          <a href="#" className="v2-link transition-colors">
            Twitter
          </a>
        </div>
        <p className="mt-6 text-xs v2-text-muted">
          © 2024 Jobgenie. Engineered for the modern era.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
