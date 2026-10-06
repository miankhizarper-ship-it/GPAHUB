/**
 * Admin-facing validation schema for university create/update forms.
 *
 * The public `universitySchema` (in `university.ts`) requires
 * `sourceUrl` + `lastVerified` on every record, even drafts. The admin
 * form needs to be more lenient: an admin should be able to save a
 * draft without a source URL, then fill it in before publishing.
 *
 * This schema enforces:
 *   - Shape correctness on every save (slug format, types, grading scale structure)
 *   - Publishing rules only when `status === "published"`:
 *     - sourceUrl required + valid URL
 *     - lastVerified required + valid date
 *     - passingCGPA required when maxScale >= 4.0
 *     - at least 3 FAQs
 *
 * The server action runs this schema BEFORE calling the repository.
 * The repository's own `universitySchema` runs again as a second gate.
 * This double validation is intentional defense in depth.
 */

import { z } from "zod";
import {
  slugSchema,
  universityTypeSchema,
  universityStatusSchema,
  isoDateSchema,
  gradeDefinitionSchema,
  gradingScaleSchema,
  faqSchema,
  seoSchema,
} from "@/validation/university";

/**
 * Admin university input schema.
 *
 * Looser than `universitySchema` for drafts; enforces publishing rules
 * via superRefine when `status === "published"`.
 */
export const adminUniversitySchema = z
  .object({
    slug: slugSchema,
    name: z.string().min(3, "University name is required (min 3 characters)").max(120),
    shortName: z.string().min(2, "Short name is required (min 2 characters)").max(30),
    city: z.string().min(2, "City is required (min 2 characters)").max(60),
    type: universityTypeSchema,
    logo: z.string().min(1, "Logo path is required"),
    scale: gradingScaleSchema,
    maxScale: z
      .number()
      .finite("Maximum scale must be a finite number")
      .positive("Maximum scale must be positive"),
    passingCGPA: z
      .number()
      .finite()
      .min(0, "Passing CGPA cannot be negative")
      .optional(),
    description: z
      .string()
      .min(50, "Description must be at least 50 characters")
      .max(2000, "Description must be at most 2000 characters"),
    faqs: z.array(faqSchema).max(20, "A university can have at most 20 FAQs"),
    sourceUrl: z.string().optional().or(z.literal("")),
    lastVerified: z.string().optional().or(z.literal("")),
    seo: seoSchema.optional(),
    status: universityStatusSchema,
  })
  .superRefine((uni, ctx) => {
    // maxScale must equal scale.maxPoints (single source of truth).
    if (uni.maxScale !== uni.scale.maxPoints) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Maximum scale (${uni.maxScale}) must equal the grading scale max points (${uni.scale.maxPoints})`,
        path: ["maxScale"],
      });
    }

    // Publishing rules — only enforced when status === "published".
    if (uni.status === "published") {
      // sourceUrl required + valid URL for published records.
      if (!uni.sourceUrl || uni.sourceUrl.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Source URL is required before publishing",
          path: ["sourceUrl"],
        });
      } else {
        try {
          const url = new URL(uni.sourceUrl);
          if (url.protocol !== "http:" && url.protocol !== "https:") {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Source URL must use http or https",
              path: ["sourceUrl"],
            });
          }
        } catch {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Source URL must be a valid URL",
            path: ["sourceUrl"],
          });
        }
      }

      // lastVerified required + valid date for published records.
      if (!uni.lastVerified || uni.lastVerified.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Last verified date is required before publishing",
          path: ["lastVerified"],
        });
      } else {
        const dateCheck = isoDateSchema.safeParse(uni.lastVerified);
        if (!dateCheck.success) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Last verified date must be a valid YYYY-MM-DD date",
            path: ["lastVerified"],
          });
        }
      }

      // passingCGPA required for published records with maxScale >= 4.0.
      if (uni.maxScale >= 4.0 && uni.passingCGPA === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passing CGPA is required for published universities on a 4.0+ scale",
          path: ["passingCGPA"],
        });
      }

      // At least 3 FAQs for published records.
      if (uni.faqs.length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least 3 FAQs are required before publishing",
          path: ["faqs"],
        });
      }
    }
  });

export type AdminUniversityInput = z.infer<typeof adminUniversitySchema>;

/**
 * Validate an admin form submission.
 *
 * Returns a typed result. The server action uses this to produce
 * field-level error messages for the form.
 */
export function validateAdminUniversity(record: unknown):
  | { success: true; data: AdminUniversityInput }
  | { success: false; error: z.ZodError } {
  return adminUniversitySchema.safeParse(record);
}

/**
 * Convert a ZodError into a field-path → message map for the form.
 *
 * Example: `{ "sourceUrl": "Source URL is required before publishing" }`
 */
export function zodErrorToFieldMessages(
  error: z.ZodError,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    // Keep the first message per path (Zod may emit multiple).
    if (!(path in map)) {
      map[path] = issue.message;
    }
  }
  return map;
}
