export interface TenantOrg {
  id: string;
  name: string;
  slug: string;
  domain: string;
  ownerName: string;
  ownerEmail: string;
  planTier: "FREE_TRIAL" | "STARTER" | "GROWTH" | "SCALE" | "ENTERPRISE";
  status: "Active" | "Past Due" | "Suspended" | "Trialing";
  mrr: number;
  activeAgentsCount: number;
  leadsUsed: number;
  leadsLimit: number;
  campaignsActive: number;
  campaignsLimit: number;
  monthlyAiSpendUSD: number;
  integrationHealth: "Healthy" | "Degraded" | "Error";
  erpModules?: Record<string, boolean>;
  createdAt: string;
}

export interface ErpModuleItem {
  key: string;
  label: string;
  category: "Core" | "Sales & Commerce" | "Operations" | "People & Finance";
  description: string;
  iconName: string;
  color: string;
  badge?: string;
}

export const SUPER_ADMIN_ERP_MODULES: ErpModuleItem[] = [
  { key: "ai", label: "Ofia AI Swarm", category: "Core", description: "15 autonomous specialist AI agents for marketing, outreach, and operations.", iconName: "Bot", color: "#1A56DB", badge: "15 AI" },
  { key: "crm", label: "CRM and Sales", category: "Sales & Commerce", description: "B2B sales pipelines, customer deals, account contacts, and revenue tracking.", iconName: "BarChart3", color: "#EC4899", badge: "Sales" },
  { key: "marketplace", label: "Ofia Compass Manager", category: "Sales & Commerce", description: "Public storefront, listing catalog, and customer direct bookings.", iconName: "ShoppingBag", color: "#0E9F6E" },
  { key: "shop", label: "Ofia Shop Manager", category: "Sales & Commerce", description: "Multi-warehouse inventory (IMS), POS cashier registers, and viral referrals.", iconName: "Store", color: "#10B981", badge: "Retail" },
  { key: "logistics", label: "Ofia Logistics Manager", category: "Operations", description: "Dispatch desk, waybills, courier assignments, and fleet routing.", iconName: "Truck", color: "#6366F1" },
  { key: "accounting", label: "Accounting & Ledgers", category: "People & Finance", description: "General ledger, charts of accounts, trial balance, and tax remittances.", iconName: "Layers", color: "#0E9F6E", badge: "GL" },
  { key: "hr", label: "HR & Appraisals", category: "People & Finance", description: "Employee roster, KPI appraisal cycles, reviews, and team retreat quests.", iconName: "Users", color: "#9061F9" },
  { key: "users", label: "User Management", category: "People & Finance", description: "Corporate staff directory, 10-tier role governance, departmental hierarchy, and cost centers.", iconName: "Users", color: "#1A56DB", badge: "Staff" },
  { key: "access_control", label: "Access Control & RBAC", category: "Core", description: "Tenant role-based access matrix, security permissions, and audit logging.", iconName: "ShieldCheck", color: "#1A56DB", badge: "RBAC" },
];

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "TENANT_OWNER" | "GROWTH_LEAD" | "SALES_REP" | "VIEWER";
  orgName: string;
  orgId: string;
  avatar?: string;
  title?: string;
  twoFactorEnabled: boolean;
  status: "Active" | "Invited" | "Suspended";
  lastLogin: string;
}

export interface RBACRoleDefinition {
  key: "SUPER_ADMIN" | "TENANT_OWNER" | "GROWTH_LEAD" | "SALES_REP" | "VIEWER";
  name: string;
  badgeVariant: "purple" | "brand" | "cyan" | "warning" | "neutral";
  description: string;
  scope: string;
  permissions: {
    canManagePlatform: boolean;
    canArmCircuitBreaker: boolean;
    canManageInfrastructure: boolean;
    canManageTeamRBAC: boolean;
    canApproveActions: boolean;
    canCreateCampaigns: boolean;
    canManageLeads: boolean;
    canViewAnalytics: boolean;
  };
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  category: "AI Engine" | "Channels" | "Automation" | "Enterprise";
  rolloutPercentage: number;
  isEnabledGlobally: boolean;
  whitelistedOrgIds: string[];
  updatedBy: string;
  lastUpdated: string;
}

