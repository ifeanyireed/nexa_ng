export type PlanTierKey =
  | "FREE_TRIAL"
  | "STARTER"
  | "GROWTH"
  | "SCALE"
  | "ENTERPRISE";

export interface PlanTierDefinition {
  key: PlanTierKey;
  name: string;
  tag: string;
  popular?: boolean;
  description: string;
  monthlyPriceNGN: number;
  annualPriceNGN: number;
  formattedMonthly: string;
  formattedAnnual: string;
  usdEquivalentMonthly: string;
  seatsIncluded: number | "Unlimited";
  extraSeatPriceNGN?: number;
  dbIsolation: string;
  domainEntitlement: string;
  quotas: {
    leadsLimit: number;
    leadsLabel: string;
    campaignsLimit: number;
    dailyEmailLimit: number;
    emailsLabel: string;
    activeAgentsCount: number;
    skuLimit: number | "Unlimited";
    posRegistersLimit: number | "Unlimited";
    warehouseDepotsLimit: number | "Unlimited";
    byokAllowed: boolean;
  };
  takeRates: {
    directCheckoutPct: number;
    escrowCheckoutPct: number;
    posCounterPct: number;
  };
  shopSubModules: {
    store: boolean;
    catalog: boolean;
    services: boolean;
    orders: boolean;
    pos: boolean;
    inventory: boolean;
    referrals: boolean;
  };
  erpModules: {
    overview: boolean;
    crm: boolean;
    sales_closer: boolean;
    employee: boolean;
    manager: boolean;
    users: boolean;
    shop: boolean;
    accounting: boolean;
    hr: boolean;
    md: boolean;
    dispatch: boolean;
    ai: boolean;
    workforce: boolean;
    client: boolean;
    mobility: boolean;
    marketplace: boolean;
  };
  highlights: string[];
  ctaLabel: string;
}

export interface ModuleAddonDefinition {
  key: string;
  name: string;
  moduleKeys: string[];
  monthlyPriceNGN: number;
  formattedPrice: string;
  badge: string;
  includedFromTier?: PlanTierKey;
  description: string;
  overageNote: string;
}

