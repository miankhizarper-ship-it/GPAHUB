import * as React from "react";
import ReactMarkdown from "react-markdown";

/**
 * Markdown content renderer for blog posts.
 *
 * Uses `react-markdown` with NO raw HTML support (`rehypeRaw` is not
 * installed). This means any HTML tags in the Markdown source are
 * rendered as literal text, not as DOM elements — safe by default.
 *
 * The project specification explicitly warns that blog excerpts must
 * not show HTML tags as literal text. For excerpts (which are plain
 * text by contract), we render them directly without Markdown parsing.
 * For full article content, we use this component which safely renders
 * Markdown to semantic HTML elements.
 *
 * ## Styling
 *
 * Tailwind classes are applied to the rendered elements via a
 * `components` map so the Markdown output matches the GPAHub design
 * system without relying on `@tailwindcss/typography`.
 */
export function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="mt-8 mb-4 text-2xl font-bold text-foreground first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-8 mb-3 text-xl font-bold text-foreground">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 mb-2 text-lg font-semibold text-foreground">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-foreground">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 ml-6 list-disc space-y-1 text-foreground">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 ml-6 list-decimal space-y-1 text-foreground">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          a: ({ children, href }) => (
            <a
              href={href}
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer nofollow" : undefined}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-4 border-l-4 border-primary/30 bg-surface/40 py-2 pl-4 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className="block overflow-x-auto rounded-lg border border-border bg-surface/50 p-4 text-sm">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-surface px-1.5 py-0.5 text-sm font-mono">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="mb-4">{children}</pre>,
          hr: () => <hr className="my-8 border-border" />,
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
