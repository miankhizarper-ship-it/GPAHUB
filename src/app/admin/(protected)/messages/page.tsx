import type { Metadata } from "next";
import Link from "next/link";
import { Mail, MailOpen } from "lucide-react";
import { getAllMessages, getUnreadCount } from "@/repositories/messages.repository";
import { ExportCsvButton } from "@/components/admin/messages/export-csv-button";
import { MessageSearch } from "@/components/admin/messages/message-search";
import { formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Messages · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const searchQuery = q?.trim() ?? "";

  let messages: Awaited<ReturnType<typeof getAllMessages>> = [];
  let unreadCount = 0;
  let dbError = false;
  try {
    [messages, unreadCount] = await Promise.all([
      getAllMessages(),
      getUnreadCount(),
    ]);
  } catch {
    dbError = true;
  }

  // Server-side search filtering.
  const filtered = searchQuery
    ? messages.filter((m) => {
        const lower = searchQuery.toLowerCase();
        return (
          m.name.toLowerCase().includes(lower) ||
          m.email.toLowerCase().includes(lower) ||
          m.subject.toLowerCase().includes(lower) ||
          m.message.toLowerCase().includes(lower)
        );
      })
    : messages;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Messages
          </h1>
          <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "message" : "messages"}
            {searchQuery && ` matching "${searchQuery}"`} · {unreadCount} unread
          </p>
        </div>
        {messages.length > 0 && <ExportCsvButton />}
      </div>

      {/* Search */}
      {messages.length > 0 && <MessageSearch initialQuery={searchQuery} />}

      {dbError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load messages. Check that MongoDB is configured.
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            {searchQuery ? "No messages found" : "No messages yet"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            {searchQuery
              ? `No messages match "${searchQuery}". Try a different search.`
              : "Contact form submissions will appear here. Messages are stored when visitors use the public contact form."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((m) => {
            const isUnread = !m.readAt;
            return (
              <li key={m._id}>
                <Link
                  href={`/admin/messages/${m._id}`}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-surface",
                    isUnread ? "border-primary/40" : "border-border",
                  )}
                >
                  <span className="mt-0.5 shrink-0">
                    {isUnread ? (
                      <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
                    ) : (
                      <MailOpen className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={cn("truncate", isUnread ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                        {m.subject}
                      </p>
                      <time className="shrink-0 text-xs text-muted-foreground">
                        {formatTimestamp(m.createdAt)}
                      </time>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">
                      <span className="font-medium">{m.name}</span> · {m.email}
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {m.message}
                    </p>
                  </div>
                  {isUnread && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