export const PLAN_TIERS: Record<PlanTierKey, PlanTierDefinition> = {
  FREE_TRIAL: {
    key: "FREE_TRIAL",
    name: "Free Trial",
    tag: "14-Day Trial",
    description: "Risk-free 14-day workspace onboarding with live storefront and booking preview.",
    monthlyPriceNGN: 0,
    annualPriceNGN: 0,
    formattedMonthly: "₦0",
    formattedAnnual: "₦0",
    usdEquivalentMonthly: "$0",
    seatsIncluded: 1,
    dbIsolation: "Shared Trial Sandbox",
    domainEntitlement: "slug.ofia.shop",
    quotas: {
      leadsLimit: 100,
      leadsLabel: "100 Leads (Trial)",
      campaignsLimit: 1,
      dailyEmailLimit: 50,
      emailsLabel: "50 / day",
      activeAgentsCount: 2,
      skuLimit: 25,
      posRegistersLimit: 0,
      warehouseDepotsLimit: 1,
      byokAllowed: false,
    },
    takeRates: {
      directCheckoutPct: 2.5,
      escrowCheckoutPct: 3.5,
      posCounterPct: 0,
    },
    shopSubModules: {
      store: true,
      catalog: true,
      services: true,
      orders: true,
      pos: false,
      inventory: false,
      referrals: false,
    },
    erpModules: {
      overview: true,
      crm: false,
      sales_closer: false,
      employee: false,
      manager: false,
      users: false,
      shop: true,
      accounting: false,
      hr: false,
      md: false,
      dispatch: false,
      ai: false,
      workforce: false,
      client: false,
      mobility: false,
      marketplace: false,
    },
    highlights: [
      "1 Vertical Storefront (up to 25 SKUs)",
      "Service & Appointment Booking Engine",
      "100 Enriched Lead Credits",
      "2.5% Direct / 3.5% Escrow Checkout Rate",
    ],
    ctaLabel: "Start 14-Day Free Trial",
  },

  STARTER: {
    key: "STARTER",
    name: "Starter",
    tag: "Commerce & Booking",
    description: "For solo merchants, creators, and service professionals launching their digital storefront.",
    monthlyPriceNGN: 25000,
    annualPriceNGN: 250000,
    formattedMonthly: "₦25,000",
    formattedAnnual: "₦250,000",
    usdEquivalentMonthly: "~$16/mo",
    seatsIncluded: 2,
    extraSeatPriceNGN: 6000,
    dbIsolation: "Pooled Tenant Schema",
    domainEntitlement: "slug.ofia.shop + slug.ofia.ng",
    quotas: {
      leadsLimit: 500,
      leadsLabel: "500 Enriched Leads / mo",
      campaignsLimit: 3,
      dailyEmailLimit: 200,
      emailsLabel: "200 Emails / day",
      activeAgentsCount: 4,
      skuLimit: 100,
      posRegistersLimit: 0,
      warehouseDepotsLimit: 1,
      byokAllowed: false,
    },
    takeRates: {
      directCheckoutPct: 2.0,
      escrowCheckoutPct: 3.0,
      posCounterPct: 0,
    },
    shopSubModules: {
      store: true,
      catalog: true,
      services: true,
      orders: true,
      pos: false,
      inventory: false,
      referrals: false,
    },
    erpModules: {
      overview: true,
      crm: false,
      sales_closer: false,
      employee: true,
      manager: false,
      users: true,
      shop: true,
      accounting: false,
      hr: false,
      md: false,
      dispatch: false,
      ai: false,
      workforce: false,
      client: false,
      mobility: false,
      marketplace: false,
    },
    highlights: [
      "Branded Vertical Storefront (up to 100 SKUs)",
      "Service & Appointment Booking Calendar",
      "Order Fulfillment & Escrow Earnings Wallet",
      "2 Team Seats • 500 Leads/mo • 200 Emails/day",
      "2.0% Direct / 3.0% Escrow Take-Rate",
    ],
    ctaLabel: "Start with Starter",
  },

  GROWTH: {
    key: "GROWTH",
    name: "Growth",
    tag: "Most Popular",
    popular: true,
    description: "For growing retailers, clinics, salons, and B2B teams scaling with POS, IMS, and CRM.",
    monthlyPriceNGN: 75000,
    annualPriceNGN: 750000,
    formattedMonthly: "₦75,000",
    formattedAnnual: "₦750,000",
    usdEquivalentMonthly: "~$48/mo",
    seatsIncluded: 10,
    extraSeatPriceNGN: 5000,
    dbIsolation: "Dedicated Neon Branch DB",
    domainEntitlement: "Custom Domain CNAME + Brand Theme",
    quotas: {
      leadsLimit: 2500,
      leadsLabel: "2,500 Enriched Leads / mo",
      campaignsLimit: 10,
      dailyEmailLimit: 500,
      emailsLabel: "500 Emails / day",
      activeAgentsCount: 8,
      skuLimit: "Unlimited",
      posRegistersLimit: 2,
      warehouseDepotsLimit: 1,
      byokAllowed: false,
    },
    takeRates: {
      directCheckoutPct: 1.5,
      escrowCheckoutPct: 2.5,
      posCounterPct: 0,
    },
    shopSubModules: {
      store: true,
      catalog: true,
      services: true,
      orders: true,
      pos: true,
      inventory: true,
      referrals: false,
    },
    erpModules: {
      overview: true,
      crm: true,
      sales_closer: true,
      employee: true,
      manager: true,
      users: true,
      shop: true,
      accounting: false,
      hr: false,
      md: false,
      dispatch: false,
      ai: true,
      workforce: false,
      client: false,
      mobility: false,
      marketplace: false,
    },
    highlights: [
      "Everything in Starter + Unlimited SKUs & Custom Domain",
      "POS Cash Registers (2 Terminals, 0% POS Fee) & 1 Warehouse IMS",
      "Full B2B CRM, Quotations, Email Blasts & Sales Closer Portal",
      "10 Team Seats • 2,500 Leads/mo • 8 AI GTM Agents",
      "1.5% Direct / 2.5% Escrow Take-Rate",
    ],
    ctaLabel: "Activate Growth Plan",
  },

  SCALE: {
    key: "SCALE",
    name: "Scale",
    tag: "Full ERP & Multi-Branch",
    description: "For multi-branch retailers, schools, logistics operators, and mid-market enterprises.",
    monthlyPriceNGN: 200000,
    annualPriceNGN: 2000000,
    formattedMonthly: "₦200,000",
    formattedAnnual: "₦2,000,000",
    usdEquivalentMonthly: "~$125/mo",
    seatsIncluded: 30,
    extraSeatPriceNGN: 4000,
    dbIsolation: "Dedicated Neon DB + PITR Backups",
    domainEntitlement: "Multi-Subdomain + Custom Login Hero",
    quotas: {
      leadsLimit: 10000,
      leadsLabel: "10,000 Enriched Leads / mo",
      campaignsLimit: 25,
      dailyEmailLimit: 2500,
      emailsLabel: "2,500 Emails / day",
      activeAgentsCount: 15,
      skuLimit: "Unlimited",
      posRegistersLimit: 10,
      warehouseDepotsLimit: 5,
      byokAllowed: true,
    },
    takeRates: {
      directCheckoutPct: 1.0,
      escrowCheckoutPct: 2.0,
      posCounterPct: 0,
    },
    shopSubModules: {
      store: true,
      catalog: true,
      services: true,
      orders: true,
      pos: true,
      inventory: true,
      referrals: true,
    },
    erpModules: {
      overview: true,
      crm: true,
      sales_closer: true,
      employee: true,
      manager: true,
      users: true,
      shop: true,
      accounting: true,
      hr: true,
      md: true,
      dispatch: true,
      ai: true,
      workforce: false,
      client: false,
      mobility: false,
      marketplace: false,
    },
    highlights: [
      "Everything in Growth + Up to 5 Warehouse Depots & 10 POS Terminals",
      "Double-Entry General Ledger, Payroll & FIRS 7.5% VAT Accounting",
      "HR 360 Appraisals, OKR Banks, Team Quests & MD Executive Cockpit",
      "Ofia Dispatch Manager + Viral Referral & Affiliate Engine",
      "30 Team Seats • 10,000 Leads/mo • All 15 AI Swarm Agents",
      "1.0% Direct / 2.0% Escrow Take-Rate",
    ],
    ctaLabel: "Upgrade to Scale",
  },

  ENTERPRISE: {
    key: "ENTERPRISE",
    name: "Enterprise",
    tag: "Sovereign & Custom SLA",
    description: "Full-spectrum autonomous enterprise suite with Mobility, Workforce OS, and isolated DB.",
    monthlyPriceNGN: 650000,
    annualPriceNGN: 6500000,
    formattedMonthly: "From ₦650,000",
    formattedAnnual: "From ₦6,500,000",
    usdEquivalentMonthly: "~$400+/mo",
    seatsIncluded: "Unlimited",
    dbIsolation: "Isolated Sovereign Postgres DB",
    domainEntitlement: "Full White-Label & Custom DNS",
    quotas: {
      leadsLimit: 50000,
      leadsLabel: "50,000+ Leads / mo",
      campaignsLimit: 100,
      dailyEmailLimit: 10000,
      emailsLabel: "Dedicated Sending IP",
      activeAgentsCount: 15,
      skuLimit: "Unlimited",
      posRegistersLimit: "Unlimited",
      warehouseDepotsLimit: "Unlimited",
      byokAllowed: true,
    },
    takeRates: {
      directCheckoutPct: 0.5,
      escrowCheckoutPct: 1.5,
      posCounterPct: 0,
    },
    shopSubModules: {
      store: true,
      catalog: true,
      services: true,
      orders: true,
      pos: true,
      inventory: true,
      referrals: true,
    },
    erpModules: {
      overview: true,
      crm: true,
      sales_closer: true,
      employee: true,
      manager: true,
      users: true,
      shop: true,
      accounting: true,
      hr: true,
      md: true,
      dispatch: true,
      ai: true,
      workforce: true,
      client: true,
      mobility: true,
      marketplace: true,
    },
    highlights: [
      "All 14 ERP Modules + Unlimited POS, Warehouses & Staff Seats",
      "Includes Ofia Mobility Fleet Suite & Workforce Outsourcing OS",
      "Multi-Merchant Marketplace Manager & Corporate Client Portal",
      "Isolated Custom Database + BYOK AI Keys (OpenAI, Claude, Voicebip)",
      "0.5% Direct / 1.5% Escrow Take-Rate + Dedicated Account Manager",
    ],
    ctaLabel: "Talk to Enterprise Sales",
  },
};

