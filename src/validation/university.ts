/**
 * Zod validation schemas for university records.
 *
 * These schemas are the single source of truth for "what is a valid
 * GPAHub university record". They guard:
 *   - the seed script (records are validated before upsert)
 *   - future admin write endpoints (Phase 4+)
 *   - the repository's `create` / `update` methods
 *
 * ## Relationship to the domain layer
 *
 * The grading-scale rules here intentionally mirror the domain
 * `validateGradingScale` checks (positive maxPoints, non-empty
 * grades, no duplicates, finite points ≤ maxPoints). We do NOT
 * import the domain validator into Zod because Zod schemas need to
 * be self-describing for error messaging. Instead, the repository
 * runs BOTH: Zod for shape, then `validateGradingScale` from the
 * domain for the engine's stricter guarantees. This is documented
 * duplication, not accidental.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/**
 * Slug regex: lowercase letters, digits, hyphens. Must start and end
 * with a letter or digit. No consecutive hyphens. 2–60 chars.
 *
 * Examples that pass: nust, numl, comsats, air-university, iiui.
 * Examples that fail: NUST, nust_, -nust, nust--, n, "".
 */
export const slugSchema = z
  .string()
  .min(2, "Slug must be at least 2 characters")
  .max(60, "Slug must be at most 60 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase, URL-safe, hyphenated, and start/end with a letter or digit",
  );

export const universityTypeSchema = z.enum(["public", "private"], {
  message: "University type must be 'public' or 'private'",
});

export const universityStatusSchema = z.enum(["draft", "published", "archived"], {
  message: "Status must be 'draft', 'published', or 'archived'",
});

/**
 * ISO date string (YYYY-MM-DD). Validates the format AND the actual
 * calendar date (rejects 2026-02-31, 2026-13-01, etc.).
 *
 * JavaScript's `Date` constructor silently rolls over impossible dates
 * (Feb 31 → March 3) instead of returning NaN, so we explicitly compare
 * the parsed year/month/day components against the input.
 */
export const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((val) => {
    const [y, m, d] = val.split("-").map(Number);
    if (!y || !m || !d) return false;
    const date = new Date(Date.UTC(y, m - 1, d));
    return (
      date.getUTCFullYear() === y &&
      date.getUTCMonth() === m - 1 &&
      date.getUTCDate() === d
    );
  }, "Date must be a valid calendar date");

// ---------------------------------------------------------------------------
// Grading scale (structurally compatible with domain GradingScale)
// ---------------------------------------------------------------------------

export const gradeDefinitionSchema = z
  .object({
    grade: z
      .string()
      .min(1, "Grade label cannot be empty")
      .max(10, "Grade label is too long (max 10 chars)"),
    points: z
      .number()
      .finite("Grade points must be a finite number")
      .min(0, "Grade points cannot be negative"),
    minPercent: z
      .number()
      .finite()
      .min(0)
      .max(100)
      .optional(),
    maxPercent: z
      .number()
      .finite()
      .min(0)
      .max(100)
      .optional(),
  })
  .strict();

