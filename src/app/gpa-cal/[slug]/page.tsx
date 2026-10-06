import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublished, getPublishedBySlug } from "@/repositories/universities.repository";
import { PageShell } from "@/components/layout/page-shell";
import { GpaCalculator } from "@/components/calculator/gpa-calculator";
import { GradingScaleTable } from "@/components/university/grading-scale-table";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const universities = await getPublished();
    return universities.map((u) => ({ slug: u.slug }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const u = await getPublishedBySlug(slug);
    if (!u) return { title: "GPA Calculator" };
    return {
      title: `${u.shortName} GPA Calculator`,
      description: `Calculate your semester GPA using the official ${u.name} grading scale. Add subjects, credit hours, and grades — instant, accurate, mobile-first.`,
      alternates: { canonical: `/gpa-cal/${u.slug}` },
    };
  } catch {
    return { title: "GPA Calculator" };
  }
}

export default async function UniversityGpaCalculatorPage({ params }: PageProps) {
  const { slug } = await params;
  let university;
  try {
    university = await getPublishedBySlug(slug);
  } catch (e) {
    console.error("Failed to fetch university for GPA calculator:", e);
    notFound();
  }

  if (!university) notFound();

  return (
    <PageShell
      title={`${university.shortName} GPA Calculator`}
      description={`Using the official ${university.name} grading scale (max GPA ${university.maxScale.toFixed(1)}). Calculation runs entirely in your browser.`}
      headerActions={
        <>
          <Link
            href={`/universities/${university.slug}`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            University page
          </Link>
          <Link
            href={`/cgpa-cal/${university.slug}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/85"
          >
            CGPA Calculator →
          </Link>
        </>
      }
    >
      <div className="flex flex-col gap-8">
        <GpaCalculator
          scale={university.scale}
          universityName={university.shortName}
          universitySlug={university.slug}
        />

        <section aria-labelledby="scale-heading">
          <h2 id="scale-heading" className="text-sm font-semibold text-foreground">
            {university.shortName} grading scale
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Verified on {university.lastVerified} against the official source.
          </p>
          <GradingScaleTable scale={university.scale} className="mt-3" />
        </section>
      </div>
    </PageShell>
  );
}
