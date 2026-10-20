export function getValidatedTenantSlug(request: Request, body?: any): string {
  // 1. Strict Request Header 'x-tenant-slug'
  const headerSlug = request.headers.get("x-tenant-slug");
  if (headerSlug && headerSlug.trim()) {
    return headerSlug.trim().toLowerCase();
  }

  // 2. Request body tenantSlug
  if (body?.tenantSlug && typeof body.tenantSlug === "string" && body.tenantSlug.trim()) {
    return body.tenantSlug.trim().toLowerCase();
  }

  // 3. URL search params '?tenant=...' or '?tenant_slug=...'
  try {
    const url = new URL(request.url);
    const querySlug = url.searchParams.get("tenant") || url.searchParams.get("tenant_slug") || url.searchParams.get("slug");
    if (querySlug && querySlug.trim()) {
      return querySlug.trim().toLowerCase();
    }
  } catch {}

  // 4. Host or x-forwarded-host subdomain extraction (e.g. neweratransports.ofia.ng)
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  if (host && host.includes(".")) {
    const parts = host.split(":")[0].split(".");
    const sub = parts[0].toLowerCase().trim();
    if (sub && !["www", "admin", "app", "api", "localhost", "ofia", "vercel"].includes(sub)) {
      return sub;
    }
  }

  // 5. Default isolated tenant space
  return "default";
}
