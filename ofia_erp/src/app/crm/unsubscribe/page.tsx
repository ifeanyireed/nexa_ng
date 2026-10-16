"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  RefreshCw,
  BellOff,
  UserCheck,
} from "lucide-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";

interface SubscriberDetails {
  email: string;
  status: "SUBSCRIBED" | "UNSUBSCRIBED" | "BOUNCED" | "NOT_FOUND";
  firstName?: string;
  lastName?: string;
  company?: string;
  listName?: string;
  tenantName?: string;
  tenantSlug?: string;
}

const UNLIST_REASONS = [
  "I no longer want to receive these emails",
  "The content is no longer relevant to me",
  "I receive too many emails from this sender",
  "I never signed up for this mailing list",
  "Other reason",
];

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = (searchParams.get("token") || "").trim();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<SubscriberDetails | null>(null);

  const [selectedReason, setSelectedReason] = useState(UNLIST_REASONS[0]);
  const [customReason, setCustomReason] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Fetch token details on load
  useEffect(() => {
    if (!token) {
      setError("No unsubscribe token was provided. Please use the unsubscribe link provided in your email.");
      setLoading(false);
      return;
    }

    async function loadDetails() {
      try {
        setLoading(true);
        const res = await fetch(`/api/erp/crm/unsubscribe?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.error || "This unsubscribe link is invalid or has expired.");
          return;
        }

        setDetails(data.details);
      } catch (err: any) {
        setError("Network error while verifying unsubscribe link. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    loadDetails();
  }, [token]);

  const handleAction = async (action: "unsubscribe" | "resubscribe") => {
    if (!token) return;

    try {
      setIsSubmitting(true);
      setError(null);
      const effectiveReason =
        action === "resubscribe"
          ? "User resubscribed"
          : selectedReason === "Other reason" && customReason.trim()
          ? customReason.trim()
          : selectedReason;

      const res = await fetch("/api/erp/crm/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          action,
          reason: effectiveReason,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Failed to process request. Please try again.");
        return;
      }

      setDetails((prev) => (prev ? { ...prev, status: data.status } : null));
      setActionSuccessMessage(data.message || (action === "unsubscribe" ? "Unsubscribed successfully" : "Resubscribed successfully"));
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const companyOrSender = details?.tenantName || "Ofia ERP";
  const listDisplayName = details?.listName || "General Marketing List";

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] flex flex-col items-center justify-center p-4 selection:bg-[#0069FF]/20">
      {/* Background radial gradient accent */}
      <div className="fixed inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#0069FF]/10 via-[#00B4D8]/10 to-transparent blur-3xl rounded-full" />
      </div>

      <div className="w-full max-w-lg z-10">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-[var(--nexa-border)] flex items-center justify-center overflow-hidden">
            <Image
              src="https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png"
              alt="Ofia"
              width={26}
              height={26}
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-[var(--nexa-text-primary)]">
              {companyOrSender}
            </h2>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--nexa-text-muted)]">
              Subscription Preferences
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <NexaCard padding="lg" variant="elevated" className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-[#0069FF] animate-spin mx-auto mb-4" />
            <h3 className="text-base font-bold text-[var(--nexa-text-primary)] mb-1">
              Verifying Subscription Link...
            </h3>
            <p className="text-xs text-[var(--nexa-text-muted)]">
              Please wait while we look up your mailing preferences.
            </p>
          </NexaCard>
        )}

        {/* Error State */}
        {!loading && error && (
          <NexaCard padding="lg" variant="elevated" className="border-red-500/20 text-center py-8">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[var(--nexa-text-primary)] mb-2">
              Unable to Verify Link
            </h3>
            <p className="text-sm text-[var(--nexa-text-muted)] max-w-md mx-auto mb-6">
              {error}
            </p>
            <p className="text-xs text-[var(--nexa-text-muted)]">
              If you believe this is an error, please reach out directly to the sender or check if your email program altered the link.
            </p>
          </NexaCard>
        )}

        {/* Valid Token / Interactive State */}
        {!loading && !error && details && (
          <NexaCard padding="lg" variant="elevated" className="space-y-6">
            {/* Status Banner */}
            {details.status === "UNSUBSCRIBED" ? (
              <div className="text-center py-4 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-[var(--nexa-text-primary)]">
                    You're Unsubscribed
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                    Your email <span className="font-semibold text-[var(--nexa-text-primary)]">{details.email}</span> has been removed from{" "}
                    <span className="font-semibold text-[var(--nexa-text-primary)]">{listDisplayName}</span>.
                  </p>
                </div>

                <div className="p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300">
                  You will no longer receive promotional emails or campaign updates from this list.
                </div>

                <div className="pt-4 border-t border-[var(--nexa-border)]">
                  <p className="text-xs text-[var(--nexa-text-muted)] mb-3">
                    Unsubscribed by mistake? You can resubscribe anytime with one click.
                  </p>
                  <NexaButton
                    variant="outline"
                    size="md"
                    className="w-full"
                    onClick={() => handleAction("resubscribe")}
                    isLoading={isSubmitting}
                    leftIcon={<UserCheck className="w-4 h-4" />}
                  >
                    Resubscribe to Mailing List
                  </NexaButton>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-center space-y-1">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-3">
                    <BellOff className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-[var(--nexa-text-primary)]">
                    Unsubscribe from Emails
                  </h3>
                  <p className="text-xs text-[var(--nexa-text-muted)]">
                    Confirm you would like to stop receiving updates from{" "}
                    <strong className="text-[var(--nexa-text-primary)]">{companyOrSender}</strong>.
                  </p>
                </div>

                {/* Recipient Details Pill */}
                <div className="p-3 bg-[var(--nexa-bg-surface-elevated)] rounded-xl border border-[var(--nexa-border)] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--nexa-text-muted)]">Recipient:</span>
                    <span className="font-semibold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#0069FF]" />
                      {details.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--nexa-text-muted)]">List:</span>
                    <span className="font-medium text-[var(--nexa-text-primary)]">
                      {listDisplayName}
                    </span>
                  </div>
                </div>

                {/* Reason Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-muted)] block">
                    Reason for unsubscribing (optional):
                  </label>
                  <div className="space-y-1.5">
                    {UNLIST_REASONS.map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          selectedReason === reason
                            ? "bg-[#0069FF]/5 border-[#0069FF]/40 text-[var(--nexa-text-primary)] font-medium"
                            : "border-[var(--nexa-border)] hover:bg-[var(--nexa-bg-surface-elevated)] text-[var(--nexa-text-muted)]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="unsubscribe_reason"
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={() => setSelectedReason(reason)}
                          className="text-[#0069FF] focus:ring-[#0069FF]"
                        />
                        <span>{reason}</span>
                      </label>
                    ))}
                  </div>

                  {selectedReason === "Other reason" && (
                    <textarea
                      placeholder="Please tell us how we can improve..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="w-full mt-2 p-2.5 text-xs rounded-lg border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:ring-1 focus:ring-[#0069FF]"
                      rows={2}
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <NexaButton
                    variant="danger"
                    size="lg"
                    className="w-full text-sm font-bold shadow-sm"
                    onClick={() => handleAction("unsubscribe")}
                    isLoading={isSubmitting}
                    leftIcon={<BellOff className="w-4 h-4" />}
                  >
                    Confirm Unsubscribe
                  </NexaButton>
                </div>
              </div>
            )}

            {/* Footer Trust Badge */}
            <div className="pt-4 border-t border-[var(--nexa-border)] flex items-center justify-center gap-1.5 text-[11px] text-[var(--nexa-text-muted)]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Compliant with CAN-SPAM, NDPR, and RFC 8058 One-Click standard</span>
            </div>
          </NexaCard>
        )}

        {/* Global Footer */}
        <p className="text-center text-[11px] text-[var(--nexa-text-muted)] mt-6">
          &copy; {new Date().getFullYear()} {companyOrSender}. Powered by Ofia Business.
        </p>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--nexa-bg-base)] flex items-center justify-center p-4">
          <div className="text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#0069FF] animate-spin mx-auto" />
            <p className="text-xs text-[var(--nexa-text-muted)]">Loading preferences...</p>
          </div>
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
