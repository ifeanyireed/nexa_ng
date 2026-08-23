"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { CheckCircle2, Building2, Store, Sliders, ArrowRight } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [slug, setSlug] = useState("mycompany");
  const [enableErp, setEnableErp] = useState(true);
  const [enableShop, setEnableShop] = useState(true);

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        <div className="text-center space-y-2">
          <NexaBadge variant="brand" className="font-mono text-xs">Setup Wizard</NexaBadge>
          <h1 className="text-2xl font-black text-[var(--nexa-text-primary)]">Welcome to Ofia Compass</h1>
          <p className="text-xs text-[var(--nexa-text-muted)]">Configure your workspace subdomains and active extensions.</p>
        </div>

        <NexaCard variant="glass" padding="lg" className="space-y-6 border border-[var(--nexa-border)] shadow-xl">
          {/* STEP 1: SUBDOMAIN SLUG */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1A56DB] text-white flex items-center justify-center text-xs">1</span>
              Choose Your Workspace Subdomain
            </h3>
            <NexaInput
              label="Tenant Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              helperText={`Workplace: ${slug}.ofia.ng • Shopfront: ${slug}.ofia.shop`}
            />
          </div>

          {/* STEP 2: EXTENSIONS */}
          <div className="space-y-3 pt-4 border-t border-[var(--nexa-border)]">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1A56DB] text-white flex items-center justify-center text-xs">2</span>
              Enable Modular Extensions
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setEnableErp(!enableErp)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  enableErp ? "border-[#1A56DB] bg-[#1A56DB]/5" : "border-[var(--nexa-border)] opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">Enterprise ERP</span>
                  {enableErp && <CheckCircle2 className="w-4 h-4 text-[#1A56DB]" />}
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">AI Swarm, Accounting, HR, and MD Cockpit.</p>
              </div>

              <div
                onClick={() => setEnableShop(!enableShop)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  enableShop ? "border-[#0E9F6E] bg-[#0E9F6E]/5" : "border-[var(--nexa-border)] opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs">Digital Shopfront</span>
                  {enableShop && <CheckCircle2 className="w-4 h-4 text-[#0E9F6E]" />}
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">Public store on {slug}.ofia.shop.</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <NexaButton
              variant="primary"
              onClick={() => router.push("/tenant")}
              className="w-full bg-[#1A56DB] text-white justify-center"
            >
              Complete Setup & Open Workspace <ArrowRight className="w-4 h-4 ml-1" />
            </NexaButton>
          </div>
        </NexaCard>
      </div>
    </div>
  );
}
