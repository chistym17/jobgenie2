"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";

interface Job {
  id: string | number;
  title: string;
  company: string;
  source?: string;
  date?: string;
  url?: string;
}

const JobCard = ({ job, delay }: { job: Job; delay?: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
    className="glass-panel p-6 rounded-2xl hover:border-brand-primary-soft transition-colors group cursor-pointer h-full flex flex-col"
  >
    <div className="flex justify-between items-start gap-3 mb-3">
      <div className="min-w-0">
        <h3 className="text-xl font-medium text-white mb-1 truncate" title={job.title}>{job.title}</h3>
        <p className="text-gray-400 text-sm truncate" title={job.company}>{job.company}</p>
      </div>
      {job.source ? (
        <span className="shrink-0 text-xs bg-white/5 text-white px-3 py-1 rounded-full border border-white/10 leading-none">
          {job.source}
        </span>
      ) : null}
    </div>
    {job.date ? <p className="text-xs text-gray-500 mb-4">Posted {job.date}</p> : <div className="mb-4" />}
    <div className="mt-auto flex items-center justify-between pt-2">
      <div className="text-sm text-brand-muted">{job.date ? `Posted ${job.date}` : ""}</div>
      {job.url ? (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-brand-primary text-sm hover:opacity-80"
        >
          View <ExternalLink className="h-4 w-4" />
        </a>
      ) : null}
    </div>
  </motion.div>
);

const RecentMatches = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/jobs`);
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(data || []);
      } catch (err: any) {
        setError(err.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const visible = jobs.slice(0, 9);

  return (
    <section className="py-24 px-6 bg-[#0B0D10]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl text-white mb-4">Live Opportunities</h2>
            <p className="text-gray-500">Based on the latest curated feed.</p>
          </div>
          <a
            href="/explore-jobs"
            className="text-brand-primary hover:text-white transition-colors flex items-center gap-2 mt-4 md:mt-0"
          >
            View all jobs <ArrowRight size={16} />
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl border border-white/10 animate-pulse h-40" />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visible.map((job, idx) => (
              <JobCard key={job.id || idx} job={job} delay={idx * 0.05} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentMatches;
