import { ImageResponse } from "next/og";
import { getPublishedBySlug } from "@/repositories/universities.repository";

/**
 * Dynamic Open Graph image for university-specific CGPA calculator pages.
 */

export const runtime = "nodejs";
export const alt = "GPAHub CGPA Calculator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function CgpaCalOgImage({
  params,
}: {
  params: { slug: string };
}) {
  let shortName = "CGPA Calculator";

  try {
    const university = await getPublishedBySlug(params.slug);
    if (university) {
      shortName = `${university.shortName} CGPA Calculator`;
    }
  } catch {
    // DB unavailable.
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
            fontSize: "56px",
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.1,
            display: "flex",
          }}
        >
          {shortName}
        </h1>
        <p
          style={{
            fontSize: "24px",
            color: "#e8f7de",
            margin: "16px 0 0 0",
            opacity: 0.85,
            display: "flex",
          }}
        >
          Weighted by credit hours · Free · Mobile-first
        </p>
      </div>
    ),
    size,
  );
}
