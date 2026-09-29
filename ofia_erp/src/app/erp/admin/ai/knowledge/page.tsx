"use client";

import React from "react";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { BookOpen, UploadCloud, Globe, FileText, Sparkles, CheckCircle2, Database } from "lucide-react";

export default function KnowledgePage() {
  const documents = [
    { name: "EduSuite Product Brochure & Pricing 2026.pdf", size: "2.4 MB", status: "Indexed (1,420 chunks)", date: "Aug 12, 2026" },
    { name: "Private School Operations Benchmark Report.pdf", size: "4.1 MB", status: "Indexed (2,840 chunks)", date: "Aug 10, 2026" },
    { name: "Competitor Comparison & Objection Handling.docx", size: "640 KB", status: "Indexed (620 chunks)", date: "Aug 08, 2026" },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="brand" dot>
                Nexus Core (Memory Agent)
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                Organizational Intelligence Vault
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              Memory & Knowledge Vault
            </h1>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Documents, product pricing, brand assets, and learned outcome weights indexed into vector memory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NexaButton size="sm" variant="primary" leftIcon={<UploadCloud className="w-4 h-4" />}>
              Upload Knowledge Asset
            </NexaButton>
          </div>
        </div>

        {/* Website Auto-Crawler Status */}
        <NexaCard variant="glass" padding="lg" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[var(--nexa-border)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#1A56DB] text-white">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                  Live Website Crawler: https://edusuite.ng
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)]">
                  Continuous indexing of pages, pricing updates, and product features
                </p>
              </div>
            </div>

            <NexaBadge variant="success" dot>
              Crawled 24 pages · Up to Date
            </NexaBadge>
          </div>

          <div className="flex items-center justify-between text-xs text-[var(--nexa-text-muted)]">
            <span>Last crawl completed 4 hours ago</span>
            <NexaButton size="sm" variant="outline">
              Trigger Full Re-crawl
            </NexaButton>
          </div>
        </NexaCard>

        {/* Indexed Knowledge Documents */}
        <NexaCard variant="glass" padding="lg" className="space-y-4">
          <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] text-display">
            Indexed Business Assets & Product Guides
          </h3>

          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] flex items-center justify-between hover:border-[#1A56DB]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#EBF5FF] dark:bg-[#3B82F6]/15 text-[#1A56DB]">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                      {doc.name}
                    </div>
                    <div className="text-[10px] text-[var(--nexa-text-muted)] mt-0.5">
                      {doc.size} · Uploaded on {doc.date}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <NexaBadge variant="brand">{doc.status}</NexaBadge>
                  <NexaButton size="sm" variant="ghost">
                    Inspect
                  </NexaButton>
                </div>
              </div>
            ))}
          </div>
        </NexaCard>
      </div>
    </AppShell>
  );
}
