"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import {
  Lock,
  Mail,
  Building2,
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe,
  Layers,
  Cpu,
} from "lucide-react";
import {
  IconBrandGoogle,
  IconBrandTelegram,
  IconBrandWhatsapp,
} from "@tabler/icons-react";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    fullName: "Adeyemi Phillips",
    email: "adeyemi@edusuite.ng",
    password: "password123",
    companyName: "EduSuite Solutions",
    niche: "EdTech & Private Schools",
    selectedPlan: "FREE_TRIAL",
    primaryChannel: "Email (AWS SES)",
  });
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningStatus, setProvisioningStatus] = useState("");

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCompleteSignup = () => {
    setIsProvisioning(true);
    setProvisioningStatus("Provisioning isolated workspace cluster...");

    setTimeout(() => {
      setProvisioningStatus("Configuring 14 Autonomous Swarm Agents...");
    }, 800);

    setTimeout(() => {
      setProvisioningStatus("Establishing Telegram CRO & AWS SES endpoints...");
    }, 1600);

    setTimeout(() => {
      setIsProvisioning(false);
      if (typeof window !== "undefined") {
        localStorage.setItem("nexa_auth_token", "mock-jwt-token-prod-2026");
        localStorage.setItem("nexa_user_email", formData.email);
      }
      router.push("/onboarding");
    }, 2400);
  };

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] flex flex-col justify-between text-[var(--nexa-text-primary)]">
      {/* Top Header */}
      <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-[var(--nexa-border)] p-1 flex items-center justify-center shadow-sm">
            <img src="/logo.png" alt="GTM AI Agency" className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-base text-[var(--nexa-text-primary)] text-display">
            GTM AI Agency
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--nexa-text-muted)]">Already have a workspace?</span>
          <Link href="/login" className="font-bold text-[#1A56DB] hover:underline">
            Sign In →
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-lg space-y-6">
          <NexaCard variant="glass" padding="lg" className="border-2 border-[#1A56DB]/20 shadow-2xl space-y-6">
            {/* Steps Indicator */}
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-4">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#1A56DB]">
                  Step {step} of 2
                </div>
                <h1 className="text-xl font-black text-display text-[var(--nexa-text-primary)]">
                  {step === 1 ? "Provision Swarm Workspace" : "Select Swarm Capacity"}
                </h1>
              </div>
              <NexaBadge variant="brand">14-Day Free Trial</NexaBadge>
            </div>

            {isProvisioning ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center mx-auto animate-pulse border border-[#1A56DB]/30">
                  <Cpu className="w-8 h-8 animate-spin" />
                </div>
                <h3 className="text-base font-bold text-[var(--nexa-text-primary)]">
                  {provisioningStatus}
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)] max-w-xs mx-auto">
                  Setting up Sterling Vance (CRO), Olivia Chen (Lead Hunter), and your dedicated GTM memory store...
                </p>
              </div>
            ) : step === 1 ? (
              <form onSubmit={handleNext} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <NexaInput
                    label="Full Name"
                    required
                    placeholder="Adeyemi Phillips"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    leftIcon={<User className="w-4 h-4 text-[var(--nexa-text-muted)]" />}
                  />
                  <NexaInput
                    label="Work Email"
                    type="email"
                    required
                    placeholder="adeyemi@edusuite.ng"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    leftIcon={<Mail className="w-4 h-4 text-[var(--nexa-text-muted)]" />}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <NexaInput
                    label="Company / Product Name"
                    required
                    placeholder="EduSuite Pro"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    leftIcon={<Building2 className="w-4 h-4 text-[var(--nexa-text-muted)]" />}
                  />
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--nexa-text-secondary)]">Target Industry / Niche</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. B2B SaaS, Schools, Logistics"
                      value={formData.niche}
                      onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                      className="w-full h-11 px-3 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                    />
                  </div>
                </div>

                <NexaInput
                  label="Password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  leftIcon={<Lock className="w-4 h-4 text-[var(--nexa-text-muted)]" />}
                />

                <div className="pt-2">
                  <NexaButton
                    size="lg"
                    type="submit"
                    variant="primary"
                    className="w-full font-extrabold text-sm shadow-md shadow-[#1A56DB]/20"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue to Channel & Plan Setup
                  </NexaButton>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Select Starting Plan (All plans include 14-day full free trial)
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      { id: "FREE_TRIAL", name: "Free Trial (14 Days)", price: "$0", desc: "100 Verified Leads · 1 Active Campaign" },
                      { id: "STARTER", name: "Starter Swarm", price: "$450/mo", desc: "1,000 Verified Leads · Email & WhatsApp" },
                      { id: "GROWTH", name: "Growth Swarm (Recommended)", price: "$1,200/mo", desc: "5,000 Verified Leads · Telegram CRO Bot · BYOK" },
                    ].map((plan) => (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, selectedPlan: plan.id })}
                        className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          formData.selectedPlan === plan.id
                            ? "bg-[#1A56DB]/10 border-[#1A56DB] text-[var(--nexa-text-primary)]"
                            : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] hover:border-[var(--nexa-border-strong)]"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{plan.name}</div>
                          <div className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">{plan.desc}</div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-sm text-[#1A56DB]">{plan.price}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <NexaButton size="md" variant="ghost" onClick={() => setStep(1)} className="font-bold text-xs">
                    ← Back
                  </NexaButton>
                  <NexaButton
                    size="lg"
                    variant="primary"
                    onClick={handleCompleteSignup}
                    className="flex-1 font-extrabold text-xs shadow-md shadow-[#1A56DB]/20"
                    rightIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Deploy 14-Agent Swarm Now
                  </NexaButton>
                </div>
              </div>
            )}
          </NexaCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-[var(--nexa-text-muted)]">
        By signing up, you agree to GTM AI Agency Terms of Service and Privacy Policy.
      </footer>
    </div>
  );
}
