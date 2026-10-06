import * as React from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Universities", href: "/universities" },
  { label: "GPA", href: "/gpa-calculator" },
  { label: "CGPA", href: "/cgpa-calculator" },
  { label: "Converter", href: "/cgpa-to-percentage" },
  { label: "Blog", href: "/blog" },
] as const;

/**
 * Global site header — Server Component.
 *
 * Sticky top bar with the GPAHub wordmark + primary nav on the left
 * and the theme toggle on the right. The theme toggle is the only
 * client island in the header. Mobile-first: single row, comfortable
 * 64px height, 44px tap targets. Nav links collapse on small screens
 * to a horizontal scroll strip.
 */
export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md",
        className,
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-1 py-1 text-primary transition-colors hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${siteConfig.name} home`}
          >
            <GraduationCap
              className="h-7 w-7 text-primary"
              aria-hidden="true"
            />
            <span className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              {siteConfig.name}
            </span>
          </Link>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-1 sm:flex"
          >
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>

      {/* Mobile nav strip — horizontal scroll, visible on small screens */}
      <nav
        aria-label="Primary mobile"
        className="flex gap-1 overflow-x-auto border-t border-border px-4 py-2 sm:hidden"
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex h-8 shrink-0 items-center rounded-md px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
