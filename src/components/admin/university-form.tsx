"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, Loader2, AlertCircle } from "lucide-react";
import type { University } from "@/types/university";
import {
  createUniversityAction,
  updateUniversityAction,
  type ActionResult,
} from "@/app/admin/actions/universities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

/**
 * University form — Client Component.
 *
 * Used for both create and edit. Submits via server actions that
 * validate on the server with Zod. Field-level errors from the server
 * are displayed inline.
 *
 * ## Grading scale rows
 * Dynamic: add/remove grade rows. Each row has grade, points, min %,
 * max %. The form validates duplicates and point ranges via the server
 * schema.
 *
 * ## FAQ editor
 * Dynamic: add/remove FAQ rows. Each row has question + answer.
 *
 * ## Empty initial state
 * Starts with one empty grade row and one empty FAQ row so the admin
 * sees the structure immediately.
 */

interface GradeRow {
  id: string;
  grade: string;
  points: string;
  minPercent: string;
  maxPercent: string;
}

interface FaqRow {
  id: string;
  q: string;
  a: string;
}

interface UniversityFormProps {
  mode: "create" | "edit";
  initialData?: University;
}

let rowCounter = 0;
function nextId(prefix: string): string {
  rowCounter += 1;
  return `${prefix}-${rowCounter}`;
}

function makeEmptyGrade(): GradeRow {
  return { id: nextId("g"), grade: "", points: "", minPercent: "", maxPercent: "" };
}

function makeEmptyFaq(): FaqRow {
  return { id: nextId("f"), q: "", a: "" };
}

function universityToForm(u: University): {
  grades: GradeRow[];
  faqs: FaqRow[];
} {
  return {
    grades: u.scale.grades.map((g) => ({
      id: nextId("g"),
      grade: g.grade,
      points: String(g.points),
      minPercent: g.minPercent !== undefined ? String(g.minPercent) : "",
      maxPercent: g.maxPercent !== undefined ? String(g.maxPercent) : "",
    })),
    faqs: u.faqs.length > 0
      ? u.faqs.map((f) => ({ id: nextId("f"), q: f.q, a: f.a }))
      : [makeEmptyFaq()],
  };
}

