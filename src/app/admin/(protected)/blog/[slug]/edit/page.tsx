import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBySlug } from "@/repositories/posts.repository";
import { PostEditor } from "@/components/admin/blog/post-editor";

export const metadata: Metadata = {
  title: "Edit Post · Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { slug } = await params;
  let post;
  try {
    post = await getBySlug(slug);
  } catch {
    notFound();
  }

  if (!post) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Edit {post.title}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          slug: <code className="rounded bg-surface px-1 py-0.5 text-xs">{post.slug}</code> · status: {post.status}
        </p>
      </div>
      <PostEditor mode="edit" initialData={post} />
    </div>
  );
}
