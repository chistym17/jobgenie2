"use client";

import React from "react";
import Link from "next/link";
import { Upload, Zap, CheckCircle } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative flex flex-col justify-center px-6 pt-16 pb-16 lg:pt-20 lg:pb-24">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          <p className="text-xs font-medium uppercase tracking-wide v2-text-muted mb-4">
            AI-powered job matching
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-6">
            Stop searching.
            <br />
            <span className="v2-text-gradient">Start matching.</span>
          </h1>

          <p className="text-base md:text-lg v2-text-muted max-w-lg leading-relaxed mb-8">
            Your resume isn&apos;t just a PDF. It&apos;s data. We decode your skills and match you with
            companies looking for exactly who you are, right now.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/upload"
              className="v2-btn-primary px-6 py-3 text-sm inline-flex items-center justify-center gap-2"
            >
              Upload Resume <Upload size={16} />
            </Link>
            <button type="button" className="v2-btn-outline px-6 py-3 text-sm font-medium">
              View Demo
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 hidden lg:block">
          <div className="v2-neumorphic-card p-6">
            <div className="flex justify-between items-start gap-4 mb-5">
              <div>
                <p className="text-xs font-medium v2-text-muted uppercase tracking-wide">
                  Featured match
                </p>
                <h3 className="text-lg font-semibold mt-1">Senior Software Engineer (Backend)</h3>
                <p className="v2-text-muted text-sm">Aurora Labs · Remote (US)</p>
              </div>
              <span className="v2-btn-primary px-3 py-1.5 text-xs font-semibold shrink-0">
                96% match
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="v2-badge">Full-time</span>
              <span className="v2-badge">$165k–$195k</span>
              <span className="v2-badge">EST-friendly</span>
            </div>

            <p className="v2-text-muted text-sm leading-relaxed mb-4">
              Help build event-driven data pipelines and APIs that serve millions of users. You&apos;ll
              own services from design to production and mentor teammates.
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              <span className="v2-badge">TypeScript</span>
              <span className="v2-badge">Node.js</span>
              <span className="v2-badge">Postgres</span>
              <span className="v2-badge">AWS</span>
            </div>

            <div className="v2-sunken p-4 rounded-lg flex items-center gap-3">
              <div className="v2-btn-primary p-2 rounded-full">
                <Zap size={18} />
              </div>
              <div>
                <div className="font-semibold text-sm">Great fit</div>
                <div className="v2-text-muted text-xs">
                  Your backend lead + cloud experience matches the stack
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 v2-flat-card px-4 py-3 flex items-center gap-3 w-fit ml-auto">
            <CheckCircle size={18} />
            <span className="text-sm font-medium">Interview Request</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
