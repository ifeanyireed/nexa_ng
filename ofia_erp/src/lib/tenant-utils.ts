/**
 * Utility functions for tenant slugs, names, and identifiers.
 * This file contains no client-side React hooks or "use client" directives,
 * making it safe to import in Server Components, API route handlers, and Client Components.
 */

/**
 * Formats a slug dynamically (e.g. "acme-corp" -> "Acme Corp", "neweratransports" -> "Neweratransports")
 */
export function slugToTenantName(slug: string): string {
  if (!slug) return "";
  const clean = slug.toLowerCase().trim();
  return clean
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
