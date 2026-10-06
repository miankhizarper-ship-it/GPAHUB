/**
 * CGPA calculation engine — pure, deterministic, framework-agnostic.
 *
 * The CGPA is computed from **weighted quality points**, never by
 * averaging per-semester GPAs. Averaging GPAs is mathematically wrong
 * when semesters carry unequal credit loads:
 *
 *   WRONG:  CGPA = (gpa₁ + gpa₂ + ...) / N
 *   RIGHT:  CGPA = Σ(semesterGpa × semesterCredits) / Σ(semesterCredits)
 *         = Σ(totalQualityPoints_per_semester) / Σ(totalCredits_per_semester)
 *
 * Both formulas are equivalent only when every semester has the same
 * credit load — which is rarely true in practice. The wrong formula
 * silently over-weights light semesters.
 *
 * To make weighted aggregation unambiguous, the engine accepts two
 * semester shapes:
 *
 *   1. Subject-level: `{ subjects: SubjectInput[] }` — the engine
 *      calculates the semester's quality points and credits internally.
 *   2. Summary-level: `{ gpa: number; creditHours: number }` — the
 *      caller has already computed the GPA and supplies it together
 *      with the semester's total credits. The engine derives quality
 *      points as `gpa × creditHours`.
 *
 * Both shapes are normalized to `{ totalQualityPoints, totalCredits }`
 * before aggregation, so the final CGPA formula is identical.
 */

import { DomainErrorCode, domainError } from "@/domain/errors";
import { roundTo, RESULT_DECIMALS } from "@/domain/precision";
import {
  calculateGpa,
  type SubjectInput,
  type GpaResult,
} from "@/domain/gpa";
import type { GradingScale } from "@/domain/grading";

/** A semester represented as a list of subjects. The engine computes its GPA. */
export interface SubjectSemesterInput {
  readonly type?: "subjects";
  readonly subjects: readonly SubjectInput[];
  /** Optional label for diagnostics/UI. Ignored by the engine. */
  readonly label?: string;
}

/** A semester represented as a pre-computed GPA + its total credit hours. */
export interface SummarySemesterInput {
  readonly type: "summary";
  readonly gpa: number;
  readonly creditHours: number;
  /** Optional label for diagnostics/UI. Ignored by the engine. */
  readonly label?: string;
}

/** Union: a semester may be supplied in either shape. */
export type SemesterInput = SubjectSemesterInput | SummarySemesterInput;

/** Structured result of a CGPA calculation. */
export interface CgpaResult {
  /** Weighted CGPA across all semesters, rounded to `RESULT_DECIMALS`. */
  readonly cgpa: number;
  /** Total credit hours across all semesters, rounded. */
  readonly totalCredits: number;
  /** Total quality points across all semesters, rounded. */
  readonly totalQualityPoints: number;
  /** Number of semesters that contributed to the CGPA. */
  readonly semesterCount: number;
  /** Per-semester breakdown (for UI display / debugging). */
  readonly semesters: readonly SemesterBreakdown[];
}

/** Per-semester contribution to the CGPA. */
export interface SemesterBreakdown {
  readonly label?: string;
  /** This semester's GPA. For subject-level semesters, this is computed. */
  readonly gpa: number;
  readonly creditHours: number;
  readonly qualityPoints: number;
}

/** Internal normalized representation used during aggregation. */
interface NormalizedSemester {
  readonly label?: string;
  readonly gpa: number;
  readonly creditHours: number;
  readonly qualityPoints: number;
}

/**
 * Normalize a single semester input into `{ gpa, creditHours, qualityPoints }`.
 *
 * - Subject-level semesters are run through `calculateGpa` to derive
 *   `gpa`, `totalCredits`, and `totalQualityPoints` from the supplied
 *   grading scale.
 * - Summary-level semesters are validated inline; their quality points
 *   are derived as `gpa × creditHours` using the raw (unrounded) GPA
 *   so the math stays internally consistent.
 *
 * @throws {@link DomainError} — see `calculateGpa` for subject-level
 *   errors, plus `INVALID_SEMESTER` for malformed summary semesters.
 */
