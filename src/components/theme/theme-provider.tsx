"use client";

/**
 * Theme provider for GPAHub.
 *
 * Wraps `next-themes` with project defaults:
 *  - `attribute="class"` toggles the `.dark` class on <html>.
 *  - `defaultTheme="system"` respects OS preference on first visit.
 *  - `enableSystem` allows automatic light/dark switching.
 *  - `disableTransitionOnChange` avoids color-flashing animations
 *    when the user manually toggles the theme.
 *
 * Place once at the root layout, wrapping the entire app.
 */

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
