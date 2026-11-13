"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Bot,
  Sparkles,
  Search,
  FileText,
  UserCheck,
  Send,
  Zap,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  Plus,
  Mail,
  MessageSquare,
  Radio,
  FileCheck2,
  TrendingUp,
  Cpu,
  Layers,
  Award,
  ChevronRight,
  ShieldAlert,
  Sliders,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useWorkforceManager } from "@/lib/workforce-store";
import {
  AiStaffMatchResult,
  AiParsedCandidate,
  AiExecutiveBriefing,
  WorkforceNotification,
} from "@/lib/workforce-types";

export default function AiOperationsConsolePage() {
  const {
    people,
    candidates,
    deployments,
    workLogs,
    tickets,
    notifications,
    aiMatchWorkforce,
    aiParseResume,
    aiSummarizeDailyOperations,
    convertCrmDealToWorkforce,
    dispatchNotification,
    submitApplication,
  } = useWorkforceManager();

  const [activeTab, setActiveTab] = useState<"matcher" | "parser" | "briefing" | "integrations">("matcher");

  // Tab 1: Staff Matcher State
  const [matchQuery, setMatchQuery] = useState("Find 2 senior full-stack engineers with TypeScript and Node in Lagos for fleet logistics");
  const [isMatching, setIsMatching] = useState(false);
  const [matchResults, setMatchResults] = useState<AiStaffMatchResult[]>([]);

  // Tab 2: Resume Parser State
  const sampleResumeDevOps = `Chukwuma Eze
Email: chukwuma.eze@example.ng
Phone: +2348039876543
Role: Cloud Infrastructure & DevOps Engineer
Experience: 4 years experience in microservice deployment, Docker containerization, AWS ECS, and CI/CD pipelines.
Education: B.Sc. Electronic Engineering, University of Nigeria Nsukka
Skills: TypeScript, Docker, AWS, PostgreSQL, CI/CD, Terraform, Kubernetes, Linux, Monitoring.`;

  const sampleResumeBiometric = `Amina Bello
Email: amina.bello@example.ng
Phone: +2348123456789
Role: Biometric Systems Support Specialist
Experience: 3 years experience managing CBT examination terminals, biometric fingerprint scanners, network routers, and offline verification audits.
Education: HND Computer Engineering, Yaba College of Technology
Skills: Biometrics, Quality Assurance, Hardware Troubleshooting, Network Engineering, SQL, Terminal Auditing.`;

  const [resumeText, setResumeText] = useState(sampleResumeDevOps);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedCandidate, setParsedCandidate] = useState<AiParsedCandidate | null>(null);
  const [importedSuccessMsg, setImportedSuccessMsg] = useState<string | null>(null);

  // Tab 3: Daily Briefing State
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [briefing, setBriefing] = useState<AiExecutiveBriefing | null>({
    generatedAt: new Date().toISOString(),
    operationalHealthScore: 98,
    executiveSummary:
      "Workforce operations are performing at optimal capacity across client accounts. 14 deployed specialists active with 34 verified work hours logged today. SLA compliance remains at 99.1% with zero critical breaches.",
    keyHighlights: [
      "Prime Logistics fleet WebSocket latency resolved with positive client sign-off.",
      "Apex Academy mock CBT biometric terminal dry-run executed with 100% hardware uptime.",
      "4 newly onboarded associate specialists transitioned from Talent Academy to active project allocations.",
    ],
    slaRisksAndAlerts: [
      "Service ticket INC-8421 for mainland telemetry has 45 minutes SLA threshold remaining; assigned engineer active.",
    ],
    recommendedActions: [
      "Review and approve pending deployment requisitions for Zenith Microfinance Bank Q2 expansion.",
      "Authorize bi-weekly CSAT stakeholder survey dispatch to enterprise account leads.",
    ],
  });

  // Tab 4: CRM Sync Simulation State
  const [crmDealCompany, setCrmDealCompany] = useState("Zenith Microfinance Bank");
  const [crmDealTitle, setCrmDealTitle] = useState("Core Banking CBT Biometric Integration");
  const [crmDealValue, setCrmDealValue] = useState("₦3,800,000 / month");
  const [crmDealOwner, setCrmDealOwner] = useState("Tunde Bakare");
  const [isSyncingCrm, setIsSyncingCrm] = useState(false);
  const [crmSyncResult, setCrmSyncResult] = useState<string | null>(null);

  // Tab 4: Multi-Channel Dispatch State
  const [dispatchChannel, setDispatchChannel] = useState<"email" | "sms" | "whatsapp" | "webhook">("whatsapp");
  const [dispatchRecipient, setDispatchRecipient] = useState("+2348031234567");
  const [dispatchMessage, setDispatchMessage] = useState("Action Required: Your formal offer letter is ready for review on the Ofia Portal.");
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  // Handlers
  const handleRunMatch = async (customQuery?: string) => {
    const q = customQuery || matchQuery;
    if (!q.trim()) return;
    setIsMatching(true);
    const results = await aiMatchWorkforce(q);
    setMatchResults(results);
    setIsMatching(false);
  };

  const handleRunParser = async () => {
    if (!resumeText.trim()) return;
    setIsParsing(true);
    setImportedSuccessMsg(null);
    const parsed = await aiParseResume(resumeText);
    setParsedCandidate(parsed);
    setIsParsing(false);
  };

  const handleImportParsedCandidate = () => {
    if (!parsedCandidate) return;
    submitApplication({
      name: parsedCandidate.name,
      email: parsedCandidate.email,
      phone: parsedCandidate.phone,
      appliedRole: parsedCandidate.appliedRole,
      department: parsedCandidate.department,
      skills: parsedCandidate.skills,
      experienceYears: parsedCandidate.experienceYears,
      education: parsedCandidate.education,
      score: parsedCandidate.score,
    });
    setImportedSuccessMsg(`Successfully imported ${parsedCandidate.name} into recruitment pipeline!`);
  };

  const handleGenerateBriefing = async () => {
    setIsSummarizing(true);
    const res = await aiSummarizeDailyOperations();
    if (res) setBriefing(res);
    setIsSummarizing(false);
  };

  const handleSyncCrmDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncingCrm(true);
    setCrmSyncResult(null);
    const res = await convertCrmDealToWorkforce({
      dealId: `crm-${Date.now()}`,
      company: crmDealCompany,
      title: crmDealTitle,
      value: crmDealValue,
      owner: crmDealOwner,
      requiredHeadcount: 2,
      durationMonths: 12,
    });
    setIsSyncingCrm(false);
    if (res?.success) {
      setCrmSyncResult(`Deal won by ${crmDealOwner} converted! Client account and staffing request activated.`);
    }
  };

  const handleDispatchNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchRecipient.trim() || !dispatchMessage.trim()) return;
    setIsDispatching(true);
    setDispatchSuccessMsg(null);
    await dispatchNotification({
      channel: dispatchChannel,
      recipient: dispatchRecipient.trim(),
      eventType: "DAILY_DIGEST",
      message: dispatchMessage.trim(),
      subject: `Workforce Alert · ${dispatchChannel.toUpperCase()}`,
    });
    setIsDispatching(false);
    setDispatchSuccessMsg(`Notification successfully dispatched via ${dispatchChannel.toUpperCase()}!`);
  };

  return (
    <ErpAdminShell
      title="AI Operations & Enterprise Integrations"
      subtitle="Module 10 · AI-driven candidate matching, automated resume parsing, executive morning digest, and multi-channel webhook dispatch."
      activeModule="workforce"
      action={
        <NexaButton
          size="sm"
          variant="primary"
          className="gap-2 text-xs"
          onClick={handleGenerateBriefing}
          disabled={isSummarizing}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSummarizing ? "animate-spin" : ""}`} />
          {isSummarizing ? "Synthesizing Operations..." : "Generate Live Briefing"}
        </NexaButton>
      }
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-nexa-border pb-2 overflow-x-auto text-sm">
          <button
            onClick={() => setActiveTab("matcher")}
            className={`px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "matcher"
                ? "bg-emerald-600 text-white shadow-xs font-semibold"
                : "text-nexa-text-secondary hover:text-nexa-text-primary hover:bg-nexa-surface font-medium"
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            Natural Language Staff Matcher
          </button>
          <button
            onClick={() => setActiveTab("parser")}
            className={`px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "parser"
                ? "bg-emerald-600 text-white shadow-xs font-semibold"
                : "text-nexa-text-secondary hover:text-nexa-text-primary hover:bg-nexa-surface font-medium"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            AI Resume / Dossier Parser
          </button>
          <button
            onClick={() => setActiveTab("briefing")}
            className={`px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "briefing"
                ? "bg-emerald-600 text-white shadow-xs font-semibold"
                : "text-nexa-text-secondary hover:text-nexa-text-primary hover:bg-nexa-surface font-medium"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Executive Morning Briefing
          </button>
          <button
            onClick={() => setActiveTab("integrations")}
            className={`px-4 py-2 rounded-lg text-xs whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "integrations"
                ? "bg-emerald-600 text-white shadow-xs font-semibold"
                : "text-nexa-text-secondary hover:text-nexa-text-primary hover:bg-nexa-surface font-medium"
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            CRM Sync & Notification Webhooks ({notifications.length})
          </button>
        </div>

        {/* Tab 1: Natural Language Staff Matcher */}
        {activeTab === "matcher" && (
          <div className="space-y-6">
            <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-nexa-text-primary flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Semantic Workforce Matcher
                  </h3>
                  <p className="text-xs text-nexa-text-secondary mt-0.5">
                    Query active staff, bench availability, and verified competencies using natural conversational language.
                  </p>
                </div>
              </div>

              {/* Quick Chip Prompts */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  "3 available network engineers in Lagos with CCNA",
                  "Biometric technician for tertiary exams dry-run",
                  "Full-stack TypeScript lead with AWS Docker experience",
                  "Client service operations lead on bench",
                ].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMatchQuery(chip);
                      handleRunMatch(chip);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-nexa-base hover:bg-nexa-surface hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 text-nexa-text-secondary border border-nexa-border transition"
                  >
                    &ldquo;{chip}&rdquo;
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={matchQuery}
                  onChange={(e) => setMatchQuery(e.target.value)}
                  placeholder="e.g. Find 2 senior full-stack engineers with TypeScript in Lagos"
                  className="flex-1 bg-nexa-base border border-nexa-border rounded-lg px-4 py-2.5 text-xs text-nexa-text-primary placeholder:text-nexa-text-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:bg-nexa-surface transition-colors"
                />
                <NexaButton
                  variant="primary"
                  size="sm"
                  onClick={() => handleRunMatch()}
                  disabled={isMatching}
                  className="gap-2 shrink-0"
                >
                  <Search className="w-3.5 h-3.5" />
                  {isMatching ? "Scanning..." : "Run AI Match"}
                </NexaButton>
              </div>
            </div>

            {/* Results Grid */}
            {matchResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-nexa-text-secondary">
                    Top AI Matches ({matchResults.length})
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matchResults.map((res) => (
                    <div
                      key={res.personId}
                      className="p-5 bg-nexa-surface border border-nexa-border rounded-xl space-y-3 hover:border-emerald-500/40 transition"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="text-sm font-bold text-nexa-text-primary">{res.personName}</h5>
                          <p className="text-xs text-nexa-text-secondary">{res.designation}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{res.matchScorePercent}%</span>
                          <div className="text-[10px] text-nexa-text-secondary uppercase">Match</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="text-nexa-text-secondary">{res.department}</span>
                        <span className="text-nexa-text-muted">•</span>
                        <span
                          className={`px-2 py-0.5 rounded font-medium text-[10px] ${
                            res.availabilityStatus === "available"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                              : res.availabilityStatus === "deployed"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                              : "bg-nexa-base text-nexa-text-secondary border border-nexa-border"
                          }`}
                        >
                          {res.availabilityStatus.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-nexa-text-secondary italic bg-nexa-base p-2.5 rounded border border-nexa-border leading-relaxed">
                        &quot;{res.rationale}&quot;
                      </p>

                      {res.matchedSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {res.matchedSkills.map((sk, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-medium"
                            >
                              ✓ {sk}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-nexa-border flex justify-end">
                        <Link
                          href={`/erp/admin/workforce/people/${res.personId}`}
                          className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline font-medium inline-flex items-center gap-1"
                        >
                          <span>View Full Dossier</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: AI Resume / Dossier Parser */}
        {activeTab === "parser" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column: Raw Resume Input */}
              <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-nexa-text-primary flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Raw Resume / CV Input
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setResumeText(sampleResumeDevOps)}
                      className="text-[10px] px-2 py-1 rounded bg-nexa-base hover:bg-nexa-surface hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 text-nexa-text-secondary border border-nexa-border transition"
                    >
                      DevOps Sample
                    </button>
                    <button
                      onClick={() => setResumeText(sampleResumeBiometric)}
                      className="text-[10px] px-2 py-1 rounded bg-nexa-base hover:bg-nexa-surface hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/30 text-nexa-text-secondary border border-nexa-border transition"
                    >
                      Biometrics Sample
                    </button>
                  </div>
                </div>

                <textarea
                  rows={14}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste unstructured candidate CV text or applicant profile here..."
                  className="w-full bg-nexa-base border border-nexa-border rounded-lg p-3.5 text-xs text-nexa-text-primary placeholder:text-nexa-text-muted font-mono focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:bg-nexa-surface leading-relaxed transition-colors"
                />

                <div className="flex justify-end">
                  <NexaButton
                    variant="primary"
                    size="sm"
                    onClick={handleRunParser}
                    disabled={isParsing}
                    className="gap-2"
                  >
                    <Cpu className={`w-3.5 h-3.5 ${isParsing ? "animate-spin" : ""}`} />
                    {isParsing ? "Extracting Entities..." : "Parse Candidate Dossier"}
                  </NexaButton>
                </div>
              </div>

              {/* Right Column: Extracted Structured Candidate Dossier */}
              <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-nexa-text-primary flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Structured Candidate Dossier
                </h3>

                {importedSuccessMsg && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{importedSuccessMsg}</span>
                  </div>
                )}

                {parsedCandidate ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-nexa-base rounded-xl border border-nexa-border space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-bold text-nexa-text-primary">{parsedCandidate.name}</h4>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{parsedCandidate.appliedRole}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{parsedCandidate.score}%</div>
                          <div className="text-[10px] text-nexa-text-muted uppercase">Fit Score</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 text-nexa-text-secondary">
                        <div>
                          <span className="text-nexa-text-muted">Email:</span> {parsedCandidate.email}
                        </div>
                        <div>
                          <span className="text-nexa-text-muted">Phone:</span> {parsedCandidate.phone}
                        </div>
                        <div>
                          <span className="text-nexa-text-muted">Experience:</span> {parsedCandidate.experienceYears} Years
                        </div>
                        <div>
                          <span className="text-nexa-text-muted">Education:</span> {parsedCandidate.education}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-nexa-text-secondary uppercase tracking-wider block mb-1.5">
                        Extracted Skills
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {parsedCandidate.skills.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-medium"
                          >
                            ✓ {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-nexa-text-secondary italic bg-nexa-base p-3 rounded-lg border border-nexa-border leading-relaxed">
                      &quot;{parsedCandidate.summary}&quot;
                    </p>

                    <div className="pt-2 border-t border-nexa-border flex justify-end">
                      <NexaButton
                        variant="primary"
                        size="sm"
                        onClick={handleImportParsedCandidate}
                        className="gap-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Import into Recruitment Pipeline
                      </NexaButton>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 text-center border border-dashed border-nexa-border rounded-xl space-y-2">
                    <FileText className="w-10 h-10 text-nexa-text-muted mx-auto" />
                    <div className="text-xs font-medium text-nexa-text-secondary">No candidate parsed yet</div>
                    <p className="text-[11px] text-nexa-text-muted max-w-xs mx-auto">
                      Paste a CV on the left and click &apos;Parse Candidate Dossier&apos; to extract entities and calculate fit scores.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Executive Morning Briefing */}
        {activeTab === "briefing" && (
          <div className="space-y-6">
            {briefing && (
              <div className="bg-nexa-surface border border-nexa-border rounded-2xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-nexa-border pb-6">
                  <div>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Automated Operational Briefing
                    </span>
                    <h3 className="text-xl font-bold text-nexa-text-primary mt-1">
                      Daily Executive Operational Digest
                    </h3>
                    <p className="text-xs text-nexa-text-secondary mt-0.5">
                      Synthesized at {new Date(briefing.generatedAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-nexa-base p-3.5 rounded-xl border border-nexa-border text-center">
                      <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{briefing.operationalHealthScore}%</div>
                      <div className="text-[10px] text-nexa-text-muted uppercase tracking-wider font-semibold">
                        Health Score
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-nexa-text-secondary">
                    Executive Summary
                  </h4>
                  <p className="text-sm text-nexa-text-primary leading-relaxed bg-nexa-base p-4 rounded-xl border border-nexa-border">
                    {briefing.executiveSummary}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Highlights */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Key Operational Highlights
                    </h4>
                    <ul className="space-y-2 text-xs text-nexa-text-secondary">
                      {briefing.keyHighlights.map((hl, idx) => (
                        <li key={idx} className="p-3 rounded-lg bg-nexa-base border border-nexa-border flex items-start gap-2">
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* SLA Risks & Alerts */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      Active SLA Risks & Triage Alerts
                    </h4>
                    <ul className="space-y-2 text-xs text-nexa-text-secondary">
                      {briefing.slaRisksAndAlerts.map((rk, idx) => (
                        <li key={idx} className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <span>{rk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-3 border-t border-nexa-border pt-6">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-nexa-text-secondary">
                    Recommended Leadership Actions
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {briefing.recommendedActions.map((act, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-nexa-base border border-nexa-border flex items-center justify-between text-xs"
                      >
                        <span className="text-nexa-text-primary">{act}</span>
                        <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: CRM Sync & Notification Webhooks */}
        {activeTab === "integrations" && (
          <div className="space-y-8">
            {/* Top Grid: CRM Sync Simulator & Dispatcher */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* CRM Deal Simulator */}
              <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-nexa-text-primary flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    CRM Closed-Won Deal Auto-Conversion
                  </h3>
                  <p className="text-xs text-nexa-text-secondary mt-0.5">
                    Simulate deal transition in Ofia CRM to automatically provision a client service account and staffing requisition.
                  </p>
                </div>

                {crmSyncResult && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{crmSyncResult}</span>
                  </div>
                )}

                <form onSubmit={handleSyncCrmDeal} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Company / Client Name</label>
                    <input
                      type="text"
                      required
                      value={crmDealCompany}
                      onChange={(e) => setCrmDealCompany(e.target.value)}
                      className="w-full bg-nexa-base border border-nexa-border rounded-lg px-3 py-2 text-nexa-text-primary placeholder:text-nexa-text-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:bg-nexa-surface transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Deal Title / Scope</label>
                    <input
                      type="text"
                      required
                      value={crmDealTitle}
                      onChange={(e) => setCrmDealTitle(e.target.value)}
                      className="w-full bg-nexa-base border border-nexa-border rounded-lg px-3 py-2 text-nexa-text-primary placeholder:text-nexa-text-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:bg-nexa-surface transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Monthly Contract Value</label>
                      <input
                        type="text"
                        value={crmDealValue}
                        onChange={(e) => setCrmDealValue(e.target.value)}
                        className="w-full bg-nexa-base border border-nexa-border rounded-lg px-3 py-2 text-nexa-text-primary placeholder:text-nexa-text-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:bg-nexa-surface transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Deal Owner / Account Lead</label>
                      <input
                        type="text"
                        value={crmDealOwner}
                        onChange={(e) => setCrmDealOwner(e.target.value)}
                        className="w-full bg-nexa-base border border-nexa-border rounded-lg px-3 py-2 text-nexa-text-primary placeholder:text-nexa-text-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:bg-nexa-surface transition-colors"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <NexaButton
                      variant="primary"
                      size="sm"
                      disabled={isSyncingCrm}
                      className="gap-2"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      {isSyncingCrm ? "Syncing..." : "Simulate CRM Won Deal"}
                    </NexaButton>
                  </div>
                </form>
              </div>

              {/* Multi-channel Alert Dispatcher */}
              <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-nexa-text-primary flex items-center gap-2">
                    <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Multi-Channel Dispatch Engine
                  </h3>
                  <p className="text-xs text-nexa-text-secondary mt-0.5">
                    Trigger test operational alerts across Email, SMS, WhatsApp, and Webhook channels.
                  </p>
                </div>

                {dispatchSuccessMsg && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{dispatchSuccessMsg}</span>
                  </div>
                )}

                <form onSubmit={handleDispatchNotification} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Channel</label>
                      <select
                        value={dispatchChannel}
                        onChange={(e) => setDispatchChannel(e.target.value as any)}
                        className="w-full bg-nexa-base border border-nexa-border rounded-lg px-3 py-2 text-nexa-text-primary focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:bg-nexa-surface transition-colors"
                      >
                        <option value="whatsapp" className="bg-nexa-surface text-nexa-text-primary dark:bg-gray-900 dark:text-white">WhatsApp Business</option>
                        <option value="email" className="bg-nexa-surface text-nexa-text-primary dark:bg-gray-900 dark:text-white">Corporate Email</option>
                        <option value="sms" className="bg-nexa-surface text-nexa-text-primary dark:bg-gray-900 dark:text-white">Direct SMS</option>
                        <option value="webhook" className="bg-nexa-surface text-nexa-text-primary dark:bg-gray-900 dark:text-white">Outbound Webhook</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-nexa-text-secondary mb-1">Recipient Destination</label>
                      <input
                        type="text"
                        required
                        value={dispatchRecipient}
                        onChange={(e) => setDispatchRecipient(e.target.value)}
                        className="w-full bg-nexa-base border border-nexa-border rounded-lg px-3 py-2 text-nexa-text-primary placeholder:text-nexa-text-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:bg-nexa-surface transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-nexa-text-secondary mb-1">Notification Message</label>
                    <textarea
                      rows={3}
                      required
                      value={dispatchMessage}
                      onChange={(e) => setDispatchMessage(e.target.value)}
                      className="w-full bg-nexa-base border border-nexa-border rounded-lg px-3 py-2 text-nexa-text-primary placeholder:text-nexa-text-muted focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 focus:bg-nexa-surface transition-colors"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <NexaButton
                      variant="primary"
                      size="sm"
                      disabled={isDispatching}
                      className="gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isDispatching ? "Dispatching..." : "Send Test Notification"}
                    </NexaButton>
                  </div>
                </form>
              </div>
            </div>

            {/* Notification History Table */}
            <div className="p-6 bg-nexa-surface border border-nexa-border rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-nexa-text-primary">Dispatched Notification Log</h4>
                  <p className="text-xs text-nexa-text-secondary">
                    Historical record of automated email invitations, SMS alerts, WhatsApp links, and sync webhooks.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-nexa-base text-nexa-text-secondary border-b border-nexa-border uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Event Type</th>
                      <th className="py-2.5 px-3">Channel</th>
                      <th className="py-2.5 px-3">Recipient</th>
                      <th className="py-2.5 px-3">Message</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Dispatched</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-nexa-border">
                    {notifications.map((notif) => (
                      <tr key={notif.id} className="hover:bg-nexa-surface/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-medium text-emerald-600 dark:text-emerald-400">{notif.eventType}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-nexa-base text-nexa-text-secondary border border-nexa-border uppercase font-mono">
                            {notif.channel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-nexa-text-secondary">{notif.recipient}</td>
                        <td className="py-2.5 px-3 text-nexa-text-secondary max-w-md truncate">{notif.message}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                            {notif.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-nexa-text-muted font-mono">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErpAdminShell>
  );
}
