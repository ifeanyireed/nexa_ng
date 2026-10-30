/**
 * Math & LaTeX Rendering Utility for Ofia Admin CMS
 * Dynamically loads KaTeX and transforms $$...$$ and $...$ expressions into rendered math.
 */

let katexPromise: Promise<any> | null = null;

/**
 * Loads KaTeX from CDN in browser environments.
 * Idempotent and SSR safe.
 */
export function loadKaTeX(): Promise<any> {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if ((window as any).katex) return Promise.resolve((window as any).katex);
  if (katexPromise) return katexPromise;

  katexPromise = new Promise((resolve) => {
    // 1. Inject KaTeX CSS
    if (!document.getElementById('katex-cdn-css')) {
      const link = document.createElement('link');
      link.id = 'katex-cdn-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    // 2. Inject KaTeX JS
    if (!document.getElementById('katex-cdn-js')) {
      const script = document.createElement('script');
      script.id = 'katex-cdn-js';
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        resolve((window as any).katex);
      };
      script.onerror = () => {
        // Fallback to cdnjs if jsdelivr fails
        const fallback = document.createElement('script');
        fallback.src = 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js';
        fallback.async = true;
        fallback.onload = () => resolve((window as any).katex);
        fallback.onerror = () => {
          console.warn('[MathRenderer] Could not load KaTeX from CDNs');
          resolve(null);
        };
        document.head.appendChild(fallback);
      };
      document.head.appendChild(script);
    } else {
      resolve((window as any).katex);
    }
  });

  return katexPromise;
}

/**
 * Decodes HTML entities like &lt; &gt; &amp; that rich text editors introduce into math formulas.
 */
function decodeMathEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>/gi, ' ');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Renders LaTeX formulas inside an HTML or Markdown output string.
 * Supports:
 * - Display Math: $$...$$ or \[...\]
 * - Inline Math: $...$ or \(...\)
 */
export function renderLatexInHtml(html: string): string {
  if (!html) return '';

  const katex = typeof window !== 'undefined' ? (window as any).katex : null;

  // 1. Process Block / Display Math: $$...$$ and \[...\]
  let result = html.replace(/\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]/g, (match, p1, p2) => {
    const rawFormula = decodeMathEntities(p1 || p2 || '').trim();
    if (!rawFormula) return match;

    if (katex) {
      try {
        const rendered = katex.renderToString(rawFormula, {
          displayMode: true,
          throwOnError: false,
        });
        return `<div class="katex-math-display my-4 p-3 bg-slate-50/60 border border-slate-200/80 rounded-xl text-center overflow-x-auto select-all shadow-2xs">${rendered}</div>`;
      } catch (err) {
        console.warn('[MathRenderer] KaTeX render error:', err);
      }
    }

    // Fallback if KaTeX is loading
    return `<div class="katex-math-display my-4 p-3 bg-slate-50/80 border border-slate-200 rounded-xl text-center font-mono text-sm text-blue-700 overflow-x-auto select-all">$$${escapeHtml(rawFormula)}$$</div>`;
  });

  // 2. Process Inline Math: $...$ and \(...\)
  // Ensure we don't accidentally match currency e.g. "$100" or "$50 to $70"
  result = result.replace(/(^|[^\\])\$([^\$\s](?:[^\$]*?[^\$\s])?)\$|\\\(([\s\S]+?)\\\)/g, (match, prefix, p1, p2) => {
    const rawFormula = decodeMathEntities(p1 || p2 || '').trim();
    if (!rawFormula) return match;

    // Check if it's plain currency like $100 or $5.99
    if (/^\d+(?:,\d+)*(?:\.\d+)?$/.test(rawFormula)) {
      return match;
    }

    const pre = prefix || '';

    if (katex) {
      try {
        const rendered = katex.renderToString(rawFormula, {
          displayMode: false,
          throwOnError: false,
        });
        return `${pre}<span class="katex-math-inline px-1">${rendered}</span>`;
      } catch (err) {
        console.warn('[MathRenderer] KaTeX inline render error:', err);
      }
    }

    return `${pre}<span class="katex-math-inline font-mono text-blue-700 bg-slate-100/80 px-1.5 py-0.5 rounded text-xs">$${escapeHtml(rawFormula)}$$</span>`;
  });

  return result;
}
