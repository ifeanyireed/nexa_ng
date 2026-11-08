"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  UserCheck,
  BookOpen,
  ArrowRight,
  ExternalLink,
  Printer,
  Copy,
  Check,
  AlertTriangle,
  QrCode,
  Sparkles,
} from "lucide-react";
import { CareersNav } from "../../CareersNav";
import { useWorkforceManager } from "@/lib/workforce-store";
import { CourseCertificate } from "@/lib/workforce-types";

export default function CertificateVerificationPortalPage() {
  const params = useParams();
  const hash = typeof params?.hash === "string" ? params.hash : "";

  const { certificates, isLoaded } = useWorkforceManager();
  const [cert, setCert] = useState<CourseCertificate | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (hash) {
      const match = certificates.find(
        (c) =>
          c.verificationHash.toLowerCase() === hash.toLowerCase() ||
          c.id.toLowerCase() === hash.toLowerCase() ||
          c.certificateNumber.toLowerCase() === hash.toLowerCase()
      );
      if (match) {
        setCert(match);
      }
    }
  }, [hash, certificates]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-nexa-base text-nexa-text-primary flex flex-col">
        <CareersNav />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-nexa-text-secondary">
              Verifying cryptographic hash on Ofia Academy Ledger...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-nexa-base text-nexa-text-primary flex flex-col font-sans selection:bg-purple-500/30 selection:text-purple-300">
      <CareersNav />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        {cert ? (
          <>
            {/* VERIFICATION STATUS BADGE */}
            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
                      Verified Authentic Credential
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <p className="text-xs text-nexa-text-secondary">
                    Cryptographic signature confirmed on the Ofia Platform Enterprise Academy Ledger.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-nexa-surface border border-nexa-border text-nexa-text-primary hover:bg-nexa-border/30 flex items-center gap-1.5 transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? "Link Copied!" : "Share Link"}</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 text-white hover:bg-purple-500 flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Credential</span>
                </button>
              </div>
            </div>

            {/* PRESTIGIOUS ENTERPRISE CERTIFICATE DOCUMENT */}
            <div className="relative p-8 sm:p-12 rounded-3xl bg-nexa-surface border-2 border-purple-500/30 shadow-2xl overflow-hidden space-y-8 print:border-black print:bg-white print:text-black">
              {/* Background watermark seals */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Certificate Border Header */}
              <div className="text-center space-y-3 pb-6 border-b border-nexa-border/60">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono font-bold tracking-widest uppercase">
                  <Award className="w-4 h-4" /> OFIA ENTERPRISE ACADEMY · NIGERIA
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-nexa-text-primary uppercase font-serif">
                  Certificate of Competence
                </h1>
                <p className="text-xs uppercase font-mono tracking-widest text-nexa-text-secondary">
                  Serial Number: <strong className="text-purple-400 font-bold">{cert.certificateNumber}</strong>
                </p>
              </div>

              {/* Certificate Body */}
              <div className="text-center space-y-6 max-w-2xl mx-auto py-2">
                <p className="text-sm text-nexa-text-secondary italic font-serif">
                  This official document certifies and confirms that
                </p>

                <div className="space-y-1">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 font-serif">
                    {cert.personName}
                  </h2>
                  <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto" />
                </div>

                <p className="text-xs text-nexa-text-secondary leading-relaxed">
                  has diligently demonstrated mastery across all theoretical syllabi, examination standards, and real-world practical client delivery benchmarks in the specialized programme:
                </p>

                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-nexa-text-primary">
                    {cert.courseTitle}
                  </h3>
                  <p className="text-xs text-purple-400 font-semibold font-mono">
                    Evaluation Standing: {cert.grade}
                  </p>
                </div>

                {/* Competencies Badges */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-nexa-text-secondary">
                    Validated Competency Capabilities
                  </span>
                  <div className="flex flex-wrap justify-center gap-2">
                    {cert.competenciesAwarded.map((comp, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-nexa-surface border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Certificate Footer Signatures & Hash Seal */}
              <div className="pt-8 border-t border-nexa-border/60 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end text-center sm:text-left">
                {/* Signature 1 */}
                <div className="space-y-1.5">
                  <div className="font-serif italic text-base text-purple-300">Ifeanyi Felix</div>
                  <div className="w-36 h-px bg-nexa-border" />
                  <p className="text-[10px] uppercase font-bold text-nexa-text-primary">Ifeanyi Felix</p>
                  <p className="text-[10px] text-nexa-text-secondary">Founder & Platform Architect</p>
                </div>

                {/* Center Seal */}
                <div className="flex flex-col items-center justify-center space-y-1">
                  <div className="w-14 h-14 rounded-full border-2 border-dashed border-purple-400/60 flex items-center justify-center bg-purple-500/10 text-purple-400">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <span className="text-[9px] uppercase font-mono text-nexa-text-secondary font-bold">
                    Official Academy Seal
                  </span>
                </div>

                {/* Signature 2 */}
                <div className="space-y-1.5 text-center sm:text-right">
                  <div className="font-serif italic text-base text-purple-300">Tunde Bakare</div>
                  <div className="w-36 h-px bg-nexa-border ml-auto" />
                  <p className="text-[10px] uppercase font-bold text-nexa-text-primary">Tunde Bakare</p>
                  <p className="text-[10px] text-nexa-text-secondary">Head of Engineering & Systems</p>
                </div>
              </div>

              {/* Cryptographic Ledger Footer */}
              <div className="pt-4 border-t border-nexa-border/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono text-nexa-text-secondary">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" />
                  <span>Issue Date: <strong className="text-nexa-text-primary">{cert.issueDate}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-center truncate max-w-md">
                  <span>SHA-256 Hash:</span>
                  <span className="text-purple-400 truncate font-mono">{cert.verificationHash}</span>
                </div>
              </div>
            </div>

            {/* EXPLORE OPPORTUNITIES FOOTER */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900/30 to-nexa-surface border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h3 className="text-sm font-bold text-nexa-text-primary">
                  Want to hire certified Ofia professionals or join the Academy?
                </h3>
                <p className="text-xs text-nexa-text-secondary">
                  Explore open graduate internships, client support contracts, and talent placement tracks.
                </p>
              </div>

              <Link href="/careers">
                <button className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-2 transition-colors shrink-0">
                  <span>Explore Careers</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </>
        ) : (
          /* NOT FOUND / UNVERIFIED STATE */
          <div className="p-12 rounded-3xl bg-nexa-surface border border-red-500/30 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-bold text-nexa-text-primary">
              Credential Could Not Be Verified
            </h2>
            <p className="text-xs text-nexa-text-secondary leading-relaxed">
              No active certificate record matching the cryptographic hash <strong className="font-mono text-purple-400 break-all">&ldquo;{hash}&rdquo;</strong> was found on the Ofia Platform Ledger. The credential may have been revoked or the verification token is invalid.
            </p>
            <div className="pt-2">
              <Link href="/careers">
                <button className="px-4 py-2 rounded-xl text-xs font-bold bg-nexa-surface border border-nexa-border text-nexa-text-primary hover:bg-nexa-border/30 inline-flex items-center gap-2">
                  <span>Return to Ofia Careers Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
