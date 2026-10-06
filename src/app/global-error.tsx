"use client";

import * as React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Global error boundary — catches errors that the root layout's
 * error.tsx cannot (e.g. errors in the root layout itself).
 *
 * Renders a minimal HTML shell with a calm, user-facing message.
 * No stack traces, no MongoDB errors, no implementation details.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#5f7470",
          color: "#e0e2db",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: "1rem",
        }}
      >
        <div style={{ maxWidth: "400px", textAlign: "center" }}>
          <AlertTriangle
            size={48}
            style={{ margin: "0 auto 1rem", opacity: 0.8 }}
            aria-hidden="true"
          />
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "0.875rem", opacity: 0.8, marginBottom: "1.5rem" }}>
            An unexpected error occurred. Please try again — if the problem persists,
            it may be temporary.
          </p>
          <button
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              border: "1px solid rgba(224,226,219,0.3)",
              background: "transparent",
              color: "#e0e2db",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
