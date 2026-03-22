import React from "react";

function ShimmerBlock({ className = "" }: { className?: string }) {
  return <div className={`rounded-md bg-white/10 animate-pulse ${className}`} />;
}

export function UploadHistorySkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading uploads">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4 border border-white/5 bg-white/[0.02]"
        >
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse flex-shrink-0" />
            <div className="min-w-0 flex-1 space-y-2.5">
              <ShimmerBlock className="h-4 w-[min(280px,55%)]" />
              <ShimmerBlock className="h-3 w-36 opacity-70" />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="h-8 w-[5.5rem] rounded-full bg-white/10 animate-pulse" />
            <div className="h-9 w-[4.5rem] rounded-full bg-white/10 animate-pulse hidden sm:block" />
            <div className="h-9 w-9 rounded-full bg-white/10 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityTimelineSkeleton() {
  return (
    <div className="space-y-0 min-h-[300px]" role="status" aria-label="Loading activity">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="relative flex gap-4 pb-10 last:pb-0"
        >
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full bg-white/10 animate-pulse shrink-0" />
            {i < 4 && (
              <div className="w-px flex-1 min-h-[2rem] bg-white/10 mt-2" />
            )}
          </div>
          <div className="flex-1 pt-1 space-y-3 pb-2 border-b border-white/[0.06] last:border-0">
            <ShimmerBlock className="h-3 w-32" />
            <ShimmerBlock className="h-4 w-full max-w-md" />
            <ShimmerBlock className="h-3 w-24 opacity-60" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RecommendationsTabSkeleton() {
  return (
    <div className="min-h-[320px] rounded-2xl border border-white/10 bg-white/[0.02] p-8 sm:p-10 flex flex-col items-center justify-center gap-6" role="status" aria-label="Loading recommendations">
      <div className="h-12 w-12 rounded-2xl bg-white/10 animate-pulse" />
      <div className="w-full max-w-md space-y-3">
        <ShimmerBlock className="h-4 w-[75%] mx-auto max-w-sm" />
        <ShimmerBlock className="h-3 w-[50%] mx-auto max-w-xs opacity-80" />
      </div>
      <div className="flex gap-2 w-full max-w-sm justify-center">
        <ShimmerBlock className="h-10 w-36 rounded-full" />
        <ShimmerBlock className="h-10 w-28 rounded-full opacity-60" />
      </div>
    </div>
  );
}

export function ResumeDetailModalSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-label="Loading resume detail">
      <div className="space-y-2">
        <div className="h-3 w-24 rounded bg-white/10 animate-pulse" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-white/10 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 w-28 rounded bg-white/10 animate-pulse" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="border border-white/10 rounded-2xl p-4 space-y-2 bg-white/[0.02]"
          >
            <ShimmerBlock className="h-4 w-[85%]" />
            <ShimmerBlock className="h-3 w-[55%] opacity-80" />
            <ShimmerBlock className="h-12 w-full opacity-50" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardRouteLoading() {
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text relative overflow-hidden">
      <div className="noise-bg" aria-hidden />
      <div className="fixed top-0 left-0 right-0 h-16 z-40 flex items-center px-6 border-b border-white/5 bg-[#0f1115]/80 backdrop-blur-md">
        <div className="h-7 w-32 rounded-md bg-white/10 animate-pulse" />
        <div className="ml-auto flex gap-3">
          <div className="h-9 w-24 rounded-full bg-white/10 animate-pulse hidden sm:block" />
          <div className="h-9 w-24 rounded-full bg-white/10 animate-pulse hidden sm:block" />
          <div className="h-9 w-28 rounded-full bg-white/10 animate-pulse" />
        </div>
      </div>
      <div className="flex pt-16">
        <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 glass-panel border-r border-white/10 z-30 p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-12 w-full rounded-xl bg-white/[0.06] animate-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </aside>
        <main className="flex-1 ml-64 pt-6 pb-10 px-6 lg:px-10">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
              <div className="h-8 w-64 rounded-lg bg-white/10 animate-pulse" />
              <div className="h-4 w-full max-w-xl rounded bg-white/[0.06] animate-pulse" />
            </div>
            <div className="glass-panel rounded-3xl border border-white/10 p-6 md:p-8">
              <div className="flex justify-between items-start mb-8 gap-4">
                <div className="space-y-2 flex-1">
                  <div className="h-7 w-48 rounded bg-white/10 animate-pulse" />
                  <div className="h-4 w-full max-w-sm rounded bg-white/[0.06] animate-pulse" />
                </div>
                <div className="h-4 w-16 rounded bg-white/10 animate-pulse shrink-0" />
              </div>
              <div className="border-t border-white/10 pt-6">
                <UploadHistorySkeleton rows={5} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
