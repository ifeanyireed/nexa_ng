// Centralized typed API client for communicating with ai_gtm_service (:8082) & user_subscription_service (:8081)

const GTM_BASE = process.env.NEXT_PUBLIC_GTM_API_URL || "http://localhost:8082/api/v1/gtm";
const USER_BASE = process.env.NEXT_PUBLIC_USER_API_URL || "http://localhost:8081/api/v1";

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

export const GTM_API = {
  // 1. Agents Swarm
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

  // 2. GTM Strategy
  getStrategy: async (orgId = "org-01") => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/strategy`);
  },

  // 3. Campaigns
  getCampaigns: async (orgId = "org-01") => {
    return fetchJSON<any[]>(`${GTM_BASE}/${orgId}/campaigns`);
  },

  createCampaign: async (orgId = "org-01", data: { name: string; target_audience: string; channels: string[]; initial_goal?: string }) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/campaigns`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 4. Leads & Intelligence
  getLeads: async (orgId = "org-01") => {
    return fetchJSON<any[]>(`${GTM_BASE}/${orgId}/leads`);
  },

  extractLeads: async (orgId = "org-01", data: { query: string; location: string; target_size: number }) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/leads/extract`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 5. Approvals Center
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

  // 6. Tenant Settings & Integrations Vault
  getSettings: async (orgId = "org-01") => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/settings`);
  },

  updateEmailSettings: async (orgId = "org-01", data: any) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/settings/email`, {
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

  updateBYOKKeys: async (orgId = "org-01", data: any) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/settings/byok`, {
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

  updateAdsSettings: async (orgId = "org-01", data: any) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/settings/ads`, {
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

  testConnection: async (orgId = "org-01", data: { channel: string; target_email?: string }) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/settings/test`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // 7. Provider-Agnostic Email Infrastructure & Guided 3-Step Wizard
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

  // 8. Admin Global Email Infrastructure & Cross-Tenant Limits
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

  // 9. Super Admin Overview & Platform Health (Direct Database Sync)
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

  // 10. Multi-Channel Revenue Attribution, Email Replies & Social Media Analytics
  getOverviewAnalytics: async (orgId = "org-01") => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/analytics/overview`);
  },

  getEmailReplies: async (orgId = "org-01") => {
    return fetchJSON<any[]>(`${GTM_BASE}/${orgId}/analytics/replies`);
  },

  getSocialAnalytics: async (orgId = "org-01") => {
    return fetchJSON<any[]>(`${GTM_BASE}/${orgId}/analytics/social`);
  },
};

const AUTH_BASE = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8082/api/v1/auth";

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

  getWorkspaceUsers: async (orgId = "org-01") => {
    return fetchJSON<any[]>(`${GTM_BASE}/${orgId}/users`);
  },

  inviteWorkspaceUser: async (orgId = "org-01", data: { email: string; name: string; role: string; title?: string; password?: string }) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/users/invite`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateUserRole: async (orgId = "org-01", userId: string, role: string) => {
    return fetchJSON<any>(`${GTM_BASE}/${orgId}/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  },
};

export const USER_API = {
  // Organizations & Workspaces
  getUserOrgs: async () => {
    return fetchJSON<any[]>(`${USER_BASE}/organizations`);
  },

  getOrgSubscription: async (orgId = "org-01") => {
    return fetchJSON<any>(`${USER_BASE}/organizations/${orgId}/subscription`);
  },

  getPlanCatalog: async () => {
    return fetchJSON<any>(`${USER_BASE}/plans`);
  },
};
