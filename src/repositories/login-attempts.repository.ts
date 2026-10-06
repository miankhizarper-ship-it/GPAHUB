/**
 * Login attempt tracking + server-side rate limiting for admin login.
 *
 * Uses a MongoDB TTL-indexed `login_attempts` collection to track
 * failed login attempts per IP. After too many failures within a time
 * window, the IP is temporarily blocked.
 *
 * ## Policy
 *
 * - Max 5 failed attempts per IP per 15-minute window
 * - After the limit is hit, the IP is blocked for 15 minutes
 * - Successful login clears the IP's failed-attempt history
 * - IPs are stored as SHA-256 hashes (not raw IPs)
 *
 * ## Limitations
 *
 * - NAT-shared IPs may be blocked collectively
 * - Rotating IPs can bypass this
 * - This is a first layer; a production hardening pass could add
 *   CAPTCHA or a third-party bot-protection service
 *
 * ## Privacy
 *
 * We store only the SHA-256 hash of the IP — never the raw IP. The
 * collection auto-expires entries via TTL, so no long-term retention.
 */

import "server-only";
import { createHash } from "node:crypto";
import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongo";
import { LOGIN_ATTEMPTS_COLLECTION } from "@/repositories/collections";

interface LoginAttemptDocument {
  key: string;
  timestamp: Date;
  expiresAt: Date;
}

/** Max failed attempts before blocking. */
const MAX_FAILED_ATTEMPTS = 5;
/** Time window for counting attempts (15 minutes). */
const WINDOW_MS = 15 * 60 * 1000;

async function getCollection(): Promise<Collection<LoginAttemptDocument>> {
  const db = await getDb();
  return db.collection<LoginAttemptDocument>(LOGIN_ATTEMPTS_COLLECTION);
}

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex");
}

/**
 * Check if an IP is currently blocked from logging in.
 *
 * @returns `true` if the IP has exceeded the failed-attempt limit.
 */
export async function isLoginBlocked(ip: string): Promise<boolean> {
  try {
    const collection = await getCollection();
    const key = hashIp(ip);
    const windowStart = new Date(Date.now() - WINDOW_MS);
    const count = await collection.countDocuments({
      key,
      timestamp: { $gt: windowStart },
    });
    return count >= MAX_FAILED_ATTEMPTS;
  } catch {
    // If the DB is unavailable, don't block (fail open — better than
    // locking everyone out because the DB is down).
    return false;
  }
}

/**
 * Record a failed login attempt for an IP.
 */
export async function recordFailedLogin(ip: string): Promise<void> {
  try {
    const collection = await getCollection();
    const key = hashIp(ip);
    const now = new Date();
    await collection.insertOne({
      key,
      timestamp: now,
      expiresAt: new Date(now.getTime() + WINDOW_MS),
    });
  } catch {
    // Non-critical — rate limiting is best-effort.
  }
}

/**
 * Clear failed login attempts for an IP (on successful login).
 */
export async function clearFailedLogins(ip: string): Promise<void> {
  try {
    const collection = await getCollection();
    const key = hashIp(ip);
    await collection.deleteMany({ key });
  } catch {
    // Non-critical.
  }
}

/**
 * Get the number of remaining attempts for an IP before blocking.
 * Returns `MAX_FAILED_ATTEMPTS` when the DB is unavailable (fail open).
 */
export async function getRemainingAttempts(ip: string): Promise<number> {
  try {
    const collection = await getCollection();
    const key = hashIp(ip);
    const windowStart = new Date(Date.now() - WINDOW_MS);
    const count = await collection.countDocuments({
      key,
      timestamp: { $gt: windowStart },
    });
    return Math.max(0, MAX_FAILED_ATTEMPTS - count);
  } catch {
    return MAX_FAILED_ATTEMPTS;
  }
}
