/**
 * Zod validation schemas for blog posts.
 *
 * - `postSchema` is the strict schema used by the repository + seed script.
 * - `adminPostSchema` is the looser schema used by the admin form —
 *   allows drafts to be saved without publishedAt, and enforces
 *   publishing rules via superRefine only when status === "published".
 *
 * Public read paths only surface `status === "published"`.
 */

import { z } from "zod";
import { slugSchema } from "@/validation/university";

export const postStatusSchema = z.enum(["draft", "published", "archived"], {
  message: "Status must be 'draft', 'published', or 'archived'",
});

// ---------------------------------------------------------------------------
// Strict schema (repository + seed)
// ---------------------------------------------------------------------------

export const postSchema = z
  .object({
    slug: slugSchema,
    title: z
      .string()
      .min(3, "Title must be at least 3 characters")
      .max(120, "Title must be at most 120 characters"),
    excerpt: z
      .string()
      .min(10, "Excerpt must be at least 10 characters")
      .max(300, "Excerpt must be at most 300 characters"),
    content: z
      .string()
      .min(20, "Content must be at least 20 characters")
      .max(50_000, "Content is too long (max 50,000 characters)"),
    coverImage: z.string().optional().or(z.literal("")),
    publishedAt: z.string().optional().or(z.literal("")),
    status: postStatusSchema,
    seo: z
      .object({
        title: z.string().min(10).max(70).optional().or(z.literal("")),
        metaDescription: z.string().min(50).max(170).optional().or(z.literal("")),
      })
      .strict()
      .optional(),
  })
  .strict()
  .superRefine((post, ctx) => {
    // Published posts must have a publishedAt date.
    if (post.status === "published" && (!post.publishedAt || post.publishedAt.trim() === "")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Published posts must have a publishedAt date",
        path: ["publishedAt"],
      });
    }
  });

export type PostRecord = z.infer<typeof postSchema>;

export function validatePost(record: unknown):
  | { success: true; data: PostRecord }
  | { success: false; error: z.ZodError } {
  return postSchema.safeParse(record);
}

// ---------------------------------------------------------------------------
// Admin schema (looser for drafts, strict for published)
// ---------------------------------------------------------------------------

/**
 * Admin post schema — allows drafts to be saved without publishedAt.
 * Enforces publishing rules via superRefine when status === "published".
 */
export const adminPostSchema = z
  .object({
    slug: slugSchema,
    title: z
      .string()
      .min(3, "Title is required (min 3 characters)")
      .max(120, "Title must be at most 120 characters"),
    excerpt: z
      .string()
      .min(10, "Excerpt must be at least 10 characters")
      .max(300, "Excerpt must be at most 300 characters"),
    content: z
      .string()
      .min(20, "Content must be at least 20 characters")
      .max(50_000, "Content is too long (max 50,000 characters)"),
    coverImage: z.string().optional().or(z.literal("")),
    publishedAt: z.string().optional().or(z.literal("")),
    status: postStatusSchema,
    seo: z
      .object({
        title: z.string().min(10, "SEO title must be at least 10 characters").max(70).optional().or(z.literal("")),
        metaDescription: z.string().min(50, "Meta description must be at least 50 characters").max(170).optional().or(z.literal("")),
      })
      .strict()
      .optional(),
  })
  .superRefine((post, ctx) => {
    // Publishing rules — only enforced when status === "published".
    if (post.status === "published") {
      if (!post.publishedAt || post.publishedAt.trim() === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Published date is required before publishing",
          path: ["publishedAt"],
        });
      }
    }
  });

export type AdminPostInput = z.infer<typeof adminPostSchema>;

export function validateAdminPost(record: unknown):
  | { success: true; data: AdminPostInput }
  | { success: false; error: z.ZodError } {
  return adminPostSchema.safeParse(record);
}

/**
 * Convert a ZodError into a field-path → message map for the form.
 */
export function postZodErrorToFieldMessages(
  error: z.ZodError,
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    if (!(path in map)) {
      map[path] = issue.message;
    }
  }
  return map;
}
