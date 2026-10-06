/**
 * Blog post repository — the only place that issues MongoDB queries
 * against the `posts` collection.
 *
 * Mirrors the university repository pattern: server-only, returns plain
 * `Post` objects, driver-specific types never leak out.
 */

import "server-only";
import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongo";
import { POST_COLLECTION } from "@/repositories/collections";
import { postSchema, type PostRecord } from "@/validation/post";
import type { Post, PostInput, PostStatus } from "@/types/post";

type PostDocument = Post & { _id?: unknown };

function toPost(doc: PostDocument): Post {
  const { _id, ...rest } = doc;
  return {
    ...rest,
    _id: _id !== undefined && _id !== null ? String(_id) : undefined,
  } as Post;
}

async function getCollection(): Promise<Collection<PostDocument>> {
  const db = await getDb();
  return db.collection<PostDocument>(POST_COLLECTION);
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Get all published posts, sorted newest-first by `publishedAt`.
 * Intended for the public blog listing.
 */
export async function getPublished(): Promise<Post[]> {
  const collection = await getCollection();
  const docs = await collection
    .find({ status: "published" })
    .sort({ publishedAt: -1 })
    .toArray();
  return docs.map(toPost);
}

/**
 * Get a published post by slug. Returns `null` for drafts and unknown
 * slugs — public routes must never see drafts.
 */
export async function getPublishedBySlug(slug: string): Promise<Post | null> {
  const collection = await getCollection();
  const doc = await collection.findOne({ slug, status: "published" });
  return doc ? toPost(doc) : null;
}

/**
 * Get a post by slug regardless of status. Intended for the admin panel.
 */
export async function getBySlug(slug: string): Promise<Post | null> {
  const collection = await getCollection();
  const doc = await collection.findOne({ slug });
  return doc ? toPost(doc) : null;
}

/**
 * Get all posts (any status). Intended for the admin panel.
 * Sorted by updatedAt descending.
 */
export async function getAll(): Promise<Post[]> {
  const collection = await getCollection();
  const docs = await collection
    .find({})
    .sort({ updatedAt: -1 })
    .toArray();
  return docs.map(toPost);
}

/**
 * Create a post. Upserts on `slug` — idempotent for the seed script.
 *
 * @throws {z.ZodError} if `input` fails validation.
 */
export async function create(input: PostInput): Promise<Post> {
  const validated: PostRecord = postSchema.parse(input);

  const collection = await getCollection();
  const now = nowIso();
  const document: PostDocument = {
    ...validated,
    createdAt: now,
    updatedAt: now,
  };

  await collection.updateOne(
    { slug: validated.slug },
    { $set: document },
    { upsert: true },
  );

  const stored = await collection.findOne({ slug: validated.slug });
  if (!stored) {
    throw new Error(`Failed to read back post after upsert (slug=${validated.slug})`);
  }
  return toPost(stored);
}

/**
 * Update a post by slug. Only the supplied fields are updated (patch
 * semantics). The slug itself is NOT changeable via this method —
 * use `updateWithSlugChange` for slug migrations.
 *
 * @throws {z.ZodError} if the patched record fails validation.
 * @throws {Error} if no post exists with the given slug.
 */
export async function update(
  slug: string,
  patch: Partial<PostInput>,
): Promise<Post> {
  const collection = await getCollection();
  const existing = await collection.findOne({ slug });
  if (!existing) {
    throw new Error(`Post not found (slug=${slug})`);
  }

  // Merge then validate the full record.
  const merged: PostInput = {
    slug: existing.slug,
    title: existing.title,
    excerpt: existing.excerpt,
    content: existing.content,
    coverImage: existing.coverImage,
    publishedAt: existing.publishedAt,
    status: existing.status,
    seo: existing.seo,
    ...patch,
  };

  const validated: PostRecord = postSchema.parse(merged);

  await collection.updateOne(
    { slug },
    {
      $set: {
        ...validated,
        updatedAt: nowIso(),
      },
    },
  );

  const stored = await collection.findOne({ slug });
  if (!stored) {
    throw new Error(`Failed to read back post after update (slug=${slug})`);
  }
  return toPost(stored);
}

/**
 * Update a post AND change its slug.
 *
 * This is a migration operation — the old slug URL will break unless a
 * redirect is created (handled by the server action). The repository
 * method itself:
 *   1. Finds the post by `oldSlug`
 *   2. Validates the merged record with the new slug
 *   3. Deletes the old document
 *   4. Inserts the new document with the new slug
 *
 * This delete-then-insert approach is necessary because the `slug`
 * field has a unique index — we can't update it in place if another
 * post already uses the new slug (which would be a collision).
 *
 * @returns The updated post with the new slug.
 * @throws {z.ZodError} if the merged record fails validation.
 * @throws {Error} if no post exists with `oldSlug`.
 */
export async function updateWithSlugChange(
  oldSlug: string,
  newSlug: string,
  patch: Partial<PostInput>,
): Promise<Post> {
  const collection = await getCollection();

  // 1. Find the existing post by old slug.
  const existing = await collection.findOne({ slug: oldSlug });
  if (!existing) {
    throw new Error(`Post not found (slug=${oldSlug})`);
  }

  // 2. Check for slug collision (another post already has newSlug).
  const collision = await collection.findOne({ slug: newSlug });
  if (collision) {
    throw new Error(`A post with slug "${newSlug}" already exists`);
  }

  // 3. Merge + validate.
  const { slug: _oldSlug, ...patchWithoutSlug } = patch;
  void _oldSlug;
  const merged: Record<string, unknown> = {
    title: existing.title,
    excerpt: existing.excerpt,
    content: existing.content,
    coverImage: existing.coverImage,
    publishedAt: existing.publishedAt,
    status: existing.status,
    seo: existing.seo,
    ...patchWithoutSlug,
    slug: newSlug,
  };

  const validated: PostRecord = postSchema.parse(merged);

  // 4. Delete old document, insert new one.
  await collection.deleteOne({ slug: oldSlug });
  const now = nowIso();
  await collection.insertOne({
    ...validated,
    createdAt: existing.createdAt,
    updatedAt: now,
  });

  const stored = await collection.findOne({ slug: newSlug });
  if (!stored) {
    throw new Error(`Failed to read back post after slug change (newSlug=${newSlug})`);
  }
  return toPost(stored);
}

/**
 * Set a post's status. Used by the admin panel to publish, unpublish
 * (→ draft), or archive a post.
 *
 * @throws {Error} if no post exists with the given slug.
 */
export async function setStatus(
  slug: string,
  status: PostStatus,
): Promise<Post> {
  return update(slug, { status });
}

/**
 * Soft-delete a post by archiving it.
 */
export async function archive(slug: string): Promise<Post> {
  return setStatus(slug, "archived");
}

/**
 * Hard-delete a post record from the database.
 *
 * This is irreversible. The admin UI must confirm with a dialog before
 * calling this.
 *
 * @returns `true` if a record was deleted, `false` if no record matched.
 */
export async function deletePost(slug: string): Promise<boolean> {
  const collection = await getCollection();
  const result = await collection.deleteOne({ slug });
  return result.deletedCount > 0;
}
