/**
 * Domain error → user-facing message mapping.
 *
 * Keeps the Phase 1 domain engine free of presentation concerns. The
 * UI catches `DomainError` instances thrown by `calculateGpa` /
 * `calculateCgpa` / conversion functions and calls this helper to
 * produce a human-readable string suitable for inline form feedback.
 *
 * Returns `null` for unknown codes so the UI can fall back to a
 * generic "Something went wrong" message without crashing.
 */

import { DomainErrorCode, type DomainErrorCode as DomainErrorCodeType } from "@/domain/errors";

type MessageBuilder = (context?: Record<string, unknown>) => string;

const MESSAGES: Record<DomainErrorCodeType, MessageBuilder> = {
  [DomainErrorCode.INVALID_CREDIT_HOURS]: () =>
    "Credit hours must be a positive number greater than 0.",
  [DomainErrorCode.UNKNOWN_GRADE]: (ctx) => {
    const available = Array.isArray(ctx?.availableGrades)
      ? (ctx!.availableGrades as string[]).join(", ")
      : null;
    return available
      ? `Please select a valid grade. Available grades: ${available}.`
      : "Please select a valid grade.";
  },
  [DomainErrorCode.INVALID_GRADING_SCALE]: () =>
    "This grading scale is currently unavailable. Please try a different university.",
  [DomainErrorCode.NO_VALID_SUBJECTS]: () =>
    "Add at least one subject with a grade and positive credit hours.",
  [DomainErrorCode.INVALID_CGPA]: (ctx) =>
    `CGPA must be between 0 and ${ctx?.maxGpa ?? "the maximum"}.`,
  [DomainErrorCode.INVALID_PERCENTAGE]: () =>
    "Percentage must be a number between 0 and 100.",
  [DomainErrorCode.ZERO_TOTAL_CREDITS]: () =>
    "Total credit hours cannot be zero. Add at least one subject with credits.",
  [DomainErrorCode.INVALID_SEMESTER]: () =>
    "Each semester needs a valid GPA (0 or above) and positive credit hours.",
  [DomainErrorCode.INVALID_CONVERSION_CONFIG]: () =>
    "Conversion configuration is invalid. Check the maximum GPA value.",
};

/**
 * Translate a `DomainError.code` into a user-facing message.
 *
 * @param code  The `DomainErrorCode` from a caught `DomainError`.
 * @param context  Optional `error.context` object for richer messages.
 * @returns  A human-readable string, or `null` if the code is unrecognized.
 */
export function describeDomainError(
  code: DomainErrorCodeType,
  context?: Record<string, unknown>,
): string | null {
  const builder = MESSAGES[code];
  if (!builder) return null;
  return builder(context);
}

/**
 * Translate any thrown value into a user-facing message. Falls back to
 * a generic message for non-domain errors or unrecognized codes.
 *
 * Use this in `try/catch` blocks around domain function calls:
 *
 *   try { setResult(calculateGpa(scale, subjects)); }
 *   catch (e) { setError(describeAnyError(e)); }
 */
export function describeAnyError(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const { code, context } = error as {
      code: DomainErrorCodeType;
      context?: Record<string, unknown>;
    };
    const message = describeDomainError(code, context);
    if (message) return message;
  }
  return "Something went wrong. Please check your inputs and try again.";
}
