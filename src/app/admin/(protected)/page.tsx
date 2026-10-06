import * as React from "react";
import Link from "next/link";
import {
  Plus, FileText, CheckCircle2, FileEdit, Archive, ArrowRight,
  Mail, MailOpen, PenLine,
} from "lucide-react";
import { getAll as getAllUniversities } from "@/repositories/universities.repository";
import { getAll as getAllPosts } from "@/repositories/posts.repository";
import { getAllMessages, getUnreadCount } from "@/repositories/messages.repository";
import { formatDate, formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  // Fetch all entities in parallel — fail gracefully on DB unavailable.
  const [universitiesResult, postsResult, messagesResult] = await Promise.allSettled([
    getAllUniversities(),
    getAllPosts(),
    getAllMessages(),
  ]);

  const universities = universitiesResult.status === "fulfilled" ? universitiesResult.value : [];
  const posts = postsResult.status === "fulfilled" ? postsResult.value : [];
  const messages = messagesResult.status === "fulfilled" ? messagesResult.value : [];

  const publishedUnivs = universities.filter((u) => u.status === "published");
  const publishedPosts = posts.filter((p) => p.status === "published");
  const draftPosts = posts.filter((p) => p.status === "draft");
  const unreadMessages = messages.filter((m) => !m.readAt);

  const recentPosts = posts.slice(0, 5);
  const recentMessages = messages.slice(0, 5);

  const cards = [
    { label: "Universities", value: universities.length, sub: `${publishedUnivs.length} published`, icon: FileText, tone: "text-foreground", href: "/admin/universities" },
    { label: "Blog Posts", value: posts.length, sub: `${publishedPosts.length} published`, icon: PenLine, tone: "text-primary", href: "/admin/blog" },
    { label: "Messages", value: messages.length, sub: `${unreadMessages.length} unread`, icon: Mail, tone: "text-success", href: "/admin/messages" },
    { label: "Drafts", value: draftPosts.length, sub: "blog posts", icon: FileEdit, tone: "text-muted-foreground", href: "/admin/blog" },
  ] as const;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage universities, blog posts, and contact messages.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/universities/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Add university
          </Link>
          <Link href="/admin/blog/new" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-surface">
            <PenLine className="h-4 w-4" /> New post
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-surface"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {card.label}
              </span>
              <card.icon className={cn("h-4 w-4", card.tone)} aria-hidden="true" />
            </div>
            <p className="mt-2 text-3xl font-bold tabular-nums text-foreground">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{card.sub}</p>
          </Link>
        ))}
      </div>

      {/* Recent posts + messages */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Recent blog posts */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent blog posts</h2>
            <Link href="/admin/blog" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentPosts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">No posts yet.</p>
              <Link href="/admin/blog/new" className="mt-2 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                New post
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {recentPosts.map((p) => (
                <li key={p.slug}>
                  <Link href={`/admin/blog/${p.slug}/preview`} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 hover:bg-surface">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{p.title}</p>
                      <p className="text-xs text-muted-foreground">Updated {formatDate(p.updatedAt.slice(0, 10))}</p>
                    </div>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent messages */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent messages</h2>
            <Link href="/admin/messages" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">No messages yet.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {recentMessages.map((m) => (
                <li key={m._id}>
                  <Link href={`/admin/messages/${m._id}`} className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 hover:bg-surface">
                    {!m.readAt ? (
                      <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    ) : (
                      <MailOpen className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{m.subject}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.name} · {formatTimestamp(m.createdAt)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-success/15 text-success",
    draft: "bg-surface text-primary",
    archived: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn(
      "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
      styles[status] ?? "bg-muted text-muted-foreground",
    )}>
      {status}
    </span>
  );
}
