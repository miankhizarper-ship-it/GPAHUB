import { ImageResponse } from "next/og";

/**
 * Default Open Graph image for the blog listing page.
 *
 * Generates a 1200×630 image with GPAHub branding. Uses the sage
 * palette from the design system. No external dependencies — the
 * image is rendered at request time via `next/og`.
 */

export const runtime = "edge";
export const alt = "GPAHub Blog — GPA & CGPA Tips for Pakistani Students";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function BlogOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "linear-gradient(135deg, #7a918d 0%, #5f7470 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "#e8f7de",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 700,
              color: "#5f7470",
            }}
          >
            G
          </div>
          <span style={{ fontSize: "28px", fontWeight: 600, color: "#e8f7de" }}>
            GPAHub
          </span>
        </div>
        <h1
          style={{
            fontSize: "64px",
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Blog
        </h1>
        <p
          style={{
            fontSize: "28px",
            color: "#e8f7de",
            margin: "16px 0 0 0",
            opacity: 0.9,
          }}
        >
          GPA & CGPA Tips for Pakistani Students
        </p>
      </div>
    ),
    size,
  );
}
