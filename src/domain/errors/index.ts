/**
 * Domain error strategy for GPAHub's calculation engine.
 *
 * The engine never throws generic `Error("...")` — it always throws a
 * `DomainError` carrying a stable `code` so future UI code can branch
 * on the failure mode and present a meaningful message.
 *
 * Codes are string literals (not TypeScript `enum`) so they survive
 * serialization, minification, and cross-boundary transport without
 * runtime dependency on the enum object.
 */

/** Stable, serializable domain error codes. */
export const DomainErrorCode = {
  /** A credit-hours value was zero, negative, non-finite, or non-numeric. */
  INVALID_CREDIT_HOURS: "INVALID_CREDIT_HOURS",
  /** A subject referenced a grade not present in the supplied grading scale. */
  UNKNOWN_GRADE: "UNKNOWN_GRADE",
  /** The grading scale itself is malformed (empty, duplicate grades, bad points, etc.). */
  INVALID_GRADING_SCALE: "INVALID_GRADING_SCALE",
  /** Every subject was empty/ignored, leaving zero attempted credits. */
  NO_VALID_SUBJECTS: "NO_VALID_SUBJECTS",
  /** A CGPA value was out of range or non-finite. */
  INVALID_CGPA: "INVALID_CGPA",
  /** A percentage value was out of range or non-finite. */
  INVALID_PERCENTAGE: "INVALID_PERCENTAGE",
  /** Total attempted credit hours summed to zero (division by zero). */
  ZERO_TOTAL_CREDITS: "ZERO_TOTAL_CREDITS",
  /** A semester input was structurally invalid. */
  INVALID_SEMESTER: "INVALID_SEMESTER",
  /** A conversion configuration was unsupported or malformed. */
  INVALID_CONVERSION_CONFIG: "INVALID_CONVERSION_CONFIG",
} as const;

export type DomainErrorCode =
  (typeof DomainErrorCode)[keyof typeof DomainErrorCode];

/**
 * Error thrown by every domain function when input violates a domain rule.
 *
 * The `code` field is the stable discriminator; `message` is human-readable
 * and may change between versions; `context` carries structured diagnostic
 * data (e.g. the offending grade or credit value) for richer UI feedback.
 */
export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly context?: Record<string, unknown>;

  constructor(
    code: DomainErrorCode,
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "DomainError";
    this.code = code;
    if (context !== undefined) {
      this.context = context;
    }
    // Restore prototype chain after extending a built-in (TS/ES5 target caveat).
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}

/** Type guard: was this error thrown by the domain layer? */
export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}

/** Convenience constructor — keeps call sites terse. */
export function domainError(
  code: DomainErrorCode,
  message: string,
  context?: Record<string, unknown>,
): DomainError {
  return new DomainError(code, message, context);
}
