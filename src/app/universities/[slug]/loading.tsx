import { PageShell } from "@/components/layout/page-shell";

/**
 * Loading skeleton for the university detail page.
 */
export default function UniversityDetailLoading() {
  return (
    <PageShell title="Loading..." description="">
      <div className="animate-pulse" aria-hidden="true">
        {/* Title + stats */}
        <div className="h-8 w-3/4 rounded bg-surface" />
        <div className="mt-2 h-4 w-1/2 rounded bg-surface" />
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <div className="h-3 w-16 rounded bg-surface" />
              <div className="mt-2 h-6 w-12 rounded bg-surface" />
            </div>
          ))}
        </div>
        {/* Grading scale table */}
        <div className="mt-8 h-6 w-40 rounded bg-surface" />
        <div className="mt-3 rounded-lg border border-border bg-card">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-border p-3 last:border-0">
              <div className="h-4 w-10 rounded bg-surface" />
              <div className="h-4 w-16 rounded bg-surface" />
              <div className="h-4 w-20 rounded bg-surface" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">Loading university details...</span>
    </PageShell>
  );
}
