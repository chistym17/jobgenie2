'use client';

import React from "react";
import { motion } from "framer-motion";
import { Shield, Cpu, Bell } from "lucide-react";

const FeatureGrid = () => {
  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <div className="flex flex-col gap-6 h-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden group h-full"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-gray-800 to-transparent opacity-20 rounded-bl-full" aria-hidden="true" />
              <h3 className="text-3xl font-medium mb-4 text-white">Algorithmic Precision</h3>
              <p className="text-gray-400 max-w-md mb-8">
                We don't use keyword stuffing. Our vector database analyzes the semantic meaning of your experience to find jobs that actually fit your career trajectory.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-brand-primary text-2xl font-bold mb-1">0.2s</div>
                  <div className="text-xs text-gray-500">Match Speed</div>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="text-white text-2xl font-bold mb-1">10k+</div>
                  <div className="text-xs text-gray-500">Active Roles</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 h-full"
            >
              <div className="flex items-start gap-3 mb-6">
                <div className="w-12 h-12 bg-brand-secondary rounded-lg flex items-center justify-center">
                  <Bell className="text-black" />
                </div>
                <div>
                  <h3 className="text-2xl font-medium text-white">Daily Job Updates</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Fresh, deduped engineering roles delivered daily with your match score so you can apply faster.
                  </p>
                </div>
              </div>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-primary" /> Curated remote & hybrid picks
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-primary" /> Role, stack, and comp in one glance
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-primary" /> Delivered when you start your day
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 md:p-12 rounded-3xl flex flex-col justify-between border border-white/10 h-full"
          >
            <div>
              <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center mb-6">
                <Cpu className="text-black" />
              </div>
              <h3 className="text-2xl font-medium mb-3 text-white">AI Agents on Your Side</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Personalized agents highlight gaps, rewrite bullets, and explain fit for each role so you present the strongest application every time.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 gap-3 text-sm text-gray-300">
              <span className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">Resume polish</span>
              <span className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">Fit explanations</span>
              <span className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">Skill gap tips</span>
              <span className="bg-white/5 rounded-lg px-3 py-2 border border-white/10">Interview prep</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
