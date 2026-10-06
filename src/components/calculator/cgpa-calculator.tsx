"use client";

import * as React from "react";
import { Plus, Trash2, RotateCcw, Calculator } from "lucide-react";
import { calculateCgpa, type CgpaResult } from "@/domain";
import type { SemesterInput } from "@/domain/cgpa";
import type { GradingScale } from "@/domain/grading";
import { describeAnyError } from "@/lib/domain-error-messages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * CGPA Calculator — Client Component.
 *
 * Uses the "summary" semester shape (pre-computed GPA + credit hours)
 * rather than subject-level entry. This keeps the CGPA UI simple for
 * the common case where students already know their per-semester GPA
 * from their transcript. The Phase 1 domain engine correctly weights
 * by credit hours — it does NOT average GPAs.
 *
 * University-specific CGPA calculators pass the university's grading
 * scale for the max-points display. The summary shape doesn't need
 * the scale for calculation (only the GPA + credits), but the scale
 * is used to show the "out of N" ceiling in the result card.
 */

interface SemesterRow {
  readonly id: string;
  name: string;
  gpa: string;
  creditHours: string;
}

interface CgpaCalculatorProps {
  /** Serializable grading scale (for max-points display). */
  scale: GradingScale;
  universityName?: string;
  className?: string;
}

let semIdCounter = 0;
function nextSemId(): string {
  semIdCounter += 1;
  return `sem-${semIdCounter}`;
}

function makeEmptySemester(label: string): SemesterRow {
  return { id: nextSemId(), name: label, gpa: "", creditHours: "" };
}

function makeInitialSemesters(): SemesterRow[] {
  return [makeEmptySemester("Semester 1"), makeEmptySemester("Semester 2")];
}

export function CgpaCalculator({
  scale,
  universityName,
  className,
}: CgpaCalculatorProps) {
  const [rows, setRows] = React.useState<SemesterRow[]>(makeInitialSemesters);
  const [result, setResult] = React.useState<CgpaResult | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const updateRow = React.useCallback(
    (id: string, patch: Partial<SemesterRow>) => {
      setRows((prev) =>
        prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      );
      setResult(null);
      setError(null);
    },
    [],
  );

  const addRow = React.useCallback(() => {
    setRows((prev) => [
      ...prev,
      makeEmptySemester(`Semester ${prev.length + 1}`),
    ]);
  }, []);

  const removeRow = React.useCallback((id: string) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }, []);

  const reset = React.useCallback(() => {
    setRows(makeInitialSemesters());
    setResult(null);
    setError(null);
  }, []);

  const handleCalculate = React.useCallback(() => {
    // Map UI rows → domain SemesterInput (summary shape). A row is
    // skipped when both gpa and creditHours are blank — we simply
    // omit it from the semesters array (the engine requires at least
    // one valid semester).
    const semesters: SemesterInput[] = [];
    for (const r of rows) {
      const gpa = parseFloat(r.gpa);
      const credits = parseFloat(r.creditHours);
      const isEmpty = r.gpa.trim() === "" && r.creditHours.trim() === "";
      if (isEmpty) continue;

      semesters.push({
        type: "summary",
        label: r.name || undefined,
        gpa: Number.isFinite(gpa) ? gpa : NaN,
        creditHours: Number.isFinite(credits) ? credits : NaN,
      });
    }

    try {
      const res = calculateCgpa(scale, semesters);
      setResult(res);
      setError(null);
    } catch (e) {
      setResult(null);
      setError(describeAnyError(e));
    }
  }, [rows, scale]);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col gap-3">
        <div className="hidden grid-cols-[1fr_110px_120px_40px] gap-2 sm:grid">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Semester
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            GPA
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Credits
          </span>
          <span className="sr-only">Remove</span>
        </div>

        {rows.map((row, index) => (
          <div
            key={row.id}
            className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_110px_120px_40px] sm:items-center"
          >
            <div className="flex flex-col gap-1">
              <label htmlFor={`sem-name-${row.id}`} className="sr-only">
                Semester label for row {index + 1}
              </label>
              <Input
                id={`sem-name-${row.id}`}
                type="text"
                placeholder={row.name || `Semester ${index + 1}`}
                value={row.name}
                onChange={(e) => updateRow(row.id, { name: e.target.value })}
                aria-label={`Semester label for row ${index + 1}`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`sem-gpa-${row.id}`} className="sr-only">
                GPA for {row.name || `semester ${index + 1}`}
              </label>
              <Input
                id={`sem-gpa-${row.id}`}
                type="number"
                inputMode="decimal"
                min="0"
                max={scale.maxPoints}
                step="0.01"
                placeholder="3.50"
                value={row.gpa}
                onChange={(e) => updateRow(row.id, { gpa: e.target.value })}
                aria-label={`GPA for ${row.name || `semester ${index + 1}`}`}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor={`sem-credits-${row.id}`} className="sr-only">
                Credit hours for {row.name || `semester ${index + 1}`}
              </label>
              <Input
                id={`sem-credits-${row.id}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.5"
                placeholder="18"
                value={row.creditHours}
                onChange={(e) =>
                  updateRow(row.id, { creditHours: e.target.value })
                }
                aria-label={`Credit hours for ${row.name || `semester ${index + 1}`}`}
              />
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeRow(row.id)}
              disabled={rows.length <= 1}
              aria-label={`Remove ${row.name || `semester ${index + 1}`}`}
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={handleCalculate}>
          <Calculator className="h-4 w-4" aria-hidden="true" />
          Calculate CGPA
        </Button>
        <Button type="button" variant="outline" onClick={addRow}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add semester
        </Button>
        <Button type="button" variant="ghost" onClick={reset}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reset
        </Button>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {result && (
        <div
          aria-live="polite"
          className="rounded-xl border border-border bg-surface/40 p-5"
        >
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your CGPA{universityName ? ` · ${universityName}` : ""}
              </p>
              <p className="mt-1 text-4xl font-bold tabular-nums text-foreground sm:text-5xl">
                {result.cgpa.toFixed(2)}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              out of {scale.maxPoints.toFixed(2)}
            </p>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
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
              <dt className="text-xs text-muted-foreground">Semesters</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                {result.semesterCount}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Passing</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                {scale.maxPoints >= 4.0 ? "2.00" : "—"}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}
