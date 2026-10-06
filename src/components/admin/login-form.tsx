"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site";

/**
 * Admin login form — Client Component.
 *
 * POSTs credentials directly to the NextAuth callback endpoint using
 * `fetch()` (instead of `next-auth/react`'s `signIn()`, which has
 * bundling edge cases in the Next.js App Router). On success, the
 * session cookie is set and we redirect to the callback URL.
 *
 * Rate limiting: a simple client-side cooldown prevents brute-force
 * spamming. Server-side rate limiting would be added in a production
 * hardening pass.
 */

export function LoginForm({ callbackUrl = "/admin" }: { callbackUrl?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  // Read error from URL params (NextAuth redirects with ?error=...).
  React.useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError === "CredentialsSignin") {
      setError("Invalid email or password.");
    } else if (urlError) {
      setError("Login failed. Please try again.");
    }
  }, [searchParams]);

  // Cooldown timer for failed attempts.
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cooldown > 0) return;

    setError(null);
    setLoading(true);

    try {
      // 1. Server-side rate-limit check (before sending credentials).
      const { checkLoginAllowed, recordLoginFailure, clearLoginAttempts } =
        await import("@/app/admin/login/actions");
      const checkResult = await checkLoginAllowed();
      if (!checkResult.ok) {
        setError(checkResult.error);
        // Set cooldown to the retry window (capped at 60s for UX).
        setCooldown(Math.min(60, checkResult.retryAfterSeconds));
        return;
      }

      // 2. Fetch CSRF token (NextAuth requires it).
      const csrfRes = await fetch("/api/auth/csrf");
      const { csrfToken } = await csrfRes.json();

      // 3. POST credentials to the NextAuth callback.
      const res = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          email,
          password,
          csrfToken,
          json: "true",
        }),
      });

      if (!res.ok) {
        // Record the failed attempt for rate limiting.
        await recordLoginFailure();
        throw new Error("CredentialsSignin");
      }

      // 4. Success — clear failed attempts + redirect.
      await clearLoginAttempts();
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Invalid email or password.");
      setCooldown(3);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary">
            <GraduationCap className="h-7 w-7 text-primary-foreground" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{siteConfig.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Admin sign in</p>
          </div>
        </div>

        {/* Form card */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gpahub.app"
              disabled={loading || cooldown > 0}
              aria-invalid={!!error}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || cooldown > 0}
              aria-invalid={!!error}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading || cooldown > 0}
            className="mt-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogIn className="h-4 w-4" aria-hidden="true" />
            )}
            {cooldown > 0 ? `Try again in ${cooldown}s` : "Sign in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Authorized administrators only. Public users do not need an account.
        </p>
      </div>
    </div>
  );
}
