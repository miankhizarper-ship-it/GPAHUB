/**
 * NextAuth.js catch-all route handler.
 *
 * Exports the NextAuth GET + POST handlers for `/api/auth/*` routes
 * (login, logout, session, csrf, etc.). The auth configuration lives
 * in `src/lib/auth.ts`.
 */

import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
