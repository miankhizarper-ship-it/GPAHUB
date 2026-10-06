"use client";

import { PageShell } from "@/components/layout/page-shell";
import { AlertCircle } from "lucide-react";

/**
 * Error boundary for public content routes.
 *
 * Catches unexpected errors (database failures, render crashes) and
 * shows a calm, user-facing message instead of a stack trace. The
 * `reset` function lets the user retry.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageShell title="Something went wrong" description="An unexpected error occurred.">
      <div className="mx-auto max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <AlertCircle
          className="mx-auto h-10 w-10 text-destructive"
          aria-hidden="true"
        />
        <h2 className="mt-3 text-lg font-semibold text-foreground">
          We hit a snag
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Something went wrong on our end. Please try again — if the problem
          persists, the issue is likely temporary.
        </p>
        <button
          onClick={reset}
          className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </PageShell>
  );
}
