export type PlanTierKey =
  | "FREE_TRIAL"
  | "STARTER"
  | "GROWTH"
  | "SCALE"
  | "ENTERPRISE";

export interface PlanTakeRates {
  directCheckoutPct: number;
  escrowCheckoutPct: number;
  posCounterPct: number;
}

export const PLAN_TAKE_RATES: Record<PlanTierKey, PlanTakeRates> = {
  FREE_TRIAL: {
    directCheckoutPct: 2.5,
    escrowCheckoutPct: 3.5,
    posCounterPct: 0,
  },
  STARTER: {
    directCheckoutPct: 2.0,
    escrowCheckoutPct: 3.0,
    posCounterPct: 0,
  },
  GROWTH: {
    directCheckoutPct: 1.5,
    escrowCheckoutPct: 2.5,
    posCounterPct: 0,
  },
  SCALE: {
    directCheckoutPct: 1.0,
    escrowCheckoutPct: 2.0,
    posCounterPct: 0,
  },
  ENTERPRISE: {
    directCheckoutPct: 0.5,
    escrowCheckoutPct: 1.5,
    posCounterPct: 0,
  },
};

export function normalizePlanTier(rawTier?: string | null): PlanTierKey {
  const clean = (rawTier || "").toUpperCase().trim();
  if (clean === "FREE_TRIAL" || clean === "FREE" || clean === "TRIAL") return "FREE_TRIAL";
  if (clean === "STARTER" || clean === "BASIC") return "STARTER";
  if (clean === "GROWTH" || clean === "BUSINESS") return "GROWTH";
  if (clean === "SCALE" || clean === "PRO") return "SCALE";
  if (clean === "ENTERPRISE" || clean === "CUSTOM") return "ENTERPRISE";
  return "GROWTH";
}

export function getCommissionRate(
  rawTier?: string | null,
  isEscrow: boolean = false,
  channel?: string | null
): number {
  const normChannel = (channel || "STOREFRONT").toUpperCase().trim();
  if (normChannel === "POS_COUNTER" || normChannel === "POS") {
    return 0;
  }

  const tierKey = normalizePlanTier(rawTier);
  const rates = PLAN_TAKE_RATES[tierKey];
  const pct = isEscrow ? rates.escrowCheckoutPct : rates.directCheckoutPct;
  return pct / 100;
}

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
