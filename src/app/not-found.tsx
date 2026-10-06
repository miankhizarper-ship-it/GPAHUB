import Link from "next/link";
import { Home, Search } from "lucide-react";

/**
 * Custom 404 page — rendered when no route matches.
 *
 * Calm, on-brand, with useful navigation back to the main sections.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="max-w-md text-center">
        <Search className="mx-auto h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mt-2 text-lg font-medium text-foreground">Page not found</p>
        <p className="mt-1 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Go home
          </Link>
          <Link
            href="/universities"
            className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-surface"
          >
            Browse universities
          </Link>
          <Link
            href="/gpa-calculator"
            className="inline-flex h-10 items-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-surface"
          >
            GPA Calculator
          </Link>
        </div>
      </div>
    </div>
  );
}
