import type { Metadata } from "next";
import { PageShell } from "@/components/layout/page-shell";
import { CgpaPercentageConverter } from "@/components/calculator/cgpa-percentage-converter";
import { JsonLd } from "@/components/seo/json-ld";
import { createMetadata, getCanonicalUrl } from "@/lib/seo";
import { buildWebApplicationJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = createMetadata({
  title: "CGPA to Percentage Converter — Free Two-Way Tool",
  description:
    "Convert your CGPA to a percentage and back. Two-way conversion with configurable maximum GPA (4.0 or 5.0). Runs entirely in your browser.",
  path: "/cgpa-to-percentage",
});

export const revalidate = 3600;

export default function CgpaToPercentagePage() {
  return (
    <PageShell
      title="CGPA ↔ Percentage Converter"
      description="Convert between CGPA and percentage in either direction. Choose your maximum GPA scale (4.0 or 5.0). The converter uses the standard linear formula — university-specific policies may differ."
    >
      <JsonLd
        data={buildWebApplicationJsonLd({
          name: "GPAHub CGPA to Percentage Converter",
          url: getCanonicalUrl("/cgpa-to-percentage"),
          description:
            "Free two-way CGPA to percentage converter. Supports 4.0 and 5.0 GPA scales. Runs entirely in your browser.",
        })}
      />
      <CgpaPercentageConverter />
    </PageShell>
  );
}
