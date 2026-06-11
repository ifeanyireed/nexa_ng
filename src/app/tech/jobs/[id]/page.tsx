"use client";

import React, { useState } from "react";
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
  X,
  Camera,
  Signature
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";

export default function TechJobDetail() {
  const params = useParams();
  const id = params.id as string;

  const [stage, setStage] = useState("assigned"); // assigned, accepted, en-route, checked-in, completed
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  const stages = [
    { id: "assigned", label: "Assigned" },
    { id: "accepted", label: "Accepted" },
    { id: "en-route", label: "En Route" },
    { id: "checked-in", label: "On Site" },
    { id: "completed", label: "Finished" },
  ];

  const handleAction = () => {
    if (stage === "assigned") setStage("accepted");
    else if (stage === "accepted") setStage("en-route");
    else if (stage === "en-route") setStage("checked-in");
    else if (stage === "checked-in") setShowCompletionForm(true);
  };

  const getButtonText = () => {
    if (stage === "assigned") return "Accept Job";
    if (stage === "accepted") return "Start Navigation";
    if (stage === "en-route") return "I've Arrived - Check In";
    if (stage === "checked-in") return "Mark Job Complete";
    return "Job Finished";
  };

  return (
    <div className="min-h-screen bg-nexa-bg-base">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-nexa-bg-surface border-b border-nexa-border p-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
              <Link href="/tech/dashboard" className="p-2 hover:bg-nexa-bg-base rounded-xl transition-colors">
                 <ChevronLeft className="w-5 h-5" />
              </Link>
              <div>
                 <h1 className="text-sm font-black uppercase tracking-widest">{id}</h1>
                 <p className="text-[10px] font-bold text-nexa-accent uppercase tracking-widest">NexaVerified Premium</p>
              </div>
           </div>
           <div className="px-3 py-1 bg-nexa-accent/10 text-nexa-accent rounded-full text-[10px] font-black uppercase tracking-widest border border-nexa-accent/20">
              {stage.replace("-", " ")}
           </div>
        </div>
      </header>

      <main className="p-6 pb-40 space-y-8 max-w-lg mx-auto">
        {/* STATUS BREADCRUMB */}
        <div className="flex justify-between items-center px-2">
           {stages.map((s, i) => {
             const isCurrent = s.id === stage;
             const isPast = stages.findIndex(st => st.id === stage) > i;
             return (
               <div key={s.id} className="flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all duration-500",
                    isCurrent ? "bg-nexa-accent scale-150 shadow-[0_0_10px_rgba(14,159,110,0.5)]" : 
                    isPast ? "bg-nexa-accent" : "bg-nexa-border"
                  )} />
               </div>
             );
           })}
        </div>

        {/* CUSTOMER INFO */}
        <section className="space-y-6">
           <div className="liquid-glass p-8 rounded-[40px] border-none bg-nexa-bg-surface/50 relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-sm font-black text-nexa-text-faint uppercase tracking-[0.2em] mb-4">Customer Details</h3>
                    <h2 className="text-3xl font-black text-display">Chidi O.</h2>
                    <div className="flex items-center gap-2 mt-2">
                       <MapPin className="w-4 h-4 text-nexa-accent" />
                       <p className="text-sm font-bold text-nexa-text-secondary">
                          {stage === "assigned" ? "Ikoyi, Lagos (Full address after acceptance)" : "Plot 12, Alexander Road, Ikoyi, Lagos"}
                       </p>
                    </div>
                 </div>
                 <div className="w-16 h-16 rounded-[24px] bg-nexa-accent/10 flex items-center justify-center text-nexa-accent">
                    <UserIcon className="w-8 h-8" />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <button className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-nexa-bg-base border border-nexa-border font-bold text-xs hover:bg-white transition-all group">
                    <Phone className="w-4 h-4 text-nexa-accent group-hover:scale-110 transition-transform" /> Call
                 </button>
                 <button className="flex items-center justify-center gap-2 h-14 rounded-2xl bg-nexa-bg-base border border-nexa-border font-bold text-xs hover:bg-white transition-all group">
                    <MessageSquare className="w-4 h-4 text-nexa-accent group-hover:scale-110 transition-transform" /> Message
                 </button>
              </div>
           </div>

           <div className="liquid-glass p-8 rounded-[40px] border-none bg-nexa-bg-surface/50">
              <h3 className="text-sm font-black text-nexa-text-faint uppercase tracking-[0.2em] mb-6">Job Requirements</h3>
              <div className="space-y-4">
                 <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-nexa-border">
                    <p className="text-[10px] font-black text-nexa-text-faint uppercase tracking-widest mb-1">Issue Reported</p>
                    <p className="text-sm font-bold leading-relaxed">Generator won't start. Smells like burnt wire. Last serviced 6 months ago.</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-nexa-border">
                       <p className="text-[10px] font-black text-nexa-text-faint uppercase tracking-widest mb-1">Estimated Duration</p>
                       <p className="text-sm font-bold">1.5 - 2 Hours</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-nexa-border">
                       <p className="text-[10px] font-black text-nexa-text-faint uppercase tracking-widest mb-1">Materials Provided</p>
                       <p className="text-sm font-bold">No</p>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        {/* OPS NOTES / SAFETY */}
        <section>
           <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                 <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Safety Alert</p>
                 <p className="text-xs font-bold text-nexa-text-secondary leading-relaxed">
                    Wear insulated gloves. Check for fuel leaks before testing ignition.
                 </p>
              </div>
           </div>
        </section>
      </main>

      {/* DYNAMIC ACTION FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 bg-nexa-bg-surface border-t border-nexa-border p-6 backdrop-blur-xl bg-opacity-80">
        <div className="container mx-auto max-w-lg flex flex-col gap-4">
           {stage === "assigned" && (
             <button className="text-xs font-black text-nexa-coral uppercase tracking-widest hover:bg-red-500/5 p-2 rounded-xl transition-all">
               Decline Job
             </button>
           )}
           <NexaButton 
              size="xl" 
              className={cn(
                "w-full h-20 rounded-[32px] text-xl font-black shadow-2xl",
                stage === "completed" ? "bg-nexa-text-faint" : "bg-nexa-accent hover:bg-nexa-accent/90 shadow-nexa-accent/20"
              )}
              leftIcon={stage === "accepted" ? <Navigation className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              onClick={handleAction}
              disabled={stage === "completed"}
           >
              {getButtonText()}
           </NexaButton>
        </div>
      </footer>

      {/* COMPLETION FORM MODAL */}
      <AnimatePresence>
         {showCompletionForm && (
            <>
               <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]" 
               />
               <motion.div 
                  initial={{ y: "100%" }} 
                  animate={{ y: 0 }} 
                  exit={{ y: "100%" }}
                  className="fixed inset-0 z-[110] bg-nexa-bg-base flex flex-col"
               >
                  <header className="p-6 border-b border-nexa-border bg-nexa-bg-surface flex items-center justify-between">
                     <h2 className="text-xl font-black">Job Completion</h2>
                     <button onClick={() => setShowCompletionForm(false)} className="p-2 hover:bg-nexa-bg-base rounded-xl">
                        <X className="w-6 h-6" />
                     </button>
                  </header>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                     <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-nexa-text-faint">Work Summary</h3>
                        <textarea 
                           className="w-full h-40 p-4 rounded-2xl bg-white border border-nexa-border outline-none focus:border-nexa-accent transition-all font-medium"
                           placeholder="Describe exactly what you did..."
                        />
                     </div>

                     <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-nexa-text-faint">Job Photos (Min 1 before, 1 after)</h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="aspect-square rounded-2xl border-2 border-dashed border-nexa-border flex flex-col items-center justify-center gap-2 text-nexa-text-faint hover:border-nexa-accent hover:text-nexa-accent transition-all">
                              <Camera className="w-6 h-6" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Before Photo</span>
                           </div>
                           <div className="aspect-square rounded-2xl border-2 border-dashed border-nexa-border flex flex-col items-center justify-center gap-2 text-nexa-text-faint hover:border-nexa-accent hover:text-nexa-accent transition-all">
                              <Camera className="w-6 h-6" />
                              <span className="text-[10px] font-black uppercase tracking-widest">After Photo</span>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h3 className="text-sm font-black uppercase tracking-widest text-nexa-text-faint">Customer Signature</h3>
                        <div className="w-full h-48 bg-white border border-nexa-border rounded-3xl relative overflow-hidden flex flex-col items-center justify-center text-nexa-text-faint">
                           <Signature className="w-12 h-12 opacity-10" />
                           <p className="text-[10px] font-bold uppercase tracking-widest mt-2 opacity-30">Sign on screen</p>
                           {/* Canvas would go here */}
                           <div className="absolute inset-0" />
                        </div>
                     </div>
                  </div>

                  <footer className="p-6 bg-nexa-bg-surface border-t border-nexa-border">
                     <NexaButton 
                        size="xl" 
                        className="w-full h-20 rounded-[32px] bg-emerald-500 hover:bg-emerald-600 shadow-2xl shadow-emerald-500/20 text-xl font-black"
                        onClick={() => { setStage("completed"); setShowCompletionForm(false); }}
                     >
                        Submit Completion
                     </NexaButton>
                  </footer>
               </motion.div>
            </>
         )}
      </AnimatePresence>
    </div>
  );
}

const UserIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
