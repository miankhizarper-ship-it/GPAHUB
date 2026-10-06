/**
 * University repository — the only place in the codebase that issues
 * MongoDB queries against the `universities` collection.
 *
 * Higher layers (Server Components, API routes, the seed script) call
 * these methods and receive plain `University` objects. Driver-specific
 * types (`WithId<Document>`, `ObjectId`) never leak out.
 *
 * ## Server-only
 *
 * This module imports `"server-only"`. Client Components must not
 * import it — they receive university data via Server Component props
 * or API responses.
 *
 * ## Validation contract
 *
 * - Read methods return `University | null` (or `University[]`).
 * - Write methods (`create`, `update`, `archive`) validate the input
 *   with the Zod `universitySchema` before touching the database.
 *   A `ZodError` is thrown on invalid input — callers should catch
 *   and translate to HTTP 400 in API routes.
 * - Write methods do NOT re-validate the grading scale with the domain
 *   `validateGradingScale`; the Zod schema mirrors those rules. A
 *   future hardening pass could add the domain check as a second gate.
 *
 * ## Idempotency
 *
 * `create` upserts on `slug` so the seed script can call it safely.
 * `update` matches by `slug` and updates `updatedAt` automatically.
 */

import "server-only";
import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongo";
import { UNIVERSITY_COLLECTION } from "@/repositories/collections";
import { universitySchema, type UniversityRecord } from "@/validation/university";
import type {
  University,
  UniversityInput,
  UniversityStatus,
} from "@/types/university";

// ---------------------------------------------------------------------------
// Mapping: database document <-> domain object
// ---------------------------------------------------------------------------

/**
 * A raw document as it lives in MongoDB. Same shape as `University` but
 * with `_id` typed as `unknown` (the driver gives us an `ObjectId`; we
 * stringify it in the mapper). Timestamps are stored as ISO strings.
 */
type UniversityDocument = University & { _id?: unknown };

/** Map a MongoDB document to a `University` (stringifying the driver `_id`). */
function toUniversity(doc: UniversityDocument): University {
  const { _id, ...rest } = doc;
  return {
    ...rest,
    _id: _id !== undefined && _id !== null ? String(_id) : undefined,
  } as University;
}

async function getCollection(): Promise<Collection<UniversityDocument>> {
  const db = await getDb();
  return db.collection<UniversityDocument>(UNIVERSITY_COLLECTION);
}

// ---------------------------------------------------------------------------
// Read methods
// ---------------------------------------------------------------------------

/**
 * Get a university by slug, regardless of status. Use this in admin
 * contexts. Public routes should use `getPublishedBySlug` instead.
 */
export async function getBySlug(slug: string): Promise<University | null> {
  const collection = await getCollection();
  const doc = await collection.findOne({ slug });
  return doc ? toUniversity(doc) : null;
}

/**
 * Get a published university by slug. Returns `null` for drafts and
 * archived records — public routes must never see them.
 */
export async function getPublishedBySlug(
  slug: string,
): Promise<University | null> {
  const collection = await getCollection();
  const doc = await collection.findOne({ slug, status: "published" });
  return doc ? toUniversity(doc) : null;
}

/**
 * Get all universities (any status). Intended for the admin panel.
 * Sorted by name ascending.
 */
export async function getAll(): Promise<University[]> {
  const collection = await getCollection();
  const docs = await collection.find({}).sort({ name: 1 }).toArray();
  return docs.map(toUniversity);
}

/**
 * Get all published universities. Intended for public listing pages.
 * Sorted by name ascending.
 */
export async function getPublished(): Promise<University[]> {
  const collection = await getCollection();
  const docs = await collection
    .find({ status: "published" })
    .sort({ name: 1 })
    .toArray();
  return docs.map(toUniversity);
}

// ---------------------------------------------------------------------------
// Write methods
// ---------------------------------------------------------------------------

/**
 * Current UTC timestamp as an ISO 8601 string (e.g. "2026-10-06T15:30:00.000Z").
 * Stored on `createdAt` / `updatedAt` for every write.
 */
function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Create a university record. Upserts on `slug` — calling `create`
 * twice with the same slug updates the existing record. This makes
 * the seed script idempotent without it needing to know whether each
 * record already exists.
 *
 * @throws {z.ZodError} if `input` fails validation.
 */
export async function create(input: UniversityInput): Promise<University> {
  // Validate before touching the database. `parse` throws ZodError on
  // invalid input — callers catch and translate.
  const validated: UniversityRecord = universitySchema.parse({
    ...input,
    status: input.status ?? "draft",
  });

  const collection = await getCollection();
  const now = nowIso();
  const document: UniversityDocument = {
    ...validated,
    createdAt: now,
    updatedAt: now,
  };

  await collection.updateOne(
    { slug: validated.slug },
    { $set: document },
    { upsert: true },
  );

  // Read back so we return the canonical stored record (with `_id`).
  const stored = await collection.findOne({ slug: validated.slug });
  if (!stored) {
    throw new Error(
      `Failed to read back university after upsert (slug=${validated.slug})`,
    );
  }
  return toUniversity(stored);
}

/**
 * Update a university by slug. Only the supplied fields are updated
 * (patch semantics). `slug` itself is NOT changeable via this method —
 * a slug change is a migration operation and will land in a future
 * phase with redirect handling.
 *
 * @throws {z.ZodError} if the patched record fails validation.
 * @throws {Error} if no university exists with the given slug.
 */
export async function update(
  slug: string,
  patch: Partial<UniversityInput>,
): Promise<University> {
  const collection = await getCollection();
  const existing = await collection.findOne({ slug });
  if (!existing) {
    throw new Error(`University not found (slug=${slug})`);
  }

  // Merge then validate the full record so superRefine rules (e.g.
  // maxScale === scale.maxPoints) always run against the complete shape.
  const merged: UniversityInput = {
    slug: existing.slug,
    name: existing.name,
    shortName: existing.shortName,
    city: existing.city,
    type: existing.type,
    logo: existing.logo,
    scale: existing.scale,
    maxScale: existing.maxScale,
    passingCGPA: existing.passingCGPA,
    description: existing.description,
    faqs: existing.faqs,
    sourceUrl: existing.sourceUrl,
    lastVerified: existing.lastVerified,
    seo: existing.seo,
    status: existing.status,
    ...patch,
  };

  const validated: UniversityRecord = universitySchema.parse(merged);

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
    throw new Error(
      `Failed to read back university after update (slug=${slug})`,
    );
  }
  return toUniversity(stored);
}

/**
 * Set a university's status. Used by the future admin panel to publish,
 * unpublish (→ draft), or archive a record.
 *
 * @throws {Error} if no university exists with the given slug.
 */
export async function setStatus(
  slug: string,
  status: UniversityStatus,
): Promise<University> {
  return update(slug, { status });
}

/**
 * Soft-delete a university by archiving it. The record stays in the
 * database (for audit / undo) but `getPublished` no longer returns it.
 */
export async function archive(slug: string): Promise<University> {
  return setStatus(slug, "archived");
}

/**
 * Hard-delete a university record from the database.
 *
 * This is irreversible. The admin UI must confirm with a dialog before
 * calling this. Prefer `archive()` for soft-delete — `delete` is for
 * permanently removing a mistakenly-created record.
 *
 * @returns `true` if a record was deleted, `false` if no record matched.
 */
export async function deleteUniversity(slug: string): Promise<boolean> {
  const collection = await getCollection();
  const result = await collection.deleteOne({ slug });
  return result.deletedCount > 0;
}
