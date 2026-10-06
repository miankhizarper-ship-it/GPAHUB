import type { Metadata } from "next";
import { ShieldCheck, Search } from "lucide-react";
import { getAuditLogs } from "@/repositories/audit.repository";
import { formatTimestamp } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Audit Log · Admin",
  robots: { index: false, follow: false },
};

/** Human-readable labels for audit actions. */
const ACTION_LABELS: Record<string, string> = {
  UNIVERSITY_CREATED: "Created university",
  UNIVERSITY_UPDATED: "Updated university",
  UNIVERSITY_PUBLISHED: "Published university",
  UNIVERSITY_UNPUBLISHED: "Unpublished university",
  UNIVERSITY_ARCHIVED: "Archived university",
  UNIVERSITY_DELETED: "Deleted university",
  POST_CREATED: "Created post",
  POST_UPDATED: "Updated post",
  POST_PUBLISHED: "Published post",
  POST_UNPUBLISHED: "Unpublished post",
  POST_ARCHIVED: "Archived post",
  POST_DELETED: "Deleted post",
  MESSAGE_MARKED_READ: "Marked message read",
  MESSAGE_MARKED_UNREAD: "Marked message unread",
  MESSAGE_DELETED: "Deleted message",
};

/** Color tones for entity types. */
const ENTITY_TONES: Record<string, string> = {
  university: "bg-surface text-primary",
  post: "bg-accent text-accent-foreground",
  message: "bg-muted text-muted-foreground",
};

export default async function AdminAuditPage() {
  let logs: Awaited<ReturnType<typeof getAuditLogs>> = [];
  let dbError = false;
  try {
    logs = await getAuditLogs(200);
  } catch {
    dbError = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Audit Log
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {logs.length} {logs.length === 1 ? "event" : "events"} recorded · newest first
        </p>
      </div>

      {dbError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load audit log. Check that MongoDB is configured.
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-foreground">No audit events yet</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Admin mutations (create, update, publish, delete) will appear here with the
            admin email, action, and timestamp.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface/50 text-left">
                <th className="px-4 py-3 font-semibold text-foreground">Action</th>
                <th className="hidden px-4 py-3 font-semibold text-foreground sm:table-cell">Entity</th>
                <th className="px-4 py-3 font-semibold text-foreground">Admin</th>
                <th className="px-4 py-3 font-semibold text-foreground">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </p>
                    {log.entitySlug && (
                      <p className="text-xs text-muted-foreground">/{log.entitySlug}</p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                        ENTITY_TONES[log.entityType] ?? "bg-muted text-muted-foreground",
                      )}
                    >
                      {log.entityType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.adminEmail}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatTimestamp(log.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
