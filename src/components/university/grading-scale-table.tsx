import * as React from "react";

import type { UniversityGradingScale } from "@/types/university";
import { cn } from "@/lib/utils";

/**
 * Responsive grading-scale table.
 *
 * Renders a university's grade table with three columns: Grade, Grade
 * Points, and Percentage Range. The percentage column is only rendered
 * when at least one grade row has `minPercent`/`maxPercent` data —
 * missing ranges are never fabricated.
 *
 * Server Component — no client interactivity needed.
 */
export function GradingScaleTable({
  scale,
  className,
}: {
  scale: UniversityGradingScale;
  className?: string;
}) {
  const hasPercent = scale.grades.some(
    (g) => g.minPercent !== undefined || g.maxPercent !== undefined,
  );

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-lg border border-border bg-card",
        className,
      )}
    >
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Grading scale: letter grades, grade points, and percentage ranges.
        </caption>
        <thead>
          <tr className="border-b border-border bg-surface/50 text-left">
            <th scope="col" className="px-4 py-3 font-semibold text-foreground">
              Grade
            </th>
            <th
              scope="col"
              className="px-4 py-3 font-semibold text-foreground"
            >
              Grade Points
            </th>
            {hasPercent && (
              <th
                scope="col"
                className="px-4 py-3 font-semibold text-foreground"
              >
                Percentage Range
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {scale.grades.map((g) => {
            const hasRange =
              g.minPercent !== undefined || g.maxPercent !== undefined;
            return (
              <tr
                key={g.grade}
                className="border-b border-border last:border-0"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {g.grade}
                </td>
                <td className="px-4 py-3 tabular-nums text-foreground">
                  {g.points.toFixed(2)}
                </td>
                {hasPercent && (
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">
                    {hasRange
                      ? formatRange(g.minPercent, g.maxPercent)
                      : "—"}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Format a percentage range, handling open-ended bands gracefully. */
function formatRange(
  min: number | undefined,
  max: number | undefined,
): string {
  if (min !== undefined && max !== undefined) {
    return `${min}% – ${max}%`;
  }
  if (min !== undefined) return `${min}% and above`;
  if (max !== undefined) return `up to ${max}%`;
  return "—";
}
