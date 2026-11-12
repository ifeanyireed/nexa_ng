export type PlanTierKey =
  | "FREE_TRIAL"
  | "STARTER"
  | "GROWTH"
  | "SCALE"
  | "ENTERPRISE";

export interface LandingPricingPlan {
  id: string;
  key: PlanTierKey;
  name: string;
  badge: string;
  badgeVariant: "emerald" | "brand" | "purple" | "amber";
  monthlyPrice: number;
  annualPricePerMonth: number;
  annualBilledTotal: number;
  usdEquivalentMonthly: string;
  seatsIncluded: string;
  directCheckoutPct: number;
  escrowCheckoutPct: number;
  posCounterPct: number;
  note: string;
  features: string[];
  cta: string;
  ctaHref: string;
  popular: boolean;
}

export interface LandingModuleAddon {
  key: string;
  name: string;
  badge: string;
  badgeVariant: "emerald" | "brand" | "purple" | "amber";
  monthlyPriceNGN: number;
  formattedPrice: string;
  includedFromTier: string;
  description: string;
  overageNote: string;
}

export const LANDING_PRICING_PLANS: LandingPricingPlan[] = [
  {
    id: "starter",
    key: "STARTER",
    name: "Starter",
    badge: "Commerce & Booking",
    badgeVariant: "emerald",
    monthlyPrice: 25000,
    annualPricePerMonth: 20833,
    annualBilledTotal: 250000,
    usdEquivalentMonthly: "~$16/mo",
    seatsIncluded: "2 Seats",
    directCheckoutPct: 2.0,
    escrowCheckoutPct: 3.0,
    posCounterPct: 0,
    note: "For solo merchants, creators, and service pros launching their branded digital storefront.",
    features: [
      "Branded Vertical Storefront (slug.ofia.shop + up to 100 SKUs)",
      "Service & Appointment Booking Calendar",
      "Order Fulfillment & Escrow Earnings Wallet",
      "Basic Contact List & 500 Enriched Leads / mo",
      "200 Outbound Emails / day & 4 AI Agents",
      "2 Team Seats (+₦6,000/extra seat)",
      "2.0% Direct / 3.0% Protected Escrow Take-Rate",
    ],
    cta: "Start 14-Day Free Trial",
    ctaHref: "/onboarding?plan=STARTER",
    popular: false,
  },
  {
    id: "growth",
    key: "GROWTH",
    name: "Growth",
    badge: "Most Popular",
    badgeVariant: "brand",
    monthlyPrice: 75000,
    annualPricePerMonth: 62500,
    annualBilledTotal: 750000,
    usdEquivalentMonthly: "~$48/mo",
    seatsIncluded: "10 Seats",
    directCheckoutPct: 1.5,
    escrowCheckoutPct: 2.5,
    posCounterPct: 0,
    note: "For growing retailers, clinics, salons, and B2B sales teams scaling with POS, IMS, and CRM.",
    features: [
      "Everything in Starter + Unlimited SKUs & Custom Domain CNAME",
      "POS Cash Registers (Up to 2 Terminals, 0% POS Fee)",
      "1 Warehouse Inventory (IMS) Depot & Barcode Scanning",
      "Full B2B CRM, Quotations, Email Blasts & Sales Closer Portal",
      "2,500 Enriched Leads / mo • 500 Emails / day • 8 AI Agents",
      "Dedicated Neon Branch DB & 10 Team Seats (+₦5,000/seat)",
      "1.5% Direct / 2.5% Protected Escrow Take-Rate",
    ],
    cta: "Activate Growth Plan",
    ctaHref: "/onboarding?plan=GROWTH",
    popular: true,
  },
  {
    id: "scale",
    key: "SCALE",
    name: "Scale",
    badge: "Full ERP & Multi-Branch",
    badgeVariant: "purple",
    monthlyPrice: 200000,
    annualPricePerMonth: 166667,
    annualBilledTotal: 2000000,
    usdEquivalentMonthly: "~$125/mo",
    seatsIncluded: "30 Seats",
    directCheckoutPct: 1.0,
    escrowCheckoutPct: 2.0,
    posCounterPct: 0,
    note: "Complete ERP horsepower for multi-branch retailers, schools, logistics operators, and mid-market firms.",
    features: [
      "Everything in Growth + Up to 5 Warehouses (GRNs) & 10 POS Registers",
      "Double-Entry General Ledger, Trial Balance, Payroll & FIRS 7.5% VAT",
      "HR 360 Appraisals, OKR Banks, Team Quests & MD Executive Cockpit",
      "Ofia Dispatch Manager + Viral Referral & Affiliate Engine",
      "10,000 Enriched Leads / mo • 2,500 Emails / day • All 15 AI Swarm Agents",
      "30 Team Seats (+₦4,000/seat) + Optional BYOK AI Keys",
      "1.0% Direct / 2.0% Protected Escrow Take-Rate",
    ],
    cta: "Upgrade to Scale",
    ctaHref: "/onboarding?plan=SCALE",
    popular: false,
  },
  {
    id: "enterprise",
    key: "ENTERPRISE",
    name: "Enterprise",
    badge: "Sovereign & Custom SLA",
    badgeVariant: "amber",
    monthlyPrice: 650000,
    annualPricePerMonth: 541667,
    annualBilledTotal: 6500000,
    usdEquivalentMonthly: "~$400+/mo",
    seatsIncluded: "Unlimited Seats",
    directCheckoutPct: 0.5,
    escrowCheckoutPct: 1.5,
    posCounterPct: 0,
    note: "Full-spectrum autonomous enterprise suite with Mobility Fleet, Workforce OS, and isolated database.",
    features: [
      "All 14 ERP Modules + Unlimited POS Terminals, Warehouses & Staff Seats",
      "Includes Ofia Mobility Fleet Suite & Workforce Outsourcing OS",
      "Multi-Merchant Marketplace Manager & Corporate Client Portal",
      "50,000+ Leads / mo • Dedicated Sending IP • Full White-Labeling",
      "Isolated Sovereign Postgres DB + BYOK AI Keys (OpenAI, Claude, Voicebip)",
      "Dedicated Account Manager & Custom Quarterly SLA",
      "0.5% Direct / 1.5% Protected Escrow Take-Rate",
    ],
    cta: "Talk to Enterprise Sales",
    ctaHref: "mailto:enterprise@ofia.ng?subject=Ofia%20Enterprise%20Deployment",
    popular: false,
  },
];

