import { ImageResponse } from "next/og";
import { getPublishedBySlug } from "@/repositories/universities.repository";

/**
 * Dynamic Open Graph image for university detail pages.
 *
 * Generates a 1200×630 image with the university name and "GPA Calculator"
 * overlaid on the GPAHub sage gradient. Uses Node.js runtime (not Edge)
 * because it queries MongoDB to fetch the university name.
 */

export const runtime = "nodejs";
export const alt = "GPAHub University Grading Scale";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function UniversityOgImage({
  params,
}: {
  params: { slug: string };
}) {
  let universityName = "GPAHub";
  let shortName = "";
  let city = "";

  try {
    const university = await getPublishedBySlug(params.slug);
    if (university) {
      universityName = university.name;
      shortName = university.shortName;
      city = university.city;
    }
  } catch {
    // DB unavailable — use default.
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
        {shortName && (
          <span style={{ fontSize: "28px", color: "#e8f7de", opacity: 0.8, marginBottom: "8px", display: "flex" }}>
            {shortName}{city ? ` · ${city}` : ""}
          </span>
        )}
        <h1
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#ffffff",
            margin: 0,
            lineHeight: 1.15,
            display: "flex",
            maxWidth: "900px",
          }}
        >
          {universityName}
        </h1>
        <p
          style={{
            fontSize: "24px",
            color: "#e8f7de",
            margin: "20px 0 0 0",
            opacity: 0.85,
            display: "flex",
          }}
        >
          Grading Scale · GPA Calculator · CGPA Calculator
        </p>
      </div>
    ),
    size,
  );
}
