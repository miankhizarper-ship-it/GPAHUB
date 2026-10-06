import type { Metadata } from "next";
import Link from "next/link";
import { getPublished } from "@/repositories/universities.repository";
import { PageShell } from "@/components/layout/page-shell";
import { UniversityDirectory } from "@/components/university/university-directory";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Pakistani Universities — Grading Scales & GPA Calculators",
  description:
    "Browse verified grading scales for 15+ Pakistani universities. Each university page includes its GPA scale, percentage bands, FAQs, and direct links to GPA and CGPA calculators.",
  path: "/universities",
});

// ISR: revalidate every hour.
export const revalidate = 3600;

export default async function UniversitiesPage() {
  let universities: Awaited<ReturnType<typeof getPublished>> = [];
  let fetchError = false;

  try {
    universities = await getPublished();
  } catch {
    fetchError = true;
  }

  return (
    <PageShell
      title="Pakistani Universities"
      description="Browse verified grading scales for Pakistani universities. Search by name or city, then select a university to see its grading scale, GPA calculator, and CGPA calculator."
    >
      {fetchError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load universities right now. Please try again later.
        </div>
      ) : universities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            No universities available yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            University records will appear here once they are seeded into the
            database. Run the seed script to populate verified grading scales.
          </p>
          <Link
            href="/gpa-calculator"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try the generic GPA calculator
          </Link>
        </div>
      ) : (
        <UniversityDirectory universities={universities} />
      )}
    </PageShell>
  );
}
