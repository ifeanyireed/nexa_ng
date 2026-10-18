export interface ErpTabDef {
  id: string;
  label: string;
  path: string;
  badge?: string;
  description?: string;
}

export interface ErpPageDef {
  key: string;
  label: string;
  category: "Operations" | "Enterprise Suite" | "Portals & Team";
  description: string;
  href: string;
  iconName: string;
  badge?: string;
  tabs: ErpTabDef[];
}

export interface DepartmentAccessItem {
  id?: string;
  departmentCode: string;
  departmentName: string;
  accessiblePages: string[];
  accessibleTabs: Record<string, string[]>;
  isEnabled: boolean;
  staffCount?: number;
  head?: string;
  budget?: string;
  costCenter?: string;
}

export const ERP_PAGE_CATALOG: ErpPageDef[] = [
  {
    key: "overview",
    label: "Executive Command / Overview",
    category: "Operations",
    description: "High-level KPI executive cockpit, revenue pacing, and operations status.",
    href: "/erp/admin",
    iconName: "LayoutDashboard",
    tabs: [
      { id: "dashboard", label: "Executive Dashboard", path: "/erp/admin" }
    ],
  },
  {
    key: "ai",
    label: "Ofia AI Swarm",
    category: "Operations",
    description: "15 autonomous marketing, sales, prospecting, and operations agents.",
    href: "/erp/admin/ai",
    iconName: "Bot",
    badge: "15 AI",
    tabs: [
      { id: "command", label: "Command Center", path: "/erp/admin/ai" },
      { id: "campaigns", label: "Outreach Campaigns", path: "/erp/admin/ai/campaigns" },
      { id: "studio", label: "AI Studio", path: "/erp/admin/ai/studio" },
      { id: "strategy", label: "GTM Strategy", path: "/erp/admin/ai/strategy" },
      { id: "knowledge", label: "Knowledge Base", path: "/erp/admin/ai/knowledge" },
      { id: "analytics", label: "AI Analytics", path: "/erp/admin/ai/analytics" },
      { id: "team", label: "Agent Fleet (15 AI)", path: "/erp/admin/ai/team" },
      { id: "telegram", label: "Telegram Bot Gateway", path: "/erp/admin/ai/telegram" },
      { id: "approvals", label: "Action Approvals", path: "/erp/admin/ai/approvals" },
      { id: "integrations", label: "API Integrations", path: "/erp/admin/ai/integrations" },
      { id: "pricing", label: "BYOK & AI Key Vault", path: "/erp/admin/ai/pricing" },
      { id: "settings", label: "Agent Config & Safety", path: "/erp/admin/ai/settings" },
    ],
  },
  {
    key: "marketplace",
    label: "Marketplace Manager",
    category: "Operations",
    description: "Multi-merchant public directory, live catalog, and escrow commerce bookings.",
    href: "/erp/admin/marketplace",
    iconName: "ShoppingBag",
    badge: "PRO",
    tabs: [
      { id: "overview", label: "Storefront Overview", path: "/erp/admin/marketplace" },
      { id: "shop", label: "Merchant Products", path: "/erp/admin/marketplace/shop" },
      { id: "bookings", label: "Service Bookings", path: "/erp/admin/marketplace/bookings" },
      { id: "leads", label: "Incoming Leads", path: "/erp/admin/marketplace/leads" },
      { id: "deals", label: "Promotions & Deals", path: "/erp/admin/marketplace/deals" },
      { id: "articles", label: "Articles & Guides", path: "/erp/admin/marketplace/articles" },
      { id: "wallet", label: "Earnings Wallet", path: "/erp/admin/marketplace/wallet" },
      { id: "settings", label: "Store Settings", path: "/erp/admin/marketplace/settings" },
    ],
  },
  {
    key: "shop",
    label: "Ofia Shop Manager",
    category: "Operations",
    description: "POS cash registers, warehouse inventory (IMS), and viral customer rewards.",
    href: "/erp/admin/shop",
    iconName: "Store",
    badge: "Retail",
    tabs: [
      { id: "overview", label: "Retail Overview", path: "/erp/admin/shop" },
      { id: "pos", label: "POS Cash Registers", path: "/erp/admin/shop/pos" },
      { id: "inventory", label: "Warehouse Inventory (IMS)", path: "/erp/admin/shop/inventory" },
      { id: "catalog", label: "Products Catalog", path: "/erp/admin/shop/catalog" },
      { id: "services", label: "Services Menu", path: "/erp/admin/shop/services" },
      { id: "orders", label: "Orders Fulfillment", path: "/erp/admin/shop/orders" },
      { id: "store", label: "Online Storefront", path: "/erp/admin/shop/store" },
      { id: "referrals", label: "Customer Referral Engine", path: "/erp/admin/shop/referrals" },
    ],
  },
  {
    key: "mobility",
    label: "Ofia Mobility Manager",
    category: "Operations",
    description: "Fleet tracking, telemetry, transport services, driver rosters, and vehicle ROI.",
    href: "/erp/admin/mobility",
    iconName: "Car",
    badge: "Mobility",
    tabs: [
      { id: "command", label: "Live Telemetry & Fleet", path: "/erp/admin/mobility" },
      { id: "vehicles", label: "Vehicle Registry", path: "/erp/admin/mobility/vehicles" },
      { id: "drivers", label: "Driver Rosters", path: "/erp/admin/mobility/drivers" },
      { id: "maintenance", label: "Service & Maintenance", path: "/erp/admin/mobility/maintenance" },
      { id: "routes", label: "Fixed Routes & Terminals", path: "/erp/admin/mobility/routes" },
      { id: "pricing", label: "Tariffs & Pricing", path: "/erp/admin/mobility/pricing" },
      { id: "shuttle", label: "Zonal Campus Shuttles", path: "/erp/admin/mobility/shuttle" },
      { id: "interstate", label: "Interstate Line-Haul", path: "/erp/admin/mobility/interstate" },
      { id: "on-demand", label: "On-Demand Ride Hail", path: "/erp/admin/mobility/on-demand" },
      { id: "rental", label: "Car Hire & Charters", path: "/erp/admin/mobility/rental" },
      { id: "school", label: "School Bus Transport", path: "/erp/admin/mobility/school" },
      { id: "staff", label: "Corporate Staff Commute", path: "/erp/admin/mobility/staff" },
    ],
  },
  {
    key: "mobility_ops",
    label: "Mobility Operations Console",
    category: "Portals & Team",
    description: "Real-time dispatch, vehicle telemetry, active trip queue, driver rosters, and manifests.",
    href: "/erp/ops/mobility",
    iconName: "Navigation",
    badge: "Live",
    tabs: [
      { id: "console", label: "Dispatcher Live Console", path: "/erp/ops/mobility" },
      { id: "drivers", label: "Active Drivers Map", path: "/erp/ops/mobility" },
      { id: "vehicles", label: "Vehicle Status", path: "/erp/ops/mobility" },
      { id: "shuttle", label: "Shuttle Dispatches", path: "/erp/ops/mobility" },
      { id: "interstate", label: "Interstate Waybills", path: "/erp/ops/mobility" },
      { id: "on-demand", label: "Ride Requests", path: "/erp/ops/mobility" },
      { id: "rental", label: "Rentals Tracker", path: "/erp/ops/mobility" },
      { id: "school", label: "School Bus Logs", path: "/erp/ops/mobility" },
      { id: "staff", label: "Staff Shuttles", path: "/erp/ops/mobility" },
    ],
  },
  {
    key: "dispatch",
    label: "Ofia Dispatch Manager",
    category: "Operations",
    description: "Operational control center for dispatch agents, waybill tracking, and rider allocation.",
    href: "/erp/admin/dispatch",
    iconName: "Truck",
    badge: "Admin",
    tabs: [
      { id: "command", label: "Waybill & Parcel Center", path: "/erp/admin/dispatch" },
      { id: "operator", label: "Operator Console", path: "/erp/admin/dispatch?tab=queue" },
    ],
  },
  {
    key: "crm",
    label: "CRM & Email Marketing",
    category: "Enterprise Suite",
    description: "B2B client pipelines, email blasts, contact lists, and automated lead scoring.",
    href: "/erp/admin/crm",
    iconName: "Send",
    badge: "CRM",
    tabs: [
      { id: "command", label: "CRM Overview", path: "/erp/admin/crm" },
      { id: "lists", label: "Contact Lists", path: "/erp/admin/crm/lists" },
      { id: "blasts", label: "Email Blasts", path: "/erp/admin/crm/blasts" },
      { id: "leads", label: "Lead Pipeline", path: "/erp/admin/crm/leads" },
      { id: "activities", label: "Sales Activities", path: "/erp/admin/crm/activities" },
      { id: "pipeline", label: "Deals Stages", path: "/erp/admin/crm/pipeline" },
      { id: "contacts", label: "Contacts Directory", path: "/erp/admin/crm/contacts" },
    ],
  },
  {
    key: "sales_closer",
    label: "Sales Closer Portal",
    category: "Portals & Team",
    description: "Dedicated pipeline for assigned leads directory, sales outreach, calls, demos, and closing activities.",
    href: "/erp/ops/crm",
    iconName: "Target",
    badge: "Closer",
    tabs: [
      { id: "leads", label: "My Assigned Leads", path: "/erp/ops/crm" },
      { id: "activities", label: "My Sales Activities", path: "/erp/ops/crm" },
    ],
  },
  {
    key: "accounting",
    label: "Accounting & Ledgers",
    category: "Enterprise Suite",
    description: "General ledger, charts of accounts, trial balance, and FIRS 7.5% VAT remittances.",
    href: "/erp/accountant",
    iconName: "Layers",
    badge: "GL",
    tabs: [
      { id: "overview", label: "Finance Overview", path: "/erp/accountant" },
      { id: "coa", label: "Chart of Accounts", path: "/erp/accountant/coa" },
      { id: "invoices", label: "Invoices & Billing", path: "/erp/accountant/invoices" },
      { id: "expenses", label: "Expenses", path: "/erp/accountant/expenses" },
      { id: "trial-balance", label: "Trial Balance", path: "/erp/accountant/trial-balance" },
      { id: "income-statement", label: "Income Statement", path: "/erp/accountant/income-statement" },
      { id: "financial-position", label: "Financial Position", path: "/erp/accountant/financial-position" },
      { id: "banking", label: "Banking Feeds", path: "/erp/accountant/banking" },
      { id: "reconcile", label: "Reconciliation", path: "/erp/accountant/reconcile" },
      { id: "payroll", label: "Salaries / Payroll", path: "/erp/accountant/employee-salaries" },
      { id: "tax", label: "FIRS Tax / Remittances", path: "/erp/accountant/statutory-remittances" },
      { id: "audit-trail", label: "Audit Trail", path: "/erp/accountant/audit-trail" },
    ],
  },
  {
    key: "hr",
    label: "HR & Appraisals",
    category: "Enterprise Suite",
    description: "Performance review cycles, OKR objectives banks, calibrations, and quests.",
    href: "/erp/hr",
    iconName: "Users",
    tabs: [
      { id: "overview", label: "Appraisal Overview", path: "/erp/hr" },
      { id: "users", label: "Staff Directory", path: "/erp/hr/users" },
      { id: "objectives", label: "Objective Banks", path: "/erp/hr/objectives" },
      { id: "cycle", label: "Appraisal Cycles", path: "/erp/hr/cycle" },
      { id: "reports", label: "Reports & Ranking", path: "/erp/hr/reports" },
      { id: "quests", label: "Team Quests", path: "/erp/hr/quests" },
    ],
  },
  {
    key: "users",
    label: "User & Staff Governance",
    category: "Enterprise Suite",
    description: "Corporate staff directory, departmental hierarchies, and mass staff notifications.",
    href: "/erp/admin/users",
    iconName: "UserCheck",
    badge: "Staff",
    tabs: [
      { id: "users", label: "Staff Directory", path: "/erp/admin/users" },
      { id: "departments", label: "Department Hierarchy", path: "/erp/admin/departments" },
      { id: "mass-messaging", label: "Mass Messaging", path: "/erp/admin/users/mass-messaging" },
    ],
  },
  {
    key: "employee",
    label: "Employee Workspace Portal",
    category: "Portals & Team",
    description: "Staff self-service, personal performance reviews, quests, and career profile.",
    href: "/erp/employee",
    iconName: "UserCheck",
    tabs: [
      { id: "overview", label: "My Overview", path: "/erp/employee" },
      { id: "reviews", label: "Performance Reviews", path: "/erp/employee/reviews" },
      { id: "quests", label: "Team Quests", path: "/erp/employee/quests" },
      { id: "profile", label: "My Profile & Growth", path: "/erp/employee/profile" },
    ],
  },
  {
    key: "manager",
    label: "Line Manager Portal",
    category: "Portals & Team",
    description: "Supervisor subordinate review calibrations, scoring validations, and notes.",
    href: "/erp/manager",
    iconName: "Sliders",
    tabs: [
      { id: "overview", label: "Manager Overview", path: "/erp/manager" },
      { id: "reviews", label: "Team Reviews", path: "/erp/manager/reviews" },
      { id: "employee", label: "Self-Service View", path: "/erp/employee" },
    ],
  },
  {
    key: "md",
    label: "Executive Directorate (MD)",
    category: "Portals & Team",
    description: "Enterprise rankings, departmental deep dive, and executive audit.",
    href: "/erp/md",
    iconName: "TrendingUp",
    tabs: [
      { id: "cockpit", label: "Executive Cockpit", path: "/erp/md" },
      { id: "department", label: "Department Details", path: "/erp/md/department/detail" },
      { id: "employee", label: "Self-Service View", path: "/erp/employee" },
    ],
  },
];

