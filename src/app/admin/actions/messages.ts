"use server";

/**
 * Server actions for admin message management.
 *
 * Every action verifies admin auth before touching the repository.
 * Message content is never returned in error messages.
 */

import { requireAdmin } from "@/lib/session";
import {
  markMessageRead,
  markMessageUnread,
  deleteMessage,
} from "@/repositories/messages.repository";
import { recordAudit } from "@/repositories/audit.repository";

export type MessageActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Mark a message as read. */
export async function markMessageReadAction(id: string): Promise<MessageActionResult> {
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";
  try {
    const updated = await markMessageRead(id);
    if (!updated) {
      return { ok: false, error: "Message not found." };
    }
    await recordAudit({
      action: "MESSAGE_MARKED_READ",
      entityType: "message",
      entityId: id,
      entitySlug: null,
      adminEmail,
    });
    return { ok: true, id };
  } catch {
    return { ok: false, error: "Failed to mark message as read." };
  }
}

/** Mark a message as unread. */
export async function markMessageUnreadAction(id: string): Promise<MessageActionResult> {
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";
  try {
    const updated = await markMessageUnread(id);
    if (!updated) {
      return { ok: false, error: "Message not found." };
    }
    await recordAudit({
      action: "MESSAGE_MARKED_UNREAD",
      entityType: "message",
      entityId: id,
      entitySlug: null,
      adminEmail,
    });
    return { ok: true, id };
  } catch {
    return { ok: false, error: "Failed to mark message as unread." };
  }
}

/** Delete a message permanently. */
export async function deleteMessageAction(id: string): Promise<MessageActionResult> {
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";
  try {
    const deleted = await deleteMessage(id);
    if (!deleted) {
      return { ok: false, error: "Message not found." };
    }
    await recordAudit({
      action: "MESSAGE_DELETED",
      entityType: "message",
      entityId: id,
      entitySlug: null,
      adminEmail,
    });
    return { ok: true, id };
  } catch {
    return { ok: false, error: "Failed to delete message." };
  }
}
