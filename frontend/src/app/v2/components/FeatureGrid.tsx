"use client";

import React from "react";
import { Cpu, Bell } from "lucide-react";

const FeatureGrid = () => {
  return (
    <section className="py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          <div className="flex flex-col gap-4 h-full">
            <div className="v2-flat-card p-6 md:p-8 h-full">
              <h3 className="text-xl font-semibold mb-3">Algorithmic Precision</h3>
              <p className="v2-text-muted text-sm max-w-md mb-6 leading-relaxed">
                We don&apos;t use keyword stuffing. Our vector database analyzes the semantic meaning
                of your experience to find jobs that actually fit your career trajectory.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="v2-sunken p-4 rounded-lg">
                  <div className="text-xl font-bold mb-1">0.2s</div>
                  <div className="text-xs v2-text-muted">Match Speed</div>
                </div>
                <div className="v2-sunken p-4 rounded-lg">
                  <div className="text-xl font-bold mb-1">10k+</div>
                  <div className="text-xs v2-text-muted">Active Roles</div>
                </div>
              </div>
            </div>

            <div className="v2-flat-card p-6 md:p-8 h-full">
              <div className="flex items-start gap-3 mb-5">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "hsl(var(--muted))" }}
                >
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Daily Job Updates</h3>
                  <p className="v2-text-muted text-sm leading-relaxed mt-1">
                    Fresh, deduped engineering roles delivered daily with your match score so you can
                    apply faster.
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm v2-text-muted">
                {[
                  "Curated remote & hybrid picks",
                  "Role, stack, and comp in one glance",
                  "Delivered when you start your day",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: "hsl(var(--foreground))" }}
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="v2-neumorphic-card p-6 md:p-8 flex flex-col justify-between h-full">
            <div>
              <div className="v2-btn-primary w-10 h-10 rounded-lg flex items-center justify-center mb-5">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI Agents on Your Side</h3>
              <p className="v2-text-muted text-sm leading-relaxed">
                Personalized agents highlight gaps, rewrite bullets, and explain fit for each role so
                you present the strongest application every time.
              </p>
            </div>
            <div
              className="mt-6 pt-5 border-t grid grid-cols-2 gap-2 text-sm"
              style={{ borderColor: "hsl(var(--border))" }}
            >
              {["Resume polish", "Fit explanations", "Skill gap tips", "Interview prep"].map((item) => (
                <span key={item} className="v2-sunken rounded-lg px-3 py-2 text-center v2-text-muted">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
