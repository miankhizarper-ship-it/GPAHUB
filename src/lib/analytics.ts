/**
 * Privacy-friendly analytics utility for GPAHub.
 *
 * Tracks anonymous, aggregate page views via server-side logging.
 * No cookies, no advertising identifiers, no personal profiling,
 * no IP storage, no calculator values or grades.
 *
 * ## What is tracked
 *
 * - Page type (calculator, university, blog, etc.)
 * - Page slug (for university/blog identification)
 * - Timestamp (via the log entry)
 *
 * ## What is NEVER tracked
 *
 * - GPA values, grades, credit hours, calculator inputs
 * - Contact message contents
 * - Admin credentials, session tokens, passwords
 * - IP addresses, user agents, device fingerprints
 * - Any personally identifiable information
 *
 * ## Implementation
 *
 * Currently logs to the server console (captured by Vercel runtime
 * logs). A future phase can pipe these into a privacy-friendly
 * analytics provider (e.g. Vercel Analytics, Plausible) without
 * changing the call sites.
 */

import "server-only";
import { logger } from "@/lib/logger";

/** Typed analytics events — only these are allowed. */
export type AnalyticsEvent =
  | { type: "calculator_view"; calculator: "gpa" | "cgpa" | "percentage"; universitySlug?: string }
  | { type: "calculator_completed"; calculator: "gpa" | "cgpa" | "percentage"; universitySlug?: string }
  | { type: "university_view"; slug: string }
  | { type: "blog_view"; slug: string };

/**
 * Track an analytics event.
 *
 * Server-side only. No PII is ever included. The event is logged to
 * the server console (structured JSON) for Vercel to capture.
 */
export function track(event: AnalyticsEvent): void {
  logger.info("analytics:event", event as unknown as Record<string, unknown>);
}
