import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getAll } from "@/repositories/posts.repository";
import { PostsTable } from "@/components/admin/blog/posts-table";

export const metadata: Metadata = {
  title: "Blog Posts · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminBlogPage() {
  let posts: Awaited<ReturnType<typeof getAll>> = [];
  let dbError = false;
  try {
    posts = await getAll();
  } catch {
    dbError = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Blog Posts
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {posts.length} {posts.length === 1 ? "post" : "posts"} total
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          New post
        </Link>
      </div>

      {dbError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load posts. Check that MongoDB is configured.
        </div>
      ) : (
        <PostsTable posts={posts} />
      )}
    </div>
  );
}
