import type { Metadata } from "next";
import { PostEditor } from "@/components/admin/blog/post-editor";

export const metadata: Metadata = {
  title: "New Post · Admin",
  robots: { index: false, follow: false },
};

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          New blog post
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Write your article in Markdown. Save as draft first, then publish when ready.
        </p>
      </div>
      <PostEditor mode="create" />
    </div>
  );
}
