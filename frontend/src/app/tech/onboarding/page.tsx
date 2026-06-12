"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  User, 
  Briefcase, 
  FileText, 
  Calendar, 
  Camera, 
  Upload, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Info,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import Link from "next/link";

export default function TechOnboarding() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const steps = [
    { title: "Personal Info", icon: <User className="w-5 h-5" /> },
    { title: "Trade Profile", icon: <Briefcase className="w-5 h-5" /> },
    { title: "Documents", icon: <FileText className="w-5 h-5" /> },
    { title: "Verification", icon: <Shield className="w-5 h-5" /> },
    { title: "Assessment", icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-nexa-bg-base flex flex-col">
      {/* HEADER / PROGRESSBAR */}
      <header className="sticky top-0 z-40 bg-nexa-bg-surface border-b border-nexa-border p-4">
        <div className="container mx-auto max-w-lg">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-nexa-accent rounded-lg flex items-center justify-center text-white">
                    <Shield className="w-5 h-5" />
                 </div>
                 <h1 className="text-lg font-bold">Tech Onboarding</h1>
              </div>
              <span className="text-[10px] font-black text-nexa-text-faint uppercase tracking-[0.2em]">Step {step} of {totalSteps}</span>
           </div>
           <div className="flex gap-1.5">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-all duration-500",
                    i + 1 <= step ? "bg-nexa-accent" : "bg-nexa-border"
                  )}
                />
              ))}
           </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto max-w-lg p-6 pb-32">
        <AnimatePresence mode="wait">
           {step === 1 && (
             <motion.div 
               key="step1" 
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: -20 }}
               className="space-y-8"
             >
                <div className="text-center space-y-2">
                   <h2 className="text-2xl font-black text-display">Personal Information</h2>
                   <p className="text-sm text-nexa-text-secondary">Let's start with the basics to build your professional profile.</p>
                </div>

                <div className="flex justify-center">
                   <div className="relative group">
                      <div className="w-32 h-32 rounded-3xl bg-nexa-bg-surface border-2 border-dashed border-nexa-border flex flex-col items-center justify-center text-nexa-text-faint overflow-hidden group-hover:border-nexa-accent transition-colors">
                         <Camera className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-center px-4">Upload Profile Photo</span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-nexa-accent text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer">
                         <PlusIcon className="w-5 h-5" />
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <NexaInput label="Full Name" placeholder="John Doe" />
                   <div className="grid grid-cols-2 gap-4">
                      <NexaInput label="Date of Birth" type="date" />
                      <NexaInput label="Gender" placeholder="Select" />
                   </div>
                   <NexaInput label="Phone Number" placeholder="+234 803 000 0000" />
                   <NexaInput label="Residential Address" placeholder="Street, City, State" />
                </div>
             </motion.div>
           )}

           {step === 2 && (
             <motion.div 
               key="step2" 
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: -20 }}
               className="space-y-8"
             >
                <div className="text-center space-y-2">
                   <h2 className="text-2xl font-black text-display">Trade & Skills</h2>
                   <p className="text-sm text-nexa-text-secondary">Tell us about your expertise and experience.</p>
                </div>

                <div className="space-y-6">
                   <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-nexa-text-faint">Primary Trade</h3>
                      <div className="grid grid-cols-2 gap-3">
                         {["Electrical", "Plumbing", "HVAC", "Carpentry", "Painting", "Appliance"].map(trade => (
                           <button key={trade} className="p-4 rounded-2xl border-2 border-nexa-border bg-nexa-bg-surface text-sm font-bold hover:border-nexa-accent hover:bg-nexa-accent/5 transition-all text-left">
                              {trade}
                           </button>
                         ))}
                      </div>
                   </div>

                   <NexaInput label="Years of Experience" placeholder="e.g. 5" type="number" />
                   
                   <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-nexa-text-faint">Professional Bio</h3>
                      <textarea 
                        className="w-full h-32 p-4 rounded-2xl bg-nexa-bg-surface border border-nexa-border focus:border-nexa-accent focus:ring-4 focus:ring-nexa-accent/10 outline-none transition-all text-sm font-medium resize-none"
                        placeholder="Briefly describe your work history and specialties..."
                      />
                   </div>
                </div>
             </motion.div>
           )}

           {step === 3 && (
             <motion.div 
               key="step3" 
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: -20 }}
               className="space-y-8"
             >
                <div className="text-center space-y-2">
                   <h2 className="text-2xl font-black text-display">Secure Documents</h2>
                   <p className="text-sm text-nexa-text-secondary">We need these to verify your identity and skills.</p>
                </div>

                <div className="space-y-4">
                   {[
                     { label: "Government ID (NIN/Passport)", required: true },
                     { label: "Proof of Address", required: true },
                     { label: "Trade Certification", required: false },
                     { label: "Bank Statement", required: true }
                   ].map((doc, i) => (
                     <div key={i} className="liquid-glass p-6 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-nexa-accent/30 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-xl bg-nexa-accent/10 flex items-center justify-center text-nexa-accent group-hover:scale-110 transition-transform">
                              <Upload className="w-5 h-5" />
                           </div>
                           <div>
                              <p className="text-sm font-bold">{doc.label}</p>
                              <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-wider">{doc.required ? "Mandatory" : "Optional"}</p>
                           </div>
                        </div>
                        <div className="text-[10px] font-black text-nexa-accent uppercase tracking-[0.2em]">Upload</div>
                     </div>
                   ))}
                </div>

                <div className="p-6 rounded-2xl bg-nexa-accent/5 border border-nexa-accent/10 flex items-start gap-4">
                   <Info className="w-5 h-5 text-nexa-accent shrink-0 mt-0.5" />
                   <p className="text-[10px] text-nexa-text-secondary leading-relaxed font-medium uppercase tracking-wider">
                      Your documents are encrypted and stored securely. Only Nexa compliance staff can access them.
                   </p>
                </div>
             </motion.div>
           )}

           {step === 4 && (
             <motion.div 
               key="step4" 
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }} 
               exit={{ opacity: 0, x: -20 }}
               className="space-y-8"
             >
                <div className="text-center space-y-2">
                   <h2 className="text-2xl font-black text-display">Background Check</h2>
                   <p className="text-sm text-nexa-text-secondary">Consent to a standard professional background check.</p>
                </div>

                <div className="liquid-glass p-8 rounded-[40px] space-y-6">
                   <div className="w-20 h-20 bg-nexa-accent/10 rounded-full flex items-center justify-center mx-auto text-nexa-accent">
                      <Shield className="w-10 h-10" />
                   </div>
                   <div className="text-center space-y-4">
                      <p className="text-sm font-medium text-nexa-text-secondary leading-relaxed">
                        To maintain the NexaVerified promise, we verify criminal records and professional history for all staff.
                      </p>
                      <div className="flex items-center gap-3 justify-center text-[10px] font-black uppercase tracking-widest text-nexa-text-faint">
                         <span>Powered by</span>
                         <img src="https://logowik.com/content/uploads/images/smile-identity-technologies9682.logowik.com.webp" className="h-4 opacity-50 grayscale" alt="Partner" />
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                   <label className="flex items-start gap-4 p-6 rounded-2xl border-2 border-nexa-border bg-nexa-bg-surface cursor-pointer select-none">
                      <input type="checkbox" className="mt-1 w-5 h-5 rounded border-nexa-border text-nexa-accent focus:ring-nexa-accent" />
                      <span className="text-xs font-bold text-nexa-text-secondary leading-relaxed">
                        I hereby authorize Nexa Technologies Ltd to perform a background check using the documents provided.
                      </span>
                   </label>
                </div>
             </motion.div>
           )}

           {step === 5 && (
             <motion.div 
               key="step5" 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }} 
               className="space-y-8"
             >
                <div className="text-center space-y-2">
                   <h2 className="text-2xl font-black text-display">Skills Assessment</h2>
                   <p className="text-sm text-nexa-text-secondary">Final step: Book your in-person assessment.</p>
                </div>

                <div className="space-y-6">
                   <div className="p-6 rounded-3xl bg-nexa-accent/5 border border-nexa-accent/10">
                      <h4 className="text-sm font-black mb-2">What to expect:</h4>
                      <ul className="space-y-2">
                         {["Practical skills test", "Safety procedures review", "Platform training", "Gear collection"].map(t => (
                           <li key={t} className="flex items-center gap-3 text-xs font-bold text-nexa-text-secondary">
                              <CheckCircle2 className="w-4 h-4 text-nexa-accent" /> {t}
                           </li>
                         ))}
                      </ul>
                   </div>

                   <div className="space-y-4">
                      <h3 className="text-sm font-black uppercase tracking-widest text-nexa-text-faint">Select Location & Time</h3>
                      <div className="grid grid-cols-1 gap-3">
                         {["Lagos Assessment Center - Oct 15, 10:00 AM", "Abuja Hub - Oct 16, 02:00 PM"].map(loc => (
                           <button key={loc} className="p-4 rounded-2xl border-2 border-nexa-border bg-nexa-bg-surface text-xs font-bold hover:border-nexa-accent hover:bg-nexa-accent/5 transition-all text-left flex items-center justify-between">
                              {loc}
                              <ChevronRight className="w-4 h-4 text-nexa-accent" />
                           </button>
                         ))}
                      </div>
                   </div>
                </div>
             </motion.div>
           )}
        </AnimatePresence>
      </main>

      {/* FOOTER ACTIONS */}
      <footer className="fixed bottom-0 left-0 right-0 bg-nexa-bg-surface border-t border-nexa-border p-6 backdrop-blur-xl bg-opacity-80">
        <div className="container mx-auto max-w-lg flex gap-4">
           {step > 1 && (
             <NexaButton variant="secondary" onClick={handleBack} className="w-1/3 h-14" leftIcon={<ChevronLeft className="w-5 h-5" />}>
               Back
             </NexaButton>
           )}
           {step < totalSteps ? (
             <NexaButton onClick={handleNext} className="flex-1 h-14 bg-nexa-accent hover:bg-nexa-accent/90" rightIcon={<ChevronRight className="w-5 h-5" />}>
               Next Step
             </NexaButton>
           ) : (
             <Link href="/tech/dashboard" className="flex-1">
                <NexaButton className="w-full h-14 bg-nexa-accent hover:bg-nexa-accent/90 shadow-xl shadow-nexa-accent/20">
                  Submit Application
                </NexaButton>
             </Link>
           )}
        </div>
      </footer>
    </div>
  );
}

const PlusIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);
