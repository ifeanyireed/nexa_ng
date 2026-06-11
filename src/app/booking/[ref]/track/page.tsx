"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  MapPin, 
  MessageSquare, 
  Phone,
  ChevronLeft,
  Navigation,
  CheckCircle2,
  AlertCircle,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaVerifiedBadge } from "@/components/nexa/NexaVerifiedBadge";

export default function LiveJobTrackerPage() {
  const params = useParams();
  const ref = params.ref as string;
  const [status, setStatus] = useState("en-route"); // en-route, arrived, in-progress, completed
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Mock status progression
  useEffect(() => {
    const timers = [
      setTimeout(() => setStatus("arrived"), 5000),
      setTimeout(() => setStatus("in-progress"), 10000),
      setTimeout(() => {
        setStatus("completed");
        setShowCompletionModal(true);
      }, 15000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const steps = [
    { id: "assigned", label: "Assigned" },
    { id: "en-route", label: "En Route" },
    { id: "in-progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === status);

  return (
    <main className="bg-nexa-bg-base min-h-screen relative overflow-hidden flex flex-col">
      {/* TOP: MOCK MAP SECTION (55%) */}
      <section className="flex-1 relative bg-slate-200 dark:bg-slate-800">
        <div className="absolute inset-0 opacity-50 overflow-hidden">
          {/* Mock Map Grid */}
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          {/* Mock Route Line */}
          <svg className="absolute inset-0 w-full h-full">
            <motion.path
              d="M 100 100 Q 250 150 400 300 T 600 450"
              fill="none"
              stroke="var(--nexa-amber)"
              strokeWidth="4"
              strokeDasharray="8 8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 10, ease: "linear", repeat: Infinity }}
            />
          </svg>
        </div>

        {/* Floating Pins */}
        <motion.div 
           animate={{ 
             x: [100, 250, 400, 600],
             y: [100, 150, 300, 450]
           }}
           transition={{ duration: 15, ease: "linear" }}
           className="absolute z-20"
        >
           <div className="relative">
              <div className="w-12 h-12 rounded-full bg-nexa-amber text-white flex items-center justify-center shadow-2xl border-2 border-white animate-bounce">
                 <Navigation className="w-6 h-6 rotate-45" />
              </div>
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-lg border border-nexa-amber/20">
                 <span className="text-[10px] font-black text-nexa-amber uppercase tracking-wider">Your Technician</span>
              </div>
           </div>
        </motion.div>

        <div className="absolute bottom-1/4 right-1/4 z-10">
           <div className="w-12 h-12 rounded-full bg-nexa-brand text-white flex items-center justify-center shadow-2xl border-2 border-white">
              <MapPin className="w-6 h-6" />
           </div>
           <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white dark:bg-slate-900 px-3 py-1 rounded-full shadow-lg border border-nexa-brand/20">
              <span className="text-[10px] font-black text-nexa-brand uppercase tracking-wider">Your Home</span>
           </div>
        </div>

        {/* Back Button */}
        <Link href={`/book/nexa-verified/confirmed/${ref}`} className="absolute top-8 left-8 z-30 p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-nexa-border">
           <ChevronLeft className="w-6 h-6" />
        </Link>

        {/* ETA Badge */}
        <div className="absolute top-8 right-8 z-30 liquid-glass px-6 py-3 rounded-2xl border-nexa-amber/30 bg-nexa-amber-light/80 dark:bg-nexa-amber/20 backdrop-blur-xl shadow-2xl">
           <p className="text-[10px] font-black text-nexa-amber uppercase tracking-widest mb-0.5">Estimated Arrival</p>
           <p className="text-xl font-black">{status === "en-route" ? "8 mins" : status === "arrived" ? "Arrived" : "On Site"}</p>
        </div>
      </section>

      {/* BOTTOM: JOB PANEL (45%) */}
      <section className="bg-nexa-bg-surface rounded-t-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.1)] relative z-30 -mt-10 p-8">
        <div className="max-w-4xl mx-auto space-y-8">
           {/* Status Bar */}
           <div className="flex justify-between items-center mb-12">
              {steps.map((step, i) => (
                <div key={step.id} className="flex-1 flex flex-col items-center relative">
                   {i < steps.length - 1 && (
                      <div className="absolute top-4 left-1/2 w-full h-[2px] bg-nexa-border">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: i < currentStepIndex ? "100%" : 0 }}
                            className="h-full bg-nexa-amber"
                         />
                      </div>
                   )}
                   <div className={cn(
                      "w-8 h-8 rounded-full border-2 flex items-center justify-center relative z-10 transition-all duration-500",
                      i <= currentStepIndex 
                        ? "bg-nexa-amber border-nexa-amber text-white shadow-lg shadow-nexa-amber/20" 
                        : "bg-nexa-bg-surface border-nexa-border text-nexa-text-faint"
                   )}>
                      {i < currentStepIndex ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-bold">{i + 1}</span>}
                   </div>
                   <span className={cn(
                      "mt-3 text-[10px] font-black uppercase tracking-wider",
                      i <= currentStepIndex ? "text-nexa-amber" : "text-nexa-text-faint"
                   )}>
                      {step.label}
                   </span>
                </div>
              ))}
           </div>

           {/* Tech Mini-Card */}
           <div className="flex items-center justify-between p-6 rounded-3xl border border-nexa-border bg-nexa-bg-base/50">
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-nexa-amber shadow-lg">
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" alt="Tech" className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <h4 className="font-extrabold text-lg">Samuel O.</h4>
                    <p className="text-xs font-bold text-nexa-text-faint">NX-881920 • Electrical Specialist</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-nexa-border flex items-center justify-center text-nexa-brand shadow-sm hover:scale-110 transition-transform">
                    <MessageSquare className="w-5 h-5" />
                 </button>
                 <button className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 border border-nexa-border flex items-center justify-center text-nexa-brand shadow-sm hover:scale-110 transition-transform">
                    <Phone className="w-5 h-5" />
                 </button>
              </div>
           </div>

           {/* Current Action */}
           <div className="p-6 rounded-3xl bg-nexa-amber/5 border border-nexa-amber/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-nexa-amber/10 flex items-center justify-center text-nexa-amber">
                    <ShieldCheck className="w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-nexa-amber uppercase tracking-widest mb-1">Current Status</p>
                    <p className="font-black text-xl">
                      {status === "en-route" && "Technician is on the way"}
                      {status === "arrived" && "Technician has arrived"}
                      {status === "in-progress" && "Work in progress"}
                      {status === "completed" && "Job pending confirmation"}
                    </p>
                 </div>
              </div>
              <NexaButton variant="secondary" size="sm" className="text-nexa-coral hover:bg-nexa-coral/5 border-nexa-coral/20" leftIcon={<AlertCircle className="w-4 h-4" />}>
                 Report Issue
              </NexaButton>
           </div>
        </div>
      </section>

      {/* COMPLETION MODAL */}
      <AnimatePresence>
         {showCompletionModal && (
            <>
               <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]" 
               />
               <motion.div 
                  initial={{ y: "100%", opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  exit={{ y: "100%", opacity: 0 }}
                  className="fixed bottom-0 left-0 right-0 lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:bottom-auto w-full lg:max-w-lg bg-nexa-bg-base lg:rounded-[40px] shadow-2xl z-[110] overflow-hidden"
               >
                  <div className="p-10 text-center space-y-8">
                     <div className="w-24 h-24 bg-nexa-amber rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-nexa-amber/20">
                        <ShieldCheck className="w-12 h-12 text-white" />
                     </div>
                     <div>
                        <h3 className="text-3xl font-black text-display mb-4">Service Complete!</h3>
                        <p className="text-nexa-text-secondary font-medium leading-relaxed">
                           Samuel has marked the job as complete. Please verify the work is satisfactory before releasing the payment.
                        </p>
                     </div>
                     <div className="flex flex-col gap-4">
                        <Link href={`/booking/${ref}/review`}>
                           <NexaButton size="xl" className="w-full bg-nexa-amber hover:bg-nexa-amber/90 shadow-xl shadow-nexa-amber/20 h-20 text-xl font-black">
                              Release Payment & Rate
                           </NexaButton>
                        </Link>
                        <button onClick={() => setShowCompletionModal(false)} className="text-sm font-extrabold text-nexa-text-faint uppercase tracking-widest hover:text-nexa-text-secondary transition-colors">
                           Not finished? Report a problem
                        </button>
                     </div>
                  </div>
               </motion.div>
            </>
         )}
      </AnimatePresence>
    </main>
  );
}