export function UniversityForm({ mode, initialData }: UniversityFormProps) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [globalError, setGlobalError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // --- Form state ---
  const [name, setName] = React.useState(initialData?.name ?? "");
  const [shortName, setShortName] = React.useState(initialData?.shortName ?? "");
  const [slug, setSlug] = React.useState(initialData?.slug ?? "");
  const [city, setCity] = React.useState(initialData?.city ?? "");
  const [type, setType] = React.useState<"public" | "private">(initialData?.type ?? "public");
  const [logo, setLogo] = React.useState(initialData?.logo ?? "/logos/placeholder.svg");
  const [description, setDescription] = React.useState(initialData?.description ?? "");
  const [maxScale, setMaxScale] = React.useState(initialData ? String(initialData.maxScale) : "4.0");
  const [passingCGPA, setPassingCGPA] = React.useState(
    initialData?.passingCGPA !== undefined ? String(initialData.passingCGPA) : "2.0",
  );
  const [sourceUrl, setSourceUrl] = React.useState(initialData?.sourceUrl ?? "");
  const [lastVerified, setLastVerified] = React.useState(initialData?.lastVerified ?? "");
  const [seoTitle, setSeoTitle] = React.useState(initialData?.seo?.title ?? "");
  const [seoMeta, setSeoMeta] = React.useState(initialData?.seo?.metaDescription ?? "");
  const [status, setStatus] = React.useState<"draft" | "published" | "archived">(
    initialData?.status ?? "draft",
  );

  // Dynamic rows
  const initial = React.useMemo(
    () => (initialData ? universityToForm(initialData) : { grades: [makeEmptyGrade()], faqs: [makeEmptyFaq()] }),
    [initialData],
  );
  const [grades, setGrades] = React.useState<GradeRow[]>(initial.grades);
  const [faqs, setFaqs] = React.useState<FaqRow[]>(initial.faqs);

  // --- Row operations ---
  function addGrade() {
    setGrades((g) => [...g, makeEmptyGrade()]);
  }
  function removeGrade(id: string) {
    setGrades((g) => (g.length > 1 ? g.filter((r) => r.id !== id) : g));
  }
  function updateGrade(id: string, patch: Partial<GradeRow>) {
    setGrades((g) => g.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }
  function addFaq() {
    setFaqs((f) => [...f, makeEmptyFaq()]);
  }
  function removeFaq(id: string) {
    setFaqs((f) => (f.length > 1 ? f.filter((r) => r.id !== id) : f));
  }
  function updateFaq(id: string, patch: Partial<FaqRow>) {
    setFaqs((f) => f.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  // --- Submit ---
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setGlobalError(null);
    setFieldErrors({});

    const payload = {
      name,
      shortName,
      slug,
      city,
      type,
      logo,
      description,
      maxScale: parseFloat(maxScale),
      passingCGPA: passingCGPA ? parseFloat(passingCGPA) : undefined,
      sourceUrl: sourceUrl || undefined,
      lastVerified: lastVerified || undefined,
      seo: seoTitle || seoMeta ? { title: seoTitle || undefined, metaDescription: seoMeta || undefined } : undefined,
      status,
      scale: {
        maxPoints: parseFloat(maxScale),
        grades: grades
          .filter((g) => g.grade.trim() !== "")
          .map((g) => ({
            grade: g.grade.trim(),
            points: parseFloat(g.points) || 0,
            minPercent: g.minPercent ? parseFloat(g.minPercent) : undefined,
            maxPercent: g.maxPercent ? parseFloat(g.maxPercent) : undefined,
          })),
      },
      faqs: faqs
        .filter((f) => f.q.trim() !== "" || f.a.trim() !== "")
        .map((f) => ({ q: f.q.trim(), a: f.a.trim() })),
    };

    const result: ActionResult =
      mode === "create"
        ? await createUniversityAction(payload)
        : await updateUniversityAction(initialData!.slug, payload);

    setSaving(false);

    if (result.ok) {
      router.push(`/admin/universities/${result.slug}`);
      router.refresh();
    } else {
      setGlobalError(result.error);
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {globalError && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {globalError}
        </div>
      )}

      {/* ---------- Basic info ---------- */}
      <FormSection title="Basic information" description="The university's identity and location.">
        <Field label="University name" error={fieldErrors.name} required>
          <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="National University of Sciences & Technology" />
        </Field>
        <Field label="Short name" error={fieldErrors.shortName} required>
          <Input value={shortName} onChange={(e) => setShortName(e.target.value)} required placeholder="NUST" maxLength={30} />
        </Field>
        <Field label="Slug" error={fieldErrors.slug} required hint={mode === "edit" ? "Slug is locked after creation." : "Lowercase, hyphenated, URL-safe."}>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            placeholder="nust"
            disabled={mode === "edit"}
            pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$"
          />
        </Field>
        <Field label="City" error={fieldErrors.city} required>
          <Input value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Islamabad" />
        </Field>
        <Field label="Type" required>
          <Select value={type} onValueChange={(v) => setType(v as "public" | "private")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="private">Private</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Logo path" error={fieldErrors.logo} required>
          <Input value={logo} onChange={(e) => setLogo(e.target.value)} required placeholder="/logos/nust.svg" />
        </Field>
        <Field label="Description" error={fieldErrors.description} required className="md:col-span-2" hint="Min 50 characters.">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4} placeholder="A brief description of the university..." />
        </Field>
        <Field label="Status" required>
          <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FormSection>

      {/* ---------- Grading scale ---------- */}
      <FormSection title="Grading scale" description="The grade-to-point mapping. Points must be between 0 and the maximum scale.">
        <div className="md:col-span-2 flex flex-col gap-3">
          <div className="grid grid-cols-[1fr_100px_90px_90px_40px] gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <span>Grade</span>
            <span>Points</span>
            <span>Min %</span>
            <span>Max %</span>
            <span className="sr-only">Remove</span>
          </div>
          {grades.map((g, i) => (
            <div key={g.id} className="grid grid-cols-[1fr_100px_90px_90px_40px] gap-2">
              <Input
                value={g.grade}
                onChange={(e) => updateGrade(g.id, { grade: e.target.value })}
                placeholder="A"
                aria-label={`Grade ${i + 1} label`}
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                value={g.points}
                onChange={(e) => updateGrade(g.id, { points: e.target.value })}
                placeholder="4.0"
                aria-label={`Grade ${i + 1} points`}
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={g.minPercent}
                onChange={(e) => updateGrade(g.id, { minPercent: e.target.value })}
                placeholder="85"
                aria-label={`Grade ${i + 1} min percent`}
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={g.maxPercent}
                onChange={(e) => updateGrade(g.id, { maxPercent: e.target.value })}
                placeholder="100"
                aria-label={`Grade ${i + 1} max percent`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeGrade(g.id)}
                disabled={grades.length <= 1}
                aria-label={`Remove grade ${i + 1}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addGrade} className="w-fit">
            <Plus className="h-4 w-4 mr-1" /> Add grade
          </Button>
          {fieldErrors.scale && (
            <p className="text-sm text-destructive">{fieldErrors.scale}</p>
          )}
          {fieldErrors["scale.grades"] && (
            <p className="text-sm text-destructive">{fieldErrors["scale.grades"]}</p>
          )}
        </div>
      </FormSection>

      {/* ---------- Academic settings ---------- */}
      <FormSection title="Academic settings" description="Maximum GPA and passing threshold.">
        <Field label="Maximum scale (max GPA)" error={fieldErrors.maxScale} required>
          <Input type="number" step="0.1" min="0.1" value={maxScale} onChange={(e) => setMaxScale(e.target.value)} required />
        </Field>
        <Field label="Passing CGPA" error={fieldErrors.passingCGPA} hint="Required for published records on 4.0+ scales.">
          <Input type="number" step="0.01" min="0" value={passingCGPA} onChange={(e) => setPassingCGPA(e.target.value)} placeholder="2.0" />
        </Field>
      </FormSection>

      {/* ---------- FAQs ---------- */}
      <FormSection title="FAQs" description="At least 3 FAQs are required before publishing.">
        <div className="md:col-span-2 flex flex-col gap-4">
          {faqs.map((f, i) => (
            <div key={f.id} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">FAQ {i + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFaq(f.id)}
                  disabled={faqs.length <= 1}
                  aria-label={`Remove FAQ ${i + 1}`}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <Input
                value={f.q}
                onChange={(e) => updateFaq(f.id, { q: e.target.value })}
                placeholder="What grading system does this university use?"
                className="mb-2"
                aria-label={`FAQ ${i + 1} question`}
              />
              <Textarea
                value={f.a}
                onChange={(e) => updateFaq(f.id, { a: e.target.value })}
                placeholder="The answer..."
                rows={2}
                aria-label={`FAQ ${i + 1} answer`}
              />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addFaq} className="w-fit">
            <Plus className="h-4 w-4 mr-1" /> Add FAQ
          </Button>
          {fieldErrors.faqs && (
            <p className="text-sm text-destructive">{fieldErrors.faqs}</p>
          )}
        </div>
      </FormSection>

      {/* ---------- Verification ---------- */}
      <FormSection title="Source & verification" description="Required before publishing. Link the official source for the grading scale.">
        <Field label="Source URL" error={fieldErrors.sourceUrl} hint="Must be an http/https URL.">
          <Input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://university.edu.pk/grading" />
        </Field>
        <Field label="Last verified date" error={fieldErrors.lastVerified} hint="YYYY-MM-DD format.">
          <Input type="date" value={lastVerified} onChange={(e) => setLastVerified(e.target.value)} />
        </Field>
      </FormSection>

      {/* ---------- SEO ---------- */}
      <FormSection title="SEO (optional)" description="Overrides for the public university page. Leave blank for auto-generated metadata.">
        <Field label="SEO title" error={fieldErrors["seo.title"]} hint="10–70 characters.">
          <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} maxLength={70} placeholder="NUST GPA Calculator — GPAHub" />
        </Field>
        <Field label="Meta description" error={fieldErrors["seo.metaDescription"]} hint="50–170 characters." className="md:col-span-2">
          <Textarea value={seoMeta} onChange={(e) => setSeoMeta(e.target.value)} rows={2} maxLength={170} placeholder="Calculate your NUST GPA with the official grading scale..." />
        </Field>
      </FormSection>

      {/* ---------- Actions ---------- */}
      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {mode === "create" ? "Create university" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Field({
  label,
  error,
  hint,
  required,
  className,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
