/**
 * Blog post data model for GPAHub.
 *
 * Represents a blog article stored in the `posts` MongoDB collection.
 * Server-side only — Client Components receive posts via Server
 * Component props, never by importing this module directly.
 */

/** Constrained publication status for blog posts. */
export type PostStatus = "draft" | "published" | "archived";

/** Optional SEO overrides for a blog post. */
export interface PostSeo {
  readonly title?: string;
  readonly metaDescription?: string;
}

/**
 * A complete blog post record.
 *
 * `content` is Markdown source — rendered to HTML on the server via
 * `react-markdown` with no raw HTML allowed (safe by default).
 */
export interface Post {
  /** MongoDB ObjectId (as a string when serialized over JSON). */
  readonly _id?: string;
  /** URL-safe slug. Uniquely identifies the post in URLs. */
  readonly slug: string;
  /** Post title (displayed as the <h1> on the article page). */
  readonly title: string;
  /** Short summary for listing pages + meta description fallback. */
  readonly excerpt: string;
  /** Markdown source content. */
  readonly content: string;
  /** Optional cover image path (absolute or relative). */
  readonly coverImage?: string;
  /** ISO 8601 date string when the post was published. Required for published posts. */
  readonly publishedAt?: string;
  /** Publication status. Public routes only expose "published". */
  readonly status: PostStatus;
  /** Optional SEO overrides. */
  readonly seo?: PostSeo;
  /** Creation timestamp (ISO 8601, UTC). */
  readonly createdAt: string;
  /** Last-update timestamp (ISO 8601, UTC). */
  readonly updatedAt: string;
}

/**
 * Input shape for create operations. Omits auto-managed fields.
 */
export type PostInput = Omit<Post, "_id" | "createdAt" | "updatedAt">;
