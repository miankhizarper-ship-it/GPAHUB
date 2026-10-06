import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

/**
 * robots.txt for GPAHub.
 *
 * - Allows all public pages (calculators, universities, blog, legal).
 * - Disallows `/admin` and authentication paths.
 * - Points to the generated sitemap.
 *
 * Available at `/robots.txt` via Next.js's metadata route convention.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl().replace(/\/$/, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
