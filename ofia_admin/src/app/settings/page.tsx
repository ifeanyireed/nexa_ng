"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import {
  Sliders,
  Globe,
  Shield,
  Lock,
  Bell,
  CheckCircle2,
  Save,
  RefreshCw,
  Mail,
  AlertTriangle,
  ExternalLink,
  Server,
  Key,
  ShieldCheck,
  Building2,
  DollarSign,
  Clock,
  Radio,
  Sparkles,
  Info,
} from "lucide-react";

export default function PlatformGeneralSettingsPage() {
  const [platformName, setPlatformName] = useState("Ofia Enterprise Cloud");
  const [rootDomain, setRootDomain] = useState("ofia.ng");
  const [supportEmail, setSupportEmail] = useState("support@ofia.ng");
  const [securityEmail, setSecurityEmail] = useState("security@ofia.ng");
  const [defaultCurrency, setDefaultCurrency] = useState("NGN");
  const [defaultTimezone, setDefaultTimezone] = useState("Africa/Lagos");
  const [sessionTimeoutHours, setSessionTimeoutHours] = useState(168);
  const [enforce2fa, setEnforce2fa] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [broadcastBannerEnabled, setBroadcastBannerEnabled] = useState(false);
  const [broadcastBannerText, setBroadcastBannerText] = useState("");
  const [broadcastBannerType, setBroadcastBannerType] = useState<"info" | "warning" | "critical">("info");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/general-settings");
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.platformName) setPlatformName(d.platformName);
        if (d.rootDomain) setRootDomain(d.rootDomain);
        if (d.supportEmail) setSupportEmail(d.supportEmail);
        if (d.securityEmail) setSecurityEmail(d.securityEmail);
        if (d.defaultCurrency) setDefaultCurrency(d.defaultCurrency);
        if (d.defaultTimezone) setDefaultTimezone(d.defaultTimezone);
        if (d.sessionTimeoutHours !== undefined) setSessionTimeoutHours(d.sessionTimeoutHours);
        if (d.enforce2fa !== undefined) setEnforce2fa(d.enforce2fa);
        if (d.maintenanceMode !== undefined) setMaintenanceMode(d.maintenanceMode);
        if (d.broadcastBannerEnabled !== undefined) setBroadcastBannerEnabled(d.broadcastBannerEnabled);
        if (d.broadcastBannerText) setBroadcastBannerText(d.broadcastBannerText);
        if (d.broadcastBannerType) setBroadcastBannerType(d.broadcastBannerType);
      }
    } catch (err) {
      console.warn("Could not load general settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setToastMessage(null);
    try {
      const res = await fetch("/api/admin/general-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformName,
          rootDomain,
          supportEmail,
          securityEmail,
          defaultCurrency,
          defaultTimezone,
          sessionTimeoutHours: Number(sessionTimeoutHours),
          enforce2fa,
          maintenanceMode,
          broadcastBannerEnabled,
          broadcastBannerText,
          broadcastBannerType,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update platform settings");
      }

      setIsSaved(true);
      setToastMessage("Platform general settings saved and committed to PostgreSQL.");
      setTimeout(() => {
        setIsSaved(false);
        setToastMessage(null);
      }, 4000);
    } catch (err: any) {
      setToastMessage("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6 max-w-6xl pb-12">
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--nexa-border)] pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-[#1A56DB] flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-[var(--nexa-text-primary)]">
                Platform General Settings
              </h1>
              <NexaBadge variant="brand">Root Hub</NexaBadge>
            </div>
            <p className="text-xs text-[var(--nexa-text-muted)]">
              Global platform identities, root domain governance, operator security policies, and system defaults.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <NexaButton
              size="sm"
              variant="secondary"
              onClick={loadSettings}
              disabled={isLoading || isSaving}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
              className="text-xs font-bold"
            >
              Refresh
            </NexaButton>

            <NexaButton
              size="sm"
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              leftIcon={isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              className="bg-[#1A56DB] text-white hover:bg-[#1545B0] rounded-xl font-bold shadow-xs px-4"
            >
              {isSaving ? "Saving..." : isSaved ? "Saved to Postgres!" : "Save Settings"}
            </NexaButton>
          </div>
        </div>

        {/* TOAST / NOTIFICATION */}
        {toastMessage && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2.5 border transition-all animate-in fade-in ${
              toastMessage.startsWith("Error")
                ? "bg-rose-500/10 text-rose-600 border-rose-500/20"
                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            }`}
          >
            {toastMessage.startsWith("Error") ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
            )}
            <span>{toastMessage}</span>
          </div>
        )}

        {/* 1. ROOT IDENTITY & DOMAIN GOVERNANCE */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#1A56DB]" />
              Platform Identity & Public Domain
            </h3>
            <NexaBadge variant="neutral">Root Mesh</NexaBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Platform Name
              </label>
              <input
                type="text"
                value={platformName}
                onChange={(e) => setPlatformName(e.target.value)}
                placeholder="e.g. Ofia Enterprise Cloud"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
              <span className="text-[10px] text-[var(--nexa-text-muted)]">
                Global brand label visible across parent dashboards and receipts.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Root Apex Domain
              </label>
              <input
                type="text"
                value={rootDomain}
                onChange={(e) => setRootDomain(e.target.value)}
                placeholder="e.g. ofia.ng"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-mono"
              />
              <span className="text-[10px] text-[var(--nexa-text-muted)]">
                Parent wildcard mesh for tenant subdomains (*.{rootDomain || "ofia.ng"}).
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                SuperAdmin Escalation Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="e.g. support@ofia.ng"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
              <span className="text-[10px] text-[var(--nexa-text-muted)]">
                Primary contact for platform incidents and automated alerts.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Root Security & Compliance Email
              </label>
              <input
                type="email"
                value={securityEmail}
                onChange={(e) => setSecurityEmail(e.target.value)}
                placeholder="e.g. security@ofia.ng"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
              <span className="text-[10px] text-[var(--nexa-text-muted)]">
                Designated address for security vulnerability disclosures and DPO notices.
              </span>
            </div>
          </div>
        </NexaCard>

        {/* 2. OPERATOR SECURITY & SESSION GOVERNANCE */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Security Governance & Session Policies
            </h3>
            <NexaBadge variant="green">Zero-Trust</NexaBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center justify-between">
                <span>SuperAdmin Session Lifetime</span>
                <span className="text-[10px] text-[var(--nexa-text-muted)] font-mono">{sessionTimeoutHours} hours</span>
              </label>
              <select
                value={sessionTimeoutHours}
                onChange={(e) => setSessionTimeoutHours(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] cursor-pointer"
              >
                <option value={12}>12 Hours (High Security Strict)</option>
                <option value={24}>24 Hours (1 Day Standard)</option>
                <option value={72}>72 Hours (3 Days)</option>
                <option value={168}>168 Hours (7 Days Default)</option>
                <option value={720}>720 Hours (30 Days Extended)</option>
              </select>
              <span className="text-[10px] text-[var(--nexa-text-muted)]">
                Duration before operator JWT session expires and requires re-authentication.
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 font-bold text-xs text-[var(--nexa-text-primary)]">
                  <Key className="w-3.5 h-3.5 text-amber-500" />
                  <span>Enforce 2FA for Operators</span>
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Requires TOTP authenticator code on all privileged logins.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEnforce2fa(!enforce2fa)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  enforce2fa ? "bg-emerald-500" : "bg-neutral-300 dark:bg-neutral-700"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    enforce2fa ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </NexaCard>

        {/* 3. REGIONAL & CURRENCY DEFAULTS */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-500" />
              Regional & Financial Defaults
            </h3>
            <NexaBadge variant="amber">Localization</NexaBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Platform Primary Ledger Currency
              </label>
              <select
                value={defaultCurrency}
                onChange={(e) => setDefaultCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] cursor-pointer"
              >
                <option value="NGN">NGN (₦ - Nigerian Naira)</option>
                <option value="USD">USD ($ - United States Dollar)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="GHS">GHS (GH₵ - Ghanaian Cedi)</option>
                <option value="KES">KES (KSh - Kenyan Shilling)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Platform Root Timezone
              </label>
              <select
                value={defaultTimezone}
                onChange={(e) => setDefaultTimezone(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] cursor-pointer"
              >
                <option value="Africa/Lagos">Africa/Lagos (West Africa Time, UTC+1)</option>
                <option value="Africa/Accra">Africa/Accra (Greenwich Mean Time, UTC+0)</option>
                <option value="Africa/Nairobi">Africa/Nairobi (East Africa Time, UTC+3)</option>
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (Eastern Time)</option>
                <option value="Europe/London">Europe/London (BST / GMT)</option>
              </select>
            </div>
          </div>
        </NexaCard>

        {/* 4. MAINTENANCE MODE & BROADCAST BANNER */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-500" />
              Platform Maintenance & Broadcast Announcements
            </h3>
            <NexaBadge variant="purple">Operations</NexaBadge>
          </div>

          <div className="space-y-4">
            {/* MAINTENANCE TOGGLE */}
            <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-xs text-[var(--nexa-text-primary)]">
                  <span>Global Maintenance Mode</span>
                  {maintenanceMode && (
                    <NexaBadge variant="rose" className="text-[10px]">Active</NexaBadge>
                  )}
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)] max-w-xl">
                  When enabled, non-operator requests will display a scheduled maintenance screen. SuperAdmins retain full access.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                  maintenanceMode ? "bg-rose-500" : "bg-neutral-300 dark:bg-neutral-700"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    maintenanceMode ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* BROADCAST BANNER */}
            <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs text-[var(--nexa-text-primary)]">
                  <Bell className="w-3.5 h-3.5 text-blue-500" />
                  <span>Platform-Wide Broadcast Banner</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBroadcastBannerEnabled(!broadcastBannerEnabled)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    broadcastBannerEnabled ? "bg-[#1A56DB]" : "bg-neutral-300 dark:bg-neutral-700"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                      broadcastBannerEnabled ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {broadcastBannerEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold text-[var(--nexa-text-primary)]">
                      Announcement Banner Message
                    </label>
                    <input
                      type="text"
                      value={broadcastBannerText}
                      onChange={(e) => setBroadcastBannerText(e.target.value)}
                      placeholder="e.g. Scheduled database maintenance this Saturday 02:00 UTC."
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[var(--nexa-text-primary)]">
                      Banner Severity
                    </label>
                    <select
                      value={broadcastBannerType}
                      onChange={(e) => setBroadcastBannerType(e.target.value as any)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)] cursor-pointer"
                    >
                      <option value="info">Info (Blue)</option>
                      <option value="warning">Warning (Amber)</option>
                      <option value="critical">Critical (Rose)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </NexaCard>

        {/* 5. CONNECTED SERVICES HUB */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-xs text-[var(--nexa-text-primary)] uppercase tracking-wider px-1">
            Connected Platform Settings Subsystems
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/settings/email"
              className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-[#1A56DB] transition-all group flex flex-col justify-between gap-3 shadow-xs"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#1A56DB] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[var(--nexa-text-primary)] group-hover:text-[#1A56DB] transition-colors flex items-center gap-1.5">
                  <span>Email & SMTP Relay</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Configure root platform Brevo, Resend, or corporate SMTP relay for transactional alerts and broadcasts.
                </p>
              </div>
              <span className="text-[10px] font-bold text-[#1A56DB] font-mono">/settings/email &rarr;</span>
            </Link>

            <Link
              href="/system/features"
              className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-purple-500 transition-all group flex flex-col justify-between gap-3 shadow-xs"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[var(--nexa-text-primary)] group-hover:text-purple-600 transition-colors flex items-center gap-1.5">
                  <span>Feature Flags Controller</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Control canary releases, staged tenant rollouts, and feature switches globally.
                </p>
              </div>
              <span className="text-[10px] font-bold text-purple-600 font-mono">/system/features &rarr;</span>
            </Link>

            <Link
              href="/system"
              className="p-4 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:border-emerald-500 transition-all group flex flex-col justify-between gap-3 shadow-xs"
            >
              <div className="space-y-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Server className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-[var(--nexa-text-primary)] group-hover:text-emerald-600 transition-colors flex items-center gap-1.5">
                  <span>Infrastructure Telemetry</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h4>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Inspect database health, Meta WABA latency, and Celery background queue metrics.
                </p>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 font-mono">/system &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
