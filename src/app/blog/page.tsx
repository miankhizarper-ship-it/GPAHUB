import type { Metadata } from "next";
import { getPublished } from "@/repositories/posts.repository";
import { PageShell } from "@/components/layout/page-shell";
import { PostCard } from "@/components/blog/post-card";
import { createMetadata } from "@/lib/seo";
import { buildWebSiteJsonLd } from "@/lib/json-ld";
import { JsonLd } from "@/components/seo/json-ld";

export const revalidate = 3600;

export const metadata: Metadata = createMetadata({
  title: "Blog — GPA & CGPA Tips for Pakistani Students",
  description:
    "Guides on GPA and CGPA calculation, grading scales, and percentage conversion for Pakistani university students. Practical tips from GPAHub.",
  path: "/blog",
});

export default async function BlogPage() {
  let posts: Awaited<ReturnType<typeof getPublished>> = [];
  let dbError = false;
  try {
    posts = await getPublished();
  } catch {
    dbError = true;
  }

  return (
    <PageShell
      title="Blog"
      description="Guides and tips on GPA, CGPA, grading scales, and percentage conversion for Pakistani university students."
    >
      <JsonLd data={buildWebSiteJsonLd()} />

      {dbError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load blog posts right now. Please try again later.
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            No articles yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Blog posts will appear here once they are published. Check back soon
            for guides on GPA and CGPA calculation.
          </p>
        </div>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </ul>
      )}
    </PageShell>
  );
}