export const LANDING_MODULE_ADDONS: LandingModuleAddon[] = [
  {
    key: "mobility_suite",
    name: "Ofia Mobility & Fleet Suite",
    badge: "Mobility OS",
    badgeVariant: "brand",
    monthlyPriceNGN: 75000,
    formattedPrice: "+₦75,000 / mo",
    includedFromTier: "Included in Enterprise",
    description:
      "Unlocks all 12 Mobility tabs: Live Telemetry, Vehicle Registry, Driver Rosters, Maintenance Compliance, Fixed Routes, Campus Shuttles, Interstate Line-Haul, Ride-Hail, Car Hire, School Bus, and Staff Commute.",
    overageNote: "Includes 10 vehicles (+₦3,500/extra vehicle/mo)",
  },
  {
    key: "workforce_os",
    name: "Ofia Workforce & Outsourcing OS",
    badge: "Workforce OS",
    badgeVariant: "purple",
    monthlyPriceNGN: 60000,
    formattedPrice: "+₦60,000 / mo",
    includedFromTier: "Included in Enterprise",
    description:
      "Unlocks Recruitment Pipelines, Talent Academy LMS, Cryptographic Certificate Verification, GPS Attendance, Competency Matrices, Staff Deployment, and Corporate Client Stakeholder Portal (/erp/client).",
    overageNote: "Unlimited client stakeholder logins",
  },
  {
    key: "dispatch_control",
    name: "Ofia Dispatch & Courier Control",
    badge: "Logistics",
    badgeVariant: "emerald",
    monthlyPriceNGN: 35000,
    formattedPrice: "+₦35,000 / mo",
    includedFromTier: "Included in Scale & Enterprise",
    description:
      "Unlocks Zonal Dispatch Routing, 4x6 QR Waybill Generator, Rider Allocation Console, and Live Parcel OTP Tracking.",
    overageNote: "Free on Scale & Enterprise tiers",
  },
  {
    key: "ai_voice_telephony",
    name: "Ofia AI Voice Agent & Telephony",
    badge: "Voice AI",
    badgeVariant: "amber",
    monthlyPriceNGN: 50000,
    formattedPrice: "+₦50,000 / mo",
    includedFromTier: "Included in Enterprise",
    description:
      "Unlocks Autonomous AI Phone Caller (Voicebip Nigerian +234 PSTN/SIP), Call Transcripts, and Unsupervised WhatsApp Auto-Dialogue.",
    overageNote: "Includes 250 AI voice mins (+₦120/min or BYOK SIP)",
  },
];
