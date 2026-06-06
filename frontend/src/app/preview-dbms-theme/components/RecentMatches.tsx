"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

interface Job {
  id: string | number;
  title: string;
  company: string;
  source?: string;
  date?: string;
  url?: string;
}

const JobCard = ({ job }: { job: Job }) => (
  <div className="dbms-flat-card p-5 hover:border-[hsl(var(--foreground)/0.2)] transition-colors h-full flex flex-col">
    <div className="flex justify-between items-start gap-3 mb-3">
      <div className="min-w-0">
        <h3 className="text-base font-medium mb-1 truncate" title={job.title}>
          {job.title}
        </h3>
        <p className="dbms-text-muted text-sm truncate" title={job.company}>
          {job.company}
        </p>
      </div>
      {job.source ? <span className="dbms-badge shrink-0">{job.source}</span> : null}
    </div>
    {job.date ? <p className="text-xs dbms-text-muted mb-4">Posted {job.date}</p> : <div className="mb-4" />}
    <div className="mt-auto flex items-center justify-between pt-2">
      <div className="text-sm dbms-text-muted">{job.date ? `Posted ${job.date}` : ""}</div>
      {job.url ? (
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium hover:opacity-80 transition-opacity"
        >
          View <ExternalLink className="h-4 w-4" />
        </a>
      ) : null}
    </div>
  </div>
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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load jobs";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const visible = jobs.slice(0, 9);

  return (
    <section
      className="py-16 px-6 border-t"
      style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Live Opportunities</h2>
            <p className="dbms-text-muted text-sm">Based on the latest curated feed.</p>
          </div>
          <Link
            href="/explore-jobs"
            className="text-sm font-medium inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            View all jobs <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="dbms-flat-card p-5 animate-pulse h-36"
                style={{ background: "hsl(var(--muted))" }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-sm" style={{ color: "hsl(0 70% 60%)" }}>
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {visible.map((job, idx) => (
              <JobCard key={job.id || idx} job={job} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentMatches;
