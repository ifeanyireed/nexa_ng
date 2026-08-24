// Centralized typed API client for communicating with all 5 Go microservices:
// - service_users (:8081)
// - service_ai (:8082)
// - service_marketplace (:8083)
// - service_erp (:8084)
// - service_logistics (:8085)

const USER_BASE = process.env.NEXT_PUBLIC_USER_API_URL || "http://localhost:8081/api/v1";
const GTM_BASE = process.env.NEXT_PUBLIC_GTM_API_URL || "http://localhost:8082/api/v1/gtm";
const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8081/api/v1/auth";
const MARKETPLACE_BASE = process.env.NEXT_PUBLIC_MARKETPLACE_API_URL || "http://localhost:8083/api/v1";
const ERP_BASE = process.env.NEXT_PUBLIC_ERP_API_URL || "http://localhost:8084/api/v1";
const LOGISTICS_BASE = process.env.NEXT_PUBLIC_LOGISTICS_API_URL || "http://localhost:8085/api/v1/logistics";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("nexa_auth_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown server error");
    throw new Error(`API Error [${res.status}]: ${errorText}`);
  }

  return res.json();
}

// 1. AUTH & IDENTITY SERVICE (:8081)
export const AUTH_API = {
  login: async (credentials: { email: string; password: string }) => {
    return fetchJSON<{ token: string; user: any; org_id: string; organization?: any }>(
      `${AUTH_BASE}/login`,
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );
  },

  register: async (data: { email: string; password: string; name: string; business_name?: string; role?: string }) => {
    return fetchJSON<{ token: string; user: any; org_id: string; organization?: any }>(
      `${AUTH_BASE}/register`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  },

  getMe: async () => {
    return fetchJSON<{ user: any; org_id: string; role: string; organization: any }>(`${AUTH_BASE}/me`);
  },
};

// 2. USER, ORG & SUBSCRIPTION SERVICE (:8081)
export const USER_API = {
  getOrganizations: async () => {
    return fetchJSON<any[]>(`${USER_BASE}/organizations`);
  },

  getOrganization: async (orgId: string) => {
    return fetchJSON<any>(`${USER_BASE}/organizations/${orgId}`);
  },

  getOrgSubscription: async (orgId = "org-01") => {
    return fetchJSON<any>(`${USER_BASE}/organizations/${orgId}/subscription`);
  },

  getPlanCatalog: async () => {
    return fetchJSON<any>(`${USER_BASE}/plans`);
  },

  updateBYOKKeys: async (orgId: string, data: any) => {
    return fetchJSON<any>(`${USER_BASE}/organizations/${orgId}/byok`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  getTenantRBAC: async (orgId = "default") => {
    return fetchJSON<{ tenant_id: string; matrix: any }>(`${USER_BASE}/organizations/${orgId}/rbac`);
  },

  saveTenantRBAC: async (orgId = "default", matrix: any) => {
    return fetchJSON<{ success: boolean; message: string; tenant_id: string; matrix: any }>(
      `${USER_BASE}/organizations/${orgId}/rbac`,
      {
        method: "PUT",
        body: JSON.stringify({ matrix }),
      }
    );
  },

  checkSubdomainAvailability: async (slug: string) => {
    return fetchJSON<{
      slug: string;
      is_available: boolean;
      category: string;
      message: string;
      workspace_domain: string;
      storefront_domain: string;
      custom_shop_domain: string;
      suggestions: string[];
    }>(`${USER_BASE}/subdomains/check?slug=${encodeURIComponent(slug)}`);
  },
};

// 3. AUTONOMOUS AI GTM SWARM SERVICE (:8082)
export const GTM_API = {
  getAgents: async (orgId = "org-01") => {
    return fetchJSON<any[]>(`${GTM_BASE}/${orgId}/agents`);
  },

  getAgent: async (orgId = "org-01", agentKey: string) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/agents/${agentKey}`);
  },

  chatWithAgent: async (orgId = "org-01", agentKey: string, message: string) => {
    return fetchJSON<{ sender: string; text: string; model_used: string; latency_ms: number }>(
      `${GTM_BASE}/${orgId}/agents/${agentKey}/chat`,
      {
        method: "POST",
        body: JSON.stringify({ message }),
      }
    );
  },

  getStrategy: async (orgId = "org-01") => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/strategy`);
  },

  getCampaigns: async (orgId = "org-01") => {
    return fetchJSON<any[]>(`${GTM_BASE}/${orgId}/campaigns`);
  },

  createCampaign: async (orgId = "org-01", data: { name: string; target_audience: string; channels: string[]; initial_goal?: string }) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/campaigns`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getLeads: async (orgId = "org-01") => {
    return fetchJSON<any[]>(`${GTM_BASE}/${orgId}/leads`);
  },

  getApprovals: async (orgId = "org-01") => {
    return fetchJSON<any[]>(`${GTM_BASE}/${orgId}/approvals`);
  },

  authorizeApproval: async (orgId = "org-01", id: string) => {
    return fetchJSON<{ status: string; id: string }>(`${GTM_BASE}/${orgId}/approvals/${id}/authorize`, {
      method: "POST",
    });
  },

  rejectApproval: async (orgId = "org-01", id: string) => {
    return fetchJSON<{ status: string; id: string }>(`${GTM_BASE}/${orgId}/approvals/${id}/reject`, {
      method: "POST",
    });
  },

  // Admin global overview & telemetry
  getAdminOverview: async () => {
    return fetchJSON<{
      total_mrr: number;
      total_tenants: number;
      active_tenants_count: number;
      total_users_count: number;
      total_ai_spend_ngn: number;
      agent_error_rate_pct: number;
      avg_latency_ms: number;
      active_campaigns_count: number;
      total_attributed_pipeline: number;
      tripped_breakers_count: number;
      tenants: any[];
      agent_health_summary: any[];
      audit_logs: any[];
    }>(`${GTM_BASE}/admin/overview`);
  },

  getAdminOrganizations: async () => {
    return fetchJSON<any[]>(`${GTM_BASE}/admin/organizations`);
  },

  createAdminOrganization: async (data: { name: string; plan_tier: string; billing_cycle?: string }) => {
    return fetchJSON<any>(`${GTM_BASE}/admin/organizations`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateAdminOrganization: async (id: string, data: { name?: string; plan_tier?: string; status?: string }) => {
    return fetchJSON<any>(`${GTM_BASE}/admin/organizations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  tripCircuitBreaker: async (agentKey: string) => {
    return fetchJSON<any>(`${GTM_BASE}/admin/circuit-breaker/${agentKey}`, {
      method: "POST",
    });
  },

  resetCircuitBreaker: async (agentKey: string) => {
    return fetchJSON<any>(`${GTM_BASE}/admin/circuit-breaker/${agentKey}/reset`, {
      method: "POST",
    });
  },

  tripGlobalKillswitch: async () => {
    return fetchJSON<any>(`${GTM_BASE}/admin/killswitch/trip`, {
      method: "POST",
    });
  },

  resetGlobalKillswitch: async () => {
    return fetchJSON<any>(`${GTM_BASE}/admin/killswitch/reset`, {
      method: "POST",
    });
  },

  getAdminUsers: async () => {
    return fetchJSON<any[]>(`${GTM_BASE}/admin/users`);
  },

  getAdminFeatureFlags: async () => {
    return fetchJSON<any[]>(`${GTM_BASE}/admin/features`);
  },

  toggleAdminFeatureFlag: async (key: string, isEnabled: boolean) => {
    return fetchJSON<any>(`${GTM_BASE}/admin/features/${key}/toggle`, {
      method: "POST",
      body: JSON.stringify({ is_enabled: isEnabled }),
    });
  },

  getAdminAuditLogs: async () => {
    return fetchJSON<any[]>(`${GTM_BASE}/admin/audit-logs`);
  },

  getAdminEmailSettings: async () => {
    return fetchJSON<any>(`${GTM_BASE}/admin/email/settings`);
  },

  updateAdminEmailSettings: async (data: any) => {
    return fetchJSON<any>(`${GTM_BASE}/admin/email/settings`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  testPlatformEmailDispatch: async (data: { recipient_email: string }) => {
    return fetchJSON<any>(`${GTM_BASE}/admin/email/test-platform`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getAdminEmailAnalytics: async () => {
    return fetchJSON<any>(`${GTM_BASE}/admin/email/analytics`);
  },
};

// 4. MARKETPLACE SERVICE (:8083)
export const MARKETPLACE_API = {
  getMerchants: async () => {
    return fetchJSON<any[]>(`${MARKETPLACE_BASE}/admin/merchants`);
  },

  verifyMerchant: async (merchantId: string) => {
    return fetchJSON<any>(`${MARKETPLACE_BASE}/admin/merchants/${merchantId}/verify`, {
      method: "POST",
    });
  },

  getDisputes: async () => {
    return fetchJSON<any[]>(`${MARKETPLACE_BASE}/admin/disputes`);
  },

  resolveDispute: async (disputeId: string, resolution: any) => {
    return fetchJSON<any>(`${MARKETPLACE_BASE}/admin/disputes/${disputeId}/resolve`, {
      method: "POST",
      body: JSON.stringify(resolution),
    });
  },

  getDiscoveryNiches: async () => {
    return fetchJSON<any[]>(`http://localhost:8083/discovery/niches`);
  },
};

// 5. ENTERPRISE ERP SERVICE (:8084)
export const ERP_API = {
  getTenants: async () => {
    return fetchJSON<any[]>(`${ERP_BASE}/admin/tenants`);
  },

  getUsers: async () => {
    return fetchJSON<any[]>(`${ERP_BASE}/users`);
  },

  getDepartments: async () => {
    return fetchJSON<any[]>(`${ERP_BASE}/departments`);
  },

  getAppraisalCycles: async () => {
    return fetchJSON<any[]>(`${ERP_BASE}/cycles`);
  },
};

// 6. LOGISTICS SERVICE (:8085)
export const LOGISTICS_API = {
  getShipments: async (orgId?: string) => {
    const url = orgId ? `${LOGISTICS_BASE}/shipments?org_id=${orgId}` : `${LOGISTICS_BASE}/shipments`;
    return fetchJSON<any>(url);
  },

  getShipment: async (id: string) => {
    return fetchJSON<any>(`${LOGISTICS_BASE}/shipments/${id}`);
  },

  createShipment: async (data: any) => {
    return fetchJSON<any>(`${LOGISTICS_BASE}/shipments`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateShipmentStatus: async (id: string, data: any) => {
    return fetchJSON<any>(`${LOGISTICS_BASE}/shipments/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  getCouriers: async () => {
    return fetchJSON<any>(`${LOGISTICS_BASE}/couriers`);
  },

  calculateRates: async (data: { origin_city: string; dest_city: string; weight_kg: number }) => {
    return fetchJSON<any>(`${LOGISTICS_BASE}/rates/calculate`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// 7. SYSTEM HEALTH CHECKER (Across all 5 services)
export const SYSTEM_HEALTH_API = {
  checkAllServices: async () => {
    const services = [
      { name: "service_users", port: 8081, url: "http://localhost:8081/healthz" },
      { name: "service_ai", port: 8082, url: "http://localhost:8082/healthz" },
      { name: "service_marketplace", port: 8083, url: "http://localhost:8083/healthz" },
      { name: "service_erp", port: 8084, url: "http://localhost:8084/healthz" },
      { name: "service_logistics", port: 8085, url: "http://localhost:8085/healthz" },
    ];

    const results = await Promise.allSettled(
      services.map(async (s) => {
        try {
          const res = await fetch(s.url, { signal: AbortSignal.timeout(2000) });
          return {
            name: s.name,
            port: s.port,
            status: res.ok ? "HEALTHY" : "DEGRADED",
            statusCode: res.status,
          };
        } catch (e: any) {
          return {
            name: s.name,
            port: s.port,
            status: "OFFLINE",
            error: e.message,
          };
        }
      })
    );

    return results.map((r, idx) => {
      if (r.status === "fulfilled") return r.value;
      return {
        name: services[idx].name,
        port: services[idx].port,
        status: "OFFLINE",
      };
    });
  },
};
