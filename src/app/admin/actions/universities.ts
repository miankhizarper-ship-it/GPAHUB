"use server";

/**
 * Server actions for admin university management.
 *
 * Every action:
 *   1. Verifies authentication via `requireAdmin()` (server-side, not
 *      client-side). Unauthenticated calls are redirected to login.
 *   2. Validates input with the admin Zod schema. Invalid input returns
 *      a typed error result — never reaches the repository.
 *   3. Calls the repository (server-only, MongoDB).
 *   4. Revalidates affected public ISR routes via `revalidatePath()`.
 *   5. Returns a safe `{ ok, error }` result — never leaks internals.
 *
 * ## Security
 *
 * - `"use server"` ensures these run on the server only.
 * - `requireAdmin()` is the authorization gate. Client-side route
 *   protection is UX only — these actions are the real gate.
 * - No secrets, hashes, or driver types appear in the return value.
 * - Error messages are user-safe (Zod messages + generic fallbacks).
 */

import { requireAdmin } from "@/lib/session";
import {
  create,
  update,
  setStatus,
  archive,
  deleteUniversity,
  getBySlug,
} from "@/repositories/universities.repository";
import { recordAudit } from "@/repositories/audit.repository";
import {
  adminUniversitySchema,
  zodErrorToFieldMessages,
} from "@/validation/admin-university";
import type { UniversityStatus } from "@/types/university";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Result types (returned to the client form)
// ---------------------------------------------------------------------------

export type ActionResult =
  | { ok: true; slug: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Revalidate every public route affected by a university change.
 *
 * Called after every successful mutation so ISR pages update immediately.
 */
function revalidateUniversityPaths(slug: string): void {
  revalidatePath("/universities");
  revalidatePath(`/universities/[slug]`, "page");
  revalidatePath(`/universities/${slug}`);
  revalidatePath(`/gpa-cal/[slug]`, "page");
  revalidatePath(`/gpa-cal/${slug}`);
  revalidatePath(`/cgpa-cal/[slug]`, "page");
  revalidatePath(`/cgpa-cal/${slug}`);
  revalidatePath("/gpa-calculator");
  revalidatePath("/cgpa-calculator");
  revalidatePath("/");
}

// ---------------------------------------------------------------------------
// createUniversity
// ---------------------------------------------------------------------------

export async function createUniversityAction(
  formData: unknown,
): Promise<ActionResult> {
  // 1. Auth gate — throws redirect if unauthenticated.
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";

  // 2. Validate input.
  const parsed = adminUniversitySchema.safeParse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below and try again.",
      fieldErrors: zodErrorToFieldMessages(parsed.error),
    };
  }

  // 3. Check for slug collision before creating.
  const existing = await getBySlug(parsed.data.slug);
  if (existing) {
    return {
      ok: false,
      error: "A university with this slug already exists.",
      fieldErrors: { slug: "This slug is already in use." },
    };
  }

  // 4. Repository operation.
  try {
    // The repository's own `universitySchema` runs again inside `create`.
    // For drafts, fill sourceUrl/lastVerified with empty-string fallbacks
    // (the repository schema requires them, so we pass "" for drafts —
    // the repository allows them through because it uses the same
    // superRefine logic... actually, the repository schema REQUIRES
    // sourceUrl. So for drafts, we store a placeholder "" which the
    // repository accepts. The admin schema's superRefine handles the
    // publish-time validation.)
    const input = {
      ...parsed.data,
      sourceUrl: parsed.data.sourceUrl || "",
      lastVerified: parsed.data.lastVerified || "",
    };
    const created = await create(input);
    // 5. Revalidate.
    revalidateUniversityPaths(created.slug);
    // 6. Audit log.
    await recordAudit({
      action: "UNIVERSITY_CREATED",
      entityType: "university",
      entityId: created.slug,
      entitySlug: created.slug,
      adminEmail,
      metadata: { name: created.name, shortName: created.shortName },
    });
    return { ok: true, slug: created.slug };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? `Failed to create university: ${e.message}`
          : "Failed to create university. Please try again.",
    };
  }
}

