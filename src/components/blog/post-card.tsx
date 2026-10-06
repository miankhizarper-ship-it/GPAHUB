import * as React from "react";
import Link from "next/link";
import { Calendar, Clock } from "lucide-react";
import type { Post } from "@/types/post";
import { formatDate } from "@/lib/format";
import { formatReadingTime } from "@/lib/reading-time";
import { cn } from "@/lib/utils";

/**
 * Blog post card for the listing page.
 *
 * Server Component — renders a single published post as a card with
 * title, excerpt, date, reading time, optional cover image, and a
 * link to the full article.
 */
export function PostCard({
  post,
  className,
}: {
  post: Post;
  className?: string;
}) {
  return (
    <li
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      {post.coverImage && (
        <Link
          href={`/blog/${post.slug}`}
          className="block aspect-[1200/630] overflow-hidden bg-surface"
          aria-label={post.title}
        >
          <img
            src={post.coverImage}
            alt=""
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        </Link>
      )}
      <div className="flex flex-1 flex-col p-5">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            {post.publishedAt ? formatDate(post.publishedAt.slice(0, 10)) : "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {formatReadingTime(post.content)}
          </span>
        </p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">
          <Link
            href={`/blog/${post.slug}`}
            className="rounded-md transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <Link
          href={`/blog/${post.slug}`}
          className="mt-4 inline-flex h-9 items-center text-sm font-medium text-primary hover:text-primary/80"
        >
          Read article →
        </Link>
      </div>
    </li>
  );
}
