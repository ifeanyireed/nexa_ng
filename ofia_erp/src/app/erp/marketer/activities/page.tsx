"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  TrendingUp,
  User,
  Video,
} from "lucide-react";
import { BusinessShell } from "@/components/business/BusinessShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

const ACTIVITIES = [
  { id: "ACT-01", type: "CALL", title: "Follow-up phone call regarding revised 15kVA Solar BOM", company: "Standard Chartered Bank VI", rep: "Chioma Okon", time: "Today, 02:30 PM", status: "SCHEDULED" },
  { id: "ACT-02", type: "DEMO", title: "Live Product Demonstration of Ofia AI Swarm & POS", company: "Hubmart Supermarkets", rep: "Chioma Okon", time: "Tomorrow, 10:00 AM", status: "UPCOMING" },
  { id: "ACT-03", type: "MEETING", title: "On-site Facility Security Site Survey (32 Cameras)", company: "Eko Atlantic Horizon Towers", rep: "Emeka Okafor", time: "Aug 24, 2026", status: "SCHEDULED" },
  { id: "ACT-04", type: "EMAIL", title: "Dispatched final executed SLA & Escrow Contract", company: "Ahnara Global Health", rep: "Ibrahim Musa", time: "Aug 20, 2026", status: "COMPLETED" },
];

export default function CRMActivitiesPage() {
  const getIcon = (type: string) => {
    switch (type) {
      case "CALL": return <Phone className="w-4 h-4 text-blue-500" />;
      case "DEMO": return <Video className="w-4 h-4 text-purple-500" />;
      case "MEETING": return <Calendar className="w-4 h-4 text-amber-500" />;
      case "EMAIL": return <Mail className="w-4 h-4 text-emerald-500" />;
      default: return <MessageSquare className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <BusinessShell
      title="Sales Activities & Customer Touchpoints"
      subtitle="Log client calls, on-site meetings, live product demos, and WhatsApp communications."
      action={
        <div className="flex items-center gap-2">
          <Link href="/erp/marketer">
            <NexaButton size="sm" variant="outline" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              CRM Overview
            </NexaButton>
          </Link>
          <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />} className="bg-[#1A56DB] text-white">
            Log New Activity
          </NexaButton>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="space-y-3">
          {ACTIVITIES.map((act) => (
            <NexaCard key={act.id} variant="glass" padding="md" className="flex items-center justify-between border border-[var(--nexa-border)]">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-center">
                  {getIcon(act.type)}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-[var(--nexa-text-primary)]">{act.title}</h3>
                  <p className="text-[11px] text-[var(--nexa-text-muted)] flex items-center gap-2 mt-0.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{act.company}</span>
                    <span>•</span>
                    <span className="text-pink-600 font-medium">{act.rep}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-[var(--nexa-text-muted)]">{act.time}</span>
                <NexaBadge variant={act.status === "COMPLETED" ? "green" : "brand"}>{act.status}</NexaBadge>
              </div>
            </NexaCard>
          ))}
        </div>
      </div>
    </BusinessShell>
  );
}
