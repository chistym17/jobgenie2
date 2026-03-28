"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Briefcase, Link2, Sparkles } from "lucide-react";
import Navbar from "../../../components/v2/Navbar";
import { useSearchParams } from "next/navigation";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { useQuotaStatus } from "../../../hooks/useQuotaStatus";

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

type MatchCoachResult = {
  why_good_match: string[];
  improvements: string[];
};

function normalizeCoachBullets(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\n+/)
      .map((line) => line.replace(/^[-•*\d.)]+\s*/, "").trim())
      .filter(Boolean);
  }
  return [];
}

function CoachBulletList({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <ul className="mt-2 list-disc space-y-2 pl-5 text-brand-muted text-sm marker:text-brand-secondary">
      {items.map((line, i) => (
        <li key={i} className="leading-relaxed pl-0.5">
          {line}
        </li>
      ))}
    </ul>
  );
}

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
  const { user } = useCurrentUser();
  const userEmail = user?.email || null;
  const { quota, isLoading: isQuotaLoading, refetch: refetchQuota } = useQuotaStatus(userEmail);
  const uploadId = searchParams.get("upload_id");
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(!!uploadId);
  const workerBase = (process.env.NEXT_PUBLIC_WORKER_URL || "").replace(/\/$/, "");

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
  const [coachPanelOpen, setCoachPanelOpen] = useState(false);
  const [coachResult, setCoachResult] = useState<MatchCoachResult | null>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState("");
  const coachCacheRef = useRef<Record<string, MatchCoachResult>>({});

  useEffect(() => {
    if (!recommendations.length) return;
    if (!recommendations.some((r) => r.id === selectedId)) {
      setSelectedId(recommendations[0].id);
    }
  }, [recommendations, selectedId]);

  useEffect(() => {
    setPage(1);
  }, [uploadId]);

  useEffect(() => {
    if (!selected) {
      setCoachResult(null);
      setCoachError("");
      return;
    }
    const key = `${uploadId || "local"}:${selected.id}`;
    const cached = coachCacheRef.current[key];
    if (cached) {
      setCoachResult(cached);
      setCoachError("");
      return;
    }
    setCoachResult(null);
    setCoachError("");
  }, [selected, uploadId]);

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
      if (!cancelled) setIsLoadingRecommendations(true);

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
              setIsLoadingRecommendations(false);
            }
            return;
          }
        } catch {
        }
        localStorage.removeItem(storageKey);
      }

      const backendV2Base = (process.env.NEXT_PUBLIC_BACKEND_URL || "").replace("/api/v1", "/api/v2");
      if (!backendV2Base) {
        if (!cancelled) setIsLoadingRecommendations(false);
        return;
      }

      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

      try {
        for (let attempt = 0; attempt < 15; attempt++) {
          if (cancelled) return;
          const res = await fetch(`${backendV2Base}/recommendations/${uploadId}`);
          if (res.ok) {
            const data = await res.json();
            const jobs = Array.isArray(data?.recommendations) ? data.recommendations : [];
            const normalized = normalizeRecommendations(jobs);
            if (!cancelled) {
              setRecommendations(normalized);
              setSelectedId(normalized[0]?.id || "");
              setModalOpen(false);
              setIsLoadingRecommendations(false);
            }
            return;
          }
          if (res.status !== 404) {
            break;
          }
          await sleep(600 + attempt * 150);
        }
      } catch {
      }
      if (!cancelled) {
        setIsLoadingRecommendations(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [uploadId]);

  const coachPanelVisible =
    !!selected && !modalOpen && recommendations.length > 0 && coachPanelOpen;

  const closeJobDetailsModal = () => {
    setModalOpen(false);
    setCoachPanelOpen(true);
  };

  const handleExplainAndImprove = async () => {
    if (!selected || !uploadId) {
      setCoachError("Select a saved recommendation to use the coach.");
      return;
    }
    if (!workerBase) {
      setCoachError("Match coach service is unavailable.");
      return;
    }

    const key = `${uploadId}:${selected.id}`;
    const cached = coachCacheRef.current[key];
    if (cached) {
      setCoachResult(cached);
      setCoachError("");
      return;
    }

    setCoachLoading(true);
    setCoachError("");
    try {
      const res = await fetch(`${workerBase}/match-coach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          upload_id: uploadId,
          job: {
            job_id: selected.id,
            title: selected.jobTitle,
            company: selected.companyName,
            location: selected.location,
            job_type: selected.jobType,
            salary: selected.salary,
            match_score: selected.matchScore,
            key_requirements: selected.keyRequirementItems,
            description: selected.description,
          },
        }),
      });
      if (!res.ok) {
        const payload = await res
          .json()
          .catch(() => ({ detail: "Failed to load match coach response" }));
        throw new Error(payload.detail || "Failed to load match coach response");
      }
      const data = await res.json();
      const nextResult: MatchCoachResult = {
        why_good_match: normalizeCoachBullets(data?.why_good_match),
        improvements: normalizeCoachBullets(data?.improvements),
      };
      if (!nextResult.why_good_match.length || !nextResult.improvements.length) {
        throw new Error("Invalid coach response");
      }
      coachCacheRef.current[key] = nextResult;
      setCoachResult(nextResult);
      refetchQuota();
    } catch (err: any) {
      setCoachError(err.message || "Failed to load match coach response");
    } finally {
      setCoachLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text relative overflow-hidden">
      <div className="noise-bg" aria-hidden="true" />
      <Navbar />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative">
        <div
          className={`max-w-7xl mx-auto transition-[padding] duration-300 ease-out ${
            coachPanelVisible
              ? "lg:pr-[min(22rem,calc(100vw-2.5rem))] max-lg:pb-[min(32vh,14rem)]"
              : ""
          }`}
        >
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
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-2">
                  <Pill>
                    {isLoadingRecommendations ? "..." : `${recommendations.length} matches`}
                  </Pill>
                  <Pill>
                    <Briefcase size={14} />
                    Recommendations
                  </Pill>
                </div>
                {!!selected && recommendations.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCoachPanelOpen((open) => !open)}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border border-white/10 bg-white/[0.02] text-brand-muted hover:text-brand-ink hover:bg-brand-primary-soft transition-colors"
                  >
                    <Sparkles size={14} className="text-brand-primary" />
                    {coachPanelOpen ? "Hide match coach" : "Open match coach"}
                  </button>
                )}
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
                  </div>
                </div>

                <div className="space-y-3">
                  {isLoadingRecommendations ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <div
                        key={`skeleton-${idx}`}
                        className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="min-w-0 flex-1 space-y-2.5">
                            <div className="h-5 w-[70%] rounded-md bg-white/10 animate-pulse" />
                            <div className="h-4 w-[45%] rounded-md bg-white/[0.08] animate-pulse" />
                            <div className="h-4 w-[35%] rounded-md bg-white/[0.06] animate-pulse" />
                          </div>
                          <div className="h-10 w-28 rounded-xl bg-white/10 animate-pulse" />
                        </div>
                      </div>
                    ))
                  ) : !recommendations.length ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-brand-muted text-sm">
                      No recommendations found.
                    </div>
                  ) : (
                    paginated.map((rec) => {
                      const isSelected = rec.id === selected.id;
                      return (
                        <div
                          key={rec.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedId(rec.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedId(rec.id);
                            }
                          }}
                          className={`w-full text-left rounded-2xl border transition-all cursor-pointer ${
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
                                onClick={(e) => {
                                  e.stopPropagation();
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
                  onClick={closeJobDetailsModal}
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
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={closeJobDetailsModal}
                        className="px-3 py-2 rounded-xl text-sm font-medium border border-white/10 bg-white/[0.03] text-brand-muted hover:bg-white/[0.06] transition-colors"
                      >
                        Close
                      </button>
                    </div>
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
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-black hover:bg-white/90 transition-colors mt-1"
                        >
                          <Link2 size={16} />
                          Apply
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/10 text-brand-muted cursor-not-allowed mt-1"
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

        {coachPanelVisible && selected && (
          <aside className="fixed z-30 flex flex-col glass-panel shadow-2xl border-white/10 max-lg:inset-x-3 max-lg:bottom-3 max-lg:top-auto max-lg:max-h-[min(55vh,24rem)] max-lg:h-auto max-lg:border max-lg:rounded-3xl lg:right-6 lg:top-24 lg:h-[calc(100vh-8rem)] lg:w-full lg:max-w-sm lg:border lg:border-l lg:rounded-3xl">
            <div className="p-4 border-b border-white/10 flex items-start gap-3 shrink-0">
              <div className="h-9 w-9 rounded-2xl bg-brand-primary-soft border border-brand-primary-soft flex items-center justify-center">
                <Sparkles className="text-brand-primary" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-white font-semibold leading-tight">Match Coach</div>
                    <div className="text-brand-muted text-xs mt-0.5">
                      Feedback for the selected role and your resume
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCoachPanelOpen(false)}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-white/10 text-brand-muted hover:text-white hover:bg-white/10 transition-colors text-xs"
                    aria-label="Collapse match coach"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                <div className="text-xs uppercase tracking-wide text-brand-muted mb-1">
                  Selected role
                </div>
                <div className="text-sm font-semibold text-white truncate">
                  {selected.jobTitle}
                </div>
                <div className="text-xs text-brand-muted truncate mt-0.5">
                  {selected.companyName}
                  {selected.location ? ` • ${selected.location}` : ""}
                </div>
              </div>
              <p className="text-brand-muted text-sm leading-relaxed">
                Use match coach to understand why this role fits your profile and what to change
                in your resume or cover letter before you apply.
              </p>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-brand-muted uppercase tracking-wide">Coach quota</span>
                  <span className="text-white font-medium">
                    {isQuotaLoading ? "..." : `${quota?.coach_used ?? 0}/${quota?.coach_limit ?? 3}`}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExplainAndImprove}
                disabled={coachLoading || ((quota?.coach_used ?? 0) >= (quota?.coach_limit ?? 3))}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold border border-white/10 bg-brand-primary-soft text-brand-primary hover:bg-brand-primary hover:text-brand-ink transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {coachLoading ? "Analyzing..." : "Explain + Improve"}
              </button>
              {(quota?.coach_used ?? 0) >= (quota?.coach_limit ?? 3) && (
                <div className="text-xs text-amber-300">
                  Daily coach limit reached. Try again tomorrow.
                </div>
              )}
              {(coachLoading || coachError || coachResult) && (
                <AgentPanel
                  title="Insights"
                  subtitle="For this role and your resume"
                  icon={<Sparkles className="text-brand-primary" size={18} />}
                >
                  {coachLoading ? (
                    <div className="space-y-3">
                      <div className="h-4 w-5/6 rounded-md bg-white/10 animate-pulse" />
                      <div className="h-4 w-full rounded-md bg-white/[0.08] animate-pulse" />
                      <div className="h-4 w-4/5 rounded-md bg-white/[0.06] animate-pulse" />
                      <div className="h-px w-full bg-white/10 my-2" />
                      <div className="h-4 w-2/3 rounded-md bg-white/10 animate-pulse" />
                      <div className="h-4 w-full rounded-md bg-white/[0.08] animate-pulse" />
                    </div>
                  ) : coachError ? (
                    <div className="text-sm text-red-300">{coachError}</div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <div className="text-white/90 text-xs font-semibold tracking-wide uppercase">
                          Why this is a good match
                        </div>
                        <CoachBulletList items={coachResult?.why_good_match || []} />
                      </div>
                      <div>
                        <div className="text-white/90 text-xs font-semibold tracking-wide uppercase">
                          Improve your application
                        </div>
                        <CoachBulletList items={coachResult?.improvements || []} />
                      </div>
                    </div>
                  )}
                </AgentPanel>
              )}
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}

