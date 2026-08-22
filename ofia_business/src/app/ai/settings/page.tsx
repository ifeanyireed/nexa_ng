"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { EmailInfrastructureWizard } from "@/components/gtm/EmailInfrastructureWizard";
import { WhatsAppInfrastructureWizard } from "@/components/gtm/WhatsAppInfrastructureWizard";
import { TelegramInfrastructureWizard } from "@/components/gtm/TelegramInfrastructureWizard";
import { SocialInfrastructureWizard } from "@/components/gtm/SocialInfrastructureWizard";
import { ModelGatewayWizard } from "@/components/gtm/ModelGatewayWizard";
import {
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandLinkedin,
  IconBrandOpenai,
  IconMailFast,
} from "@tabler/icons-react";
import { ShieldCheck, Users, Plus, Check, X, Building2, Lock, Edit2, Mail, CheckCircle2 } from "lucide-react";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { NexaModal } from "@/components/nexa/NexaModal";
import { NexaInput } from "@/components/nexa/NexaInput";
import { RBAC_ROLE_DEFINITIONS, AdminUser, INITIAL_ADMIN_USERS } from "@/lib/admin-data";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"email" | "waba" | "telegram" | "byok" | "social" | "guardrails" | "team">("email");

  // Tenant Team State
  const [teamMembers, setTeamMembers] = useState<AdminUser[]>(
    INITIAL_ADMIN_USERS.filter((u) => u.orgName === "EduSuite Nigeria")
  );
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminUser["role"]>("GROWTH_LEAD");
  const [inviteTitle, setInviteTitle] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleInviteColleague = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail) return;

    const avatarIndex = ((teamMembers.length + 3) % 30) + 1;
    const newMember: AdminUser = {
      id: `usr-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      title: inviteTitle || "Team Member",
      orgName: "EduSuite Nigeria",
      orgId: "org-01",
      avatar: `/avatar${avatarIndex}.png`,
      twoFactorEnabled: true,
      status: "Active",
      lastLogin: "Active right now",
    };

    setTeamMembers([...teamMembers, newMember]);
    setIsInviteOpen(false);
    setInviteName("");
    setInviteEmail("");
    setInviteTitle("");
    showToast(`Test User "${newMember.name}" added to EduSuite with role ${newMember.role}!`);
  };

  return (
    <AppShell>
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-2xl bg-[#ECFDF5] text-[#0E9F6E] dark:bg-[#10B981]/20 dark:text-[#34D399] border border-[#0E9F6E]/30 text-xs font-bold flex items-center gap-2 shadow-2xl animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Invite Member Modal */}
      <NexaModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Workspace Member"
        subtitle="Provision a team seat with designated RBAC permissions for EduSuite Nigeria"
      >
        <form onSubmit={handleInviteColleague} className="space-y-4">
          <NexaInput
            label="Full Name"
            placeholder="e.g. Victor Okafor"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
            required
          />
          <NexaInput
            label="Email Address"
            type="email"
            placeholder="e.g. victor@edusuite.ng"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
          />
          <NexaInput
            label="Job Title / Department"
            placeholder="e.g. Revenue Operations Associate"
            value={inviteTitle}
            onChange={(e) => setInviteTitle(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--nexa-text-muted)]">
              Workspace Role (RBAC)
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              className="w-full h-11 px-3 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
            >
              <option value="TENANT_OWNER">TENANT_OWNER · Full Workspace Admin (BYOK, WABA & Billing)</option>
              <option value="GROWTH_LEAD">GROWTH_LEAD · Campaigns, 1-Click Approvals & Sequences</option>
              <option value="SALES_REP">SALES_REP · Lead CRM, Transcripts & Meeting Bookings</option>
              <option value="VIEWER">VIEWER · Read-Only Analytics & Morning Briefings</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
            <NexaButton size="sm" variant="outline" type="button" onClick={() => setIsInviteOpen(false)}>
              Cancel
            </NexaButton>
            <NexaButton size="sm" variant="primary" type="submit" className="bg-[#1A56DB] text-white">
              Send Invite
            </NexaButton>
          </div>
        </form>
      </NexaModal>

      <div className="space-y-6 max-w-5xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="brand">Tenant Workspace Settings</NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                Email, WABA, Telegram CRO, Model APIs & Controls
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              Integrations & AI Settings
            </h1>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Configure outreach delivery pipes, Meta WhatsApp WABA, free Telegram CRO chatbot, custom AI Model keys (BYOK), and autonomous thresholds.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-[var(--nexa-border)] pb-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("email")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "email"
                ? "bg-[#1A56DB] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <IconMailFast className="w-4 h-4" /> Email & SMTP
          </button>
          <button
            onClick={() => setActiveTab("waba")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "waba"
                ? "bg-[#0E9F6E] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <IconBrandWhatsapp className="w-4 h-4" /> Meta WhatsApp (WABA)
          </button>
          <button
            onClick={() => setActiveTab("telegram")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "telegram"
                ? "bg-[#0088CC] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <IconBrandTelegram className="w-4 h-4" /> Telegram CRO Bot (Free)
          </button>
          <button
            onClick={() => setActiveTab("byok")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "byok"
                ? "bg-[#7E22CE] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <IconBrandOpenai className="w-4 h-4" /> Model APIs (BYOK)
          </button>
          <button
            onClick={() => setActiveTab("social")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "social"
                ? "bg-[#C88A3A] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <IconBrandLinkedin className="w-4 h-4" /> Social & Webhooks
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "team"
                ? "bg-[#1A56DB] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <Users className="w-4 h-4" /> Team & RBAC ({teamMembers.length})
          </button>
          <button
            onClick={() => setActiveTab("guardrails")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "guardrails"
                ? "bg-[var(--nexa-text-primary)] text-[var(--nexa-bg-base)] shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-surface)]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" /> Safety Guardrails
          </button>
        </div>

        {/* Tab 1: Provider-Agnostic Email Infrastructure & 3-Step Guided Domain Wizard */}
        {activeTab === "email" && <EmailInfrastructureWizard />}

        {/* Tab 2: WhatsApp Meta Cloud API Wizard */}
        {activeTab === "waba" && <WhatsAppInfrastructureWizard />}

        {/* Tab 3: Telegram CRO Copilot Wizard (Free) */}
        {activeTab === "telegram" && <TelegramInfrastructureWizard />}

        {/* Tab 4: BYOK Model Gateway & Multi-Key Pools Wizard */}
        {activeTab === "byok" && <ModelGatewayWizard />}

        {/* Tab 5: Social Publishing Channels & Outbound Webhooks Wizard */}
        {activeTab === "social" && <SocialInfrastructureWizard />}

        {/* Tab 6: Team & RBAC Access */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <NexaCard variant="glass" padding="lg" className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--nexa-border)] pb-4">
                <div>
                  <h3 className="font-bold text-base text-[var(--nexa-text-primary)] text-display flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#1A56DB]" />
                    EduSuite Team & Workspace Role Assignments (RBAC)
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                    Manage team seats, assign granular role permissions, and test multi-seat workflows in EduSuite Nigeria.
                  </p>
                </div>

                <NexaButton
                  size="sm"
                  variant="primary"
                  onClick={() => setIsInviteOpen(true)}
                  className="bg-[#1A56DB] text-white"
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Invite Team Member
                </NexaButton>
              </div>

              {/* Members List */}
              <div className="divide-y divide-[var(--nexa-border)]">
                {teamMembers.map((member) => (
                  <div key={member.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <NexaAvatar name={member.name} src={member.avatar} size="md" status={member.status === "Active" ? "online" : "idle"} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--nexa-text-primary)]">{member.name}</span>
                          <NexaBadge
                            variant={
                              member.role === "TENANT_OWNER"
                                ? "brand"
                                : member.role === "GROWTH_LEAD"
                                ? "cyan"
                                : member.role === "SALES_REP"
                                ? "warning"
                                : "neutral"
                            }
                          >
                            {member.role}
                          </NexaBadge>
                        </div>
                        <p className="text-xs text-[var(--nexa-text-muted)] mt-0.5">
                          {member.title} · <span className="font-mono">{member.email}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right text-[11px] text-[var(--nexa-text-muted)] hidden sm:block">
                        <div>2FA: <strong className="text-[#0E9F6E]">Enforced</strong></div>
                        <div className="font-mono">Last Active: {member.lastLogin}</div>
                      </div>

                      <select
                        value={member.role}
                        onChange={(e) => {
                          const updated = teamMembers.map((m) =>
                            m.id === member.id ? { ...m, role: e.target.value as any } : m
                          );
                          setTeamMembers(updated);
                          showToast(`Updated ${member.name}'s role to ${e.target.value}`);
                        }}
                        className="h-8 px-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] font-semibold outline-none cursor-pointer"
                      >
                        <option value="TENANT_OWNER">TENANT_OWNER</option>
                        <option value="GROWTH_LEAD">GROWTH_LEAD</option>
                        <option value="SALES_REP">SALES_REP</option>
                        <option value="VIEWER">VIEWER</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </NexaCard>

            {/* Workspace RBAC Capability Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--nexa-text-primary)]">TENANT_OWNER</span>
                  <NexaBadge variant="brand">Full Admin</NexaBadge>
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)] leading-relaxed">
                  Can edit BYOK keys, configure WhatsApp WABA, add custom email domains, and manage team billing.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--nexa-text-primary)]">GROWTH_LEAD</span>
                  <NexaBadge variant="cyan">Campaigns</NexaBadge>
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)] leading-relaxed">
                  Can draft autonomous campaigns, review & 1-click approve email drops, and trigger ad budget scaling.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--nexa-text-primary)]">SALES_REP</span>
                  <NexaBadge variant="warning">Leads & CRM</NexaBadge>
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)] leading-relaxed">
                  Can inspect enriched ICP leads, read prospect conversation transcripts, and hand off meetings.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[var(--nexa-text-primary)]">VIEWER</span>
                  <NexaBadge variant="neutral">Read Only</NexaBadge>
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)] leading-relaxed">
                  Read-only view of morning briefings, weekly revenue projections, and executive velocity dashboards.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Safety Guardrails */}
        {activeTab === "guardrails" && (
          <NexaCard variant="glass" padding="lg" className="space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div>
                <h3 className="font-bold text-base text-[var(--nexa-text-primary)] text-display flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#E02424]" />
                  Autonomous Safety & Human-in-the-Loop Thresholds
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)]">
                  Set hard limits where AI agents can execute automatically vs require human sign-off in the Approval Center.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Email Sequence Approvals
                </div>
                <div className="text-[11px] text-[var(--nexa-text-muted)]">
                  Always require manual review for cold email sequences sent to &gt; 100 prospects.
                </div>
                <NexaBadge variant="brand">Enforced</NexaBadge>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Ad Budget Scaling Limit
                </div>
                <div className="text-[11px] text-[var(--nexa-text-muted)]">
                  Kieran Patel can scale daily ad spend by max 20% without requiring explicit authorization.
                </div>
                <NexaBadge variant="cyan">Max +20% / Day</NexaBadge>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Automatic Circuit Breakers
                </div>
                <div className="text-[11px] text-[var(--nexa-text-muted)]">
                  Automatically trip Noah Sterling if cold email bounce rate exceeds 4.0%.
                </div>
                <NexaBadge variant="danger">Bounce &gt; 4%</NexaBadge>
              </div>
            </div>
          </NexaCard>
        )}
      </div>
    </AppShell>
  );
}
