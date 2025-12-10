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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-primary-soft bg-brand-primary-soft text-brand-primary text-xs font-medium tracking-wide mb-8">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              AI-POWERED RECRUITING V2.0
            </div>

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
                <div className="flex justify-between items-center mb-8">
                  <div className="w-12 h-12 rounded-full bg-gray-700/50" />
                  <div className="h-2 w-20 bg-gray-700/50 rounded-full" />
                </div>

                <div className="space-y-4 mb-8">
                  <div className="h-8 w-3/4 bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-white/5 rounded" />
                  <div className="h-4 w-full bg-white/5 rounded" />
                </div>

                <div className="p-4 bg-brand-primary-soft rounded-xl border border-brand-primary-soft flex items-center gap-4">
                  <div className="bg-brand-primary p-2 rounded-full text-black">
                    <Zap size={20} fill="black" />
                  </div>
                  <div>
                    <div className="text-brand-primary font-bold text-lg">98% Compatible</div>
                    <div className="text-brand-primary text-xs opacity-70">Based on skills & culture</div>
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
