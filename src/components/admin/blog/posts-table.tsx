"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Pencil, Eye, Upload, Download, Archive, Trash2, Loader2 } from "lucide-react";
import type { Post } from "@/types/post";
import {
  publishPostAction,
  unpublishPostAction,
  archivePostAction,
  deletePostAction,
} from "@/app/admin/actions/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

export function PostsTable({ posts }: { posts: readonly Post[] }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [busy, setBusy] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    let result = posts;
    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.slug.includes(q) ||
          p.excerpt.toLowerCase().includes(q),
      );
    }
    return result;
  }, [posts, query, statusFilter]);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            type="search"
            placeholder="Search posts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
            aria-label="Search posts"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Drafts</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded-lg border border-border bg-card sm:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface/50 text-left">
              <th className="px-4 py-3 font-semibold text-foreground">Title</th>
              <th className="px-4 py-3 font-semibold text-foreground">Status</th>
              <th className="px-4 py-3 font-semibold text-foreground">Published</th>
              <th className="px-4 py-3 font-semibold text-foreground">Updated</th>
              <th className="px-4 py-3 text-right font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.slug} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground">/{p.slug}</p>
                </td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {p.publishedAt ? formatTimestamp(p.publishedAt) : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatTimestamp(p.updatedAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/blog/${p.slug}/preview`} title="Preview">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Preview ${p.title}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/blog/${p.slug}/edit`} title="Edit">
                      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Edit ${p.title}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    {p.status === "published" ? (
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={busy === p.slug}
                        onClick={() => runAction(p.slug, unpublishPostAction, "Unpublish")}
                        aria-label={`Unpublish ${p.title}`} title="Unpublish">
                        {busy === p.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-8 w-8" disabled={busy === p.slug}
                        onClick={() => runAction(p.slug, publishPostAction, "Publish")}
                        aria-label={`Publish ${p.title}`} title="Publish">
                        {busy === p.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Archive ${p.title}`} title="Archive">
                          <Archive className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Archive &ldquo;{p.title}&rdquo;?</AlertDialogTitle>
                          <AlertDialogDescription>
                            The post will be hidden from the public blog but kept in the database. You can restore it by changing its status.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => runAction(p.slug, archivePostAction, "Archive")}>
                            Archive
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" aria-label={`Delete ${p.title}`} title="Delete permanently">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete &ldquo;{p.title}&rdquo; permanently?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This cannot be undone. The post will be permanently removed from the database.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => runAction(p.slug, deletePostAction, "Delete")}>
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

      {/* Mobile cards */}
      <ul className="flex flex-col gap-3 sm:hidden">
        {filtered.map((p) => (
          <li key={p.slug} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{p.title}</p>
                <p className="text-xs text-muted-foreground">/{p.slug}</p>
              </div>
              <StatusBadge status={p.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/admin/blog/${p.slug}/preview`}>
                <Button variant="outline" size="sm" className="h-8">Preview</Button>
              </Link>
              <Link href={`/admin/blog/${p.slug}/edit`}>
                <Button variant="outline" size="sm" className="h-8">Edit</Button>
              </Link>
              {p.status === "published" ? (
                <Button variant="outline" size="sm" className="h-8" disabled={busy === p.slug}
                  onClick={() => runAction(p.slug, unpublishPostAction, "Unpublish")}>
                  Unpublish
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="h-8" disabled={busy === p.slug}
                  onClick={() => runAction(p.slug, publishPostAction, "Publish")}>
                  Publish
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {posts.length === 0
            ? "No blog posts yet. Create your first one to get started."
            : "No posts match your search."}
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
    <span className={cn(
      "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
      styles[status] ?? "bg-muted text-muted-foreground",
    )}>
      {status}
    </span>
  );
}
