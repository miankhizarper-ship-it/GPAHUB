/**
 * Audit log repository — records admin mutations for security tracing.
 *
 * Every admin server action calls `recordAudit()` after a successful
 * mutation. The audit log is append-only — entries are never updated
 * or deleted (except by a future retention policy, if needed).
 *
 * ## Safety
 *
 * - Never stores passwords, hashes, tokens, or session data.
 * - Metadata is bounded to safe, non-sensitive fields (slugs, counts).
 * - Server-only — no client component can import this module.
 */

import "server-only";
import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongo";
import { AUDIT_LOG_COLLECTION } from "@/repositories/collections";
import type { AuditLog, AuditLogInput, AuditEntityType } from "@/types/audit-log";
import { logger } from "@/lib/logger";

type AuditLogDocument = AuditLog & { _id?: unknown };

function toAuditLog(doc: AuditLogDocument): AuditLog {
  const { _id, ...rest } = doc;
  return {
    ...rest,
    _id: _id !== undefined && _id !== null ? String(_id) : undefined,
  } as AuditLog;
}

async function getCollection(): Promise<Collection<AuditLogDocument>> {
  const db = await getDb();
  return db.collection<AuditLogDocument>(AUDIT_LOG_COLLECTION);
}

/**
 * Record an audit log entry.
 *
 * This is fire-and-forget — if the DB is unavailable, the audit entry
 * is lost but the mutation still succeeds. Audit logging is best-effort
 * and must never block a successful operation.
 */
export async function recordAudit(input: AuditLogInput): Promise<void> {
  try {
    const collection = await getCollection();
    const entry: AuditLogDocument = {
      ...input,
      timestamp: new Date().toISOString(),
    };
    await collection.insertOne(entry);
  } catch (err) {
    // Audit logging is best-effort — log the error but don't fail the
    // mutation. The admin's action still succeeded.
    logger.warn("Failed to record audit log", {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      error: err instanceof Error ? err.message : "unknown",
    });
  }
}

/**
 * Get all audit log entries, sorted newest-first.
 * Intended for the admin audit log page.
 */
export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  const collection = await getCollection();
  const docs = await collection
    .find({})
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
  return docs.map(toAuditLog);
}

/**
 * Get audit log entries filtered by entity type, sorted newest-first.
 */
export async function getAuditLogsByEntity(
  entityType: AuditEntityType,
  limit = 100,
): Promise<AuditLog[]> {
  const collection = await getCollection();
  const docs = await collection
    .find({ entityType })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray();
  return docs.map(toAuditLog);
}

/**
 * Count total audit log entries. Used for the dashboard stat.
 */
export async function countAuditLogs(): Promise<number> {
  const collection = await getCollection();
  return collection.countDocuments({});
}
