import * as React from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { cn } from "@/lib/utils";

/**
 * Standard page shell for calculator + university pages.
 *
 * Wraps children in the sticky-header / sticky-footer layout pattern:
 * `min-h-screen flex flex-col` with `<SiteFooter>` carrying `mt-auto`.
 * Pages pass a `<PageHeader>` (title + description) and the main content.
 *
 * Server Component — no client interactivity.
 */
export function PageShell({
  title,
  description,
  children,
  className,
  headerActions,
}: {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className={cn("flex-1", className)}>
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              {description && (
                <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                  {description}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex shrink-0 flex-wrap gap-2">
                {headerActions}
              </div>
            )}
          </div>
          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
