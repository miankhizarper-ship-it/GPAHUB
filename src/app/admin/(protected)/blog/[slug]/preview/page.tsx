import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil, ArrowLeft, Calendar } from "lucide-react";
import { getBySlug } from "@/repositories/posts.repository";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Preview · Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminPreviewPostPage({ params }: PageProps) {
  const { slug } = await params;
  let post;
  try {
    post = await getBySlug(slug);
  } catch {
    notFound();
  }

  if (!post) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link
          href="/admin/blog"
          className="inline-flex h-9 items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All posts
        </Link>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
              post.status === "published"
                ? "bg-success/15 text-success"
                : post.status === "draft"
                  ? "bg-surface text-primary"
                  : "bg-muted text-muted-foreground",
            )}
          >
            {post.status}
          </span>
          <Link
            href={`/admin/blog/${post.slug}/edit`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      <article>
        <header className="mb-8">
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" aria-hidden="true" />
            {post.publishedAt ? formatDate(post.publishedAt.slice(0, 10)) : "Not published"}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>
        </header>

        {post.coverImage && (
          <img
            src={post.coverImage}
            alt=""
            className="mb-8 aspect-[1200/630] w-full rounded-xl border border-border object-cover"
          />
        )}

        <MarkdownContent content={post.content} />
      </article>
    </div>
  );
}
