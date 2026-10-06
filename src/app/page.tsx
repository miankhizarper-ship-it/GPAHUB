import * as React from "react";
import Link from "next/link";
import {
  Calculator,
  GraduationCap,
  Percent,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { siteConfig } from "@/config/site";

/**
 * GPAHub landing page — Server Component.
 *
 * Phase 3 connects the homepage to the live calculator + university
 * routes. The hero CTAs now link to real pages instead of "coming soon".
 */

type ToolCard = {
  readonly icon: React.ElementType;
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly cta: string;
};

const tools: readonly ToolCard[] = [
  {
    icon: Calculator,
    title: "GPA Calculator",
    description:
      "Compute your semester GPA with any grading scale. Add subjects, credit hours, and grades — get an instant, accurate GPA.",
    href: "/gpa-calculator",
    cta: "Calculate GPA",
  },
  {
    icon: GraduationCap,
    title: "CGPA Calculator",
    description:
      "Track your cumulative GPA across every semester. Correctly weighted by credit hours — not a simple average.",
    href: "/cgpa-calculator",
    cta: "Calculate CGPA",
  },
  {
    icon: Percent,
    title: "CGPA ↔ Percentage",
    description:
      "Convert your CGPA to a percentage and back. Works with 4.0 and 5.0 scales. Instant, two-way conversion.",
    href: "/cgpa-to-percentage",
    cta: "Convert now",
  },
] as const;

const principles: readonly ToolCard[] = [
  {
    icon: ShieldCheck,
    title: "Private by design",
    description:
      "Every calculation runs in your browser. Your grades never leave your device — there are no accounts, no tracking, no server-side storage of your inputs.",
    href: "/gpa-calculator",
    cta: "Try it",
  },
  {
    icon: Smartphone,
    title: "Mobile-first",
    description:
      "Designed for the device in your pocket — fast on 3G, comfortable one-handed, no zooming required. Use it on campus, in the library, on the bus.",
    href: "/cgpa-calculator",
    cta: "See it",
  },
  {
    icon: Sparkles,
    title: "University-specific",
    description:
      "Pick your university and GPAHub loads its exact grading scale — verified against official sources, with percentage bands where published.",
    href: "/universities",
    cta: "Browse universities",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        {/* ---------- Hero ---------- */}
        <section
          aria-labelledby="hero-heading"
          className="relative overflow-hidden border-b border-border"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-surface via-background to-background"
          />
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 sm:py-28 lg:py-32">
            <h1
              id="hero-heading"
              className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              {siteConfig.name}
            </h1>

            <p className="text-base font-semibold text-primary sm:text-lg">
              {siteConfig.tagline}
            </p>

            <p className="max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
              {siteConfig.description} Free, mobile-first, and verified against
              official university grading scales.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/gpa-calculator"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Calculate your GPA
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/universities"
                className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-surface"
              >
                Browse universities
              </Link>
            </div>
          </div>
        </section>

        {/* ---------- Tools ---------- */}
        <section
          id="tools"
          aria-labelledby="tools-heading"
          className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
        >
          <div className="mb-10 max-w-2xl">
            <h2
              id="tools-heading"
              className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Three tools, one calm interface
            </h2>
            <p className="mt-2 text-muted-foreground">
              Each calculator runs entirely in your browser. Pick a tool to
              start — no sign-up, no data collection.
            </p>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <li
                key={tool.title}
                className="group flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-surface text-primary">
                  <tool.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {tool.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {tool.description}
                </p>
                <Link
                  href={tool.href}
                  className="mt-4 inline-flex h-10 items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                >
                  {tool.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Principles ---------- */}
        <section
          aria-labelledby="principles-heading"
          className="border-t border-border bg-surface/40"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mb-10 max-w-2xl">
              <h2
                id="principles-heading"
                className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                Built for Pakistani students
              </h2>
              <p className="mt-2 text-muted-foreground">
                GPAHub is a free, calm, trustworthy tool. Here&apos;s what that
                means in practice.
              </p>
            </div>

            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {principles.map((principle) => (
                <li
                  key={principle.title}
                  className="rounded-xl border border-border bg-card p-6 shadow-sm"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-surface text-primary">
                    <principle.icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {principle.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
