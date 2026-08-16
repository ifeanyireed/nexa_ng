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

  // 9. Multi-Channel Revenue Attribution, Email Replies & Social Media Analytics
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
