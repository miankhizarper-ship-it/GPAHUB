import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";
import { CgpaCalculator } from "@/components/calculator/cgpa-calculator";
import { JsonLd } from "@/components/seo/json-ld";
import { createMetadata, getCanonicalUrl } from "@/lib/seo";
import { buildWebApplicationJsonLd } from "@/lib/json-ld";
import type { GradingScale } from "@/domain/grading";

export const metadata: Metadata = createMetadata({
  title: "CGPA Calculator — Free Cumulative GPA Tool",
  description:
    "Calculate your cumulative GPA across multiple semesters. Enter each semester's GPA and credit hours — the CGPA is correctly weighted by credit load, not averaged.",
  path: "/cgpa-calculator",
});

export const revalidate = 3600;

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

export default function CgpaCalculatorPage() {
  return (
    <PageShell
      title="CGPA Calculator"
      description="Enter each semester's GPA and total credit hours. The CGPA is weighted by credit load — semesters with more credits count proportionally more, exactly as universities calculate it."
      headerActions={
        <Link
          href="/gpa-calculator"
          className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface"
        >
          ← GPA Calculator
        </Link>
      }
    >
      <JsonLd
        data={buildWebApplicationJsonLd({
          name: "GPAHub CGPA Calculator",
          url: getCanonicalUrl("/cgpa-calculator"),
          description:
            "Free CGPA calculator. Enter each semester's GPA and credit hours to calculate your cumulative GPA, correctly weighted by credit load.",
        })}
      />
      <CgpaCalculator scale={GENERIC_SCALE} universityName="Generic 4.0 scale" />
    </PageShell>
  );
}
