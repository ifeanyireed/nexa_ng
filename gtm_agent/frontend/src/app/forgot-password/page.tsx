"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import {
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] flex flex-col justify-between text-[var(--nexa-text-primary)]">
      <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-[var(--nexa-border)] p-1 flex items-center justify-center shadow-sm">
            <img src="/logo.png" alt="GTM AI Agency" className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-base text-[var(--nexa-text-primary)] text-display">
            GTM AI Agency
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          <NexaCard variant="glass" padding="lg" className="border-2 border-[#1A56DB]/20 shadow-2xl space-y-6">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] text-[11px] font-bold">
                <Lock className="w-3.5 h-3.5" />
                Account Recovery
              </div>
              <h1 className="text-2xl font-black text-display text-[var(--nexa-text-primary)]">
                Reset Password
              </h1>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Enter your verified work email address to receive secure reset instructions.
              </p>
            </div>

            {isSent ? (
              <div className="p-6 rounded-2xl bg-[var(--nexa-bg-base)] border border-[#0E9F6E]/40 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#0E9F6E]/20 text-[#0E9F6E] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[var(--nexa-text-primary)]">
                  Reset Link Dispatched
                </h4>
                <p className="text-xs text-[var(--nexa-text-secondary)]">
                  We have dispatched a 6-digit recovery code and single-use login link to <strong>{email}</strong>.
                </p>
                <div className="pt-2">
                  <Link href="/login">
                    <NexaButton size="md" variant="primary" className="font-bold text-xs w-full">
                      Return to Sign In
                    </NexaButton>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <NexaInput
                  label="Registered Work Email"
                  type="email"
                  required
                  placeholder="adeyemi@edusuite.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4 text-[var(--nexa-text-muted)]" />}
                />

                <NexaButton
                  size="lg"
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  className="w-full font-extrabold text-sm shadow-md shadow-[#1A56DB]/20"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Send Recovery Link
                </NexaButton>

                <div className="text-center pt-2">
                  <Link href="/login" className="text-xs font-semibold text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)]">
                    ← Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </NexaCard>
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-[var(--nexa-text-muted)]">
        © {new Date().getFullYear()} GTM AI Agency. All rights reserved.
      </footer>
    </div>
  );
}
