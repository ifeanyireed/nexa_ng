"use client";

import React from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  CheckCircle2, 
  ShieldCheck, 
  MapPin, 
  MessageSquare, 
  Phone,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaVerifiedBadge } from "@/components/nexa/NexaVerifiedBadge";
import { NexaGuaranteeCard } from "@/components/nexa/NexaGuaranteeCard";

export default function BookingConfirmationPage() {
  const params = useParams();
  const ref = params.ref as string;

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24">
      <NexaNavbar />
      
      <div className="container mx-auto px-4 pt-32 max-w-4xl">
        {/* SUCCESS ANIMATION */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20 relative"
          >
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-nexa-amber rounded-full"
            >
              <ShieldCheck className="w-12 h-12 text-white" />
            </motion.div>
          </motion.div>

          <h1 className="text-3xl lg:text-5xl font-extrabold text-display mb-4">You're all set. Nexa has you covered.</h1>
          <p className="text-nexa-text-secondary font-bold">Booking Ref: <span className="text-nexa-amber">{ref}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* TECHNICIAN ASSIGNED CARD */}
          <NexaCard variant="glass" className="p-8 border-nexa-amber/20 bg-nexa-amber-light/5 dark:bg-nexa-amber/5">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-bold">Technician Assigned</h3>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-wider">
                 <ShieldCheck className="w-3 h-3" /> Background Verified
              </div>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-xl">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" alt="Tech" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-nexa-amber text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h4 className="text-xl font-extrabold">Samuel O.</h4>
                <p className="text-xs font-bold text-nexa-text-faint mb-2">ID: NX-881920</p>
                <div className="flex flex-wrap gap-2">
                   {["Electrical", "Inverter", "Solar"].map(tag => (
                     <span key={tag} className="text-[9px] font-bold bg-nexa-amber/10 text-nexa-amber px-2 py-0.5 rounded-md">{tag}</span>
                   ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-nexa-border">
                  <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest mb-1">Rating</p>
                  <p className="font-extrabold">4.92★ <span className="text-[10px] font-medium text-nexa-text-faint">(120+ jobs)</span></p>
               </div>
               <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-nexa-border">
                  <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest mb-1">Status</p>
                  <p className="font-extrabold text-emerald-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Available
                  </p>
               </div>
            </div>

            <div className="flex flex-col gap-3">
               <Link href={`/booking/${ref}/track`}>
                  <NexaButton size="lg" className="w-full bg-nexa-amber hover:bg-nexa-amber/90" leftIcon={<MapPin className="w-5 h-5" />}>
                     Track on Map
                  </NexaButton>
               </Link>
               <div className="grid grid-cols-2 gap-3">
                  <NexaButton variant="secondary" className="flex-1" leftIcon={<MessageSquare className="w-5 h-5" />}>Message</NexaButton>
                  <NexaButton variant="secondary" className="flex-1" leftIcon={<Phone className="w-5 h-5" />}>Call</NexaButton>
               </div>
            </div>
          </NexaCard>

          <div className="space-y-8">
            {/* GUARANTEE CARD */}
            <NexaGuaranteeCard />

            {/* WHAT HAPPENS NEXT */}
            <div className="liquid-glass p-8 rounded-[32px] border-none bg-nexa-bg-surface/50">
               <h3 className="text-lg font-bold mb-8">What happens next?</h3>
               <div className="space-y-8">
                  {[
                    { title: "Arrival", body: "Samuel will arrive at your location at 09:00 AM on Oct 12." },
                    { title: "Service", body: "Confirm the work scope before he starts. He'll take before/after photos." },
                    { title: "Completion", body: "Verify the job is done and release the funds via your app." }
                  ].map((step, i) => (
                    <div key={i} className="flex gap-4 relative">
                      {i < 2 && <div className="absolute top-8 left-4 w-0.5 h-12 bg-nexa-border" />}
                      <div className="w-8 h-8 rounded-full bg-nexa-bg-base border border-nexa-border flex items-center justify-center font-bold text-xs shrink-0 relative z-10">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm mb-1">{step.title}</h4>
                        <p className="text-xs text-nexa-text-secondary leading-relaxed">{step.body}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
           <Link href="/account" className="text-sm font-bold text-nexa-brand flex items-center justify-center gap-2 hover:gap-3 transition-all">
              Go to my dashboard <ArrowRight className="w-4 h-4" />
           </Link>
        </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
