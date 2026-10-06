/**
 * Blog slug redirect repository.
 *
 * Manages slug redirects for blog posts. When a post's slug is changed,
 * a redirect record is created so the old URL 301-redirects to the new
 * URL instead of returning a 404.
 *
 * ## Safety
 *
 * - `oldSlug` is unique — only one redirect per old slug.
 * - Redirect loops are prevented: we don't create a redirect if the
 *   `newSlug` itself has a redirect pointing elsewhere.
 * - The target post must exist and be published for the redirect to
 *   work (checked at redirect time, not at creation time, because the
 *   post may be re-published later).
 */

import "server-only";
import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongo";
import { POST_REDIRECT_COLLECTION } from "@/repositories/collections";
import type { PostRedirect, PostRedirectInput } from "@/types/post-redirect";

type PostRedirectDocument = PostRedirect & { _id?: unknown };

function toRedirect(doc: PostRedirectDocument): PostRedirect {
  const { _id, ...rest } = doc;
  return {
    ...rest,
    _id: _id !== undefined && _id !== null ? String(_id) : undefined,
  } as PostRedirect;
}

async function getCollection(): Promise<Collection<PostRedirectDocument>> {
  const db = await getDb();
  return db.collection<PostRedirectDocument>(POST_REDIRECT_COLLECTION);
}

/**
 * Look up a redirect for an old slug.
 *
 * @returns The redirect record if found, `null` otherwise.
 * Follows chains (A→B→C) up to 5 hops to prevent infinite loops.
 */
export async function resolveRedirect(
  oldSlug: string,
  maxHops = 5,
): Promise<string | null> {
  const collection = await getCollection();
  let currentSlug = oldSlug;
  const visited = new Set<string>([oldSlug]);

  for (let i = 0; i < maxHops; i++) {
    const redirect = await collection.findOne({ oldSlug: currentSlug });
    if (!redirect) {
      // No redirect for this slug — it's the final destination.
      return currentSlug === oldSlug ? null : currentSlug;
    }

    currentSlug = redirect.newSlug;

    // Prevent redirect loops.
    if (visited.has(currentSlug)) {
      // Loop detected — abort and return null (will 404).
      return null;
    }
    visited.add(currentSlug);
  }

  // Exceeded max hops — abort.
  return null;
}

/**
 * Create a redirect from `oldSlug` to `newSlug`.
 *
 * - Does NOT create a redirect if `oldSlug === newSlug` (no-op).
 * - Does NOT create a redirect if `oldSlug` already has a redirect
 *   pointing to `newSlug` (idempotent).
 * - Does NOT create a redirect if `newSlug` itself redirects elsewhere
 *   (prevents chains that could become loops).
 *
 * @returns `true` if a redirect was created, `false` if it was skipped.
 */
export async function createRedirect(
  input: PostRedirectInput,
): Promise<boolean> {
  if (input.oldSlug === input.newSlug) {
    return false;
  }

  const collection = await getCollection();

  // Check if `newSlug` already has a redirect (would create a chain).
  const existingForNew = await collection.findOne({ oldSlug: input.newSlug });
  if (existingForNew) {
    // Don't create a chain — redirect to the final destination instead.
    return false;
  }

  // Upsert: if a redirect for oldSlug already exists, update it.
  await collection.updateOne(
    { oldSlug: input.oldSlug },
    {
      $set: {
        oldSlug: input.oldSlug,
        newSlug: input.newSlug,
        createdAt: new Date().toISOString(),
      },
    },
    { upsert: true },
  );

  return true;
}

/**
 * Delete all redirects pointing TO a given slug (used when a post is
 * permanently deleted — its redirects should be cleaned up).
 */
export async function deleteRedirectsTo(slug: string): Promise<void> {
  const collection = await getCollection();
  await collection.deleteMany({ newSlug: slug });
}

/**
 * Delete a specific redirect by oldSlug.
 */
export async function deleteRedirect(oldSlug: string): Promise<boolean> {
  const collection = await getCollection();
  const result = await collection.deleteOne({ oldSlug });
  return result.deletedCount > 0;
}
