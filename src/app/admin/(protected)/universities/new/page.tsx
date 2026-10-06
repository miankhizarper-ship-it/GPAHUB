import type { Metadata } from "next";
import { UniversityForm } from "@/components/admin/university-form";

export const metadata: Metadata = {
  title: "New University · Admin",
  robots: { index: false, follow: false },
};

export default function NewUniversityPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Add university
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new university record. Save as draft first, then publish when
          the grading scale is verified.
        </p>
      </div>
      <UniversityForm mode="create" />
    </div>
  );
}
