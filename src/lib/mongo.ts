/**
 * Cached MongoDB connection for GPAHub.
 *
 * ## Why connection caching is required
 *
 * Next.js (dev) hot-reloads modules on every save, which would create
 * a brand-new `MongoClient` each time and quickly exhaust Atlas's
 * free-tier connection limit. In production on Vercel, each serverless
 * invocation is a fresh process — but a single warm instance can serve
 * many requests, and we want those requests to share one client rather
 * than pay the TLS handshake cost per request.
 *
 * The standard remedy is to stash the client (and its connect promise)
 * on `globalThis` so it survives module reloads and is reused across
 * warm invocations. We only store the promise (not the resolved client)
 * so concurrent callers during the initial cold start all `await` the
 * same connection rather than racing to create three of them.
 *
 * ## Server-only
 *
 * This module imports `"server-only"` so Next.js will refuse to bundle
 * it into a Client Component. The MongoDB URI must never reach the
 * browser. Repository modules import the connection from here; UI
 * components import repositories only via Server Components or API
 * routes — never directly.
 */

import "server-only";
import { MongoClient, type Db } from "mongodb";

/**
 * The cached client + connect promise. Lives on `globalThis` so it
 * survives Next.js dev hot-reloads. Typed loosely via a cast because
 * `globalThis` doesn't natively carry our cache shape.
 */
interface MongoCache {
  client?: MongoClient;
  promise?: Promise<MongoClient>;
}

const globalForMongo = globalThis as unknown as {
  __gpahubMongo?: MongoCache;
};

const cache: MongoCache = globalForMongo.__gpahubMongo ?? {
  client: undefined,
  promise: undefined,
};

if (process.env.NODE_ENV !== "production") {
  // In dev, persist the cache across hot reloads.
  globalForMongo.__gpahubMongo = cache;
}

/**
 * Read `MONGODB_URI` from the environment. Throws a clear, actionable
 * error if it's missing — never returns `undefined` and silently skips.
 */
function readMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.trim() === "") {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local (see .env.example). " +
        "GPAHub cannot connect to MongoDB Atlas without it.",
    );
  }
  return uri;
}

/**
 * Read `MONGODB_DB_NAME` from the environment, with a safe dev fallback.
 *
 * The fallback is `gpahub-dev` so a developer who forgets to set the
 * variable doesn't accidentally write seed data into a production
 * database. Production deployments MUST set `MONGODB_DB_NAME` explicitly
 * — the fallback is intentionally not `gpahub` to avoid silent
 * cross-environment contamination.
 */
function readDbName(): string {
  const name = process.env.MONGODB_DB_NAME;
  if (!name || name.trim() === "") {
    return "gpahub-dev";
  }
  return name.trim();
}

/**
 * Get a connected `MongoClient`, reusing a cached instance when one
 * exists. Returns the client (already connected).
 */
export async function getMongoClient(): Promise<MongoClient> {
  if (cache.client) {
    return cache.client;
  }

  if (!cache.promise) {
    const uri = readMongoUri();
    const client = new MongoClient(uri, {
      // Atlas-friendly defaults. These are tuned for serverless cold
      // starts: short server-selection timeout, connection pooling.
      serverSelectionTimeoutMS: 10_000,
      maxPoolSize: 10,
    });
    cache.promise = client.connect();
  }

  try {
    cache.client = await cache.promise;
  } catch (err) {
    // Reset the promise so the next caller can retry instead of being
    // stuck with a rejected promise forever.
    cache.promise = undefined;
    throw err;
  }

  return cache.client;
}

/**
 * Get the GPAHub `Db` handle for the configured database name.
 *
 * Convenience wrapper: `const db = await getDb();`
 */
export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  return client.db(readDbName());
}

/**
 * The configured database name, without connecting. Useful for logs
 * and for the seed script's pre-flight check.
 */
export function getDbName(): string {
  return readDbName();
}
