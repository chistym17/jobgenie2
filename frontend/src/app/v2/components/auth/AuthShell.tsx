import React from "react";
import Link from "next/link";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="v2-auth-or" aria-hidden>
      <span>{label}</span>
    </div>
  );
}

const AuthShell = ({ title, subtitle, children }: AuthShellProps) => {
  return (
    <div className="v2-auth-page">
      <header className="v2-auth-topnav">
        <Link href="/" className="v2-auth-topnav-logo">
          JOBGENIE
        </Link>
        <Link href="/" className="v2-auth-topnav-link">
          Home
        </Link>
      </header>

      <div className="v2-auth-layout">
        <main className="v2-auth-main">
          <div className="v2-auth-form-wrap">
            <div className="v2-auth-form-header">
              <h1 className="v2-auth-title">{title}</h1>
              {subtitle ? <p className="v2-auth-subtitle">{subtitle}</p> : null}
            </div>
            {children}
          </div>
        </main>

        <aside className="v2-auth-brand">
          <div className="v2-auth-brand-inner">
            <Link href="/" className="v2-auth-logo">
              JOBGENIE
            </Link>
            <p className="v2-auth-eyebrow">AI-powered job matching</p>
            <h2 className="v2-auth-headline">
              Stop searching.
              <br />
              <span className="v2-text-gradient">Start matching.</span>
            </h2>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AuthShell;
