"use client";

import React, { useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaModal } from "@/components/nexa/NexaModal";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import {
  INITIAL_ADMIN_USERS,
  RBAC_ROLE_DEFINITIONS,
  AdminUser,
  RBACRoleDefinition,
} from "@/lib/admin-data";
import {
  Users,
  Search,
  Plus,
  ShieldCheck,
  ShieldAlert,
  Key,
  Mail,
  Building2,
  CheckCircle2,
  Lock,
  Edit2,
  Sliders,
  Check,
  X,
  UserCheck,
  Filter,
  RefreshCw,
  Sparkles,
  Zap,
  Power,
  Layers,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [activeTab, setActiveTab] = useState<"directory" | "matrix" | "scenarios">("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("ALL");
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>("ALL");

  // Impersonation / Active Persona State
  const [activeTestUser, setActiveTestUser] = useState<AdminUser>(INITIAL_ADMIN_USERS[0]);

  // Modals & Forms
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<AdminUser["role"]>("GROWTH_LEAD");
  const [newUserOrg, setNewUserOrg] = useState("EduSuite Nigeria");
  const [newUserTitle, setNewUserTitle] = useState("Campaign Growth Lead");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.orgName.toLowerCase().includes(q) ||
      (u.title && u.title.toLowerCase().includes(q));

    const matchesRole = selectedRoleFilter === "ALL" || u.role === selectedRoleFilter;
    const matchesOrg = selectedOrgFilter === "ALL" || u.orgName === selectedOrgFilter;

    return matchesSearch && matchesRole && matchesOrg;
  });

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName) return;

    const avatarIndex = (users.length % 30) + 1;
    const created: AdminUser = {
      id: `usr-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      title: newUserTitle,
      orgName: newUserOrg,
      orgId: newUserOrg === "EduSuite Nigeria" ? "org-01" : newUserOrg === "PayFlow Africa" ? "org-02" : "org-03",
      avatar: `/avatar${avatarIndex}.png`,
      twoFactorEnabled: true,
      status: "Active",
      lastLogin: "Just now",
    };

    setUsers([created, ...users]);
    setIsInviteModalOpen(false);
    setNewUserEmail("");
    setNewUserName("");
    setNewUserTitle("");
    showToast(`Test User "${created.name}" created and assigned ${created.role} permissions!`);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setUsers(users.map((u) => (u.id === editingUser.id ? editingUser : u)));
    if (activeTestUser.id === editingUser.id) {
      setActiveTestUser(editingUser);
    }
    setIsEditModalOpen(false);
    showToast(`Permissions updated for ${editingUser.name}!`);
  };

  const handleInjectPreset = (presetRole: AdminUser["role"], orgName: string, name: string, title: string, email: string) => {
    const avatarIndex = (users.length % 30) + 1;
    const created: AdminUser = {
      id: `usr-${Date.now()}`,
      name,
      email,
      role: presetRole,
      title,
      orgName,
      orgId: orgName === "EduSuite Nigeria" ? "org-01" : "org-02",
      avatar: `/avatar${avatarIndex}.png`,
      twoFactorEnabled: true,
      status: "Active",
      lastLogin: "Active right now",
    };

    setUsers([created, ...users]);
    setActiveTestUser(created);
    showToast(`Preset "${created.name}" (${created.role}) activated!`);
  };

  const capabilitiesList = [
    { key: "canManagePlatform", label: "Root Platform Observability & Tenant Admin", desc: "Access SuperAdmin console, cross-tenant telemetry, and provision new workspaces." },
    { key: "canArmCircuitBreaker", label: "Global Emergency Circuit Breaker Killswitch", desc: "Immediately pause all outbound autonomous agent activity globally." },
    { key: "canManageInfrastructure", label: "BYOK Model Gateway & Channel Pipe Config", desc: "Inject OpenAI/Anthropic keys, configure WhatsApp WABA, and verified DNS." },
    { key: "canManageTeamRBAC", label: "Team Management & RBAC Role Assignment", desc: "Invite workspace members and modify access control roles." },
    { key: "canApproveActions", label: "1-Click Approvals (Email Drops & Ad Budget)", desc: "Sign off on pending email broadcasts, WhatsApp outreach, and Meta budget raises." },
    { key: "canCreateCampaigns", label: "Draft & Launch Autonomous Campaigns", desc: "Configure target ICPs, multi-stage sequences, and trigger revenue swarms." },
    { key: "canManageLeads", label: "Leads Intelligence, CRM & Dialogue Handoff", desc: "Filter enriched prospects, view conversation transcripts, and book sales calls." },
    { key: "canViewAnalytics", label: "View Executive Briefings & Revenue Dashboards", desc: "Read-only access to morning briefings, velocity metrics, and audit logs." },
  ];

  return (
    <AdminShell>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-[#ECFDF5] text-[#0E9F6E] dark:bg-[#10B981]/20 dark:text-[#34D399] border border-[#0E9F6E]/30 text-xs font-bold flex items-center gap-2 shadow-2xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Invite User Modal */}
      <NexaModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite / Provision Test User"
        subtitle="Add a new operator with designated workspace and RBAC role"
      >
        <form onSubmit={handleInviteUser} className="space-y-4">
          <NexaInput
            label="Full Name"
            placeholder="e.g. Victor Okafor"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            required
          />
          <NexaInput
            label="Email Address"
            type="email"
            placeholder="e.g. victor@edusuite.ng"
            value={newUserEmail}
            onChange={(e) => setNewUserEmail(e.target.value)}
            required
          />
          <NexaInput
            label="Job Title / Department"
            placeholder="e.g. Revenue Operations Analyst"
            value={newUserTitle}
            onChange={(e) => setNewUserTitle(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--nexa-text-muted)]">
              Assign Organization Workspace
            </label>
            <select
              value={newUserOrg}
              onChange={(e) => setNewUserOrg(e.target.value)}
              className="w-full h-11 px-3 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#7E22CE]"
            >
              <option value="EduSuite Nigeria">EduSuite Nigeria (org-01)</option>
              <option value="PayFlow Africa">PayFlow Africa (org-02)</option>
              <option value="HealthBridge Clinics">HealthBridge Clinics (org-03)</option>
              <option value="Platform Operator">Platform Operator (Root Global)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--nexa-text-muted)]">
              Role-Based Access Control (RBAC)
            </label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as any)}
              className="w-full h-11 px-3 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#7E22CE]"
            >
              <option value="SUPER_ADMIN">SUPER_ADMIN · Full Platform Operator</option>
              <option value="TENANT_OWNER">TENANT_OWNER · Workspace Admin & BYOK Keys</option>
              <option value="GROWTH_LEAD">GROWTH_LEAD · Campaigns & 1-Click Approvals</option>
              <option value="SALES_REP">SALES_REP · Leads CRM & Outreach Handoff</option>
              <option value="VIEWER">VIEWER · Read-Only Analytics & Briefings</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
            <NexaButton size="sm" variant="outline" type="button" onClick={() => setIsInviteModalOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton size="sm" variant="primary" type="submit" className="bg-[#7E22CE] text-white">
              Provision Test User
            </NexaButton>
          </div>
        </form>
      </NexaModal>

      {/* Edit User Modal */}
      {editingUser && (
        <NexaModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit User: ${editingUser.name}`}
          subtitle={`Modify RBAC role permissions, status, and 2FA authentication`}
        >
          <form onSubmit={handleSaveEditUser} className="space-y-4">
            <NexaInput
              label="Full Name"
              value={editingUser.name}
              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
              required
            />
            <NexaInput
              label="Email Address"
              value={editingUser.email}
              onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
              required
            />
            <NexaInput
              label="Job Title"
              value={editingUser.title || ""}
              onChange={(e) => setEditingUser({ ...editingUser, title: e.target.value })}
            />

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--nexa-text-muted)]">
                Assigned RBAC Role
              </label>
              <select
                value={editingUser.role}
                onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as any })}
                className="w-full h-11 px-3 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#7E22CE]"
              >
                <option value="SUPER_ADMIN">SUPER_ADMIN (Root Platform Operator)</option>
                <option value="TENANT_OWNER">TENANT_OWNER (Workspace Admin)</option>
                <option value="GROWTH_LEAD">GROWTH_LEAD (Campaigns & Approvals)</option>
                <option value="SALES_REP">SALES_REP (Leads & CRM)</option>
                <option value="VIEWER">VIEWER (Read-Only Analytics)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--nexa-text-muted)]">Account Status</label>
                <select
                  value={editingUser.status}
                  onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value as any })}
                  className="w-full h-11 px-3 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Invited">Invited</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--nexa-text-muted)]">2FA Enforced</label>
                <select
                  value={editingUser.twoFactorEnabled ? "true" : "false"}
                  onChange={(e) => setEditingUser({ ...editingUser, twoFactorEnabled: e.target.value === "true" })}
                  className="w-full h-11 px-3 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none"
                >
                  <option value="true">Enabled (Enforced)</option>
                  <option value="false">Disabled (Optional)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-[var(--nexa-border)]">
              <button
                type="button"
                onClick={() => {
                  setUsers(users.filter((u) => u.id !== editingUser.id));
                  setIsEditModalOpen(false);
                  showToast(`User ${editingUser.name} removed.`);
                }}
                className="text-xs text-[#E02424] font-bold hover:underline cursor-pointer"
              >
                Delete User
              </button>

              <div className="flex items-center gap-2">
                <NexaButton size="sm" variant="outline" type="button" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </NexaButton>
                <NexaButton size="sm" variant="primary" type="submit" className="bg-[#7E22CE] text-white">
                  Save Changes
                </NexaButton>
              </div>
            </div>
          </form>
        </NexaModal>
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="purple" dot>
                Cross-Tenant Directory
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                {users.length} Registered Test Users & RBAC Roles
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              Test Users & Access Control (RBAC)
            </h1>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Manage multi-tenant user accounts, test role permissions, inspect capability matrices, and simulate user sessions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <NexaButton
              size="sm"
              variant="outline"
              onClick={() => {
                setUsers(INITIAL_ADMIN_USERS);
                setActiveTestUser(INITIAL_ADMIN_USERS[0]);
                showToast("Reset to 10 default test users!");
              }}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reset Defaults
            </NexaButton>
            <NexaButton
              size="sm"
              variant="primary"
              onClick={() => setIsInviteModalOpen(true)}
              className="bg-[#7E22CE] text-white"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Test User
            </NexaButton>
          </div>
        </div>

        {/* Impersonation / Active Persona Hero Card */}
        <NexaCard
          variant="glass"
          padding="md"
          className="relative overflow-hidden border-2 border-[#7E22CE]/30 bg-gradient-to-r from-[#7E22CE]/10 via-[var(--nexa-bg-surface)] to-[var(--nexa-bg-base)]"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <NexaAvatar
                name={activeTestUser.name}
                src={activeTestUser.avatar}
                size="lg"
                status={activeTestUser.status === "Active" ? "online" : "idle"}
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider">
                    Current Simulated Persona:
                  </span>
                  <span className="font-extrabold text-sm text-[var(--nexa-text-primary)]">
                    {activeTestUser.name}
                  </span>
                  <NexaBadge
                    variant={
                      activeTestUser.role === "SUPER_ADMIN"
                        ? "purple"
                        : activeTestUser.role === "TENANT_OWNER"
                        ? "brand"
                        : activeTestUser.role === "GROWTH_LEAD"
                        ? "cyan"
                        : activeTestUser.role === "SALES_REP"
                        ? "warning"
                        : "neutral"
                    }
                  >
                    {activeTestUser.role}
                  </NexaBadge>
                </div>
                <p className="text-xs text-[var(--nexa-text-secondary)] mt-0.5">
                  {activeTestUser.title} · <strong className="text-[var(--nexa-text-primary)]">{activeTestUser.orgName}</strong> ({activeTestUser.email})
                </p>
                <div className="flex items-center gap-3 text-[11px] text-[var(--nexa-text-muted)] mt-1.5 font-mono">
                  <span>Scope: {RBAC_ROLE_DEFINITIONS[activeTestUser.role]?.scope}</span>
                  <span>·</span>
                  <span>2FA: {activeTestUser.twoFactorEnabled ? "Enforced" : "Off"}</span>
                  <span>·</span>
                  <span>Status: {activeTestUser.status}</span>
                </div>
              </div>
            </div>

            {/* Quick Switch Dropdown */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <span className="text-xs text-[var(--nexa-text-muted)] font-semibold">Switch Persona:</span>
              <select
                value={activeTestUser.id}
                onChange={(e) => {
                  const target = users.find((u) => u.id === e.target.value);
                  if (target) {
                    setActiveTestUser(target);
                    showToast(`Active persona switched to ${target.name} (${target.role})`);
                  }
                }}
                className="h-9 px-3 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-bold outline-none focus:border-[#7E22CE] cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.role} ({u.orgName})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </NexaCard>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[var(--nexa-border)] pb-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("directory")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "directory"
                ? "bg-[#7E22CE] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Users Directory ({filteredUsers.length})
          </button>
          <button
            onClick={() => setActiveTab("matrix")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "matrix"
                ? "bg-[#1A56DB] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> RBAC Permission Matrix
          </button>
          <button
            onClick={() => setActiveTab("scenarios")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "scenarios"
                ? "bg-[#0E9F6E] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> 1-Click Test Scenarios
          </button>
        </div>

        {/* TAB 1: USER DIRECTORY */}
        {activeTab === "directory" && (
          <div className="space-y-4">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--nexa-bg-surface)]/80 border border-[var(--nexa-border)]">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--nexa-text-faint)]" />
                <input
                  type="text"
                  placeholder="Search test users by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#7E22CE]"
                />
              </div>

              {/* Pill Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
                <div className="flex items-center gap-1 bg-[var(--nexa-bg-base)] p-1 rounded-xl border border-[var(--nexa-border)]">
                  {["ALL", "SUPER_ADMIN", "TENANT_OWNER", "GROWTH_LEAD", "SALES_REP", "VIEWER"].map((role) => (
                    <button
                      key={role}
                      onClick={() => setSelectedRoleFilter(role)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        selectedRoleFilter === role
                          ? "bg-[#7E22CE] text-white"
                          : "text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                      }`}
                    >
                      {role.replace("_", " ")}
                    </button>
                  ))}
                </div>

                <select
                  value={selectedOrgFilter}
                  onChange={(e) => setSelectedOrgFilter(e.target.value)}
                  className="h-8 px-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-medium outline-none"
                >
                  <option value="ALL">All Workspaces</option>
                  <option value="EduSuite Nigeria">EduSuite Nigeria</option>
                  <option value="PayFlow Africa">PayFlow Africa</option>
                  <option value="HealthBridge Clinics">HealthBridge Clinics</option>
                  <option value="Platform Operator">Platform Operator</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <NexaCard variant="glass" padding="none" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-base)]/60 text-[var(--nexa-text-muted)] uppercase tracking-wider font-bold">
                      <th className="py-3.5 px-4">Test User</th>
                      <th className="py-3.5 px-3">Organization Workspace</th>
                      <th className="py-3.5 px-3">Assigned RBAC Role</th>
                      <th className="py-3.5 px-3">2FA Security</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-3">Last Active</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-medium">
                    {filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        className={`hover:bg-[var(--nexa-bg-base)]/40 transition-colors ${
                          activeTestUser.id === u.id ? "bg-[#7E22CE]/5 font-semibold" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <NexaAvatar name={u.name} src={u.avatar} size="sm" />
                            <div>
                              <div className="font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                                {u.name}
                                {activeTestUser.id === u.id && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#7E22CE] text-white font-bold uppercase">
                                    Simulating
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">
                                {u.title || "Operator"} · <span className="font-mono">{u.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-[var(--nexa-text-secondary)]">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-[var(--nexa-text-muted)]" />
                            <span>{u.orgName}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3">
                          <NexaBadge
                            variant={
                              u.role === "SUPER_ADMIN"
                                ? "purple"
                                : u.role === "TENANT_OWNER"
                                ? "brand"
                                : u.role === "GROWTH_LEAD"
                                ? "cyan"
                                : u.role === "SALES_REP"
                                ? "warning"
                                : "neutral"
                            }
                          >
                            {u.role}
                          </NexaBadge>
                        </td>
                        <td className="py-3.5 px-3">
                          {u.twoFactorEnabled ? (
                            <span className="text-[#0E9F6E] flex items-center gap-1 font-bold text-[11px]">
                              <ShieldCheck className="w-3.5 h-3.5" /> Enforced
                            </span>
                          ) : (
                            <span className="text-[var(--nexa-text-faint)] flex items-center gap-1 text-[11px]">
                              <Lock className="w-3.5 h-3.5" /> Optional
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <NexaBadge
                            variant={u.status === "Active" ? "success" : u.status === "Invited" ? "warning" : "danger"}
                          >
                            {u.status}
                          </NexaBadge>
                        </td>
                        <td className="py-3.5 px-3 text-[var(--nexa-text-muted)] font-mono text-[11px]">
                          {u.lastLogin}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setActiveTestUser(u);
                                showToast(`Now simulating ${u.name} (${u.role})`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[var(--nexa-bg-surface)] hover:bg-[#7E22CE] hover:text-white border border-[var(--nexa-border)] text-[11px] font-bold text-[var(--nexa-text-secondary)] transition-all cursor-pointer"
                              title="Simulate this user"
                            >
                              Simulate
                            </button>
                            <button
                              onClick={() => {
                                setEditingUser(u);
                                setIsEditModalOpen(true);
                              }}
                              className="p-1 rounded-lg text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)] transition-colors cursor-pointer"
                              title="Edit user role"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </NexaCard>
          </div>
        )}

        {/* TAB 2: RBAC PERMISSION MATRIX */}
        {activeTab === "matrix" && (
          <div className="space-y-6">
            <NexaCard variant="glass" padding="lg" className="space-y-6">
              <div>
                <h3 className="font-bold text-base text-[var(--nexa-text-primary)] text-display flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#1A56DB]" />
                  Role-Based Access Control (RBAC) Permission Matrix
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                  Detailed capability breakdown enforced at the API gateway and frontend level for each organization seat.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--nexa-border)] bg-[var(--nexa-bg-base)]/80 text-[var(--nexa-text-muted)] uppercase tracking-wider font-bold">
                      <th className="py-3 px-4 w-1/3">System Capability</th>
                      <th className="py-3 px-3 text-center">
                        <span className="text-[#7E22CE]">SUPER_ADMIN</span>
                      </th>
                      <th className="py-3 px-3 text-center">
                        <span className="text-[#1A56DB]">TENANT_OWNER</span>
                      </th>
                      <th className="py-3 px-3 text-center">
                        <span className="text-[#0E9F6E]">GROWTH_LEAD</span>
                      </th>
                      <th className="py-3 px-3 text-center">
                        <span className="text-[#F59E0B]">SALES_REP</span>
                      </th>
                      <th className="py-3 px-3 text-center">
                        <span className="text-[var(--nexa-text-muted)]">VIEWER</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--nexa-border)]">
                    {capabilitiesList.map((cap) => (
                      <tr key={cap.key} className="hover:bg-[var(--nexa-bg-base)]/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-[var(--nexa-text-primary)]">{cap.label}</div>
                          <div className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">{cap.desc}</div>
                        </td>
                        {["SUPER_ADMIN", "TENANT_OWNER", "GROWTH_LEAD", "SALES_REP", "VIEWER"].map((roleKey) => {
                          const hasPerm = (RBAC_ROLE_DEFINITIONS[roleKey]?.permissions as any)?.[cap.key];
                          return (
                            <td key={roleKey} className="py-3 px-3 text-center">
                              {hasPerm ? (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0E9F6E]/15 text-[#0E9F6E]">
                                  <Check className="w-3.5 h-3.5" />
                                </span>
                              ) : (
                                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500/10 text-[var(--nexa-text-faint)]">
                                  <X className="w-3.5 h-3.5 opacity-40" />
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </NexaCard>

            {/* Role Cards Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(RBAC_ROLE_DEFINITIONS).map((r) => (
                <NexaCard key={r.key} variant="glass" padding="md" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[var(--nexa-text-primary)]">{r.name}</h4>
                    <NexaBadge variant={r.badgeVariant}>{r.key}</NexaBadge>
                  </div>
                  <p className="text-xs text-[var(--nexa-text-secondary)] leading-relaxed">
                    {r.description}
                  </p>
                  <div className="pt-2 border-t border-[var(--nexa-border)] text-[11px] font-mono text-[var(--nexa-text-muted)] flex justify-between">
                    <span>Scope:</span>
                    <strong className="text-[var(--nexa-text-primary)]">{r.scope}</strong>
                  </div>
                </NexaCard>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: 1-CLICK TEST SCENARIOS */}
        {activeTab === "scenarios" && (
          <div className="space-y-6">
            <NexaCard variant="glass" padding="lg" className="space-y-6">
              <div>
                <h3 className="font-bold text-base text-[var(--nexa-text-primary)] text-display flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#0E9F6E]" />
                  Instant Test Personas & Authorization Scenarios
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                  Click any scenario below to immediately provision and switch to a targeted test user persona.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Scenario 1 */}
                <div className="p-4 rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-[#7E22CE]" />
                      SuperAdmin Global Root
                    </span>
                    <NexaBadge variant="purple">SUPER_ADMIN</NexaBadge>
                  </div>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Simulate platform administrator with emergency circuit breaker authority, multi-tenant database access, and global feature flag toggles.
                  </p>
                  <NexaButton
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => handleInjectPreset("SUPER_ADMIN", "Platform Operator", "Kelechi Root Admin", "Infrastructure Lead", "kelechi@gtmengine.internal")}
                  >
                    Simulate SuperAdmin Persona
                  </NexaButton>
                </div>

                {/* Scenario 2 */}
                <div className="p-4 rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#1A56DB]" />
                      Tenant Owner / Workspace Admin
                    </span>
                    <NexaBadge variant="brand">TENANT_OWNER</NexaBadge>
                  </div>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Simulate startup CEO with full workspace permissions: BYOK Model key allocation, WhatsApp WABA configuration, and colleague invitations.
                  </p>
                  <NexaButton
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => handleInjectPreset("TENANT_OWNER", "EduSuite Nigeria", "Tariq Ibrahim", "Co-Founder & CEO", "tariq@edusuite.ng")}
                  >
                    Simulate Tenant Owner Persona
                  </NexaButton>
                </div>

                {/* Scenario 3 */}
                <div className="p-4 rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                      <Zap className="w-4 h-4 text-[#0E9F6E]" />
                      Growth Lead (Approvals & Campaigns)
                    </span>
                    <NexaBadge variant="cyan">GROWTH_LEAD</NexaBadge>
                  </div>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Simulate campaign operator with permission to draft sequences, trigger cold email drops, and execute 1-click approvals on WhatsApp messages.
                  </p>
                  <NexaButton
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => handleInjectPreset("GROWTH_LEAD", "EduSuite Nigeria", "Oluwaseun Bakare", "Head of Growth", "seun@edusuite.ng")}
                  >
                    Simulate Growth Lead Persona
                  </NexaButton>
                </div>

                {/* Scenario 4 */}
                <div className="p-4 rounded-2xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#F59E0B]" />
                      Sales Representative (Restricted)
                    </span>
                    <NexaBadge variant="warning">SALES_REP</NexaBadge>
                  </div>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Simulate outbound SDR restricted to lead records and prospect chats (no access to BYOK keys, billing, or platform infrastructure).
                  </p>
                  <NexaButton
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => handleInjectPreset("SALES_REP", "PayFlow Africa", "Blessing Eze", "Outbound SDR", "blessing@payflow.africa")}
                  >
                    Simulate Sales Rep Persona
                  </NexaButton>
                </div>
              </div>
            </NexaCard>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
