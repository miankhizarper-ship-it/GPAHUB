/**
 * Environment variable validation for GPAHub.
 *
 * Validates required server-side environment variables at startup using
 * Zod. In production, missing required variables cause a clear error.
 * In development, missing variables are warned but not fatal (so a
 * developer can run the app without MongoDB for UI work).
 *
 * ## Server-only
 *
 * This module is server-only — it reads secrets that must never reach
 * the browser. Client-safe env vars are accessed directly via
 * `process.env.NEXT_PUBLIC_*` in client components.
 */

import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  /** MongoDB Atlas connection string (server-side only). */
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  /** Logical database name. Falls back to "gpahub-dev" in dev. */
  MONGODB_DB_NAME: z.string().optional(),
  /** NextAuth JWT signing secret. Required in production. */
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required in production"),
  /** NextAuth URL (app origin). Required for correct callback URLs. */
  NEXTAUTH_URL: z.string().url().optional(),
  /** Admin email address. */
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email"),
  /** Bcrypt hash of the admin password. */
  ADMIN_PASSWORD_HASH: z.string().optional(),
  /** Node environment. */
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Validate server environment variables.
 *
 * In production: throws on missing required vars.
 * In development: returns with defaults, warns on missing vars.
 */
function validateServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
    AUTH_SECRET: process.env.AUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (result.success) {
    return result.data;
  }

  // In production, fail fast on missing required env vars.
  if (process.env.NODE_ENV === "production") {
    const missing = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Environment validation failed (production):\n${missing}\n` +
        "See .env.example for required variables.",
    );
  }

  // In development, warn but continue (so UI work without DB is possible).
  if (typeof console !== "undefined") {
    console.warn("⚠ Environment validation warnings (development):");
    for (const issue of result.error.issues) {
      console.warn(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
  }

  // Return a partial env with defaults for development.
  return {
    MONGODB_URI: process.env.MONGODB_URI || "",
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || "gpahub-dev",
    AUTH_SECRET: process.env.AUTH_SECRET || "dev-secret-not-for-production",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "http://localhost:3000",
    ADMIN_EMAIL: process.env.ADMIN_EMAIL || "admin@gpahub.app",
    ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
    NODE_ENV: "development",
  };
}

/** Validated server environment (cached after first access in production only). */
let _env: ServerEnv | null = null;

/** Get validated server environment variables. */
export function getServerEnv(): ServerEnv {
  // In production, cache after first access for performance.
  // In development/test, re-read every time so test stubs work.
  if (_env && process.env.NODE_ENV === "production") {
    return _env;
  }
  const env = validateServerEnv();
  // Only cache in production.
  if (process.env.NODE_ENV === "production") {
    _env = env;
  }
  return env;
}

/** Reset the cached env (for testing). */
export function _resetEnvCache(): void {
  _env = null;
}

/**
 * Check if the app is running in production.
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}
