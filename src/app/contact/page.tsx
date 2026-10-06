import type { Metadata } from "next";
import { Mail, MessageSquare, Clock } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { ContactForm } from "@/components/contact/contact-form";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Contact GPAHub",
  description:
    "Get in touch with the GPAHub team. Report an incorrect grading scale, suggest a new university, or share feedback about the calculators.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <PageShell
      title="Contact"
      description="Found an incorrect grading scale? Want to suggest a university? Send us a message."
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-2 text-sm font-semibold text-foreground">Email</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the form below — your message goes straight to our inbox.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <MessageSquare className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-2 text-sm font-semibold text-foreground">Feedback</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Bug reports, feature requests, and grading-scale corrections welcome.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <Clock className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-2 text-sm font-semibold text-foreground">Response time</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              We aim to reply within 2–3 business days.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <ContactForm />
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          Your name, email, subject, and message are stored so we can reply. We
          do not collect IP addresses on the message record. Rate limiting
          applies (max 3 submissions per hour per IP).
        </p>
      </div>
    </PageShell>
  );
}
