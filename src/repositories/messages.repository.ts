/**
 * Contact message repository + MongoDB-backed rate limiting.
 *
 * ## Rate limiting strategy
 *
 * IP-based rate limiting using a TTL-indexed `rate_limits` collection.
 * Each contact submission inserts a document with `expiresAt = now + window`.
 * Before accepting a submission, we count documents for the IP within
 * the window. If the count exceeds the limit, the request is rejected.
 *
 * ## Limitations of IP-based rate limiting
 *
 * - Multiple users behind the same NAT (university wifi, corporate proxy)
 *   share an IP and may hit the limit collectively.
 * - A determined attacker rotating across IPs can bypass this.
 * - This is a "good enough" first layer; a production hardening pass
 *   could add CAPTCHA or a third-party bot-protection service.
 *
 * ## Privacy
 *
 * We store only the IP hash (not the raw IP) in the rate_limits
 * collection to avoid collecting unnecessary personal data. The
 * messages collection stores no IP at all.
 */

import "server-only";
import { createHash } from "node:crypto";
import { ObjectId, type Collection, type Filter } from "mongodb";
import { getDb } from "@/lib/mongo";
import {
  MESSAGE_COLLECTION,
  RATE_LIMIT_COLLECTION,
} from "@/repositories/collections";
import { contactFormSchema } from "@/validation/contact";
import type { Message, MessageInput } from "@/types/message";

type MessageDocument = Omit<Message, "_id"> & { _id?: ObjectId };

interface RateLimitDocument {
  key: string;
  expiresAt: Date;
}

/** Rate limit: max 3 submissions per IP per 60-minute window. */
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

async function getMessageCollection(): Promise<Collection<MessageDocument>> {
  const db = await getDb();
  return db.collection<MessageDocument>(MESSAGE_COLLECTION);
}

async function getRateLimitCollection(): Promise<Collection<RateLimitDocument>> {
  const db = await getDb();
  return db.collection<RateLimitDocument>(RATE_LIMIT_COLLECTION);
}

/**
 * Hash an IP address for storage in the rate_limits collection.
 *
 * We store a SHA-256 hash (not the raw IP) so the database doesn't
 * contain a list of identifiable IP addresses. The hash is sufficient
 * for counting requests per IP within a time window.
 */
function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

/**
 * Check whether the given IP has exceeded the contact form rate limit.
 *
 * @returns `true` if the request is allowed, `false` if rate-limited.
 */
export async function checkRateLimit(ip: string): Promise<boolean> {
  const collection = await getRateLimitCollection();
  const key = hashIp(ip);
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  const count = await collection.countDocuments({
    key,
    expiresAt: { $gt: windowStart },
  });

  return count < RATE_LIMIT_MAX;
}

/**
 * Record a request in the rate-limit collection (called after a
 * successful or rejected submission so the count increments).
 */
async function recordRateLimitEntry(ip: string): Promise<void> {
  const collection = await getRateLimitCollection();
  const key = hashIp(ip);
  await collection.insertOne({
    key,
    expiresAt: new Date(Date.now() + RATE_LIMIT_WINDOW_MS),
  });
}

/**
 * Create a contact message.
 *
 * Validates input with Zod, checks the rate limit, then inserts the
 * message. Returns a safe result — never leaks database errors to the
 * caller.
 *
 * @returns `{ ok: true }` on success, or `{ ok: false, error }` with
 *          a user-safe error message.
 */
export async function createMessage(
  input: unknown,
  ip: string,
): Promise<{ ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> }> {
  // 1. Validate input.
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      if (!(path in fieldErrors)) {
        fieldErrors[path] = issue.message;
      }
    }
    return { ok: false, error: "Please fix the errors below.", fieldErrors };
  }

  // 2. Check rate limit BEFORE recording (so a rejected request doesn't
  //    consume the budget). We record after the check so the current
  //    request counts toward future limits.
  const allowed = await checkRateLimit(ip);
  if (!allowed) {
    return {
      ok: false,
      error: "Too many submissions from your IP. Please try again later.",
    };
  }

  // 3. Insert the message.
  try {
    const collection = await getMessageCollection();
    const now = new Date().toISOString();
    const document: MessageDocument = {
      ...parsed.data,
      readAt: null,
      createdAt: now,
    };
    await collection.insertOne(document);
    // 4. Record the rate-limit entry (consume the budget).
    await recordRateLimitEntry(ip);
    return { ok: true };
  } catch {
    // Never leak database error details to the user.
    return {
      ok: false,
      error: "Something went wrong on our end. Please try again later.",
    };
  }
}

// ---------------------------------------------------------------------------
// Admin inbox API
// ---------------------------------------------------------------------------

/** Map a MongoDB document to a `Message` (stringifying the driver `_id`). */
function toMessage(doc: MessageDocument): Message {
  const { _id, ...rest } = doc;
  return {
    ...rest,
    _id: _id !== undefined && _id !== null ? String(_id) : undefined,
  } as Message;
}

/**
 * Get all messages, sorted newest-first. Intended for the admin inbox.
 */
export async function getAllMessages(): Promise<Message[]> {
  const collection = await getMessageCollection();
  const docs = await collection
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  return docs.map(toMessage);
}

/**
 * Get a single message by its `_id` string. Returns `null` if not found.
 */
export async function getMessageById(id: string): Promise<Message | null> {
  const collection = await getMessageCollection();
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return null;
  }
  const doc = await collection.findOne({ _id: objectId });
  return doc ? toMessage(doc) : null;
}

/**
 * Count unread messages (readAt is null). Used for the admin nav badge
 * and dashboard stat.
 */
export async function getUnreadCount(): Promise<number> {
  const collection = await getMessageCollection();
  return collection.countDocuments({ readAt: null });
}

/**
 * Mark a message as read by setting `readAt` to the current time.
 *
 * @returns `true` if a message was updated, `false` if not found.
 */
export async function markMessageRead(id: string): Promise<boolean> {
  const collection = await getMessageCollection();
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return false;
  }
  const result = await collection.updateOne(
    { _id: objectId },
    { $set: { readAt: new Date().toISOString() } },
  );
  return result.modifiedCount > 0;
}

/**
 * Mark a message as unread by setting `readAt` back to null.
 *
 * @returns `true` if a message was updated, `false` if not found.
 */
export async function markMessageUnread(id: string): Promise<boolean> {
  const collection = await getMessageCollection();
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return false;
  }
  const result = await collection.updateOne(
    { _id: objectId },
    { $set: { readAt: null } },
  );
  return result.modifiedCount > 0;
}

/**
 * Hard-delete a message.
 *
 * @returns `true` if a message was deleted, `false` if not found.
 */
export async function deleteMessage(id: string): Promise<boolean> {
  const collection = await getMessageCollection();
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(id);
  } catch {
    return false;
  }
  const result = await collection.deleteOne({ _id: objectId });
  return result.deletedCount > 0;
}
