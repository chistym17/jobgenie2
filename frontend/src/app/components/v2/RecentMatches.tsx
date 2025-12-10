'use client';

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface JobCardProps {
  title: string;
  company: string;
  match: number;
  tags: string[];
  delay?: number;
}

const JobCard = ({ title, company, match, tags, delay }: JobCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="glass-panel p-6 rounded-2xl hover:border-brand-primary-soft transition-colors group cursor-pointer"
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-xl font-medium text-white mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{company}</p>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-brand-primary font-bold font-mono text-lg">{match}%</span>
        <span className="text-xs text-gray-500 uppercase tracking-wider">Match</span>
      </div>
    </div>
    <div className="flex flex-wrap gap-2 mt-4">
      {tags.map((tag, i) => (
        <span key={i} className="text-xs px-3 py-1 rounded-full border border-white/10 text-gray-300 group-hover:border-brand-primary-soft group-hover:text-brand-primary transition-colors">
          {tag}
        </span>
      ))}
    </div>
  </motion.div>
);

const RecentMatches = () => {
  const jobs: JobCardProps[] = [
    { title: "Senior Frontend Engineer", company: "Vercel", match: 96, tags: ["React", "Next.js", "Design Systems"] },
    { title: "Product Designer", company: "Linear", match: 92, tags: ["Figma", "UI/UX", "Prototyping"] },
    { title: "AI Research Scientist", company: "Anthropic", match: 89, tags: ["Python", "PyTorch", "LLMs"] },
  ];

  return (
    <section className="py-24 px-6 bg-[#0B0D10]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl text-white mb-4">Live Opportunities</h2>
            <p className="text-gray-500">Based on profiles similar to yours.</p>
          </div>
          <button className="text-brand-primary hover:text-white transition-colors flex items-center gap-2 mt-4 md:mt-0">
            View all jobs <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobs.map((job, idx) => (
            <JobCard key={idx} {...job} delay={idx * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentMatches;
