import { NextResponse } from "next/server";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";
import {
  saveTenantSenderProfile,
  getTenantSenderProfiles,
  deleteTenantSenderProfile,
} from "@/lib/email-service";

export const dynamic = "force-dynamic";

const ERP_BASE =
  process.env.ERP_SERVICE_URL ||
  process.env.NEXT_PUBLIC_ERP_SERVICE_URL ||
  "https://ofia-erp-service.onrender.com";

const LOCAL_ERP_BASE = "http://127.0.0.1:8084";

async function fetchFromErp(
  path: string,
  options: RequestInit,
  timeoutMs: number = 10000
): Promise<{ res: Response | null; ok: boolean; status: number }> {
  // If in local development, attempt local ERP first if reachable
  if (process.env.NODE_ENV === "development" && !ERP_BASE.includes("127.0.0.1") && !ERP_BASE.includes("localhost")) {
    try {
      const localRes = await fetch(`${LOCAL_ERP_BASE}${path}`, {
        ...options,
        signal: AbortSignal.timeout(1500),
      });
      if (localRes.ok || (localRes.status !== 404 && localRes.status !== 502)) {
        return { res: localRes, ok: localRes.ok, status: localRes.status };
      }
    } catch {
      // Local service not running, fallback to ERP_BASE
    }
  }

  try {
    const res = await fetch(`${ERP_BASE}${path}`, {
      ...options,
      signal: AbortSignal.timeout(timeoutMs),
    });
    return { res, ok: res.ok, status: res.status };
  } catch (err: any) {
    return { res: null, ok: false, status: 502 };
  }
}

