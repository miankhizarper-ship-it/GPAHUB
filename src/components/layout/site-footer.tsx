import * as React from "react";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Global site footer — Server Component.
 *
 * Multi-column layout with links to calculators, universities, blog,
 * and legal pages. Mobile collapses to a single stacked column.
 * Sticky-footer pattern: `mt-auto` anchors to viewport bottom.
 */

const FOOTER_SECTIONS = [
  {
    title: "Calculators",
    links: [
      { label: "GPA Calculator", href: "/gpa-calculator" },
      { label: "CGPA Calculator", href: "/cgpa-calculator" },
      { label: "CGPA to Percentage", href: "/cgpa-to-percentage" },
    ],
  },
  {
    title: "Universities",
    links: [
      { label: "Browse universities", href: "/universities" },
      { label: "About GPAHub", href: "/about" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Disclaimer", href: "/disclaimer" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Contact", href: "/contact" },
    ],
  },
] as const;

export function SiteFooter({ className }: { className?: string }) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "mt-auto w-full border-t border-border bg-background",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        {/* Link sections */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <p className="text-lg font-bold text-foreground">{siteConfig.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{siteConfig.tagline}</p>
            <p className="mt-3 max-w-xs text-xs text-muted-foreground">
              Free, mobile-first GPA and CGPA calculator for Pakistani university
              students. Calculations run in your browser.
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <nav key={section.title} aria-label={section.title}>
              <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Copyright bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} {siteConfig.name}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Not affiliated with any university.{" "}
            <Link href="/disclaimer" className="underline-offset-4 hover:underline">
              Disclaimer
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
