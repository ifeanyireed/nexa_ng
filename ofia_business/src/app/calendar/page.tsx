"use client";

import React from "react";
import { AppShell } from "@/components/gtm/AppShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { Calendar as CalendarIcon, Clock, Plus, Mail, MessageSquare, Radio, Sparkles } from "lucide-react";

export default function CalendarPage() {
  const schedule = [
    {
      day: "Today (Aug 15)",
      events: [
        { time: "8:30 AM", channel: "Email", title: "Batch 1: Principal Direct Cold Email (120 drops)", agent: "Noah Sterling", status: "Sent" },
        { time: "2:00 PM", channel: "WhatsApp", title: "WhatsApp Demo Booking Follow-up (42 chats)", agent: "Amara Obi", status: "Scheduled" },
        { time: "5:00 PM", channel: "LinkedIn", title: "Carousel Ad: 'The 3 Hidden Leaks in School Bursaries'", agent: "Chloe Vane", status: "Pending Approval" },
      ],
    },
    {
      day: "Tomorrow (Aug 16)",
      events: [
        { time: "9:00 AM", channel: "Email", title: "Follow-up Touchpoint #2 to Non-responders", agent: "Noah Sterling", status: "Queued" },
        { time: "11:30 AM", channel: "WhatsApp", title: "WhatsApp Broadcast to Brochure Downloaders", agent: "Amara Obi", status: "Scheduled" },
      ],
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <NexaBadge variant="brand" dot>
                Devon Reed (Campaign Manager)
              </NexaBadge>
              <span className="text-xs text-[var(--nexa-text-muted)]">
                Unified Multi-Channel Schedule
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--nexa-text-primary)] text-display tracking-tight">
              Publishing & Outreach Calendar
            </h1>
            <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
              Cross-channel flight schedules, automated email drops, and WhatsApp broadcast timings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <NexaButton size="sm" variant="primary" leftIcon={<Plus className="w-4 h-4" />}>
              Schedule Touchpoint
            </NexaButton>
          </div>
        </div>

        {/* Schedule List */}
        <div className="space-y-6">
          {schedule.map((dayGroup, idx) => (
            <div key={idx} className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--nexa-text-muted)] flex items-center gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-[#1A56DB]" />
                {dayGroup.day}
              </h2>

              <div className="space-y-3">
                {dayGroup.events.map((ev, eIdx) => (
                  <NexaCard key={eIdx} variant="glass" padding="md" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-mono font-bold shrink-0">
                        {ev.time}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[var(--nexa-text-primary)]">
                            {ev.title}
                          </span>
                          <NexaBadge
                            variant={
                              ev.status === "Sent"
                                ? "success"
                                : ev.status === "Pending Approval"
                                ? "warning"
                                : "brand"
                            }
                          >
                            {ev.status}
                          </NexaBadge>
                        </div>
                        <div className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">
                          Channel: <strong className="text-[var(--nexa-text-secondary)]">{ev.channel}</strong> · Managed by {ev.agent}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <NexaButton size="sm" variant="outline">
                        Reschedule
                      </NexaButton>
                    </div>
                  </NexaCard>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
