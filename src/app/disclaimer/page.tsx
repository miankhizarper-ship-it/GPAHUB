import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Disclaimer",
  description:
    "GPAHub provides calculation tools for informational purposes. Grading scales are based on available university sources — students should verify official requirements.",
  path: "/disclaimer",
});

const LAST_UPDATED = "2026-10-06";

export default function DisclaimerPage() {
  return (
    <PageShell title="Disclaimer" description={`Last updated: ${LAST_UPDATED}`}>
      <div className="mx-auto max-w-3xl">
        <p className="mb-8 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-bold text-foreground">Informational purposes only</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              GPAHub provides calculation tools and grading-scale information for
              general informational purposes. The GPA, CGPA, and percentage results
              produced by the calculators are estimates based on the grading scales
              we have compiled from publicly available university sources. They are
              not a substitute for your university&apos;s official academic records
              or transcript.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Grading scale sources</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              Each university grading scale on GPAHub is compiled from official
              university sources — handbooks, registrar pages, and academic
              catalogues. We link to the source on every university page and show
              the date the scale was last verified. However, universities may update
              their grading policies without notice, and we cannot guarantee that
              every scale is current. Always verify against your university&apos;s
              official documents before making academic decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Not a university</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              GPAHub is an independent tool. It is not a university, is not
              affiliated with any university, and is not endorsed by or officially
              connected to any educational institution. The word marks and names of
              universities referenced on this site belong to their respective owners.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Not official academic records</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              The results produced by GPAHub calculators should not be represented
              as official academic records. Your university&apos;s registrar is the
              authoritative source for your GPA, CGPA, and academic standing. If
              there is a discrepancy between GPAHub&apos;s calculation and your
              official transcript, your university&apos;s record is correct.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Conversion formulas may vary</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              The CGPA-to-percentage converter uses the standard linear formula
              <code className="mx-1 rounded bg-surface px-1.5 py-0.5 text-sm">percentage = (CGPA / maxGPA) × 100</code>
              as a sensible default. Some universities use different conversion
              formulas (banded, polynomial, or institution-specific). Always check
              your university&apos;s official conversion policy when an accurate
              percentage is required for applications, scholarships, or employment.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">No accuracy guarantee</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              While we strive to keep grading scales and calculations accurate and
              up to date, GPAHub is provided &quot;as is&quot; without warranty of
              any kind. We do not guarantee that the information on this site is
              complete, current, or applicable to your specific situation. Use the
              calculators at your own discretion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">External links</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              University pages link to external sources for grading-scale
              verification. We are not responsible for the content or availability
              of those external sites. The inclusion of a link does not imply
              endorsement of the linked site.
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
