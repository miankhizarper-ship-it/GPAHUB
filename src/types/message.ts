/**
 * Contact message data model for GPAHub.
 *
 * Represents a submission from the public contact form, stored in the
 * `messages` MongoDB collection. Server-side only.
 */

/**
 * A contact form submission.
 *
 * Only the fields the user explicitly submits are stored. No IP
 * addresses, user agents, or other tracking data are persisted on the
 * message record itself (rate-limit metadata is stored separately
 * with a TTL).
 *
 * `readAt` tracks whether an admin has opened the message:
 *   - `null` → unread (new submission)
 *   - ISO string → read by an admin on that date
 */
export interface Message {
  /** MongoDB ObjectId (as a string when serialized over JSON). */
  readonly _id?: string;
  /** Submitter's name. */
  readonly name: string;
  /** Submitter's email (for replies). */
  readonly email: string;
  /** Subject line. */
  readonly subject: string;
  /** Message body. */
  readonly message: string;
  /** Creation timestamp (ISO 8601, UTC). */
  readonly createdAt: string;
  /** Read timestamp — null when unread, ISO string when an admin has opened it. */
  readonly readAt?: string | null;
}

/** Input shape for creating a message. */
export type MessageInput = Omit<Message, "_id" | "createdAt" | "readAt">;
