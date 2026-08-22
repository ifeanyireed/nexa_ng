"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Camera, 
  X,
  MessageSquare,
  Clock,
  ArrowRight,
  ChevronLeft,
  Truck,
  UserX,
  Wrench,
  ThumbsDown,
  Hammer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaVerifiedBadge } from "@/components/nexa/NexaVerifiedBadge";

export default function SupportDisputeClient({ refId }: { refId: string }) {
  const [step, setStep] = useState(1);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const issues = [
    { id: "DISP-01", label: "Property Damage", icon: <Hammer className="w-6 h-6" /> },
    { id: "DISP-02", label: "Poor Quality", icon: <ThumbsDown className="w-6 h-6" /> },
    { id: "DISP-03", label: "Technician No-Show", icon: <UserX className="w-6 h-6" /> },
    { id: "DISP-04", label: "Overcharged", icon: <AlertTriangle className="w-6 h-6" /> },
    { id: "DISP-05", label: "Safety Concern", icon: <ShieldCheck className="w-6 h-6" /> },
    { id: "DISP-06", label: "Incorrect Parts", icon: <Wrench className="w-6 h-6" /> },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <div className="container mx-auto px-4 pt-32 max-w-3xl">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                   <div className="flex items-center gap-3 mb-4">
                      {step === 2 && (
                         <button onClick={() => setStep(1)} className="p-2 hover:bg-nexa-bg-surface rounded-xl transition-colors">
                            <ChevronLeft className="w-5 h-5" />
                         </button>
                      )}
                      <NexaVerifiedBadge />
                   </div>
                   <h1 className="text-3xl lg:text-5xl font-extrabold text-display">Resolution Center</h1>
                   <p className="text-nexa-text-secondary font-medium mt-2">How can we help you with booking <span className="text-nexa-amber font-bold">{refId}</span>?</p>
                </div>
                <div className="liquid-glass px-4 py-2 rounded-xl border-nexa-amber/20 bg-nexa-amber/5 flex items-center gap-2">
                   <Clock className="w-4 h-4 text-nexa-amber" />
                   <span className="text-[10px] font-black text-nexa-amber uppercase tracking-widest">Priority SLA: 2hr Response</span>
                </div>
              </div>

              {step === 1 ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {issues.map((issue) => (
                      <button
                        key={issue.id}
                        onClick={() => { setSelectedIssue(issue.id); setStep(2); }}
                        className={cn(
                          "liquid-glass p-8 rounded-[32px] flex flex-col items-center text-center gap-4 transition-all group border-2",
                          selectedIssue === issue.id 
                            ? "border-nexa-amber bg-nexa-amber/5" 
                            : "border-transparent hover:border-nexa-amber/30"
                        )}
                      >
                        <div className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                          selectedIssue === issue.id ? "bg-nexa-amber text-white" : "bg-nexa-bg-base text-nexa-text-faint"
                        )}>
                          {issue.icon}
                        </div>
                        <span className="text-xs font-bold leading-tight">{issue.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-nexa-text-faint">Describe the issue</h3>
                      <textarea 
                        className="w-full h-48 p-6 rounded-3xl bg-nexa-bg-surface border border-nexa-border focus:border-nexa-amber focus:ring-4 focus:ring-nexa-amber/10 outline-none transition-all font-medium resize-none"
                        placeholder="Please provide as much detail as possible to help our ops team investigate..."
                        required
                      />
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-nexa-text-faint">Attach Evidence</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button type="button" className="aspect-square rounded-2xl border-2 border-dashed border-nexa-border flex flex-col items-center justify-center gap-2 text-nexa-text-faint hover:border-nexa-amber hover:text-nexa-amber transition-all group">
                           <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Add Evidence</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-nexa-amber/5 border border-nexa-amber/10">
                       <p className="text-xs text-nexa-text-secondary leading-relaxed italic">
                         "As a NexaVerified customer, your dispute is automatically escalated to a Senior Operations Manager. We guarantee a resolution path within 24 hours."
                       </p>
                    </div>

                    <NexaButton 
                      type="submit" 
                      size="xl" 
                      className="w-full h-20 rounded-3xl bg-nexa-amber hover:bg-nexa-amber/90 shadow-2xl shadow-nexa-amber/20 text-xl font-black"
                    >
                      Submit Ticket
                    </NexaButton>
                  </form>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 space-y-12"
            >
              <div className="w-32 h-32 bg-nexa-amber text-white rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-nexa-amber/30">
                <FileText className="w-16 h-16" />
              </div>

              <div>
                <h2 className="text-4xl lg:text-6xl font-black text-display mb-6">Ticket Raised</h2>
                <p className="text-xl text-nexa-text-secondary font-medium max-w-md mx-auto leading-relaxed">
                   Your dispute <span className="text-nexa-amber font-bold">#TKT-{Math.floor(100000 + Math.random() * 900000)}</span> has been received. Our team will contact you within 2 hours.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                 <Link href="/account">
                    <NexaButton size="lg" className="w-full" rightIcon={<ArrowRight className="w-5 h-5" />}>
                       Back to Dashboard
                    </NexaButton>
                 </Link>
                 <NexaButton variant="secondary" size="lg" className="w-full" leftIcon={<MessageSquare className="w-5 h-5" />}>
                    Open Live Chat
                 </NexaButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NexaBottomBar />
    </main>
  );
}
