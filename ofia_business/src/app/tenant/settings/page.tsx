"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Globe,
  Save,
  Server,
  Settings,
  ShieldCheck,
  Sliders,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";

export default function TenantSettingsPage() {
  const [orgName, setOrgName] = useState("EduSuite Technologies Ltd");
  const [slug, setSlug] = useState("edusuite");
  const [customDomain, setCustomDomain] = useState("portal.edusuite.ng");
  const [erpExt, setErpExt] = useState(true);
  const [shopExt, setShopExt] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <BusinessShell
      title="Workspace Settings & Extension Configuration"
      subtitle="Configure organization branding, extension toggles (erp_ext, shop_front_ext), and custom domain DNS routing."
      action={
        <NexaButton
          size="sm"
          variant="primary"
          onClick={handleSave}
          leftIcon={<Save className="w-3.5 h-3.5" />}
          className="bg-[#1A56DB] text-white hover:bg-[#1545B0]"
        >
          {isSaved ? "Saved Successfully!" : "Save Changes"}
        </NexaButton>
      }
    >
      <div className="space-y-6 max-w-4xl">
        {/* ORGANIZATION BRANDING */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Settings className="w-4 h-4 text-[#1A56DB]" />
              Organization Profile & Subdomain
            </h3>
            <NexaBadge variant="brand">Primary Tenant</NexaBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <NexaInput
              label="Organization Legal Name"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
            />
            <NexaInput
              label="Tenant Slug Identifier"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              helperText="Determines client_slug.domain.ng and client_slug.domain.shop"
            />
          </div>
        </NexaCard>

        {/* MODULAR EXTENSIONS TOGGLES */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0E9F6E]" />
              Modular Tenant Extensions
            </h3>
            <NexaBadge variant="green">2 Enabled</NexaBadge>
          </div>

          <div className="space-y-3 text-xs">
            {/* ERP EXT */}
            <div className="p-3.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-[var(--nexa-text-primary)]">
                  <span>Enterprise ERP Suite (`erp_ext`)</span>
                  <NexaBadge variant="purple" className="text-[9px]">Internal</NexaBadge>
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Enables Admin AI Swarm, Accountant General Ledger, HR Appraisal Cycles, and Executive Cockpit on `client_slug.domain.ng`.
                </p>
              </div>
              <button
                onClick={() => setErpExt(!erpExt)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
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
            <div className="p-3.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-[var(--nexa-text-primary)]">
                  <span>Digital Shopfront (`shop_front_ext`)</span>
                  <NexaBadge variant="green" className="text-[9px]">Public</NexaBadge>
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Serves public customer-facing storefront on `client_slug.domain.shop` (no separate admin dashboard).
                </p>
              </div>
              <button
                onClick={() => setShopExt(!shopExt)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
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
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)]">
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
            <NexaInput
              label="Custom Domain"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              helperText="Point your DNS CNAME record to cname.ofia.ng to serve your custom branded portal."
            />

            <div className="p-3 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-1 font-mono text-xs text-[var(--nexa-text-muted)]">
              <div className="flex justify-between">
                <span>Record Type:</span>
                <span className="font-bold text-[var(--nexa-text-primary)]">CNAME</span>
              </div>
              <div className="flex justify-between">
                <span>Host:</span>
                <span className="font-bold text-[var(--nexa-text-primary)]">portal</span>
              </div>
              <div className="flex justify-between">
                <span>Target Value:</span>
                <span className="font-bold text-[#1A56DB]">cname.ofia.ng</span>
              </div>
            </div>
          </div>
        </NexaCard>
      </div>
    </BusinessShell>
  );
}
