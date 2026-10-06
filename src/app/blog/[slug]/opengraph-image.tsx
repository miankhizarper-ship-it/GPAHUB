import { ImageResponse } from "next/og";
import { getPublishedBySlug } from "@/repositories/posts.repository";

/**
 * Dynamic Open Graph image for individual blog posts.
 *
 * Generates a 1200×630 image with the post title overlaid on the
 * GPAHub sage gradient. Fetched at request time via `next/og`.
 *
 * Uses Node.js runtime (not edge) because it queries MongoDB to
 * fetch the post title + excerpt.
 */

export const runtime = "nodejs";
export const alt = "GPAHub Blog Article";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function BlogPostOgImage({
  params,
}: {
  params: { slug: string };
}) {
  let title = "GPAHub Blog";
  let excerpt = "";

  try {
    const post = await getPublishedBySlug(params.slug);
    if (post) {
      title = post.title;
      excerpt = post.excerpt;
    }
  } catch {
    // DB unavailable — use default title.
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #7a918d 0%, #5f7470 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "#e8f7de",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              fontWeight: 700,
              color: "#5f7470",
            }}
          >
            G
          </div>
          <span style={{ fontSize: "24px", fontWeight: 600, color: "#e8f7de" }}>
            GPAHub
          </span>
        </div>
        <h1
          style={{
            fontSize: "52px",
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.15,
            display: "flex",
            maxWidth: "900px",
          }}
        >
          {title}
        </h1>
        {excerpt && (
          <p
            style={{
              fontSize: "24px",
              color: "#e8f7de",
              margin: "20px 0 0 0",
              opacity: 0.85,
              display: "flex",
              maxWidth: "800px",
              lineHeight: 1.3,
            }}
          >
            {excerpt.length > 120 ? excerpt.slice(0, 117) + "..." : excerpt}
          </p>
        )}
      </div>
    ),
    size,
  );
}
