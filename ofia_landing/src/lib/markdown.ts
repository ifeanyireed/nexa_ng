/**
 * Markdown & Math Processing Engine for Ofia Landing
 * Converts Markdown (GFM) and LaTeX expressions into enriched semantic HTML.
 */

// @ts-ignore - pure ESM module
import { marked } from './marked.js';
import { renderLatexInHtml } from './math-renderer';

// Configure marked defaults for GFM
marked.setOptions({
  gfm: true,
  breaks: true,
});

/**
 * Checks if a string contains Markdown formatting.
 */
export function hasMarkdownIndicators(text: string): boolean {
  if (!text) return false;

  // Common markdown patterns
  const patterns = [
    /^#{1,6}\s+/m,             // # Heading
    /^\s*[-*+]\s+/m,           // - List item
    /^\s*\d+\.\s+/m,           // 1. List item
    /^\s*>\s+/m,               // > Blockquote
    /```[\s\S]*?```/,          // ``` Code fence
    /`[^`\n]+`/,               // `inline code`
    /\[[^\]]+\]\([^)]+\)/,     // [Link](url)
    /!\[[^\]]*\]\([^)]+\)/,    // ![Image](url)
    /\*\*[^*]+\*\*/,           // **Bold**
    /~~[^~]+~~/,               // ~~Strikethrough~~
    /\|[^\n]+\|\r?\n\|[-:\s|]+\|/, // | Table |
  ];

  return patterns.some((regex) => regex.test(text));
}

/**
 * Checks if a string is already primarily wrapped in HTML tags.
 */
export function isHtmlContent(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  return (
    trimmed.startsWith('<p>') ||
    trimmed.startsWith('<div>') ||
    trimmed.startsWith('<article>') ||
    trimmed.startsWith('<h1') ||
    trimmed.startsWith('<h2') ||
    trimmed.startsWith('<section>') ||
    trimmed.startsWith('<ul') ||
    trimmed.startsWith('<ol') ||
    trimmed.startsWith('<table') ||
    trimmed.startsWith('<blockquote')
  );
}

/**
 * Transforms raw blog post content (Markdown, HTML, or mixed) and embedded LaTeX
 * into clean, formatted HTML.
 */
export function renderMarkdownAndMath(rawContent: string): string {
  if (!rawContent) return '';

  let html = rawContent;

  // If the content is markdown or mixed without root HTML wrappers, parse with marked
  const isHtml = isHtmlContent(rawContent);
  const hasMarkdown = hasMarkdownIndicators(rawContent);

  if (!isHtml || hasMarkdown) {
    try {
      const parsed = marked.parse(rawContent);
      if (typeof parsed === 'string' && parsed.trim().length > 0) {
        html = parsed;
      }
    } catch (err) {
      console.warn('[Markdown] Parsing note:', err);
      html = rawContent;
    }
  }

  // Always process LaTeX Math formulas in the resulting HTML
  return renderLatexInHtml(html);
}

export { renderLatexInHtml };
