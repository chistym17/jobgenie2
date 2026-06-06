"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, ExternalLink, Search } from "lucide-react";
import Navbar from "./Navbar";

interface Job {
  id: string | number;
  title: string;
  company: string;
  source?: string;
  date?: string;
  url?: string;
}

const PAGE_SIZE = 9;

const JobCard = ({ job }: { job: Job }) => (
  <div className="v2-flat-card p-5 flex flex-col gap-3 h-full hover:border-[hsl(var(--foreground)/0.2)] transition-colors">
    <div className="flex justify-between items-start gap-3">
      <div className="min-w-0">
        <h3 className="text-base font-semibold truncate" title={job.title}>
          {job.title}
        </h3>
        <p className="v2-text-muted text-sm truncate" title={job.company}>
          {job.company}
        </p>
      </div>
      {job.source ? <span className="v2-badge shrink-0">{job.source}</span> : null}
    </div>
    {job.date ? <p className="text-xs v2-text-muted">Posted {job.date}</p> : null}
    <div className="flex items-center justify-between pt-2 mt-auto">
      <div className="text-sm v2-text-muted">{job.date ? `Posted ${job.date}` : ""}</div>
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

export default function ExploreJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");

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

  const totalPages = useMemo(() => Math.max(1, Math.ceil(jobs.length / PAGE_SIZE)), [jobs.length]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((j) =>
      [j.title, j.company, j.source].some((field) => field?.toLowerCase().includes(q))
    );
  }, [jobs, query]);
  const currentPage = Math.min(page, Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
  const pagedJobs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
  };

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide v2-text-muted">Explore Jobs</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">All opportunities</h1>
            <p className="v2-text-muted text-sm mt-2">Curated engineering roles updated daily.</p>
          </div>
          <div className="w-full md:w-80">
            <div className="relative">
              <Search className="h-4 w-4 v2-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search title, company, or source"
                className="v2-auth-input py-3 pl-10"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className="v2-flat-card p-5 animate-pulse h-44"
                style={{ background: "hsl(var(--muted))" }}
              />
            ))}
          </div>
        ) : error ? (
          <div className="v2-error text-sm">{error}</div>
        ) : (
          <>
            {pagedJobs.length === 0 ? (
              <div className="v2-flat-card p-8 text-center v2-text-muted">No jobs found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {pagedJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-10 gap-4 flex-wrap">
              <div className="v2-text-muted text-sm">
                Showing {pagedJobs.length} of {jobs.length} jobs
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`v2-btn-outline px-3 py-2 text-sm flex items-center gap-1 ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" /> Prev
                </button>
                <div className="text-sm v2-text-muted px-2">
                  Page {currentPage} / {totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={`v2-btn-outline px-3 py-2 text-sm flex items-center gap-1 ${
                    currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
