/**
 * SEO helpers for GPAHub.
 *
 * Centralizes metadata creation so every public page produces
 * consistent canonical URLs, Open Graph tags, and Twitter cards
 * without duplicating boilerplate across route files.
 *
 * ## Site URL resolution
 *
 * The production site URL comes from `siteConfig.url` (which reads
 * from `NEXT_PUBLIC_SITE_URL` at build time). In development we fall
 * back to `http://localhost:3000` so canonical URLs resolve correctly
 * when previewing locally. Never hardcode localhost in source —
 * always go through `getSiteUrl()`.
 */

import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

/**
 * The site URL used for canonical URLs and Open Graph.
 *
 * In production: `https://gpahub.app` (from `siteConfig.url`).
 * In development: `http://localhost:3000` (so local canonical URLs
 * resolve correctly without a production domain).
 */
export function getSiteUrl(): string {
  if (process.env.NODE_ENV === "production") {
    return siteConfig.url;
  }
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

/**
 * Build an absolute canonical URL from a path.
 *
 * @example getCanonicalUrl("/universities/nust") → "https://gpahub.app/universities/nust"
 */
export function getCanonicalUrl(path: string): string {
  const base = getSiteUrl().replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Build a standard `Metadata` object with canonical + OG + Twitter.
 *
 * Every public page should use this helper so metadata stays consistent.
 * Pages can override individual fields by passing them in `overrides`.
 */
export function createMetadata({
  title,
  description,
  path,
  ogType = "website",
  image,
  publishedAt,
  modifiedAt,
}: {
  title: string;
  description: string;
  /** The page path (e.g. "/universities/nust") for canonical URL. */
  path: string;
  ogType?: "website" | "article";
  image?: string;
  publishedAt?: string;
  modifiedAt?: string;
}): Metadata {
  const canonical = getCanonicalUrl(path);
  const ogImage = image ?? "/og-default.png";

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: siteConfig.name,
      type: ogType,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
      ...(ogType === "article" && publishedAt
        ? { publishedTime: publishedAt, modifiedTime: modifiedAt ?? publishedAt }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}
