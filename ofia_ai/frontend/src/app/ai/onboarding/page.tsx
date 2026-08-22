"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaInput } from "@/components/nexa/NexaInput";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Package,
  Users,
  Target,
  Palette,
  BookOpen,
  Radio,
  Compass,
  Rocket,
  Zap,
  Loader2,
} from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessName: "EduSuite Systems",
    businessDescription: "We provide automated school management and tuition reconciliation software to private schools in West Africa.",
    productType: "B2B SaaS (₦450,000/term per school)",
    audience: "Proprietors, Bursars, and Directors of Private Schools (250+ students)",
    primaryGoal: "Book 40 enterprise demos per month & automate fee collections",
    brandTone: "Authoritative, Prestigious, and Solutions-Oriented",
    websiteUrl: "https://edusuite.ng",
    channels: ["Email Outreach", "WhatsApp Business", "LinkedIn B2B"],
  });

  const [isResearching, setIsResearching] = useState(false);
  const [researchProgress, setResearchProgress] = useState(0);

  const triggerLaunch = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });
    setTimeout(() => {
      router.push("/");
    }, 1800);
  };

  const handleStep8Research = () => {
    setIsResearching(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setResearchProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsResearching(false);
        setCurrentStep(9);
      }
    }, 500);
  };

  const steps = [
    { num: 1, label: "Business", icon: Building2 },
    { num: 2, label: "Product", icon: Package },
    { num: 3, label: "Audience", icon: Users },
    { num: 4, label: "Goals", icon: Target },
    { num: 5, label: "Brand", icon: Palette },
    { num: 6, label: "Knowledge", icon: BookOpen },
    { num: 7, label: "Channels", icon: Radio },
    { num: 8, label: "AI Research", icon: Compass },
    { num: 9, label: "Review", icon: CheckCircle2 },
    { num: 10, label: "Launch", icon: Rocket },
  ];

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex flex-col items-center justify-center p-4 sm:p-6 antialiased relative overflow-hidden">
      {/* Background radial ambient lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#1A56DB]/15 to-[#0E9F6E]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] dark:text-[#60A5FA] text-xs font-bold mb-2">
            <Compass className="w-3.5 h-3.5" /> Business Navigation & Workforce Deployment
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
            Deploy Your Ofia AI Workforce
          </h1>
          <p className="text-xs text-[var(--nexa-text-muted)]">
            Step {currentStep} of 10 — {steps[currentStep - 1].label}
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-between gap-1 p-2 rounded-2xl liquid-glass border border-[var(--glass-border)]">
          {steps.map((st) => (
            <div
              key={st.num}
              className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                st.num <= currentStep
                  ? "bg-[#1A56DB] dark:bg-[#3B82F6]"
                  : "bg-[var(--nexa-border)]"
              }`}
            />
          ))}
        </div>

        {/* Dynamic Step Cards */}
        <NexaCard variant="glass" padding="lg" className="space-y-6">
          {/* Step 1: Business */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--nexa-border)]">
                <div className="p-2 rounded-xl bg-[#1A56DB] text-white">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">
                    What does your business do?
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Describe your core offering or enter your company profile.
                  </p>
                </div>
              </div>

              <NexaInput
                label="Company / Workspace Name"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--nexa-text-muted)]">
                  Business Description
                </label>
                <textarea
                  rows={4}
                  value={formData.businessDescription}
                  onChange={(e) => setFormData({ ...formData, businessDescription: e.target.value })}
                  className="w-full p-3 text-sm rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                />
              </div>
            </div>
          )}

          {/* Step 2: Product */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--nexa-border)]">
                <div className="p-2 rounded-xl bg-[#0E9F6E] text-white">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">
                    What are you selling?
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Provide details on your product, pricing, and delivery model.
                  </p>
                </div>
              </div>

              <NexaInput
                label="Product & Pricing Structure"
                value={formData.productType}
                onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
              />
            </div>
          )}

          {/* Step 3: Audience */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--nexa-border)]">
                <div className="p-2 rounded-xl bg-[#7E22CE] text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">
                    Who do you want to sell to?
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Describe your target ICP and decision makers.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--nexa-text-muted)]">
                  Ideal Customer Profile (ICP)
                </label>
                <textarea
                  rows={3}
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  className="w-full p-3 text-sm rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB]"
                />
              </div>
            </div>
          )}

          {/* Step 4: Goals */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--nexa-border)]">
                <div className="p-2 rounded-xl bg-[#C88A3A] text-white">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">
                    What are your primary revenue goals?
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Specify the monthly volume and conversion outcomes desired.
                  </p>
                </div>
              </div>

              <NexaInput
                label="Target Monthly Outcome"
                value={formData.primaryGoal}
                onChange={(e) => setFormData({ ...formData, primaryGoal: e.target.value })}
              />
            </div>
          )}

          {/* Step 5: Brand */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--nexa-border)]">
                <div className="p-2 rounded-xl bg-[#DB2777] text-white">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">
                    Brand Voice & Identity
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Set tone parameters for AI copywriters and managers.
                  </p>
                </div>
              </div>

              <NexaInput
                label="Brand Tone & Style"
                value={formData.brandTone}
                onChange={(e) => setFormData({ ...formData, brandTone: e.target.value })}
              />
            </div>
          )}

          {/* Step 6: Knowledge */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--nexa-border)]">
                <div className="p-2 rounded-xl bg-[#0E7490] text-white">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">
                    Connect Business Knowledge Base
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Provide your website or documentation URL for automated indexing.
                  </p>
                </div>
              </div>

              <NexaInput
                label="Website URL"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
              />
            </div>
          )}

          {/* Step 7: Channels */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--nexa-border)]">
                <div className="p-2 rounded-xl bg-[#1A56DB] text-white">
                  <Radio className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">
                    Connected Execution Channels
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Select the initial channels for outreach and publishing.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["Email Outreach", "WhatsApp Business", "LinkedIn B2B", "Meta Ads"].map((ch) => (
                  <div
                    key={ch}
                    className="p-3.5 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-surface)] flex items-center justify-between text-xs font-bold"
                  >
                    <span>{ch}</span>
                    <CheckCircle2 className="w-4 h-4 text-[#0E9F6E]" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 8: AI Research Phase */}
          {currentStep === 8 && (
            <div className="space-y-6 py-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#1A56DB]/10 text-[#1A56DB] dark:text-[#60A5FA] mx-auto flex items-center justify-center">
                <Compass className="w-8 h-8 animate-spin" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--nexa-text-primary)]">
                  Dr. Elena Rostova & Olivia Chen are researching your market...
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                  Scanning competitor pricing, extracting private school ICPs, and calculating TAM.
                </p>
              </div>

              {isResearching ? (
                <div className="space-y-2 max-w-sm mx-auto">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Synthesizing Strategy Map</span>
                    <span>{researchProgress}%</span>
                  </div>
                  <div className="w-full bg-[var(--nexa-border)] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#1A56DB] h-full transition-all duration-300"
                      style={{ width: `${researchProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <NexaButton
                  size="lg"
                  variant="primary"
                  onClick={handleStep8Research}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Start Deep AI Market Scan
                </NexaButton>
              )}
            </div>
          )}

          {/* Step 9: Strategy Summary Review */}
          {currentStep === 9 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--nexa-border)]">
                <div className="p-2 rounded-xl bg-[#0E9F6E] text-white">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[var(--nexa-text-primary)]">
                    CRO Strategy Summary Approved
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Sterling Vance has assembled your initial 3-touch revenue sequence.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2 text-xs">
                <div>
                  <strong className="text-[var(--nexa-text-primary)]">Target Segment: </strong>
                  <span className="text-[var(--nexa-text-secondary)]">
                    4,200 Private Academies in Nigeria (₦18M TAM)
                  </span>
                </div>
                <div>
                  <strong className="text-[var(--nexa-text-primary)]">Core Hook: </strong>
                  <span className="text-[var(--nexa-text-secondary)]">
                    Instant tuition reconciliation & WhatsApp parent receipts
                  </span>
                </div>
                <div>
                  <strong className="text-[var(--nexa-text-primary)]">Initial Batch: </strong>
                  <span className="text-[#0E9F6E] font-bold">
                    450 verified school administrators ready in Approval Center
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 10: Launch */}
          {currentStep === 10 && (
            <div className="space-y-6 py-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#1A56DB] to-[#0E9F6E] text-white mx-auto flex items-center justify-center shadow-xl">
                <Rocket className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display">
                  Your Ofia AI Workforce Is Ready!
                </h2>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-1 max-w-md mx-auto">
                  All 15 agents are initialized. Click below to enter your executive command office.
                </p>
              </div>

              <NexaButton
                size="xl"
                variant="primary"
                onClick={triggerLaunch}
                rightIcon={<ArrowRight className="w-5 h-5" />}
                className="w-full max-w-sm mx-auto shadow-xl"
              >
                Enter Executive Command
              </NexaButton>
            </div>
          )}

          {/* Navigation Controls */}
          {currentStep < 8 && (
            <div className="flex items-center justify-between pt-4 border-t border-[var(--nexa-border)]">
              <NexaButton
                size="md"
                variant="outline"
                disabled={currentStep === 1}
                onClick={() => setCurrentStep(currentStep - 1)}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </NexaButton>

              <NexaButton
                size="md"
                variant="primary"
                onClick={() => setCurrentStep(currentStep + 1)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Next Step
              </NexaButton>
            </div>
          )}

          {currentStep === 9 && (
            <div className="flex items-center justify-end pt-4 border-t border-[var(--nexa-border)]">
              <NexaButton
                size="lg"
                variant="primary"
                onClick={() => setCurrentStep(10)}
                rightIcon={<Rocket className="w-4 h-4" />}
              >
                Deploy AI Workforce
              </NexaButton>
            </div>
          )}
        </NexaCard>
      </div>
    </div>
  );
}
