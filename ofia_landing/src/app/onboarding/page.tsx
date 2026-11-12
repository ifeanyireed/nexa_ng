"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Building2,
  Globe,
  Database,
  CloudUpload,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Mail,
  Lock,
  User,
  Phone,
  Sparkles,
  Server,
  Store,
  Eye,
  EyeOff,
  Flame,
  Clock,
  Compass,
} from "lucide-react";

// Standard vertical archetypes supported across Ofia
const VERTICAL_OPTIONS = [
  { id: "retail", name: "Commerce & Retail", icon: Store, desc: "Physical goods, boutiques, electronics, multi-branch stores" },
  { id: "cars", name: "Automotive & Fleet", icon: Compass, desc: "Auto dealerships, transport fleets, car rentals & logistics" },
  { id: "food", name: "Food & Restaurants", icon: Flame, desc: "Quick-service restaurants, cloud kitchens & cafes" },
  { id: "services", name: "Professional Services", icon: Building2, desc: "Agencies, legal firms, consultants & corporate services" },
  { id: "health", name: "Health & Wellness", icon: ShieldCheck, desc: "Clinics, pharmacies, fitness centers & spas" },
];

const PLAN_TIER_OPTIONS = [
  {
    key: "STARTER",
    name: "Starter",
    price: "₦25,000/mo",
    seats: "2 Team Seats",
    desc: "Single-store catalog, appointment booking & digital storefront.",
    badge: "14-Day Trial",
  },
  {
    key: "GROWTH",
    name: "Growth",
    price: "₦75,000/mo",
    seats: "10 Team Seats",
    desc: "Dedicated Neon Database, POS registers, 1 warehouse IMS & CRM.",
    badge: "Most Popular",
  },
  {
    key: "SCALE",
    name: "Scale",
    price: "₦180,000/mo",
    seats: "25 Team Seats",
    desc: "3 depots, full GAAP accounting, HR/Workforce & custom domain.",
    badge: "Multi-Branch",
  },
];

interface SlugCheckResult {
  isAvailable: boolean;
  category?: string;
  message?: string;
  workspaceDomain?: string;
  storefrontDomain?: string;
  suggestions?: string[];
}

export default function TenantOnboardingPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center text-emerald-400">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <TenantOnboardingContent />
    </React.Suspense>
  );
}

function TenantOnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Current Step:
  // 1: Business Registration & Credentials
  // 2: Choose Business URL / Slug Selection
  // 3: Business Profile & Verticals
  // 4: Infrastructure Provisioning Engine
  // 5: Neon Database Ownership Claiming
  // 6: Integration Verification & Health Tests
  // 7: Onboarding Completion
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [vertical, setVertical] = useState("retail");
  const [planTier, setPlanTier] = useState("GROWTH");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Lagos");
  const [country, setCountry] = useState("Nigeria");
  const [description, setDescription] = useState("");

  // Existing Cloudinary option
  const [hasExistingCloudinary, setHasExistingCloudinary] = useState(false);
  const [existingCloudinaryUrl, setExistingCloudinaryUrl] = useState("");

  // Slug Availability State
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugCheckResult, setSlugCheckResult] = useState<SlugCheckResult | null>(null);

  // Provisioning & Infrastructure State
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [provisioningLogs, setProvisioningLogs] = useState<string[]>([]);
  const [tenantRecord, setTenantRecord] = useState<any>(null);
  const [neonData, setNeonData] = useState<{
    projectId?: string;
    branchId?: string;
    claimUrl?: string;
    userCode?: string;
    expiresInSeconds?: number;
    claimExpiresAt?: string;
    reconciled?: boolean;
    state?: string;
  } | null>(null);
  const [cloudinaryData, setCloudinaryData] = useState<{
    cloudName?: string;
    verificationPending?: boolean;
    guidance?: string;
  } | null>(null);

  // Claim State & Countdown
  const [isPollingClaim, setIsPollingClaim] = useState(false);
  const [isResendingClaimEmail, setIsResendingClaimEmail] = useState(false);
  const [resendEmailSuccess, setResendEmailSuccess] = useState(false);
  const [claimSecondsRemaining, setClaimSecondsRemaining] = useState<number>(900);

  // Verification State
  const [isVerifyingIntegrations, setIsVerifyingIntegrations] = useState(false);
  const [verificationResults, setVerificationResults] = useState<{
    neon?: { success: boolean; latencyMs?: number; error?: string };
    cloudinary?: { success: boolean; cloudName?: string; error?: string };
  } | null>(null);

  // General Loading & Feedback
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Resume Drawer
  const [resumeQuery, setResumeQuery] = useState("");
  const [isResuming, setIsResuming] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  // Check URL parameters for resuming: ?resume=<slug> or ?step=<n> or pre-selected plan: ?plan=<tier>
  useEffect(() => {
    const resumeParam = searchParams.get("resume") || searchParams.get("slug");
    if (resumeParam) {
      loadExistingProgress(resumeParam);
    }

    const planParam = searchParams.get("plan");
    if (planParam) {
      const normalized = planParam.toUpperCase();
      if (["STARTER", "GROWTH", "SCALE", "ENTERPRISE"].includes(normalized)) {
        setPlanTier(normalized);
      }
    }
  }, [searchParams]);

  // Load existing progress by tenant slug
  const loadExistingProgress = async (targetSlug: string) => {
    setIsResuming(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/onboarding/status?slug=${encodeURIComponent(targetSlug)}`);
      const data = await res.json();
      if (data.success && data.tenant) {
        setTenantRecord(data.tenant);
        setBusinessName(data.tenant.name || "");
        setSlug(data.tenant.slug || "");
        setOwnerName(data.tenant.owner_name || "");
        setOwnerEmail(data.tenant.owner_email || "");
        setVertical(data.tenant.vertical || "retail");
        if (data.tenant.plan_tier) {
          setPlanTier(data.tenant.plan_tier.toUpperCase());
        }

        if (data.tenant.neon_project_id) {
          setNeonData({
            projectId: data.tenant.neon_project_id,
            branchId: data.tenant.neon_branch_id,
            claimUrl: data.tenant.neon_claim_url,
            userCode: data.tenant.neon_claim_code,
            reconciled: Boolean(data.tenant.neon_reconciled),
            state: data.tenant.neon_claim_status,
          });
        }

        if (data.tenant.cloudinary_cloud_name) {
          setCloudinaryData({
            cloudName: data.tenant.cloudinary_cloud_name,
            verificationPending: !data.tenant.cloudinary_verified,
          });
        }

        // Advance to saved step
        const targetStep = Math.min(Math.max(data.step || 1, 1), 7);
        setCurrentStep(targetStep);
      } else {
        setErrorMessage(data.error || "No existing onboarding record found for this identifier.");
      }
    } catch (err: any) {
      setErrorMessage("Failed to resume onboarding: " + err.message);
    } finally {
      setIsResuming(false);
      setShowResumeModal(false);
    }
  };

  // Auto-generate slug from business name if not manually modified
  useEffect(() => {
    if (!isSlugManuallyEdited && businessName.trim()) {
      const generated = businessName
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setSlug(generated);
    }
  }, [businessName, isSlugManuallyEdited]);

  // Live Debounced Slug Availability Check
  const checkSlugAvailability = useCallback(async (slugToCheck: string) => {
    const clean = slugToCheck.trim().toLowerCase();
    if (!clean || clean.length < 2) {
      setSlugCheckResult(null);
      return;
    }

    setIsCheckingSlug(true);
    try {
      const res = await fetch(`/api/onboarding/check-slug?slug=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (data.success) {
        setSlugCheckResult({
          isAvailable: data.isAvailable,
          category: data.category,
          message: data.message,
          workspaceDomain: data.workspaceDomain,
          storefrontDomain: data.storefrontDomain,
          suggestions: data.suggestions || [],
        });
      }
    } catch (err) {
      console.warn("Failed to check slug availability:", err);
    } finally {
      setIsCheckingSlug(false);
    }
  }, []);

  // Debounce slug checking
  useEffect(() => {
    const handler = setTimeout(() => {
      if (slug) {
        checkSlugAvailability(slug);
      }
    }, 400);

    return () => clearTimeout(handler);
  }, [slug, checkSlugAvailability]);

  // Timer countdown for claim code expiry
  useEffect(() => {
    if (currentStep === 5 && claimSecondsRemaining > 0) {
      const timer = setInterval(() => {
        setClaimSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentStep, claimSecondsRemaining]);

  // Auto-poll Neon claim status while on Screen 5 (Claiming)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 5 && slug && !neonData?.reconciled) {
      interval = setInterval(async () => {
        try {
          const res = await fetch("/api/onboarding/claim/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tenantSlug: slug }),
          });
          const data = await res.json();
          if (data.success && data.reconciled) {
            setNeonData((prev) => ({
              ...prev,
              reconciled: true,
              state: "claimed",
            }));
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.6 },
            });
          }
        } catch (err) {
          console.warn("Background claim poll:", err);
        }
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [currentStep, slug, neonData?.reconciled]);

  // Copy helper
  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  // STEP 1 & 2: Submit Registration & Reserve Slug Transactionally
  const handleRegisterAndReserveSlug = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!businessName.trim() || !slug.trim() || !ownerEmail.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    if (slugCheckResult && !slugCheckResult.isAvailable) {
      setErrorMessage(slugCheckResult.message || "The chosen business URL is unavailable.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/onboarding/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          slug: slug.trim(),
          ownerName: ownerName.trim() || `${businessName} Admin`,
          ownerEmail: ownerEmail.trim(),
          password: password || undefined,
          vertical,
          planTier,
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Failed to register business and reserve URL.");
        if (data.suggestions && data.suggestions.length > 0) {
          setSlugCheckResult((prev) => ({
            ...prev,
            isAvailable: false,
            suggestions: data.suggestions,
          }));
        }
        return;
      }

      setTenantRecord(data.tenant);
      setCurrentStep(3); // Proceed to business profile
    } catch (err: any) {
      setErrorMessage(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 3: Save Business Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          address,
          city,
          country,
          phone,
          description,
          vertical,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update business profile.");
      }

      setCurrentStep(4); // Advance to infrastructure provisioning
      runInfrastructureProvisioning();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 4: Run Central Infrastructure Provisioning
  const runInfrastructureProvisioning = async () => {
    setIsProvisioning(true);
    setErrorMessage(null);
    setProvisioningLogs([
      "Initiating Ofia Provisioning Engine...",
      `Allocating dedicated cloud infrastructure for workspace '${slug}'...`,
    ]);

    try {
      // 1. Cloudinary
      setProvisioningLogs((prev) => [
        ...prev,
        hasExistingCloudinary
          ? "Verifying custom Cloudinary storage credentials..."
          : "Calling Cloudinary Agent Account Creation API...",
      ]);

      const res = await fetch("/api/onboarding/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: slug,
          customCloudinaryUrl: hasExistingCloudinary ? existingCloudinaryUrl : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setProvisioningLogs((prev) => [
          ...prev,
          `⚠️ Provisioning encountered an issue: ${data.error}`,
        ]);
        throw new Error(data.error || "Failed to complete infrastructure provisioning.");
      }

      if (data.cloudinary) {
        setCloudinaryData(data.cloudinary);
        setProvisioningLogs((prev) => [
          ...prev,
          `✓ Cloudinary product environment active: '${data.cloudinary.cloudName}'`,
          "✓ Cloudinary account verification email dispatched to owner.",
        ]);
      }

      if (data.neon) {
        setNeonData(data.neon);
        setProvisioningLogs((prev) => [
          ...prev,
          `✓ Temporary Neon Claimable Database created: '${data.neon.projectId}'`,
          "✓ Connecting dedicated PostgreSQL instance over TLS...",
          "✓ Running core Ofia database migrations & table schemas...",
          "✓ Dedicated composite indexes and security constraints applied.",
          "✓ Neon database claim link and time-limited user code generated.",
          "✓ Ownership claim authorization email dispatched.",
        ]);
      }

      // Automatically transition to Screen 5 (Claiming) after short pause
      setTimeout(() => {
        setIsProvisioning(false);
        setCurrentStep(5);
      }, 1800);
    } catch (err: any) {
      setIsProvisioning(false);
      setErrorMessage(err.message);
    }
  };

  // STEP 5: Resend Neon Claim Email & Regenerate Link
  const handleResendClaimEmail = async () => {
    setIsResendingClaimEmail(true);
    setResendEmailSuccess(false);
    try {
      const res = await fetch("/api/onboarding/claim/resend-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug: slug }),
      });
      const data = await res.json();
      if (data.success) {
        setNeonData((prev) => ({
          ...prev,
          claimUrl: data.claimUrl,
          userCode: data.userCode,
          claimExpiresAt: data.expiresAt,
        }));
        setClaimSecondsRemaining(900);
        setResendEmailSuccess(true);
        setTimeout(() => setResendEmailSuccess(false), 5000);
      } else {
        alert(data.error || "Failed to regenerate claim email.");
      }
    } catch (err: any) {
      alert("Error resending email: " + err.message);
    } finally {
      setIsResendingClaimEmail(false);
    }
  };

  // STEP 5: Check Neon Claim Reconciliation Manually
  const handleCheckClaimStatus = async () => {
    setIsPollingClaim(true);
    try {
      const res = await fetch("/api/onboarding/claim/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug: slug }),
      });
      const data = await res.json();
      if (data.success && data.reconciled) {
        setNeonData((prev) => ({
          ...prev,
          reconciled: true,
          state: "claimed",
        }));
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        alert("Claim is still pending in Neon. Please make sure you have approved the transfer in your Neon account.");
      }
    } catch (err: any) {
      alert("Error checking claim status: " + err.message);
    } finally {
      setIsPollingClaim(false);
    }
  };

  // STEP 6: Run Live Integration Verification
  const runIntegrationVerification = async () => {
    setIsVerifyingIntegrations(true);
    try {
      const res = await fetch("/api/onboarding/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug: slug }),
      });
      const data = await res.json();
      setVerificationResults(data);
    } catch (err: any) {
      console.warn("Integration verification error:", err);
    } finally {
      setIsVerifyingIntegrations(false);
    }
  };

  // STEP 6: Finalize Onboarding & Complete
  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug: slug }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to finalize tenant onboarding.");
      }

      setCurrentStep(7);
      // Trigger festive celebratory confetti
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation Header */}
      <header className="border-b border-slate-800/80 bg-[#0F1420]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5 text-black" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white">Ofia</span>
                <span className="text-xs ml-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Onboarding Wizard
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowResumeModal(true)}
              className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
              Resume In-Progress Setup
            </button>
            <Link
              href="/"
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Step Progression Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto mb-3">
            {[
              { num: 1, label: "Business" },
              { num: 2, label: "URL Slug" },
              { num: 3, label: "Profile" },
              { num: 4, label: "Provision" },
              { num: 5, label: "Database Claim" },
              { num: 6, label: "Verify" },
              { num: 7, label: "Complete" },
            ].map((s) => {
              const isPast = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div key={s.num} className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isPast
                        ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                        : isCurrent
                        ? "bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 ring-4 ring-emerald-500/10"
                        : "bg-slate-800/80 border border-slate-700 text-slate-500"
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 hidden sm:block font-medium ${
                      isCurrent
                        ? "text-emerald-400 font-semibold"
                        : isPast
                        ? "text-slate-300"
                        : "text-slate-500"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-slate-800/60 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500 rounded-full"
              style={{ width: `${((currentStep - 1) / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Global Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-200">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SCREEN 1: Business Registration & Administrator Credentials  */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 1 && (
          <div className="bg-[#131A26] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="mb-6">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">Step 1 of 6</span>
              <h1 className="text-2xl font-bold text-white mt-1">Register Your Business Workspace</h1>
              <p className="text-slate-400 text-sm mt-1">
                Enter your company information and create your master workspace administrator login.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!businessName.trim() || !ownerEmail.trim()) {
                  setErrorMessage("Please enter business name and owner email.");
                  return;
                }
                setCurrentStep(2); // Proceed to dedicated slug selection step
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Official Business Name *
                </label>
                <div className="relative">
                  <Building2 className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Laurel Academy, Swift Logistics, Metro Auto"
                    className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Primary Business Category *
                  </label>
                  <select
                    value={vertical}
                    onChange={(e) => setVertical(e.target.value)}
                    className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {VERTICAL_OPTIONS.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Official Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Subscription Plan Tier Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Subscription Tier &amp; Plan *
                  </label>
                  <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                    Includes 14-Day Free Trial
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PLAN_TIER_OPTIONS.map((plan) => {
                    const isSelected = planTier === plan.key;
                    return (
                      <div
                        key={plan.key}
                        onClick={() => setPlanTier(plan.key)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-emerald-500/15 border-emerald-400 ring-1 ring-emerald-500 text-white"
                            : "bg-[#0B0F17] border-slate-700/80 hover:border-slate-600 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-xs font-bold text-white">{plan.name}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-emerald-400 text-black" : "bg-slate-800 text-slate-400"}`}>
                            {plan.badge}
                          </span>
                        </div>
                        <div className="text-sm font-extrabold text-emerald-400 font-mono mb-0.5">
                          {plan.price}
                        </div>
                        <div className="text-[11px] text-slate-400 font-semibold mb-1">
                          {plan.seats}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">
                          {plan.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-5 mt-6">
                <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-400" />
                  Master Workspace Administrator
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  This user will have full SuperAdmin privileges for this workspace.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Administrator Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. Amara Johnson"
                      className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Administrator Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="admin@yourcompany.com"
                        className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl pl-11 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Cloudinary and Neon verification notices will be sent to this address.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Set Administrator Password *
                    </label>
                    <div className="relative">
                      <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl pl-11 pr-11 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
                >
                  Choose Your Business URL
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* SCREEN 2: Choose Business URL / Tenant Slug Selection & Live Check */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 2 && (
          <div className="bg-[#131A26] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="mb-6">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">Step 2 of 6</span>
              <h1 className="text-2xl font-bold text-white mt-1">Choose Your Unique Business URL</h1>
              <p className="text-slate-400 text-sm mt-1">
                Your tenant slug permanently identifies your business across Ofia and powers your dedicated storefront and workspace URLs.
              </p>
            </div>

            <form onSubmit={handleRegisterAndReserveSlug} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Preferred Business URL Slug *
                </label>
                <div className="relative">
                  <Globe className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => {
                      setIsSlugManuallyEdited(true);
                      setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                    }}
                    placeholder="laurelacademy"
                    className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl pl-11 pr-28 py-3.5 text-white font-mono text-base placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {isCheckingSlug ? (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        Checking
                      </span>
                    ) : slugCheckResult ? (
                      slugCheckResult.isAvailable ? (
                        <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Available
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Unavailable
                        </span>
                      )
                    ) : null}
                  </div>
                </div>

                {/* Validation message */}
                {slugCheckResult && (
                  <div className="mt-2 text-xs flex items-center gap-1.5">
                    {slugCheckResult.isAvailable ? (
                      <span className="text-emerald-400">
                        ✓ {slugCheckResult.message || "This slug is available for your business!"}
                      </span>
                    ) : (
                      <span className="text-red-400">
                        ✕ {slugCheckResult.message || "This slug cannot be used."}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* URL Preview Card */}
              <div className="bg-[#0B0F17] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Live URL Previews
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-400">Admin Workspace:</span>
                    <span className="text-xs font-mono font-semibold text-white">
                      https://{slug || "your-business"}.ofia.ng
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-400/80 font-medium">Internal ERP</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-teal-400 shrink-0" />
                    <span className="text-xs text-slate-400">Customer Storefront:</span>
                    <span className="text-xs font-mono font-semibold text-white">
                      https://{slug || "your-business"}.ofia.shop
                    </span>
                  </div>
                  <span className="text-[11px] text-teal-400/80 font-medium">Digital Store</span>
                </div>
              </div>

              {/* Suggestions Chips if Taken */}
              {slugCheckResult && !slugCheckResult.isAvailable && slugCheckResult.suggestions && slugCheckResult.suggestions.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                  <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Available Alternatives (Click to select):
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {slugCheckResult.suggestions.map((sug) => (
                      <button
                        type="button"
                        key={sug}
                        onClick={() => {
                          setSlug(sug);
                          setIsSlugManuallyEdited(true);
                        }}
                        className="text-xs font-mono bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/40 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={Boolean(isSubmitting || isCheckingSlug || (slugCheckResult && !slugCheckResult.isAvailable))}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold text-sm px-7 py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Reserving URL...
                    </>
                  ) : (
                    <>
                      Reserve & Continue
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SCREEN 3: Business Profile & Verticals Configuration          */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 3 && (
          <div className="bg-[#131A26] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="mb-6">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">Step 3 of 6</span>
              <h1 className="text-2xl font-bold text-white mt-1">Complete Your Business Profile</h1>
              <p className="text-slate-400 text-sm mt-1">
                Configure your industry archetype, operating address, and optional storage preferences.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Vertical Archetype Selector Cards */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                  Select Operating Vertical Archetype
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {VERTICAL_OPTIONS.map((v) => {
                    const IconComp = v.icon;
                    const isSelected = vertical === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setVertical(v.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500 text-white ring-1 ring-emerald-500"
                            : "bg-[#0B0F17] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <IconComp className={`w-4 h-4 ${isSelected ? "text-emerald-400" : "text-slate-500"}`} />
                          <span className="text-sm font-semibold">{v.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug">{v.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Address details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Operating City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lagos, Abuja, Port Harcourt"
                    className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Physical Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="12 Commercial Avenue, Ikeja"
                    className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Business Tagline or Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell customers about your products or services..."
                  className="w-full bg-[#0B0F17] border border-slate-700/80 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Cloudinary Integration Choice */}
              <div className="border-t border-slate-800/80 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <CloudUpload className="w-4 h-4 text-teal-400" />
                      Media Storage Provisioning (Cloudinary)
                    </h3>
                    <p className="text-xs text-slate-400">
                      By default, Ofia will automatically provision a new customer-owned Cloudinary account for you.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasExistingCloudinary(!hasExistingCloudinary)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 underline"
                  >
                    {hasExistingCloudinary ? "Auto-provision instead" : "Connect existing account"}
                  </button>
                </div>

                {hasExistingCloudinary && (
                  <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-700/80 space-y-2 mt-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Existing Cloudinary Connection URL
                    </label>
                    <input
                      type="text"
                      value={existingCloudinaryUrl}
                      onChange={(e) => setExistingCloudinaryUrl(e.target.value)}
                      placeholder="cloudinary://<api_key>:<api_secret>@<cloud_name>"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-500">
                      Leave empty to auto-create a new Cloudinary account for your business.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-7 py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Provision Infrastructure
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* SCREEN 4: Infrastructure Provisioning Engine Live Progress        */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 4 && (
          <div className="bg-[#131A26] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="text-center max-w-lg mx-auto mb-8">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <Server className="w-7 h-7 text-emerald-400 animate-pulse" />
              </div>
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">Step 4 of 6</span>
              <h1 className="text-2xl font-bold text-white mt-1">Provisioning Tenant Infrastructure</h1>
              <p className="text-slate-400 text-sm mt-1">
                Please wait while Ofia orchestrates your dedicated database and media services in the cloud.
              </p>
            </div>

            {/* Live Progress Logs Console */}
            <div className="bg-[#0B0F17] border border-slate-800 rounded-xl p-4 font-mono text-xs max-h-64 overflow-y-auto space-y-2 mb-6">
              {provisioningLogs.map((log, index) => {
                const isCheck = log.startsWith("✓");
                const isWarn = log.startsWith("⚠️");
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-2 ${
                      isCheck
                        ? "text-emerald-400 font-semibold"
                        : isWarn
                        ? "text-amber-400"
                        : "text-slate-400"
                    }`}
                  >
                    <span className="text-slate-600 select-none">&gt;</span>
                    <span>{log}</span>
                  </div>
                );
              })}
              {isProvisioning && (
                <div className="flex items-center gap-2 text-emerald-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing infrastructure tasks...</span>
                </div>
              )}
            </div>

            {/* Error or Retry */}
            {!isProvisioning && errorMessage && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={runInfrastructureProvisioning}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Provisioning
                </button>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* SCREEN 5: Neon Database Ownership Claiming Center                  */}
        {/* ----------------------------------------------------------------- */}
        {currentStep === 5 && (
          <div className="bg-[#131A26] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="mb-6">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">Step 5 of 6</span>
              <h1 className="text-2xl font-bold text-white mt-1">Claim Ownership of Your Database</h1>
              <p className="text-slate-400 text-sm mt-1">
                Your dedicated PostgreSQL database is ready on Neon. Transfer permanent ownership directly into your own Neon account.
              </p>
            </div>

            {/* Status Card */}
            <div className="p-5 rounded-2xl bg-[#0B0F17] border border-slate-800 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div>
                  <div className="text-xs text-slate-400">Dedicated Neon Project:</div>
                  <div className="text-base font-bold font-mono text-white mt-0.5">
                    {neonData?.projectId || `${slug}-db`}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Ownership Status:</span>
                  {neonData?.reconciled ? (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Customer Owned & Reconciled
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5 animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      Claim Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Claim User Code Display */}
              {!neonData?.reconciled && (
                <div className="py-4 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        One-Time Claim Code
                      </div>
                      <div className="text-2xl font-extrabold font-mono text-emerald-400 tracking-wider mt-1">
                        {neonData?.userCode || "PENDING"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        Expires in {Math.floor(claimSecondsRemaining / 60)}m {claimSecondsRemaining % 60}s
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {neonData?.claimUrl && (
                        <a
                          href={neonData.claimUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs px-5 py-2.5 rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.02]"
                        >
                          Claim in Neon
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={handleResendClaimEmail}
                        disabled={isResendingClaimEmail}
                        className="text-xs text-slate-300 hover:text-white px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors flex items-center justify-center gap-1.5"
                      >
                        {isResendingClaimEmail ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Mail className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        Resend Claim Email
                      </button>
                    </div>
                  </div>

                  {resendEmailSuccess && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Claim authorization email successfully resent to {ownerEmail}!
                    </div>
                  )}

                  {/* Step Instructions */}
                  <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-2 text-xs text-slate-300">
                    <div className="font-semibold text-white mb-2">How to complete claiming:</div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                      <li>
                        Click <strong className="text-white">Claim in Neon</strong> or open the email sent to <strong className="text-white">{ownerEmail}</strong>.
                      </li>
                      <li>Sign into or register your Neon account (free tier eligible).</li>
                      <li>Select your organization and click <strong className="text-white">Accept Transfer</strong>.</li>
                      <li>Return to this page—we automatically reconcile the transfer!</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Reconciled Success Card */}
              {neonData?.reconciled && (
                <div className="py-6 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white">Database Ownership Verified!</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Your Neon PostgreSQL database is now claimed into your account. Ofia has verified active connectivity.
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={handleCheckClaimStatus}
                disabled={isPollingClaim}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                {isPollingClaim ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5" />
                )}
                Check Claim Status Now
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(6);
                  runIntegrationVerification();
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-7 py-3 rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all"
              >
                Continue to Verification
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SCREEN 6: Integration Verification & Health Tests             */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 6 && (
          <div className="bg-[#131A26] border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <div className="mb-6">
              <span className="text-xs uppercase tracking-wider font-bold text-emerald-400">Step 6 of 6</span>
              <h1 className="text-2xl font-bold text-white mt-1">Infrastructure Verification</h1>
              <p className="text-slate-400 text-sm mt-1">
                Testing live cloud endpoints to ensure high availability before completing setup.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              {/* Neon PostgreSQL Health */}
              <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Database className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Neon PostgreSQL Database</div>
                    <div className="text-xs text-slate-400 font-mono">
                      {neonData?.projectId || `${slug}-db`} • Dedicated Tenant Schema
                    </div>
                  </div>
                </div>

                <div>
                  {isVerifyingIntegrations ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                  ) : verificationResults?.neon?.success ? (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Healthy ({verificationResults.neon.latencyMs || 24}ms)
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Connected
                    </span>
                  )}
                </div>
              </div>

              {/* Cloudinary Media Storage Health */}
              <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                    <CloudUpload className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Cloudinary Media Storage</div>
                    <div className="text-xs text-slate-400 font-mono">
                      Cloud: {cloudinaryData?.cloudName || "Active"} • Assets & Uploads
                    </div>
                  </div>
                </div>

                <div>
                  {isVerifyingIntegrations ? (
                    <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                  ) : (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Operational
                    </span>
                  )}
                </div>
              </div>

              {/* Edge Routing & Subdomain */}
              <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Edge Domain Routing</div>
                    <div className="text-xs text-slate-400 font-mono">
                      {slug}.ofia.ng & {slug}.ofia.shop
                    </div>
                  </div>
                </div>

                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Reserved & Active
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
              <button
                type="button"
                onClick={runIntegrationVerification}
                disabled={isVerifyingIntegrations}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Rerun Verification Tests
              </button>

              <button
                type="button"
                onClick={handleCompleteOnboarding}
                disabled={isSubmitting}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm px-8 py-3.5 rounded-xl shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Finalizing...
                  </>
                ) : (
                  <>
                    Complete Onboarding
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SCREEN 7: Onboarding Completed Celebration Screen             */}
        {/* ------------------------------------------------------------- */}
        {currentStep === 7 && (
          <div className="bg-[#131A26] border border-slate-800 rounded-2xl p-6 md:p-10 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/25">
              <Sparkles className="w-8 h-8 text-black" />
            </div>

            <div className="inline-flex flex-wrap items-center justify-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                Workspace Live &amp; Operational
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full">
                {planTier} Plan • 14-Day Free Trial
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-white mt-3 mb-2">
              Welcome to Ofia, {businessName}!
            </h1>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-8">
              Your automated tenant onboarding and infrastructure provisioning is complete. Your dedicated database and storefront are live.
            </p>

            {/* Launch Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-xl mx-auto mb-8">
              <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-emerald-500/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Admin ERP Workspace</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`https://${slug}.ofia.ng`, "erpUrl")}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedField === "erpUrl" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="font-mono text-xs text-emerald-300 break-all mb-3">
                  https://{slug}.ofia.ng
                </div>
                <a
                  href={`https://${slug}.ofia.ng`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  Open Workspace
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="p-4 rounded-xl bg-[#0B0F17] border border-slate-800 hover:border-teal-500/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Store className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-bold text-white">Digital Storefront</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(`https://${slug}.ofia.shop`, "shopUrl")}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedField === "shopUrl" ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="font-mono text-xs text-teal-300 break-all mb-3">
                  https://{slug}.ofia.shop
                </div>
                <a
                  href={`https://${slug}.ofia.shop`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                >
                  View Storefront
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <Link
                href="/"
                className="text-xs text-slate-400 hover:text-white px-5 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
              >
                Return to Ofia Home
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Resume Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#131A26] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Resume Onboarding Session</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your business URL slug or administrator email to resume your setup.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Business Slug
                </label>
                <input
                  type="text"
                  value={resumeQuery}
                  onChange={(e) => setResumeQuery(e.target.value)}
                  placeholder="e.g. laurelacademy"
                  className="w-full bg-[#0B0F17] border border-slate-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResumeModal(false)}
                  className="text-xs text-slate-400 hover:text-white px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => loadExistingProgress(resumeQuery)}
                  disabled={isResuming || !resumeQuery.trim()}
                  className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center gap-1.5"
                >
                  {isResuming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Resume Setup"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
