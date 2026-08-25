"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight,
  Send,
  HelpCircle,
  LifeBuoy,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaInput } from "@/components/nexa/NexaInput";

export default function ContactPage() {
  const contactInfo = [
    { title: "Email Support", value: "hello@ofia.ng", icon: <Mail className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Phone / WhatsApp", value: "+234 803 000 0000", icon: <Phone className="w-5 h-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Lagos HQ", value: "Victoria Island, Lagos", icon: <MapPin className="w-5 h-5" />, color: "text-coral", bg: "bg-coral/10" },
  ];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMessage("Please complete all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit support ticket.");
      }

      setSubmittedTicket(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <section className="pt-32 pb-16 bg-nexa-bg-surface border-b border-nexa-border">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-display mb-6">Contact Support</h1>
          <p className="text-xl text-nexa-text-secondary max-w-2xl leading-relaxed">
            Need help with your account, marketplace integrations, or have a business question? Our team is here to support you.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* CONTACT FORM */}
          <div className="lg:col-span-2">
            <NexaCard variant="glass" className="p-8 md:p-12 shadow-2xl border-nexa-border/50">
              {!submittedTicket ? (
                <>
                  <h2 className="text-2xl font-extrabold mb-8">Send us a Message</h2>
                  {errorMessage && (
                    <div className="p-3.5 mb-6 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs font-semibold">
                      {errorMessage}
                    </div>
                  )}
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <NexaInput 
                        label="Your Name *" 
                        placeholder="e.g. John Doe" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                      <NexaInput 
                        label="Email Address *" 
                        type="email"
                        placeholder="name@example.com" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-nexa-text-faint uppercase tracking-widest ml-1">Subject</label>
                        <select 
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full h-14 bg-nexa-bg-base border border-nexa-border rounded-2xl px-6 focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all font-medium cursor-pointer"
                        >
                          <option>General Inquiry</option>
                          <option>Technical Issue</option>
                          <option>Business Partnership</option>
                          <option>Billing / Payments</option>
                          <option>Report a Business</option>
                        </select>
                      </div>
                      <NexaInput 
                        label="Phone / WhatsApp Number (Optional)" 
                        type="tel"
                        placeholder="+234 803 000 0000" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-nexa-text-faint uppercase tracking-widest ml-1">How can we help? *</label>
                      <textarea 
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full h-40 bg-nexa-bg-base border border-nexa-border rounded-2xl p-6 focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all font-medium resize-none text-sm"
                        placeholder="Describe your issue or question in detail..."
                      />
                    </div>
                    <NexaButton 
                      type="submit"
                      disabled={loading}
                      size="lg" 
                      className="w-full md:w-auto px-12 h-16 rounded-2xl bg-nexa-brand text-white" 
                      rightIcon={loading ? undefined : <Send className="w-5 h-5" />}
                    >
                      {loading ? "Submitting..." : "Send Ticket"}
                    </NexaButton>
                  </form>
                </>
              ) : (
                /* SUCCESS TICKET STATE */
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-600">
                    <BadgeCheck className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                      Ticket Generated
                    </span>
                    <h3 className="text-2xl md:text-3xl font-extrabold mt-3">Message Received!</h3>
                    <p className="text-sm text-nexa-text-secondary mt-2 max-w-md mx-auto">
                      Thank you, <strong>{name}</strong>. Your support inquiry has been logged into our admin CRM queue under reference <strong>{submittedTicket.ticketNumber}</strong>.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl bg-nexa-bg-base border border-nexa-border text-left max-w-md mx-auto space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-nexa-border">
                      <span className="text-xs text-nexa-text-muted">Ticket Reference</span>
                      <span className="font-mono text-sm font-bold text-nexa-brand">{submittedTicket.ticketNumber}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-nexa-border">
                      <span className="text-xs text-nexa-text-muted">Subject Category</span>
                      <span className="text-xs font-bold">{subject}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-nexa-text-muted">Estimated Response</span>
                      <span className="text-xs font-bold text-emerald-600">&lt; 2 Hours</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedTicket(null);
                      setMessage("");
                    }}
                    className="text-xs font-bold text-nexa-brand hover:underline cursor-pointer"
                  >
                    Submit another inquiry
                  </button>
                </motion.div>
              )}
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
