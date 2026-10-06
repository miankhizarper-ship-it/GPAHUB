"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Pencil, Eye, Upload, Download, Archive, Trash2, Loader2 } from "lucide-react";
import type { University } from "@/types/university";
import {
  publishUniversityAction,
  unpublishUniversityAction,
  archiveUniversityAction,
  deleteUniversityAction,
} from "@/app/admin/actions/universities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

/**
 * Universities table — Client Component.
 *
 * Searchable table with status badges and per-row actions:
 *   - Edit (link to edit form)
 *   - Preview (link to admin preview)
 *   - Publish / Unpublish (server action)
 *   - Archive (server action, with confirm dialog)
 *   - Delete (server action, with confirm dialog)
 *
 * Destructive actions (archive, delete) use AlertDialog for confirmation.
 * The table updates locally on success and calls `router.refresh()` to
 * re-fetch the server-rendered list.
 */

export function UniversitiesTable({
  universities,
}: {
  universities: readonly University[];
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return universities;
    const q = query.trim().toLowerCase();
    return universities.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.shortName.toLowerCase().includes(q) ||
        u.slug.includes(q) ||
        u.city.toLowerCase().includes(q),
    );
  }, [universities, query]);

  async function runAction(
    slug: string,
    action: (slug: string) => Promise<{ ok: boolean; error?: string }>,
    label: string,
  ) {
    setBusy(slug);
    setError(null);
    try {
      const result = await action(slug);
      if (!result.ok) {
        setError(`${label} failed: ${result.error ?? "Unknown error"}`);
      } else {
        router.refresh();
      }
    } catch (e) {
      setError(`${label} failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          placeholder="Search by name, city, or slug..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
          aria-label="Search universities"
        />
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive"
        >
          {error}
        </div>
      )}

      {/* Table (desktop) */}
      <div className="hidden overflow-x-auto rounded-lg border border-border bg-card sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/50 text-left">
              <th className="px-4 py-3 font-semibold text-foreground">Name</th>
              <th className="px-4 py-3 font-semibold text-foreground">City</th>
              <th className="px-4 py-3 font-semibold text-foreground">Type</th>
              <th className="px-4 py-3 font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 font-semibold text-foreground">Updated</th>
              <th className="px-4 py-3 text-right font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.slug} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.shortName} · /{u.slug}</p>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.city}</td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{u.type}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatTimestamp(u.updatedAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/universities/${u.slug}`} title="Preview">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Preview ${u.name}`}>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </Link>
                    <Link href={`/admin/universities/${u.slug}/edit`} title="Edit">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Edit ${u.name}`}>
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </Link>
                    {u.status === "published" ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={busy === u.slug}
                        onClick={() => runAction(u.slug, unpublishUniversityAction, "Unpublish")}
                        aria-label={`Unpublish ${u.name}`}
                        title="Unpublish"
                      >
                        {busy === u.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={busy === u.slug}
                        onClick={() => runAction(u.slug, publishUniversityAction, "Publish")}
                        aria-label={`Publish ${u.name}`}
                        title="Publish"
                      >
                        {busy === u.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Archive ${u.name}`} title="Archive">
                          <Archive className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Archive {u.name}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            The university will be hidden from public pages but kept in the database. You can restore it by editing its status.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => runAction(u.slug, archiveUniversityAction, "Archive")}
                          >
                            Archive
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" aria-label={`Delete ${u.name}`} title="Delete permanently">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete {u.name} permanently?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. The university record will be permanently removed from the database. Consider archiving instead if you may need it later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => runAction(u.slug, deleteUniversityAction, "Delete")}
                          >
                            Delete permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards (mobile) */}
      <ul className="flex flex-col gap-3 sm:hidden">
        {filtered.map((u) => (
          <li key={u.slug} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.shortName} · {u.city}</p>
              </div>
              <StatusBadge status={u.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/admin/universities/${u.slug}`}>
                <Button variant="outline" size="sm" className="h-8">Preview</Button>
              </Link>
              <Link href={`/admin/universities/${u.slug}/edit`}>
                <Button variant="outline" size="sm" className="h-8">Edit</Button>
              </Link>
              {u.status === "published" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={busy === u.slug}
                  onClick={() => runAction(u.slug, unpublishUniversityAction, "Unpublish")}
                >
                  Unpublish
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={busy === u.slug}
                  onClick={() => runAction(u.slug, publishUniversityAction, "Publish")}
                >
                  Publish
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No universities match &ldquo;{query}&rdquo;.
        </p>
      )}
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
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status] ?? "bg-muted text-muted-foreground",
      )}
    >
      {status}
    </span>
  );
}
