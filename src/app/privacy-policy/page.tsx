import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "GPAHub's privacy policy. Calculator inputs stay in your browser. Contact form submissions are stored so we can reply. No accounts, no tracking, no unnecessary data collection.",
  path: "/privacy-policy",
});

const LAST_UPDATED = "2026-10-06";

export default function PrivacyPolicyPage() {
  return (
    <PageShell title="Privacy Policy" description={`Last updated: ${LAST_UPDATED}`}>
      <div className="mx-auto max-w-3xl">
        <p className="mb-8 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        <div className="flex flex-col gap-6">
          <section>
            <h2 className="text-lg font-bold text-foreground">Overview</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              GPAHub is designed to be privacy-friendly. There are no user accounts,
              no tracking cookies, and no analytics that collect personal data. This
              policy explains exactly what data we process and why.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Calculator inputs</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              All GPA, CGPA, and percentage calculations happen entirely in your
              browser. The grades, credit hours, and semester data you enter into
              the calculators are never sent to our server, never stored in our
              database, and never logged. When you close the page, that data is gone.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Contact form submissions</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              When you submit the contact form, we store your name, email address,
              subject, and message in our database so we can read and reply to your
              message. This data is stored for as long as needed to resolve your
              inquiry and is accessible only to GPAHub administrators. We do not
              store your IP address on the message record.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Rate limiting</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              To prevent abuse of the contact form, we apply IP-based rate limiting
              (max 3 submissions per hour per IP). We store a SHA-256 hash of your
              IP address — not the raw IP — in a separate collection with a TTL
              index, so the data expires automatically after one hour. We do not
              use this hash for any purpose other than counting submissions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">No user accounts</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              Public users do not need to create an account, log in, or provide any
              personal information to use the calculators or browse university pages.
              The only authentication on GPAHub is for administrators, who log in via
              a separate admin panel that is not accessible to the public.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Hosting and infrastructure</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              GPAHub is hosted on Vercel and uses MongoDB Atlas for data storage.
              These providers may process basic technical data (such as request
              headers and server logs) as part of hosting the site. We do not
              control how these providers handle their own infrastructure logs —
              consult their respective privacy policies for details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Cookies</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              GPAHub does not use advertising cookies, tracking pixels, or
              third-party analytics. The site uses a single cookie to remember your
              light/dark theme preference. The admin login uses a session cookie
              (signed JWT) that expires after 30 days. Neither cookie contains
              personal information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">No collection of academic data</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              We do not collect, store, or process your grades, courses, GPA, CGPA,
              or any other academic data. The university grading scales stored in
              our database are public information compiled from official sources —
              they are not student data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Changes to this policy</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              We may update this privacy policy from time to time. The
              &quot;Last updated&quot; date at the top of this page reflects the
              most recent revision. Material changes will be noted on this page.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-foreground">Contact</h2>
            <p className="mt-2 leading-relaxed text-foreground">
              If you have questions about this privacy policy or how your data is
              handled, please use the <a href="/contact" className="text-primary underline-offset-4 hover:underline">contact form</a>.
            </p>
          </section>
        </div>
      </div>
    </PageShell>
  );
}
