"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { Lock, Mail, User, Building, ArrowRight, ShieldCheck } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/onboarding");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-[#1A56DB]/10 text-[#1A56DB] mb-1">
            <Building className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-[var(--nexa-text-primary)] tracking-tight">
            Create Your Business Workspace
          </h1>
          <p className="text-xs text-[var(--nexa-text-muted)]">
            Start your 14-day free trial on the unified Ofia Business platform.
          </p>
        </div>

        <NexaCard variant="glass" padding="lg" className="border border-[var(--nexa-border)] shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <NexaInput
              label="Full Name"
              placeholder="e.g. Adeyemi Peters"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <NexaInput
              label="Company / Organization Name"
              placeholder="e.g. EduSuite Technologies Ltd"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
            />
            <NexaInput
              label="Work Email Address"
              placeholder="you@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <NexaInput
              label="Password"
              placeholder="••••••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <NexaButton
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="w-full bg-[#1A56DB] text-white hover:bg-[#1545B0] justify-center mt-2"
            >
              Get Started Free <ArrowRight className="w-4 h-4 ml-1" />
            </NexaButton>
          </form>

          <div className="mt-6 pt-4 border-t border-[var(--nexa-border)] text-center text-xs text-[var(--nexa-text-muted)]">
            Already registered?{" "}
            <Link href="/login" className="text-[#1A56DB] font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </NexaCard>
      </div>
    </div>
  );
}
