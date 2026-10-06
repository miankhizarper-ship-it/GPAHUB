import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Calculator, GraduationCap, CalendarCheck } from "lucide-react";
import { getPublished, getPublishedBySlug } from "@/repositories/universities.repository";
import { PageShell } from "@/components/layout/page-shell";
import { GradingScaleTable } from "@/components/university/grading-scale-table";
import { JsonLd } from "@/components/seo/json-ld";
import { createMetadata, getCanonicalUrl } from "@/lib/seo";
import { buildBreadcrumbJsonLd, buildFaqPageJsonLd } from "@/lib/json-ld";

// ISR: revalidate every hour. The admin panel will call
// revalidatePath(`/universities/[slug]`) on edits.
export const revalidate = 3600;

/**
 * Pre-render known published slugs at build time. Pages for slugs not
 * in this list are rendered on-demand on first visit, then cached.
 */
export async function generateStaticParams() {
  try {
    const universities = await getPublished();
    return universities.map((u) => ({ slug: u.slug }));
  } catch {
    // Database unavailable at build time — render nothing statically.
    // Pages will be generated on-demand at runtime.
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const university = await getPublishedBySlug(slug);
    if (!university) return { title: "University not found" };

    const title = university.seo?.title ?? `${university.name} Grading Scale & GPA Calculator`;
    const description =
      university.seo?.metaDescription ??
      `${university.name} (${university.shortName}) grading scale, GPA calculator, and CGPA calculator. Grading information sourced from official university materials.`;

    return createMetadata({
      title,
      description,
      path: `/universities/${university.slug}`,
    });
  } catch {
    return { title: "University" };
  }
}

export default async function UniversityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  let university;
  try {
    university = await getPublishedBySlug(slug);
  } catch (e) {
    // Database error — treat as not-found so the user sees the 404
    // page rather than a crash. In production this would surface a
    // 500 to monitoring; for now the 404 is the honest public face.
    console.error("Failed to fetch university:", e);
    notFound();
  }

  if (!university) {
    notFound();
  }

  const canonical = getCanonicalUrl(`/universities/${university.slug}`);

  return (
    <PageShell
      title={university.name}
      description={`${university.shortName} · ${university.city} · ${university.type === "public" ? "Public" : "Private"} university`}
      headerActions={
        <>
          <Link
            href={`/gpa-cal/${university.slug}`}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Calculator className="h-4 w-4" aria-hidden="true" />
            GPA Calculator
          </Link>
          <Link
            href={`/cgpa-cal/${university.slug}`}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/85 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <GraduationCap className="h-4 w-4" aria-hidden="true" />
            CGPA Calculator
          </Link>
        </>
      }
    >
      {/* BreadcrumbList JSON-LD */}
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", url: getCanonicalUrl("/") },
          { name: "Universities", url: getCanonicalUrl("/universities") },
          { name: university.shortName, url: canonical },
        ])}
      />
      {/* FAQPage JSON-LD — only when the page visibly renders FAQs */}
      <JsonLd data={buildFaqPageJsonLd(university.faqs)} />

      <div className="flex flex-col gap-10">
        {/* ---------- About ---------- */}
        <section aria-labelledby="about-heading">
          <h2 id="about-heading" className="text-xl font-bold text-foreground">
            About this grading scale
          </h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-foreground sm:text-base">
            {university.description}
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted-foreground">Max GPA</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                {university.maxScale.toFixed(2)}
              </dd>
            </div>
            {university.passingCGPA !== undefined && (
              <div>
                <dt className="text-xs text-muted-foreground">Passing CGPA</dt>
                <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                  {university.passingCGPA.toFixed(2)}
                </dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-muted-foreground">Grades</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                {university.scale.grades.length}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">City</dt>
              <dd className="mt-0.5 text-lg font-semibold text-foreground">
                {university.city}
              </dd>
            </div>
          </dl>
        </section>

        {/* ---------- Grading scale table ---------- */}
        <section aria-labelledby="scale-heading">
          <h2 id="scale-heading" className="text-xl font-bold text-foreground">
            Grading scale
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Letter grades, grade points, and percentage ranges where published
            by the university.
          </p>
          <GradingScaleTable scale={university.scale} className="mt-4" />
        </section>

        {/* ---------- FAQs ---------- */}
        {university.faqs.length > 0 && (
          <section aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-xl font-bold text-foreground">
              Frequently asked questions
            </h2>
            <dl className="mt-4 flex flex-col gap-4">
              {university.faqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <dt className="font-medium text-foreground">{faq.q}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* ---------- Source / verification ---------- */}
        <section aria-labelledby="source-heading" className="rounded-xl border border-border bg-surface/30 p-5">
          <h2 id="source-heading" className="text-base font-semibold text-foreground">
            Source &amp; verification
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Grading information sourced from the university&apos;s published
            academic materials. We verify each scale against the linked source
            on the date below.
          </p>
          <dl className="mt-4 flex flex-col gap-3 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <dt className="text-sm text-muted-foreground">Last verified:</dt>
              <dd className="text-sm font-medium text-foreground">
                {formatDate(university.lastVerified)}
              </dd>
            </div>
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <dt className="text-sm text-muted-foreground">Source:</dt>
              <dd>
                <a
                  href={university.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  {sourceHostname(university.sourceUrl)}
                </a>
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </PageShell>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(`${iso}T00:00:00Z`);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

function sourceHostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
