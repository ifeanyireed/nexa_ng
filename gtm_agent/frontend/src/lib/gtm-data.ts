export interface AIAgent {
  id: string;
  name: string;
  role: string;
  category: "Executive" | "Intelligence" | "Strategy" | "Content" | "Outreach" | "Advisory";
  avatar: string;
  status: "working" | "online" | "idle";
  currentTask: string;
  taskProgress: number;
  todayStats: {
    label: string;
    value: string | number;
  }[];
  recommendation: string;
  confidence: number;
  recentOutputs: {
    title: string;
    timestamp: string;
    type: "report" | "lead_batch" | "copy" | "campaign" | "insight";
  }[];
}

export interface Campaign {
  id: string;
  name: string;
  targetAudience: string;
  status: "Draft" | "Planning" | "Production" | "Approval" | "Active" | "Optimizing" | "Completed";
  channels: ("Email" | "WhatsApp" | "LinkedIn" | "Meta Ads" | "X")[];
  prospectsCount: number;
  sentCount: number;
  replyRate: number;
  meetingsBooked: number;
  revenuePipeline: number;
  createdAt: string;
  startDate: string;
  strategySummary: string;
  conversionFunnel: {
    stage: string;
    count: number;
    pct: number;
  }[];
}

export interface Lead {
  id: string;
  companyName: string;
  website: string;
  industry: string;
  location: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone?: string;
  contactLinkedin?: string;
  icpFitScore: number;
  buyingSignals: string[];
  status: "Identified" | "Enriched" | "Queued" | "Contacted" | "Replied" | "Meeting Booked";
  assignedAgent: string;
  lastActivity: string;
}

export interface ApprovalItem {
  id: string;
  title: string;
  type: "Email Campaign" | "WhatsApp Broadcast" | "LinkedIn Post" | "Ad Spend Increase" | "Strategy Shift";
  creatorAgent: string;
  creatorAvatar: string;
  riskLevel: "Low" | "Medium" | "High";
  targetChannel: string;
  scheduledTime: string;
  summary: string;
  previewData: {
    subject?: string;
    body: string;
    recipientSample?: string;
    budgetChange?: string;
    mediaUrl?: string;
  };
  status: "Pending" | "Approved" | "Rejected";
}

export interface StrategyNode {
  id: string;
  title: string;
  type: "ICP" | "Persona" | "PainPoint" | "ValueProp" | "Channel" | "Offer";
  description: string;
  metrics?: string;
  tags: string[];
}

