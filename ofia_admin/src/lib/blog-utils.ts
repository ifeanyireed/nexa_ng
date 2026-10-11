/**
 * Blog utilities for URL generation, slug formatting, and clipboard sharing.
 */

export function slugify(text: string): string {
  if (!text) return `post-${Date.now()}`;
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `post-${Date.now()}`
  );
}

/**
 * Returns the public blog post URL on the Ofia platform.
 * Supports production (https://ofia.ng/blog/<slug>) and local development (http://localhost:3000/blog/<slug>).
 */
export function getPublicBlogUrl(slugOrId: string): string {
  const cleanSlug = (slugOrId || '').trim();
  if (typeof window !== 'undefined') {
    const host = window.location.host;
    const isLocal =
      host.includes('localhost') ||
      host.includes('127.0.0.1') ||
      window.location.hostname.includes('admin.localhost');
    if (isLocal) {
      return `http://localhost:3000/blog/${cleanSlug}`;
    }
  }

  const base =
    process.env.NEXT_PUBLIC_LANDING_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    'https://ofia.ng';

  return `${base.replace(/\/+$/, '')}/blog/${cleanSlug}`;
}

/**
 * Copies the blog URL to the clipboard with fallbacks.
 */
export async function copyBlogUrlToClipboard(
  slugOrId: string
): Promise<{ success: boolean; url: string }> {
  const url = getPublicBlogUrl(slugOrId);
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return { success: true, url };
    }

    if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return { success: Boolean(successful), url };
    }
  } catch (err) {
    console.warn('Failed to copy blog URL to clipboard:', err);
  }
  return { success: false, url };
}
