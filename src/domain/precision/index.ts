/**
 * Precision policy for the GPAHub calculation engine.
 *
 * ## The problem
 *
 * IEEE-754 double-precision floats cannot represent most decimal
 * fractions exactly. For example `3 × 3.67 = 11.010000000000002` and
 * `(3×4 + 3×3 + 2×3.67) / 8 = 3.6675` is fine, but other inputs
 * routinely produce values like `3.6699999999999995` that must never
 * leak into user-facing result fields.
 *
 * ## The policy
 *
 * 1. **No intermediate rounding.** All summation and division inside
 *    `calculateGpa` / `calculateCgpa` happens on raw doubles. This
 *    preserves mathematical correctness — rounding mid-calculation
 *    introduces drift that compounds across semesters.
 *
 * 2. **Round only at result boundaries.** The `gpa`, `cgpa`, and
 *    `percentage` fields exposed on result objects are rounded to
 *    `RESULT_DECIMALS` (2) using "round half up" semantics.
 *
 * 3. **Total credits and total quality points are rounded too.** They
 *    are result fields, not intermediate values — rounding them avoids
 *    presenting `11.010000000000002` to the user while still keeping
 *    the displayed values internally consistent with the displayed GPA.
 *
 * 4. **The rounded values are display-only.** If a future caller wants
 *    to chain a GPA result into a CGPA calculation, they should pass
 *    the raw `totalQualityPoints` and `totalCredits` (which are already
 *    rounded at the boundary) — never re-derive from the rounded GPA.
 *
 * "Round half up" is chosen over banker's rounding because it matches
 * what most students expect: `3.665 → 3.67`, `3.664 → 3.66`.
 */

/** Number of decimal places exposed on user-facing result fields. */
export const RESULT_DECIMALS = 2;

/**
 * Round a number to `decimals` places using "round half up" semantics.
 *
 * Returns `NaN` if the input is non-finite. Callers should validate
 * finiteness before calling — this function is the last step, not a
 * validator.
 */
export function roundTo(value: number, decimals: number = RESULT_DECIMALS): number {
  if (!Number.isFinite(value)) return NaN;
  const factor = Math.pow(10, decimals);
  // Adding Number.EPSILON before truncation mitigates binary-repr drift
  // (e.g. 1.005 stored as 1.00499999...). This is the standard remedy
  // and is safe for the magnitudes GPAHub deals with (0–100).
  return Math.round((value + Number.EPSILON) * factor) / factor;
}
