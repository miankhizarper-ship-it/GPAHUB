"use client";

import * as React from "react";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportMessagesCsvAction } from "@/app/admin/actions/export";

/**
 * Export CSV button — Client Component.
 *
 * Calls the server action to generate the CSV, then triggers a
 * browser download via a Blob URL.
 */
export function ExportCsvButton() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleExport() {
    setLoading(true);
    setError(null);
    try {
      const result = await exportMessagesCsvAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      // Trigger download via Blob.
      const blob = new Blob([result.csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to export. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-sm text-destructive">{error}</span>}
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export CSV
      </Button>
    </div>
  );
}
