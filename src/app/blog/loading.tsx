import { PageShell } from "@/components/layout/page-shell";

/**
 * Loading skeleton for the blog listing page.
 */
export default function BlogLoading() {
  return (
    <PageShell title="Blog" description="Loading articles...">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-xl border border-border bg-card p-5"
          >
            <div className="h-3 w-20 rounded bg-surface" />
            <div className="mt-3 h-5 w-3/4 rounded bg-surface" />
            <div className="mt-2 h-4 w-full rounded bg-surface" />
            <div className="mt-2 h-4 w-2/3 rounded bg-surface" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading blog posts...</span>
    </PageShell>
  );
}
