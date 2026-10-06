import * as React from "react";
import Link from "next/link";
import { Plus, Search, Pencil, Eye, Upload, Download, Archive, Trash2 } from "lucide-react";
import { getAll } from "@/repositories/universities.repository";
import { UniversitiesTable } from "@/components/admin/universities-table";
import { formatTimestamp } from "@/lib/format";

export const metadata = {
  title: "Universities · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminUniversitiesPage() {
  let universities: Awaited<ReturnType<typeof getAll>> = [];
  let dbError = false;
  try {
    universities = await getAll();
  } catch {
    dbError = true;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Universities
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {universities.length} {universities.length === 1 ? "university" : "universities"} total
          </p>
        </div>
        <Link
          href="/admin/universities/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add university
        </Link>
      </div>

      {dbError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Could not load universities. Check that MongoDB is configured.
        </div>
      ) : universities.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold text-foreground">
            No universities yet
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
            Create your first university record to start managing grading scales
            and publication status.
          </p>
          <Link
            href="/admin/universities/new"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Add university
          </Link>
        </div>
      ) : (
        <UniversitiesTable universities={universities} />
      )}
    </div>
  );
}
