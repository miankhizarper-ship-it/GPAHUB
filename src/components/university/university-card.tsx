import * as React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, GraduationCap } from "lucide-react";
import type { University } from "@/types/university";
import { cn } from "@/lib/utils";

/**
 * University card for the public listing page.
 *
 * Server Component — renders a single university as a clickable card
 * with name, short name, city, type, max GPA, grade count, and links
 * to the detail page, GPA calculator, and CGPA calculator.
 */
export function UniversityCard({
  university,
  className,
}: {
  university: University;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-foreground">
            {university.name}
          </h3>
          <p className="mt-0.5 text-sm font-medium text-primary">
            {university.shortName}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
            university.type === "public"
              ? "bg-surface text-foreground"
              : "bg-accent text-accent-foreground",
          )}
        >
          {university.type === "public" ? "Public" : "Private"}
        </span>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" aria-hidden="true" />
        {university.city}
      </p>

      {/* Quick stats */}
      <dl className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3">
        <div>
          <dt className="text-xs text-muted-foreground">Max GPA</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
            {university.maxScale.toFixed(1)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Grades</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
            {university.scale.grades.length}
          </dd>
        </div>
        {university.passingCGPA !== undefined ? (
          <div>
            <dt className="text-xs text-muted-foreground">Pass</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums text-foreground">
              {university.passingCGPA.toFixed(1)}
            </dd>
          </div>
        ) : (
          <div>
            <dt className="text-xs text-muted-foreground">Pass</dt>
            <dd className="mt-0.5 text-sm font-semibold text-muted-foreground">—</dd>
          </div>
        )}
      </dl>

      <div className="mt-5 flex flex-wrap gap-2 pt-1">
        <Link
          href={`/universities/${university.slug}`}
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring"
        >
          View details
        </Link>
        <Link
          href={`/gpa-cal/${university.slug}`}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <GraduationCap className="h-4 w-4" aria-hidden="true" />
          GPA
        </Link>
        <Link
          href={`/cgpa-cal/${university.slug}`}
          className="inline-flex h-9 items-center justify-center gap-1 rounded-md bg-secondary px-3 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/85 focus-visible:ring-2 focus-visible:ring-ring"
        >
          CGPA
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </div>
    </li>
  );
}