function normalizeSemester(
  scale: GradingScale,
  semester: SemesterInput,
  index: number,
): NormalizedSemester {
  if (!semester || typeof semester !== "object") {
    throw domainError(
      DomainErrorCode.INVALID_SEMESTER,
      `Semester at index ${index} is not an object.`,
      { index },
    );
  }

  // Summary shape: caller supplied gpa + creditHours directly.
  if (semester.type === "summary") {
    const { gpa, creditHours } = semester;
    if (!Number.isFinite(gpa) || gpa < 0) {
      throw domainError(
        DomainErrorCode.INVALID_SEMESTER,
        `Summary semester at index ${index} has invalid gpa (got ${gpa}).`,
        { index, gpa },
      );
    }
    if (!Number.isFinite(creditHours) || creditHours <= 0) {
      throw domainError(
        DomainErrorCode.INVALID_SEMESTER,
        `Summary semester at index ${index} has invalid creditHours (got ${creditHours}).`,
        { index, creditHours },
      );
    }
    // Use raw gpa (caller may have already rounded, but we don't re-round here).
    return {
      label: semester.label,
      gpa,
      creditHours,
      qualityPoints: gpa * creditHours,
    };
  }

  // Subject shape: default when type is omitted or "subjects".
  if (!("subjects" in semester) || !Array.isArray(semester.subjects)) {
    throw domainError(
      DomainErrorCode.INVALID_SEMESTER,
      `Semester at index ${index} must be either { type: "summary", gpa, creditHours } or { subjects: SubjectInput[] }.`,
      { index },
    );
  }

  // `calculateGpa` throws NO_VALID_SUBJECTS / INVALID_CREDIT_HOURS /
  // UNKNOWN_GRADE / INVALID_GRADING_SCALE as appropriate. We let those
  // propagate — the codes are already correct for a CGPA caller.
  const result: GpaResult = calculateGpa(scale, semester.subjects);

  // Use the RAW (unrounded) totals for aggregation. `result.totalCredits`
  // and `result.totalQualityPoints` are already rounded at the GPA
  // boundary per the precision policy, which is what we want — those
  // are display values. For CGPA aggregation we use them as-is.
  return {
    label: semester.label,
    gpa: result.gpa,
    creditHours: result.totalCredits,
    qualityPoints: result.totalQualityPoints,
  };
}

/**
 * Calculate a cumulative GPA across multiple semesters using weighted
 * quality points.
 *
 * @throws {@link DomainError} with one of:
 *   - `INVALID_GRADING_SCALE` — scale malformed (subject-level semesters)
 *   - `INVALID_SEMESTER` — a summary semester has invalid gpa/credits
 *   - `INVALID_CREDIT_HOURS` — a subject within a semester has bad credits
 *   - `UNKNOWN_GRADE` — a subject within a semester has an unknown grade
 *   - `NO_VALID_SUBJECTS` — a subject-level semester has zero valid subjects
 *   - `ZERO_TOTAL_CREDITS` — every semester summed to zero credits
 */
export function calculateCgpa(
  scale: GradingScale,
  semesters: readonly SemesterInput[],
): CgpaResult {
  if (!Array.isArray(semesters) || semesters.length === 0) {
    throw domainError(
      DomainErrorCode.INVALID_SEMESTER,
      "At least one semester must be supplied.",
      { suppliedCount: Array.isArray(semesters) ? semesters.length : 0 },
    );
  }

  const normalized: NormalizedSemester[] = semesters.map((s, i) =>
    normalizeSemester(scale, s, i),
  );

  let totalCredits = 0;
  let totalQualityPoints = 0;

  for (const sem of normalized) {
    totalCredits += sem.creditHours;
    totalQualityPoints += sem.qualityPoints;
  }

  if (totalCredits === 0) {
    throw domainError(
      DomainErrorCode.ZERO_TOTAL_CREDITS,
      "Total credit hours across all semesters is zero.",
    );
  }

  const rawCgpa = totalQualityPoints / totalCredits;

  return {
    cgpa: roundTo(rawCgpa, RESULT_DECIMALS),
    totalCredits: roundTo(totalCredits, RESULT_DECIMALS),
    totalQualityPoints: roundTo(totalQualityPoints, RESULT_DECIMALS),
    semesterCount: normalized.length,
    semesters: normalized.map((s) => ({
      label: s.label,
      gpa: roundTo(s.gpa, RESULT_DECIMALS),
      creditHours: roundTo(s.creditHours, RESULT_DECIMALS),
      qualityPoints: roundTo(s.qualityPoints, RESULT_DECIMALS),
    })),
  };
}
