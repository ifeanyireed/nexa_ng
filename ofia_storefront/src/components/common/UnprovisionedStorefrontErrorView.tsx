"use client";

import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Server,
  Layers,
  ExternalLink,
  RefreshCcw,
  Store,
} from "lucide-react";

interface UnprovisionedStorefrontErrorViewProps {
  error?: {
    code?: number;
    title?: string;
    message?: string;
    slug?: string;
  } | null;
  slug?: string;
}

export default function UnprovisionedStorefrontErrorView({
  error,
  slug,
}: UnprovisionedStorefrontErrorViewProps) {
  const displaySlug = slug || error?.slug || "unknown";
  const title = error?.title || "Storefront Workspace Not Provisioned";
  const message =
    error?.message ||
    `The merchant storefront '@${displaySlug}' was not found or has not been provisioned on the Ofia Platform.`;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-between selection:bg-rose-500/20 selection:text-rose-400">
      {/* Ambient background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-rose-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation Top Bar */}
      <header className="relative z-10 w-full border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/ofia-logo.png"
            alt="Ofia"
            className="w-7 h-7 object-contain"
          />
          <div className="flex items-center gap-2">
            <span className="font-dropa font-bold text-lg tracking-tight text-white">OFIA</span>
            <span className="text-zinc-600">/</span>
            <span className="text-xs font-mono text-zinc-400">Storefront Gateway</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/templates"
            className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Templates Directory
          </Link>
          <a
            href="http://localhost:3000"
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors flex items-center gap-1.5"
          >
            <span>Admin Console</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Main Error Canvas */}
      <main className="relative z-10 max-w-4xl w-full mx-auto px-6 py-16 flex flex-col items-center text-center space-y-8 my-auto">
        {/* Error Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-semibold tracking-wide uppercase">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>HTTP 404 · Unprovisioned Workspace</span>
        </div>

        {/* Headline */}
        <div className="space-y-3 max-w-2xl">
          <h1 className="font-dropa text-3xl sm:text-5xl font-bold tracking-tight text-white">
            Storefront Not Found
          </h1>
          <p className="text-base sm:text-lg text-zinc-400 font-light leading-relaxed">
            {message}
          </p>
        </div>

        {/* Technical Isolation Card */}
        <div className="w-full max-w-2xl bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 text-left space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Tenant Diagnostic Trace
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-rose-300">
              TENANT_NOT_REGISTERED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-zinc-400 block mb-1">Target Tenant Slug</span>
              <span className="font-mono font-bold text-white text-sm">
                @{displaySlug}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-zinc-400 block mb-1">Tenancy Isolation Model</span>
              <span className="font-mono font-semibold text-blue-400 text-sm">
                DEDICATED (Zero Shared DB)
              </span>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed font-light">
            <strong className="text-zinc-300">Strict Tenancy Enforcement:</strong> To protect merchant brand identity, dedicated inventory records, and financial settlement ledgers, unprovisioned slugs strictly return this error rather than serving a fallback vertical.
          </p>
        </div>

        {/* Action Conduit Grid */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full pt-4">
          <Link
            href="/templates"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-colors shadow-lg shadow-blue-600/20"
          >
            <Layers className="w-4 h-4" />
            <span>Explore 11 Verified Templates</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            href="/?tenant=neweratransports"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-sm transition-colors"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span>Visit New Era Transports</span>
          </Link>

          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-medium text-sm transition-colors"
          >
            <span>Platform Overview</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-zinc-800/80 py-4 px-6 text-center text-xs text-zinc-400">
        <span>Ofia Platform Architecture · Strict Dedicated Multi-Tenancy · Powered by Neon PostgreSQL</span>
      </footer>
    </div>
  );
}
