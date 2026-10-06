import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, GraduationCap, Percent, Shield, Smartphone, FileText } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { createMetadata } from "@/lib/seo";
import { buildWebSiteJsonLd } from "@/lib/json-ld";
import { JsonLd } from "@/components/seo/json-ld";

export const metadata: Metadata = createMetadata({
  title: "About GPAHub",
  description:
    "GPAHub is a free, mobile-first GPA and CGPA calculator for Pakistani university students. Learn how it works, why university-specific grading scales matter, and our commitment to source-based grading information.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <PageShell title="About GPAHub" description="Free, mobile-first GPA and CGPA calculation for Pakistani university students.">
      <JsonLd data={buildWebSiteJsonLd()} />

      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-8">
          <section>
            <h2 className="text-xl font-bold text-foreground">What is GPAHub?</h2>
            <p className="mt-3 leading-relaxed text-foreground">
              GPAHub is a free, fast, mobile-first platform for calculating GPA and CGPA
              using the grading scales published by Pakistani universities. It is built for
              students who need a quick, reliable way to compute their semester GPA,
              track their cumulative CGPA across semesters, and convert between CGPA and
              percentage. There are no accounts, no sign-ups, and no data collection —
              every calculation runs entirely in your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">Who is it for?</h2>
            <p className="mt-3 leading-relaxed text-foreground">
              GPAHub is designed for undergraduate and graduate students at Pakistani
              universities who want to understand their academic standing. Whether you are
              planning your next semester, checking your eligibility for a scholarship, or
              converting your CGPA to a percentage for a job application, the calculators
              work the same way your university calculates grades.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">How calculations work</h2>
            <p className="mt-3 leading-relaxed text-foreground">
              GPA is the credit-hour-weighted average of your grade points in a single
              semester. CGPA is the credit-hour-weighted average across all semesters —
              not a simple average of semester GPAs. Semesters with more credit hours
              carry proportionally more weight, exactly as universities calculate it.
              The conversion between CGPA and percentage uses the standard linear formula
              <code className="mx-1 rounded bg-surface px-1.5 py-0.5 text-sm">percentage = (CGPA / maxGPA) × 100</code>
              as a sensible default, though university-specific conversion policies may differ.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">Why university-specific scales?</h2>
            <p className="mt-3 leading-relaxed text-foreground">
              Pakistani universities use different grading scales. Some use a 4.0 scale
              with plus/minus grades, others use a 5.0 scale, and the percentage bands for
              each letter grade vary by institution. A generic calculator that assumes one
              scale will give you the wrong GPA. GPAHub loads the exact grading scale
              published by each university so your calculation matches your transcript.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">Our commitment to source-based grading information</h2>
            <p className="mt-3 leading-relaxed text-foreground">
              Every university grading scale on GPAHub is compiled from official university
              sources — handbooks, registrar pages, and academic catalogues. Each
              university page links to its source and shows the date the scale was last
              verified. We do not invent grading scales, and we do not fabricate percentage
              ranges where the source does not publish them. If you spot an error or an
              outdated scale, please <Link href="/contact" className="text-primary underline-offset-4 hover:underline">let us know</Link>.
            </p>
            <p className="mt-3 rounded-lg border border-border bg-surface/30 px-4 py-3 text-sm text-muted-foreground">
              GPAHub is an independent tool and is not affiliated with, endorsed by, or
              officially connected to any university. Grading information is provided for
              reference — always verify against your university&apos;s official documents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground">Privacy-friendly by design</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-4">
                <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-2 font-semibold text-foreground">No accounts</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Public users never need to sign up or log in. There is no student
                  authentication and no saved calculation history.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-4">
                <Smartphone className="h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="mt-2 font-semibold text-foreground">Client-side calculation</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your grades are never sent to the server. Every calculation happens in
                  your browser and is discarded when you close the page.
                </p>
              </div>
            </div>
          </section>

          {/* Internal links */}
          <section>
            <h2 className="text-xl font-bold text-foreground">Explore GPAHub</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link href="/gpa-calculator" className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-surface">
                <Calculator className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="font-medium text-foreground">GPA Calculator</span>
              </Link>
              <Link href="/cgpa-calculator" className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-surface">
                <GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="font-medium text-foreground">CGPA Calculator</span>
              </Link>
              <Link href="/cgpa-to-percentage" className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-surface">
                <Percent className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="font-medium text-foreground">CGPA ↔ Percentage</span>
              </Link>
              <Link href="/universities" className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 hover:bg-surface">
                <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
                <span className="font-medium text-foreground">Universities</span>
              </Link>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <Link href="/blog" className="text-primary underline-offset-4 hover:underline">Blog</Link>
              <Link href="/contact" className="text-primary underline-offset-4 hover:underline">Contact</Link>
              <Link href="/disclaimer" className="text-muted-foreground underline-offset-4 hover:underline">Disclaimer</Link>
              <Link href="/privacy-policy" className="text-muted-foreground underline-offset-4 hover:underline">Privacy Policy</Link>
              <Link href="/terms" className="text-muted-foreground underline-offset-4 hover:underline">Terms</Link>
            </div>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
