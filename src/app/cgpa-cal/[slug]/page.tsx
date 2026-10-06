import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublished, getPublishedBySlug } from "@/repositories/universities.repository";
import { PageShell } from "@/components/layout/page-shell";
import { CgpaCalculator } from "@/components/calculator/cgpa-calculator";

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
    if (!u) return { title: "CGPA Calculator" };
    return {
      title: `${u.shortName} CGPA Calculator`,
      description: `Calculate your cumulative GPA using the ${u.name} grading scale (max ${u.maxScale.toFixed(1)}). Weighted correctly by credit hours — not a simple average.`,
      alternates: { canonical: `/cgpa-cal/${u.slug}` },
    };
  } catch {
    return { title: "CGPA Calculator" };
  }
}

export default async function UniversityCgpaCalculatorPage({ params }: PageProps) {
  const { slug } = await params;
  let university;
  try {
    university = await getPublishedBySlug(slug);
  } catch (e) {
    console.error("Failed to fetch university for CGPA calculator:", e);
    notFound();
  }

  if (!university) notFound();

  return (
    <PageShell
      title={`${university.shortName} CGPA Calculator`}
      description={`Using the ${university.name} grading scale (max GPA ${university.maxScale.toFixed(1)}). Weighted by credit hours — not a simple average of semester GPAs.`}
      headerActions={
        <>
          <Link
            href={`/universities/${university.slug}`}
            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface"
          >
            University page
          </Link>
          <Link
            href={`/gpa-cal/${university.slug}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/85"
          >
            GPA Calculator →
          </Link>
        </>
      }
    >
      <CgpaCalculator
        scale={university.scale}
        universityName={university.shortName}
      />
    </PageShell>
  );
}
