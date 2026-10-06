"use client";

import * as React from "react";
import { ArrowRightLeft } from "lucide-react";
import {
  cgpaToPercentage,
  percentageToCgpa,
  type CgpaToPercentageResult,
  type PercentageToCgpaResult,
} from "@/domain";
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
 * CGPA ↔ Percentage Converter — Client Component.
 *
 * Two-way conversion using the Phase 1 domain conversion functions.
 * The user can pick the maximum GPA (4.0, 5.0, or custom) so the tool
 * works for any scale. The default is the generic linear strategy:
 *
 *   percentage = (CGPA / maxGPA) × 100
 *
 * A clear disclaimer notes that university-specific conversion policies
 * may differ and the user should consult their university's official
 * formula where available.
 */

const MAX_GPA_PRESETS = [
  { value: "4.0", label: "4.0 scale" },
  { value: "5.0", label: "5.0 scale" },
] as const;

interface CgpaPercentageConverterProps {
  className?: string;
}

export function CgpaPercentageConverter({
  className,
}: CgpaPercentageConverterProps) {
  // --- CGPA → Percentage ---
  const [cgpaInput, setCgpaInput] = React.useState("");
  const [cgpaResult, setCgpaResult] = React.useState<CgpaToPercentageResult | null>(null);
  const [cgpaError, setCgpaError] = React.useState<string | null>(null);

  // --- Percentage → CGPA ---
  const [pctInput, setPctInput] = React.useState("");
  const [pctResult, setPctResult] = React.useState<PercentageToCgpaResult | null>(null);
  const [pctError, setPctError] = React.useState<string | null>(null);

  // --- Shared config ---
  const [maxGpa, setMaxGpa] = React.useState("4.0");

  const maxGpaValue = React.useMemo(() => {
    const n = parseFloat(maxGpa);
    return Number.isFinite(n) && n > 0 ? n : 4.0;
  }, [maxGpa]);

  const handleCgpaConvert = React.useCallback(() => {
    const cgpa = parseFloat(cgpaInput);
    try {
      const res = cgpaToPercentage(cgpa, { strategy: "linear", maxGpa: maxGpaValue });
      setCgpaResult(res);
      setCgpaError(null);
    } catch (e) {
      setCgpaResult(null);
      setCgpaError(describeAnyError(e));
    }
  }, [cgpaInput, maxGpaValue]);

  const handlePctConvert = React.useCallback(() => {
    const pct = parseFloat(pctInput);
    try {
      const res = percentageToCgpa(pct, { strategy: "linear", maxGpa: maxGpaValue });
      setPctResult(res);
      setPctError(null);
    } catch (e) {
      setPctResult(null);
      setPctError(describeAnyError(e));
    }
  }, [pctInput, maxGpaValue]);

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      {/* ---------- Max GPA selector ---------- */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
        <label
          htmlFor="max-gpa"
          className="text-sm font-medium text-foreground"
        >
          Maximum GPA scale:
        </label>
        <div className="flex items-center gap-2">
          <Select value={maxGpa} onValueChange={setMaxGpa}>
            <SelectTrigger
              id="max-gpa"
              className="w-[140px]"
              aria-label="Maximum GPA scale"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MAX_GPA_PRESETS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            inputMode="decimal"
            min="0.1"
            step="0.1"
            value={maxGpa}
            onChange={(e) => setMaxGpa(e.target.value)}
            aria-label="Custom maximum GPA value"
            className="w-20"
          />
        </div>
      </div>

      {/* ---------- Two-way converters ---------- */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* CGPA → Percentage */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-foreground">
              CGPA → Percentage
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="cgpa-input" className="text-sm text-muted-foreground">
                Your CGPA
              </label>
              <Input
                id="cgpa-input"
                type="number"
                inputMode="decimal"
                min="0"
                max={maxGpaValue}
                step="0.01"
                placeholder="e.g. 3.50"
                value={cgpaInput}
                onChange={(e) => {
                  setCgpaInput(e.target.value);
                  setCgpaResult(null);
                  setCgpaError(null);
                }}
              />
            </div>
            <Button type="button" onClick={handleCgpaConvert}>
              Convert to percentage
            </Button>
            {cgpaError && (
              <p role="alert" className="text-sm text-destructive">
                {cgpaError}
              </p>
            )}
            {cgpaResult && (
              <div
                aria-live="polite"
                className="rounded-lg border border-border bg-surface/50 p-4"
              >
                <p className="text-xs text-muted-foreground">Percentage</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
                  {cgpaResult.percentage.toFixed(2)}%
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Percentage → CGPA */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <ArrowRightLeft className="h-4 w-4 text-primary" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-foreground">
              Percentage → CGPA
            </h3>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="pct-input" className="text-sm text-muted-foreground">
                Your percentage (0–100)
              </label>
              <Input
                id="pct-input"
                type="number"
                inputMode="decimal"
                min="0"
                max="100"
                step="0.01"
                placeholder="e.g. 87.5"
                value={pctInput}
                onChange={(e) => {
                  setPctInput(e.target.value);
                  setPctResult(null);
                  setPctError(null);
                }}
              />
            </div>
            <Button type="button" onClick={handlePctConvert}>
              Convert to CGPA
            </Button>
            {pctError && (
              <p role="alert" className="text-sm text-destructive">
                {pctError}
              </p>
            )}
            {pctResult && (
              <div
                aria-live="polite"
                className="rounded-lg border border-border bg-surface/50 p-4"
              >
                <p className="text-xs text-muted-foreground">
                  CGPA (out of {pctResult.maxGpa.toFixed(1)})
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
                  {pctResult.cgpa.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Disclaimer ---------- */}
      <p className="rounded-lg border border-border bg-surface/30 px-4 py-3 text-sm text-muted-foreground">
        <strong className="font-semibold text-foreground">Note:</strong> This
        converter uses the generic linear formula{" "}
        <code className="rounded bg-card px-1 py-0.5 text-xs">
          percentage = (CGPA / maxGPA) × 100
        </code>
        . University-specific conversion policies may differ — consult your
        university&apos;s official grading document for the authoritative formula.
      </p>
    </div>
  );
}
