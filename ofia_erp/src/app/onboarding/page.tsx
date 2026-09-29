"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import {
  validateSubdomainAvailability,
  normalizeSubdomainSlug,
  SubdomainValidationResult,
} from "@/lib/subdomain-checker";
import { USER_API } from "@/lib/api-client";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Building2,
  Store,
  ArrowRight,
  Sparkles,
  Globe,
  Lock,
  Layers,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [companyName, setCompanyName] = useState("Acme Global");
  const [slug, setSlug] = useState("acme");
  const [enableErp, setEnableErp] = useState(true);
  const [enableShop, setEnableShop] = useState(true);
  const [isCheckingRemote, setIsCheckingRemote] = useState(false);

  // Immediate synchronous validation result
  const [validation, setValidation] = useState<SubdomainValidationResult>(() =>
    validateSubdomainAvailability("acme")
  );

  // Debounced remote validation against database & API
  useEffect(() => {
    const raw = slug.trim();
    // Instant local check
    const localResult = validateSubdomainAvailability(raw);
    setValidation(localResult);

    if (!localResult.normalizedSlug || localResult.normalizedSlug.length < 3) {
      return;
    }

    // Debounced remote check against MySQL u721451974_nexa_db Organization table
    const timer = setTimeout(async () => {
      setIsCheckingRemote(true);
      try {
        const res = await USER_API.checkSubdomainAvailability(localResult.normalizedSlug);
        if (res) {
          setValidation({
            slug: raw,
            normalizedSlug: res.slug || localResult.normalizedSlug,
            isAvailable: res.is_available,
            category: (res.category as any) || (res.is_available ? "AVAILABLE" : "TENANT_TAKEN"),
            message: res.message || localResult.message,
            workspaceDomain: res.workspace_domain || localResult.workspaceDomain,
            storefrontDomain: res.storefront_domain || localResult.storefrontDomain,
            customShopDomain: res.custom_shop_domain || localResult.customShopDomain,
            suggestions: res.suggestions && res.suggestions.length > 0 ? res.suggestions : localResult.suggestions,
          });
        }
      } catch (err) {
        // Fallback gracefully to local validator
      } finally {
        setIsCheckingRemote(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [slug]);

  const handleCompanyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCompanyName(val);
    const autoSlug = normalizeSubdomainSlug(val);
    setSlug(autoSlug);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
  };

  const handleApplySuggestion = (suggestedSlug: string) => {
    setSlug(suggestedSlug);
  };

  const handleCompleteSetup = () => {
    if (!validation.isAvailable) return;
    startTransition(() => {
      router.push(`/tenant?slug=${encodeURIComponent(validation.normalizedSlug)}`);
    });
  };

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A56DB]/10 border border-[#1A56DB]/20 text-[#1A56DB] text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            WORKSPACE ONBOARDING
          </div>
          <h1 className="text-3xl font-extrabold text-display tracking-tight text-[var(--nexa-text-primary)]">
            Configure Your Ofia Workspace
          </h1>
          <p className="text-xs sm:text-sm text-[var(--nexa-text-muted)] max-w-md mx-auto">
            Reserve your organization's subdomains for multi-agent ERP operations and public digital storefront.
          </p>
        </div>

        <NexaCard variant="glass" padding="lg" className="space-y-6 border border-[var(--nexa-border)] shadow-2xl">
          {/* STEP 1: COMPANY NAME & SUBDOMAIN */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#1A56DB] text-white flex items-center justify-center text-xs font-bold">
                  1
                </span>
                Choose Company & Subdomain Slug
              </h3>
              {isCheckingRemote && (
                <span className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin text-[#1A56DB]" /> Checking registry...
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1.5">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. EduSuite Technologies"
                  value={companyName}
                  onChange={handleCompanyNameChange}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] focus:border-[#1A56DB] outline-none transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--nexa-text-primary)] mb-1.5">
                  Subdomain Handle (Slug)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 text-xs font-mono text-[var(--nexa-text-muted)] select-none">
                    https://
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={handleSlugChange}
                    placeholder="mybrand"
                    className={`w-full pl-18 pr-28 py-2.5 text-xs font-mono font-bold rounded-xl bg-[var(--nexa-bg-base)] border outline-none transition-all ${
                      validation.isAvailable
                        ? "border-[#0E9F6E] focus:ring-1 focus:ring-[#0E9F6E]"
                        : validation.category === "SYSTEM_RESERVED" ||
                          validation.category === "VERTICAL_RESERVED" ||
                          validation.category === "SECTOR_RESERVED" ||
                          validation.category === "NICHE_RESERVED"
                        ? "border-[#C88A3A] focus:ring-1 focus:ring-[#C88A3A]"
                        : "border-[#E02424] focus:ring-1 focus:ring-[#E02424]"
                    }`}
                  />
                  <span className="absolute right-3 text-xs font-mono text-[var(--nexa-text-muted)] select-none">
                    .ofia.ng
                  </span>
                </div>
              </div>

              {/* LIVE AVAILABILITY FEEDBACK CARD */}
              <div
                className={`p-3.5 rounded-xl border transition-all text-xs ${
                  validation.isAvailable
                    ? "bg-[#0E9F6E]/10 border-[#0E9F6E]/30 text-[#0E9F6E]"
                    : validation.category === "SYSTEM_RESERVED" ||
                      validation.category === "VERTICAL_RESERVED" ||
                      validation.category === "SECTOR_RESERVED" ||
                      validation.category === "NICHE_RESERVED"
                    ? "bg-[#C88A3A]/10 border-[#C88A3A]/30 text-[#C88A3A]"
                    : "bg-[#E02424]/10 border-[#E02424]/30 text-[#E02424]"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {validation.isAvailable ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : validation.category === "SYSTEM_RESERVED" ||
                    validation.category === "VERTICAL_RESERVED" ||
                    validation.category === "SECTOR_RESERVED" ||
                    validation.category === "NICHE_RESERVED" ? (
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1.5 flex-1">
                    <p className="font-semibold">{validation.message}</p>

                    {/* Available Domains Preview */}
                    {validation.isAvailable && (
                      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[var(--nexa-text-primary)]">
                        <div className="p-2 rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-[#1A56DB] shrink-0" />
                          <div className="truncate">
                            <span className="text-[10px] text-[var(--nexa-text-muted)] block">ERP Workspace</span>
                            <span className="font-mono font-bold">{validation.workspaceDomain}</span>
                          </div>
                        </div>

                        <div className="p-2 rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center gap-2">
                          <Store className="w-3.5 h-3.5 text-[#0E9F6E] shrink-0" />
                          <div className="truncate">
                            <span className="text-[10px] text-[var(--nexa-text-muted)] block">Digital Storefront</span>
                            <span className="font-mono font-bold">{validation.storefrontDomain}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Suggested Alternative Slugs if Taken / Reserved */}
                    {!validation.isAvailable && validation.suggestions.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] font-bold text-[var(--nexa-text-secondary)] block mb-1.5">
                          Available suggestions for your business:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {validation.suggestions.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => handleApplySuggestion(sug)}
                              className="px-2.5 py-1 rounded-lg bg-[var(--nexa-bg-surface)] hover:bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] hover:border-[#1A56DB] text-[11px] font-mono text-[var(--nexa-text-primary)] transition-all flex items-center gap-1 group cursor-pointer"
                            >
                              <span>{sug}</span>
                              <span className="text-[10px] text-[#1A56DB] group-hover:underline">Use</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: EXTENSIONS & MODULES */}
          <div className="space-y-3 pt-4 border-t border-[var(--nexa-border)]">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#1A56DB] text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              Activate Platform Capabilities
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setEnableErp(!enableErp)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  enableErp ? "border-[#1A56DB] bg-[#1A56DB]/5 shadow-sm" : "border-[var(--nexa-border)] opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#1A56DB]" />
                    <span className="font-bold text-xs">Enterprise ERP Suite</span>
                  </div>
                  {enableErp && <CheckCircle2 className="w-4 h-4 text-[#1A56DB]" />}
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)] mt-1">
                  AI GTM Swarm, Accounting & Invoicing, HR Quests, and MD Cockpit.
                </p>
                <div className="mt-2 text-[10px] font-mono text-[#1A56DB] font-bold">
                  {validation.normalizedSlug ? `${validation.normalizedSlug}.ofia.ng/erp` : "workspace.ofia.ng/erp"}
                </div>
              </div>

              <div
                onClick={() => setEnableShop(!enableShop)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  enableShop ? "border-[#0E9F6E] bg-[#0E9F6E]/5 shadow-sm" : "border-[var(--nexa-border)] opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#0E9F6E]" />
                    <span className="font-bold text-xs">Digital Shopfront</span>
                  </div>
                  {enableShop && <CheckCircle2 className="w-4 h-4 text-[#0E9F6E]" />}
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)] mt-1">
                  Public e-commerce storefront, product catalog, cart, and POS checkout.
                </p>
                <div className="mt-2 text-[10px] font-mono text-[#0E9F6E] font-bold">
                  {validation.normalizedSlug ? `${validation.normalizedSlug}.ofia.shop` : "workspace.ofia.shop"}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <NexaButton
              variant="primary"
              onClick={handleCompleteSetup}
              disabled={!validation.isAvailable || isPending}
              isLoading={isPending}
              className={`w-full justify-center py-2.5 text-xs font-bold ${
                validation.isAvailable
                  ? "bg-[#1A56DB] hover:bg-[#1545B0] text-white cursor-pointer"
                  : "bg-gray-400 opacity-50 cursor-not-allowed text-white"
              }`}
            >
              Complete Setup & Open Workspace <ArrowRight className="w-4 h-4 ml-1.5" />
            </NexaButton>
            {!validation.isAvailable && (
              <p className="text-[11px] text-center text-[var(--nexa-text-muted)] mt-2">
                Please select an available subdomain handle to proceed.
              </p>
            )}
          </div>
        </NexaCard>
      </div>
    </div>
  );
}

