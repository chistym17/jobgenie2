'use client';

import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Upload, Zap, CheckCircle } from "lucide-react";

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);

  return (
    <section className="relative min-h-screen flex flex-col justify-center px-6 pt-24 pb-12 overflow-hidden">
      <div
        className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[180px] opacity-10"
        style={{ backgroundColor: 'var(--brand-primary)' }}
        aria-hidden="true"
      />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-slate-700 rounded-full blur-[140px] opacity-20" aria-hidden="true" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-6xl md:text-8xl font-semibold leading-[0.9] tracking-tighter mb-8 text-white">
              Stop searching.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[color:var(--brand-primary)] to-white/70">
                Start matching.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-lg leading-relaxed mb-10">
              Your resume isn't just a PDF. It's data. We decode your skills and match you with companies looking for exactly who you are, right now.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group relative px-8 py-4 btn-primary font-semibold text-lg overflow-hidden transition-all hover:pr-10">
                <span className="relative z-10 flex items-center gap-2">
                  Upload Resume <Upload size={18} />
                </span>
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>

              <button className="px-8 py-4 btn-ghost font-medium hover:bg-white/5 transition-all">
                View Demo
              </button>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-5 relative h-[500px] hidden lg:block">
          <motion.div style={{ y: y1 }} className="absolute inset-0">
            <div className="relative w-full h-full">
              <motion.div
                initial={{ rotate: 6, scale: 0.9, opacity: 0 }}
                animate={{ rotate: 6, scale: 0.9, opacity: 0.4 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="absolute top-10 left-10 w-full h-full bg-gray-800 rounded-3xl border border-white/5"
              />

              <motion.div
                initial={{ rotate: 0, scale: 1, opacity: 0, y: 50 }}
                animate={{ rotate: -3, scale: 1, opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
                className="absolute top-0 left-0 w-full bg-[#181B21] rounded-3xl border border-white/10 p-8 shadow-2xl accent-glow"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-xs font-semibold text-brand-secondary uppercase tracking-wide">Featured match</p>
                    <h3 className="text-2xl font-bold text-white mt-1">Senior Software Engineer (Backend)</h3>
                    <p className="text-brand-muted text-sm">Aurora Labs · Remote (US)</p>
                  </div>
                  <div className="bg-brand-primary-soft text-brand-primary px-4 py-2 rounded-lg text-sm font-semibold">96% match</div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs bg-white/5 text-white px-3 py-1 rounded-full border border-white/10">Full-time</span>
                  <span className="text-xs bg-white/5 text-white px-3 py-1 rounded-full border border-white/10">$165k–$195k</span>
                  <span className="text-xs bg-white/5 text-white px-3 py-1 rounded-full border border-white/10">EST-friendly</span>
                </div>

                <div className="text-brand-muted text-sm leading-relaxed mb-4">
                  Help build event-driven data pipelines and APIs that serve millions of users. You’ll own services from design to production and mentor teammates.
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs px-3 py-1 rounded-full border border-brand-primary-soft text-brand-primary bg-brand-primary-soft/40">TypeScript</span>
                  <span className="text-xs px-3 py-1 rounded-full border border-brand-primary-soft text-brand-primary bg-brand-primary-soft/40">Node.js</span>
                  <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-white">Postgres</span>
                  <span className="text-xs px-3 py-1 rounded-full border border-white/10 text-white">AWS</span>
                </div>

                <div className="p-4 bg-brand-primary-soft rounded-xl border border-brand-primary-soft flex items-center gap-4">
                  <div className="bg-brand-primary p-2 rounded-full text-black">
                    <Zap size={20} fill="black" />
                  </div>
                  <div>
                    <div className="text-brand-primary font-bold text-lg">Great fit</div>
                    <div className="text-brand-primary text-xs opacity-70">Your backend lead + cloud experience matches the stack</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                style={{ y: y2 }}
                className="absolute -right-12 top-1/2 glass-panel p-4 rounded-xl flex items-center gap-3"
              >
                <CheckCircle className="text-brand-primary" size={20} />
                <span className="text-sm font-medium">Interview Request</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
