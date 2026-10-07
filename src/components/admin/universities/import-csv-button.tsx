"use client";

import * as React from "react";
import { Upload, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { importUniversitiesCsvAction } from "@/app/admin/actions/import";

/**
 * CSV import button — Client Component.
 */
export function ImportCsvButton() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const text = await file.text();
      const res = await importUniversitiesCsvAction(text);
      if (res.ok) {
        setResult({ imported: res.imported, skipped: res.skipped, errors: res.errors });
      } else {
        setError(res.error);
      }
    } catch {
      setError("Failed to import. Please try again.");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          className="hidden"
          id="csv-import"
        />
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => fileRef.current?.click()}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Import CSV
        </Button>
      </div>

      {error && (
        <p className="flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}

      {result && (
        <div className="rounded-md border border-border bg-card p-3 text-sm">
          <p className="flex items-center gap-1.5 font-medium text-foreground">
            <CheckCircle2 className="h-4 w-4 text-success" />
            Import complete: {result.imported} imported, {result.skipped} skipped
          </p>
          {result.errors.length > 0 && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted-foreground">
                {result.errors.length} error(s) — click to view
              </summary>
              <ul className="mt-2 max-h-40 overflow-y-auto space-y-1 pl-4 text-xs text-destructive">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <details>
          <summary className="cursor-pointer">CSV format guide</summary>
          <div className="mt-2 rounded-md bg-surface/50 p-3">
            <p className="mb-2">Required columns (header row):</p>
            <code className="block text-xs leading-relaxed">
              slug,name,shortName,city,type,logo,description,maxScale,passingCGPA,sourceUrl,lastVerified,status,grades,faqs,seoTitle,seoMetaDescription
            </code>
            <p className="mt-2 mb-1"><strong>grades</strong>: JSON array</p>
            <code className="block text-xs">
              {[`{"grade":"A","points":4.0,"minPercent":85,"maxPercent":100}`, `{"grade":"B","points":3.0,"minPercent":70,"maxPercent":84.99}`].join(",")}
            </code>
            <p className="mt-2 mb-1"><strong>faqs</strong>: JSON array</p>
            <code className="block text-xs">
              {`{"q":"What is the grading scale?","a":"4.0 scale."}`}
            </code>
            <p className="mt-2"><strong>type</strong>: "public" or "private"</p>
            <p><strong>status</strong>: "draft", "published", or "archived"</p>
          </div>
        </details>
      </div>
    </div>
  );
}
