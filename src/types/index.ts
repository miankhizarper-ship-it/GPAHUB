/**
 * Shared application types for GPAHub.
 *
 * Phase 0 establishes only the minimal types required by the foundation.
 * Domain-specific types (grading scales, calculator inputs, university
 * records) will be introduced in their respective phases alongside the
 * domain and repository layers.
 */

/** Semantic theme names supported by the application. */
export type ThemeName = "light" | "dark" | "system";

/** Resolved theme (after system preference is applied). */
export type ResolvedTheme = "light" | "dark";

/** Standard branded route descriptor used by header/footer navigation. */
export interface NavItem {
  readonly label: string;
  readonly href: string;
  /** Marks routes that are not yet implemented (Phase 0 status indicator). */
  readonly available?: boolean;
}
