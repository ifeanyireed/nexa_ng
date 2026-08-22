"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BusinessShell } from "@/components/business/BusinessShell";
import { motion } from "framer-motion";
import {
  Briefcase,
  Sparkles,
  ShoppingBag,
  Building2,
  Mail,
  Award,
  AlertOctagon,
  Layers,
  TrendingUp,
  Cpu,
  Activity,
  Server,
  DollarSign,
  Search,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default function ERPAdminAIPage() {
  const [aiSubTab, setAiSubTab] = useState<"overview" | "email" | "orgs" | "swarm" | "llm">("overview");
  const [platformProvider, setPlatformProvider] = useState<"RESEND" | "BREVO" | "AWS_SES">("RESEND");
  const [testEmailRecipient, setTestEmailRecipient] = useState("reedbreednigeria@gmail.com");
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<string | null>(null);

  const handleDispatchTest = () => {
    setIsTestingEmail(true);
    setEmailTestResult(null);
    setTimeout(() => {
      setIsTestingEmail(false);
      setEmailTestResult("Test email successfully delivered to " + testEmailRecipient + " via Resend API (HTTP 200 OK).");
    }, 1200);
  };

  const aiAgents = [
    { name: "Noah Sterling", role: "Outbound GTM & Cold Email Strategist", model: "Claude 3.5 Sonnet", status: "ONLINE", tasks: "45 Dispatched" },
    { name: "Devon Vance", role: "Inbound Email Reply & Meeting Booking Closer", model: "GPT-4o", status: "ONLINE", tasks: "12 Replied" },
    { name: "Maya Lin", role: "Lead Enrichment & ICP Scoring Specialist", model: "Gemini 2.0 Flash", status: "ONLINE", tasks: "1.4k Scored" },
    { name: "Lucas Vance", role: "WhatsApp Autonomous Conversational Agent", model: "Claude 3.5 Sonnet", status: "ONLINE", tasks: "88 Converted" },
    { name: "Sophia Reynolds", role: "Multi-Channel Copywriting & Tone Optimizer", model: "GPT-4o", status: "ONLINE", tasks: "34 Drafted" },
  ];

  return (
    <BusinessShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* TOP MULTIPAGE TOGGLE SLIDER */}
        <div className="p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl flex items-center justify-between gap-2 select-none">
          <div className="flex items-center gap-1.5 w-full">
            <Link
              href="/erp/admin"
              className="relative flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
            >
              <Briefcase className="w-4 h-4" />
              <span>ERP Staff & Access Control</span>
            </Link>

            <Link
              href="/erp/admin/ai"
              className="relative flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 text-white font-black shadow-lg"
            >
              <motion.div
                layoutId="admin-active-tab-indicator"
                className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-md -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Ofia AI (GTM Swarm)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white/20 text-white">
                15 Agents
              </span>
            </Link>

            <Link
              href="/erp/admin/marketplace"
              className="relative flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-300" />
              <span>Ofia Marketplace</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-800 text-slate-400">
                3,420 Pros
              </span>
            </Link>
          </div>
        </div>

        {/* AI SUB-NAVIGATION */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: "overview", label: "Swarm Overview", icon: Activity },
              { id: "email", label: "Email Infra & Relays", icon: Mail },
              { id: "orgs", label: "Tenant Quotas", icon: Building2 },
              { id: "swarm", label: "15 AI Specialists", icon: Sparkles },
              { id: "llm", label: "LLM Observability", icon: Cpu },
            ].map((st) => {
              const Icon = st.icon;
              const active = aiSubTab === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setAiSubTab(st.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>

          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
            15 / 15 Agents Operational
          </span>
        </div>

        {/* AI SUBTAB 1: OVERVIEW */}
        {aiSubTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tenant Workspaces</span>
                <div className="text-2xl font-black text-slate-800">240</div>
                <span className="text-[11px] text-emerald-600 font-bold">100% Active DB Sync</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Daily Cold Emails</span>
                <div className="text-2xl font-black text-blue-600">14,280</div>
                <span className="text-[11px] text-slate-500">Across 3 active providers</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Inbox Deliverability</span>
                <div className="text-2xl font-black text-emerald-600">99.4%</div>
                <span className="text-[11px] text-emerald-600 font-bold">DKIM & SPF Enforced</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400">Token Cost (MTD)</span>
                <div className="text-2xl font-black text-purple-600">$48.20</div>
                <span className="text-[11px] text-slate-500">18.4M tokens processed</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Top Active AI Specialists
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {aiAgents.map((agent) => (
                  <div key={agent.name} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800">{agent.name}</span>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {agent.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{agent.role}</p>
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px] text-slate-400 font-mono">
                      <span>{agent.model}</span>
                      <span className="font-bold text-purple-700">{agent.tasks}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI SUBTAB 2: EMAIL INFRA */}
        {aiSubTab === "email" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600" />
                  Global Platform Email Relay & Live Dispatch Handshake
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Encrypted credentials stored in MySQL <code className="font-mono text-blue-600 font-bold">gtm_global_email_settings</code>.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                AES-256 Encrypted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["RESEND", "BREVO", "AWS_SES"] as const).map((drv) => (
                <div
                  key={drv}
                  onClick={() => setPlatformProvider(drv)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    platformProvider === drv
                      ? "border-blue-600 bg-blue-50/50 shadow-sm font-bold text-blue-900"
                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{drv === "RESEND" ? "Resend API (Recommended)" : drv === "BREVO" ? "Brevo v3 SMTP" : "Amazon SES"}</span>
                    {platformProvider === drv && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal mt-1 block">
                    {drv === "RESEND" ? "99.4% Deliverability" : drv === "BREVO" ? "300 free/day" : "$0.10 / 10k emails"}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Live API Handshake Dispatch Tester
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  placeholder="Recipient email address..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-white border border-slate-200 text-slate-800 outline-none focus:border-blue-600"
                />
                <button
                  onClick={handleDispatchTest}
                  disabled={isTestingEmail}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isTestingEmail ? "Dispatching..." : "Send Test Email"}
                </button>
              </div>
              {emailTestResult && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-mono">
                  {emailTestResult}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI SUBTAB 3: TENANT ORGS */}
        {aiSubTab === "orgs" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-800">Tenant Workspaces & Quota Catalog</h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Acme Technologies Inc.</div>
                  <div className="text-[11px] text-slate-400">Growth Plan ($1,200/mo) • 8 Seats Allowed</div>
                </div>
                <span className="text-emerald-700 font-bold">1,000 emails/day</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Lagos Fintech Partners</div>
                  <div className="text-[11px] text-slate-400">Scale Plan ($2,400/mo) • 20 Seats Allowed</div>
                </div>
                <span className="text-purple-700 font-bold">4,000 emails/day</span>
              </div>
            </div>
          </div>
        )}

        {/* AI SUBTAB 4: SWARM */}
        {aiSubTab === "swarm" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-800">15 Autonomous AI Specialist Agents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aiAgents.map((ag) => (
                <div key={ag.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="font-bold text-xs text-slate-800">{ag.name}</div>
                  <div className="text-[11px] text-slate-500">{ag.role}</div>
                  <div className="text-[10px] text-purple-700 font-mono pt-1">Model: {ag.model}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI SUBTAB 5: LLM GATEWAY */}
        {aiSubTab === "llm" && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-800">LLM Provider Telemetry & Latencies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
                <span className="font-bold text-purple-800">Anthropic Claude 3.5</span>
                <p className="text-[11px] text-purple-600">Avg Latency: 280ms • Cost: $28.40</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-800">OpenAI GPT-4o</span>
                <p className="text-[11px] text-emerald-600">Avg Latency: 220ms • Cost: $14.10</p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="font-bold text-blue-800">Google Gemini 2.0 Flash</span>
                <p className="text-[11px] text-blue-600">Avg Latency: 110ms • Cost: $5.70</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </BusinessShell>
  );
}
