import crypto from "crypto";

export interface UnsubscribePayload {
  tenantSlug: string;
  email: string;
  subscriberId?: string;
  listId?: string;
  createdAt: number;
}

const UNSUBSCRIBE_SECRET =
  process.env.CRM_UNSUBSCRIBE_SECRET ||
  process.env.JWT_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "ofia-crm-unsubscribe-secret-salt-2026";

/**
 * Creates a cryptographically signed URL-safe token containing
 * subscriber email, tenantSlug, and optional subscriberId/listId.
 */
export function createUnsubscribeToken(params: {
  tenantSlug: string;
  email: string;
  subscriberId?: string;
  listId?: string;
}): string {
  const data: UnsubscribePayload = {
    tenantSlug: (params.tenantSlug || "default").trim().toLowerCase(),
    email: params.email.trim().toLowerCase(),
    subscriberId: params.subscriberId || undefined,
    listId: params.listId || undefined,
    createdAt: Date.now(),
  };

  const jsonStr = JSON.stringify(data);
  const encodedPayload = Buffer.from(jsonStr).toString("base64url");
  const signature = crypto
    .createHmac("sha256", UNSUBSCRIBE_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies the signature of an unsubscribe token and returns the payload if valid.
 */
export function verifyUnsubscribeToken(token: string): UnsubscribePayload | null {
  try {
    if (!token || typeof token !== "string" || !token.includes(".")) {
      return null;
    }

    const [encodedPayload, signature] = token.split(".");
    if (!encodedPayload || !signature) {
      return null;
    }

    const expectedSignature = crypto
      .createHmac("sha256", UNSUBSCRIBE_SECRET)
      .update(encodedPayload)
      .digest("base64url");

    const expectedBuf = Buffer.from(expectedSignature);
    const actualBuf = Buffer.from(signature);

    if (expectedBuf.length !== actualBuf.length || !crypto.timingSafeEqual(expectedBuf, actualBuf)) {
      return null;
    }

    const jsonStr = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const payload = JSON.parse(jsonStr) as UnsubscribePayload;

    if (!payload || !payload.email || typeof payload.email !== "string") {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Resolves the public base domain for a tenant or app.
 */
export function resolvePublicBaseUrl(tenantSlug?: string, explicitBaseUrl?: string): string {
  if (explicitBaseUrl && explicitBaseUrl.startsWith("http")) {
    return explicitBaseUrl.replace(/\/+$/, "");
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (appUrl && appUrl.startsWith("http")) {
    return appUrl.replace(/\/+$/, "");
  }

  const clean = (tenantSlug || "").trim().toLowerCase();
  if (clean && clean !== "default") {
    return `https://${clean}.ofia.ng`;
  }

  return "https://app.ofia.ng";
}

/**
 * Builds the user-facing landing page URL for unsubscribing.
 * e.g. https://domain.ofia.ng/crm/unsubscribe?token=...
 */
export function buildUnsubscribeUrl(params: {
  tenantSlug: string;
  email: string;
  subscriberId?: string;
  listId?: string;
  baseUrl?: string;
}): string {
  const token = createUnsubscribeToken(params);
  const base = resolvePublicBaseUrl(params.tenantSlug, params.baseUrl);
  return `${base}/crm/unsubscribe?token=${token}`;
}

/**
 * Builds the RFC 8058 one-click unsubscribe API POST URL.
 * e.g. https://domain.ofia.ng/api/erp/crm/unsubscribe?token=...
 */
export function buildOneClickUnsubscribeApiUrl(params: {
  tenantSlug: string;
  email: string;
  subscriberId?: string;
  listId?: string;
  baseUrl?: string;
}): string {
  const token = createUnsubscribeToken(params);
  const base = resolvePublicBaseUrl(params.tenantSlug, params.baseUrl);
  return `${base}/api/erp/crm/unsubscribe?token=${token}`;
}
