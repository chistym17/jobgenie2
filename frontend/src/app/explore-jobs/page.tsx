"use client";

import React, { useEffect, useMemo, useState } from "react";
import Navbar from "../components/v2/Navbar";
import { ArrowLeft, ArrowRight, ExternalLink, Search } from "lucide-react";

interface Job {
  id: string | number;
  title: string;
  company: string;
  source?: string;
  date?: string;
  url?: string;
}

const PAGE_SIZE = 9;

export default function ExploreJobs() {
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
    <div className="min-h-screen bg-brand text-brand">
      <Navbar />
      <div className="noise-bg" />
      <main className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <p className="text-sm text-brand-muted uppercase tracking-wide">Explore Jobs</p>
            <h1 className="text-4xl font-bold text-white mt-1">All opportunities</h1>
            <p className="text-brand-muted mt-2">Curated engineering roles updated daily.</p>
          </div>
          <div className="w-full md:w-80">
            <div className="relative">
              <Search className="h-4 w-4 text-brand-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search title, company, or source"
                className="w-full bg-[#0f141a] text-white rounded-lg pl-10 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-brand-primary placeholder:text-brand-muted/70"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="glass-panel p-6 rounded-2xl border border-white/10 animate-pulse h-44" />
            ))}
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : (
          <>
            {pagedJobs.length === 0 ? (
              <div className="glass-panel rounded-2xl border border-white/10 p-8 text-center text-brand-muted">
                No jobs found.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {pagedJobs.map((job) => (
                  <div key={job.id} className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-white truncate" title={job.title}>{job.title}</h3>
                        <p className="text-brand-muted text-sm truncate" title={job.company}>{job.company}</p>
                      </div>
                      {job.source ? (
                        <span className="shrink-0 text-xs bg-white/5 text-white px-3 py-1 rounded-full border border-white/10 leading-none">
                          {job.source}
                        </span>
                      ) : null}
                    </div>
                    {job.date ? <p className="text-xs text-gray-500">Posted {job.date}</p> : null}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-sm text-brand-muted">
                        {job.date ? `Posted ${job.date}` : ""}
                      </div>
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
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-10 gap-4 flex-wrap">
              <div className="text-brand-muted text-sm">
                Showing {pagedJobs.length} of {jobs.length} jobs
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg border border-white/10 text-sm flex items-center gap-1 ${
                    currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:border-brand-primary hover:text-white"
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" /> Prev
                </button>
                <div className="flex items-center gap-2 text-sm text-brand-muted">
                  Page {currentPage} / {totalPages}
                </div>
                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={`px-3 py-2 rounded-lg border border-white/10 text-sm flex items-center gap-1 ${
                    currentPage >= totalPages ? "opacity-50 cursor-not-allowed" : "hover:border-brand-primary hover:text-white"
                  }`}
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

