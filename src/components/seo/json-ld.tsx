import * as React from "react";

/**
 * JSON-LD structured data injector.
 *
 * Renders a `<script type="application/ld+json">` tag with the
 * serialized object. The object is built by the pure helpers in
 * `src/lib/json-ld.ts` — this component does NOT accept raw HTML.
 *
 * `JSON.stringify` escapes special characters automatically, so there's
 * no XSS risk via this path.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | null }) {
  if (!data) return null;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
