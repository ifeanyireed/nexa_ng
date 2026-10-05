export interface User {
  id: string;
  email: string;
  name: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  sex?: string;
  account_status: 'unverified' | 'active' | 'suspended' | 'deactivated';
  mfa_enabled?: boolean;
  created_at: string;
}

export interface School {
  id: string;
  type?: string;
  name: string;
  slug: string;
  school_code?: string;
  short_name?: string;
  motto?: string;
  logo_url?: string;
  logo_emoji?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  payment_mode?: string;
  platform_fee_percent?: number;
  dva_account_number?: string;
  paystack_public_key?: string;
  paystack_secret_key?: string;

  contact_email?: string;
  contact_phone?: string;
  contact_person_name?: string;
  full_address?: string;
  state?: string;
  lga?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  verification_status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
  subscription_tier: 'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE';
  subscription_expires_at?: string;
  referred_by_agent_id?: string;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthly_price: number;
  annual_price: number;
  currency: string;
  max_students: number;
  max_teachers: number;
  max_results_per_term: number;
  storage_gb: number;
  features: string;
  is_active: boolean;
}

export interface Invoice {
  id: string;
  school_id: string;
  plan_id: string;
  plan_name: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  billing_cycle: string;
  due_date: string;
  paid_at?: string;
  created_at: string;
}

export interface AgentPortfolio {
  agent_id: string;
  agent_name: string;
  default_rate: number;
  total_referred_schools: number;
  total_earned: number;
  total_pending_payout: number;
  schools: School[];
}

export interface PayoutRequest {
  id: string;
  agent_id: string;
  agent_name?: string;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'REJECTED';
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  created_at: string;
}

export interface ScratchCardBatch {
  id: string;
  batch_number: string;
  school_id?: string;
  school_name?: string;
  total_cards: number;
  used_cards: number;
  unit_cost: number;
  total_cost: number;
  status: 'GENERATED' | 'ASSIGNED' | 'COMPLETED';
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: { full_name?: string } | string;
  category: string;
  category_id?: string;
  status: 'DRAFT' | 'PUBLISHED';
  published_at?: string;
  created_at: string;
}

export interface SuiteStats {
  totalUsers: number;
  totalSchools: number;
  verifiedSchools: number;
  pendingVerifications: number;
  activeSubscriptions: number;
  totalRevenue: number;
  activeAgents: number;
  cbtExamsCount: number;
  activeTutors: number;
  supportTicketsPending?: number;
  salesAnalytics?: { day: string; percentage: number; status: string; tooltip: string }[];
}