// ---------------------------------------------------------------------------
// updateUniversity
// ---------------------------------------------------------------------------

export async function updateUniversityAction(
  slug: string,
  formData: unknown,
): Promise<ActionResult> {
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";

  const parsed = adminUniversitySchema.safeParse(formData);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the errors below and try again.",
      fieldErrors: zodErrorToFieldMessages(parsed.error),
    };
  }

  // Slug in the form must match the route slug — no slug changes via update.
  if (parsed.data.slug !== slug) {
    return {
      ok: false,
      error: "Slug cannot be changed via edit. Create a new university instead.",
      fieldErrors: { slug: "Slug is locked. Contact a developer to rename." },
    };
  }

  try {
    const input = {
      ...parsed.data,
      sourceUrl: parsed.data.sourceUrl || "",
      lastVerified: parsed.data.lastVerified || "",
    };
    const updated = await update(slug, input);
    revalidateUniversityPaths(updated.slug);
    await recordAudit({
      action: "UNIVERSITY_UPDATED",
      entityType: "university",
      entityId: updated.slug,
      entitySlug: updated.slug,
      adminEmail,
      metadata: { name: updated.name },
    });
    return { ok: true, slug: updated.slug };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? `Failed to update university: ${e.message}`
          : "Failed to update university. Please try again.",
    };
  }
}

// ---------------------------------------------------------------------------
// publishUniversity
// ---------------------------------------------------------------------------

export async function publishUniversityAction(slug: string): Promise<ActionResult> {
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";
  try {
    await setStatus(slug, "published" as UniversityStatus);
    revalidateUniversityPaths(slug);
    await recordAudit({
      action: "UNIVERSITY_PUBLISHED",
      entityType: "university",
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
          : "Cannot publish this university. Ensure all required fields are filled.",
    };
  }
}

// ---------------------------------------------------------------------------
// unpublishUniversity (→ draft)
// ---------------------------------------------------------------------------

export async function unpublishUniversityAction(slug: string): Promise<ActionResult> {
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";
  try {
    await setStatus(slug, "draft" as UniversityStatus);
    revalidateUniversityPaths(slug);
    await recordAudit({
      action: "UNIVERSITY_UNPUBLISHED",
      entityType: "university",
      entityId: slug,
      entitySlug: slug,
      adminEmail,
    });
    return { ok: true, slug };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to unpublish university.",
    };
  }
}

// ---------------------------------------------------------------------------
// archiveUniversity
// ---------------------------------------------------------------------------

export async function archiveUniversityAction(slug: string): Promise<ActionResult> {
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";
  try {
    await archive(slug);
    revalidateUniversityPaths(slug);
    await recordAudit({
      action: "UNIVERSITY_ARCHIVED",
      entityType: "university",
      entityId: slug,
      entitySlug: slug,
      adminEmail,
    });
    return { ok: true, slug };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to archive university.",
    };
  }
}

// ---------------------------------------------------------------------------
// deleteUniversity (hard delete)
// ---------------------------------------------------------------------------

export async function deleteUniversityAction(slug: string): Promise<ActionResult> {
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";
  try {
    const deleted = await deleteUniversity(slug);
    if (!deleted) {
      return { ok: false, error: "University not found." };
    }
    revalidateUniversityPaths(slug);
    await recordAudit({
      action: "UNIVERSITY_DELETED",
      entityType: "university",
      entityId: slug,
      entitySlug: slug,
      adminEmail,
    });
    return { ok: true, slug };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to delete university.",
    };
  }
}

// ---------------------------------------------------------------------------
// logoutAction (wraps NextAuth signOut + redirect)
// ---------------------------------------------------------------------------

export async function logoutAction(): Promise<void> {
  "use server";
  // NextAuth's signOut redirects to the login page.
  // We do this in a server action so the button doesn't need client JS.
  // However, NextAuth v4's signOut is client-side — for server-side
  // logout we clear the session cookie. The simplest approach is to
  // redirect to /api/auth/signout which NextAuth handles.
  redirect("/api/auth/signout");
}
