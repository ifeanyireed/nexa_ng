import { Redis } from "@upstash/redis";

/**
 * OFIA Redis Client & Namespace Architecture for ERP Serverless Tier
 * Uses Upstash Redis SDK (Redis.fromEnv) with fail-open resilience,
 * multi-tenant isolation, and explicit TTLs.
 */

const env = (process.env.NODE_ENV || process.env.ENV || "development").toLowerCase();

let redisClient: Redis | null = null;

export function getRedisClient(): Redis | null {
  if (redisClient) return redisClient;

  // 1. Standard Upstash SDK initialization from environment
  try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      redisClient = Redis.fromEnv();
      return redisClient;
    }
  } catch (err) {
    // Fall back to manual check below
  }

  // 2. Vercel KV environment variables fallback (KV_REST_API_URL / KV_REST_API_TOKEN)
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (url && token) {
    try {
      redisClient = new Redis({
        url,
        token,
        retry: {
          retries: 1,
          backoff: (retryCount) => Math.exp(retryCount) * 50,
        },
      });
      return redisClient;
    } catch (err) {
      console.warn("⚠️ [Redis][ERP] Initialization failed:", err);
      return null;
    }
  }

  return null;
}

/**
 * Constructs a strict tenant-scoped cache key:
 * ofia:{env}:{service}:{tenant_id}:{resource}:{identifier}
 */
export function buildTenantKey(
  service: string,
  tenantSlug: string,
  resource: string,
  identifier?: string
): string {
  const cleanTenant = (tenantSlug || "global").toLowerCase().trim();
  const cleanService = (service || "erp").toLowerCase().trim();
  const cleanResource = (resource || "default").toLowerCase().trim();
  const cleanID = identifier ? identifier.trim() : "";

  if (cleanID) {
    return `ofia:${env}:${cleanService}:${cleanTenant}:${cleanResource}:${cleanID}`;
  }
  return `ofia:${env}:${cleanService}:${cleanTenant}:${cleanResource}`;
}

/**
 * Constructs a platform-global cache key:
 * ofia:{env}:{service}:global:{resource}:{identifier}
 */
export function buildGlobalKey(service: string, resource: string, identifier?: string): string {
  return buildTenantKey(service, "global", resource, identifier);
}

/**
 * Fail-open Redis Get helper. Returns null on cache miss or Redis error.
 */
export async function redisGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    const data = await client.get<T>(key);
    return data ?? null;
  } catch (err) {
    console.warn(`⚠️ [Redis][ERP] Get error for key '${key}':`, err);
    return null;
  }
}

/**
 * Fail-open Redis Set helper with explicit TTL in seconds.
 */
export async function redisSet(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.set(key, value, { ex: ttlSeconds });
  } catch (err) {
    console.warn(`⚠️ [Redis][ERP] Set error for key '${key}':`, err);
  }
}

/**
 * Fail-open Redis Del helper.
 */
export async function redisDel(key: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    await client.del(key);
  } catch (err) {
    console.warn(`⚠️ [Redis][ERP] Del error for key '${key}':`, err);
  }
}

export function isRedisConfigured(): boolean {
  return getRedisClient() !== null;
}
