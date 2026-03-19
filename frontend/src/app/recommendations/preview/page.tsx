"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Briefcase, GraduationCap, Link2, MapPin, Sparkles, Star } from "lucide-react";
import Navbar from "../../../components/v2/Navbar";
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
  highlights: string[];
  requirements: string[];
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
    highlights: [
      "Strong component architecture and TypeScript proficiency",
      "Experience shipping user-facing performance improvements",
      "You match the “design-to-dev” workflow the team uses",
    ],
    requirements: [
      "5+ years building production React applications",
      "Deep TypeScript and state management",
      "Accessibility-first UI engineering",
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
    highlights: [
      "Your experience aligns with their API-first product approach",
      "You match ownership expectations across the stack",
      "Strong fit for reliability and observability practices",
    ],
    requirements: [
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
    highlights: [
      "Great match for experimentation and analytics-driven shipping",
      "Your performance background supports faster page experiences",
      "You align with rapid iteration culture",
    ],
    requirements: [
      "Experience with experimentation frameworks",
      "Strong UX + performance fundamentals",
      "Collaborative mindset with product and design",
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

  const selected = useMemo(() => {
    return recommendations.find((r) => r.id === selectedId) || recommendations[0];
  }, [recommendations, selectedId]);

  const [assistantOpen, setAssistantOpen] = useState(false);
  const [agentAction, setAgentAction] = useState<"fit" | "improve" | null>(null);

  useEffect(() => {
    if (!recommendations.length) return;
    if (!recommendations.some((r) => r.id === selectedId)) {
      setSelectedId(recommendations[0].id);
    }
  }, [recommendations, selectedId]);

  const agentResponse = useMemo(() => {
    if (!selected || !agentAction) return null;

    if (agentAction === "fit") {
      return {
        title: "Why it’s a strong match",
        lines: selected.highlights.slice(0, 3),
      };
    }

    return {
      title: "How to strengthen your application",
      lines: [
        `Add 1 bullet that quantifies your impact with ${selected.stack[0] || "your stack"}`,
        "Mirror 2–3 keywords from the job’s requirements into your experience section",
        "Prepare one story for a project where you owned the full delivery cycle",
      ],
    };
  }, [agentAction, selected]);

  const normalizeRecommendations = (raw: any[]): Recommendation[] => {
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

        const stackRaw = item["Stack"] ?? item.stack ?? item["Bonus Skills"] ?? [];
        const stack = Array.isArray(stackRaw) ? stackRaw.map((x: any) => String(x)) : [];

        const highlightsRaw =
          item["Key Requirements"] ??
          item["Bonus Skills"] ??
          item.highlights ??
          item["Highlights"] ??
          [];
        const highlights = Array.isArray(highlightsRaw) ? highlightsRaw.map((x: any) => String(x)) : [];

        const requirementsRaw =
          item.requirements ??
          item["Requirements"] ??
          item["Key Requirements"] ??
          highlights;
        const requirements = Array.isArray(requirementsRaw) ? requirementsRaw.map((x: any) => String(x)) : [];

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
          highlights,
          requirements,
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
              setAssistantOpen(false);
              setAgentAction(null);
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
          setAssistantOpen(false);
          setAgentAction(null);
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
                  Modern layout: pick a role to see a tailored fit summary and next steps.
                </p>
              </div>

              <div className="flex gap-2">
                <Pill>
                  <Star className="text-brand-secondary" size={14} />
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
            <section className={assistantOpen ? "lg:col-span-8 space-y-4" : "lg:col-span-12 space-y-4"}>
              <div className="glass-panel rounded-3xl border border-white/10 p-4 sm:p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-white">
                      Recommended roles
                    </h2>
                    <p className="text-brand-muted text-sm mt-1">
                      Click a card to open the assistant and see guidance.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {!recommendations.length ? (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-brand-muted text-sm">
                      Loading recommendations...
                    </div>
                  ) : (
                    recommendations.map((rec) => {
                      const isSelected = rec.id === selected.id;
                      return (
                        <button
                          key={rec.id}
                          type="button"
                          onClick={() => {
                            setSelectedId(rec.id);
                            setAssistantOpen(true);
                            setAgentAction("fit");
                          }}
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
                                </div>

                                <div className="flex-shrink-0">
                                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-brand-muted">
                                    <Star size={14} className="text-brand-secondary" />
                                    {rec.matchScore}% match
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-3">
                                <Pill className="bg-white/5 text-brand-muted border-white/10">
                                  <MapPin size={14} />
                                  {rec.location}
                                </Pill>
                                <Pill className="bg-white/5 text-brand-muted border-white/10">
                                  <Briefcase size={14} />
                                  {rec.jobType}
                                </Pill>
                                <Pill className="bg-white/5 text-brand-muted border-white/10">
                                  <GraduationCap size={14} />
                                  {rec.salary}
                                </Pill>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-3">
                                {rec.stack.slice(0, 4).map((s) => (
                                  <span
                                    key={s}
                                    className="px-3 py-1 rounded-full text-xs border border-white/10 bg-white/[0.03] text-brand-muted"
                                  >
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 justify-end">
                              {rec.directLink ? (
                                <a
                                  href={rec.directLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/5 border border-white/10 text-brand-text hover:bg-white/10 transition-colors"
                                >
                                  <Link2 size={16} />
                                  Apply
                                </a>
                              ) : (
                                <span className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm border border-white/10 bg-white/5 text-brand-muted">
                                  No link
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </section>

            {assistantOpen && (
              <aside className="lg:col-span-4 space-y-4">
                <div className="sticky top-24 space-y-4">
                  <AgentPanel
                    title="Genie Assistant"
                    subtitle="Pick a mode for this role"
                    icon={<Sparkles className="text-brand-primary" size={20} />}
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div>
                        <div className="text-white font-semibold">Selected role</div>
                        <div className="text-brand-muted text-sm mt-1">
                          {selected.jobTitle} · {selected.companyName}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAssistantOpen(false);
                          setAgentAction(null);
                        }}
                        className="px-3 py-2 rounded-xl text-sm font-medium border border-white/10 bg-white/[0.03] text-brand-muted hover:bg-white/[0.06] transition-colors"
                      >
                        Hide
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setAgentAction("fit")}
                        className={`flex-1 min-w-[140px] px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                          agentAction === "fit"
                            ? "border-brand-primary-soft bg-brand-primary-soft/15 text-white"
                            : "border-white/10 bg-white/[0.03] text-brand-muted hover:bg-white/[0.06]"
                        }`}
                      >
                        Explain why it fits
                      </button>
                      <button
                        type="button"
                        onClick={() => setAgentAction("improve")}
                        className={`flex-1 min-w-[140px] px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                          agentAction === "improve"
                            ? "border-brand-primary-soft bg-brand-primary-soft/15 text-white"
                            : "border-white/10 bg-white/[0.03] text-brand-muted hover:bg-white/[0.06]"
                        }`}
                      >
                        How to improve
                      </button>
                    </div>

                    {agentResponse ? (
                      <div className="mt-4">
                        <div className="text-white font-semibold">{agentResponse.title}</div>
                        <div className="mt-2 space-y-2">
                          {agentResponse.lines.map((line) => (
                            <div
                              key={line}
                              className="flex items-start gap-3 text-brand-muted text-sm"
                            >
                              <span className="mt-1 h-2 w-2 rounded-full bg-brand-secondary" />
                              <span>{line}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 text-brand-muted text-sm">
                        Select a mode to see guidance for this role.
                      </div>
                    )}
                  </AgentPanel>
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

