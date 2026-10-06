/**
 * JSON-LD structured data builders for GPAHub.
 *
 * Each builder returns a plain object that can be serialized into a
 * `<script type="application/ld+json">` tag. The `JsonLd` React
 * component in `src/components/seo/json-ld.tsx` handles the rendering.
 *
 * ## Safety
 *
 * These builders NEVER accept raw HTML. All string fields are inserted
 * as-is into the JSON — JSON.stringify escapes special characters
 * automatically, so there's no XSS risk via this path.
 *
 * ## Accuracy
 *
 * We only emit structured data that's actually true:
 *   - `FAQPage` only when the page visibly contains those FAQs
 *   - `Article` only with a real `datePublished`
 *   - No fabricated author names (GPAHub is the publisher)
 */

import { siteConfig } from "@/config/site";
import { getSiteUrl } from "@/lib/seo";
import type { UniversityFaq } from "@/types/university";

/** WebSite structured data — used on the homepage. */
export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: getSiteUrl(),
    description: siteConfig.description,
  };
}

/**
 * WebApplication structured data — used on calculator pages.
 *
 * Represents GPAHub's calculators accurately. Does NOT claim features
 * the app doesn't have (no "free", no "official", no accuracy claims).
 */
export function buildWebApplicationJsonLd({
  name,
  url,
  description,
}: {
  name: string;
  url: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    url,
    description,
    applicationCategory: "EducationApplication",
    operatingSystem: "Web Browser",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

/**
 * BreadcrumbList structured data — used on university + blog pages.
 *
 * @param items — ordered list of `{ name, url }` from home to current page.
 */
export function buildBreadcrumbJsonLd(
  items: ReadonlyArray<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * FAQPage structured data — used on university pages that have FAQs.
 *
 * Only call this when the page actually renders the FAQs visibly.
 * The `faqs` array comes directly from the university record.
 */
export function buildFaqPageJsonLd(faqs: readonly UniversityFaq[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

/**
 * Article structured data — used on blog post pages.
 *
 * GPAHub is the publisher (no fabricated author names). `datePublished`
 * is required; `dateModified` is optional.
 */
export function buildArticleJsonLd({
  headline,
  description,
  url,
  image,
  datePublished,
  dateModified,
  excerpt,
}: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  excerpt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description: description || excerpt,
    url,
    image: image ? getSiteUrl() + image : undefined,
    datePublished,
    dateModified: dateModified ?? datePublished,
    author: {
      "@type": "Organization",
      name: siteConfig.name,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: getSiteUrl(),
    },
  };
}
