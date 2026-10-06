import { getDbPool, ensureTablesExist } from "./db";
import { queueMassEmailCampaign, processEmailQueueBatch } from "./email-service";

export interface CrmDeal {
  id: string;
  tenantSlug: string;
  title: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  value: string;
  stage: "LEAD" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
  owner: string;
  probability: number;
  expectedClose: string;
  notes?: string;
  createdAt: string;
}

export interface CrmLead {
  id: string;
  tenantSlug: string;
  companyName: string;
  website?: string;
  industry?: string;
  location?: string;
  contactName: string;
  contactTitle?: string;
  contactEmail: string;
  contactPhone?: string;
  icpFitScore: number;
  buyingSignals: string[];
  status: "IDENTIFIED" | "ENRICHED" | "CONTACTED" | "QUALIFIED" | "MEETING_BOOKED" | "CONVERTED" | "ARCHIVED";
  assignedRep?: string;
  source?: string;
  notes?: string;
  createdAt: string;
}

export interface CrmAccount {
  id: string;
  tenantSlug: string;
  company: string;
  industry: string;
  location: string;
  totalDeals: string;
  status: "CLIENT" | "PROSPECT" | "PARTNER";
  keyContact: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface CrmEmailList {
  id: string;
  tenantSlug: string;
  name: string;
  description: string;
  tags: string[];
  subscriberCount: number;
  createdAt: string;
}

export interface CrmEmailSubscriber {
  id: string;
  tenantSlug: string;
  listId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  phone?: string;
  status: "SUBSCRIBED" | "UNSUBSCRIBED" | "BOUNCED";
  createdAt: string;
}

export interface CrmEmailBlast {
  id: string;
  tenantSlug: string;
  listId?: string;
  listName?: string;
  title: string;
  subject: string;
  previewText?: string;
  contentHtml: string;
  senderName: string;
  senderEmail: string;
  status: "DRAFT" | "SCHEDULED" | "SENDING" | "SENT" | "CANCELLED";
  scheduledAt?: string;
  sentAt?: string;
  totalRecipients: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  createdAt: string;
}

export interface CrmActivity {
  id: string;
  tenantSlug: string;
  type: "CALL" | "EMAIL" | "DEMO" | "MEETING" | "NOTE";
  title: string;
  company: string;
  rep: string;
  dateTime: string;
  status: "UPCOMING" | "COMPLETED" | "CANCELLED";
  notes?: string;
  createdAt: string;
}

// In-memory fallback caches
const memoryDeals = new Map<string, CrmDeal[]>();
const memoryLeads = new Map<string, CrmLead[]>();
const memoryAccounts = new Map<string, CrmAccount[]>();
const memoryLists = new Map<string, CrmEmailList[]>();
const memorySubscribers = new Map<string, CrmEmailSubscriber[]>();
const memoryBlasts = new Map<string, CrmEmailBlast[]>();
const memoryActivities = new Map<string, CrmActivity[]>();

// Default seed data
export const DEFAULT_CRM_DEALS: Omit<CrmDeal, "tenantSlug">[] = [
  {
    id: "DEAL-500",
    title: "Solar Hybrid Mini-Grid Assessment",
    company: "Lekki Free Zone Development",
    contactName: "Engr. Femi Adeleke",
    email: "f.adeleke@lfz.ng",
    phone: "+2348039911223",
    value: "₦34,000,000",
    stage: "LEAD",
    owner: "Chioma Okon (Senior Account Exec)",
    probability: 25,
    expectedClose: "Dec 15, 2026",
    notes: "Initial discovery call completed. Awaiting electrical layout drawings.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "DEAL-505",
    title: "Autonomous Fleet Tracking & Fuel Telemetry",
    company: "GIG Logistics National Hub",
    contactName: "Tunde Balogun",
    email: "tunde.b@giglogistics.ng",
    phone: "+2348021144778",
    value: "₦12,500,000",
    stage: "LEAD",
    owner: "Ibrahim Musa",
    probability: 30,
    expectedClose: "Dec 01, 2026",
    notes: "Fleet director requested technical spec sheet for 50 haulage vans.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "DEAL-503",
    title: "Annual ERP & POS Multi-Branch Deployment",
    company: "Hubmart Supermarkets Nigeria",
    contactName: "Amina Bello",
    email: "amina.b@hubmart.ng",
    phone: "+2348054433221",
    value: "₦4,800,000",
    stage: "QUALIFIED",
    owner: "Chioma Okon (Senior Account Exec)",
    probability: 45,
    expectedClose: "Nov 12, 2026",
    notes: "Evaluating POS hardware bundle for 4 store locations in Ikeja & Lekki.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "DEAL-506",
    title: "School Management Cloud & Smart Cards",
    company: "Corona International Schools",
    contactName: "Adeyemi Phillips",
    email: "a.phillips@coronaschools.org",
    phone: "+2348023456789",
    value: "₦8,200,000",
    stage: "QUALIFIED",
    owner: "Emeka Okafor",
    probability: 55,
    expectedClose: "Nov 20, 2026",
    notes: "BOD presentation scheduled for cloud attendance integration.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "DEAL-502",
    title: "Enterprise 32-Channel 4K CCTV & AI Security",
    company: "Eko Atlantic Horizon Towers",
    contactName: "Engr. Nnamdi Eze",
    email: "eze@ekoatlantic.com",
    phone: "+2348029988776",
    value: "₦9,200,000",
    stage: "PROPOSAL",
    owner: "Emeka Okafor",
    probability: 60,
    expectedClose: "Nov 05, 2026",
    notes: "Site survey completed. Revised SLA submitted for fiber telemetry.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "DEAL-507",
    title: "Cold-Chain IoT Temperature Monitoring",
    company: "Ahnara Global Health Pharmacies",
    contactName: "Dr. Kunle Alabi",
    email: "k.alabi@ahnara.org",
    phone: "+2348098877665",
    value: "₦7,500,000",
    stage: "PROPOSAL",
    owner: "Ibrahim Musa",
    probability: 65,
    expectedClose: "Nov 18, 2026",
    notes: "SLA proposal sent for vaccine storage warehouse temperature monitors.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "DEAL-501",
    title: "15kVA Commercial Solar Hybrid System",
    company: "Standard Chartered Bank Victoria Island",
    contactName: "Babatunde Adeyemi",
    email: "b.adeyemi@scb.ng",
    phone: "+2348031122334",
    value: "₦18,500,000",
    stage: "NEGOTIATION",
    owner: "Chioma Okon (Senior Account Exec)",
    probability: 85,
    expectedClose: "Oct 30, 2026",
    notes: "Executive committee approved scope; finalizing commercial escrow milestone terms.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "DEAL-508",
    title: "Industrial Warehouse Inventory Automation",
    company: "Dangote Sugar Refinery Apapa",
    contactName: "Alhaji Garba Sani",
    email: "g.sani@dangote.com",
    phone: "+2348034567890",
    value: "₦26,000,000",
    stage: "NEGOTIATION",
    owner: "Chioma Okon (Senior Account Exec)",
    probability: 80,
    expectedClose: "Nov 10, 2026",
    notes: "Pricing negotiations in progress for barcode RF terminal integration.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "DEAL-504",
    title: "Cold Chain IoT Telemetry System",
    company: "Ahnara Global Health Pharmacies",
    contactName: "Dr. Kunle Alabi",
    email: "k.alabi@ahnara.org",
    phone: "+2348098877665",
    value: "₦6,400,000",
    stage: "WON",
    owner: "Ibrahim Musa",
    probability: 100,
    expectedClose: "Sep 20, 2026",
    notes: "Fully executed contract. First tranche payment received.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "DEAL-509",
    title: "Multi-Store Hardware POS Rollout",
    company: "Prince Ebeano Supermarket Lekki",
    contactName: "Chinyere Nwosu",
    email: "c.nwosu@ebeano.ng",
    phone: "+2348076543210",
    value: "₦11,200,000",
    stage: "WON",
    owner: "Emeka Okafor",
    probability: 100,
    expectedClose: "Oct 02, 2026",
    notes: "Final acceptance sign-off completed and all 8 terminals active.",
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_CRM_LEADS: Omit<CrmLead, "tenantSlug">[] = [
  {
    id: "LEAD-801",
    companyName: "Corona International Schools",
    website: "https://coronaschools.org",
    industry: "Education & K-12",
    location: "Victoria Island, Lagos",
    contactName: "Adeyemi Phillips",
    contactTitle: "Managing Director / Head of Operations",
    contactEmail: "a.phillips@coronaschools.org",
    contactPhone: "+234 802 345 6789",
    icpFitScore: 98,
    buyingSignals: ["Currently hiring Head of IT", "Campus expansion across Lekki", "Evaluating ERP"],
    status: "MEETING_BOOKED",
    assignedRep: "Chioma Okon",
    source: "Autonomous AI Lead Hunter",
    notes: "Demo call confirmed for next Tuesday 10:00 AM.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "LEAD-802",
    companyName: "Eko Atlantic Horizon Towers",
    website: "https://ekoatlantic.com",
    industry: "Real Estate & Infrastructure",
    location: "Victoria Island, Lagos",
    contactName: "Engr. Nnamdi Eze",
    contactTitle: "Facility Director",
    contactEmail: "eze@ekoatlantic.com",
    contactPhone: "+234 802 998 8776",
    icpFitScore: 94,
    buyingSignals: ["Power audit tender published", "Upgrading security perimeters"],
    status: "QUALIFIED",
    assignedRep: "Emeka Okafor",
    source: "Direct B2B Outreach",
    notes: "Key decision maker for all access control systems.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "LEAD-803",
    companyName: "Hubmart Supermarkets Ltd",
    website: "https://hubmart.ng",
    industry: "Retail & FMCG",
    location: "Ikeja, Lagos",
    contactName: "Amina Bello",
    contactTitle: "VP Procurement",
    contactEmail: "amina.b@hubmart.ng",
    contactPhone: "+234 805 443 3221",
    icpFitScore: 89,
    buyingSignals: ["Opening 2 new superstores", "Seeking automated inventory reconciliation"],
    status: "CONTACTED",
    assignedRep: "Chioma Okon",
    source: "Referral Partner",
    notes: "Introductory proposal dispatched via Resend.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "LEAD-804",
    companyName: "Trans-Niger Logistics & Haulage",
    website: "https://transniger.com",
    industry: "Transport & Supply Chain",
    location: "Port Harcourt & Lagos",
    contactName: "Chidiebere Okonkwo",
    contactTitle: "Head of Fleet Operations",
    contactEmail: "c.okonkwo@transniger.com",
    contactPhone: "+234 803 777 6655",
    icpFitScore: 91,
    buyingSignals: ["Expanding fleet by 40 trucks", "Needs fuel telemetry & waybill dispatch"],
    status: "ENRICHED",
    assignedRep: "Ibrahim Musa",
    source: "Autonomous AI Lead Hunter",
    notes: "Enriched with corporate CAC filing data and executive phone numbers.",
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_CRM_ACCOUNTS: Omit<CrmAccount, "tenantSlug">[] = [
  {
    id: "ACC-101",
    company: "Standard Chartered Bank Nigeria",
    industry: "Banking & Finance",
    location: "Victoria Island, Lagos",
    totalDeals: "₦18.5M",
    status: "CLIENT",
    keyContact: "Babatunde Adeyemi",
    email: "b.adeyemi@scb.ng",
    phone: "+2348031122334",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ACC-102",
    company: "Eko Atlantic Horizon Towers",
    industry: "Real Estate & Facility",
    location: "Eko Atlantic City, Lagos",
    totalDeals: "₦9.2M",
    status: "PROSPECT",
    keyContact: "Engr. Nnamdi Eze",
    email: "eze@ekoatlantic.com",
    phone: "+2348029988776",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ACC-103",
    company: "Hubmart Supermarkets Ltd",
    industry: "Retail & FMCG",
    location: "Ikeja, Lagos",
    totalDeals: "₦4.8M",
    status: "PROSPECT",
    keyContact: "Amina Bello",
    email: "amina.b@hubmart.ng",
    phone: "+2348054433221",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ACC-104",
    company: "Ahnara Global Health Pharmacies",
    industry: "Healthcare & Pharmaceuticals",
    location: "Garki 2, Abuja",
    totalDeals: "₦6.4M",
    status: "CLIENT",
    keyContact: "Dr. Kunle Alabi",
    email: "k.alabi@ahnara.org",
    phone: "+2348098877665",
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_CRM_LISTS: Omit<CrmEmailList, "tenantSlug">[] = [
  {
    id: "LIST-01",
    name: "VIP Nigerian Retail Merchants",
    description: "High-volume supermarket chains, multi-store boutiques, and FMCG distributors across Lagos and Abuja.",
    tags: ["Retail", "FMCG", "POS-Ready"],
    subscriberCount: 142,
    createdAt: new Date().toISOString(),
  },
  {
    id: "LIST-02",
    name: "Enterprise Facility Managers & Developers",
    description: "Commercial tower operators, estate associations, and industrial parks evaluating solar and CCTV security.",
    tags: ["Real Estate", "Commercial", "High-ACV"],
    subscriberCount: 88,
    createdAt: new Date().toISOString(),
  },
  {
    id: "LIST-03",
    name: "Fleet & Haulage Directors",
    description: "Interstate logistics operators and pharmaceutical cold-chain fleet coordinators.",
    tags: ["Logistics", "Fleet", "B2B"],
    subscriberCount: 65,
    createdAt: new Date().toISOString(),
  },
  {
    id: "LIST-04",
    name: "All Active Client Stakeholders",
    description: "Onboarded client CEOs, CTOs, and financial controllers receiving quarterly updates.",
    tags: ["Existing Clients", "Quarterly Newsletter"],
    subscriberCount: 310,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_CRM_BLASTS: Omit<CrmEmailBlast, "tenantSlug">[] = [
  {
    id: "BLAST-901",
    listId: "LIST-01",
    listName: "VIP Nigerian Retail Merchants",
    title: "Q4 Multi-Store POS & Automated Reconciliation Briefing",
    subject: "Accelerate Holiday Inventory & Multi-Branch Sales with Ofia POS",
    previewText: "Exclusive early deployment terms for premier Nigerian merchant chains.",
    contentHtml: `<h2>Upgrade Your Retail Infrastructure Ahead of Peak Season</h2><p>Dear {{contact_name}},</p><p>As retail foot traffic surges this quarter, inventory reconciliation discrepancies and checkout bottlenecks can erode your operating margins. With Ofia's unified POS and warehouse sync, every transaction reconciles instantly across all branches.</p><p><a href="https://ofia.ng/demo" style="background:#1A56DB;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Schedule 15-Minute Executive Demo</a></p>`,
    senderName: "Ofia Growth Desk",
    senderEmail: "growth@ofia.ng",
    status: "SCHEDULED",
    scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(),
    totalRecipients: 142,
    sentCount: 0,
    openCount: 0,
    clickCount: 0,
    bounceCount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    id: "BLAST-902",
    listId: "LIST-02",
    listName: "Enterprise Facility Managers & Developers",
    title: "Commercial Solar Microgrid & Backup ROI Whitepaper",
    subject: "How Victoria Island Towers Slashed Diesel OPEX by 68%",
    previewText: "Verified case study on 15kVA - 50kVA commercial solar hybrid systems.",
    contentHtml: `<h2>Commercial Energy Resiliency in Nigeria</h2><p>Dear {{contact_name}},</p><p>Explore how leading commercial towers in Victoria Island and Ikeja are stabilizing uninterrupted power while curbing diesel dependency by over 60% with smart battery telemetry.</p>`,
    senderName: "Engr. Babatunde Adeyemi",
    senderEmail: "energy@ofia.ng",
    status: "SENT",
    sentAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    totalRecipients: 88,
    sentCount: 88,
    openCount: 52,
    clickCount: 29,
    bounceCount: 1,
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_CRM_ACTIVITIES: Omit<CrmActivity, "tenantSlug">[] = [
  {
    id: "ACT-01",
    type: "CALL",
    title: "Discovery call on 15kVA Solar Hybrid financing terms",
    company: "Standard Chartered Bank VI",
    rep: "Chioma Okon",
    dateTime: "Today, 02:00 PM",
    status: "UPCOMING",
    notes: "Reviewing lease-to-own payback schedule with Head of Facilities.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ACT-02",
    type: "DEMO",
    title: "Live Product Demonstration of Multi-Store POS & ERP",
    company: "Hubmart Supermarkets",
    rep: "Chioma Okon",
    dateTime: "Tomorrow, 10:00 AM",
    status: "UPCOMING",
    notes: "Demo barcode scanning and offline cash register sync.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "ACT-03",
    type: "EMAIL",
    title: "Dispatched revised SLA & Escrow contract milestones",
    company: "Eko Atlantic Horizon Towers",
    rep: "Emeka Okafor",
    dateTime: "Yesterday, 04:30 PM",
    status: "COMPLETED",
    notes: "Sent via automated email blast engine with trackable links.",
    createdAt: new Date().toISOString(),
  },
];

// Helper to normalize tenant slug
function cleanSlug(slug: string): string {
  return (slug || "default").trim().toLowerCase();
}

// 1. DEALS
export async function getCrmDeals(tenantSlug: string): Promise<CrmDeal[]> {
  const slug = cleanSlug(tenantSlug);
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();

      // Ensure all 10 default deals across all stages exist in DB
      for (const d of DEFAULT_CRM_DEALS) {
        await pool.query(
          `INSERT INTO crm_deals (id, tenant_slug, title, company, contact_name, email, phone, value, stage, owner, probability, expected_close, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
           ON CONFLICT (id) DO NOTHING`,
          [d.id, slug, d.title, d.company, d.contactName, d.email, d.phone, d.value, d.stage, d.owner, d.probability, d.expectedClose, d.notes || ""]
        ).catch(() => {});
      }

      const res = await pool.query(
        `SELECT id, tenant_slug, title, company, contact_name, email, phone, value, stage, owner, probability, expected_close, notes, created_at
         FROM crm_deals
         WHERE LOWER(tenant_slug) = $1 OR LOWER(tenant_slug) = 'default'
         ORDER BY created_at DESC`,
        [slug]
      );
      if (res.rows.length > 0) {
        return res.rows.map((r) => ({
          id: r.id,
          tenantSlug: r.tenant_slug,
          title: r.title,
          company: r.company,
          contactName: r.contact_name,
          email: r.email,
          phone: r.phone,
          value: r.value,
          stage: r.stage,
          owner: r.owner,
          probability: Number(r.probability) || 50,
          expectedClose: r.expected_close,
          notes: r.notes,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.warn("Neon DB getCrmDeals error, falling back to cache:", err);
  }

  const cached = memoryDeals.get(slug);
  if (cached && cached.length > 0) return cached;

  const seeded = DEFAULT_CRM_DEALS.map((d) => ({ ...d, tenantSlug: slug }));
  memoryDeals.set(slug, seeded);
  return seeded;
}

export async function createCrmDeal(tenantSlug: string, deal: Partial<CrmDeal>): Promise<CrmDeal> {
  const slug = cleanSlug(tenantSlug);
  const newDeal: CrmDeal = {
    id: deal.id || `DEAL-${Date.now().toString().slice(-4)}`,
    tenantSlug: slug,
    title: deal.title || "Untitled Deal",
    company: deal.company || "Unknown Company",
    contactName: deal.contactName || "Decision Maker",
    email: deal.email || "",
    phone: deal.phone || "",
    value: deal.value || "₦0",
    stage: deal.stage || "QUALIFIED",
    owner: deal.owner || "Senior Account Exec",
    probability: deal.probability || 50,
    expectedClose: deal.expectedClose || "Next Month",
    notes: deal.notes || "",
    createdAt: new Date().toISOString(),
  };

  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      await pool.query(
        `INSERT INTO crm_deals (id, tenant_slug, title, company, contact_name, email, phone, value, stage, owner, probability, expected_close, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())`,
        [
          newDeal.id,
          slug,
          newDeal.title,
          newDeal.company,
          newDeal.contactName,
          newDeal.email,
          newDeal.phone,
          newDeal.value,
          newDeal.stage,
          newDeal.owner,
          newDeal.probability,
          newDeal.expectedClose,
          newDeal.notes,
        ]
      );
    }
  } catch (err) {
    console.warn("Neon DB createCrmDeal error, storing in memory:", err);
  }

  const list = memoryDeals.get(slug) || DEFAULT_CRM_DEALS.map((d) => ({ ...d, tenantSlug: slug }));
  list.unshift(newDeal);
  memoryDeals.set(slug, list);
  return newDeal;
}

// 2. LEADS
export async function getCrmLeads(tenantSlug: string): Promise<CrmLead[]> {
  const slug = cleanSlug(tenantSlug);
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      const res = await pool.query(
        `SELECT id, tenant_slug, company_name, website, industry, location, contact_name, contact_title, contact_email, contact_phone, icp_fit_score, buying_signals, status, assigned_rep, source, notes, created_at
         FROM crm_leads
         WHERE LOWER(tenant_slug) = $1 OR LOWER(tenant_slug) = 'default'
         ORDER BY created_at DESC`,
        [slug]
      );
      if (res.rows.length > 0) {
        return res.rows.map((r) => ({
          id: r.id,
          tenantSlug: r.tenant_slug,
          companyName: r.company_name,
          website: r.website,
          industry: r.industry,
          location: r.location,
          contactName: r.contact_name,
          contactTitle: r.contact_title,
          contactEmail: r.contact_email,
          contactPhone: r.contact_phone,
          icpFitScore: Number(r.icp_fit_score) || 85,
          buyingSignals: r.buying_signals ? (typeof r.buying_signals === "string" ? JSON.parse(r.buying_signals) : r.buying_signals) : [],
          status: r.status,
          assignedRep: r.assigned_rep,
          source: r.source,
          notes: r.notes,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.warn("Neon DB getCrmLeads error, falling back to cache:", err);
  }

  const cached = memoryLeads.get(slug);
  if (cached && cached.length > 0) return cached;

  const seeded = DEFAULT_CRM_LEADS.map((l) => ({ ...l, tenantSlug: slug }));
  memoryLeads.set(slug, seeded);
  return seeded;
}

export async function createCrmLead(tenantSlug: string, lead: Partial<CrmLead>): Promise<CrmLead> {
  const slug = cleanSlug(tenantSlug);
  const newLead: CrmLead = {
    id: lead.id || `LEAD-${Date.now().toString().slice(-4)}`,
    tenantSlug: slug,
    companyName: lead.companyName || "New Prospect Ltd",
    website: lead.website || "",
    industry: lead.industry || "General Commerce",
    location: lead.location || "Lagos, Nigeria",
    contactName: lead.contactName || "Decision Maker",
    contactTitle: lead.contactTitle || "Director",
    contactEmail: lead.contactEmail || "contact@example.ng",
    contactPhone: lead.contactPhone || "",
    icpFitScore: lead.icpFitScore || 90,
    buyingSignals: lead.buyingSignals || ["Enriched via CRM intelligence"],
    status: lead.status || "QUALIFIED",
    assignedRep: lead.assignedRep || "Growth Marketer",
    source: lead.source || "Direct Inbound",
    notes: lead.notes || "",
    createdAt: new Date().toISOString(),
  };

  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      await pool.query(
        `INSERT INTO crm_leads (id, tenant_slug, company_name, website, industry, location, contact_name, contact_title, contact_email, contact_phone, icp_fit_score, buying_signals, status, assigned_rep, source, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())`,
        [
          newLead.id,
          slug,
          newLead.companyName,
          newLead.website,
          newLead.industry,
          newLead.location,
          newLead.contactName,
          newLead.contactTitle,
          newLead.contactEmail,
          newLead.contactPhone,
          newLead.icpFitScore,
          JSON.stringify(newLead.buyingSignals),
          newLead.status,
          newLead.assignedRep,
          newLead.source,
          newLead.notes,
        ]
      );
    }
  } catch (err) {
    console.warn("Neon DB createCrmLead error, storing in memory:", err);
  }

  const list = memoryLeads.get(slug) || DEFAULT_CRM_LEADS.map((l) => ({ ...l, tenantSlug: slug }));
  list.unshift(newLead);
  memoryLeads.set(slug, list);
  return newLead;
}

// 3. EMAIL LISTS
export async function getCrmEmailLists(tenantSlug: string): Promise<CrmEmailList[]> {
  const slug = cleanSlug(tenantSlug);
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      const res = await pool.query(
        `SELECT id, tenant_slug, name, description, tags, subscriber_count, created_at
         FROM crm_email_lists
         WHERE LOWER(tenant_slug) = $1 OR LOWER(tenant_slug) = 'default'
         ORDER BY created_at DESC`,
        [slug]
      );
      if (res.rows.length > 0) {
        return res.rows.map((r) => ({
          id: r.id,
          tenantSlug: r.tenant_slug,
          name: r.name,
          description: r.description,
          tags: r.tags ? (typeof r.tags === "string" ? JSON.parse(r.tags) : r.tags) : [],
          subscriberCount: Number(r.subscriber_count) || 0,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.warn("Neon DB getCrmEmailLists error, falling back to cache:", err);
  }

  const cached = memoryLists.get(slug);
  if (cached && cached.length > 0) return cached;

  const seeded = DEFAULT_CRM_LISTS.map((l) => ({ ...l, tenantSlug: slug }));
  memoryLists.set(slug, seeded);
  return seeded;
}

export async function createCrmEmailList(tenantSlug: string, list: Partial<CrmEmailList>): Promise<CrmEmailList> {
  const slug = cleanSlug(tenantSlug);
  const newList: CrmEmailList = {
    id: list.id || `LIST-${Date.now().toString().slice(-4)}`,
    tenantSlug: slug,
    name: list.name || "Untitled Audience List",
    description: list.description || "Custom targeted audience segment.",
    tags: list.tags || ["General"],
    subscriberCount: list.subscriberCount || 0,
    createdAt: new Date().toISOString(),
  };

  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      await pool.query(
        `INSERT INTO crm_email_lists (id, tenant_slug, name, description, tags, subscriber_count, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [newList.id, slug, newList.name, newList.description, JSON.stringify(newList.tags), newList.subscriberCount]
      );
    }
  } catch (err) {
    console.warn("Neon DB createCrmEmailList error, storing in memory:", err);
  }

  const existing = memoryLists.get(slug) || DEFAULT_CRM_LISTS.map((l) => ({ ...l, tenantSlug: slug }));
  existing.unshift(newList);
  memoryLists.set(slug, existing);
  return newList;
}

// 4. EMAIL BLASTS
export async function getCrmEmailBlasts(tenantSlug: string): Promise<CrmEmailBlast[]> {
  const slug = cleanSlug(tenantSlug);
  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      const res = await pool.query(
        `SELECT b.id, b.tenant_slug, b.list_id, l.name AS list_name, b.title, b.subject, b.preview_text, b.content_html, b.sender_name, b.sender_email, b.status, b.scheduled_at, b.sent_at, b.total_recipients, b.sent_count, b.open_count, b.click_count, b.bounce_count, b.created_at
         FROM crm_email_blasts b
         LEFT JOIN crm_email_lists l ON b.list_id = l.id
         WHERE LOWER(b.tenant_slug) = $1 OR LOWER(b.tenant_slug) = 'default'
         ORDER BY b.created_at DESC`,
        [slug]
      );
      if (res.rows.length > 0) {
        return res.rows.map((r) => ({
          id: r.id,
          tenantSlug: r.tenant_slug,
          listId: r.list_id,
          listName: r.list_name || "Target Audience",
          title: r.title,
          subject: r.subject,
          previewText: r.preview_text,
          contentHtml: r.content_html,
          senderName: r.sender_name,
          senderEmail: r.sender_email,
          status: r.status,
          scheduledAt: r.scheduled_at ? new Date(r.scheduled_at).toISOString() : undefined,
          sentAt: r.sent_at ? new Date(r.sent_at).toISOString() : undefined,
          totalRecipients: Number(r.total_recipients) || 0,
          sentCount: Number(r.sent_count) || 0,
          openCount: Number(r.open_count) || 0,
          clickCount: Number(r.click_count) || 0,
          bounceCount: Number(r.bounce_count) || 0,
          createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.warn("Neon DB getCrmEmailBlasts error, falling back to cache:", err);
  }

  const cached = memoryBlasts.get(slug);
  if (cached && cached.length > 0) return cached;

  const seeded = DEFAULT_CRM_BLASTS.map((b) => ({ ...b, tenantSlug: slug }));
  memoryBlasts.set(slug, seeded);
  return seeded;
}

export async function createCrmEmailBlast(tenantSlug: string, blast: Partial<CrmEmailBlast>): Promise<CrmEmailBlast> {
  const slug = cleanSlug(tenantSlug);
  const newBlast: CrmEmailBlast = {
    id: blast.id || `BLAST-${Date.now().toString().slice(-4)}`,
    tenantSlug: slug,
    listId: blast.listId || "LIST-01",
    listName: blast.listName || "VIP Audience",
    title: blast.title || "Untitled Blast",
    subject: blast.subject || "Important Announcement",
    previewText: blast.previewText || "",
    contentHtml: blast.contentHtml || "<p>Hello {{contact_name}},</p><p>We are reaching out with an update.</p>",
    senderName: blast.senderName || "Ofia Growth Desk",
    senderEmail: blast.senderEmail || "growth@ofia.ng",
    status: blast.status || (blast.scheduledAt ? "SCHEDULED" : "DRAFT"),
    scheduledAt: blast.scheduledAt,
    sentAt: blast.sentAt,
    totalRecipients: blast.totalRecipients || 100,
    sentCount: blast.sentCount || 0,
    openCount: 0,
    clickCount: 0,
    bounceCount: 0,
    createdAt: new Date().toISOString(),
  };

  try {
    const pool = getDbPool();
    if (pool) {
      await ensureTablesExist();
      await pool.query(
        `INSERT INTO crm_email_blasts (id, tenant_slug, list_id, title, subject, preview_text, content_html, sender_name, sender_email, status, scheduled_at, sent_at, total_recipients, sent_count, open_count, click_count, bounce_count, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW())`,
        [
          newBlast.id,
          slug,
          newBlast.listId,
          newBlast.title,
          newBlast.subject,
          newBlast.previewText,
          newBlast.contentHtml,
          newBlast.senderName,
          newBlast.senderEmail,
          newBlast.status,
          newBlast.scheduledAt || null,
          newBlast.sentAt || null,
          newBlast.totalRecipients,
          newBlast.sentCount,
          newBlast.openCount,
          newBlast.clickCount,
          newBlast.bounceCount,
        ]
      );
    }
  } catch (err) {
    console.warn("Neon DB createCrmEmailBlast error, storing in memory:", err);
  }

  const existing = memoryBlasts.get(slug) || DEFAULT_CRM_BLASTS.map((b) => ({ ...b, tenantSlug: slug }));
  existing.unshift(newBlast);
  memoryBlasts.set(slug, existing);
  return newBlast;
}

// 5. ACCOUNTS & ACTIVITIES
export async function getCrmAccounts(tenantSlug: string): Promise<CrmAccount[]> {
  const slug = cleanSlug(tenantSlug);
  const cached = memoryAccounts.get(slug);
  if (cached && cached.length > 0) return cached;
  const seeded = DEFAULT_CRM_ACCOUNTS.map((a) => ({ ...a, tenantSlug: slug }));
  memoryAccounts.set(slug, seeded);
  return seeded;
}

export async function getCrmActivities(tenantSlug: string): Promise<CrmActivity[]> {
  const slug = cleanSlug(tenantSlug);
  const cached = memoryActivities.get(slug);
  if (cached && cached.length > 0) return cached;
  const seeded = DEFAULT_CRM_ACTIVITIES.map((a) => ({ ...a, tenantSlug: slug }));
  memoryActivities.set(slug, seeded);
  return seeded;
}
