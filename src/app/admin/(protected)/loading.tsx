import * as React from "react";

/**
 * Admin loading skeleton — shown while any admin page loads.
 * Simple, branded, no layout shift.
 */
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-6" aria-hidden="true">
      <div className="animate-pulse">
        <div className="h-8 w-48 rounded bg-surface" />
        <div className="mt-2 h-4 w-72 rounded bg-surface" />
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border bg-card p-5">
            <div className="h-3 w-20 rounded bg-surface" />
            <div className="mt-2 h-8 w-12 rounded bg-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
