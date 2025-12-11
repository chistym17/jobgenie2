import React from "react";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

const AuthShell = ({ title, subtitle, children }: AuthShellProps) => {
  return (
    <div className="min-h-screen bg-brand text-brand flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="noise-bg" aria-hidden="true" />
      <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ backgroundColor: "var(--brand-primary)" }} aria-hidden="true" />
      <div className="absolute -right-32 bottom-0 w-96 h-96 rounded-full blur-3xl opacity-15 bg-brand-secondary" aria-hidden="true" />
      <div className="w-full max-w-md relative">
        <div className="glass-panel rounded-2xl shadow-2xl border border-brand p-8 md:p-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary-soft bg-brand-primary-soft text-brand-primary text-xs font-semibold uppercase tracking-wide">Jobgeniw</div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-4">{title}</h1>
            {subtitle ? <p className="text-brand-muted mt-2 text-sm md:text-base">{subtitle}</p> : null}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
