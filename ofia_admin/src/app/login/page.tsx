"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaThemeToggle } from "@/components/nexa/NexaThemeToggle";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Users,
  CheckCircle2,
  Building2,
  Briefcase,
  Layers,
  Key,
} from "lucide-react";
import {
  IconBrandGoogle,
  IconBrandWindows,
} from "@tabler/icons-react";
import { SEEDED_SUPER_ADMINS, SeededSuperAdminAccount } from "@/lib/jwt-auth";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [email, setEmail] = useState("superadmin@ofia.ng");
  const [password, setPassword] = useState("OfiaSuperAdmin2026!");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const selectPersona = (pEmail: string, pPass: string) => {
    setEmail(pEmail);
    setPassword(pPass);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Store in memory / session storage for UI convenience
      if (typeof window !== "undefined") {
        sessionStorage.setItem("ofia_superadmin_user", JSON.stringify(data.user));
      }

      router.push(decodeURIComponent(returnUrl));
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Invalid operator credentials");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] flex flex-col justify-between text-[var(--nexa-text-primary)] font-sans">
      {/* Top Simple Header */}
      <header className="p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Ofia SuperAdmin Logo" className="w-8 h-8 object-contain shrink-0" />
          <span className="font-extrabold text-base text-[var(--nexa-text-primary)] text-display flex items-center gap-2">
            Ofia SuperAdmin
            <span className="text-[10px] font-extrabold font-mono uppercase px-2.5 py-0.5 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] border border-[#1A56DB]/20">
              PLATFORM ROOT
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-[11px] text-[var(--nexa-text-secondary)] font-bold">
              3 / 3 Clusters Live
            </span>
          </div>
          <NexaThemeToggle />
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-6">
          <NexaCard variant="glass" padding="lg" className="border-2 border-[#1A56DB]/20 shadow-2xl rounded-3xl space-y-6 backdrop-blur-xl">
            <div className="text-center space-y-2">
              <div className="flex justify-center mb-1">
                <img src="/logo.png" alt="Ofia Logo" className="w-12 h-12 object-contain" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] text-[11px] font-bold border border-[#1A56DB]/20 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5" />
                Root Infrastructure Console
              </div>
              <h1 className="text-2xl font-black text-display text-[var(--nexa-text-primary)] tracking-tight">
                Sign in to Ofia SuperAdmin
              </h1>
              <p className="text-xs text-[var(--nexa-text-muted)] leading-relaxed">
                Autonomous Multi-Tenant Infrastructure, Swarm Fleet & Marketplace Ops.
              </p>
            </div>

            {/* Quick Test Persona Switcher */}
            <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-[var(--nexa-text-muted)] uppercase tracking-wider px-1">
                <span className="flex items-center gap-1">
                  <Key className="w-3 h-3 text-[#1A56DB]" />
                  1-Click Seeded Operator Personas
                </span>
                <span className="text-[#0E9F6E] font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F6E] animate-pulse" />
                  Quick Fill
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SEEDED_SUPER_ADMINS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectPersona(p.email, p.passwordHash)}
                    className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer shadow-sm ${
                      email === p.email
                        ? "bg-[#1A56DB] text-white border-[#1A56DB] shadow-[#1A56DB]/30 font-bold"
                        : "bg-[var(--nexa-bg-surface)] text-[var(--nexa-text-secondary)] border-[var(--nexa-border)] hover:border-[#1A56DB] hover:text-[#1A56DB]"
                    }`}
                  >
                    {p.name.split(" ")[0]} ({p.role.replace("_", " ")})
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold text-center flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
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
                    className="w-full h-11 pl-10 pr-4 text-xs rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/20 transition-all font-mono"
                  />
                  <Mail className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3.5 top-3.5" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-semibold text-[var(--nexa-text-secondary)]">
                    Root Password
                  </label>
                  <span className="text-[11px] font-bold text-[#1A56DB]">
                    HMAC-SHA256 JWT
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-10 pr-10 text-xs rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none focus:border-[#1A56DB] focus:ring-2 focus:ring-[#1A56DB]/20 transition-all font-mono"
                  />
                  <Lock className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3.5 top-3.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] p-0.5 rounded-full cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs px-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded-full border-[var(--nexa-border)] accent-[#1A56DB]"
                  />
                  <span className="text-[var(--nexa-text-secondary)]">Remember this operator device</span>
                </label>
                <span className="text-[10px] text-[var(--nexa-text-muted)] font-medium px-2 py-0.5 rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  Edge Verified
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-full bg-[#1A56DB] hover:bg-[#1545B0] text-white font-extrabold text-sm shadow-lg shadow-[#1A56DB]/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Authenticate & Enter Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-[var(--nexa-border)]"></div>
              <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-[var(--nexa-text-muted)] tracking-wider">
                Or Platform Single Sign-On
              </span>
              <div className="flex-grow border-t border-[var(--nexa-border)]"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleLogin({ preventDefault: () => {} } as any)}
                className="h-10 rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] hover:border-[#1A56DB] text-xs font-semibold text-[var(--nexa-text-primary)] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
              >
                <IconBrandGoogle className="w-4 h-4" />
                Google Root SSO
              </button>
              <button
                type="button"
                onClick={() => handleLogin({ preventDefault: () => {} } as any)}
                className="h-10 rounded-full bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] hover:border-[#1A56DB] text-xs font-semibold text-[var(--nexa-text-primary)] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
              >
                <IconBrandWindows className="w-4 h-4" />
                Microsoft Entra
              </button>
            </div>
          </NexaCard>
        </div>
      </main>

      {/* Simple Bottom Bar */}
      <footer className="p-6 text-center text-xs text-[var(--nexa-text-muted)]">
        © 2026 Ofia SuperAdmin Console. Protected by HMAC-SHA256 JWT & Edge RBAC Verification.
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-mono text-xs text-[var(--nexa-text-muted)]">Loading SuperAdmin Gate...</div>}>
      <LoginContent />
    </Suspense>
  );
}
