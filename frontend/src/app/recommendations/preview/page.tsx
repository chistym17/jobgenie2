"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Briefcase, Link2, Sparkles } from "lucide-react";
import Navbar from "../../components/v2/Navbar";
import { useSearchParams } from "next/navigation";

type Recommendation = {
  id: string;
  jobTitle: string;
  companyName: string;
  location: string;
  jobType: string;
  salary: string;
  matchScore: number;
  directLink?: string;
  stack: string[];
  description: string;
  keyRequirements: string;
  keyRequirementItems: string[];
};

const fallbackRecommendations: Recommendation[] = [
  {
    id: "rec-1",
    jobTitle: "Senior Frontend Engineer",
    companyName: "Aurora Labs",
    location: "Remote (US)",
    jobType: "Full-time",
    salary: "$165k–$195k",
    matchScore: 96,
    directLink: "https://example.com/apply-aurora",
    stack: ["React", "TypeScript", "Next.js", "Design Systems"],
    description:
      "Partner directly with clients to understand business objectives, translate ambiguous problems into technical requirements, and deliver production-ready AI and data workflows end to end.",
    keyRequirements:
      "Strong component architecture and TypeScript proficiency, Experience shipping user-facing performance improvements, “design-to-dev” workflow collaboration",
    keyRequirementItems: [
      "Strong component architecture and TypeScript proficiency",
      "Experience shipping user-facing performance improvements",
      "“design-to-dev” workflow collaboration",
    ],
  },
  {
    id: "rec-2",
    jobTitle: "Software Engineer (Full-Stack)",
    companyName: "Nebula Commerce",
    location: "New York, NY",
    jobType: "Hybrid",
    salary: "$145k–$175k",
    matchScore: 91,
    directLink: "https://example.com/apply-nebula",
    stack: ["Node.js", "Postgres", "React", "API Design"],
    description:
      "Design and build secure, scalable REST APIs, work across the stack with React and Node.js, and improve reliability through observability and continuous delivery.",
    keyRequirements:
      "API design and database modeling experience, React + Node.js in production, Ability to debug distributed issues",
    keyRequirementItems: [
      "API design and database modeling experience",
      "React + Node.js in production",
      "Ability to debug distributed issues",
    ],
  },
  {
    id: "rec-3",
    jobTitle: "Frontend Engineer, Growth",
    companyName: "Solstice Health",
    location: "Austin, TX",
    jobType: "On-site",
    salary: "$130k–$160k",
    matchScore: 87,
    directLink: "https://example.com/apply-solstice",
    stack: ["A/B Testing", "React", "Analytics", "Performance"],
    description:
      "Build and iterate on experimentation-driven features, improve UX performance, and ship analytics-based improvements with fast feedback loops.",
    keyRequirements:
      "Experience with experimentation frameworks, Strong UX + performance fundamentals, Collaborative product/design mindset",
    keyRequirementItems: [
      "Experience with experimentation frameworks",
      "Strong UX + performance fundamentals",
      "Collaborative product/design mindset",
    ],
  },
];

function AgentPanel(props: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden">
      <div className="p-5 flex items-start gap-3 border-b border-white/10">
        <div className="h-10 w-10 rounded-2xl bg-brand-primary-soft border border-brand-primary-soft flex items-center justify-center">
          {props.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold leading-tight">{props.title}</div>
          <div className="text-brand-muted text-sm mt-0.5">{props.subtitle}</div>
        </div>
      </div>
      <div className="p-5">{props.children}</div>
    </div>
  );
}

