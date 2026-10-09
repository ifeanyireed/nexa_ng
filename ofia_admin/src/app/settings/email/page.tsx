"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import {
  Mail,
  Server,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Send,
  Save,
  Eye,
  EyeOff,
  ExternalLink,
  ShieldCheck,
  Lock,
  Info,
} from "lucide-react";

export default function PlatformEmailSettingsPage() {
  // Platform SMTP Utility States (Brevo / Transactional Relay persisted to Postgres)
  const [smtpProvider, setSmtpProvider] = useState("brevo");
  const [smtpHost, setSmtpHost] = useState("smtp-relay.brevo.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpEncryption, setSmtpEncryption] = useState<"tls" | "ssl" | "none">("tls");
  const [smtpFromEmail, setSmtpFromEmail] = useState("hello@ofia.ng");
  const [smtpFromName, setSmtpFromName] = useState("Ofia Platform Root Security");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpHasPassword, setSmtpHasPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [smtpTestRecipient, setSmtpTestRecipient] = useState("reedbreednigeria@gmail.com");
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpSaveSuccess, setSmtpSaveSuccess] = useState(false);
  const [smtpTestStatus, setSmtpTestStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; isError: boolean } | null>(null);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    loadPlatformSmtpSettings();
  }, []);

  const loadPlatformSmtpSettings = async () => {
    try {
      const res = await fetch("/api/admin/smtp-settings");
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.provider) setSmtpProvider(d.provider);
        if (d.host) setSmtpHost(d.host);
        if (d.port) setSmtpPort(String(d.port));
        if (d.encryption) setSmtpEncryption(d.encryption);
        if (d.fromEmail) setSmtpFromEmail(d.fromEmail);
        if (d.fromName) setSmtpFromName(d.fromName);
        if (d.username) setSmtpUsername(d.username);
        setSmtpHasPassword(Boolean(d.hasPassword));
        if (d.password) {
          setSmtpPassword(d.password);
        } else {
          setSmtpPassword("");
        }
      }
    } catch (err) {
      console.warn("Could not load platform SMTP settings:", err);
    }
  };

  const handleSmtpProviderSelect = (prov: string) => {
    setSmtpProvider(prov);
    switch (prov) {
      case "brevo":
        setSmtpHost("smtp-relay.brevo.com");
        setSmtpPort("587");
        setSmtpEncryption("tls");
        break;
      case "hostinger":
        setSmtpHost("smtp.hostinger.com");
        setSmtpPort("465");
        setSmtpEncryption("ssl");
        break;
      case "gmail":
        setSmtpHost("smtp.gmail.com");
        setSmtpPort("587");
        setSmtpEncryption("tls");
        break;
      case "sendgrid":
        setSmtpHost("smtp.sendgrid.net");
        setSmtpPort("587");
        setSmtpEncryption("tls");
        setSmtpUsername("apikey");
        break;
      case "ses":
        setSmtpHost("email-smtp.us-east-1.amazonaws.com");
        setSmtpPort("587");
        setSmtpEncryption("tls");
        break;
      case "resend":
        setSmtpHost("smtp.resend.com");
        setSmtpPort("465");
        setSmtpEncryption("ssl");
        setSmtpUsername("resend");
        break;
      case "zoho":
        setSmtpHost("smtp.zoho.com");
        setSmtpPort("465");
        setSmtpEncryption("ssl");
        break;
      default:
        break;
    }
  };

  const handleSavePlatformSmtp = async () => {
    if (!smtpHost.trim() || !smtpFromEmail.trim()) {
      setSmtpTestStatus({ success: false, message: "Host and From Email are required." });
      return;
    }

    setIsSavingSmtp(true);
    setSmtpTestStatus(null);
    try {
      const res = await fetch("/api/admin/smtp-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: smtpProvider,
          host: smtpHost.trim(),
          port: Number(smtpPort) || 587,
          encryption: smtpEncryption,
          fromEmail: smtpFromEmail.trim(),
          fromName: smtpFromName.trim() || "Ofia Platform Root Security",
          username: smtpUsername.trim() || smtpFromEmail.trim(),
          password: smtpPassword === "••••••••" ? "" : smtpPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save Platform SMTP configuration");
      }

      setSmtpSaveSuccess(true);
      setSmtpHasPassword(true);
      showToast("Platform SMTP configuration saved to Postgres database!");
      setTimeout(() => setSmtpSaveSuccess(false), 3500);
      await loadPlatformSmtpSettings();
    } catch (err: any) {
      setSmtpTestStatus({ success: false, message: err.message });
      showToast(err.message, true);
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleTestPlatformSmtp = async () => {
    const recipient = smtpTestRecipient.trim();
    if (!recipient || !recipient.includes("@")) {
      setSmtpTestStatus({ success: false, message: "Please provide a valid test recipient email address." });
      return;
    }

    if (!smtpHost.trim() || !smtpFromEmail.trim()) {
      setSmtpTestStatus({ success: false, message: "Host and From Email must be provided before sending a test." });
      return;
    }

    setIsTestingSmtp(true);
    setSmtpTestStatus(null);
    try {
      const res = await fetch("/api/admin/smtp-settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          testEmail: recipient,
          provider: smtpProvider,
          host: smtpHost.trim(),
          port: Number(smtpPort) || 587,
          encryption: smtpEncryption,
          fromEmail: smtpFromEmail.trim(),
          fromName: smtpFromName.trim() || "Ofia Platform Root Security",
          username: smtpUsername.trim() || smtpFromEmail.trim(),
          password: smtpPassword === "••••••••" ? "" : smtpPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "SMTP test failed");
      }

      setSmtpTestStatus({ success: true, message: data.message });
      showToast("Platform SMTP test email dispatched successfully!");
    } catch (err: any) {
      setSmtpTestStatus({ success: false, message: err.message });
      showToast(err.message, true);
    } finally {
      setIsTestingSmtp(false);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-7 max-w-5xl">
        {/* Toast */}
        {toast && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
              toast.isError
                ? "bg-[#E02424]/15 border border-[#E02424]/30 text-[#E02424]"
                : "bg-[#0E9F6E]/15 border border-[#0E9F6E]/30 text-[#0E9F6E]"
            }`}
          >
            {toast.isError ? (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            )}
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="brand" dot>
                Platform Operator Console
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                Root Infrastructure Settings
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight flex items-center gap-2.5">
              <Mail className="w-7 h-7 text-[#1A56DB]" />
              Platform Email Settings
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <NexaButton
              size="sm"
              variant="outline"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              onClick={() => {
                loadPlatformSmtpSettings();
                showToast("Refreshed platform SMTP settings.");
              }}
            >
              Refresh Settings
            </NexaButton>
            <NexaButton
              size="sm"
              variant="primary"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={handleSavePlatformSmtp}
              isLoading={isSavingSmtp}
            >
              Save Platform SMTP
            </NexaButton>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#1A56DB]/10 via-[#7E3AF2]/10 to-[#0E9F6E]/10 border border-[#1A56DB]/20 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#1A56DB] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
            <Server className="w-4 h-4" />
          </div>
          <div className="text-xs space-y-1">
            <p className="font-bold text-[var(--nexa-text-primary)]">
              Platform Transactional Email Relay (Brevo / System Relay)
            </p>
            <p className="text-[var(--nexa-text-secondary)] leading-relaxed">
              These settings govern the platform's core email utility used for <strong>SuperAdmin authentication, password resets, organization invitations, and system security alerts</strong>. Settings are encrypted and stored centrally in PostgreSQL (<code className="font-mono text-[#1A56DB]">tenant_smtp_settings</code>, <code className="font-mono text-[#1A56DB]">tenant_slug = 'platform'</code>).
            </p>
          </div>
        </div>

        {/* PLATFORM SMTP CARD */}
        <NexaCard variant="glass" className="p-7 space-y-6 border border-nexa-border rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--nexa-border)] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-[var(--nexa-text-primary)] text-display flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#1A56DB]" />
                  Outgoing SMTP Relay Configuration
                </h3>
                <NexaBadge variant="success">Postgres Synced</NexaBadge>
              </div>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                Configure <strong>Brevo (Sendinblue)</strong>, Hostinger, or any custom mail relay for platform-level delivery.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://app.brevo.com/settings/keys/smtp"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl border border-[#1A56DB]/30 bg-[#1A56DB]/10 text-[#1A56DB] hover:bg-[#1A56DB]/20 flex items-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Brevo SMTP Dashboard
              </a>
            </div>
          </div>

          {/* PROVIDER PRESETS SELECTOR */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
              Select Outgoing Relay Provider Preset:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {[
                { id: "brevo", label: "Brevo", desc: "Recommended Relay" },
                { id: "hostinger", label: "Hostinger", desc: "Platform Default" },
                { id: "gmail", label: "Google Workspace", desc: "App Password" },
                { id: "sendgrid", label: "SendGrid", desc: "apikey login" },
                { id: "ses", label: "Amazon SES", desc: "AWS SMTP" },
                { id: "resend", label: "Resend", desc: "Port 465 SSL" },
                { id: "custom", label: "Custom SMTP", desc: "Manual Config" },
              ].map((p) => {
                const isSelected = smtpProvider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSmtpProviderSelect(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#1A56DB]/15 border-[#1A56DB] text-[#1A56DB] font-bold shadow-xs"
                        : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-slate-400 dark:hover:border-slate-600"
                    }`}
                  >
                    <div className="text-xs font-bold truncate flex items-center justify-between">
                      {p.label}
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#1A56DB]" />}
                    </div>
                    <div className="text-[10px] text-[var(--nexa-text-muted)] truncate">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* CREDENTIALS FORM */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                SMTP Server / Host <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="e.g. smtp-relay.brevo.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                SMTP Port <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Security / Encryption
              </label>
              <select
                value={smtpEncryption}
                onChange={(e) => setSmtpEncryption(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] cursor-pointer"
              >
                <option value="tls">STARTTLS / TLS (Port 587 recommended)</option>
                <option value="ssl">SSL / SMTPS (Port 465)</option>
                <option value="none">None (Port 25 - unencrypted)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                From Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={smtpFromEmail}
                onChange={(e) => setSmtpFromEmail(e.target.value)}
                placeholder="e.g. notifications@ofia.ng"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Sender Display Name
              </label>
              <input
                type="text"
                value={smtpFromName}
                onChange={(e) => setSmtpFromName(e.target.value)}
                placeholder="Ofia Platform Root Security"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
            </div>

            <div className="space-y-1 sm:col-span-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                SMTP Username (Brevo Login)
              </label>
              <input
                type="text"
                value={smtpUsername}
                onChange={(e) => setSmtpUsername(e.target.value)}
                placeholder="Your Brevo login email address"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  SMTP Password / Brevo Master Key
                </label>
                {smtpHasPassword && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Encrypted & saved in PostgreSQL
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  placeholder={
                    smtpHasPassword
                      ? "•••••••• (Leave blank to keep existing password)"
                      : "Enter Brevo SMTP Key (xsmtpsib-...)"
                  }
                  className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] transition-colors cursor-pointer z-10 p-1"
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* TEST DISPATCH & SAVE ACTIONS */}
          <div className="pt-3 border-t border-[var(--nexa-border)] space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--nexa-bg-base)] p-3.5 rounded-2xl border border-[var(--nexa-border)]">
              <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="email"
                  value={smtpTestRecipient}
                  onChange={(e) => setSmtpTestRecipient(e.target.value)}
                  placeholder="Recipient email for test..."
                  className="px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] flex-1 min-w-[220px]"
                />
                <button
                  type="button"
                  onClick={handleTestPlatformSmtp}
                  disabled={isTestingSmtp}
                  className="px-4 py-2 text-xs font-bold rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--nexa-text-primary)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isTestingSmtp ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Test Connection
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSavePlatformSmtp}
                disabled={isSavingSmtp}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-[#1A56DB] hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSavingSmtp ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : smtpSaveSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    Saved to Postgres!
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Platform SMTP
                  </>
                )}
              </button>
            </div>

            {/* LIVE TEST FEEDBACK ALERT */}
            {smtpTestStatus && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border shadow-xs animate-in fade-in ${
                  smtpTestStatus.success
                    ? "bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-500 font-semibold"
                    : "bg-rose-100 text-rose-950 border-rose-400 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-500 font-semibold"
                }`}
              >
                {smtpTestStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-800 dark:text-emerald-300 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-800 dark:text-rose-300 mt-0.5" />
                )}
                <div className="flex-1">
                  <span>{smtpTestStatus.message}</span>
                  {smtpTestStatus.success && (
                    <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-normal mt-0.5">
                      Note: Brevo test message dispatched. If not in Primary inbox, check Spam / Junk.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </NexaCard>
      </div>
    </AdminShell>
  );
}