export interface AgentHealthMetric {
  agentKey: string;
  name: string;
  role: string;
  category: string;
  status: "Healthy" | "Degraded" | "Paused" | "Tripped";
  tasksPerMinute: number;
  avgLatencyMs: number;
  errorRatePct: number;
  totalExecutionsToday: number;
  circuitBreakerActive: boolean;
  primaryModel: string;
}

export interface ModelGatewayMetric {
  provider: "Anthropic" | "Google" | "OpenAI" | "Groq";
  modelName: string;
  monthlySpendUSD: number;
  promptTokensMillion: number;
  completionTokensMillion: number;
  avgLatencyMs: number;
  errorRatePct: number;
  cacheHitRatePct: number;
  primaryUseCases: string;
}

export interface SystemQueueMetric {
  queueName: string;
  depth: number;
  processingRatePerSec: number;
  errorCount: number;
  status: "Optimal" | "Backlogged" | "Stalled";
}

export interface AuditLogEntry {
  id: string;
  operatorEmail: string;
  action: string;
  targetType: "Tenant" | "User" | "FeatureFlag" | "Agent" | "Billing";
  targetId: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export const INITIAL_TENANTS: TenantOrg[] = [
  {
    id: "org-01",
    name: "New Era Transports",
    slug: "neweratransports",
    domain: "neweratransports.com",
    ownerName: "Ifeanyi Felix",
    ownerEmail: "ifeanyi.ibeh@neweratransports.com",
    planTier: "GROWTH",
    status: "Active",
    mrr: 24000,
    activeAgentsCount: 15,
    leadsUsed: 3420,
    leadsLimit: 5000,
    campaignsActive: 4,
    campaignsLimit: 10,
    monthlyAiSpendUSD: 2850,
    integrationHealth: "Healthy",
    erpModules: {
      ai: true,
      crm: true,
      marketplace: true,
      shop: true,
      logistics: true,
      accounting: true,
      hr: true,
      access_control: true,
    },
    createdAt: "2026-06-15",
  },
  {
    id: "org-02",
    name: "PayFlow Africa",
    slug: "payflow-africa",
    domain: "payflow.africa",
    ownerName: "Chioma Okonkwo",
    ownerEmail: "chioma@payflow.africa",
    planTier: "ENTERPRISE",
    status: "Active",
    mrr: 100000,
    activeAgentsCount: 15,
    leadsUsed: 24800,
    leadsLimit: 50000,
    campaignsActive: 18,
    campaignsLimit: 100,
    monthlyAiSpendUSD: 13600,
    integrationHealth: "Healthy",
    erpModules: {
      ai: true,
      crm: true,
      marketplace: true,
      shop: true,
      logistics: true,
      accounting: true,
      hr: true,
      access_control: true,
    },
    createdAt: "2026-05-10",
  },
  {
    id: "org-03",
    name: "HealthBridge Clinics",
    slug: "healthbridge",
    domain: "healthbridge.io",
    ownerName: "Dr. Babatunde Jinadu",
    ownerEmail: "babatunde@healthbridge.io",
    planTier: "STARTER",
    status: "Active",
    mrr: 9000,
    activeAgentsCount: 8,
    leadsUsed: 840,
    leadsLimit: 1000,
    campaignsActive: 2,
    campaignsLimit: 3,
    monthlyAiSpendUSD: 904,
    integrationHealth: "Healthy",
    erpModules: {
      ai: true,
      crm: false,
      marketplace: false,
      shop: true,
      logistics: false,
      accounting: false,
      hr: true,
      access_control: true,
    },
    createdAt: "2026-07-01",
  },
  {
    id: "org-04",
    name: "Apex Global Logistics",
    slug: "apex-logistics",
    domain: "apexlogistics.com.ng",
    ownerName: "Ibrahim Musa",
    ownerEmail: "ibrahim@apexlogistics.com.ng",
    planTier: "SCALE",
    status: "Past Due",
    mrr: 48000,
    activeAgentsCount: 12,
    leadsUsed: 12400,
    leadsLimit: 20000,
    campaignsActive: 6,
    campaignsLimit: 25,
    monthlyAiSpendUSD: 6216,
    integrationHealth: "Degraded",
    erpModules: {
      ai: true,
      crm: true,
      marketplace: true,
      shop: true,
      logistics: true,
      accounting: true,
      hr: true,
      access_control: true,
    },
    createdAt: "2026-04-20",
  },
  {
    id: "org-05",
    name: "Zenith Real Estate Hub",
    slug: "zenith-re",
    domain: "zenithrealty.ng",
    ownerName: "Ngozi Eze",
    ownerEmail: "ngozi@zenithrealty.ng",
    planTier: "FREE_TRIAL",
    status: "Trialing",
    mrr: 0,
    activeAgentsCount: 4,
    leadsUsed: 68,
    leadsLimit: 100,
    campaignsActive: 1,
    campaignsLimit: 1,
    monthlyAiSpendUSD: 168,
    integrationHealth: "Healthy",
    erpModules: {
      ai: true,
      crm: true,
      marketplace: true,
      shop: false,
      logistics: false,
      accounting: false,
      hr: false,
      access_control: true,
    },
    createdAt: "2026-08-10",
  },
];

export const RBAC_ROLE_DEFINITIONS: Record<string, RBACRoleDefinition> = {
  SUPER_ADMIN: {
    key: "SUPER_ADMIN",
    name: "SuperAdmin Operator",
    badgeVariant: "purple",
    description: "Root platform operator with full control across all organizations, infrastructure, feature flags, and emergency circuit breakers.",
    scope: "Global Platform (All Tenants)",
    permissions: {
      canManagePlatform: true,
      canArmCircuitBreaker: true,
      canManageInfrastructure: true,
      canManageTeamRBAC: true,
      canApproveActions: true,
      canCreateCampaigns: true,
      canManageLeads: true,
      canViewAnalytics: true,
    },
  },
  TENANT_OWNER: {
    key: "TENANT_OWNER",
    name: "Tenant Owner / CEO",
    badgeVariant: "brand",
    description: "Full administrative ownership of the workspace, including BYOK Model Keys, channel integrations, billing, and team seats.",
    scope: "Workspace Admin (Full Scope)",
    permissions: {
      canManagePlatform: false,
      canArmCircuitBreaker: false,
      canManageInfrastructure: true,
      canManageTeamRBAC: true,
      canApproveActions: true,
      canCreateCampaigns: true,
      canManageLeads: true,
      canViewAnalytics: true,
    },
  },
  GROWTH_LEAD: {
    key: "GROWTH_LEAD",
    name: "Growth & Campaign Lead",
    badgeVariant: "cyan",
    description: "Orchestrates multi-channel autonomous campaigns, 1-click approvals for email drops/ad scaling, and knowledge ingestion.",
    scope: "Campaign Operations & Approvals",
    permissions: {
      canManagePlatform: false,
      canArmCircuitBreaker: false,
      canManageInfrastructure: false,
      canManageTeamRBAC: false,
      canApproveActions: true,
      canCreateCampaigns: true,
      canManageLeads: true,
      canViewAnalytics: true,
    },
  },
  SALES_REP: {
    key: "SALES_REP",
    name: "Sales Representative / SDR",
    badgeVariant: "warning",
    description: "Prospect lead discovery, CRM pipeline inspection, conversation transcripts review, and meeting bookings handoff.",
    scope: "Lead Intelligence & Conversations",
    permissions: {
      canManagePlatform: false,
      canArmCircuitBreaker: false,
      canManageInfrastructure: false,
      canManageTeamRBAC: false,
      canApproveActions: false,
      canCreateCampaigns: false,
      canManageLeads: true,
      canViewAnalytics: true,
    },
  },
  VIEWER: {
    key: "VIEWER",
    name: "Executive Viewer / Auditor",
    badgeVariant: "neutral",
    description: "Read-only access to morning briefings, revenue velocity metrics, pipeline charts, and immutable compliance audit logs.",
    scope: "Read-Only Dashboard",
    permissions: {
      canManagePlatform: false,
      canArmCircuitBreaker: false,
      canManageInfrastructure: false,
      canManageTeamRBAC: false,
      canApproveActions: false,
      canCreateCampaigns: false,
      canManageLeads: false,
      canViewAnalytics: true,
    },
  },
};

export const INITIAL_ADMIN_USERS: AdminUser[] = [
  {
    id: "usr-01",
    name: "Platform SuperAdmin",
    email: "admin@gtmengine.internal",
    role: "SUPER_ADMIN",
    title: "Global Platform Operator",
    orgName: "Platform Operator",
    orgId: "platform-root",
    avatar: "/character1.jpg",
    twoFactorEnabled: true,
    status: "Active",
    lastLogin: "10m ago",
  },
  {
    id: "usr-02",
    name: "Ifeanyi Felix",
    email: "ifeanyi.ibeh@neweratransports.com",
    role: "TENANT_OWNER",
    title: "Managing Director / Founder",
    orgName: "New Era Transports",
    orgId: "org-01",
    avatar: "/character2.jpg",
    twoFactorEnabled: true,
    status: "Active",
    lastLogin: "5m ago",
  },
  {
    id: "usr-03",
    name: "Victoria Aghogho Otojareri",
    email: "accounts@neweratransports.com",
    role: "GROWTH_LEAD",
    title: "Chief Accountant & Financial Controller",
    orgName: "New Era Transports",
    orgId: "org-01",
    avatar: "/character3.jpg",
    twoFactorEnabled: true,
    status: "Active",
    lastLogin: "1 hour ago",
  },
  {
    id: "usr-04",
    name: "Babalola Imoleayo Adelakun",
    email: "babalola.adelakun@neweratransports.com",
    role: "SALES_REP",
    title: "Fleet Operations Manager",
    orgName: "New Era Transports",
    orgId: "org-01",
    avatar: "/character4.jpg",
    twoFactorEnabled: false,
    status: "Active",
    lastLogin: "2 hours ago",
  },
  {
    id: "usr-05",
    name: "Asiegbu Chioma John",
    email: "clientrelations@neweratransports.com",
    role: "VIEWER",
    title: "Marketing Executive & CSR",
    orgName: "New Era Transports",
    orgId: "org-01",
    avatar: "/character5.jpg",
    twoFactorEnabled: true,
    status: "Active",
    lastLogin: "1 day ago",
  },
  {
    id: "usr-06",
    name: "Chioma Okonkwo",
    email: "chioma@payflow.africa",
    role: "TENANT_OWNER",
    title: "Managing Director",
    orgName: "PayFlow Africa",
    orgId: "org-02",
    avatar: "/character6.jpg",
    twoFactorEnabled: true,
    status: "Active",
    lastLogin: "45m ago",
  },
  {
    id: "usr-07",
    name: "David Adeleke",
    email: "david@payflow.africa",
    role: "GROWTH_LEAD",
    title: "Growth Marketing Lead",
    orgName: "PayFlow Africa",
    orgId: "org-02",
    avatar: "/character7.jpg",
    twoFactorEnabled: true,
    status: "Active",
    lastLogin: "Yesterday",
  },
  {
    id: "usr-08",
    name: "Tunde Bakare",
    email: "tunde@payflow.africa",
    role: "SALES_REP",
    title: "Inbound Account Executive",
    orgName: "PayFlow Africa",
    orgId: "org-02",
    avatar: "/character8.jpg",
    twoFactorEnabled: false,
    status: "Invited",
    lastLogin: "Never",
  },
  {
    id: "usr-09",
    name: "Dr. Emeka Kalu",
    email: "dr.kalu@healthbridge.ng",
    role: "TENANT_OWNER",
    title: "Medical Director & CEO",
    orgName: "HealthBridge Clinics",
    orgId: "org-03",
    avatar: "/character9.jpg",
    twoFactorEnabled: true,
    status: "Active",
    lastLogin: "3 hours ago",
  },
  {
    id: "usr-10",
    name: "Amaka Umeh",
    email: "amaka@healthbridge.ng",
    role: "GROWTH_LEAD",
    title: "Patient Acquisition Lead",
    orgName: "HealthBridge Clinics",
    orgId: "org-03",
    avatar: "/character10.jpg",
    twoFactorEnabled: true,
    status: "Active",
    lastLogin: "5 hours ago",
  },
];

export const INITIAL_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: "ff-01",
    key: "voice_assistant_realtime",
    name: "Real-Time Voice Assistant HUD (STT/TTS)",
    description: "Low-latency streaming audio visualizer with bidirectional speech synthesis",
    category: "AI Engine",
    rolloutPercentage: 50,
    isEnabledGlobally: true,
    whitelistedOrgIds: ["org-01", "org-02"],
    updatedBy: "admin@gtmengine.internal",
    lastUpdated: "2026-08-14 18:20",
  },
  {
    id: "ff-02",
    key: "whatsapp_autonomous_replies",
    name: "Unsupervised WhatsApp Auto-Dialogue",
    description: "Allows Amara Obi (WhatsApp Agent) to reply to lead queries without human approval trigger",
    category: "Automation",
    rolloutPercentage: 15,
    isEnabledGlobally: false,
    whitelistedOrgIds: ["org-02"],
    updatedBy: "admin@gtmengine.internal",
    lastUpdated: "2026-08-12 11:00",
  },
  {
    id: "ff-03",
    key: "ad_spend_auto_scaling",
    name: "Autonomous Ad Spend Scaler",
    description: "Dynamically raises Meta & LinkedIn daily budget by up to 20% when ROAS exceeds 3.5x",
    category: "Channels",
    rolloutPercentage: 25,
    isEnabledGlobally: false,
    whitelistedOrgIds: ["org-01", "org-02"],
    updatedBy: "admin@gtmengine.internal",
    lastUpdated: "2026-08-10 14:30",
  },
  {
    id: "ff-04",
    key: "deep_lead_enrichment_v2",
    name: "Waterfall Lead Extraction Engine v2",
    description: "Multi-source waterfall verification for mobile phones, direct dials, and verified work emails",
    category: "AI Engine",
    rolloutPercentage: 100,
    isEnabledGlobally: true,
    whitelistedOrgIds: [],
    updatedBy: "admin@gtmengine.internal",
    lastUpdated: "2026-08-01 09:15",
  },
  {
    id: "ff-05",
    key: "byok_custom_model_routing",
    name: "Bring-Your-Own-Key (BYOK) Model Gateway",
    description: "Allows Enterprise tenants to inject their own OpenAI / Anthropic API keys directly",
    category: "Enterprise",
    rolloutPercentage: 100,
    isEnabledGlobally: true,
    whitelistedOrgIds: ["org-02"],
    updatedBy: "admin@gtmengine.internal",
    lastUpdated: "2026-07-28 16:45",
  },
  {
    id: "ff-06",
    key: "agent_autonomous_debate",
    name: "Multi-Agent Adversarial Strategy Critique",
    description: "Triggers CRO and GTM Strategist multi-round debate before finalizing campaigns",
    category: "AI Engine",
    rolloutPercentage: 10,
    isEnabledGlobally: false,
    whitelistedOrgIds: ["org-01"],
    updatedBy: "admin@gtmengine.internal",
    lastUpdated: "2026-08-13 12:10",
  },
];