export const gradingScaleSchema = z
  .object({
    maxPoints: z
      .number()
      .finite("maxPoints must be finite")
      .positive("maxPoints must be positive"),
    grades: z
      .array(gradeDefinitionSchema)
      .min(1, "Grading scale must contain at least one grade"),
  })
  .strict()
  .superRefine((scale, ctx) => {
    // No duplicate grade labels (case-insensitive).
    const seen = new Set<string>();
    for (const g of scale.grades) {
      const key = g.grade.trim().toLowerCase();
      if (seen.has(key)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Duplicate grade "${g.grade}" (case-insensitive)`,
          path: ["grades"],
        });
      }
      seen.add(key);

      // Points cannot exceed maxPoints.
      if (g.points > scale.maxPoints) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Grade "${g.grade}" points (${g.points}) exceed maxPoints (${scale.maxPoints})`,
          path: ["grades"],
        });
      }

      // If both percent bounds are present, min <= max.
      if (
        g.minPercent !== undefined &&
        g.maxPercent !== undefined &&
        g.minPercent > g.maxPercent
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Grade "${g.grade}" minPercent (${g.minPercent}) cannot exceed maxPercent (${g.maxPercent})`,
          path: ["grades"],
        });
      }
    }
  });

// ---------------------------------------------------------------------------
// FAQ + SEO
// ---------------------------------------------------------------------------

export const faqSchema = z
  .object({
    q: z.string().min(3, "FAQ question must be at least 3 characters").max(300),
    a: z.string().min(3, "FAQ answer must be at least 3 characters").max(2000),
  })
  .strict();

export const seoSchema = z
  .object({
    title: z.string().min(10, "SEO title must be at least 10 characters").max(70).optional(),
    metaDescription: z
      .string()
      .min(50, "Meta description must be at least 50 characters")
      .max(170)
      .optional(),
  })
  .strict();

// ---------------------------------------------------------------------------
// Full university record
// ---------------------------------------------------------------------------

/**
 * Schema for a complete university record (the shape stored in MongoDB,
 * minus the auto-managed `_id` / `createdAt` / `updatedAt`).
 *
 * `status` is required here so the seed script is forced to declare it
 * explicitly. Drafts created via the future admin panel will use a
 * separate (looser) input schema.
 */
export const universitySchema = z
  .object({
    slug: slugSchema,
    name: z.string().min(3, "Name must be at least 3 characters").max(120),
    shortName: z.string().min(2, "Short name must be at least 2 characters").max(30),
    city: z.string().min(2, "City must be at least 2 characters").max(60),
    type: universityTypeSchema,
    logo: z.string().min(1, "Logo is required"),
    scale: gradingScaleSchema,
    maxScale: z
      .number()
      .finite()
      .positive("maxScale must be positive"),
    passingCGPA: z
      .number()
      .finite()
      .min(0)
      .optional(),
    description: z
      .string()
      .min(50, "Description must be at least 50 characters")
      .max(2000, "Description must be at most 2000 characters"),
    faqs: z.array(faqSchema).max(20, "A university can have at most 20 FAQs"),
    sourceUrl: z
      .string()
      .url("sourceUrl must be a valid absolute URL")
      .refine(
        (val) => val.startsWith("http://") || val.startsWith("https://"),
        "sourceUrl must use http or https",
      ),
    lastVerified: isoDateSchema,
    seo: seoSchema.optional(),
    status: universityStatusSchema,
  })
  .strict()
  .superRefine((uni, ctx) => {
    // maxScale must equal scale.maxPoints (single source of truth).
    if (uni.maxScale !== uni.scale.maxPoints) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `maxScale (${uni.maxScale}) must equal scale.maxPoints (${uni.scale.maxPoints})`,
        path: ["maxScale"],
      });
    }

    // Published records must have a passingCGPA when maxScale >= 4.0
    // (universities universally define a pass threshold on 4.0+ scales).
    // This is intentionally conservative — we'd rather reject a record
    // than publish unverifiable data.
    if (uni.status === "published" && uni.maxScale >= 4.0 && uni.passingCGPA === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Published universities with maxScale >= 4.0 must declare a passingCGPA",
        path: ["passingCGPA"],
      });
    }

    // Published records must have a non-empty sourceUrl (already required
    // above, but reaffirm here for clarity in error reporting).
    if (uni.status === "published" && uni.sourceUrl.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Published universities must have a sourceUrl",
        path: ["sourceUrl"],
      });
    }
  });

/** Inferred TypeScript type from the schema (matches `UniversityInput` shape). */
export type UniversityRecord = z.infer<typeof universitySchema>;

/**
 * Validate a university record. Returns a typed result so callers can
 * branch without try/catch if they prefer.
 */
export function validateUniversity(record: unknown):
  | { success: true; data: UniversityRecord }
  | { success: false; error: z.ZodError } {
  return universitySchema.safeParse(record);
}

/**
 * Validate a university record, throwing on failure. Use this in the
 * seed script and admin write paths where a failure should halt the
 * operation with a clear error.
 */
export function parseUniversity(record: unknown): UniversityRecord {
  return universitySchema.parse(record);
}
