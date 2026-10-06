/**
 * Public API of the GPAHub calculation domain.
 *
 * Future UI code should import from here:
 *
 *   import {
 *     calculateGpa,
 *     calculateCgpa,
 *     cgpaToPercentage,
 *     percentageToCgpa,
 *     DomainError,
 *   } from "@/domain";
 *
 * The domain layer is pure: no React, no Next.js, no MongoDB, no
 * browser APIs, no I/O. It is safe to import from Client Components,
 * Server Components, API routes, tests, and CLI scripts alike.
 */

export {
  DomainError,
  DomainErrorCode,
  domainError,
  isDomainError,
  type DomainErrorCode as DomainErrorCodeType,
} from "@/domain/errors";

export {
  type GradeDefinition,
  type GradingScale,
  type ResolvedGrade,
  validateGradingScale,
  resolveGrade,
  isGradingScale,
} from "@/domain/grading";

export {
  type SubjectInput,
  type GpaResult,
  calculateGpa,
} from "@/domain/gpa";

export {
  type SubjectSemesterInput,
  type SummarySemesterInput,
  type SemesterInput,
  type CgpaResult,
  type SemesterBreakdown,
  calculateCgpa,
} from "@/domain/cgpa";

export {
  type ConversionStrategyName,
  type ConversionConfig,
  type CgpaToPercentageResult,
  type PercentageToCgpaResult,
  DEFAULT_CONVERSION_STRATEGY,
  cgpaToPercentage,
  percentageToCgpa,
} from "@/domain/conversion";

export { RESULT_DECIMALS, roundTo } from "@/domain/precision";
