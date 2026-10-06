/**
 * Audit log data model for GPAHub.
 *
 * Records admin mutations for security tracing and accountability.
 * Server-side only — audit logs are never exposed to the public.
 */

/** Entity types that can be audited. */
export type AuditEntityType = "university" | "post" | "message";

/** Audit actions — covers all admin mutations. */
export type AuditAction =
  | "UNIVERSITY_CREATED"
  | "UNIVERSITY_UPDATED"
  | "UNIVERSITY_PUBLISHED"
  | "UNIVERSITY_UNPUBLISHED"
  | "UNIVERSITY_ARCHIVED"
  | "UNIVERSITY_DELETED"
  | "POST_CREATED"
  | "POST_UPDATED"
  | "POST_PUBLISHED"
  | "POST_UNPUBLISHED"
  | "POST_ARCHIVED"
  | "POST_DELETED"
  | "MESSAGE_MARKED_READ"
  | "MESSAGE_MARKED_UNREAD"
  | "MESSAGE_DELETED";

/** A single audit log entry. */
export interface AuditLog {
  /** MongoDB ObjectId (as a string when serialized over JSON). */
  readonly _id?: string;
  /** What action was performed. */
  readonly action: AuditAction;
  /** What type of entity was affected. */
  readonly entityType: AuditEntityType;
  /** Entity identifier (slug for universities/posts, ObjectId string for messages). */
  readonly entityId: string;
  /** Entity slug when applicable (null for messages). */
  readonly entitySlug?: string | null;
  /** Admin email who performed the action. */
  readonly adminEmail: string;
  /** Timestamp (ISO 8601, UTC). */
  readonly timestamp: string;
  /** Safe, bounded metadata (never secrets, passwords, or full content). */
  readonly metadata?: Record<string, unknown>;
}

/** Input for creating an audit log entry. */
export type AuditLogInput = Omit<AuditLog, "_id" | "timestamp">;
