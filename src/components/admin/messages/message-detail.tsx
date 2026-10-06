"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MailOpen, Mail, Trash2, Reply, Loader2 } from "lucide-react";
import type { Message } from "@/types/message";
import {
  markMessageReadAction,
  markMessageUnreadAction,
  deleteMessageAction,
} from "@/app/admin/actions/messages";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatTimestamp } from "@/lib/format";

/**
 * Message detail view — Client Component.
 *
 * Renders message content as plain text (NEVER as HTML) to prevent XSS
 * from user-submitted content. Provides mark read/unread + delete actions.
 */
export function MessageDetail({ message }: { message: Message }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const isUnread = !message.readAt;

  async function handleAction(
    action: (id: string) => Promise<{ ok: boolean; error?: string }>,
    label: string,
  ) {
    setBusy(true);
    setError(null);
    try {
      const result = await action(message._id!);
      if (!result.ok) {
        setError(`${label} failed: ${result.error ?? "Unknown error"}`);
      } else {
        router.refresh();
      }
    } catch (e) {
      setError(`${label} failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <button
          onClick={() => router.push("/admin/messages")}
          className="inline-flex h-9 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All messages
        </button>
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize">
          {isUnread ? (
            <span className="inline-flex items-center gap-1 bg-surface text-primary">
              <Mail className="h-3 w-3" /> Unread
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 bg-muted text-muted-foreground">
              <MailOpen className="h-3 w-3" /> Read
            </span>
          )}
        </span>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        <h1 className="text-xl font-bold text-foreground">{message.subject}</h1>
        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-muted-foreground">From</dt>
            <dd className="mt-0.5 font-medium text-foreground">{message.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Email</dt>
            <dd className="mt-0.5">
              <a href={`mailto:${message.email}`} className="text-primary underline-offset-4 hover:underline">
                {message.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Submitted</dt>
            <dd className="mt-0.5 text-sm text-foreground">{formatTimestamp(message.createdAt)}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <dt className="text-xs text-muted-foreground">Message</dt>
          {/* Render as plain text (pre-wrap) — NEVER as HTML */}
          <dd className="mt-2 whitespace-pre-wrap rounded-lg border border-border bg-background p-4 text-sm leading-relaxed text-foreground">
            {message.message}
          </dd>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => handleAction(isUnread ? markMessageReadAction : markMessageUnreadAction, isUnread ? "Mark read" : "Mark unread")}
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : isUnread ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
            {isUnread ? "Mark as read" : "Mark as unread"}
          </Button>
          <a href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}>
            <Button variant="outline" size="sm">
              <Reply className="h-4 w-4" />
              Reply via email
            </Button>
          </a>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" disabled={busy}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove the message from {message.name}. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => handleAction(deleteMessageAction, "Delete")}
                >
                  Delete permanently
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
