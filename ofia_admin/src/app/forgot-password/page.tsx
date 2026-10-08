"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { Mail, ArrowLeft, CheckCircle2, ShieldAlert, KeyRound } from "lucide-react";

export default function SuperAdminForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid operator email address.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Dispatch request to platform auth recovery endpoint
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to process recovery request.");
      }

      setSent(true);
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
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
                Operator Password Recovery
              </h1>
              <p className="text-xs text-[var(--nexa-text-muted)] leading-relaxed">
                Enter your authorized SuperAdmin email to dispatch a secure password reset link.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {sent ? (
              <div className="text-center space-y-4 py-4">
                <div className="w-12 h-12 rounded-full bg-[#0E9F6E]/10 text-[#0E9F6E] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Recovery Link Dispatched</h3>
                  <p className="text-xs text-[var(--nexa-text-muted)] leading-relaxed">
                    If an authorized account matches <span className="font-bold text-[var(--nexa-text-primary)]">{email}</span>, a recovery email has been sent by the platform security mailer.
                  </p>
                </div>
                <div className="p-3 bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-xl text-left text-[11px] space-y-1 text-[var(--nexa-text-muted)]">
                  <p>• The reset link is valid for 60 minutes.</p>
                  <p>• Check your inbox and spam folder.</p>
                </div>
                <Link href="/login" className="block pt-2">
                  <NexaButton variant="primary" size="sm" className="w-full justify-center text-xs">
                    Back to Sign In
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
                      required
                      placeholder="superadmin@ofia.ng"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 text-xs rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/20 font-mono transition-all"
                    />
                    <Mail className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <NexaButton
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="w-full justify-center text-xs h-11 rounded-full bg-[#1A56DB] text-white"
                >
                  {isLoading ? "Dispatching..." : "Send Recovery Email"}
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

      <footer className="text-center text-xs text-[var(--nexa-text-muted)] py-4">
        Protected by SOC2 Type II & 256-bit AES encryption • Ofia Platform Root
      </footer>
    </div>
  );
}