export const INITIAL_SWARM_HEALTH: AgentHealthMetric[] = [
  {
    agentKey: "cro",
    name: "Sterling Vance",
    role: "Chief Revenue Officer",
    category: "Executive",
    status: "Healthy",
    tasksPerMinute: 28,
    avgLatencyMs: 1150,
    errorRatePct: 0.0,
    totalExecutionsToday: 1840,
    circuitBreakerActive: false,
    primaryModel: "Claude 3.5 Sonnet",
  },
  {
    agentKey: "lead_hunter",
    name: "Olivia Chen",
    role: "Lead Hunter",
    category: "Intelligence",
    status: "Healthy",
    tasksPerMinute: 142,
    avgLatencyMs: 380,
    errorRatePct: 0.08,
    totalExecutionsToday: 14820,
    circuitBreakerActive: false,
    primaryModel: "Gemini 1.5 Flash",
  },
  {
    agentKey: "copywriter",
    name: "Julian Cross",
    role: "AI Copywriter",
    category: "Content",
    status: "Healthy",
    tasksPerMinute: 64,
    avgLatencyMs: 820,
    errorRatePct: 0.02,
    totalExecutionsToday: 4210,
    circuitBreakerActive: false,
    primaryModel: "GPT-4o",
  },
  {
    agentKey: "outreach_manager",
    name: "Noah Sterling",
    role: "Outreach Manager",
    category: "Outreach",
    status: "Healthy",
    tasksPerMinute: 210,
    avgLatencyMs: 140,
    errorRatePct: 0.01,
    totalExecutionsToday: 24100,
    circuitBreakerActive: false,
    primaryModel: "Groq Llama 3",
  },
  {
    agentKey: "whatsapp_manager",
    name: "Amara Obi",
    role: "WhatsApp Manager",
    category: "Outreach",
    status: "Healthy",
    tasksPerMinute: 85,
    avgLatencyMs: 95,
    errorRatePct: 0.0,
    totalExecutionsToday: 8940,
    circuitBreakerActive: false,
    primaryModel: "Groq Llama 3",
  },
  {
    agentKey: "ads_strategist",
    name: "Kieran Patel",
    role: "Ads Strategist",
    category: "Strategy",
    status: "Healthy",
    tasksPerMinute: 12,
    avgLatencyMs: 940,
    errorRatePct: 0.0,
    totalExecutionsToday: 940,
    circuitBreakerActive: false,
    primaryModel: "Claude 3.5 Sonnet",
  },
];

