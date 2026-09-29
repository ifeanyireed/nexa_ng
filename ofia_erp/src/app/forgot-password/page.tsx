"use client";

import React, { useState } from "react";
import Link from "next/link";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-[var(--nexa-text-primary)]">Reset Your Password</h1>
          <p className="text-xs text-[var(--nexa-text-muted)]">
            Enter your work email address and we will send you a recovery link.
          </p>
        </div>

        <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] shadow-xl">
          {sent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-12 h-12 rounded-full bg-[#0E9F6E]/10 text-[#0E9F6E] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">Recovery Link Dispatched</h3>
              <p className="text-xs text-[var(--nexa-text-muted)]">
                Check your inbox at <span className="font-bold text-[var(--nexa-text-primary)]">{email}</span> for instructions.
              </p>
              <Link href="/login" className="block pt-2">
                <NexaButton variant="outline" size="sm" className="w-full justify-center">
                  Back to Sign In
                </NexaButton>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <NexaInput
                label="Work Email Address"
                placeholder="you@company.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <NexaButton type="submit" variant="primary" className="w-full bg-[#1A56DB] text-white justify-center">
                Send Recovery Email
              </NexaButton>
              <div className="pt-2 text-center">
                <Link href="/login" className="text-xs text-[var(--nexa-text-muted)] hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="w-3 h-3" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </NexaCard>
      </div>
    </div>
  );
}
