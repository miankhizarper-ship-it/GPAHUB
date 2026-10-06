"use server";

/**
 * Server actions for admin blog post management.
 *
 * Every action:
 *   1. Verifies authentication via `requireAdmin()`.
 *   2. Validates input with the admin Zod schema.
 *   3. Calls the repository (server-only, MongoDB).
 *   4. Revalidates affected public ISR routes.
 *   5. Returns a safe `{ ok, error }` result — never leaks internals.
 */

import { requireAdmin } from "@/lib/session";
import {
  create,
  update,
  updateWithSlugChange,
  setStatus,
  archive,
  deletePost,
  getBySlug,
} from "@/repositories/posts.repository";
import { createRedirect } from "@/repositories/post-redirects.repository";
import {
  adminPostSchema,
  postZodErrorToFieldMessages,
} from "@/validation/post";
import type { PostStatus } from "@/types/post";
import { recordAudit } from "@/repositories/audit.repository";
import { revalidatePath } from "next/cache";

export type PostActionResult =
  | { ok: true; slug: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Revalidate every public route affected by a blog post change. */
function revalidatePostPaths(slug: string): void {
  revalidatePath("/blog");
  revalidatePath(`/blog/[slug]`, "page");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

/** Create a new blog post. */
export async function createPostAction(
  formData: unknown,
): Promise<PostActionResult> {
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";

  const parsed = adminPostSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below and try again.",
      fieldErrors: postZodErrorToFieldMessages(parsed.error),
    };
  }

  // Check for slug collision.
  const existing = await getBySlug(parsed.data.slug);
  if (existing) {
    return {
      ok: false,
      error: "A post with this slug already exists.",
      fieldErrors: { slug: "This slug is already in use." },
    };
  }

  try {
    const input = {
      ...parsed.data,
      coverImage: parsed.data.coverImage || undefined,
      publishedAt: parsed.data.publishedAt || undefined,
      seo: parsed.data.seo?.title || parsed.data.seo?.metaDescription
        ? {
            title: parsed.data.seo.title || undefined,
            metaDescription: parsed.data.seo.metaDescription || undefined,
          }
        : undefined,
    };
    const created = await create(input);
    revalidatePostPaths(created.slug);
    await recordAudit({
      action: "POST_CREATED",
      entityType: "post",
      entityId: created.slug,
      entitySlug: created.slug,
      adminEmail,
      metadata: { title: created.title },
    });
    return { ok: true, slug: created.slug };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? `Failed to create post: ${e.message}`
          : "Failed to create post. Please try again.",
    };
  }
}

/** Update an existing blog post. Supports slug changes with automatic redirect creation. */
export async function updatePostAction(
  slug: string,
  formData: unknown,
): Promise<PostActionResult> {
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";

  const parsed = adminPostSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below and try again.",
      fieldErrors: postZodErrorToFieldMessages(parsed.error),
    };
  }

  const newSlug = parsed.data.slug;
  const slugChanged = newSlug !== slug;

  // Check for slug collision if the slug is changing.
  if (slugChanged) {
    const existing = await getBySlug(newSlug);
    if (existing) {
      return {
        ok: false,
        error: "A post with this slug already exists.",
        fieldErrors: { slug: "This slug is already in use by another post." },
      };
    }
  }

  try {
    const input = {
      ...parsed.data,
      coverImage: parsed.data.coverImage || undefined,
      publishedAt: parsed.data.publishedAt || undefined,
      seo: parsed.data.seo?.title || parsed.data.seo?.metaDescription
        ? {
            title: parsed.data.seo.title || undefined,
            metaDescription: parsed.data.seo.metaDescription || undefined,
          }
        : undefined,
    };

    let updated;
    if (slugChanged) {
      // Slug migration: update with slug change + create redirect.
      updated = await updateWithSlugChange(slug, newSlug, input);

      // Create redirect from old slug → new slug.
      // createRedirect is safe: prevents chains, idempotent.
      await createRedirect({ oldSlug: slug, newSlug });

      // Revalidate both old and new paths.
      revalidatePostPaths(newSlug);
      revalidatePath(`/blog/${slug}`);
    } else {
      updated = await update(slug, input);
      revalidatePostPaths(updated.slug);
    }

    await recordAudit({
      action: "POST_UPDATED",
      entityType: "post",
      entityId: updated.slug,
      entitySlug: updated.slug,
      adminEmail,
      metadata: {
        title: updated.title,
        ...(slugChanged ? { slugChanged: true, oldSlug: slug } : {}),
      },
    });
    return { ok: true, slug: updated.slug };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? `Failed to update post: ${e.message}`
          : "Failed to update post. Please try again.",
    };
  }
}

/** Publish a post (set status to "published"). */
export async function publishPostAction(slug: string): Promise<PostActionResult> {
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";
  try {
    await setStatus(slug, "published" as PostStatus);
    revalidatePostPaths(slug);
    await recordAudit({
      action: "POST_PUBLISHED",
      entityType: "post",
      entityId: slug,
      entitySlug: slug,
      adminEmail,
    });
    return { ok: true, slug };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? `Cannot publish: ${e.message}`
          : "Cannot publish this post. Ensure all required fields are filled.",
    };
  }
}

/** Unpublish a post (set status to "draft"). */
export async function unpublishPostAction(slug: string): Promise<PostActionResult> {
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";
  try {
    await setStatus(slug, "draft" as PostStatus);
    revalidatePostPaths(slug);
    await recordAudit({
      action: "POST_UNPUBLISHED",
      entityType: "post",
      entityId: slug,
      entitySlug: slug,
      adminEmail,
    });
    return { ok: true, slug };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to unpublish post.",
    };
  }
}

/** Archive a post (set status to "archived"). */
export async function archivePostAction(slug: string): Promise<PostActionResult> {
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";
  try {
    await archive(slug);
    revalidatePostPaths(slug);
    await recordAudit({
      action: "POST_ARCHIVED",
      entityType: "post",
      entityId: slug,
      entitySlug: slug,
      adminEmail,
    });
    return { ok: true, slug };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to archive post.",
    };
  }
}

/** Hard-delete a post. */
export async function deletePostAction(slug: string): Promise<PostActionResult> {
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";
  try {
    const deleted = await deletePost(slug);
    if (!deleted) {
      return { ok: false, error: "Post not found." };
    }
    revalidatePostPaths(slug);
    await recordAudit({
      action: "POST_DELETED",
      entityType: "post",
      entityId: slug,
      entitySlug: slug,
      adminEmail,
    });
    return { ok: true, slug };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to delete post.",
    };
  }
}