export const INITIAL_MODEL_METRICS: ModelGatewayMetric[] = [
  {
    provider: "Anthropic",
    modelName: "Claude 3.5 Sonnet",
    monthlySpendUSD: 4280.5,
    promptTokensMillion: 142.5,
    completionTokensMillion: 28.4,
    avgLatencyMs: 1150,
    errorRatePct: 0.02,
    cacheHitRatePct: 44.8,
    primaryUseCases: "Executive Strategy, Briefings, Campaign Planning",
  },
  {
    provider: "Google",
    modelName: "Gemini 1.5 Flash",
    monthlySpendUSD: 1120.2,
    promptTokensMillion: 820.0,
    completionTokensMillion: 115.0,
    avgLatencyMs: 380,
    errorRatePct: 0.01,
    cacheHitRatePct: 58.2,
    primaryUseCases: "High-Volume Lead Extraction, Web Parsing, Vector Chunks",
  },
  {
    provider: "OpenAI",
    modelName: "GPT-4o",
    monthlySpendUSD: 2840.8,
    promptTokensMillion: 94.0,
    completionTokensMillion: 22.0,
    avgLatencyMs: 840,
    errorRatePct: 0.04,
    cacheHitRatePct: 36.5,
    primaryUseCases: "Creative Copywriting, Landing Pages, Ad Copy Angles",
  },
  {
    provider: "Groq",
    modelName: "Llama 3 70B",
    monthlySpendUSD: 480.0,
    promptTokensMillion: 310.0,
    completionTokensMillion: 48.0,
    avgLatencyMs: 110,
    errorRatePct: 0.0,
    cacheHitRatePct: 12.0,
    primaryUseCases: "Real-Time Sentiment Classification, WhatsApp Quick Replies",
  },
];

