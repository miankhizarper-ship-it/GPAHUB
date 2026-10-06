"use server";

/**
 * Message CSV export server action.
 *
 * Exports all contact messages as a CSV string. Protects against
 * formula injection by prefixing cells that start with =, +, -, or @
 * with a single quote. Properly escapes commas, quotes, and newlines.
 */

import { requireAdmin } from "@/lib/session";
import { getAllMessages } from "@/repositories/messages.repository";

/**
 * Escape a CSV cell value.
 *
 * - Wraps the value in double quotes if it contains commas, quotes, or newlines.
 * - Escapes internal double quotes by doubling them.
 * - Prefixes cells starting with =, +, -, or @ with a single quote
 *   to prevent spreadsheet formula injection.
 */
function escapeCsvCell(value: string): string {
  // Formula injection protection.
  let safe = value;
  if (/^[=+\-@]/.test(safe)) {
    safe = `'${safe}`;
  }

  // Quote if needed.
  if (/[",\n\r]/.test(safe)) {
    safe = `"${safe.replace(/"/g, '""')}"`;
  }

  return safe;
}

/** CSV column headers. */
const CSV_HEADERS = ["Date", "Name", "Email", "Subject", "Message", "Read Status"];

/**
 * Export all messages as a CSV string.
 *
 * @returns `{ ok, csv }` on success, or `{ ok: false, error }` on failure.
 */
export async function exportMessagesCsvAction(): Promise<
  { ok: true; csv: string; filename: string } | { ok: false; error: string }
> {
  await requireAdmin();

  try {
    const messages = await getAllMessages();
    const rows = messages.map((m) => [
      m.createdAt,
      m.name,
      m.email,
      m.subject,
      m.message,
      m.readAt ? "read" : "unread",
    ]);

    const csvLines = [
      CSV_HEADERS.map(escapeCsvCell).join(","),
      ...rows.map((row) => row.map(escapeCsvCell).join(",")),
    ];

    const csv = csvLines.join("\n");
    const date = new Date().toISOString().slice(0, 10);
    const filename = `gpahub-messages-${date}.csv`;

    return { ok: true, csv, filename };
  } catch {
    return { ok: false, error: "Failed to export messages. Please try again." };
  }
}
