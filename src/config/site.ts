/**
 * GPAHub central site configuration.
 *
 * Single source of truth for brand metadata used across metadata,
 * layouts, and components. Phase 0 — project foundation.
 */

export const siteConfig = {
  name: "GPAHub",
  tagline: "Calculate • Learn • Achieve",
  description:
    "Your University GPA & CGPA Calculator — a free, fast, mobile-first platform for Pakistani university students.",
  url: "https://gpahub.app",
  locale: "en_PK",
  keywords: [
    "GPA calculator",
    "CGPA calculator",
    "Pakistani university GPA",
    "CGPA to percentage",
    "GPAHub",
  ],
  links: {
    // Reserved for future contact / privacy / terms routes.
    contact: "/contact",
    privacy: "/privacy",
    terms: "/terms",
  },
} as const;

export type SiteConfig = typeof siteConfig;