export const PUBLIC_PRICING_PLANS: PlanTierDefinition[] = [
  PLAN_TIERS.STARTER,
  PLAN_TIERS.GROWTH,
  PLAN_TIERS.SCALE,
  PLAN_TIERS.ENTERPRISE,
];

export const MODULE_ADDONS: ModuleAddonDefinition[] = [
  {
    key: "mobility_suite",
    name: "Ofia Mobility & Fleet Suite",
    moduleKeys: ["mobility"],
    monthlyPriceNGN: 75000,
    formattedPrice: "+₦75,000 / mo",
    badge: "Mobility",
    includedFromTier: "ENTERPRISE",
    description:
      "12-tab Fleet Telemetry, Vehicle Registry, Driver Rosters, Maintenance Compliance, Campus Shuttles, Interstate Line-Haul, Car Hire, and Staff Commute.",
    overageNote: "Includes 10 vehicles (+₦3,500/extra vehicle/mo)",
  },
  {
    key: "workforce_os",
    name: "Ofia Workforce & Outsourcing OS",
    moduleKeys: ["workforce", "client"],
    monthlyPriceNGN: 60000,
    formattedPrice: "+₦60,000 / mo",
    badge: "Workforce OS",
    includedFromTier: "ENTERPRISE",
    description:
      "Recruitment pipelines, Academy LMS, cryptographic certificate verification, GPS attendance, competency matrices, and Corporate Client Stakeholder Portal.",
    overageNote: "Includes unlimited client stakeholder logins",
  },
  {
    key: "dispatch_control",
    name: "Ofia Dispatch & Courier Control",
    moduleKeys: ["dispatch"],
    monthlyPriceNGN: 35000,
    formattedPrice: "+₦35,000 / mo",
    badge: "Logistics",
    includedFromTier: "SCALE",
    description:
      "Zonal courier routing, 4x6 QR waybill generator, rider allocation console, and live parcel OTP tracking.",
    overageNote: "Included free on Scale & Enterprise tiers",
  },
  {
    key: "ai_voice_telephony",
    name: "Ofia AI Voice Agent & Telephony",
    moduleKeys: ["ai"],
    monthlyPriceNGN: 50000,
    formattedPrice: "+₦50,000 / mo",
    badge: "Voice AI",
    includedFromTier: "ENTERPRISE",
    description:
      "Autonomous AI phone caller with Nigerian PSTN/SIP (+234 Voicebip), call transcripts, and unsupervised WhatsApp auto-dialogue.",
    overageNote: "Includes 250 AI voice mins (+₦120/min or BYOK SIP)",
  },
];

