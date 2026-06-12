"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Store, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Camera, 
  Briefcase,
  LayoutGrid,
  ChevronRight,
  Sparkles,
  Zap,
  CreditCard,
  Building2,
  Lock,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NICHES } from "@/components/nexa/NicheSwitcher";
import { NICHE_DETAILS } from "@/lib/niche-data";
import Link from "next/link";

import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/components/nexa/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    nicheId: "",
    subService: "",
    specialtyLevel: "",
    businessName: "",
    city: "Lagos",
    area: "",
    description: "",
    phone: "",
    whatsapp: "",
    email: "",
    plan: "basic",
    nin: ""
  });

  // Auth redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/join/register");
    }
  }, [user, authLoading, router]);

  // Persist to LocalStorage
  useEffect(() => {
    const savedData = localStorage.getItem("nexa_registration_progress");
    if (savedData) {
      try {
        const { step: s, billingCycle: b, formData: f } = JSON.parse(savedData);
        if (s) setStep(s);
        if (b) setBillingCycle(b);
        if (f) setFormData(f);
      } catch (e) {
        console.error("Failed to restore progress", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const dataToSave = { step, billingCycle, formData };
      localStorage.setItem("nexa_registration_progress", JSON.stringify(dataToSave));
    }
  }, [step, billingCycle, formData, isLoaded]);

  const currentNiche = NICHES.find(n => n.id === formData.nicheId);
  const nicheData = formData.nicheId ? NICHE_DETAILS[formData.nicheId] : null;

  const specialtyLevels = ["Specialist", "Consultant", "Provider", "Agency", "Professional", "Expert"];
  
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  
  const clearProgress = () => {
    localStorage.removeItem("nexa_registration_progress");
    window.location.reload();
  };

  const steps = [
    { title: "Group", icon: <LayoutGrid className="w-4 h-4" /> },
    { title: "Basics", icon: <Building2 className="w-4 h-4" /> },
    { title: "Contact", icon: <Phone className="w-4 h-4" /> },
    { title: "Verify", icon: <ShieldCheck className="w-4 h-4" /> },
    { title: "Branding", icon: <Camera className="w-4 h-4" /> },
    { title: "Plan", icon: <CreditCard className="w-4 h-4" /> }
  ];

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      await api.post("/pro/onboard", {
        business_name: formData.businessName,
        bio: formData.description,
        niche: formData.nicheId,
        sub_service: formData.subService,
        specialty_level: formData.specialtyLevel,
        city: formData.city,
        area: formData.area,
        phone: formData.phone,
        whatsapp: formData.whatsapp,
        business_email: formData.email,
        nin: formData.nin,
        plan: formData.plan,
        hourly_rate: 0
      });
      
      localStorage.removeItem("nexa_registration_progress");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return null;

  return (
    <main className="bg-nexa-bg-base min-h-screen">
      

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          
          {/* STICKY STEP INDICATOR */}
          <div className="sticky top-0 z-40 bg-nexa-bg-base/80 backdrop-blur-xl py-8 -mx-4 px-4 mb-12 border-b border-nexa-border/10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between relative">
                {steps.map((s, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="relative">
                      {step === i + 1 && (
                        <motion.div 
                          layoutId="active-step-ring"
                          className="absolute -inset-2 border-2 border-nexa-brand rounded-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <div className={cn(
                        "relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10",
                        step > i + 1 ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : 
                        step === i + 1 ? "bg-nexa-brand text-white shadow-xl shadow-nexa-brand/30 scale-110" : 
                        "bg-white dark:bg-slate-800 text-nexa-text-faint border border-nexa-border"
                      )}>
                        {step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-tighter mt-4",
                      step === i + 1 ? "text-nexa-text-primary" : "text-nexa-text-faint"
                    )}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {error && (
               <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3 animate-shake">
                  <Sparkles className="w-5 h-5" />
                  {error}
               </div>
            )}
            <AnimatePresence mode="wait">
              {/* STEP 1: GRANULAR SPECIALTY SELECTION */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-display mb-4">Choose your specialty</h1>
                    <p className="text-nexa-text-secondary">Follow the steps to precisely categorize your business.</p>
                    <button 
                      onClick={clearProgress}
                      className="mt-4 text-[10px] font-bold text-nexa-text-faint hover:text-red-500 uppercase tracking-widest transition-colors"
                    >
                      Reset Progress & Start Over
                    </button>
                  </div>
                  
                  <div className="space-y-12">
                     {/* 1.1 GROUP SELECT */}
                     <section>
                        <h3 className="font-extrabold text-sm uppercase tracking-widest text-nexa-text-faint mb-2 px-1 flex items-center gap-2">
                           <div className="w-1.5 h-4 bg-nexa-brand rounded-full" />
                           1. Select Specialty Group
                        </h3>
                        <div className="-mx-4 md:-mx-8 px-4 md:px-8">
                           <div className="flex gap-4 overflow-x-auto py-12 no-scrollbar snap-x scroll-edge-fade">
                              {NICHES.map((niche) => (
                                 <NexaCard
                                    key={niche.id}
                                    onClick={() => setFormData({ ...formData, nicheId: niche.id, subService: "", specialtyLevel: "" })}
                                    className={cn(
                                       "p-6 cursor-pointer border-2 transition-all group shrink-0 w-64 snap-start shadow-xl hover:shadow-2xl",
                                       formData.nicheId === niche.id ? "border-nexa-brand bg-nexa-brand/5" : "hover:border-nexa-brand/30 border-transparent bg-nexa-bg-surface"
                                    )}
                                 >
                                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", niche.color)}>
                                       <img src={niche.icon} alt={niche.name} className="w-8 h-8 object-contain" />
                                    </div>
                                    <h3 className="font-bold mb-1">{niche.name.replace(/ Finders?$/, "")}</h3>
                                    <p className="text-[10px] text-nexa-text-faint uppercase font-bold tracking-widest line-clamp-1">{niche.tagline}</p>
                                 </NexaCard>
                              ))}
                           </div>
                        </div>
                     </section>

                     {/* 1.2 SUB-NICHE SELECT */}
                     {formData.nicheId && (
                        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                           <h3 className="font-extrabold text-sm uppercase tracking-widest text-nexa-text-faint mb-6 flex items-center gap-2">
                              <div className="w-1.5 h-4 bg-nexa-brand rounded-full" />
                              2. Select your Sub-niche (Service)
                           </h3>
                           <div className="flex flex-wrap gap-3">
                              {(NICHE_DETAILS[formData.nicheId]?.subServices || ["Provider"]).map(sub => (
                                 <button
                                    key={sub}
                                    onClick={() => setFormData({ ...formData, subService: sub })}
                                    className={cn(
                                       "px-6 py-3 rounded-xl text-sm font-bold transition-all border",
                                       formData.subService === sub 
                                          ? "bg-nexa-brand text-white border-nexa-brand shadow-lg" 
                                          : "bg-white dark:bg-slate-800 text-nexa-text-secondary border-nexa-border hover:border-nexa-brand/50"
                                    )}
                                 >
                                    {sub.replace(/ Finder$/, "")}
                                 </button>
                              ))}
                           </div>
                        </motion.section>
                     )}

                     {/* 1.3 SPECIALTY LEVEL SELECT */}
                     {formData.subService && (
                        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                           <h3 className="font-extrabold text-sm uppercase tracking-widest text-nexa-text-faint mb-6 flex items-center gap-2">
                              <div className="w-1.5 h-4 bg-nexa-brand rounded-full" />
                              3. Select Specialty Level
                           </h3>
                           <div className="flex flex-wrap gap-3">
                              {specialtyLevels.map(level => (
                                 <button
                                    key={level}
                                    onClick={() => setFormData({ ...formData, specialtyLevel: level })}
                                    className={cn(
                                       "px-6 py-3 rounded-xl text-sm font-bold transition-all border",
                                       formData.specialtyLevel === level 
                                          ? "bg-emerald-500 text-white border-emerald-500 shadow-lg" 
                                          : "bg-white dark:bg-slate-800 text-nexa-text-secondary border-nexa-border hover:border-emerald-500/50"
                                    )}
                                 >
                                    {level}
                                 </button>
                              ))}
                           </div>
                        </motion.section>
                     )}
                  </div>

                  <div className="flex justify-end mt-16 pt-8 border-t border-nexa-border">
                    <NexaButton 
                      size="lg" 
                      onClick={nextStep} 
                      disabled={!formData.nicheId || !formData.subService || !formData.specialtyLevel}
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Next: Business Basics
                    </NexaButton>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: BUSINESS BASICS */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-display mb-4">Business Basics</h1>
                    <p className="text-nexa-text-secondary">Tell us a bit about your company.</p>
                  </div>

                  <NexaCard className="p-8 space-y-8">
                    <NexaInput 
                      label="Official Business Name" 
                      placeholder="e.g. Lekki Tech Solutions" 
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-6">
                      <NexaInput label="City" value="Lagos" disabled />
                      <NexaInput 
                        label="Primary Area" 
                        placeholder="e.g. Lekki Phase 1" 
                        value={formData.area}
                        onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Business Description</label>
                      <textarea 
                        className="w-full min-h-[120px] p-4 bg-nexa-bg-base border border-nexa-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all text-sm leading-relaxed"
                        placeholder="Tell potential customers what makes your business unique..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      />
                    </div>
                  </NexaCard>

                  <div className="flex justify-between mt-12">
                    <NexaButton variant="secondary" size="lg" onClick={prevStep} leftIcon={<ArrowLeft className="w-5 h-5" />}>
                      Back
                    </NexaButton>
                    <NexaButton 
                      size="lg" 
                      onClick={nextStep} 
                      disabled={!formData.businessName || !formData.area}
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Next: Contact Info
                    </NexaButton>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: CONTACT INFO */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-display mb-4">How customers reach you</h1>
                    <p className="text-nexa-text-secondary">Verified contact info builds trust.</p>
                  </div>

                  <NexaCard className="p-8 space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <NexaInput 
                          label="Business Phone Number" 
                          placeholder="+234..." 
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <NexaInput 
                          label="WhatsApp Number" 
                          placeholder="+234..." 
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                        />
                     </div>
                     <NexaInput 
                        label="Professional Email Address" 
                        placeholder="hello@business.ng" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                     />
                     <div className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/50 flex items-start gap-4">
                        <ShieldCheck className="w-6 h-6 text-amber-600 mt-1" />
                        <div>
                           <p className="text-sm font-bold text-amber-800 dark:text-amber-400 mb-1">Verification Tip</p>
                           <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed">
                              Sellers with a professional email and WhatsApp connected receive 3x more bookings on average.
                           </p>
                        </div>
                     </div>
                  </NexaCard>

                  <div className="flex justify-between mt-12">
                    <NexaButton variant="secondary" size="lg" onClick={prevStep} leftIcon={<ArrowLeft className="w-5 h-5" />}>
                      Back
                    </NexaButton>
                    <NexaButton 
                      size="lg" 
                      onClick={nextStep} 
                      disabled={!formData.phone || !formData.whatsapp || !formData.email}
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Next: Verification
                    </NexaButton>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: NIN VERIFICATION */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-display mb-4">Identity Verification</h1>
                    <p className="text-nexa-text-secondary">We require NIN verification to maintain a safe and trusted marketplace.</p>
                  </div>

                  <NexaCard className="p-10 max-w-2xl mx-auto">
                    <div className="flex flex-col items-center text-center space-y-8">
                       <div className="w-20 h-20 rounded-[32px] bg-emerald-500/10 flex items-center justify-center">
                          <ShieldCheck className="w-10 h-10 text-emerald-500" />
                       </div>
                       
                       <div className="space-y-2 w-full">
                          <NexaInput 
                            label="Enter 11-digit NIN" 
                            placeholder="0000 0000 000" 
                            maxLength={11}
                            value={(formData as any).nin || ""}
                            onChange={(e) => setFormData({ ...formData, nin: e.target.value } as any)}
                          />
                          <p className="text-[10px] text-nexa-text-faint font-bold uppercase text-left px-1">Your NIN is only used for identity verification and is never shared publicly.</p>
                       </div>

                       <div className="w-full pt-4">
                          <div className="p-6 rounded-2xl bg-nexa-bg-base border border-nexa-border text-left space-y-4">
                             <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-nexa-brand" />
                                <span className="text-xs font-bold">Encrypted Data Transmission</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-nexa-brand" />
                                <span className="text-xs font-bold">Official NIMC Database Check</span>
                             </div>
                             <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-nexa-brand" />
                                <span className="text-xs font-bold">Instant Verification Result</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  </NexaCard>

                  <div className="flex justify-between mt-12">
                    <NexaButton variant="secondary" size="lg" onClick={prevStep} leftIcon={<ArrowLeft className="w-5 h-5" />}>
                      Back
                    </NexaButton>
                    <NexaButton 
                      size="lg" 
                      onClick={nextStep} 
                      disabled={!(formData as any).nin || (formData as any).nin.length < 11}
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Next: Branding
                    </NexaButton>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: BRANDING */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-display mb-4">Your Visual Identity</h1>
                    <p className="text-nexa-text-secondary">Your profile will adapt to the <span className={cn("font-bold", currentNiche?.color.replace('bg-', 'text-'))}>{currentNiche?.name}</span> theme.</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-8 mb-12">
                     <div className="md:col-span-1 space-y-6">
                        <div className="aspect-square rounded-[40px] border-2 border-dashed border-nexa-border flex flex-col items-center justify-center text-center p-6 bg-nexa-bg-surface hover:border-nexa-brand/50 transition-all cursor-pointer">
                           <Camera className="w-8 h-8 text-nexa-text-faint mb-3" />
                           <p className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Business Logo</p>
                        </div>
                        <div className="aspect-[16/9] rounded-3xl border-2 border-dashed border-nexa-border flex flex-col items-center justify-center text-center p-4 bg-nexa-bg-surface hover:border-nexa-brand/50 transition-all cursor-pointer">
                           <ImageIcon className="w-6 h-6 text-nexa-text-faint mb-2" />
                           <p className="text-[10px] font-bold uppercase tracking-widest text-nexa-text-faint">Cover Photo</p>
                        </div>
                     </div>
                     
                     <div className="md:col-span-2">
                        <NexaCard variant="glass" className="h-full p-8 bg-nexa-bg-surface/50 border-nexa-border">
                           <h3 className="font-bold mb-6 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-amber-500" />
                              Niche Hub Preview
                           </h3>
                           <div className="border border-nexa-border rounded-3xl overflow-hidden shadow-2xl bg-white dark:bg-slate-900">
                              <div className={cn("h-24 w-full", currentNiche?.color)}>
                                 <div className="p-4 flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30" />
                                    <div className="space-y-1.5">
                                       <div className="h-3 w-32 bg-white/30 rounded-full" />
                                       <div className="h-2 w-20 bg-white/20 rounded-full" />
                                    </div>
                                 </div>
                              </div>
                              <div className="p-6">
                                 <h4 className="text-sm font-bold mb-2">{formData.businessName || "Your Business Name"}</h4>
                                 <p className="text-[10px] text-nexa-text-secondary leading-relaxed line-clamp-2">
                                    {formData.description || "Your business description will appear here on the niche hub for customers to read."}
                                 </p>
                                 <div className="mt-6 flex justify-between items-center">
                                    <div className="flex gap-1">
                                       {[...Array(5)].map((_, i) => <div key={i} className="w-3 h-3 rounded-full bg-amber-500" />)}
                                    </div>
                                    <div className={cn("w-12 h-4 rounded-full opacity-20", currentNiche?.color)} />
                                 </div>
                              </div>
                           </div>
                           <p className="text-xs text-nexa-text-faint mt-6 italic">
                              *Your profile will automatically adopt the brand colors of the {currentNiche?.name} niche.
                           </p>
                        </NexaCard>
                     </div>
                  </div>

                  <div className="flex justify-between mt-12">
                    <NexaButton variant="secondary" size="lg" onClick={prevStep} leftIcon={<ArrowLeft className="w-5 h-5" />}>
                      Back
                    </NexaButton>
                    <NexaButton 
                      size="lg" 
                      onClick={nextStep} 
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                    >
                      Next: Choose Plan
                    </NexaButton>
                  </div>
                </motion.div>
              )}

              {/* STEP 6: PLAN SELECTION */}
              {step === 6 && (
                <motion.div
                  key="step6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-display mb-4">Choose your Plan</h1>
                    <p className="text-nexa-text-secondary mb-8">Start with our free tier or upgrade for more growth.</p>
                    
                    {/* BILLING TOGGLE */}
                    <div className="flex items-center justify-center gap-4 mb-12">
                       <span className={cn("text-xs font-bold uppercase tracking-widest transition-colors", billingCycle === "monthly" ? "text-nexa-text-primary" : "text-nexa-text-faint")}>Monthly</span>
                       <button 
                         onClick={() => setBillingCycle(billingCycle === "monthly" ? "annual" : "monthly")}
                         className="w-14 h-7 bg-nexa-bg-surface border border-nexa-border rounded-full relative p-1 transition-all"
                       >
                          <motion.div 
                            animate={{ x: billingCycle === "monthly" ? 0 : 28 }}
                            className="w-5 h-5 bg-nexa-brand rounded-full shadow-lg" 
                          />
                       </button>
                       <div className="flex items-center gap-2">
                          <span className={cn("text-xs font-bold uppercase tracking-widest transition-colors", billingCycle === "annual" ? "text-nexa-text-primary" : "text-nexa-text-faint")}>Annual</span>
                          <span className="bg-emerald-500/10 text-emerald-600 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase">Save 20%</span>
                       </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-12">
                     {[
                        { id: "basic", name: "Basic", price: "Free", features: ["1 Niche Listing", "Basic Profile", "Direct Chat", "5 Photos"], color: "bg-slate-500" },
                        { 
                          id: "business", 
                          name: "Business", 
                          price: billingCycle === "monthly" ? "₦2,500" : "₦24,000", 
                          period: billingCycle === "monthly" ? "/mo" : "/yr",
                          features: ["Priority Search", "Verified Badge", "Article Publishing", "20 Photos", "Basic Analytics"], 
                          color: "bg-nexa-brand", 
                          popular: true 
                        },
                        { 
                          id: "pro", 
                          name: "Pro", 
                          price: billingCycle === "monthly" ? "₦10,000" : "₦96,000", 
                          period: billingCycle === "monthly" ? "/mo" : "/yr",
                          features: ["All Features", "Featured Listing", "NexaAds Access", "WhatsApp Broadcast", "Dedicated Manager"], 
                          color: "bg-fuchsia-600" 
                        }
                     ].map((plan) => (
                        <NexaCard 
                           key={plan.id}
                           className={cn(
                              "relative p-6 flex flex-col h-full border-2 transition-all cursor-pointer",
                              formData.plan === plan.id ? "border-nexa-brand shadow-2xl" : "hover:border-nexa-brand/30 border-nexa-border/50",
                              plan.popular && "scale-105 z-10"
                           )}
                           onClick={() => setFormData({ ...formData, plan: plan.id })}
                        >
                           <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold">{plan.name}</h3>
                              {plan.popular && (
                                 <span className="bg-nexa-brand text-white text-[7px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm">
                                    Popular
                                 </span>
                              )}
                           </div>
                           <div className="flex items-baseline gap-1 mb-6">
                              <span className="text-2xl font-extrabold">{plan.price}</span>
                              {plan.period && <span className="text-nexa-text-faint text-[10px] font-bold">{plan.period}</span>}
                           </div>
                           <ul className="space-y-3 mb-8 flex-1">
                              {plan.features.map(f => (
                                 <li key={f} className="flex items-start gap-2.5 text-[10px] font-bold text-nexa-text-secondary leading-tight">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    <span>{f}</span>
                                 </li>
                              ))}
                           </ul>
                           <div className={cn(
                              "w-full py-2.5 rounded-xl text-center text-[10px] font-extrabold uppercase tracking-widest transition-all",
                              formData.plan === plan.id ? "bg-nexa-brand text-white" : "bg-nexa-bg-base text-nexa-text-faint"
                           )}>
                              {formData.plan === plan.id ? "Selected" : "Select Plan"}
                           </div>
                        </NexaCard>
                     ))}
                  </div>

                  <div className="flex justify-between mt-12">
                    <NexaButton variant="secondary" size="lg" onClick={prevStep} leftIcon={<ArrowLeft className="w-5 h-5" />}>
                      Back
                    </NexaButton>
                    <NexaButton 
                      size="lg" 
                      className="px-16 bg-nexa-brand !text-white hover:brightness-110 shadow-xl shadow-nexa-brand/20"
                      rightIcon={<Zap className="w-5 h-5" />}
                      onClick={handleSubmit}
                      isLoading={isSubmitting}
                    >
                      Join the {currentNiche?.name.replace(/ Finders?$/, "")} Network
                    </NexaButton>
                  </div>
                  
                  <div className="mt-8 flex items-center justify-center gap-2 text-nexa-text-faint text-xs">
                     <Lock className="w-3 h-3" />
                     <span>Secure payment processing by Paystack</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