export const INITIAL_SYSTEM_QUEUES: SystemQueueMetric[] = [
  { queueName: "lead-extraction-worker", depth: 142, processingRatePerSec: 48, errorCount: 1, status: "Optimal" },
  { queueName: "email-outbound-dispatch", depth: 28, processingRatePerSec: 65, errorCount: 0, status: "Optimal" },
  { queueName: "whatsapp-webhook-inbound", depth: 4, processingRatePerSec: 32, errorCount: 0, status: "Optimal" },
  { queueName: "vector-indexing-pipeline", depth: 12, processingRatePerSec: 8, errorCount: 0, status: "Optimal" },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "log-101",
    operatorEmail: "admin@gtmengine.internal",
    action: "TOGGLE_FEATURE_FLAG",
    targetType: "FeatureFlag",
    targetId: "voice_assistant_realtime",
    details: "Increased rollout percentage from 25% to 50%",
    ipAddress: "197.210.84.12",
    timestamp: "12 mins ago",
  },
  {
    id: "log-102",
    operatorEmail: "admin@gtmengine.internal",
    action: "OVERRIDE_TENANT_QUOTA",
    targetType: "Tenant",
    targetId: "org-01 (EduSuite)",
    details: "Added 2,000 bonus lead extraction credits for Q3 trial expansion",
    ipAddress: "197.210.84.12",
    timestamp: "1 hour ago",
  },
  {
    id: "log-103",
    operatorEmail: "admin@gtmengine.internal",
    action: "PLAN_UPGRADE_MANUAL",
    targetType: "Billing",
    targetId: "org-02 (PayFlow)",
    details: "Upgraded tenant to ENTERPRISE tier with BYOK authorization",
    ipAddress: "197.210.84.12",
    timestamp: "4 hours ago",
  },
  {
    id: "log-104",
    operatorEmail: "admin@gtmengine.internal",
    action: "ELEVATE_USER_ROLE",
    targetType: "User",
    targetId: "usr-03 (Folashade Aina)",
    details: "Granted GROWTH_LEAD workspace permissions",
    ipAddress: "197.210.84.12",
    timestamp: "Yesterday at 16:30",
  },
];
