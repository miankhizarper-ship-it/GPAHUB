/**
 * GPA calculation engine — pure, deterministic, framework-agnostic.
 *
 * Formula:
 *
 *   GPA = Σ(grade points × credit hours) / Σ(credit hours)
 *
 * The engine receives the grading scale as input (never hardcoded).
 * Empty/blank subject rows are supported via the `isEmpty` flag so a
 * future UI can keep blank rows in its form state without forcing the
 * user to delete them.
 */

import { DomainErrorCode, domainError } from "@/domain/errors";
import { resolveGrade, type GradingScale } from "@/domain/grading";
import { roundTo, RESULT_DECIMALS } from "@/domain/precision";

/**
 * One subject row passed to `calculateGpa`.
 *
 * A row is considered "empty" (and skipped) when `isEmpty` is `true`.
 * This lets a UI hold onto blank form rows without the user having to
 * delete them. Empty rows never contribute to the GPA, never throw,
 * and never count toward `totalCredits`.
 */
export interface SubjectInput {
  /** Stable identifier (UI-side). Ignored by the engine. */
  readonly id?: string;
  /** Letter grade as written on the transcript (e.g. "A", "A-"). */
  readonly grade: string;
  /** Attempted credit hours for this subject. Must be a positive finite number. */
  readonly creditHours: number;
  /**
   * If `true`, the row is treated as a blank form row and skipped.
   * `grade` and `creditHours` are NOT validated when this is `true`.
   * Default: `false`.
   */
  readonly isEmpty?: boolean;
}

/** Structured result of a GPA calculation. */
export interface GpaResult {
  /** Weighted GPA, rounded to `RESULT_DECIMALS`. */
  readonly gpa: number;
  /** Sum of attempted credit hours across non-empty subjects, rounded. */
  readonly totalCredits: number;
  /** Sum of (points × credits) across non-empty subjects, rounded. */
  readonly totalQualityPoints: number;
  /** Count of subjects that actually contributed to the GPA. */
  readonly subjectCount: number;
}

/**
 * Calculate a semester GPA from a list of subject inputs and a grading scale.
 *
 * @throws {@link DomainError} with one of:
 *   - `INVALID_GRADING_SCALE` — scale is malformed
 *   - `INVALID_CREDIT_HOURS` — a non-empty subject has non-positive / non-finite credits
 *   - `UNKNOWN_GRADE` — a non-empty subject's grade is not in the scale
 *   - `NO_VALID_SUBJECTS` — every subject was empty/ignored
 *
 * Empty rows (`isEmpty: true`) are skipped without validation.
 */
export function calculateGpa(
  scale: GradingScale,
  subjects: readonly SubjectInput[],
): GpaResult {
  // Validate the scale once up front. `resolveGrade` re-validates, but
  // doing it here gives a clean error before we touch any subject.
  // resolveGrade throws INVALID_GRADING_SCALE on bad scales, which is
  // exactly the code we want surfaced.

  if (!Array.isArray(subjects)) {
    throw domainError(
      DomainErrorCode.INVALID_CREDIT_HOURS,
      "subjects must be an array.",
    );
  }

  let totalCredits = 0;
  let totalQualityPoints = 0;
  let subjectCount = 0;

  for (let i = 0; i < subjects.length; i++) {
    const s = subjects[i];
    // Skip empty rows entirely — no validation, no contribution.
    if (s?.isEmpty === true) continue;

    if (!s || typeof s !== "object") {
      throw domainError(
        DomainErrorCode.INVALID_CREDIT_HOURS,
        `Subject at index ${i} is not an object.`,
        { index: i },
      );
    }

    if (!Number.isFinite(s.creditHours) || s.creditHours <= 0) {
      throw domainError(
        DomainErrorCode.INVALID_CREDIT_HOURS,
        `Subject at index ${i} has invalid credit hours (got ${s.creditHours}). Credit hours must be a positive finite number.`,
        { index: i, creditHours: s.creditHours },
      );
    }

    // `resolveGrade` throws UNKNOWN_GRADE or INVALID_GRADING_SCALE as appropriate.
    const resolved = resolveGrade(scale, s.grade);

    const qualityPoints = resolved.points * s.creditHours;
    totalQualityPoints += qualityPoints;
    totalCredits += s.creditHours;
    subjectCount += 1;
  }

  if (subjectCount === 0 || totalCredits === 0) {
    throw domainError(
      DomainErrorCode.NO_VALID_SUBJECTS,
      "No valid subjects were supplied. At least one non-empty subject with positive credit hours is required.",
      { suppliedCount: subjects.length },
    );
  }

  // Raw division on doubles — no intermediate rounding.
  const rawGpa = totalQualityPoints / totalCredits;

  return {
    gpa: roundTo(rawGpa, RESULT_DECIMALS),
    totalCredits: roundTo(totalCredits, RESULT_DECIMALS),
    totalQualityPoints: roundTo(totalQualityPoints, RESULT_DECIMALS),
    subjectCount,
  };
}
