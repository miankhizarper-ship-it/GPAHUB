/**
 * CGPA ↔ percentage conversion.
 *
 * ## Strategy model (no `eval`, no arbitrary JS)
 *
 * Conversion is pluggable via a discriminated union of *named*
 * strategies. Each strategy is implemented as a pure function in this
 * module. Universities that need a different formula (Phase 2+) will
 * add a new strategy variant here — they will never supply arbitrary
 * JavaScript to be evaluated.
 *
 * Phase 1 ships a single strategy: `"linear"`, which implements the
 * generic formula:
 *
 *   percentage = (CGPA / maxGPA) × 100
 *   CGPA       = (percentage / 100) × maxGPA
 *
 * Future strategies (reserved names, not yet implemented):
 *   - `"piecewise"` — banded conversion via a lookup table
 *   - `"polynomial"` — CGPA mapped through a fixed polynomial
 *
 * Each future strategy will be a pure function with no I/O and no
 * dynamic code execution.
 */

import { DomainErrorCode, domainError } from "@/domain/errors";
import { roundTo, RESULT_DECIMALS } from "@/domain/precision";

/** A named conversion strategy. Phase 1 ships `"linear"` only. */
export type ConversionStrategyName = "linear";

/** Configuration object accepted by the conversion functions. */
export interface ConversionConfig {
  /** The strategy to apply. Currently only `"linear"` is supported. */
  readonly strategy?: ConversionStrategyName;
  /** The maximum GPA on the scale (e.g. 4.0, 5.0). Must be positive finite. */
  readonly maxGpa: number;
}

/** Result of a CGPA → percentage conversion. */
export interface CgpaToPercentageResult {
  readonly percentage: number;
  readonly cgpa: number;
  readonly maxGpa: number;
  readonly strategy: ConversionStrategyName;
}

/** Result of a percentage → CGPA conversion. */
export interface PercentageToCgpaResult {
  readonly cgpa: number;
  readonly percentage: number;
  readonly maxGpa: number;
  readonly strategy: ConversionStrategyName;
}

/** Default strategy used when `config.strategy` is omitted. */
export const DEFAULT_CONVERSION_STRATEGY: ConversionStrategyName = "linear";

/**
 * Validate a `ConversionConfig`.
 *
 * @throws `INVALID_CONVERSION_CONFIG` if `maxGpa` is non-finite or <= 0,
 *         or if `strategy` is not a supported name.
 */
function validateConfig(config: ConversionConfig): {
  maxGpa: number;
  strategy: ConversionStrategyName;
} {
  if (!config || typeof config !== "object") {
    throw domainError(
      DomainErrorCode.INVALID_CONVERSION_CONFIG,
      "Conversion config must be an object.",
    );
  }
  const strategy = config.strategy ?? DEFAULT_CONVERSION_STRATEGY;
  if (strategy !== "linear") {
    throw domainError(
      DomainErrorCode.INVALID_CONVERSION_CONFIG,
      `Unsupported conversion strategy "${String(strategy)}". Supported: "linear".`,
      { strategy },
    );
  }
  if (!Number.isFinite(config.maxGpa) || config.maxGpa <= 0) {
    throw domainError(
      DomainErrorCode.INVALID_CONVERSION_CONFIG,
      `maxGpa must be a positive finite number (got ${config.maxGpa}).`,
      { maxGpa: config.maxGpa },
    );
  }
  return { maxGpa: config.maxGpa, strategy };
}

/**
 * Convert a CGPA to a percentage using the configured strategy.
 *
 * Linear formula: `percentage = (cgpa / maxGpa) × 100`.
 *
 * @throws `INVALID_CGPA` if `cgpa` is non-finite, negative, or exceeds `maxGpa`.
 * @throws `INVALID_CONVERSION_CONFIG` if the config is malformed.
 */
export function cgpaToPercentage(
  cgpa: number,
  config: ConversionConfig,
): CgpaToPercentageResult {
  const { maxGpa, strategy } = validateConfig(config);

  if (!Number.isFinite(cgpa) || cgpa < 0) {
    throw domainError(
      DomainErrorCode.INVALID_CGPA,
      `CGPA must be a finite non-negative number (got ${cgpa}).`,
      { cgpa },
    );
  }
  if (cgpa > maxGpa) {
    throw domainError(
      DomainErrorCode.INVALID_CGPA,
      `CGPA (${cgpa}) exceeds maxGpa (${maxGpa}).`,
      { cgpa, maxGpa },
    );
  }

  const rawPercentage = (cgpa / maxGpa) * 100;
  return {
    percentage: roundTo(rawPercentage, RESULT_DECIMALS),
    cgpa: roundTo(cgpa, RESULT_DECIMALS),
    maxGpa,
    strategy,
  };
}

/**
 * Convert a percentage to a CGPA using the configured strategy.
 *
 * Linear formula: `cgpa = (percentage / 100) × maxGpa`.
 *
 * @throws `INVALID_PERCENTAGE` if `percentage` is non-finite, negative, or > 100.
 * @throws `INVALID_CONVERSION_CONFIG` if the config is malformed.
 */
export function percentageToCgpa(
  percentage: number,
  config: ConversionConfig,
): PercentageToCgpaResult {
  const { maxGpa, strategy } = validateConfig(config);

  if (!Number.isFinite(percentage) || percentage < 0) {
    throw domainError(
      DomainErrorCode.INVALID_PERCENTAGE,
      `Percentage must be a finite non-negative number (got ${percentage}).`,
      { percentage },
    );
  }
  if (percentage > 100) {
    throw domainError(
      DomainErrorCode.INVALID_PERCENTAGE,
      `Percentage (${percentage}) cannot exceed 100.`,
      { percentage },
    );
  }

  const rawCgpa = (percentage / 100) * maxGpa;
  return {
    cgpa: roundTo(rawCgpa, RESULT_DECIMALS),
    percentage: roundTo(percentage, RESULT_DECIMALS),
    maxGpa,
    strategy,
  };
}
