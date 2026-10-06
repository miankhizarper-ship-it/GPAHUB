/**
 * Lightweight server-side logging abstraction.
 *
 * Provides `info`, `warn`, `error` levels without pulling in a heavy
 * logging framework. Logs go to `console` (captured by Vercel's
 * runtime logs). No sensitive data is ever logged — callers must
 * ensure they don't pass passwords, hashes, or tokens.
 *
 * ## Usage
 *
 *   import { logger } from "@/lib/logger";
 *   logger.info("University created", { slug: "nust" });
 *   logger.error("DB connection failed", { error: err.message });
 *
 * ## Server-only
 *
 * Logging is server-side only. Client components use the browser
 * console directly.
 */

import "server-only";

type LogLevel = "info" | "warn" | "error";

interface LogContext {
  readonly [key: string]: unknown;
}

function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const ctx = context ? ` ${JSON.stringify(context)}` : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${ctx}`;
}

export const logger = {
  info(message: string, context?: LogContext): void {
    console.info(formatLog("info", message, context));
  },

  warn(message: string, context?: LogContext): void {
    console.warn(formatLog("warn", message, context));
  },

  error(message: string, context?: LogContext): void {
    console.error(formatLog("error", message, context));
  },
};
