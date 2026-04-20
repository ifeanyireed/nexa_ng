"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight,
  Send,
  HelpCircle,
  LifeBuoy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaInput } from "@/components/nexa/NexaInput";

export default function ContactPage() {
  const contactInfo = [
    { title: "Email Support", value: "hello@nexa.ng", icon: <Mail className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Phone / WhatsApp", value: "+234 803 000 0000", icon: <Phone className="w-5 h-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Lagos HQ", value: "Victoria Island, Lagos", icon: <MapPin className="w-5 h-5" />, color: "text-coral", bg: "bg-coral/10" },
  ];

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <section className="pt-32 pb-16 bg-nexa-bg-surface border-b border-nexa-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-display mb-6">Contact Support</h1>
          <p className="text-xl text-nexa-text-secondary max-w-2xl leading-relaxed">
            Need help with your account or have a question about a service? Our team is here to support you.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* CONTACT FORM */}
          <div className="lg:col-span-2">
            <NexaCard variant="glass" className="p-8 md:p-12 shadow-2xl border-nexa-border/50">
              <h2 className="text-2xl font-extrabold mb-8">Send us a Message</h2>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <NexaInput label="Your Name" placeholder="e.g. John Doe" />
                  <NexaInput label="Email Address" placeholder="name@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-nexa-text-faint uppercase tracking-widest ml-1">Subject</label>
                  <select className="w-full h-14 bg-nexa-bg-base border border-nexa-border rounded-2xl px-6 focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all font-medium">
                    <option>General Inquiry</option>
                    <option>Technical Issue</option>
                    <option>Business Partnership</option>
                    <option>Billing / Payments</option>
                    <option>Report a Business</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-nexa-text-faint uppercase tracking-widest ml-1">How can we help?</label>
                  <textarea 
                    className="w-full h-40 bg-nexa-bg-base border border-nexa-border rounded-2xl p-6 focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all font-medium resize-none"
                    placeholder="Describe your issue or question in detail..."
                  />
                </div>
                <NexaButton size="lg" className="w-full md:w-auto px-12 h-16 rounded-2xl" rightIcon={<Send className="w-5 h-5" />}>
                  Send Ticket
                </NexaButton>
              </form>
            </NexaCard>
          </div>

          {/* SIDEBAR INFO */}
          <div className="space-y-8">
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-nexa-text-faint uppercase tracking-widest ml-1">Direct Contact</h3>
              <div className="space-y-4">
                {contactInfo.map((info, i) => (
                  <div key={i} className="flex items-center gap-4 p-6 rounded-2xl bg-nexa-bg-surface border border-nexa-border">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", info.bg, info.color)}>
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-nexa-text-faint uppercase tracking-widest">{info.title}</p>
                      <p className="text-sm font-bold">{info.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <NexaCard className="p-8 bg-nexa-brand/5 border-nexa-brand/10">
               <div className="flex items-center gap-4 mb-6">
                  <HelpCircle className="w-8 h-8 text-nexa-brand" />
                  <h3 className="text-lg font-bold">Help Center</h3>
               </div>
               <p className="text-sm text-nexa-text-secondary leading-relaxed mb-8">
                  Check our frequently asked questions for instant answers to common issues.
               </p>
               <NexaButton variant="secondary" className="w-full" rightIcon={<ChevronRight className="w-4 h-4" />}>Browse FAQs</NexaButton>
            </NexaCard>

            <NexaCard className="p-8 bg-emerald-500/5 border-emerald-500/10">
               <div className="flex items-center gap-4 mb-6">
                  <LifeBuoy className="w-8 h-8 text-emerald-500" />
                  <h3 className="text-lg font-bold">Developer API</h3>
               </div>
               <p className="text-sm text-nexa-text-secondary leading-relaxed mb-8">
                  Looking to integrate Nexa into your application? Explore our documentation.
               </p>
               <NexaButton variant="secondary" className="w-full" rightIcon={<ChevronRight className="w-4 h-4" />}>API Docs</NexaButton>
            </NexaCard>
          </div>

        </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
