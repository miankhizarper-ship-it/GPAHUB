/**
 * Grading scale model for GPAHub.
 *
 * A `GradingScale` is the *input* to the GPA engine — never hardcoded
 * inside it. This keeps the engine reusable across universities: each
 * university ships its own scale (Phase 2+) and the engine accepts it
 * as a parameter.
 *
 * Phase 1 introduces the type, validation, and lookup helpers. No
 * real university data lives here — only the contract.
 */

import { DomainError, DomainErrorCode, domainError } from "@/domain/errors";

/** A single row in a grading scale: a letter grade and its point value. */
export interface GradeDefinition {
  /** Letter grade as the student/transcript writes it (e.g. "A", "A-", "B+"). */
  readonly grade: string;
  /** Grade-point value on this scale (e.g. 4.0, 3.67, 0.0). */
  readonly points: number;
  /** Optional lower-bound percentage for this grade band (inclusive). */
  readonly minPercent?: number;
  /** Optional upper-bound percentage for this grade band (exclusive or inclusive — university-defined). */
  readonly maxPercent?: number;
}

/** A complete grading scale: its ceiling plus the grade table. */
export interface GradingScale {
  /** The maximum possible points on this scale (e.g. 4.0, 5.0). */
  readonly maxPoints: number;
  /** Ordered grade rows. Lookup is by exact match (case-insensitive) on `grade`. */
  readonly grades: readonly GradeDefinition[];
}

/** Lookup result: the matched grade row plus its exact points. */
export interface ResolvedGrade {
  readonly grade: string;
  readonly points: number;
}

/**
 * Validate a grading scale's structural integrity.
 *
 * Throws `INVALID_GRADING_SCALE` with a descriptive `context` if:
 *  - `grades` is empty
 *  - `maxPoints` is non-finite or <= 0
 *  - any grade has a non-finite or negative `points`
 *  - any grade's `points` exceeds `maxPoints`
 *  - two grades share the same letter (case-insensitive)
 *  - any grade string is empty/whitespace
 *
 * Returns the scale unchanged on success (for chaining).
 */
export function validateGradingScale(scale: GradingScale): GradingScale {
  if (!scale || typeof scale !== "object") {
    throw domainError(
      DomainErrorCode.INVALID_GRADING_SCALE,
      "Grading scale must be an object.",
    );
  }

  if (!Number.isFinite(scale.maxPoints) || scale.maxPoints <= 0) {
    throw domainError(
      DomainErrorCode.INVALID_GRADING_SCALE,
      `maxPoints must be a positive finite number (got ${scale.maxPoints}).`,
      { maxPoints: scale.maxPoints },
    );
  }

  if (!Array.isArray(scale.grades) || scale.grades.length === 0) {
    throw domainError(
      DomainErrorCode.INVALID_GRADING_SCALE,
      "Grading scale must contain at least one grade definition.",
    );
  }

  const seen = new Set<string>();
  for (const g of scale.grades) {
    if (!g || typeof g.grade !== "string" || g.grade.trim() === "") {
      throw domainError(
        DomainErrorCode.INVALID_GRADING_SCALE,
        "Every grade must have a non-empty grade string.",
        { grade: g?.grade },
      );
    }
    if (!Number.isFinite(g.points) || g.points < 0) {
      throw domainError(
        DomainErrorCode.INVALID_GRADING_SCALE,
        `Grade "${g.grade}" has invalid points (got ${g.points}).`,
        { grade: g.grade, points: g.points },
      );
    }
    if (g.points > scale.maxPoints) {
      throw domainError(
        DomainErrorCode.INVALID_GRADING_SCALE,
        `Grade "${g.grade}" points (${g.points}) exceed maxPoints (${scale.maxPoints}).`,
        { grade: g.grade, points: g.points, maxPoints: scale.maxPoints },
      );
    }
    const key = g.grade.trim().toLowerCase();
    if (seen.has(key)) {
      throw domainError(
        DomainErrorCode.INVALID_GRADING_SCALE,
        `Duplicate grade "${g.grade}" (case-insensitive).`,
        { grade: g.grade },
      );
    }
    seen.add(key);
  }

  return scale;
}

/**
 * Look up a grade in a scale by letter, case-insensitively.
 *
 * Throws `INVALID_GRADING_SCALE` if the scale itself is invalid, and
 * `UNKNOWN_GRADE` if the grade string is not found.
 */
export function resolveGrade(scale: GradingScale, grade: string): ResolvedGrade {
  validateGradingScale(scale);

  const normalized = String(grade ?? "").trim().toLowerCase();
  if (normalized === "") {
    throw domainError(
      DomainErrorCode.UNKNOWN_GRADE,
      "Grade string is empty.",
      { grade },
    );
  }

  const match = scale.grades.find(
    (g) => g.grade.trim().toLowerCase() === normalized,
  );

  if (!match) {
    throw domainError(
      DomainErrorCode.UNKNOWN_GRADE,
      `Grade "${grade}" is not defined in the supplied grading scale.`,
      { grade, availableGrades: scale.grades.map((g) => g.grade) },
    );
  }

  return { grade: match.grade, points: match.points };
}

/**
 * Type guard: is this value a structurally-valid-looking grading scale?
 *
 * Unlike `validateGradingScale` (which throws), this returns a boolean
 * and never throws — useful for defensive checks at trust boundaries.
 */
export function isGradingScale(value: unknown): value is GradingScale {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<GradingScale>;
  return (
    typeof s.maxPoints === "number" &&
    Number.isFinite(s.maxPoints) &&
    s.maxPoints > 0 &&
    Array.isArray(s.grades) &&
    s.grades.length > 0 &&
    s.grades.every(
      (g) =>
        g &&
        typeof g === "object" &&
        typeof (g as GradeDefinition).grade === "string" &&
        typeof (g as GradeDefinition).points === "number" &&
        Number.isFinite((g as GradeDefinition).points),
    )
  );
}

// Re-export the domain error infrastructure so callers can import everything
// from a single grading module entry point if they choose.
export { DomainError, DomainErrorCode } from "@/domain/errors";
