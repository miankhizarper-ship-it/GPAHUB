import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBySlug } from "@/repositories/universities.repository";
import { UniversityForm } from "@/components/admin/university-form";

export const metadata: Metadata = {
  title: "Edit University · Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditUniversityPage({ params }: PageProps) {
  const { slug } = await params;
  let university;
  try {
    university = await getBySlug(slug);
  } catch {
    notFound();
  }

  if (!university) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Edit {university.shortName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {university.name} · slug: <code className="rounded bg-surface px-1 py-0.5 text-xs">{university.slug}</code>
        </p>
      </div>
      <UniversityForm mode="edit" initialData={university} />
    </div>
  );
}