/**
 * Normalizes any raw plan tier string (e.g. "Growth", "GROWTH", "Enterprise", "PRO")
 * into a canonical PlanTierKey.
 */
export function normalizePlanTier(rawTier?: string | null): PlanTierKey {
  const clean = (rawTier || "").toUpperCase().trim();
  if (clean === "FREE_TRIAL" || clean === "FREE" || clean === "TRIAL") return "FREE_TRIAL";
  if (clean === "STARTER" || clean === "BASIC") return "STARTER";
  if (clean === "GROWTH" || clean === "BUSINESS") return "GROWTH";
  if (clean === "SCALE" || clean === "PRO") return "SCALE";
  if (clean === "ENTERPRISE" || clean === "CUSTOM") return "ENTERPRISE";
  return "GROWTH";
}

/**
 * Returns the default module provisioning flags for a given plan tier.
 */
export function getDefaultProvisioningForPlan(rawTier?: string | null) {
  const tierKey = normalizePlanTier(rawTier);
  const plan = PLAN_TIERS[tierKey];
  return {
    planTier: tierKey,
    shopSubModules: { ...plan.shopSubModules },
    erpModules: { ...plan.erpModules },
    quotas: { ...plan.quotas },
    takeRates: { ...plan.takeRates },
  };
}

/**
 * Returns the applicable platform commission percentage (e.g. 0.015 for 1.5%)
 * based on the tenant's plan tier, whether Escrow protection is enabled, and the sales channel.
 */
export function getCommissionRate(
  rawTier?: string | null,
  isEscrow: boolean = false,
  channel?: string | null
): number {
  const normChannel = (channel || "STOREFRONT").toUpperCase().trim();
  // In-store POS counter transactions have 0% platform commission
  if (normChannel === "POS_COUNTER" || normChannel === "POS") {
    return 0;
  }

  const tierKey = normalizePlanTier(rawTier);
  const plan = PLAN_TIERS[tierKey];
  const pct = isEscrow ? plan.takeRates.escrowCheckoutPct : plan.takeRates.directCheckoutPct;
  return pct / 100;
}

/**
 * Calculates the platformFee and merchantAmount split for an order or booking.
 */
export function calculatePlatformFeeSplit(
  rawAmount: number,
  options?: {
    planTier?: string | null;
    isEscrow?: boolean;
    channel?: string | null;
    overridePlatformFee?: number;
    overrideMerchantAmount?: number;
  }
): {
  platformFee: number;
  merchantAmount: number;
  commissionRatePct: number;
  planTier: PlanTierKey;
} {
  const cleanAmount = Math.max(0, Number(rawAmount) || 0);
  const planTier = normalizePlanTier(options?.planTier);
  const isEscrow = Boolean(options?.isEscrow);
  const rate = getCommissionRate(planTier, isEscrow, options?.channel);

  const platformFee =
    options?.overridePlatformFee !== undefined
      ? options.overridePlatformFee
      : Math.round(cleanAmount * rate * 100) / 100;

  const merchantAmount =
    options?.overrideMerchantAmount !== undefined
      ? options.overrideMerchantAmount
      : Math.max(0, Math.round((cleanAmount - platformFee) * 100) / 100);

  return {
    platformFee,
    merchantAmount,
    commissionRatePct: Math.round(rate * 10000) / 100,
    planTier,
  };
}
