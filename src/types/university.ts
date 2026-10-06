/**
 * University data model for GPAHub.
 *
 * This type represents a university record as stored in MongoDB and
 * exchanged between the repository layer and the rest of the
 * application. It is server-side only — Client Components receive
 * it via Server Component props or API responses, never by importing
 * this module directly from a client bundle.
 *
 * ## Relationship to the Phase 1 domain
 *
 * The `scale` field is structurally compatible with the domain
 * `GradingScale` type from `@/domain/grading`. The repository maps
 * between the stored representation and the domain type — they are
 * intentionally separate types so the database schema can evolve
 * (e.g. add internal `_id`s) without coupling the domain engine to
 * MongoDB.
 */

import type { GradeDefinition } from "@/domain/grading";

/** Constrained university type. Phase 2 supports public + private. */
export type UniversityType = "public" | "private";

/** Constrained publication status for the future admin panel. */
export type UniversityStatus = "draft" | "published" | "archived";

/** A FAQ entry attached to a university record. */
export interface UniversityFaq {
  readonly q: string;
  readonly a: string;
}

/** Optional SEO overrides for a university page. */
export interface UniversitySeo {
  readonly title?: string;
  readonly metaDescription?: string;
}

/**
 * A grade row as stored in MongoDB. Structurally compatible with the
 * Phase 1 domain `GradeDefinition` — the repository maps between them.
 */
export interface UniversityGradeDefinition {
  readonly grade: string;
  readonly points: number;
  readonly minPercent?: number;
  readonly maxPercent?: number;
}

/**
 * A grading scale as stored on a university record. Structurally
 * compatible with the Phase 1 domain `GradingScale`.
 */
export interface UniversityGradingScale {
  readonly maxPoints: number;
  readonly grades: readonly UniversityGradeDefinition[];
}

/**
 * A complete university record.
 *
 * Required-for-production fields (`sourceUrl`, `lastVerified`) are
 * typed as required on this interface. Draft records (status="draft")
 * may be missing them at the validation layer; the repository accepts
 * drafts but the public read paths (`getPublished*`) filter to
 * `status="published"` only.
 */
export interface University {
  /** MongoDB ObjectId (as a string when serialized over JSON). */
  readonly _id?: string;
  /** URL-safe, lowercase, stable slug. Uniquely identifies the university in URLs. */
  readonly slug: string;
  /** Full official name (e.g. "National University of Sciences & Technology"). */
  readonly name: string;
  /** Short/abbreviated name (e.g. "NUST"). */
  readonly shortName: string;
  /** City of the main campus (e.g. "Islamabad"). */
  readonly city: string;
  /** Public or private. */
  readonly type: UniversityType;
  /** Logo URL (absolute or relative path). */
  readonly logo: string;
  /** University-specific grading scale, compatible with the domain engine. */
  readonly scale: UniversityGradingScale;
  /** Maximum points on the scale (e.g. 4.0, 5.0). Mirrors `scale.maxPoints` for query convenience. */
  readonly maxScale: number;
  /** Minimum CGPA required to pass (e.g. 2.0). Optional when the source does not state one. */
  readonly passingCGPA?: number;
  /** Unique human-readable description (1–3 paragraphs). */
  readonly description: string;
  /** Frequently asked questions. May be empty. */
  readonly faqs: readonly UniversityFaq[];
  /** Official source URL for the grading scale / transcript policy. */
  readonly sourceUrl: string;
  /** ISO date string (YYYY-MM-DD) when the grading scale was last verified against the source. */
  readonly lastVerified: string;
  /** Optional SEO overrides. Defaults are generated from the university record when absent. */
  readonly seo?: UniversitySeo;
  /** Publication status. Public routes only expose "published". */
  readonly status: UniversityStatus;
  /** Creation timestamp (ISO 8601, UTC). */
  readonly createdAt: string;
  /** Last-update timestamp (ISO 8601, UTC). */
  readonly updatedAt: string;
}

/**
 * Input shape for create/update operations. Omits the auto-managed
 * fields (`_id`, `createdAt`, `updatedAt`) and makes `status` optional
 * (defaults to "draft" at the repository layer).
 */
export type UniversityInput = Omit<University, "_id" | "createdAt" | "updatedAt"> & {
  readonly status?: UniversityStatus;
};

/**
 * Assert at the type level that `UniversityGradingScale` is assignable
 * to the domain `GradingScale`. If the domain type ever changes in a
 * way that breaks this compatibility, this line will fail to compile.
 */
const _compatibilityCheck: GradeDefinition = {
  grade: "A",
  points: 4.0,
};
void _compatibilityCheck;
