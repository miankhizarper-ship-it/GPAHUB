/**
 * Blog slug redirect data model.
 *
 * When an admin changes a blog post's slug, a redirect record is created
 * so that the old URL 301-redirects to the new URL instead of returning
 * a 404. This preserves SEO equity and prevents broken links.
 */

/** A slug redirect entry. */
export interface PostRedirect {
  /** MongoDB ObjectId (as a string when serialized over JSON). */
  readonly _id?: string;
  /** The old slug that should redirect. */
  readonly oldSlug: string;
  /** The new slug to redirect to. */
  readonly newSlug: string;
  /** Creation timestamp (ISO 8601, UTC). */
  readonly createdAt: string;
}

/** Input for creating a redirect. */
export type PostRedirectInput = Omit<PostRedirect, "_id" | "createdAt">;
