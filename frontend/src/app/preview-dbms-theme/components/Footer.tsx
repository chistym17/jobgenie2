import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer
      className="py-10 border-t text-center"
      style={{ borderColor: "hsl(var(--border))" }}
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col items-center">
        <p className="text-sm font-semibold tracking-wide mb-6">JOBGENIE</p>
        <div className="flex gap-6 text-sm dbms-text-muted">
          <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors">
            Terms
          </a>
          <a href="#" className="hover:text-[hsl(var(--foreground))] transition-colors">
            Twitter
          </a>
        </div>
        <p className="mt-6 text-xs dbms-text-muted">
          © 2024 Jobgenie. Engineered for the modern era.
        </p>
        <Link
          href="/"
          className="mt-4 text-xs dbms-text-muted hover:text-[hsl(var(--foreground))] transition-colors underline-offset-4 hover:underline"
        >
          Back to current homepage
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
