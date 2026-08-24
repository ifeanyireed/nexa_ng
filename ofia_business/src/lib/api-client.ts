// Centralized typed API client for communicating across all 5 Go microservices:
// - service_users (:8081)
// - service_ai (:8082)
// - service_marketplace (:8083)
// - service_erp (:8084)
// - service_logistics (:8085)

const USER_BASE = process.env.NEXT_PUBLIC_USER_API_URL || "https://ofia-user-service.onrender.com/api/v1";
const GTM_BASE = process.env.NEXT_PUBLIC_GTM_API_URL || "https://ofia-ai-service.onrender.com/api/v1/gtm";
const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL || "https://ofia-user-service.onrender.com/api/v1/auth";
const MARKETPLACE_BASE = process.env.NEXT_PUBLIC_MARKETPLACE_API_URL || "https://ofia-marketplace-service.onrender.com/api/v1";
const ERP_BASE = process.env.NEXT_PUBLIC_ERP_API_URL || "https://ofia-erp-service.onrender.com/api/v1";
const LOGISTICS_BASE = process.env.NEXT_PUBLIC_LOGISTICS_API_URL || "https://ofia-logistics-service.onrender.com/api/v1/logistics";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("nexa_auth_token") || localStorage.getItem("nexa_token") : null;
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

  extractLeads: async (orgId = "org-01", data: { query: string; location: string; target_size: number }) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/leads/extract`, {
      method: "POST",
      body: JSON.stringify(data),
    });
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

  getOverviewAnalytics: async (orgId = "org-01") => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/analytics/overview`);
  },

  getEmailReplies: async (orgId = "org-01") => {
    return fetchJSON<any[]>(`${GTM_BASE}/${orgId}/analytics/replies`);
  },

  getSocialAnalytics: async (orgId = "org-01") => {
    return fetchJSON<any[]>(`${GTM_BASE}/${orgId}/analytics/social`);
  },

  getEmailProviders: async (orgId = "org-01") => {
    return fetchJSON<{
      active_provider: string;
      sending_domain: string;
      domain_status: string;
      sender_name: string;
      sender_email: string;
      reply_to: string;
      providers: any[];
    }>(`${GTM_BASE}/${orgId}/email/providers`);
  },

  verifyEmailDomain: async (orgId = "org-01", data: {
    domain: string;
    provider: string;
    api_key?: string;
    aws_region?: string;
    aws_access_key?: string;
    aws_secret_key?: string;
  }) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/email/verify-domain`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  checkDNSPropagation: async (orgId = "org-01") => {
    return fetchJSON<{
      domain: string;
      status: string;
      dkim_valid: boolean;
      spf_valid: boolean;
      dmarc_valid: boolean;
      mx_valid: boolean;
      last_checked: string;
    }>(`${GTM_BASE}/${orgId}/email/check-dns`, {
      method: "POST",
    });
  },

  switchEmailProvider: async (orgId = "org-01", provider: string) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/email/switch-provider`, {
      method: "POST",
      body: JSON.stringify({ provider }),
    });
  },

  testDispatchEmail: async (orgId = "org-01", data: { recipient_email: string; subject?: string }) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/email/test-dispatch`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  testConnection: async (orgId = "org-01", data: { channel: string; target_email?: string }) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/settings/test`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateBYOKKeys: async (orgId = "org-01", data: any) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/settings/byok`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  updateSocialSettings: async (orgId = "org-01", data: any) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/settings/social`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  updateTelegramSettings: async (orgId = "org-01", data: any) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/settings/telegram`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  updateWABASettings: async (orgId = "org-01", data: any) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/settings/waba`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// 4. MARKETPLACE SERVICE (:8083)
export const MARKETPLACE_API = {
  getProducts: async () => {
    return fetchJSON<any[]>(`${MARKETPLACE_BASE}/products`);
  },

  getBookings: async (proId?: string) => {
    const url = proId ? `${MARKETPLACE_BASE}/bookings?pro_id=${proId}` : `${MARKETPLACE_BASE}/bookings`;
    return fetchJSON<any[]>(url);
  },

  createBooking: async (data: any) => {
    return fetchJSON<any>(`${MARKETPLACE_BASE}/bookings`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getDeals: async () => {
    return fetchJSON<any[]>(`${MARKETPLACE_BASE}/deals`);
  },

  getWallet: async (userId: string) => {
    return fetchJSON<any>(`${MARKETPLACE_BASE}/wallets/${userId}`);
  },
};

// 5. ENTERPRISE ERP SERVICE (:8084)
export const ERP_API = {
  getCOA: async () => {
    return fetchJSON<any[]>(`${ERP_BASE}/finance/coa`);
  },

  getLedger: async () => {
    return fetchJSON<any[]>(`${ERP_BASE}/finance/ledger`);
  },

  getInvoices: async () => {
    return fetchJSON<any[]>(`${ERP_BASE}/finance/invoices`);
  },

  createInvoice: async (data: any) => {
    return fetchJSON<any>(`${ERP_BASE}/finance/invoices`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getBills: async () => {
    return fetchJSON<any[]>(`${ERP_BASE}/finance/bills`);
  },

  getStaffDirectory: async () => {
    return fetchJSON<any[]>(`${ERP_BASE}/users`);
  },

  getObjectives: async () => {
    return fetchJSON<any[]>(`${ERP_BASE}/objectives`);
  },

  getAppraisalCycles: async () => {
    return fetchJSON<any[]>(`${ERP_BASE}/cycles`);
  },
};

// 6. TEAM QUESTS ENGINE (:8084)
export const QUESTS_API = {
  getQuests: async () => {
    return fetchJSON<any[]>(`${ERP_BASE}/quests`);
  },

  getQuestDetail: async (slug?: string, id?: string) => {
    const query = slug ? `slug=${slug}` : id ? `id=${id}` : "";
    return fetchJSON<any>(`${ERP_BASE}/quests/detail?${query}`);
  },

  createQuest: async (data: any) => {
    return fetchJSON<any>(`${ERP_BASE}/quests`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getTeams: async () => {
    return fetchJSON<any[]>(`${ERP_BASE}/quests/teams`);
  },

  createTeam: async (data: any) => {
    return fetchJSON<any>(`${ERP_BASE}/quests/teams`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getChallenges: async () => {
    return fetchJSON<any[]>(`${ERP_BASE}/quests/challenges`);
  },

  createChallenge: async (data: any) => {
    return fetchJSON<any>(`${ERP_BASE}/quests/challenges`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  getScoreboard: async (slug?: string) => {
    const query = slug ? `slug=${slug}` : "";
    return fetchJSON<any>(`${ERP_BASE}/quests/scoreboard?${query}`);
  },

  awardScore: async (data: { team_id: string; points: number; reason: string }) => {
    return fetchJSON<any>(`${ERP_BASE}/quests/scores`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// 7. LOGISTICS SERVICE (:8085)
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
