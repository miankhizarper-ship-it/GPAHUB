import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Terms of Service",
  description:
    "GPAHub's terms of service. Acceptable use, informational nature, intellectual property, limitation of liability, and external links.",
  path: "/terms",
});

const LAST_UPDATED = "2026-10-06";

export default function TermsPage() {
  return (
    <PageShell title="Terms of Service" description={`Last updated: ${LAST_UPDATED}`}>
      <div className="mx-auto max-w-3xl">
        <p className="mb-8 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-bold text-foreground">Acceptable use</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              By using GPAHub, you agree to use the site for its intended purpose —
              calculating GPA and CGPA, browsing university grading scales, and
              reading blog content. You agree not to attempt to disrupt the site,
              abuse the contact form, scrape content at volume, or access
              administrative features without authorization.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Informational nature</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              GPAHub and its calculators are provided for informational purposes
              only. They are not a substitute for official academic advice, official
              transcripts, or guidance from your university&apos;s registrar. See
              our <a href="/disclaimer" className="text-primary underline-offset-4 hover:underline">disclaimer</a> for
              full details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">No guarantee of institutional acceptance</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              We do not guarantee that any university, employer, or institution will
              accept the GPA, CGPA, or percentage values produced by GPAHub.
              Official academic records come from your university&apos;s registrar.
              If you need an official calculation for an application, scholarship, or
              employment, request it from your institution directly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Intellectual property</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              The GPAHub website design, code, calculator logic, and original written
              content (including blog posts and legal pages) are the property of
              GPAHub. University names, logos, and grading-scale data belong to their
              respective institutions — we reference them for informational purposes
              and link to official sources. You may not copy, redistribute, or
              republish substantial portions of GPAHub content without permission.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Limitation of liability</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              GPAHub is provided &quot;as is&quot; without warranty of any kind. To
              the maximum extent permitted by law, we are not liable for any damages
              arising from the use of — or inability to use — this site, including
              but not limited to academic decisions made based on calculator results,
              lost opportunities, or data inaccuracies in grading-scale information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">External links</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              University pages link to external sources for grading-scale
              verification. We are not responsible for the content, accuracy, or
              availability of those external sites. The inclusion of a link does not
              imply endorsement.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Changes to the service</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              We may update, modify, or discontinue any part of GPAHub at any time
              without notice. We may add or remove universities, blog posts,
              calculators, or features as the project evolves. These terms will
              continue to apply to the service as it changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Changes to these terms</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              We may update these terms from time to time. The &quot;Last
              updated&quot; date at the top of this page reflects the most recent
              revision. Continued use of GPAHub after changes take effect constitutes
              acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Contact</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              Questions about these terms? Use the <a href="/contact" className="text-primary underline-offset-4 hover:underline">contact form</a> to reach us.
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
