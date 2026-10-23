import { getActiveTenantSlug } from "@/lib/erp-store";

export async function crmFetch(input: string, init?: RequestInit): Promise<Response> {
  const activeSlug = typeof window !== "undefined" ? getActiveTenantSlug() : "";
  const sep = input.includes("?") ? "&" : "?";
  const urlWithTenant = activeSlug
    ? (input.includes("tenant=") ? input : `${input}${sep}tenant=${encodeURIComponent(activeSlug)}`)
    : input;

  const headers = new Headers(init?.headers);
  if (activeSlug && !headers.has("x-tenant-slug")) {
    headers.set("x-tenant-slug", activeSlug);
  }
  if (!headers.has("Content-Type") && init?.method && init.method !== "GET") {
    headers.set("Content-Type", "application/json");
  }

  return fetch(urlWithTenant, {
    ...init,
    headers,
  });
}
