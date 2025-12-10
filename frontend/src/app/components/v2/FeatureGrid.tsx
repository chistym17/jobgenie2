'use client';

import React from "react";
import { motion } from "framer-motion";
import { Shield, Briefcase } from "lucide-react";

const FeatureGrid = () => {
  return (
    <section className="py-24 px-6 relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 glass-panel p-8 md:p-12 rounded-3xl relative overflow-hidden group"
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
            transition={{ delay: 0.1 }}
            className="md:row-span-2 glass-panel p-8 rounded-3xl flex flex-col justify-between border-t-4"
            style={{ borderTopColor: 'var(--brand-primary)' }}
          >
            <div>
              <div className="w-12 h-12 bg-brand-primary rounded-lg flex items-center justify-center mb-6">
                <Shield className="text-black" />
              </div>
              <h3 className="text-2xl font-medium mb-3 text-white">Anonymous Mode</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Browse matches without alerting your current employer. Your profile remains hidden until you approve a connection request.
              </p>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 text-sm text-gray-300">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Current Status: Invisible
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-8 rounded-3xl"
          >
            <Briefcase className="text-gray-400 mb-6" size={32} />
            <h3 className="text-xl font-medium mb-2 text-white">Salary Transparent</h3>
            <p className="text-gray-400 text-sm">We only show jobs with verified salary ranges matching your expectations.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
