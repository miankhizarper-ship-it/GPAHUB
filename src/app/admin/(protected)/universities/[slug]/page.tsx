import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, Calculator, GraduationCap, ExternalLink, CalendarCheck } from "lucide-react";
import { getBySlug } from "@/repositories/universities.repository";
import { GradingScaleTable } from "@/components/university/grading-scale-table";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Preview · Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminPreviewPage({ params }: PageProps) {
  const { slug } = await params;
  let university;
  try {
    university = await getBySlug(slug);
  } catch {
    notFound();
  }

  if (!university) notFound();

  const isPublic = university.status === "published";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {university.name}
            </h1>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                university.status === "published"
                  ? "bg-success/15 text-success"
                  : university.status === "draft"
                    ? "bg-surface text-primary"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {university.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {university.shortName} · {university.city} · {university.type === "public" ? "Public" : "Private"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/admin/universities/${university.slug}/edit`}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" /> Edit
          </Link>
          {isPublic ? (
            <>
              <Link href={`/universities/${university.slug}`} target="_blank" className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border px-4 text-sm font-medium hover:bg-surface">
                <ExternalLink className="h-4 w-4" /> Public page
              </Link>
              <Link href={`/gpa-cal/${university.slug}`} className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border px-4 text-sm font-medium hover:bg-surface">
                <Calculator className="h-4 w-4" /> GPA calc
              </Link>
              <Link href={`/cgpa-cal/${university.slug}`} className="inline-flex h-10 items-center gap-1.5 rounded-md border border-border px-4 text-sm font-medium hover:bg-surface">
                <GraduationCap className="h-4 w-4" /> CGPA calc
              </Link>
            </>
          ) : (
            <span className="inline-flex h-10 items-center rounded-md border border-dashed border-border px-4 text-sm text-muted-foreground">
              Not published
            </span>
          )}
        </div>
      </div>

      {/* About */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Description</h2>
        <p className="mt-2 text-pretty text-sm leading-relaxed text-foreground">
          {university.description}
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt className="text-xs text-muted-foreground">Max GPA</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{university.maxScale.toFixed(2)}</dd>
          </div>
          {university.passingCGPA !== undefined && (
            <div>
              <dt className="text-xs text-muted-foreground">Passing CGPA</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{university.passingCGPA.toFixed(2)}</dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-muted-foreground">Grades</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{university.scale.grades.length}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">FAQs</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">{university.faqs.length}</dd>
          </div>
        </dl>
      </section>

      {/* Grading scale */}
      <section>
        <h2 className="mb-3 text-base font-semibold text-foreground">Grading scale</h2>
        <GradingScaleTable scale={university.scale} />
      </section>

      {/* FAQs */}
      {university.faqs.length > 0 && (
        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">FAQs</h2>
          <dl className="flex flex-col gap-3">
            {university.faqs.map((faq, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4">
                <dt className="font-medium text-foreground">{faq.q}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* Source */}
      <section className="rounded-xl border border-border bg-surface/30 p-5">
        <h2 className="text-base font-semibold text-foreground">Source & verification</h2>
        <dl className="mt-3 flex flex-col gap-3 sm:flex-row sm:gap-6">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
            <dt className="text-sm text-muted-foreground">Last verified:</dt>
            <dd className="text-sm font-medium text-foreground">{formatDate(university.lastVerified)}</dd>
          </div>
          {university.sourceUrl && (
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <dt className="text-sm text-muted-foreground">Source:</dt>
              <dd>
                <a href={university.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="text-sm font-medium text-primary hover:underline">
                  {sourceHostname(university.sourceUrl)}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </section>
    </div>
  );
}

function sourceHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
