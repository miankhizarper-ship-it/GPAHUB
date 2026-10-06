/**
 * Server-side session guard for admin routes and server actions.
 *
 * Every admin page + server action MUST call `requireAdmin()` before
 * doing any work. This is the single authorization gate — client-side
 * route protection is a UX convenience, NOT a security boundary.
 *
 * ## Usage in Server Components
 *
 *   const session = await requireAdmin();
 *   // session is guaranteed non-null here
 *
 * ## Usage in Server Actions
 *
 *   "use server";
 *   import { requireAdmin } from "@/lib/session";
 *   export async function myAction() {
 *     await requireAdmin(); // throws Redirect if unauthenticated
 *     ...
 *   }
 */

import "server-only";
import { redirect } from "next/navigation";
import { getServerSession, type Session } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Require an authenticated admin session.
 *
 * In Server Components: returns the session (guaranteed non-null) or
 * throws a `redirect()` to `/admin/login`.
 *
 * In Server Actions: same behavior. The redirect is automatic — the
 * action never proceeds past this call without a valid session.
 */
export async function requireAdmin(): Promise<Session> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    redirect("/admin/login");
  }
  return session;
}

/**
 * Get the current admin session, or `null` if unauthenticated.
 *
 * Use this when you want to branch without redirecting (e.g. the login
 * page itself, which needs to redirect to `/admin` if already logged in).
 */
export async function getAdminSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}
