"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, AlertCircle, Eye, Pencil } from "lucide-react";
import type { Post } from "@/types/post";
import {
  createPostAction,
  updatePostAction,
  type PostActionResult,
} from "@/app/admin/actions/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { cn } from "@/lib/utils";

/**
 * Post editor — Client Component.
 *
 * Split-pane Markdown editor with live preview. Used for both create
 * and edit. Submits via server actions that validate on the server.
 *
 * ## Slug policy
 *
 * Slug can be changed during edit — a redirect from the old slug to
 * the new slug is created automatically so old URLs continue working.
 *
 * ## Markdown preview
 *
 * Uses the same `MarkdownContent` component as the public blog page,
 * so what the admin sees in preview is exactly what the public will see.
 * No raw HTML rendering — safe by default.
 */

interface PostEditorProps {
  mode: "create" | "edit";
  initialData?: Post;
}

export function PostEditor({ mode, initialData }: PostEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [showPreview, setShowPreview] = React.useState(false);

  // Form state
  const [title, setTitle] = React.useState(initialData?.title ?? "");
  const [slug, setSlug] = React.useState(initialData?.slug ?? "");
  const [excerpt, setExcerpt] = React.useState(initialData?.excerpt ?? "");
  const [content, setContent] = React.useState(initialData?.content ?? "");
  const [coverImage, setCoverImage] = React.useState(initialData?.coverImage ?? "");
  const [publishedAt, setPublishedAt] = React.useState(
    initialData?.publishedAt ? initialData.publishedAt.slice(0, 10) : "",
  );
  const [status, setStatus] = React.useState<"draft" | "published" | "archived">(
    initialData?.status ?? "draft",
  );
  const [seoTitle, setSeoTitle] = React.useState(initialData?.seo?.title ?? "");
  const [seoMeta, setSeoMeta] = React.useState(initialData?.seo?.metaDescription ?? "");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setGlobalError(null);
    setFieldErrors({});

    const payload = {
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage || undefined,
      publishedAt: publishedAt || undefined,
      status,
      seo: seoTitle || seoMeta
        ? { title: seoTitle || undefined, metaDescription: seoMeta || undefined }
        : undefined,
    };

    const result: PostActionResult =
      mode === "create"
        ? await createPostAction(payload)
        : await updatePostAction(initialData!.slug, payload);

    setSaving(false);

    if (result.ok) {
      router.push(`/admin/blog/${result.slug}/preview`);
      router.refresh();
    } else {
      setGlobalError(result.error);
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {globalError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {globalError}
        </div>
      )}

      {/* ---------- Basic info ---------- */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Basic information</h2>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Field label="Title" error={fieldErrors.title} required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="How to Calculate Your GPA" maxLength={120} />
          </Field>
          <Field label="Slug" error={fieldErrors.slug} required hint="Lowercase, hyphenated, URL-safe. Changing the slug creates a redirect from the old URL.">
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="how-to-calculate-gpa"
              pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
            />
          </Field>
          <Field label="Excerpt" error={fieldErrors.excerpt} required hint="Short summary for listing pages + meta description fallback (10–300 chars).">
            <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required rows={2} maxLength={300} placeholder="A clear, concise summary of the article..." />
          </Field>
          <Field label="Cover image URL (optional)" error={fieldErrors.coverImage}>
            <Input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="/blog/cover-image.png" />
          </Field>
        </div>
      </section>

      {/* ---------- Markdown editor ---------- */}
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">Content (Markdown)</h2>
          <div className="flex gap-1">
            <Button
              type="button"
              variant={!showPreview ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowPreview(false)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              type="button"
              variant={showPreview ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowPreview(true)}
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Button>
          </div>
        </div>
        {fieldErrors.content && (
          <p className="mt-2 text-sm text-destructive">{fieldErrors.content}</p>
        )}
        {showPreview ? (
          <div className="mt-4 min-h-[300px] rounded-lg border border-border bg-background p-4">
            {content.trim() ? (
              <MarkdownContent content={content} />
            ) : (
              <p className="text-sm text-muted-foreground">Nothing to preview yet. Switch to Edit to write content.</p>
            )}
          </div>
        ) : (
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={16}
            className="mt-4 font-mono text-sm"
            placeholder={"# Heading\n\nWrite your article in **Markdown**...\n\n- Bullet point\n- Another point\n\n> Blockquote"}
          />
        )}
      </section>

      {/* ---------- Publishing ---------- */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">Publishing</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Status" required>
            <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Published date" error={fieldErrors.publishedAt} hint="Required when status is 'published'.">
            <Input type="date" value={publishedAt} onChange={(e) => setPublishedAt(e.target.value)} />
          </Field>
        </div>
      </section>

      {/* ---------- SEO ---------- */}
      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground">SEO (optional)</h2>
        <p className="mt-1 text-sm text-muted-foreground">Leave blank to auto-generate from the title and excerpt.</p>
        <div className="mt-4 grid grid-cols-1 gap-4">
          <Field label="SEO title" error={fieldErrors["seo.title"]} hint="10–70 characters.">
            <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} placeholder="How to Calculate GPA — GPAHub" />
          </Field>
          <Field label="Meta description" error={fieldErrors["seo.metaDescription"]} hint="50–170 characters.">
            <Textarea value={seoMeta} onChange={(e) => setSeoMeta(e.target.value)} rows={2} maxLength={170} placeholder="Learn how to calculate your semester GPA with any grading scale..." />
          </Field>
        </div>
      </section>

      {/* ---------- Actions ---------- */}
      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === "create" ? "Create post" : "Save changes"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={saving}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
