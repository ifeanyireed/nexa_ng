"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { Lock, Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert, KeyRound, Eye, EyeOff } from "lucide-react";

function SuperAdminResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tokenParam = (searchParams.get("token") || "").trim();
  const emailParam = (searchParams.get("email") || "").trim();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(Boolean(tokenParam && emailParam));
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!tokenParam || !emailParam) {
      setTokenError("Missing token or email parameters. Please request a new recovery link.");
      setIsVerifying(false);
      return;
    }

    async function checkToken() {
      setIsVerifying(true);
      try {
        const res = await fetch(
          `/api/auth/reset-password?token=${encodeURIComponent(tokenParam)}&email=${encodeURIComponent(emailParam)}`
        );
        const data = await res.json();
        if (!res.ok || !data.valid) {
          setTokenError(data.error || "Reset link is invalid or expired.");
        }
      } catch {
        setTokenError("Unable to verify reset link.");
      } finally {
        setIsVerifying(false);
      }
    }
    checkToken();
  }, [tokenParam, emailParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (newPassword.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
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

      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex flex-col justify-between p-4 sm:p-6 font-sans">
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <img src="/icon.png" alt="Ofia SuperAdmin" className="w-8 h-8 object-contain shrink-0" />
          <span className="font-semibold text-base text-[var(--nexa-text-primary)] flex items-center gap-2">
            Ofia SuperAdmin
            <span className="text-[10px] font-semibold font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#0069FF]/10 text-[#0069FF] border border-[#0069FF]/20">
              PLATFORM ROOT
            </span>
          </span>
        </Link>
        <Link href="/login" className="text-xs font-bold text-[#1A56DB] hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-md space-y-6">
          <NexaCard variant="glass" padding="lg" className="border-2 border-[#0069FF]/20 shadow-2xl rounded-3xl backdrop-blur-xl">
            <div className="text-center space-y-2 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#0069FF]/10 text-[#0069FF] flex items-center justify-center mx-auto mb-3">
                <KeyRound className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-semibold text-[var(--nexa-text-primary)] tracking-tight">
                Update Root Credentials
              </h1>
              <p className="text-xs text-[var(--nexa-text-muted)] leading-relaxed">
                Choose a strong new password for operator account authorization.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isVerifying ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-8 h-8 border-3 border-[#1A56DB] border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-[var(--nexa-text-muted)] font-medium">Validating security token...</p>
              </div>
            ) : tokenError ? (
              <div className="py-4 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Link Expired or Invalid</h3>
                  <p className="text-xs text-[var(--nexa-text-muted)] px-4">{tokenError}</p>
                </div>
                <Link href="/forgot-password" className="block pt-2">
                  <NexaButton variant="primary" className="w-full justify-center text-xs">
                    Request New Recovery Link
                  </NexaButton>
                </Link>
              </div>
            ) : success ? (
              <div className="py-4 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#0E9F6E]/10 text-[#0E9F6E] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Password Successfully Updated</h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Root credentials updated. You may now log in to the SuperAdmin console.
                  </p>
                </div>
                <Link href="/login" className="block pt-2">
                  <NexaButton variant="primary" className="w-full justify-center text-xs gap-2">
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </NexaButton>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--nexa-text-secondary)] px-1">
                    Operator Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={emailParam}
                      disabled
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-muted)] font-mono outline-none cursor-not-allowed"
                    />
                    <Mail className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--nexa-text-secondary)] px-1">
                    New Root Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 text-xs rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/20 font-mono transition-all"
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
                  <p className="text-[10px] text-[var(--nexa-text-muted)] px-1">Minimum 8 characters.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--nexa-text-secondary)] px-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-10 text-xs rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/20 font-mono transition-all"
                    />
                    <Lock className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3.5 top-3.5 text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <NexaButton
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="w-full justify-center text-xs h-11 rounded-full bg-[#1A56DB] text-white mt-2"
                >
                  {isLoading ? "Saving Credentials..." : "Update Root Password"}
                </NexaButton>
              </form>
            )}
          </NexaCard>
        </div>
      </main>

      <footer className="text-center text-xs text-[var(--nexa-text-muted)] py-4">
        Protected by SOC2 Type II & 256-bit AES encryption • Ofia Platform Root
      </footer>
    </div>
  );
}

export default function SuperAdminResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--nexa-bg-base)] flex items-center justify-center text-xs">Loading...</div>}>
      <SuperAdminResetPasswordContent />
    </Suspense>
  );
}
