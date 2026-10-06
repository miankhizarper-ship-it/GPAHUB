/**
 * Reading time estimation utility.
 *
 * Estimates reading time from Markdown content by counting words
 * (excluding Markdown syntax). Uses an average reading speed of
 * 200 words per minute — a common standard for adult non-fiction.
 *
 * Pure function — safe to use in both Server and Client Components.
 */

/** Average reading speed in words per minute. */
const WORDS_PER_MINUTE = 200;

/**
 * Strip Markdown syntax to count readable words.
 *
 * Removes headings markers, code blocks, links, images, blockquotes,
 * list markers, emphasis, and other Markdown syntax so the word count
 * reflects what a reader actually reads.
 */
function stripMarkdown(content: string): string {
  return content
    // Code blocks (```...```)
    .replace(/```[\s\S]*?```/g, " ")
    // Inline code (`...`)
    .replace(/`[^`]+`/g, " ")
    // Images (![alt](url))
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    // Links ([text](url))
    .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
    // Headings (#, ##, ###, etc.)
    .replace(/^#{1,6}\s+/gm, "")
    // Bold/italic markers (*, **, _, __)
    .replace(/[*_]{1,3}/g, "")
    // Blockquote markers (>)
    .replace(/^>\s+/gm, "")
    // List markers (-, *, 1.)
    .replace(/^[\s]*[-*+]\s+/gm, "")
    .replace(/^[\s]*\d+\.\s+/gm, "")
    // Horizontal rules (---, ***)
    .replace(/^[-*_]{3,}$/gm, " ")
    // HTML tags
    .replace(/<[^>]+>/g, " ")
    // Multiple spaces
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Estimate reading time in minutes from Markdown content.
 *
 * @returns An integer number of minutes (minimum 1).
 */
export function estimateReadingTime(content: string): number {
  const plainText = stripMarkdown(content);
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE);
  return Math.max(1, minutes);
}

/**
 * Format reading time as a human-readable string.
 *
 * @example "5 min read"
 */
export function formatReadingTime(content: string): string {
  const minutes = estimateReadingTime(content);
  return `${minutes} min read`;
}