function Pill(props: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-brand-muted ${props.className || ""}`}
    >
      {props.children}
    </span>
  );
}

export default function RecommendationsPreviewPage() {
  const searchParams = useSearchParams();
  const uploadId = searchParams.get("upload_id");

  const [recommendations, setRecommendations] = useState<Recommendation[]>(
    uploadId ? [] : fallbackRecommendations
  );
  const [selectedId, setSelectedId] = useState<string>(
    uploadId ? "" : fallbackRecommendations[0]?.id || ""
  );
  const JOBS_PER_PAGE = 3;
  const [page, setPage] = useState(1);

  const selected = useMemo(() => {
    return recommendations.find((r) => r.id === selectedId) || recommendations[0];
  }, [recommendations, selectedId]);

  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (!recommendations.length) return;
    if (!recommendations.some((r) => r.id === selectedId)) {
      setSelectedId(recommendations[0].id);
    }
  }, [recommendations, selectedId]);

  useEffect(() => {
    setPage(1);
  }, [uploadId]);

  const totalPages = Math.max(
    1,
    Math.ceil((recommendations?.length || 0) / JOBS_PER_PAGE)
  );

  const paginated = useMemo(() => {
    const start = (page - 1) * JOBS_PER_PAGE;
    return recommendations.slice(start, start + JOBS_PER_PAGE);
  }, [recommendations, page]);

  const normalizeRecommendations = (raw: any[]): Recommendation[] => {
    const splitKeyRequirements = (text: string): string[] => {
      const t = (text || "").trim();
      if (!t) return [];
      const parts = t
        .split(/[\n;]/g)
        .flatMap((x) => x.split(","))
        .map((x) => x.trim())
        .filter(Boolean);
      return parts.slice(0, 10);
    };

    const normalizeStack = (stackRaw: any): string[] => {
      if (!stackRaw) return [];
      if (Array.isArray(stackRaw)) return stackRaw.map((x) => String(x)).filter(Boolean);
      if (typeof stackRaw === "string") {
        const t = stackRaw.trim();
        if (!t) return [];
        return t
          .split(/[,/|]/g)
          .map((x) => x.trim())
          .filter(Boolean)
          .slice(0, 10);
      }
      return [];
    };

    return raw
      .filter(Boolean)
      .map((item, idx) => {
        const jobTitle = item["Job Title"] ?? item.jobTitle ?? "";
        const companyName = item["Company Name"] ?? item.companyName ?? "";
        const location = item["Location"] ?? item.location ?? "";
        const jobType = item["Job Type"] ?? item.jobType ?? "";
        const salary = item["Salary"] ?? item.salary ?? "";
        const matchScoreRaw = item["Match Score"] ?? item.matchScore ?? 0;
        const matchScore =
          typeof matchScoreRaw === "number"
            ? matchScoreRaw
            : Number.isFinite(Number(matchScoreRaw))
              ? Number(matchScoreRaw)
              : 0;

        const directLink = item["Direct Link"] ?? item.directLink ?? undefined;

        const stack = normalizeStack(
          item["Stack"] ?? item.stack ?? item["Bonus Skills"] ?? ""
        );

        const description = item["Description"] ?? item.description ?? "";
        const keyRequirements =
          item["Key Requirements"] ?? item.keyRequirements ?? "";
        const keyRequirementItems = splitKeyRequirements(String(keyRequirements));

        return {
          id: item.id ?? item._id ?? `rec-${idx}`,
          jobTitle: String(jobTitle),
          companyName: String(companyName),
          location: String(location),
          jobType: String(jobType),
          salary: String(salary),
          matchScore,
          directLink: directLink ? String(directLink) : undefined,
          stack,
          description: String(description || ""),
          keyRequirements: String(keyRequirements || ""),
          keyRequirementItems,
        };
      });
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (typeof window === "undefined") return;
      if (!uploadId) return;

      const storageKey = `recommendations_preview_jobs_${uploadId}`;
      const redirected = localStorage.getItem(storageKey);
      if (redirected) {
        try {
          const parsed = JSON.parse(redirected);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const normalized = normalizeRecommendations(parsed);
            if (!cancelled) {
              setRecommendations(normalized);
              setSelectedId(normalized[0]?.id || "");
              setModalOpen(false);
            }
            return;
          }
        } catch {
        }
        localStorage.removeItem(storageKey);
      }

      const backendV2Base = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace("/api/v1", "/api/v2");
      if (!backendV2Base) return;

      try {
        const res = await fetch(`${backendV2Base}/recommendations/${uploadId}`);
        if (!res.ok) return;
        const data = await res.json();
        const jobs = Array.isArray(data?.recommendations) ? data.recommendations : [];
        const normalized = normalizeRecommendations(jobs);
        if (!cancelled) {
          setRecommendations(normalized);
          setSelectedId(normalized[0]?.id || "");
          setModalOpen(false);
        }
      } catch {
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [uploadId]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text relative overflow-hidden">
      <div className="noise-bg" aria-hidden="true" />
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="mb-8">
            <div className="flex items-start justify-between gap-4 flex-col md:flex-row md:items-end">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-brand-primary-soft border border-brand-primary-soft flex items-center justify-center">
                    <Sparkles className="text-brand-primary" size={20} />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-semibold text-white">
                    Your Recommendations
                  </h1>
                </div>
                <p className="text-brand-muted mt-3 max-w-2xl">
                  pick a role to see a tailored fit summary and next steps.
                </p>
              </div>

              <div className="flex gap-2">
                <Pill>
                  {uploadId ? (recommendations.length ? `${recommendations.length} matches` : "Loading") : `${recommendations.length} matches`}
                </Pill>
                <Pill>
                  <Briefcase size={14} />
                  Updated just now
                </Pill>
              </div>
            </div>
          </header>

          <div className="grid lg:grid-cols-12 gap-6 items-start">
            <section className="lg:col-span-12 space-y-4">
              <div className="glass-panel rounded-3xl border border-white/10 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-white">
                      Recommended roles
                    </h2>
                    <p className="text-brand-muted text-sm mt-1">
                      Use "See details" to view the full description and guidance.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {!recommendations.length ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-brand-muted text-sm">
                      Loading recommendations...
                    </div>
                  ) : (
                    paginated.map((rec) => {
                      const isSelected = rec.id === selected.id;
                      return (
                        <div
                          key={rec.id}
                          className={`w-full text-left rounded-2xl border transition-all ${
                            isSelected
                              ? "border-brand-primary-soft bg-brand-primary-soft/10"
                              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-white font-semibold truncate">
                                    {rec.jobTitle}
                                  </div>
                                  <div className="text-brand-muted text-sm mt-1 truncate">
                                    {rec.companyName}
                                  </div>
                                  {rec.location && (
                                    <div className="text-brand-muted text-sm mt-1 truncate">
                                      {rec.location}
                                    </div>
                                  )}
                                </div>
                              </div>

                              
                            </div>

                            <div className="flex items-center gap-2 justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedId(rec.id);
                                  setModalOpen(true);
                                }}
                                className="px-4 py-2 rounded-xl text-sm font-semibold bg-white text-black hover:bg-white/90 transition-colors"
                              >
                                See details
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {recommendations.length > JOBS_PER_PAGE && (
                  <div className="flex items-center justify-between gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 rounded-xl text-sm font-medium border border-white/10 bg-white/[0.02] text-brand-muted hover:bg-white/[0.04] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <div className="text-xs text-brand-muted">
                      Page {page} of {totalPages}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 rounded-xl text-sm font-medium border border-white/10 bg-white/[0.02] text-brand-muted hover:bg-white/[0.04] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </section>

            {modalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                  className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                  onClick={() => {
                    setModalOpen(false);
                  }}
                />
                <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-white/10 overflow-hidden">
                  <div className="p-6 border-b border-white/10 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-white font-semibold text-xl truncate">
                        {selected.jobTitle}
                      </div>
                      <div className="text-brand-muted text-sm mt-1 truncate">
                        {selected.companyName}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setModalOpen(false);
                      }}
                      className="px-3 py-2 rounded-xl text-sm font-medium border border-white/10 bg-white/[0.03] text-brand-muted hover:bg-white/[0.06] transition-colors"
                    >
                      Close
                    </button>
                  </div>

                  <div className="p-6 overflow-y-auto max-h-[80vh] space-y-5">
                    <div>
                      <div className="text-white/90 text-xs font-semibold tracking-wide uppercase">
                        Key requirements
                      </div>
                      {selected.keyRequirementItems.length ? (
                        <div className="mt-2 space-y-2">
                          {selected.keyRequirementItems.slice(0, 8).map((line) => (
                            <div
                              key={line}
                              className="flex items-start gap-3 text-brand-muted text-sm"
                            >
                              <span className="mt-2 h-2 w-2 rounded-full bg-brand-secondary" />
                              <span>{line}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 text-brand-muted text-sm">
                          No key requirements available.
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-white/90 text-xs font-semibold tracking-wide uppercase">
                        Description
                      </div>
                      <div className="mt-2 text-brand-muted text-sm leading-relaxed whitespace-pre-line">
                        {selected.description}
                      </div>
                    </div>

                    <div>
                      {selected.directLink ? (
                        <a
                          href={selected.directLink}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-base font-semibold bg-white text-black hover:bg-white/90 transition-colors mt-1"
                        >
                          <Link2 size={18} />
                          Apply
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full px-6 py-4 rounded-2xl text-base font-semibold bg-white/10 text-brand-muted cursor-not-allowed mt-1"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