export async function GET(request: Request) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    // 1. Try to fetch from ERP microservice sender-profiles endpoint
    const { res, ok } = await fetchFromErp(
      `/crm/sender-profiles?tenant=${encodeURIComponent(tenantSlug)}`,
      {
        cache: "no-store",
        headers: { "x-tenant-slug": tenantSlug },
      },
      15000
    );

    if (ok && res) {
      const data = await res.json().catch(() => null);
      if (data && data.success && Array.isArray(data.profiles) && data.profiles.length > 0) {
        return NextResponse.json(data);
      }
    }

    // 2. Fetch legacy smtp-settings as fallback
    let defaultSettings: any = null;
    try {
      const fallback = await fetchFromErp(
        `/crm/smtp-settings?tenant=${encodeURIComponent(tenantSlug)}`,
        {
          cache: "no-store",
          headers: { "x-tenant-slug": tenantSlug },
        },
        10000
      );
      if (fallback.res) {
        const fallbackData = await fallback.res.json().catch(() => null);
        defaultSettings = fallbackData?.settings || null;
      }
    } catch (e) {
      console.warn("Fallback smtp-settings lookup failed:", e);
    }

    // 3. Check in-memory / local sender profiles
    const memProfiles = await getTenantSenderProfiles(tenantSlug).catch(() => []);

    let profiles: any[] = [];
    if (memProfiles && memProfiles.length > 0) {
      profiles = memProfiles.map((p) => ({
        id: p.id,
        tenantSlug: p.tenantSlug,
        profileName: p.profileName,
        provider: p.provider,
        host: p.host,
        port: p.port,
        encryption: p.encryption,
        fromEmail: p.fromEmail,
        fromName: p.fromName,
        username: p.username,
        hasPassword: Boolean(p.hasPassword),
        password: p.password ? "••••••••" : "",
        isDefault: Boolean(p.isDefault),
        rateLimitedUntil: p.rateLimitedUntil || null,
        rateLimitReason: p.rateLimitReason || null,
        isRateLimited: Boolean(p.isRateLimited),
      }));
    } else if (defaultSettings?.host && defaultSettings?.fromEmail) {
      profiles = [
        {
          id: `prof_init_${tenantSlug.replace(/[^a-zA-Z0-9]/g, "_")}`,
          tenantSlug,
          profileName: `${(defaultSettings.provider || "Primary").toUpperCase()} Relay`,
          provider: defaultSettings.provider || "custom",
          host: defaultSettings.host,
          port: defaultSettings.port || 587,
          encryption: defaultSettings.encryption || "tls",
          fromEmail: defaultSettings.fromEmail,
          fromName: defaultSettings.fromName || "Workspace Admin",
          username: defaultSettings.username || defaultSettings.fromEmail,
          hasPassword: Boolean(defaultSettings.hasPassword),
          password: defaultSettings.password ? "••••••••" : "",
          isDefault: true,
        },
      ];
    }

    return NextResponse.json({
      success: true,
      profiles,
      defaultSmtp: defaultSettings
        ? {
            tenantSlug: defaultSettings.tenantSlug,
            provider: defaultSettings.provider,
            host: defaultSettings.host,
            port: defaultSettings.port,
            encryption: defaultSettings.encryption,
            fromEmail: defaultSettings.fromEmail,
            fromName: defaultSettings.fromName,
            username: defaultSettings.username,
            hasPassword: Boolean(defaultSettings.hasPassword),
            password: defaultSettings.password ? "••••••••" : "",
            rateLimitedUntil: defaultSettings.rateLimitedUntil || null,
            rateLimitReason: defaultSettings.rateLimitReason || null,
            isRateLimited: Boolean(defaultSettings.isRateLimited),
          }
        : null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP service connection error: " + err.message }, { status: 502 });
  }
}

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const body = JSON.parse(bodyText || "{}");
    const tenantSlug = getValidatedTenantSlug(request, body);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }

    if (!body.host?.trim() || !body.fromEmail?.trim()) {
      return NextResponse.json(
        { error: "SMTP Host and From Email are required." },
        { status: 400 }
      );
    }

    const id = body.id && body.id !== "new"
      ? body.id
      : `prof_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const payload = {
      id,
      tenantSlug,
      profileName: body.profileName?.trim() || `${(body.provider || "Custom").toUpperCase()} Profile (${body.fromEmail.trim()})`,
      provider: body.provider || "custom",
      host: body.host.trim(),
      port: Number(body.port) || 587,
      encryption: body.encryption || "tls",
      fromEmail: body.fromEmail.trim(),
      fromName: body.fromName?.trim() || "Workspace Admin",
      username: body.username?.trim() || body.fromEmail.trim(),
      password: body.password || "",
      isDefault: Boolean(body.isDefault),
    };

    // 1. Always persist to in-memory / local profile store
    try {
      await saveTenantSenderProfile(payload);
    } catch (saveErr) {
      console.warn("In-process sender profile cache save:", saveErr);
    }

    // 2. Try forward to microservice multi-profile endpoint
    const { res, ok, status } = await fetchFromErp(
      "/crm/sender-profiles",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-tenant-slug": tenantSlug,
        },
        body: JSON.stringify(payload),
      },
      15000
    );

    if (ok && res) {
      const data = await res.json().catch(() => null);
      return NextResponse.json(data || { success: true, profile: payload }, { status: 201 });
    }

    // 3. If multi-profile endpoint is not yet available (404) or unavailable, persist to /crm/smtp-settings
    if (status === 404 || status === 502 || !ok) {
      try {
        const smtpRes = await fetchFromErp(
          "/crm/smtp-settings",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-tenant-slug": tenantSlug,
            },
            body: JSON.stringify({
              tenantSlug,
              provider: payload.provider,
              host: payload.host,
              port: payload.port,
              encryption: payload.encryption,
              fromEmail: payload.fromEmail,
              fromName: payload.fromName,
              username: payload.username,
              password: payload.password,
            }),
          },
          10000
        );

        if (smtpRes.ok || smtpRes.res) {
          return NextResponse.json(
            {
              success: true,
              profile: {
                ...payload,
                password: payload.password ? "••••••••" : "",
                hasPassword: Boolean(payload.password),
              },
            },
            { status: 201 }
          );
        }
      } catch (smtpErr) {
        console.warn("Fallback save to smtp-settings failed:", smtpErr);
      }

      // If microservice is completely unreachable, still return success because in-memory store saved it
      return NextResponse.json(
        {
          success: true,
          profile: {
            ...payload,
            password: payload.password ? "••••••••" : "",
            hasPassword: Boolean(payload.password),
          },
          note: "Profile cached locally while ERP microservice syncs.",
        },
        { status: 201 }
      );
    }

    return NextResponse.json({ error: "Failed to save profile" }, { status: status || 500 });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP service connection error: " + err.message }, { status: 502 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const tenantSlug = getValidatedTenantSlug(request);
    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: "tenant parameter is required for multi-tenant isolation" },
        { status: 400 }
      );
    }
    let id = url.searchParams.get("id") || "";

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body.id || "";
    }

    if (!id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    // 1. Remove from in-memory / local profile store
    try {
      await deleteTenantSenderProfile(tenantSlug, id);
    } catch (delErr) {
      console.warn("In-process sender profile delete:", delErr);
    }

    // 2. Try forward to microservice multi-profile endpoint
    const { res, ok, status } = await fetchFromErp(
      `/crm/sender-profiles?tenant=${encodeURIComponent(tenantSlug)}&id=${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: { "x-tenant-slug": tenantSlug },
      },
      15000
    );

    if (ok || status === 404) {
      // 404 on backend means endpoint wasn't there or profile was deleted; treat as success
      return NextResponse.json({ success: true });
    }

    const data = res ? await res.json().catch(() => null) : null;
    return NextResponse.json(data || { success: true });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP service connection error: " + err.message }, { status: 502 });
  }
}