export const DEFAULT_DEPARTMENT_ACCESS: DepartmentAccessItem[] = [
  {
    departmentCode: "DEPT-FIN",
    departmentName: "Finance & Accounts",
    accessiblePages: ["accounting", "shop", "employee"],
    accessibleTabs: {
      accounting: ["overview", "coa", "invoices", "expenses", "trial-balance", "income-statement", "financial-position", "banking", "reconcile", "payroll", "tax", "audit-trail"],
      shop: ["overview", "orders", "inventory", "pos"],
      employee: ["overview", "reviews", "quests", "profile"],
    },
    isEnabled: true,
  },
  {
    departmentCode: "DEPT-FLT",
    departmentName: "Fleet Operations & Maintenance",
    accessiblePages: ["mobility", "mobility_ops", "dispatch", "employee"],
    accessibleTabs: {
      mobility: ["command", "vehicles", "drivers", "maintenance", "routes", "pricing", "shuttle", "interstate", "on-demand", "rental", "school", "staff"],
      mobility_ops: ["console", "drivers", "vehicles", "shuttle", "interstate", "on-demand", "rental", "school", "staff"],
      dispatch: ["command", "operator"],
      employee: ["overview", "reviews", "quests", "profile"],
    },
    isEnabled: true,
  },
  {
    departmentCode: "DEPT-IT",
    departmentName: "Systems & IT / ERP",
    accessiblePages: [
      "overview", "ai", "marketplace", "shop", "mobility", "mobility_ops",
      "dispatch", "crm", "accounting", "hr", "users",
      "employee", "manager", "md"
    ],
    accessibleTabs: {},
    isEnabled: true,
  },
  {
    departmentCode: "DEPT-HR",
    departmentName: "Human Resources & Talent",
    accessiblePages: ["hr", "users", "manager", "employee"],
    accessibleTabs: {
      hr: ["overview", "users", "objectives", "cycle", "reports", "quests"],
      users: ["users", "departments", "mass-messaging"],
      manager: ["overview", "reviews"],
      employee: ["overview", "reviews", "quests", "profile"],
    },
    isEnabled: true,
  },
  {
    departmentCode: "DEPT-MKT",
    departmentName: "Commercial & Growth",
    accessiblePages: ["crm", "ai", "marketplace", "shop", "employee"],
    accessibleTabs: {
      crm: ["command", "lists", "blasts", "leads", "activities", "pipeline", "contacts"],
      ai: ["command", "campaigns", "studio", "strategy", "knowledge", "analytics", "team", "telegram"],
      marketplace: ["overview", "shop", "bookings", "leads", "deals", "articles"],
      shop: ["catalog", "referrals"],
      employee: ["overview", "reviews", "quests", "profile"],
    },
    isEnabled: true,
  },
  {
    departmentCode: "DEPT-EXE",
    departmentName: "Executive Directorate",
    accessiblePages: ["overview", "md", "accounting", "hr", "mobility", "crm", "shop", "manager", "employee"],
    accessibleTabs: {
      overview: ["dashboard"],
      md: ["cockpit", "department"],
      accounting: ["overview", "trial-balance", "income-statement", "financial-position"],
      hr: ["overview", "reports"],
      mobility: ["command", "pricing"],
      crm: ["command", "pipeline"],
      shop: ["overview"],
      manager: ["overview", "reviews"],
      employee: ["overview", "reviews", "quests", "profile"],
    },
    isEnabled: true,
  },
];
