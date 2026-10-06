/**
 * MongoDB index management for GPAHub.
 *
 * Indexes are created idempotently — calling `ensureUniversityIndexes`
 * multiple times is safe. The seed script calls this before upserting
 * so a fresh database is correctly indexed on first run.
 *
 * ## Index decisions
 *
 * | Collection  | Field       | Type    | Reason                                  |
 * |-------------|-------------|---------|-----------------------------------------|
 * | universities| slug        | unique  | Public URLs `/universities/[slug]` +   |
 * |             |             |         | `getBySlug` lookup. Must be unique.     |
 * | universities| status      | normal  | `getPublished()` filters by status.    |
 * |             |             |         | Low cardinality (3 values) so a        |
 * |             |             |         | compound index isn't justified yet.    |
 *
 * Indexes NOT added (and why):
 *
 * - `_id`: MongoDB creates this automatically.
 * - `name` unique: shortName collisions are fine (e.g. two campuses).
 *   `name` text search is a future Phase 5+ concern.
 * - `city`: no current query filters by city alone. Add when a
 *   "browse by city" page lands.
 * - `status + updatedAt`: no current query sorts published universities
 *   by recency. Add when an "recently updated" widget lands.
 *
 * Each future index should be added here with a one-line justification.
 */

import "server-only";
import { getDb } from "@/lib/mongo";
import {
  UNIVERSITY_COLLECTION,
  POST_COLLECTION,
  MESSAGE_COLLECTION,
  RATE_LIMIT_COLLECTION,
  LOGIN_ATTEMPTS_COLLECTION,
  AUDIT_LOG_COLLECTION,
  POST_REDIRECT_COLLECTION,
} from "@/repositories/collections";

/**
 * Ensure all Phase 2 indexes exist on the `universities` collection.
 *
 * Idempotent: safe to call on every seed run. Uses `createIndex` which
 * is a no-op if an identical index already exists.
 */
export async function ensureUniversityIndexes(): Promise<void> {
  const db = await getDb();
  const collection = db.collection(UNIVERSITY_COLLECTION);

  await Promise.all([
    // Unique slug — enforces the URL contract at the database layer.
    collection.createIndex(
      { slug: 1 },
      { unique: true, name: "uniq_slug" },
    ),
    // Status filter for `getPublished()`.
    collection.createIndex(
      { status: 1 },
      { name: "idx_status" },
    ),
  ]);
}

/**
 * Ensure all Phase 5 indexes exist on the `posts` collection.
 *
 * | Field         | Type    | Reason                                         |
 * |---------------|---------|------------------------------------------------|
 * | slug          | unique  | URL `/blog/[slug]` + `getPublishedBySlug`.     |
 * | publishedAt   | desc    | `getPublished()` sorts newest-first.           |
 * | status        | normal  | `getPublished()` filters by status.            |
 */
export async function ensurePostIndexes(): Promise<void> {
  const db = await getDb();
  const collection = db.collection(POST_COLLECTION);

  await Promise.all([
    collection.createIndex({ slug: 1 }, { unique: true, name: "uniq_slug" }),
    collection.createIndex(
      { publishedAt: -1 },
      { name: "idx_publishedAt_desc" },
    ),
    collection.createIndex({ status: 1 }, { name: "idx_status" }),
  ]);
}

/**
 * Ensure the TTL index exists on the `rate_limits` collection.
 *
 * Documents expire automatically after the TTL window, so the
 * collection stays small without manual cleanup.
 */
export async function ensureRateLimitIndexes(): Promise<void> {
  const db = await getDb();
  const collection = db.collection(RATE_LIMIT_COLLECTION);

  // TTL index: documents expire `expiresAt` seconds after their stored
  // timestamp. We store `expiresAt` as a Date and use `expiresAfterSeconds: 0`
  // so MongoDB uses the field value itself as the expiry time.
  await collection.createIndex(
    { expiresAt: 1 },
    { expireAfterSeconds: 0, name: "ttl_expiresAt" },
  );
  // Compound index for the rate-limit check query.
  await collection.createIndex(
    { key: 1, expiresAt: 1 },
    { name: "idx_key_expiresAt" },
  );
}

