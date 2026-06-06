import React from "react";

function ShimmerBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-md animate-pulse ${className}`}
      style={{ background: "hsl(var(--muted))" }}
    />
  );
}

export function UploadHistorySkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading uploads">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="v2-flat-card flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <div
              className="h-10 w-10 rounded-full animate-pulse flex-shrink-0"
              style={{ background: "hsl(var(--muted))" }}
            />
            <div className="min-w-0 flex-1 space-y-2.5">
              <ShimmerBlock className="h-4 w-[min(280px,55%)]" />
              <ShimmerBlock className="h-3 w-36 opacity-70" />
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="h-8 w-[5.5rem] rounded-full animate-pulse" style={{ background: "hsl(var(--muted))" }} />
            <div className="h-9 w-[4.5rem] rounded-full animate-pulse hidden sm:block" style={{ background: "hsl(var(--muted))" }} />
            <div className="h-9 w-9 rounded-full animate-pulse" style={{ background: "hsl(var(--muted))" }} />
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
        <div key={i} className="relative flex gap-4 pb-10 last:pb-0">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full animate-pulse shrink-0" style={{ background: "hsl(var(--muted))" }} />
            {i < 4 && <div className="w-px flex-1 min-h-[2rem] mt-2" style={{ background: "hsl(var(--border))" }} />}
          </div>
          <div className="flex-1 pt-1 space-y-3 pb-2 border-b last:border-0" style={{ borderColor: "hsl(var(--border))" }}>
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
    <div className="v2-flat-card min-h-[320px] p-8 sm:p-10 flex flex-col items-center justify-center gap-6" role="status" aria-label="Loading recommendations">
      <div className="h-12 w-12 rounded-2xl animate-pulse" style={{ background: "hsl(var(--muted))" }} />
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
        <div className="h-3 w-24 rounded animate-pulse" style={{ background: "hsl(var(--muted))" }} />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full animate-pulse" style={{ background: "hsl(var(--muted))" }} />
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 w-28 rounded animate-pulse" style={{ background: "hsl(var(--muted))" }} />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="v2-sunken rounded-lg p-4 space-y-2">
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
    <div className="v2-shell min-h-screen">
      <div className="v2-nav sticky top-0 h-16 flex items-center px-6">
        <div className="h-6 w-28 rounded animate-pulse" style={{ background: "hsl(var(--muted))" }} />
      </div>
      <div className="flex pt-0">
        <aside className="v2-sidebar fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded-lg animate-pulse" style={{ background: "hsl(var(--muted))" }} />
          ))}
        </aside>
        <main className="flex-1 ml-64 pt-6 pb-10 px-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
              <div className="h-7 w-64 rounded-lg animate-pulse" style={{ background: "hsl(var(--muted))" }} />
              <div className="h-4 w-full max-w-xl rounded animate-pulse opacity-70" style={{ background: "hsl(var(--muted))" }} />
            </div>
            <div className="v2-neumorphic-card p-6 md:p-8">
              <UploadHistorySkeleton rows={5} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