export const INITIAL_AGENTS: AIAgent[] = [
  {
    id: "cro",
    name: "Sterling Vance",
    role: "Chief Revenue Officer",
    category: "Executive",
    avatar: "/avatar1.png",
    status: "working",
    currentTask: "Synthesizing cross-channel weekly revenue report & executive briefing",
    taskProgress: 88,
    todayStats: [
      { label: "Decisions Orchestrated", value: 18 },
      { label: "Pipeline Value", value: "$142,500" },
      { label: "Active Campaigns", value: 4 },
    ],
    recommendation: "Shift 35% of outreach capacity toward the private school sector where reply rates are currently 2.4x higher.",
    confidence: 94,
    recentOutputs: [
      { title: "Weekly Revenue Forecast & GTM Realignment", timestamp: "1 hour ago", type: "report" },
      { title: "Executive Morning Briefing", timestamp: "3 hours ago", type: "insight" },
    ],
  },
  {
    id: "researcher",
    name: "Dr. Elena Rostova",
    role: "Market Researcher",
    category: "Intelligence",
    avatar: "/avatar2.png",
    status: "working",
    currentTask: "Conducting competitive pricing & feature benchmark across 14 SaaS competitors",
    taskProgress: 72,
    todayStats: [
      { label: "Competitors Monitored", value: 14 },
      { label: "Pricing Shifts Detected", value: 3 },
      { label: "Market Gaps Found", value: 5 },
    ],
    recommendation: "Competitors are hiking renewal rates by 20%. Launch an aggressive 'Switch & Save' campaign targeting their customer base.",
    confidence: 91,
    recentOutputs: [
      { title: "Competitor Vulnerability Matrix Q3", timestamp: "2 hours ago", type: "report" },
    ],
  },
  {
    id: "lead_hunter",
    name: "Olivia Chen",
    role: "Lead Hunter",
    category: "Intelligence",
    avatar: "/avatar3.png",
    status: "working",
    currentTask: "Discovering verified K-12 decision makers across key metropolitan zones",
    taskProgress: 94,
    todayStats: [
      { label: "Leads Researched", value: 1240 },
      { label: "Qualified ICPs", value: 186 },
      { label: "Enriched Emails", value: 142 },
    ],
    recommendation: "Expand prospect extraction parameters to include regional private academies in Abuja & Port Harcourt.",
    confidence: 96,
    recentOutputs: [
      { title: "Lagos & Abuja Private School Administrators Batch #4", timestamp: "30m ago", type: "lead_batch" },
    ],
  },
  {
    id: "gtm_strategist",
    name: "Marcus Aurel",
    role: "GTM Strategist",
    category: "Strategy",
    avatar: "/avatar4.png",
    status: "online",
    currentTask: "Refining value hook positioning for high-ticket enterprise buyer personas",
    taskProgress: 100,
    todayStats: [
      { label: "ICP Blueprints", value: 3 },
      { label: "Persona Angles", value: 8 },
      { label: "Offer Formulas", value: 4 },
    ],
    recommendation: "Position the software as 'Automated Tuition & Operations Command' rather than generic 'School ERP'.",
    confidence: 92,
    recentOutputs: [
      { title: "Positioning Playbook: School Administration 2026", timestamp: "4 hours ago", type: "report" },
    ],
  },
  {
    id: "content_strategist",
    name: "Maya Lin",
    role: "Content Strategist",
    category: "Content",
    avatar: "/avatar5.png",
    status: "online",
    currentTask: "Building multi-channel editorial pillars and thought leadership calendar",
    taskProgress: 100,
    todayStats: [
      { label: "Content Pillars", value: 5 },
      { label: "Topic Angles", value: 24 },
      { label: "Lead Magnets", value: 2 },
    ],
    recommendation: "Create a downloadable PDF checklist: 'The 10 Costly Operational Leaks in Private School Management'.",
    confidence: 89,
    recentOutputs: [
      { title: "Q3 High-Intent Editorial Pillar Map", timestamp: "5 hours ago", type: "report" },
    ],
  },
  {
    id: "copywriter",
    name: "Julian Cross",
    role: "AI Copywriter",
    category: "Content",
    avatar: "/avatar6.png",
    status: "working",
    currentTask: "Crafting 4-part personalized cold email sequence for school principals",
    taskProgress: 80,
    todayStats: [
      { label: "Sequences Written", value: 6 },
      { label: "Subject Lines Tested", value: 32 },
      { label: "WhatsApp Hooks", value: 15 },
    ],
    recommendation: "Use short 3-line pattern-interrupt subject lines with recipient institution name token.",
    confidence: 95,
    recentOutputs: [
      { title: "Direct-to-Principal Cold Outreach Sequence v2.1", timestamp: "1 hour ago", type: "copy" },
    ],
  },
  {
    id: "campaign_manager",
    name: "Devon Reed",
    role: "Campaign Manager",
    category: "Strategy",
    avatar: "/avatar7.png",
    status: "working",
    currentTask: "Orchestrating stage gating and execution triggers across 3 live campaigns",
    taskProgress: 65,
    todayStats: [
      { label: "Active Campaigns", value: 4 },
      { label: "Queued Triggers", value: 128 },
      { label: "GTM Velocity", value: "98.2%" },
    ],
    recommendation: "Schedule email drops between 8:15 AM - 9:30 AM West Africa Time for peak mobile inbox opens.",
    confidence: 93,
    recentOutputs: [
      { title: "Private School Blitz Q3 Execution Schedule", timestamp: "2 hours ago", type: "campaign" },
    ],
  },
  {
    id: "outreach_manager",
    name: "Noah Sterling",
    role: "Outreach Manager",
    category: "Outreach",
    avatar: "/avatar8.png",
    status: "working",
    currentTask: "Managing sending cadence, warmups, and automated reply sentiment analysis",
    taskProgress: 85,
    todayStats: [
      { label: "Emails Delivered", value: 342 },
      { label: "Open Rate", value: "64.8%" },
      { label: "Positive Replies", value: 14 },
    ],
    recommendation: "12 prospect replies contain pricing queries. Hand off directly to sales calendar webhook.",
    confidence: 97,
    recentOutputs: [
      { title: "Positive Intent Reply Digest #12", timestamp: "45m ago", type: "insight" },
    ],
  },
  {
    id: "whatsapp_manager",
    name: "Amara Obi",
    role: "WhatsApp Manager",
    category: "Outreach",
    avatar: "/avatar9.png",
    status: "working",
    currentTask: "Engaging warm opt-in leads via official WhatsApp Business API dialogues",
    taskProgress: 90,
    todayStats: [
      { label: "Active Chats", value: 68 },
      { label: "Response Time", value: "14 sec" },
      { label: "Bookings", value: 6 },
    ],
    recommendation: "Add quick-reply button 'Schedule 15-min Demo' directly to the second follow-up message.",
    confidence: 96,
    recentOutputs: [
      { title: "WhatsApp Conversion Funnel Performance", timestamp: "2 hours ago", type: "report" },
    ],
  },
  {
    id: "creative_director",
    name: "Chloe Vane",
    role: "Creative Director",
    category: "Content",
    avatar: "/avatar10.png",
    status: "online",
    currentTask: "Analyzing uploaded brand assets and producing high-converting ad variants",
    taskProgress: 100,
    todayStats: [
      { label: "Visual Variations", value: 16 },
      { label: "Ad Formats", value: 4 },
      { label: "Brand Match", value: "99.4%" },
    ],
    recommendation: "Feature actual UI screenshot of the school financial dashboard in LinkedIn sponsored posts.",
    confidence: 90,
    recentOutputs: [
      { title: "B2B Carousel Ad Creative Pack", timestamp: "6 hours ago", type: "copy" },
    ],
  },
  {
    id: "ads_strategist",
    name: "Kieran Patel",
    role: "Ads Strategist",
    category: "Strategy",
    avatar: "/avatar11.png",
    status: "online",
    currentTask: "Optimizing Meta & LinkedIn B2B audience retargeting and ROAS attribution",
    taskProgress: 100,
    todayStats: [
      { label: "ROAS", value: "3.8x" },
      { label: "Cost Per Lead", value: "$18.40" },
      { label: "Retargeting Pool", value: "4.2k" },
    ],
    recommendation: "Increase daily ad spend by $150 on the top-performing school administrator lookalike audience.",
    confidence: 92,
    recentOutputs: [
      { title: "Meta Ads Retargeting Campaign Budget Proposal", timestamp: "3 hours ago", type: "report" },
    ],
  },
  {
    id: "analytics_manager",
    name: "Siddharth Rao",
    role: "Analytics Manager",
    category: "Intelligence",
    avatar: "/avatar12.png",
    status: "working",
    currentTask: "Generating multi-touch conversion attribution models across all channels",
    taskProgress: 75,
    todayStats: [
      { label: "Attributed Pipeline", value: "$320,000" },
      { label: "Blended CAC", value: "$84.20" },
      { label: "Model Confidence", value: "97.8%" },
    ],
    recommendation: "Email + WhatsApp hybrid sequences demonstrate 3.1x higher close rate than single-channel email.",
    confidence: 98,
    recentOutputs: [
      { title: "Attribution Funnel Audit & Channel ROI Matrix", timestamp: "1 hour ago", type: "report" },
    ],
  },
  {
    id: "growth_advisor",
    name: "Zara Thorne",
    role: "Growth Advisor",
    category: "Advisory",
    avatar: "/avatar13.png",
    status: "online",
    currentTask: "Identifying high-upside non-obvious revenue channels and partnership opportunities",
    taskProgress: 100,
    todayStats: [
      { label: "New Growth Bets", value: 3 },
      { label: "Channel Ideas", value: 6 },
      { label: "Upside Potential", value: "+45%" },
    ],
    recommendation: "Form an association partnership with the Private Schools Guild for a co-branded operations webinar.",
    confidence: 93,
    recentOutputs: [
      { title: "Untapped Channel Opportunity Memo: Association Partnerships", timestamp: "4 hours ago", type: "insight" },
    ],
  },
  {
    id: "learning_agent",
    name: "Nexus Core",
    role: "Learning & Memory Agent",
    category: "Advisory",
    avatar: "/avatar14.png",
    status: "working",
    currentTask: "Updating permanent organizational memory weights based on Q3 winning message patterns",
    taskProgress: 98,
    todayStats: [
      { label: "Patterns Learned", value: 412 },
      { label: "Prompt Weights Tuned", value: 58 },
      { label: "Memory Embeddings", value: "18.4k" },
    ],
    recommendation: "Messages highlighting 'Tuition collection leakages' have an 88% higher response rate than 'Attendance tracking'.",
    confidence: 99,
    recentOutputs: [
      { title: "Organizational Learnings & Memory Synthesis", timestamp: "30m ago", type: "insight" },
    ],
  },
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: "camp-01",
    name: "Private Schools Operational Leap 2026",
    targetAudience: "Private School Proprietors & Principals (Nigeria / West Africa)",
    status: "Active",
    channels: ["Email", "WhatsApp", "LinkedIn"],
    prospectsCount: 1450,
    sentCount: 980,
    replyRate: 14.8,
    meetingsBooked: 28,
    revenuePipeline: 84000,
    createdAt: "2026-08-01",
    startDate: "2026-08-05",
    strategySummary: "Direct multi-touch outreach addressing tuition reconciliation delays and parent communication bottlenecks.",
    conversionFunnel: [
      { stage: "Targeted Prospects", count: 1450, pct: 100 },
      { stage: "Verified & Reached", count: 980, pct: 67.5 },
      { stage: "Engaged / Opened", count: 642, pct: 44.2 },
      { stage: "Meaningful Replies", count: 145, pct: 10.0 },
      { stage: "Booked Demos", count: 28, pct: 1.9 },
    ],
  },
  {
    id: "camp-02",
    name: "Fintech & B2B SaaS Competitor Switch Blitz",
    targetAudience: "Operations Directors & CFOs at Series A/B Tech Startups",
    status: "Active",
    channels: ["Email", "LinkedIn", "Meta Ads"],
    prospectsCount: 820,
    sentCount: 610,
    replyRate: 11.2,
    meetingsBooked: 19,
    revenuePipeline: 114000,
    createdAt: "2026-08-08",
    startDate: "2026-08-10",
    strategySummary: "Capitalizing on recent competitor price increases with zero-friction migration guarantee.",
    conversionFunnel: [
      { stage: "Targeted Prospects", count: 820, pct: 100 },
      { stage: "Verified & Reached", count: 610, pct: 74.3 },
      { stage: "Engaged / Opened", count: 420, pct: 51.2 },
      { stage: "Meaningful Replies", count: 68, pct: 8.3 },
      { stage: "Booked Demos", count: 19, pct: 2.3 },
    ],
  },
  {
    id: "camp-03",
    name: "Medical Clinic Practice Automation Pilot",
    targetAudience: "Chief Medical Officers & Clinic Directors",
    status: "Approval",
    channels: ["Email", "WhatsApp"],
    prospectsCount: 520,
    sentCount: 0,
    replyRate: 0,
    meetingsBooked: 0,
    revenuePipeline: 32000,
    createdAt: "2026-08-14",
    startDate: "2026-08-18",
    strategySummary: "WhatsApp-first patient appointment scheduling & automated billing reconciliation campaign.",
    conversionFunnel: [
      { stage: "Targeted Prospects", count: 520, pct: 100 },
      { stage: "Verified & Reached", count: 0, pct: 0 },
      { stage: "Engaged / Opened", count: 0, pct: 0 },
      { stage: "Meaningful Replies", count: 0, pct: 0 },
      { stage: "Booked Demos", count: 0, pct: 0 },
    ],
  },
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: "lead-01",
    companyName: "Corona International Schools",
    website: "https://coronaschools.org",
    industry: "Education & K-12",
    location: "Victoria Island, Lagos",
    contactName: "Adeyemi Phillips",
    contactTitle: "Managing Director / Head of Operations",
    contactEmail: "a.phillips@coronaschools.org",
    contactPhone: "+234 802 345 6789",
    icpFitScore: 98,
    buyingSignals: ["Currently hiring Head of IT", "Announced campus expansion", "Evaluating school ERP"],
    status: "Meeting Booked",
    assignedAgent: "Noah Sterling",
    lastActivity: "Demo scheduled for Tuesday 10:00 AM",
  },
  {
    id: "lead-02",
    companyName: "Meadow Hall Educational Group",
    website: "https://meadowhallschool.org",
    industry: "Education & K-12",
    location: "Lekki Phase 1, Lagos",
    contactName: "Folashade Aina",
    contactTitle: "Chief Operations Officer",
    contactEmail: "f.aina@meadowhallgroup.com",
    contactPhone: "+234 803 987 6543",
    icpFitScore: 95,
    buyingSignals: ["Website refreshed 2 weeks ago", "Tuition portal parent complaints on Twitter"],
    status: "Replied",
    assignedAgent: "Amara Obi",
    lastActivity: "WhatsApp message asking for enterprise pricing",
  },
  {
    id: "lead-03",
    companyName: "Greenwood House School",
    website: "https://greenwoodhouse.sch.ng",
    industry: "Education & K-12",
    location: "Ikoyi, Lagos",
    contactName: "Tariq Danjuma",
    contactTitle: "Principal Administrator",
    contactEmail: "tdanjuma@greenwoodhouse.sch.ng",
    icpFitScore: 92,
    buyingSignals: ["Active digital transformation committee"],
    status: "Contacted",
    assignedAgent: "Noah Sterling",
    lastActivity: "Opened cold email 3x in last 2 hours",
  },
  {
    id: "lead-04",
    companyName: "Lead British International School",
    website: "https://lbisschools.org",
    industry: "Education & K-12",
    location: "Gwarinpa, Abuja",
    contactName: "Dr. Clara Nnamdi",
    contactTitle: "Director of Academics & Systems",
    contactEmail: "cnnamdi@lbisschools.org",
    icpFitScore: 94,
    buyingSignals: ["Expanding to second campus in Port Harcourt"],
    status: "Queued",
    assignedAgent: "Olivia Chen",
    lastActivity: "Data verified & queued for next batch drop",
  },
];

