import React from "react";
import Link from "next/link";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const AuthShell = ({ title, subtitle, children }: AuthShellProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="v2-neumorphic-card p-8 md:p-10">
          <div className="text-center mb-8">
            <Link href="/" className="v2-badge inline-flex uppercase tracking-wide font-semibold">
              Jobgenie
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold mt-4">{title}</h1>
            {subtitle ? <p className="v2-text-muted mt-2 text-sm md:text-base">{subtitle}</p> : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
