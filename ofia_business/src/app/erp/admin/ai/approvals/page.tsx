"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { CardsGridSkeleton } from "@/components/nexa/PageSkeleton";
import { INITIAL_APPROVALS, ApprovalItem } from "@/lib/gtm-data";
import { GTM_API } from "@/lib/api-client";
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  AlertTriangle,
  Mail,
  MessageSquare,
  DollarSign,
  Send,
  Eye,
  RefreshCw,
} from "lucide-react";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>(INITIAL_APPROVALS);
  const [selectedItem, setSelectedItem] = useState<ApprovalItem>(INITIAL_APPROVALS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadApprovals() {
      try {
        const liveData = await GTM_API.getApprovals("org-01");
        if (Array.isArray(liveData) && liveData.length > 0) {
          const mapped: ApprovalItem[] = liveData.map((item: any) => ({
            id: item.id,
            title: item.title,
            type: (item.type || "Email Campaign") as any,
            creatorAgent: item.creator_agent_key ? item.creator_agent_key.toUpperCase() : "Julian Cross",
            creatorAvatar: "/avatar6.png",
            riskLevel: (item.risk_level === "HIGH" ? "High" : item.risk_level === "LOW" ? "Low" : "Medium") as any,
            targetChannel: item.target_channel || "Email Outreach",
            scheduledTime: "Queued for immediate dispatch",
            summary: item.preview_data_json ? (JSON.parse(item.preview_data_json).subject || item.title) : "Campaign sequence ready for execution.",
            previewData: item.preview_data_json ? JSON.parse(item.preview_data_json) : { body: "Automated sequence body" },
            status: (item.status === "APPROVED" ? "Approved" : item.status === "REJECTED" ? "Rejected" : "Pending") as any,
          }));
          setApprovals(mapped);
          setSelectedItem(mapped[0]);
        }
      } catch (err) {
        console.warn("Using cached approvals:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadApprovals();
  }, []);

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await GTM_API.authorizeApproval("org-01", id);
      setApprovals((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "Approved" } : item))
      );
      setToastMessage("Batch signed off! Noah Sterling is actively warming up and dispatching.");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error("Approval error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    setIsProcessing(true);
    try {
      await GTM_API.rejectApproval("org-01", id);
      setApprovals((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: "Rejected" } : item))
      );
      setToastMessage("Campaign returned to Julian Cross (Copywriter) with rewrite instructions.");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error("Reject error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingCount = approvals.filter((a) => a.status === "Pending").length;

  return (
    <AppShell>
      {isLoading ? (
        <CardsGridSkeleton count={4} />
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <NexaBadge variant={pendingCount > 0 ? "warning" : "success"} dot>
                  {pendingCount} Awaiting Authorization
                </NexaBadge>
                <span className="text-xs text-[var(--nexa-text-muted)]">
                  Autonomous Safety Guardrail
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
                Approval & Gatekeeper Center
              </h1>
              <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                High-impact sequences, budget scaling, and positioning shifts require human verification before execution.
              </p>
            </div>
          </div>

          {toastMessage && (
            <div className="p-3.5 rounded-2xl bg-[#ECFDF5] text-[#0E9F6E] dark:bg-[#10B981]/20 dark:text-[#34D399] border border-[#0E9F6E]/30 text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {toastMessage}
            </div>
          )}

          {/* Master Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Approval List */}
            <div className="lg:col-span-5 space-y-3">
              {approvals.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedItem?.id === item.id
                      ? "bg-[var(--nexa-bg-surface)] border-[#1A56DB] shadow-md dark:border-[#3B82F6]"
                      : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] hover:border-[#1A56DB]/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A56DB]">
                        {item.targetChannel}
                      </span>
                      <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] mt-0.5">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[var(--nexa-text-muted)] mt-1 line-clamp-2">
                        {item.summary}
                      </p>
                    </div>

                    <NexaBadge
                      variant={
                        item.status === "Approved"
                          ? "success"
                          : item.status === "Rejected"
                          ? "danger"
                          : item.riskLevel === "High"
                          ? "danger"
                          : "warning"
                      }
                    >
                      {item.status === "Pending" ? `${item.riskLevel} Risk` : item.status}
                    </NexaBadge>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Live Inspector Diff */}
            <div className="lg:col-span-7">
              {selectedItem && (
                <NexaCard variant="glass" padding="lg" className="space-y-5 sticky top-6">
                  <div className="flex items-start justify-between border-b border-[var(--nexa-border)] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <NexaBadge variant="brand">{selectedItem.type}</NexaBadge>
                        <span className="text-xs text-[var(--nexa-text-muted)]">
                          Created by {selectedItem.creatorAgent}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-[var(--nexa-text-primary)] text-display mt-2">
                        {selectedItem.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <NexaButton
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(selectedItem.id)}
                        disabled={isProcessing || selectedItem.status !== "Pending"}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1 text-[#E02424]" /> Reject
                      </NexaButton>
                      <NexaButton
                        size="sm"
                        variant="primary"
                        onClick={() => handleApprove(selectedItem.id)}
                        disabled={isProcessing || selectedItem.status !== "Pending"}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                        {selectedItem.status === "Approved" ? "Approved" : "1-Click Authorize"}
                      </NexaButton>
                    </div>
                  </div>

                  {/* Preview Container */}
                  <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3 font-mono text-xs">
                    {selectedItem.previewData.subject && (
                      <div className="border-b border-[var(--nexa-border)] pb-2 text-[var(--nexa-text-primary)]">
                        <strong>Subject:</strong> {selectedItem.previewData.subject}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-[var(--nexa-text-secondary)] leading-relaxed">
                      {selectedItem.previewData.body}
                    </div>
                  </div>
                </NexaCard>
              )}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
