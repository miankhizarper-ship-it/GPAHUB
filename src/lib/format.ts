/**
 * Shared formatting helpers for dates and display strings.
 * Pure functions — safe to use in both Server and Client Components.
 */

/**
 * Format an ISO date string (YYYY-MM-DD) as a human-readable date.
 * Example: "2026-01-15" → "January 15, 2026"
 */
export function formatDate(iso: string): string {
  if (!iso || iso.length < 10) return iso || "—";
  try {
    const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

/**
 * Format an ISO 8601 timestamp (e.g. "2026-10-06T15:30:00.000Z") as a
 * short date+time string. Returns "—" for empty input.
 *
 * Uses timeZone: "UTC" to ensure identical output on server and client
 * (prevents React hydration mismatch #441).
 */
export function formatTimestamp(iso: string): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}
