import type { MetadataRoute } from "next";
import { getPublished as getPublishedUniversities } from "@/repositories/universities.repository";
import { getPublished as getPublishedPosts } from "@/repositories/posts.repository";
import { getSiteUrl } from "@/lib/seo";

/**
 * Dynamic sitemap for GPAHub.
 *
 * Generated from current published database records for dynamic
 * content (universities, blog posts) plus a static list of fixed
 * routes. Drafts, archived universities, and unpublished posts are
 * never included.
 *
 * Available at `/sitemap.xml` via Next.js's metadata route convention.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl().replace(/\/$/, "");
  const now = new Date();

  // Static routes — fixed pages that always exist.
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/gpa-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/cgpa-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/cgpa-to-percentage`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/universities`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic university routes.
  let universityRoutes: MetadataRoute.Sitemap = [];
  let postRoutes: MetadataRoute.Sitemap = [];

  try {
    const universities = await getPublishedUniversities();
    universityRoutes = universities.flatMap((u) => [
      {
        url: `${base}/universities/${u.slug}`,
        lastModified: new Date(u.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      {
        url: `${base}/gpa-cal/${u.slug}`,
        lastModified: new Date(u.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
      {
        url: `${base}/cgpa-cal/${u.slug}`,
        lastModified: new Date(u.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      },
    ]);
  } catch {
    // Database unavailable — skip dynamic routes.
  }

  try {
    const posts = await getPublishedPosts();
    postRoutes = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Database unavailable — skip blog routes.
  }

  return [...staticRoutes, ...universityRoutes, ...postRoutes];
}
