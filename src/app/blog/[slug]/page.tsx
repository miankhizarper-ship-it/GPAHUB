import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ArrowRight, Calendar, Clock, ChevronRight } from "lucide-react";
import { getPublished, getPublishedBySlug } from "@/repositories/posts.repository";
import { resolveRedirect } from "@/repositories/post-redirects.repository";
import { PageShell } from "@/components/layout/page-shell";
import { MarkdownContent } from "@/components/blog/markdown-content";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/seo/json-ld";
import { createMetadata, getCanonicalUrl } from "@/lib/seo";
import { buildArticleJsonLd, buildBreadcrumbJsonLd } from "@/lib/json-ld";
import { formatDate } from "@/lib/format";
import { formatReadingTime } from "@/lib/reading-time";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const posts = await getPublished();
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await getPublishedBySlug(slug);
    if (!post) return { title: "Article not found" };

    return createMetadata({
      title: post.seo?.title ?? post.title,
      description: post.seo?.metaDescription ?? post.excerpt,
      path: `/blog/${post.slug}`,
      ogType: "article",
      image: post.coverImage,
      publishedAt: post.publishedAt,
      modifiedAt: post.updatedAt,
    });
  } catch {
    return { title: "Article" };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  let post;
  try {
    post = await getPublishedBySlug(slug);
  } catch (e) {
    console.error("Failed to fetch blog post:", e);
    notFound();
  }

  // If the post doesn't exist at this slug, check for a redirect
  // (the slug may have been changed by an admin).
  if (!post) {
    try {
      const redirectSlug = await resolveRedirect(slug);
      if (redirectSlug && redirectSlug !== slug) {
        redirect(`/blog/${redirectSlug}`);
      }
    } catch {
      // DB error — fall through to 404.
    }
    notFound();
  }

  // Fetch all published posts for related articles + prev/next.
  let allPosts: Awaited<ReturnType<typeof getPublished>> = [];
  try {
    allPosts = await getPublished();
  } catch {
    // DB error — skip related/prev/next.
  }

  const currentIndex = allPosts.findIndex((p) => p.slug === post.slug);
  // Posts are sorted newest-first, so "prev" is the newer post and
  // "next" is the older post.
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost =
    currentIndex >= 0 && currentIndex < allPosts.length - 1
      ? allPosts[currentIndex + 1]
      : null;

  // Related: 2 other posts (excluding current), newest-first.
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);

  const canonical = getCanonicalUrl(`/blog/${post.slug}`);

  return (
    <PageShell
      title={post.title}
      description={post.excerpt}
      headerActions={
        <Link
          href="/blog"
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All articles
        </Link>
      }
    >
      <JsonLd
        data={buildArticleJsonLd({
          headline: post.title,
          description: post.seo?.metaDescription ?? post.excerpt,
          url: canonical,
          image: post.coverImage,
          datePublished: post.publishedAt ?? post.createdAt,
          dateModified: post.updatedAt,
          excerpt: post.excerpt,
        })}
      />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Home", url: getCanonicalUrl("/") },
          { name: "Blog", url: getCanonicalUrl("/blog") },
          { name: post.title, url: canonical },
        ])}
      />

      <article className="mx-auto max-w-3xl">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">Home</Link>
            </li>
            <li><ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></li>
            <li>
              <Link href="/blog" className="hover:text-foreground">Blog</Link>
            </li>
            <li><ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /></li>
            <li className="truncate text-foreground" aria-current="page">{post.title}</li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" aria-hidden="true" />
              {post.publishedAt ? formatDate(post.publishedAt.slice(0, 10)) : "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {formatReadingTime(post.content)}
            </span>
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {post.title}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{post.excerpt}</p>
        </header>

        {/* Cover image */}
        {post.coverImage && (
          <img
            src={post.coverImage}
            alt=""
            className="mb-8 aspect-[1200/630] w-full rounded-xl border border-border object-cover"
          />
        )}

        {/* Content */}
        <MarkdownContent content={post.content} />

        {/* Footer / internal links */}
        <footer className="mt-12 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            Published by {siteConfig.name}. Calculators run entirely in your
            browser — your grades never leave your device.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/gpa-calculator"
              className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              GPA Calculator
            </Link>
            <Link
              href="/cgpa-calculator"
              className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-surface"
            >
              CGPA Calculator
            </Link>
            <Link
              href="/universities"
              className="inline-flex h-9 items-center rounded-md border border-border px-4 text-sm font-medium text-foreground hover:bg-surface"
            >
              Browse universities
            </Link>
          </div>
        </footer>
      </article>

      {/* Prev/Next navigation */}
      {(prevPost || nextPost) && (
        <nav
          aria-label="Article navigation"
          className="mx-auto mt-10 flex max-w-3xl items-center justify-between gap-4 border-t border-border pt-6"
        >
          {prevPost ? (
            <Link
              href={`/blog/${prevPost.slug}`}
              className="group flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-card p-3 hover:bg-surface"
            >
              <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">Previous</span>
                <span className="block truncate text-sm font-medium text-foreground">{prevPost.title}</span>
              </span>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="group flex min-w-0 flex-1 items-center justify-end gap-2 rounded-lg border border-border bg-card p-3 text-right hover:bg-surface"
            >
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">Next</span>
                <span className="block truncate text-sm font-medium text-foreground">{nextPost.title}</span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground" aria-hidden="true" />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </nav>
      )}

      {/* Related articles */}
      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mx-auto mt-12 max-w-3xl">
          <h2 id="related-heading" className="text-lg font-bold text-foreground">
            Related articles
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </ul>
        </section>
      )}
    </PageShell>
  );
}