export const INITIAL_APPROVALS: ApprovalItem[] = [
  {
    id: "appr-01",
    title: "Launch Batch 2: Principal Direct Outreach (450 Schools)",
    type: "Email Campaign",
    creatorAgent: "Julian Cross",
    creatorAvatar: "/avatar6.png",
    riskLevel: "Medium",
    targetChannel: "Email Outreach",
    scheduledTime: "Today at 2:00 PM WAT",
    summary: "Personalized 3-step sequence highlighting tuition reconciliation automation sent to 450 verified school administrators.",
    previewData: {
      subject: "{{first_name}}, quick question on {{company_name}}'s term fee reconciliation",
      body: "Hi {{first_name}},\n\nNoticed that {{company_name}} is wrapping up end-of-term admissions. Most administrators we speak with lose 15-20 hours weekly tracking manual bank alerts and parent receipts.\n\nWe built an automated system that reconciles 100% of school fees instantaneously through dedicated virtual accounts with automated WhatsApp receipts.\n\nOpen to a brief 7-minute look at how 40+ schools in Lagos eliminated fee leakages this term?\n\nBest regards,\nSterling Vance\nChief Revenue Officer",
      recipientSample: "Adeyemi Phillips (Corona Schools), Folashade Aina (Meadow Hall), 448 others",
    },
    status: "Pending",
  },
  {
    id: "appr-02",
    title: "Meta Retargeting Ad Budget Expansion (+$150/day)",
    type: "Ad Spend Increase",
    creatorAgent: "Kieran Patel",
    creatorAvatar: "/avatar11.png",
    riskLevel: "High",
    targetChannel: "Meta Ads (Instagram / Facebook)",
    scheduledTime: "Immediate upon approval",
    summary: "Increase daily ad spend from $100/day to $250/day on the top-performing 'School Administration Carousel' showing a 3.8x ROAS.",
    previewData: {
      budgetChange: "Current: $100/day → Proposed: $250/day (+$150/day)",
      body: "Ad Copy: 'Still manually tracking school fees across 3 different bank accounts? Discover why top private schools are switching to automated virtual accounts. Schedule your free 15-min workflow audit today.'",
      mediaUrl: "/avatar15.png",
    },
    status: "Pending",
  },
  {
    id: "appr-03",
    title: "WhatsApp Business Pilot Broadcast (120 Opt-in Leads)",
    type: "WhatsApp Broadcast",
    creatorAgent: "Amara Obi",
    creatorAvatar: "/avatar9.png",
    riskLevel: "Low",
    targetChannel: "WhatsApp Business API",
    scheduledTime: "Tomorrow at 9:00 AM WAT",
    summary: "Official Meta-approved template message offering a free downloadable fee reconciliation audit template.",
    previewData: {
      body: "Hello {{first_name}}, We just released our Q3 Private School Operations Benchmark Report analyzing tuition collection patterns across 200+ Nigerian institutions. Would you like a direct copy sent to your WhatsApp?",
      recipientSample: "120 verified school bursars who downloaded the brochure",
    },
    status: "Pending",
  },
];

export const DAILY_BRIEFING_CONTENT = {
  greeting: "Good morning.",
  headline: "Revenue Engine Status: High Velocity",
  body: "Yesterday your AI revenue team researched 1,240 prospective organizations, sent 342 personalized touchpoints, and booked 4 qualified enterprise meetings. Today there are 58 follow-ups queued, one multi-channel campaign awaiting your sign-off, and WhatsApp engagement is pacing at 14.8% reply rate.",
  keyRecommendation: "The private school education segment in Lagos and Abuja is converting 2.4x higher than generic SMBs. I recommend expanding lead extraction by 500 records in Abuja.",
  metrics: {
    yesterdayLeads: 1240,
    yesterdayEmails: 342,
    yesterdayReplies: 14,
    yesterdayMeetings: 4,
    yesterdayPipeline: "$28,000",
    todayFollowups: 58,
    todayApprovals: 3,
    activeAgentsCount: 15,
  },
};
