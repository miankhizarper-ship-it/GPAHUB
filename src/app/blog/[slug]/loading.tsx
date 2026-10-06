import { PageShell } from "@/components/layout/page-shell";

/**
 * Loading skeleton for the blog article page.
 */
export default function BlogPostLoading() {
  return (
    <PageShell title="Loading..." description="">
      <div className="mx-auto max-w-3xl animate-pulse" aria-hidden="true">
        <div className="h-4 w-32 rounded bg-surface" />
        <div className="mt-3 h-9 w-3/4 rounded bg-surface" />
        <div className="mt-3 h-5 w-full rounded bg-surface" />
        <div className="mt-8 h-64 w-full rounded-xl bg-surface" />
        <div className="mt-8 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 w-full rounded bg-surface" style={{ width: `${85 + Math.random() * 15}%` }} />
          ))}
        </div>
      </div>
      <span className="sr-only">Loading article...</span>
    </PageShell>
  );
}
