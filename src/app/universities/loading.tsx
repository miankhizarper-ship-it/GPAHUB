import { PageShell } from "@/components/layout/page-shell";

/**
 * Loading skeleton for the universities listing page.
 *
 * Shown while the Server Component fetches from MongoDB. Matches the
 * grid layout of the actual page so the transition is seamless.
 */
export default function UniversitiesLoading() {
  return (
    <PageShell title="Universities" description="Loading published universities...">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-border bg-card p-5"
          >
            <div className="h-5 w-3/4 rounded bg-surface" />
            <div className="mt-2 h-4 w-1/2 rounded bg-surface" />
            <div className="mt-4 h-4 w-1/3 rounded bg-surface" />
            <div className="mt-4 flex gap-2">
              <div className="h-9 w-20 rounded bg-surface" />
              <div className="h-9 w-24 rounded bg-surface" />
            </div>
          </div>
        ))}
      </div>
      <span className="sr-only">Loading universities...</span>
    </PageShell>
  );
}
