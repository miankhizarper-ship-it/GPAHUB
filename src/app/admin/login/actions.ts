"use server";

/**
 * Login rate-limit check server action.
 *
 * Called by the login form BEFORE posting credentials to NextAuth.
 * If the IP is blocked, returns an error and the form never sends
 * credentials. On success, the form proceeds to POST to NextAuth.
 *
 * After a failed NextAuth attempt, the form calls `recordLoginFailure`
 * to increment the IP's failure count. On success, it calls
 * `clearLoginAttempts` to reset.
 */

import { headers } from "next/headers";
import {
  isLoginBlocked,
  recordFailedLogin,
  clearFailedLogins,
  getRemainingAttempts,
} from "@/repositories/login-attempts.repository";

export type LoginCheckResult =
  | { ok: true; remainingAttempts: number }
  | { ok: false; error: string; retryAfterSeconds: number };

/** Extract the client IP from request headers. */
async function getClientIp(): Promise<string> {
  const headerList = await headers();
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerList.get("x-real-ip") ??
    "unknown"
  );
}

/**
 * Check if the IP is allowed to attempt a login.
 * Call this before sending credentials to NextAuth.
 */
export async function checkLoginAllowed(): Promise<LoginCheckResult> {
  const ip = await getClientIp();
  const blocked = await isLoginBlocked(ip);

  if (blocked) {
    return {
      ok: false,
      error: "Too many failed attempts. Please try again later.",
      retryAfterSeconds: 15 * 60, // 15 minutes
    };
  }

  const remaining = await getRemainingAttempts(ip);
  return { ok: true, remainingAttempts: remaining };
}

/**
 * Record a failed login attempt (call after NextAuth rejects credentials).
 */
export async function recordLoginFailure(): Promise<void> {
  const ip = await getClientIp();
  await recordFailedLogin(ip);
}

/**
 * Clear failed login attempts (call after a successful login).
 */
export async function clearLoginAttempts(): Promise<void> {
  const ip = await getClientIp();
  await clearFailedLogins(ip);
}
