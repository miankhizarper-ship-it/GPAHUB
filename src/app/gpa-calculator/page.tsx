import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { GpaCalculator } from "@/components/calculator/gpa-calculator";
import { GradingScaleTable } from "@/components/university/grading-scale-table";
import { JsonLd } from "@/components/seo/json-ld";
import { createMetadata, getCanonicalUrl } from "@/lib/seo";
import { buildWebApplicationJsonLd } from "@/lib/json-ld";
import { getPublished } from "@/repositories/universities.repository";
import type { GradingScale } from "@/domain/grading";

export const metadata: Metadata = createMetadata({
  title: "GPA Calculator — Free Semester GPA Tool",
  description:
    "Calculate your semester GPA with any grading scale. Add subjects, credit hours, and grades — get an instant, accurate GPA. Works on mobile, runs entirely in your browser.",
  path: "/gpa-calculator",
});

export const revalidate = 3600;

// A small synthetic 4.0 scale for the generic calculator when no
// university is selected. This is NOT a real university scale — it's
// the conventional 4.0 scale used as a sensible default.
const GENERIC_SCALE: GradingScale = {
  maxPoints: 4.0,
  grades: [
    { grade: "A", points: 4.0 },
    { grade: "A-", points: 3.67 },
    { grade: "B+", points: 3.33 },
    { grade: "B", points: 3.0 },
    { grade: "B-", points: 2.67 },
    { grade: "C+", points: 2.33 },
    { grade: "C", points: 2.0 },
    { grade: "C-", points: 1.67 },
    { grade: "D", points: 1.0 },
    { grade: "F", points: 0.0 },
  ],
};

export default async function GpaCalculatorPage() {
  // Fetch published universities to populate the university selector.
  let universities: { slug: string; name: string; shortName: string }[] = [];
  try {
    const all = await getPublished();
    universities = all.map((u) => ({
      slug: u.slug,
      name: u.name,
      shortName: u.shortName,
    }));
  } catch {
    // If the DB is unavailable, the generic calculator still works.
  }

  return (
    <PageShell
      title="GPA Calculator"
      description="Add your subjects, credit hours, and grades to calculate your semester GPA. Everything runs in your browser — your data never leaves your device."
      headerActions={
        <Link
          href="/cgpa-calculator"
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface"
        >
          CGPA Calculator →
        </Link>
      }
    >
      <div className="flex flex-col gap-8">
        <JsonLd
          data={buildWebApplicationJsonLd({
            name: "GPAHub GPA Calculator",
            url: getCanonicalUrl("/gpa-calculator"),
            description:
              "Free semester GPA calculator. Add subjects, credit hours, and grades to calculate your GPA with any grading scale. Runs entirely in your browser.",
          })}
        />
        {/* University selector */}
        {universities.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold text-foreground">
              Using a university-specific scale?
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Select your university for its exact grading scale:
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {universities.map((u) => (
                <li key={u.slug}>
                  <Link
                    href={`/gpa-cal/${u.slug}`}
                    className="inline-flex h-9 items-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface hover:border-primary"
                  >
                    {u.shortName}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <GpaCalculator
          scale={GENERIC_SCALE}
          universityName="Generic 4.0 scale"
        />

        <section aria-labelledby="scale-heading">
          <h2 id="scale-heading" className="text-sm font-semibold text-foreground">
            Default grading scale
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This is a conventional 4.0 scale. University-specific calculators
            use the exact scale published by each institution.
          </p>
          <GradingScaleTable scale={GENERIC_SCALE} className="mt-3" />
        </section>
      </div>
    </PageShell>
  );
}
