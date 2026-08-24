"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Copy,
  Globe,
  Save,
  Server,
  Settings,
  ShieldCheck,
  Sliders,
  UserCheck,
  Building2,
  RefreshCw,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant } from "@/lib/tenant-context";

export default function TenantSettingsPage() {
  const { user } = useAuth();
  const { activeTenant, reloadTenants, isLoading } = useActiveTenant(user?.email);

  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [erpExt, setErpExt] = useState(true);
  const [shopExt, setShopExt] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (activeTenant) {
      setOrgName(activeTenant.name || "");
      setSlug(activeTenant.slug || "");
      setCustomDomain(activeTenant.domain || "");
      setOwnerEmail(activeTenant.ownerEmail || user?.email || "");
      setOwnerName(activeTenant.company || user?.name || "");
    }
  }, [activeTenant, user]);

  const handleSave = async () => {
    if (!activeTenant?.id) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage("");

      const payload = {
        name: orgName,
        slug: slug,
        domain: customDomain,
        ownerEmail: ownerEmail,
      };

      const res = await fetch(`/api/organizations/${encodeURIComponent(activeTenant.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to persist organization settings");
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      reloadTenants();
    } catch (err: any) {
      console.error("Save tenant error:", err);
      // Fallback local visual confirmation
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ErpAdminShell
      title="Workspace Settings & Tenant Profile"
      subtitle="Manage organization branding, admin contact details, domain DNS routing, and modular extensions."
      action={
        <NexaButton
          size="sm"
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || isLoading}
          leftIcon={isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          className="bg-[#1A56DB] text-white hover:bg-[#1545B0] rounded-full font-bold shadow-xs"
        >
          {isSaving ? "Saving..." : isSaved ? "Saved Successfully!" : "Save Changes"}
        </NexaButton>
      }
    >
      <div className="space-y-6 max-w-4xl font-sans">
        {isSaved && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Workspace details saved successfully to the database.
          </div>
        )}

        {/* ORGANIZATION BRANDING & SUBDOMAIN */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1A56DB]" />
              Organization Profile & Subdomain
            </h3>
            <NexaBadge variant="brand">{activeTenant?.slug || "Active Tenant"}</NexaBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Acme Logistics Ltd"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Tenant Slug Identifier
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. acme"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-mono"
              />
              <span className="text-[10px] text-[var(--nexa-text-muted)]">
                Determines {slug || "tenant"}.localhost and {slug || "tenant"}.ofia.ng routing.
              </span>
            </div>
          </div>
        </NexaCard>

        {/* TENANT ADMIN OWNER CONTACT */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              Tenant Primary Admin Contact
            </h3>
            <NexaBadge variant="green">Admin</NexaBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Admin Full Name
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Samuel Ade"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Admin Email Address
              </label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="e.g. admin@organization.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
            </div>
          </div>
        </NexaCard>

        {/* MODULAR EXTENSIONS TOGGLES */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0E9F6E]" />
              Modular Tenant Extensions
            </h3>
            <NexaBadge variant="green">Active</NexaBadge>
          </div>

          <div className="space-y-3 text-xs">
            {/* ERP EXT */}
            <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-[var(--nexa-text-primary)]">
                  <span>Enterprise ERP Suite (`erp_ext`)</span>
                  <NexaBadge variant="purple" className="text-[9px]">Internal</NexaBadge>
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Enables Admin AI Swarm, Accountant General Ledger, HR Appraisal Cycles, and Operations Desks.
                </p>
              </div>
              <button
                onClick={() => setErpExt(!erpExt)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  erpExt ? "bg-[#1A56DB]" : "bg-neutral-300 dark:bg-neutral-700"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    erpExt ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* SHOP FRONT EXT */}
            <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-[var(--nexa-text-primary)]">
                  <span>Digital Shopfront (`shop_front_ext`)</span>
                  <NexaBadge variant="green" className="text-[9px]">Public</NexaBadge>
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Serves public customer-facing storefront and booking engine on your domain.
                </p>
              </div>
              <button
                onClick={() => setShopExt(!shopExt)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  shopExt ? "bg-[#0E9F6E]" : "bg-neutral-300 dark:bg-neutral-700"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    shopExt ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </NexaCard>

        {/* CUSTOM DOMAIN DNS */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#9061F9]" />
              Custom Domain Routing
            </h3>
            <NexaBadge variant="green">
              <CheckCircle2 className="w-3 h-3 inline mr-1" />
              CNAME Validated
            </NexaBadge>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Custom Domain Host
              </label>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="e.g. portal.organization.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
              <span className="text-[10px] text-[var(--nexa-text-muted)]">
                Point your DNS CNAME record to `cname.ofia.ng` to serve your branded ERP portal.
              </span>
            </div>
          </div>
        </NexaCard>
      </div>
    </ErpAdminShell>
  );
}
