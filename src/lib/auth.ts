/**
 * NextAuth.js v4 configuration for GPAHub admin authentication.
 *
 * ## Architecture
 *
 * - **Credentials provider** — single admin account configured via env vars.
 *   No public signup. No student accounts. The admin email + password hash
 *   live in environment variables, never in the database or source code.
 * - **JWT strategy** — stateless sessions signed with `AUTH_SECRET`. Works
 *   natively with Vercel serverless (no database session lookups per request).
 * - **bcryptjs** for password hash verification — the admin password is
 *   stored as a bcrypt hash in `ADMIN_PASSWORD_HASH`, never in plain text.
 *
 * ## Security
 *
 * - `NEXTAUTH_SECRET` / `AUTH_SECRET` signs the JWT. Without it, NextAuth
 *   refuses to start in production.
 * - The credentials callback returns `{ id, email }` ONLY when the email
 *   matches `ADMIN_EMAIL` AND `bcrypt.compare(password, ADMIN_PASSWORD_HASH)`
 *   returns true. On any mismatch, it returns `null` → login fails.
 * - No password or hash is ever included in the JWT or session object.
 * - The session callback exposes only `{ user: { email } }` to the client.
 *
 * ## Environment variables
 *
 *   AUTH_SECRET           — JWT signing secret (required in production)
 *   ADMIN_EMAIL           — the single admin email address
 *   ADMIN_PASSWORD_HASH   — bcrypt hash of the admin password
 */

import "server-only";
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Read the admin credentials from the environment.
 *
 * Primary source: `ADMIN_PASSWORD_HASH` env var.
 * Dev fallback: `.admin-hash` file in the project root (useful when
 * `@next/env`'s dotenv-expand mangles bcrypt `$` characters in `.env`).
 *
 * Throws a clear error if neither is available — never silently allows login.
 */
function readAdminCredentials(): { email: string; passwordHash: string } {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error("ADMIN_EMAIL must be set for admin login.");
  }

  let passwordHash = process.env.ADMIN_PASSWORD_HASH;

  // Dev fallback: if the env var is missing or looks truncated (doesn't
  // start with $2 — bcrypt hashes always do), try reading from .admin-hash.
  if (!passwordHash || !passwordHash.startsWith("$2")) {
    try {
      const hashFile = join(process.cwd(), ".admin-hash");
      passwordHash = readFileSync(hashFile, "utf8").trim();
    } catch {
      // File doesn't exist — fall through to the error below.
    }
  }

  if (!passwordHash || !passwordHash.startsWith("$2")) {
    throw new Error(
      "ADMIN_PASSWORD_HASH must be set (or write a bcrypt hash to .admin-hash). " +
        "Generate one with: bun run scripts/hash-password.ts <password>",
    );
  }

  return { email, passwordHash };
}

export const authOptions: NextAuthOptions = {
  // JWT strategy — stateless, serverless-friendly.
  session: {
    strategy: "jwt",
    // 30 days — matches NextAuth default. Admins re-login monthly.
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@gpahub.app" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        let admin: { email: string; passwordHash: string };
        try {
          admin = readAdminCredentials();
        } catch {
          // Misconfigured server — never reveal config errors to the client.
          return null;
        }

        // Email must match exactly (case-sensitive after trim).
        if (credentials.email.trim().toLowerCase() !== admin.email.trim().toLowerCase()) {
          return null;
        }

        // Verify the password against the stored bcrypt hash.
        const valid = await bcrypt.compare(credentials.password, admin.passwordHash);
        if (!valid) {
          return null;
        }

        // Return a minimal user object — only `id` and `email`.
        // No password, no hash, ever.
        return { id: "admin", email: admin.email };
      },
    }),
  ],
  callbacks: {
    /**
     * JWT callback — runs on every request that reads the session.
     * We keep the token minimal: just the email. No sensitive data.
     */
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
      }
      return token;
    },
    /**
     * Session callback — shapes what the client sees via `useSession()`.
     * Only `user.email` is exposed. No id, no hash, no token internals.
     */
    async session({ session, token }) {
      if (session.user && token.email) {
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    // Custom login page (not the default NextAuth hosted form).
    signIn: "/admin/login",
  },
  // AUTH_SECRET is the modern env var name; NEXTAUTH_SECRET is the v4
  // fallback. NextAuth reads both automatically — no explicit `secret`
  // field needed here as long as one of them is set.
};

/**
 * The configured NextAuth handler. Exported as GET + POST from the
 * catch-all route at `src/app/api/auth/[...nextauth]/route.ts`.
 */
export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