/**
 * Ensure all indexes across all collections. Called by the seed runner.
 */
export async function ensureAllIndexes(): Promise<void> {
  await Promise.all([
    ensureUniversityIndexes(),
    ensurePostIndexes(),
    ensureRateLimitIndexes(),
    ensureMessageIndexes(),
    ensureLoginAttemptIndexes(),
    ensureAuditLogIndexes(),
    ensurePostRedirectIndexes(),
  ]);
}

/**
 * Ensure Phase 6 indexes on the `messages` collection.
 *
 * | Field       | Type    | Reason                                          |
 * |-------------|---------|-------------------------------------------------|
 * | createdAt   | desc    | Admin inbox sorts newest-first.                 |
 * | readAt      | normal  | `getUnreadCount()` filters by `readAt: null`.   |
 */
export async function ensureMessageIndexes(): Promise<void> {
  const db = await getDb();
  const collection = db.collection(MESSAGE_COLLECTION);

  await Promise.all([
    collection.createIndex(
      { createdAt: -1 },
      { name: "idx_createdAt_desc" },
    ),
    collection.createIndex(
      { readAt: 1 },
      { name: "idx_readAt", sparse: true },
    ),
  ]);
}

/**
 * Ensure Phase 7 indexes on the `login_attempts` collection.
 *
 * | Field       | Type    | Reason                                          |
 * |-------------|---------|-------------------------------------------------|
 * | key         | normal  | `isLoginBlocked()` / `recordFailedLogin()`.    |
 * | timestamp   | normal  | Window query (within last 15 min).              |
 * | expiresAt   | TTL     | Auto-expire entries after the window.           |
 */
export async function ensureLoginAttemptIndexes(): Promise<void> {
  const db = await getDb();
  const collection = db.collection(LOGIN_ATTEMPTS_COLLECTION);

  await Promise.all([
    collection.createIndex(
      { key: 1, timestamp: 1 },
      { name: "idx_key_timestamp" },
    ),
    collection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, name: "ttl_expiresAt" },
    ),
  ]);
}

/**
 * Ensure Phase 7 indexes on the `audit_logs` collection.
 *
 * | Field       | Type    | Reason                                          |
 * |-------------|---------|-------------------------------------------------|
 * | timestamp   | desc    | Admin audit page sorts newest-first.            |
 * | entityType  | normal  | Filter by entity type.                          |
 * | action      | normal  | Filter by action.                               |
 *
 * No TTL — audit logs are retained indefinitely for accountability.
 * A future retention policy can be added if storage becomes an issue.
 */
export async function ensureAuditLogIndexes(): Promise<void> {
  const db = await getDb();
  const collection = db.collection(AUDIT_LOG_COLLECTION);

  await Promise.all([
    collection.createIndex(
      { timestamp: -1 },
      { name: "idx_timestamp_desc" },
    ),
    collection.createIndex(
      { entityType: 1 },
      { name: "idx_entityType" },
    ),
    collection.createIndex(
      { action: 1 },
      { name: "idx_action" },
    ),
  ]);
}

/**
 * Ensure Phase 9 indexes on the `post_redirects` collection.
 *
 * | Field       | Type    | Reason                                          |
 * |-------------|---------|-------------------------------------------------|
 * | oldSlug     | unique  | One redirect per old slug. Lookup by oldSlug.   |
 * | newSlug     | normal  | Cleanup when a target post is deleted.           |
 */
export async function ensurePostRedirectIndexes(): Promise<void> {
  const db = await getDb();
  const collection = db.collection(POST_REDIRECT_COLLECTION);

  await Promise.all([
    collection.createIndex(
      { oldSlug: 1 },
      { unique: true, name: "uniq_oldSlug" },
    ),
    collection.createIndex(
      { newSlug: 1 },
      { name: "idx_newSlug" },
    ),
  ]);
}
