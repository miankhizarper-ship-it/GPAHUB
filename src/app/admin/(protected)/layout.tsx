import * as React from "react";
import Link from "next/link";
import { LayoutDashboard, GraduationCap, FileText, Mail, ShieldCheck, LogOut, ExternalLink } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { requireAdmin } from "@/lib/session";
import { getUnreadCount } from "@/repositories/messages.repository";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Protected admin layout — Server Component.
 *
 * Calls `requireAdmin()` which redirects to `/admin/login` if there's
 * no authenticated session. Renders admin header (brand, nav, session
 * email, logout) and footer. Nav includes Dashboard, Universities,
 * Blog, Messages, and Audit with an unread-count badge on Messages.
 */

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly icon: React.ComponentType<{ className?: string }>;
  readonly badge?: boolean;
}

const NAV_ITEMS: readonly NavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Universities", href: "/admin/universities", icon: GraduationCap },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Messages", href: "/admin/messages", icon: Mail, badge: true },
  { label: "Audit", href: "/admin/audit", icon: ShieldCheck },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth gate. Throws redirect() if unauthenticated.
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "admin";

  // Fetch unread message count for the nav badge.
  let unreadCount = 0;
  try {
    unreadCount = await getUnreadCount();
  } catch {
    // DB unavailable — no badge.
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* ---------- Admin header ---------- */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/admin"
              className="flex items-center gap-2 rounded-md px-1 py-1 text-primary hover:text-primary/80"
              aria-label={`${siteConfig.name} admin`}
            >
              <GraduationCap className="h-7 w-7" aria-hidden="true" />
              <span className="text-lg font-bold tracking-tight text-foreground">
                {siteConfig.name} <span className="text-muted-foreground font-normal">Admin</span>
              </span>
            </Link>

            <nav aria-label="Admin" className="hidden items-center gap-1 sm:flex">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                  {item.badge && unreadCount > 0 && (
                    <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden h-9 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              View site
            </Link>
            <ThemeToggle />
            <div className="hidden items-center gap-2 border-l border-border pl-2 sm:flex">
              <span className="text-xs text-muted-foreground">{adminEmail}</span>
            </div>
            <a
              href="/api/auth/signout"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-surface"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </a>
          </div>
        </div>

        {/* Mobile nav */}
        <nav
          aria-label="Admin mobile"
          className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 sm:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <item.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {item.label}
              {item.badge && unreadCount > 0 && (
                <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </header>

      {/* ---------- Admin content ---------- */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          {children}
        </div>
      </main>

      {/* ---------- Admin footer ---------- */}
      <footer className="mt-auto border-t border-border bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 sm:flex-row sm:px-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.name}. Admin panel.
          </p>
          <p className="text-xs text-muted-foreground">
            Signed in as {adminEmail}
          </p>
        </div>
      </footer>
    </div>
  );
}
