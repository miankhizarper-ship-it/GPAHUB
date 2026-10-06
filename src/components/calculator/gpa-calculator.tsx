"use client";

import * as React from "react";
import { Plus, Trash2, RotateCcw, Calculator } from "lucide-react";
import { calculateGpa, isDomainError, type GpaResult } from "@/domain";
import type { SubjectInput } from "@/domain/gpa";
import type { GradingScale } from "@/domain/grading";
import { describeAnyError } from "@/lib/domain-error-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * GPA Calculator — Client Component.
 *
 * Receives a *serializable* `GradingScale` from its parent Server
 * Component and runs all calculations in the browser via the Phase 1
 * domain engine. Never imports the repository or MongoDB. Never makes
 * API calls for calculations.
 *
 * ## Empty-row contract
 *
 * Rows where `isEmpty` is `true` are passed through to the domain
 * engine unchanged. The engine skips them per the Phase 1 contract,
 * so a blank row in the UI never crashes the calculation and never
 * contributes to the GPA.
 *
 * ## Accessibility
 *
 * - Every input has a visible `<label>` (no placeholder-only labels).
 * - The result card uses `aria-live="polite"` so screen readers
 *   announce updates.
 * - Buttons have semantic text + icon with `aria-hidden`.
 * - Focus rings are visible via the global `:focus-visible` style.
 */

interface SubjectRow {
  readonly id: string;
  name: string;
  grade: string;
  creditHours: string;
}

interface GpaCalculatorProps {
  /** Serializable grading scale (passed from a Server Component). */
  scale: GradingScale;
  /** Optional university name for display in the result card. */
  universityName?: string;
  /** Optional slug for "back to university" linking. */
  universitySlug?: string;
  className?: string;
}

let rowIdCounter = 0;
function nextRowId(): string {
  rowIdCounter += 1;
  return `row-${rowIdCounter}`;
}

function makeEmptyRow(): SubjectRow {
  return { id: nextRowId(), name: "", grade: "", creditHours: "" };
}

function makeInitialRows(): SubjectRow[] {
  // Start with 3 empty rows so the user has room to type immediately.
  return [makeEmptyRow(), makeEmptyRow(), makeEmptyRow()];
}

export function GpaCalculator({
  scale,
  universityName,
  className,
}: GpaCalculatorProps) {
  const [rows, setRows] = React.useState<SubjectRow[]>(makeInitialRows);
  const [result, setResult] = React.useState<GpaResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const gradeOptions = React.useMemo(
    () => scale.grades.map((g) => ({ value: g.grade, label: g.grade })),
    [scale],
  );

  const updateRow = React.useCallback(
    (id: string, patch: Partial<SubjectRow>) => {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      );
      // Clear stale result/error when inputs change.
      setResult(null);
      setError(null);
    },
    [],
  );

  const addRow = React.useCallback(() => {
    setRows((prev) => [...prev, makeEmptyRow()]);
  }, []);

  const removeRow = React.useCallback((id: string) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }, []);

  const reset = React.useCallback(() => {
    setRows(makeInitialRows());
    setResult(null);
    setError(null);
  }, []);

  const handleCalculate = React.useCallback(() => {
    // Map UI rows → domain SubjectInput. A row is "empty" (skipped by
    // the engine) when both grade and creditHours are blank.
    const subjects: SubjectInput[] = rows.map((r) => {
      const isEmpty = r.grade === "" && r.creditHours.trim() === "";
      const creditHours = parseFloat(r.creditHours);
      return {
        id: r.id,
        grade: r.grade,
        creditHours: Number.isFinite(creditHours) ? creditHours : 0,
        isEmpty,
      };
    });

    try {
      const res = calculateGpa(scale, subjects);
      setResult(res);
      setError(null);
    } catch (e) {
      setResult(null);
      setError(describeAnyError(e));
    }
  }, [rows, scale]);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* ---------- Subject rows ---------- */}
      <div className="flex flex-col gap-3">
        <div className="hidden grid-cols-[1fr_120px_110px_40px] gap-2 sm:grid">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Subject name (optional)
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Grade
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Credits
          </span>
          <span className="sr-only">Remove</span>
        </div>

        {rows.map((row, index) => (
          <div
            key={row.id}
            className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_120px_110px_40px] sm:items-center"
          >
            <div className="flex flex-col gap-1">
              <label
                htmlFor={`name-${row.id}`}
                className="sr-only"
              >
                Subject name (optional) for row {index + 1}
              </label>
              <Input
                id={`name-${row.id}`}
                type="text"
                placeholder="e.g. Data Structures"
                value={row.name}
                onChange={(e) => updateRow(row.id, { name: e.target.value })}
                aria-label={`Subject name (optional) for row ${index + 1}`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`grade-${row.id}`} className="sr-only">
                Grade for row {index + 1}
              </label>
              <Select
                value={row.grade}
                onValueChange={(v) => updateRow(row.id, { grade: v })}
              >
                <SelectTrigger id={`grade-${row.id}`} aria-label={`Grade for row ${index + 1}`}>
                  <SelectValue placeholder="Grade" />
                </SelectTrigger>
                <SelectContent>
                  {gradeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`credits-${row.id}`} className="sr-only">
                Credit hours for row {index + 1}
              </label>
              <Input
                id={`credits-${row.id}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                placeholder="3"
                value={row.creditHours}
                onChange={(e) => updateRow(row.id, { creditHours: e.target.value })}
                aria-label={`Credit hours for row ${index + 1}`}
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRow(row.id)}
              disabled={rows.length <= 1}
              aria-label={`Remove row ${index + 1}`}
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>

      {/* ---------- Actions ---------- */}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleCalculate}>
          <Calculator className="h-4 w-4" aria-hidden="true" />
          Calculate GPA
        </Button>
        <Button type="button" variant="outline" onClick={addRow}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add subject
        </Button>
        <Button type="button" variant="ghost" onClick={reset}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </Button>
      </div>

      {/* ---------- Error ---------- */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* ---------- Result ---------- */}
      {result && (
        <div
          aria-live="polite"
          className="rounded-xl border border-border bg-surface/40 p-5"
        >
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your GPA{universityName ? ` · ${universityName}` : ""}
              </p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-foreground sm:text-5xl">
                {result.gpa.toFixed(2)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              out of {scale.maxPoints.toFixed(2)}
            </p>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Total Credits</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                {result.totalCredits}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Quality Points</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                {result.totalQualityPoints}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Subjects</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                {result.subjectCount}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
