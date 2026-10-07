"use server";

/**
 * CSV import server action for universities.
 *
 * Parses a CSV string, validates each row with Zod, and creates
 * universities via the repository. Returns a summary report.
 */

import { requireAdmin } from "@/lib/session";
import { create, getBySlug } from "@/repositories/universities.repository";
import { universitySchema } from "@/validation/university";
import type { UniversityInput } from "@/types/university";
import { recordAudit } from "@/repositories/audit.repository";
import { revalidatePath } from "next/cache";

export type ImportResult =
  | { ok: true; imported: number; skipped: number; errors: string[] }
  | { ok: false; error: string };

interface CsvRow {
  slug: string;
  name: string;
  shortName: string;
  city: string;
  type: string;
  logo: string;
  description: string;
  maxScale: string;
  passingCGPA: string;
  sourceUrl: string;
  lastVerified: string;
  status: string;
  grades: string; // JSON string of grade array
  faqs: string; // JSON string of FAQ array
  seoTitle: string;
  seoMetaDescription: string;
}

/**
 * Parse a CSV line, handling quoted fields with commas/newlines.
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        fields.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  fields.push(current);
  return fields;
}

/**
 * Import universities from a CSV string.
 *
 * Expected CSV columns (header row required):
 * slug,name,shortName,city,type,logo,description,maxScale,passingCGPA,
 * sourceUrl,lastVerified,status,grades,faqs,seoTitle,seoMetaDescription
 *
 * `grades` should be a JSON array: [{"grade":"A","points":4.0,"minPercent":85,"maxPercent":100},...]
 * `faqs` should be a JSON array: [{"q":"Question?","a":"Answer."},...]
 */
export async function importUniversitiesCsvAction(
  csvContent: string,
): Promise<ImportResult> {
  const session = await requireAdmin();
  const adminEmail = session.user?.email ?? "unknown";

  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    return { ok: false, error: "CSV must have a header row and at least one data row." };
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const requiredHeaders = [
    "slug", "name", "shortName", "city", "type", "logo", "description",
    "maxScale", "passingCGPA", "sourceUrl", "lastVerified", "status",
    "grades", "faqs", "seoTitle", "seoMetaDescription",
  ];

  for (const req of requiredHeaders) {
    if (!headers.includes(req)) {
      return { ok: false, error: `Missing required CSV column: ${req}` };
    }
  }

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = (values[idx] ?? "").trim();
    });

    try {
      // Parse JSON fields
      let grades: unknown;
      let faqs: unknown;
      try {
        grades = JSON.parse(row.grades || "[]");
      } catch {
        errors.push(`Row ${i + 1}: Invalid JSON in grades column`);
        skipped++;
        continue;
      }
      try {
        faqs = JSON.parse(row.faqs || "[]");
      } catch {
        errors.push(`Row ${i + 1}: Invalid JSON in faqs column`);
        skipped++;
        continue;
      }

      const maxScale = parseFloat(row.maxScale);
      const passingCGPA = row.passingCGPA ? parseFloat(row.passingCGPA) : undefined;

      const input: UniversityInput = {
        slug: row.slug,
        name: row.name,
        shortName: row.shortName,
        city: row.city,
        type: row.type as "public" | "private",
        logo: row.logo,
        description: row.description,
        scale: {
          maxPoints: maxScale,
          grades: grades as never,
        },
        maxScale,
        passingCGPA,
        sourceUrl: row.sourceUrl || "",
        lastVerified: row.lastVerified || "",
        status: row.status as "draft" | "published" | "archived",
        faqs: faqs as never,
        seo: (row.seoTitle || row.seoMetaDescription)
          ? {
              title: row.seoTitle || undefined,
              metaDescription: row.seoMetaDescription || undefined,
            }
          : undefined,
      };

      // Validate with Zod
      const parsed = universitySchema.safeParse(input);
      if (!parsed.success) {
        const msgs = parsed.error.issues.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
        errors.push(`Row ${i + 1} (${row.slug || "no slug"}): ${msgs}`);
        skipped++;
        continue;
      }

      // Create (upsert)
      const created = await create(input);
      imported++;

      await recordAudit({
        action: "UNIVERSITY_CREATED",
        entityType: "university",
        entityId: created.slug,
        entitySlug: created.slug,
        adminEmail,
        metadata: { name: created.name, imported: true },
      });
    } catch (e) {
      errors.push(`Row ${i + 1}: ${e instanceof Error ? e.message : "Unknown error"}`);
      skipped++;
    }
  }

  // Revalidate all university pages
  revalidatePath("/universities");
  revalidatePath("/universities/[slug]", "page");
  revalidatePath("/gpa-cal/[slug]", "page");
  revalidatePath("/cgpa-cal/[slug]", "page");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");

  return { ok: true, imported, skipped, errors };
}
