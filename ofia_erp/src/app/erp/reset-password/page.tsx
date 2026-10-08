"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useActiveTenant, DEFAULT_TENANT_BRANDING } from "@/lib/tenant-context";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tokenParam = (searchParams.get("token") || "").trim();
  const emailParam = (searchParams.get("email") || "").trim();

  const { activeTenant } = useActiveTenant();

  // Mode: "request" (enter email) vs "update" (token present)
  const isUpdateMode = Boolean(tokenParam && emailParam);

  const [emailInput, setEmailInput] = useState(emailParam || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifyingToken, setIsVerifyingToken] = useState(isUpdateMode);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const [requestSent, setRequestSent] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const tenantName = activeTenant?.name || "Ofia ERP";
  const tenantLogo = activeTenant?.logo || DEFAULT_TENANT_BRANDING[activeTenant?.slug || ""]?.logo || "/icon.png";
  const primaryColor = activeTenant?.primaryColor || "#1A56DB";

  // Verify token on mount if in update mode
  useEffect(() => {
    if (isUpdateMode) {
      async function verifyToken() {
        setIsVerifyingToken(true);
        setTokenError(null);
        try {
          const res = await fetch(
            `/api/auth/reset-password?token=${encodeURIComponent(tokenParam)}&email=${encodeURIComponent(emailParam)}`
          );
          const data = await res.json();
          if (!res.ok || !data.valid) {
            setTokenError(data.error || "This password reset link is invalid or has expired.");
          }
        } catch {
          setTokenError("Unable to verify reset link. Please check your internet connection.");
        } finally {
          setIsVerifyingToken(false);
        }
      }
      verifyToken();
    }
  }, [isUpdateMode, tokenParam, emailParam]);

  // Request Reset Email Handler
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          tenantSlug: activeTenant?.slug || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to process password reset request");
      }

      setRequestSent(true);
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Update Password Handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify both fields.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenParam,
          email: emailParam,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setResetCompleted(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password. The link may have expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex flex-col justify-between p-4 sm:p-6 font-sans select-none">
      {/* Top Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/login" className="flex items-center gap-3">
          <img src={tenantLogo} alt={tenantName} className="h-8 w-auto object-contain" />
          <span className="font-extrabold text-sm text-[var(--nexa-text-primary)] tracking-tight">
            {tenantName}
          </span>
        </Link>
        <Link href="/login">
          <span className="text-xs font-bold text-[#1A56DB] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </span>
        </Link>
      </header>

      {/* Main Card */}
      <main className="flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-md space-y-6">
          <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] shadow-2xl rounded-3xl backdrop-blur-xl">
            {/* Header Icon & Title */}
            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black text-[var(--nexa-text-primary)] tracking-tight">
                {isUpdateMode ? "Choose New Password" : "Reset Your Password"}
              </h1>
              <p className="text-xs text-[var(--nexa-text-muted)] leading-relaxed">
                {isUpdateMode
                  ? "Enter your new credentials below to restore secure workspace access."
                  : "Enter your enterprise email address and the platform mailer will dispatch a secure recovery link."}
              </p>
            </div>

            {/* Error Notification */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Token Verifying Loading State */}
            {isVerifyingToken && (
              <div className="py-8 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-[#1A56DB] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[var(--nexa-text-muted)] font-medium">
                  Validating security token...
                </p>
              </div>
            )}

            {/* Token Expired or Invalid Error State */}
            {!isVerifyingToken && tokenError && (
              <div className="py-4 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Link Expired or Invalid</h3>
                  <p className="text-xs text-[var(--nexa-text-muted)] px-4">
                    {tokenError}
                  </p>
                </div>
                <Link href="/erp/reset-password" className="block pt-2">
                  <NexaButton variant="primary" className="w-full justify-center text-xs">
                    Request a New Reset Link
                  </NexaButton>
                </Link>
              </div>
            )}

            {/* Success State: Reset Completed */}
            {!isVerifyingToken && !tokenError && resetCompleted && (
              <div className="py-4 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Password Successfully Reset</h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Your new password has been saved securely in the platform directory.
                  </p>
                </div>
                <Link href="/login" className="block pt-2">
                  <NexaButton variant="primary" className="w-full justify-center text-xs gap-2">
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </NexaButton>
                </Link>
              </div>
            )}

            {/* Success State: Email Dispatched */}
            {!isUpdateMode && requestSent && (
              <div className="py-4 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Recovery Link Dispatched</h3>
                  <p className="text-xs text-[var(--nexa-text-muted)] leading-relaxed">
                    If an account matches <span className="font-bold text-[var(--nexa-text-primary)]">{emailInput}</span>, a recovery email has been sent. Please check your inbox and spam folder.
                  </p>
                </div>

                <div className="p-3 bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-xl text-left text-[11px] space-y-1 text-[var(--nexa-text-muted)]">
                  <p className="flex items-center gap-1.5 font-bold text-[var(--nexa-text-primary)]">
                    <Sparkles className="w-3 h-3 text-[#1A56DB]" /> Platform Security Note:
                  </p>
                  <p>• The reset link remains valid for 60 minutes.</p>
                  <p>• Sent securely via Ofia platform email utility.</p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => { setRequestSent(false); }}
                    className="text-xs text-[var(--nexa-text-muted)] hover:text-[#1A56DB] font-semibold transition-colors cursor-pointer"
                  >
                    Didn't receive it? Try another email
                  </button>
                  <Link href="/login" className="block">
                    <NexaButton variant="outline" size="sm" className="w-full justify-center text-xs">
                      Back to Sign In
                    </NexaButton>
                  </Link>
                </div>
              </div>
            )}

            {/* Form Mode 1: Update Password with Token */}
            {isUpdateMode && !isVerifyingToken && !tokenError && !resetCompleted && (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--nexa-text-secondary)] px-1">
                    Account Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={emailParam}
                      disabled
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-[var(--nexa-text-muted)] font-mono outline-none cursor-not-allowed"
                    />
                    <Mail className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--nexa-text-secondary)] px-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/20 font-mono transition-all"
                    />
                    <Lock className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-[var(--nexa-text-muted)] px-1">
                    Must be at least 8 characters long.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--nexa-text-secondary)] px-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/20 font-mono transition-all"
                    />
                    <Lock className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-3.5 text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <NexaButton
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="w-full justify-center text-xs h-11 mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Saving Password...
                    </span>
                  ) : (
                    "Save New Password"
                  )}
                </NexaButton>
              </form>
            )}

            {/* Form Mode 2: Request Reset Link */}
            {!isUpdateMode && !requestSent && (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--nexa-text-secondary)] px-1">
                    Enterprise Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/20 font-mono transition-all"
                    />
                    <Mail className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <NexaButton
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="w-full justify-center text-xs h-11 mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" /> Sending Recovery Link...
                    </span>
                  ) : (
                    "Send Recovery Email"
                  )}
                </NexaButton>

                <div className="pt-2 text-center">
                  <Link href="/login" className="text-xs text-[var(--nexa-text-muted)] hover:underline inline-flex items-center gap-1 font-semibold">
                    <ArrowLeft className="w-3 h-3" /> Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </NexaCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[var(--nexa-text-muted)] py-4">
        Protected by 256-bit encryption • Managed by Ofia Platform Security
      </footer>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--nexa-bg-base)] flex items-center justify-center text-xs text-[var(--nexa-text-muted)]">
          Loading recovery console...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
