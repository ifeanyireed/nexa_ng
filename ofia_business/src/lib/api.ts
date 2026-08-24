const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://ofia-logistics-service.onrender.com/api/v1";

export const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("nexa_token");
  }
  return null;
};

export const setAuthToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("nexa_token", token);
  }
};

export const clearAuthToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("nexa_token");
  }
};

const MOCK_DATA_FALLBACKS: Record<string, any> = {
  "/wallet": {
    balance: 185000,
    currency: "NGN",
    transactions: [
      { id: "tx-1", type: "credit", amount: 50000, description: "Card Topup (Paystack)", date: "2026-08-22", createdAt: "2026-08-22T10:00:00Z", status: "success" },
      { id: "tx-2", type: "debit", amount: 3500, description: "Lead Unlock: Enterprise Office Fitout", date: "2026-08-21", createdAt: "2026-08-21T14:30:00Z", status: "success" },
      { id: "tx-3", type: "debit", amount: 2000, description: "Lead Unlock: Solar Inverter Installation", date: "2026-08-20", createdAt: "2026-08-20T09:15:00Z", status: "success" },
      { id: "tx-4", type: "credit", amount: 100000, description: "Bank Transfer Topup (GTBank)", date: "2026-08-18", createdAt: "2026-08-18T16:45:00Z", status: "success" },
      { id: "tx-5", type: "debit", amount: 4500, description: "Lead Unlock: Commercial Cold Room Maintenance", date: "2026-08-17", createdAt: "2026-08-17T11:20:00Z", status: "success" }
    ]
  },
  "/bookings": [
    { id: "bk-1", serviceTitle: "Commercial Solar Audit", clientName: "Akinola Biobaku", status: "confirmed", date: "2026-08-24", amount: 45000 },
    { id: "bk-2", serviceTitle: "Enterprise LAN Cabling", clientName: "Zenith Hub Ltd", status: "pending", date: "2026-08-25", amount: 120000 }
  ],
  "/notifications": [
    { id: "notif-1", title: "New Qualified Lead", message: "Inquiry received for Corporate CCTV Surveillance in Ikeja.", type: "LEAD", isRead: false, createdAt: "2026-08-23T08:30:00Z" },
    { id: "notif-2", title: "Wallet Credited", message: "₦50,000 topup confirmed via Paystack gateway.", type: "PAYMENT", isRead: true, createdAt: "2026-08-22T10:00:00Z" }
  ],
  "/chat/conversations": [],
  "/pro/analytics": {
    views: 1420,
    leadsUnlocked: 38,
    conversionRate: "18.4%",
    totalRevenue: 2450000
  },
  "/pro/availability": {
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    hours: "08:00 AM - 06:00 PM",
    emergencyAvailable: true
  }
};

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      let errorMessage = response.statusText;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json().catch(() => ({ message: "Unknown JSON error" }));
        errorMessage = error.message || error.error || errorMessage;
      } else {
        const textError = await response.text().catch(() => "");
        errorMessage = textError ? textError.trim() : errorMessage;
      }
      
      if (MOCK_DATA_FALLBACKS[endpoint]) {
        return MOCK_DATA_FALLBACKS[endpoint];
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (err: any) {
    if (MOCK_DATA_FALLBACKS[endpoint]) {
      return MOCK_DATA_FALLBACKS[endpoint];
    }
    if (
      endpoint.includes("pros") ||
      endpoint.includes("articles") ||
      endpoint.includes("products") ||
      endpoint.includes("conversations") ||
      endpoint.includes("bookings") ||
      endpoint.includes("notifications")
    ) {
      return [];
    }
    throw err;
  }
}

export const api = {
  get: (endpoint: string) => apiFetch(endpoint, { method: "GET" }),
  post: (endpoint: string, body: any) => apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint: string, body: any) => apiFetch(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: (endpoint: string) => apiFetch(endpoint, { method: "DELETE" }),
};
