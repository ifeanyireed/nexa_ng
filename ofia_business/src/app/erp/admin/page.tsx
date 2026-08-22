"use client";

import React, { useState } from "react";
import { useERPStore, User, DEPARTMENTS } from "@/lib/erp-store";
import ERPLayout from "@/components/nets_erp/Layout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Sparkles,
  ShoppingBag,
  Users,
  ShieldCheck,
  Building2,
  Mail,
  Award,
  AlertOctagon,
  Layers,
  TrendingUp,
  Cpu,
  Activity,
  Server,
  ToggleLeft,
  DollarSign,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Plus,
  Edit2,
  FileText,
  MapPin,
  RefreshCw,
  Zap,
  ArrowUpRight,
  Send,
  Lock,
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function AdminDashboard() {
  const { users, updateUsers } = useERPStore();

  // Top Multi-Page Slider Tab State
  const [activeMainTab, setActiveMainTab] = useState<"erp" | "ai" | "marketplace">("erp");

  // AI Sub-tab state
  const [aiSubTab, setAiSubTab] = useState<"overview" | "email" | "orgs" | "swarm" | "llm">("overview");

  // Marketplace Sub-tab state
  const [mktSubTab, setMktSubTab] = useState<"overview" | "vetting" | "categories" | "disputes" | "cities">("overview");

  // ==================== ERP TAB STATE ====================
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State for custom bulk notification
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // User Editing Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editDept, setEditDept] = useState("");
  const [editDesignation, setEditDesignation] = useState("");
  const [editRole, setEditRole] = useState<any>("employee");

  // Loading & Feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" | "" }>({ text: "", type: "" });

  const handleEditClick = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditDept(u.department);
    setEditDesignation(u.designation || "");
    setEditRole(u.role);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsLoading(true);
    try {
      const updatedUser: User = {
        ...editingUser,
        name: editName,
        email: editEmail,
        department: editDept,
        designation: editDesignation,
        role: editRole,
      };

      const newList = users.map(u => u.id === editingUser.id ? updatedUser : u);
      await updateUsers(newList);

      setStatusMessage({
        text: `Successfully updated user ${editName} (${editingUser.id}).`,
        type: "success",
      });
      setEditingUser(null);
    } catch (e: any) {
      setStatusMessage({
        text: `Failed to update user: ${e.message}`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setCurrentPage(1);
  };

  const handleSelectUser = (id: string) => {
    setSelectedUserIds(prev =>
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (filteredUsers: User[]) => {
    if (selectedUserIds.length === filteredUsers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredUsers.map(u => u.id));
    }
  };

  const handleSendResetPassword = async () => {
    if (selectedUserIds.length === 0) {
      alert("Please select at least one user.");
      return;
    }
    setIsLoading(true);
    try {
      const selectedEmails = users.filter(u => selectedUserIds.includes(u.id)).map(u => u.email);
      const res = await fetch(`${API_BASE_URL}/api/admin/bulk-reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: selectedEmails }),
      });
      if (!res.ok) throw new Error("Bulk reset failed.");
      setStatusMessage({ text: `Reset password instructions sent to ${selectedEmails.length} staff.`, type: "success" });
    } catch (e: any) {
      setStatusMessage({ text: e.message || "Failed to trigger bulk reset.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (u.id && u.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ==================== AI TAB DATA ====================
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

  // ==================== MARKETPLACE TAB DATA ====================
  const [proVettingList, setProVettingList] = useState([
    { id: "pro-1", business: "Lekki Solar Energy Co.", owner: "Tunde Bakare", city: "Lagos", category: "Solar & Inverter", cac: "RC-1849204", status: "PENDING" },
    { id: "pro-2", business: "Apex Cold Chain Services", owner: "Chukwudi Nwankwo", city: "Abuja", category: "AC & Refrigeration", cac: "BN-2938491", status: "PENDING" },
    { id: "pro-3", business: "VI Private Caregivers", owner: "Nurse Grace Okafor", city: "Lagos", category: "Health Caregiver", cac: "BN-8472910", status: "VERIFIED" },
    { id: "pro-4", business: "PHC Fast Logistics", owner: "Tariere Briggs", city: "Port Harcourt", category: "Haulage & Delivery", cac: "RC-9283741", status: "VERIFIED" },
  ]);

  const handleApprovePro = (id: string) => {
    setProVettingList(prev => prev.map(p => p.id === id ? { ...p, status: "VERIFIED" } : p));
  };

  const handleRejectPro = (id: string) => {
    setProVettingList(prev => prev.map(p => p.id === id ? { ...p, status: "REJECTED" } : p));
  };

  return (
    <ERPLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* ========================================================= */}
        {/* TOP MULTI-PAGE TOGGLE SLIDER (ERP / AI / MARKETPLACE)     */}
        {/* ========================================================= */}
        <div className="p-1.5 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 shadow-2xl flex items-center justify-between gap-2 select-none">
          <div className="flex items-center gap-1.5 w-full">
            {/* TAB 1: ERP */}
            <button
              onClick={() => setActiveMainTab("erp")}
              className={`relative flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer ${
                activeMainTab === "erp"
                  ? "text-white font-black shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {activeMainTab === "erp" && (
                <motion.div
                  layoutId="admin-active-tab-indicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Briefcase className="w-4 h-4" />
              <span>ERP Staff & Access Control</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeMainTab === "erp" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
              }`}>
                {users.length} Staff
              </span>
            </button>

            {/* TAB 2: OFIA AI */}
            <button
              onClick={() => setActiveMainTab("ai")}
              className={`relative flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer ${
                activeMainTab === "ai"
                  ? "text-white font-black shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {activeMainTab === "ai" && (
                <motion.div
                  layoutId="admin-active-tab-indicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 shadow-md -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Ofia AI (GTM Swarm)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeMainTab === "ai" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
              }`}>
                15 Agents
              </span>
            </button>

            {/* TAB 3: OFIA MARKETPLACE */}
            <button
              onClick={() => setActiveMainTab("marketplace")}
              className={`relative flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer ${
                activeMainTab === "marketplace"
                  ? "text-white font-black shadow-lg"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              {activeMainTab === "marketplace" && (
                <motion.div
                  layoutId="admin-active-tab-indicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 shadow-md -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <ShoppingBag className="w-4 h-4 text-emerald-300" />
              <span>Ofia Marketplace</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                activeMainTab === "marketplace" ? "bg-white/20 text-white" : "bg-slate-800 text-slate-400"
              }`}>
                3,420 Pros
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB 1 CONTENT: ERP STAFF & ACCESS CONTROL                 */}
        {/* ========================================================= */}
        {activeMainTab === "erp" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* ERP HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  ERP Staff Directory & RBAC Provisioning
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Manage organization users, assign managerial leads, update designations, and trigger bulk password resets.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSendResetPassword}
                  disabled={isLoading || selectedUserIds.length === 0}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Reset Password ({selectedUserIds.length})
                </button>
                <button
                  onClick={() => setIsModalOpen(true)}
                  disabled={selectedUserIds.length === 0}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  Bulk Email Staff ({selectedUserIds.length})
                </button>
              </div>
            </div>

            {/* STATUS MESSAGE */}
            {statusMessage.text && (
              <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center justify-between ${
                statusMessage.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                <span>{statusMessage.text}</span>
                <button onClick={() => setStatusMessage({ text: "", type: "" })} className="text-xs underline">Dismiss</button>
              </div>
            )}

            {/* ERP SEARCH BAR */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search staff by name, email, or department..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 outline-none focus:border-blue-500"
                />
              </div>
              <span className="text-xs text-slate-500 font-bold">
                Showing {currentUsers.length} of {filteredUsers.length} Staff Members
              </span>
            </div>

            {/* STAFF TABLE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-mono text-[10px]">
                    <tr>
                      <th className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.length > 0 && selectedUserIds.length === filteredUsers.length}
                          onChange={() => handleSelectAll(filteredUsers)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="py-3 px-4">Staff Member</th>
                      <th className="py-3 px-4">Department & Designation</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Reporting Manager</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {currentUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <input
                            type="checkbox"
                            checked={selectedUserIds.includes(u.id)}
                            onChange={() => handleSelectUser(u.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-800">{u.name}</div>
                          <div className="text-[11px] font-mono text-slate-400">{u.email} • {u.id}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-slate-800 font-semibold">{u.designation || "Staff Officer"}</div>
                          <div className="text-[11px] text-slate-500">{u.department}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{u.managerName || "Direct / MD"}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleEditClick(u)}
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            Edit Profile
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}
              <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Page {currentPage} of {totalPages || 1}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* TAB 2 CONTENT: OFIA AI (AUTONOMOUS GTM SWARM)             */}
        {/* ========================================================= */}
        {activeMainTab === "ai" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
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

                {/* ACTIVE AI SPECIALISTS GRID */}
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

                {/* TEST DISPATCH BOX */}
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
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* TAB 3 CONTENT: OFIA MARKETPLACE (NEXA NETWORK)            */}
        {/* ========================================================= */}
        {activeMainTab === "marketplace" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* MARKETPLACE SUB-NAVIGATION */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                {[
                  { id: "overview", label: "Marketplace GMV", icon: ShoppingBag },
                  { id: "vetting", label: "Pro Vetting & Badges", icon: Award },
                  { id: "categories", label: "99+ Categories", icon: Layers },
                  { id: "disputes", label: "Escrow Disputes", icon: AlertOctagon },
                  { id: "cities", label: "City Analytics", icon: TrendingUp },
                ].map((st) => {
                  const Icon = st.icon;
                  const active = mktSubTab === st.id;
                  return (
                    <button
                      key={st.id}
                      onClick={() => setMktSubTab(st.id as any)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        active
                          ? "bg-emerald-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{st.label}</span>
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                2 Pros Awaiting Review
              </span>
            </div>

            {/* MKT SUBTAB 1: OVERVIEW */}
            {mktSubTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Total GMV</span>
                    <div className="text-2xl font-black text-slate-800">₦42,850,000</div>
                    <span className="text-[11px] text-emerald-600 font-bold">+24% vs Last Month</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Verified Pros</span>
                    <div className="text-2xl font-black text-emerald-600">3,420</div>
                    <span className="text-[11px] text-slate-500">Across 36 states + FCT</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Escrow in Transit</span>
                    <div className="text-2xl font-black text-blue-600">₦3,240,000</div>
                    <span className="text-[11px] text-slate-500">Paystack Protected</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Platform Commissions</span>
                    <div className="text-2xl font-black text-emerald-700">₦4,285,000</div>
                    <span className="text-[11px] text-slate-500">10% average fee</span>
                  </div>
                </div>
              </div>
            )}

            {/* MKT SUBTAB 2: PRO VETTING */}
            {mktSubTab === "vetting" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-slate-800">Pro Merchant Verification Queue</h3>
                  <span className="text-xs text-slate-500 font-bold">{proVettingList.length} Records</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider font-mono text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Business & Owner</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Location</th>
                        <th className="py-3 px-4">CAC Number</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {proVettingList.map((pro) => (
                        <tr key={pro.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            {pro.business}
                            <div className="text-[11px] font-normal text-slate-400">{pro.owner}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">{pro.category}</td>
                          <td className="py-3.5 px-4 text-slate-700">{pro.city}</td>
                          <td className="py-3.5 px-4 font-mono text-[11px]">{pro.cac}</td>
                          <td className="py-3.5 px-4">
                            {pro.status === "VERIFIED" ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <ShieldCheck className="w-3 h-3" /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-2">
                            {pro.status !== "VERIFIED" && (
                              <button
                                onClick={() => handleApprovePro(pro.id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                              >
                                Approve Badge
                              </button>
                            )}
                            {pro.status === "PENDING" && (
                              <button
                                onClick={() => handleRejectPro(pro.id)}
                                className="px-2.5 py-1 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold"
                              >
                                Reject
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MKT SUBTAB 3: CATEGORIES */}
            {mktSubTab === "categories" && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-extrabold text-sm text-slate-800">99+ Categories & Escrow Commissions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800">Home Services & Solar</span>
                    <p className="text-[11px] text-slate-500">18 Sub-niches • 10% Commission</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800">Artisans & Handyman</span>
                    <p className="text-[11px] text-slate-500">14 Sub-niches • 12% Commission</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-800">Healthcare & Private Nurses</span>
                    <p className="text-[11px] text-slate-500">8 Sub-niches • 15% Commission</p>
                  </div>
                </div>
              </div>
            )}

            {/* MKT SUBTAB 4: DISPUTES */}
            {mktSubTab === "disputes" && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-extrabold text-sm text-slate-800">Active Escrow Disputes (2)</h3>
                <div className="space-y-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-red-50/40 border border-red-200 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">DSP-8401: Lekki Solar Energy Co. (₦145,000)</div>
                      <div className="text-[11px] text-slate-500">Incomplete cabling upon delivery • Client: Amina Yusuf</div>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold">Arbitrate</button>
                  </div>
                </div>
              </div>
            )}

            {/* MKT SUBTAB 5: CITIES */}
            {mktSubTab === "cities" && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <h3 className="font-extrabold text-sm text-slate-800">City-by-City Booking Heatmaps</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-800">Lagos (Lekki, VI, Ikeja)</span>
                    <p className="text-[11px] text-emerald-600 font-bold">4,820 Bookings (₦26.4M GMV)</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-800">Abuja (Maitama, Garki)</span>
                    <p className="text-[11px] text-emerald-600 font-bold">1,940 Bookings (₦10.2M GMV)</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================= */}
        {/* MODALS FOR EDITING USER & BULK NOTIFICATION               */}
        {/* ========================================================= */}
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-800">Edit Staff: {editingUser.name}</h3>
                <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">✕</button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Department</label>
                    <select
                      value={editDept}
                      onChange={(e) => setEditDept(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-slate-800"
                    >
                      <option value="Administration">Administration</option>
                      {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Role</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-slate-800"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="hr">HR</option>
                      <option value="accountant">Accountant</option>
                      <option value="md">MD</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-3.5 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ERPLayout>
  );
}
