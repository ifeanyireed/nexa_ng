"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import {
  Mail,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
  Send,
  MessageSquare,
} from "lucide-react";
import {
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconBrandLinkedin,
} from "@tabler/icons-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    role: "VP Sales / CRO",
    leadVolume: "5,000 - 20,000 leads / mo",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>("Tomorrow at 2:00 PM WAT");

  const slots = [
    "Today at 4:30 PM WAT",
    "Tomorrow at 10:00 AM WAT",
    "Tomorrow at 2:00 PM WAT",
    "Wednesday at 11:30 AM WAT",
    "Thursday at 3:00 PM WAT",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)]">
      <PublicNav />

      {/* Header */}
      <section className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 text-center max-w-4xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A56DB]/10 text-[#1A56DB] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          Enterprise GTM Architecture Team
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-display tracking-tight text-[var(--nexa-text-primary)]">
          Let’s Architect Your <span className="text-[#1A56DB]">Autonomous Revenue Swarm</span>
        </h1>
        <p className="text-xs sm:text-sm text-[var(--nexa-text-secondary)] max-w-2xl mx-auto leading-relaxed">
          Book a 1-on-1 strategy teardown with our Chief Revenue Officer and GTM engineers. We'll analyze your current outbound bottlenecks and demonstrate a live 14-agent swarm run customized for your ICP.
        </p>
      </section>

      {/* Main Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Connect & Direct Bot Channels */}
          <div className="lg:col-span-5 space-y-6">
            <NexaCard variant="glass" padding="lg" className="space-y-6">
              <div>
                <h3 className="font-extrabold text-base text-[var(--nexa-text-primary)] text-display">
                  Instant Support & Direct Channels
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                  Connect with our GTM leadership instantly across multiple encrypted channels.
                </p>
              </div>

              {/* Direct Channel 1: Telegram CRO Bot */}
              <a
                href="https://t.me/OfiaGTM_CRO_Bot"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] hover:border-[#1A56DB]/50 flex items-center justify-between transition-all group block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <IconBrandTelegram className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                      Telegram CRO Bot Direct
                    </div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">
                      @OfiaGTM_CRO_Bot (Instant AI & Human)
                    </div>
                  </div>
                </div>
                <NexaBadge variant="brand">Open Bot →</NexaBadge>
              </a>

              {/* Direct Channel 2: WhatsApp WABA Concierge */}
              <a
                href="https://wa.me/2348000000000"
                target="_blank"
                rel="noreferrer"
                className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] hover:border-[#0E9F6E]/50 flex items-center justify-between transition-all group block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0E9F6E]/10 text-[#0E9F6E] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <IconBrandWhatsapp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                      WhatsApp Enterprise Concierge
                    </div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">
                      Meta Cloud Verified Channel
                    </div>
                  </div>
                </div>
                <NexaBadge variant="success">Chat Now →</NexaBadge>
              </a>

              {/* Direct Channel 3: Official Email */}
              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Official Executive Inquiry
                  </div>
                  <div className="text-xs font-mono text-[var(--nexa-text-muted)]">
                    enterprise@ofia.ng · sla@gtm.agency
                  </div>
                </div>
              </div>

              {/* SLA Guarantees */}
              <div className="pt-4 border-t border-[var(--nexa-border)] space-y-2 text-xs text-[var(--nexa-text-secondary)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0E9F6E]" />
                  <span>Enterprise Inquiry Response SLA: <strong>&lt; 2 Hours</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0E9F6E]" />
                  <span>Dedicated Solutions Architect assigned to all Growth+ tiers</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1A56DB]" />
                  <span>SOC2 Type II & GDPR Compliant Infrastructure</span>
                </div>
              </div>
            </NexaCard>
          </div>

          {/* Right Column: Interactive Consultation Booking Form */}
          <div className="lg:col-span-7">
            <NexaCard variant="glass" padding="lg" className="border-2 border-[#1A56DB]/20 space-y-6">
              <div>
                <h3 className="font-extrabold text-lg text-[var(--nexa-text-primary)] text-display">
                  Book a Live Strategy Consultation
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                  Fill out your target audience parameters and select a convenient time slot.
                </p>
              </div>

              {isSubmitted ? (
                <div className="p-8 rounded-2xl bg-[var(--nexa-bg-base)] border border-[#0E9F6E]/40 text-center space-y-4 animate-in zoom-in-95">
                  <div className="w-14 h-14 rounded-full bg-[#0E9F6E]/20 text-[#0E9F6E] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-[var(--nexa-text-primary)]">
                    Strategy Session Confirmed!
                  </h4>
                  <p className="text-xs text-[var(--nexa-text-secondary)] max-w-md mx-auto leading-relaxed">
                    Thank you, <strong>{formData.name}</strong>. A calendar invite for <strong>{selectedSlot}</strong> has been dispatched to <strong>{formData.email}</strong>, along with your pre-call ICP analysis worksheet.
                  </p>
                  <div className="pt-2">
                    <Link href="/">
                      <NexaButton size="md" variant="primary" className="font-bold text-xs">
                        Back to Home
                      </NexaButton>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NexaInput
                      label="Full Name"
                      required
                      placeholder="e.g. Folashade Aina"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <NexaInput
                      label="Work Email"
                      type="email"
                      required
                      placeholder="folashade@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <NexaInput
                      label="Company Name"
                      required
                      placeholder="PayFlow Africa / EduSuite"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    />
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-[var(--nexa-text-secondary)]">Your Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full h-11 px-3 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none"
                      >
                        <option value="Founder / CEO">Founder / CEO</option>
                        <option value="VP Sales / CRO">VP Sales / CRO</option>
                        <option value="Head of Growth / Marketing">Head of Growth / Marketing</option>
                        <option value="Sales Development Lead">Sales Development Lead</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[var(--nexa-text-secondary)]">
                      Estimated Monthly Outreach Volume
                    </label>
                    <select
                      value={formData.leadVolume}
                      onChange={(e) => setFormData({ ...formData, leadVolume: e.target.value })}
                      className="w-full h-11 px-3 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none"
                    >
                      <option value="Under 1,000 leads / mo">Under 1,000 leads / mo (Starter)</option>
                      <option value="1,000 - 5,000 leads / mo">1,000 - 5,000 leads / mo (Growth)</option>
                      <option value="5,000 - 20,000 leads / mo">5,000 - 20,000 leads / mo (Scale)</option>
                      <option value="20,000+ leads / mo">20,000+ leads / mo (Enterprise Cluster)</option>
                    </select>
                  </div>

                  {/* Slot Selector */}
                  <div className="space-y-2 pt-2">
                    <label className="text-xs font-semibold text-[var(--nexa-text-secondary)] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1A56DB]" />
                      Select Preferred Consultation Time Slot
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl text-left text-xs font-medium border transition-all cursor-pointer ${
                            selectedSlot === slot
                              ? "bg-[#1A56DB]/10 border-[#1A56DB] text-[#1A56DB] font-bold"
                              : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-[var(--nexa-border-strong)]"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-xs font-semibold text-[var(--nexa-text-secondary)]">
                      Current GTM Obstacles / Notes (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="e.g. We are expanding private school ERP sales in Lagos and need automated WhatsApp and Email follow-ups..."
                      className="w-full p-3 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] outline-none resize-none focus:border-[#1A56DB]"
                    />
                  </div>

                  <div className="pt-2">
                    <NexaButton
                      size="lg"
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      className="w-full font-extrabold text-sm shadow-md shadow-[#1A56DB]/20"
                      rightIcon={<Send className="w-4 h-4" />}
                    >
                      Confirm Strategy Teardown & Demo
                    </NexaButton>
                  </div>
                </form>
              )}
            </NexaCard>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
