"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  Wrench, 
  FileText,
  CalendarDays,
  Camera,
  MapPin,
  UploadCloud,
  CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NICHES } from "@/components/nexa/NicheSwitcher";
import { NICHE_DETAILS } from "@/lib/niche-data";
import { useRouter } from "next/navigation";

function TechnicianOnboardingContent() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    fullName: "",
    dob: "",
    gender: "",
    phone: "",
    whatsapp: "",
    email: "",
    state: "Lagos",
    lga: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyRelationship: "",
    
    // Step 2: Trade
    nicheId: "",
    primarySkill: "",
    secondarySkills: [] as string[],
    experienceYears: 5,
    bio: "",
    radiusKm: 15,
    toolsOwned: [] as string[],
    
    // Step 3: Documents
    ninNumber: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    
    // Step 4: Background Check
    consentGiven: false,
    
    // Step 5: Assessment
    assessmentType: "in-person",
    assessmentDate: "",
    assessmentTime: ""
  });

  useEffect(() => {
    const savedData = localStorage.getItem("nexa_technician_progress");
    if (savedData) {
      try {
        const { step: s, formData: f } = JSON.parse(savedData);
        if (s) setStep(s);
        if (f) setFormData(f);
      } catch (e) {
        console.error("Failed to restore progress", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("nexa_technician_progress", JSON.stringify({ step, formData }));
    }
  }, [step, formData, isLoaded]);

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  
  const clearProgress = () => {
    localStorage.removeItem("nexa_technician_progress");
    window.location.reload();
  };

  const currentNiche = NICHES.find(n => n.id === formData.nicheId);

  const steps = [
    { title: "Personal", icon: <User className="w-4 h-4" /> },
    { title: "Trade", icon: <Wrench className="w-4 h-4" /> },
    { title: "Docs", icon: <FileText className="w-4 h-4" /> },
    { title: "Checks", icon: <ShieldCheck className="w-4 h-4" /> },
    { title: "Book", icon: <CalendarDays className="w-4 h-4" /> }
  ];

  const handleToolsToggle = (tool: string) => {
    setFormData(prev => ({
      ...prev,
      toolsOwned: prev.toolsOwned.includes(tool)
        ? prev.toolsOwned.filter(t => t !== tool)
        : [...prev.toolsOwned, tool]
    }));
  };

  const handleSecondarySkillToggle = (skill: string) => {
    if (formData.secondarySkills.includes(skill)) {
      setFormData(prev => ({ ...prev, secondarySkills: prev.secondarySkills.filter(s => s !== skill) }));
    } else if (formData.secondarySkills.length < 3) {
      setFormData(prev => ({ ...prev, secondarySkills: [...prev.secondarySkills, skill] }));
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      localStorage.removeItem("nexa_technician_progress");
      setIsSubmitting(false);
      // Route to a success or pending page in reality
      router.push("/");
    }, 2000);
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen">
      <NexaNavbar />

      <div className="pt-28 pb-12">
        <div className="container mx-auto px-4">
          
          {/* STICKY STEP INDICATOR */}
          <div className="sticky top-[72px] z-40 bg-nexa-bg-base/90 backdrop-blur-xl py-6 -mx-4 px-4 mb-8 border-b border-nexa-border/10">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-nexa-border/50 -z-10 -translate-y-1/2" />
                {steps.map((s, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="relative">
                      {step === i + 1 && (
                        <motion.div 
                          layoutId="active-step-ring"
                          className="absolute -inset-2 border-2 border-nexa-amber rounded-full"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <div className={cn(
                        "relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10",
                        step > i + 1 ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : 
                        step === i + 1 ? "bg-nexa-amber text-white shadow-xl shadow-nexa-amber/30 scale-110" : 
                        "bg-white dark:bg-slate-800 text-nexa-text-faint border border-nexa-border"
                      )}>
                        {step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : s.icon}
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-tighter mt-4 hidden sm:block",
                      step === i + 1 ? "text-nexa-text-primary" : "text-nexa-text-faint"
                    )}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full overflow-hidden bg-nexa-amber/10 border border-nexa-amber/20 mb-4">
                <ShieldCheck className="w-4 h-4 text-nexa-amber" />
                <span className="text-[10px] font-extrabold text-nexa-amber uppercase tracking-wider relative z-10">
                  NexaGuaranteed Application
                </span>
              </div>
              <button 
                onClick={clearProgress}
                className="text-[10px] font-bold text-nexa-text-faint hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Reset
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* STEP 1: PERSONAL INFO */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h1 className="text-3xl md:text-4xl font-extrabold text-display mb-2">Personal Information</h1>
                  <p className="text-nexa-text-secondary mb-8">Let's start with your basic details.</p>

                  <NexaCard className="p-8 space-y-8">
                    {/* Photo Upload Zone */}
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-nexa-border rounded-3xl bg-nexa-bg-surface hover:border-nexa-amber/50 transition-colors cursor-pointer group">
                      <div className="w-20 h-20 rounded-full bg-nexa-amber/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-nexa-amber" />
                      </div>
                      <p className="font-bold mb-1">Upload Profile Photo</p>
                      <p className="text-xs text-nexa-text-secondary text-center max-w-xs">
                        Face clearly visible, white or light background, no sunglasses.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <NexaInput 
                        label="Full Name (as on ID)" 
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                      />
                      <NexaInput 
                        label="Date of Birth" 
                        type="date"
                        value={formData.dob}
                        onChange={e => setFormData({...formData, dob: e.target.value})}
                      />
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Gender</label>
                        <select 
                          className="w-full h-14 px-4 bg-nexa-bg-base border border-nexa-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-nexa-amber/20 font-medium"
                          value={formData.gender}
                          onChange={e => setFormData({...formData, gender: e.target.value})}
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                      <NexaInput 
                        label="Email Address" 
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <NexaInput 
                        label="Primary Phone" 
                        placeholder="+234..."
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                      />
                      <NexaInput 
                        label="WhatsApp Number" 
                        placeholder="+234..."
                        value={formData.whatsapp}
                        onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                      />
                      <NexaInput label="State" value="Lagos" disabled />
                      <NexaInput 
                        label="LGA of Residence" 
                        value={formData.lga}
                        onChange={e => setFormData({...formData, lga: e.target.value})}
                      />
                    </div>

                    <div className="pt-6 border-t border-nexa-border">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint mb-4">Emergency Contact</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <NexaInput 
                          label="Name" 
                          value={formData.emergencyContactName}
                          onChange={e => setFormData({...formData, emergencyContactName: e.target.value})}
                        />
                        <NexaInput 
                          label="Phone" 
                          value={formData.emergencyContactPhone}
                          onChange={e => setFormData({...formData, emergencyContactPhone: e.target.value})}
                        />
                        <NexaInput 
                          label="Relationship" 
                          value={formData.emergencyRelationship}
                          onChange={e => setFormData({...formData, emergencyRelationship: e.target.value})}
                        />
                      </div>
                    </div>
                  </NexaCard>

                  <div className="flex justify-end mt-8">
                    <NexaButton 
                      size="lg" 
                      onClick={nextStep} 
                      disabled={!formData.fullName || !formData.phone || !formData.lga}
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="bg-nexa-amber hover:bg-nexa-amber/90 text-white"
                    >
                      Next Step
                    </NexaButton>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: TRADE PROFILE */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h1 className="text-3xl md:text-4xl font-extrabold text-display mb-2">Trade & Skills</h1>
                  <p className="text-nexa-text-secondary mb-8">What services do you provide?</p>

                  <div className="space-y-8">
                    <section>
                      <h3 className="font-extrabold text-sm uppercase tracking-widest text-nexa-text-faint mb-4">1. Primary Trade Group</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {NICHES.map((niche) => (
                          <div
                            key={niche.id}
                            onClick={() => setFormData({ ...formData, nicheId: niche.id, primarySkill: "", secondarySkills: [] })}
                            className={cn(
                              "p-4 rounded-2xl cursor-pointer border-2 transition-all flex flex-col items-center text-center",
                              formData.nicheId === niche.id ? "border-nexa-amber bg-nexa-amber/5" : "border-nexa-border hover:border-nexa-amber/30 bg-nexa-bg-surface"
                            )}
                          >
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", niche.color)}>
                              <img src={niche.icon} alt={niche.name} className="w-6 h-6 object-contain" />
                            </div>
                            <span className="text-xs font-bold">{niche.name.replace(/ Finders?$/, "")}</span>
                          </div>
                        ))}
                      </div>
                    </section>

                    {formData.nicheId && (
                      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <h3 className="font-extrabold text-sm uppercase tracking-widest text-nexa-text-faint mb-4">2. Primary Skill</h3>
                        <div className="flex flex-wrap gap-3">
                          {(NICHE_DETAILS[formData.nicheId]?.subServices || []).map(skill => (
                            <button
                              key={skill}
                              onClick={() => setFormData({ ...formData, primarySkill: skill })}
                              className={cn(
                                "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
                                formData.primarySkill === skill 
                                  ? "bg-nexa-amber text-white border-nexa-amber" 
                                  : "bg-nexa-bg-base text-nexa-text-secondary border-nexa-border hover:border-nexa-amber/50"
                              )}
                            >
                              {skill.replace(/ Finder$/, "")}
                            </button>
                          ))}
                        </div>
                      </motion.section>
                    )}

                    {formData.primarySkill && (
                      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                        <div>
                          <h3 className="font-extrabold text-sm uppercase tracking-widest text-nexa-text-faint mb-2">Secondary Skills (Max 3)</h3>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {(NICHE_DETAILS[formData.nicheId]?.subServices || []).filter(s => s !== formData.primarySkill).map(skill => {
                              const isSelected = formData.secondarySkills.includes(skill);
                              const isDisabled = !isSelected && formData.secondarySkills.length >= 3;
                              return (
                                <button
                                  key={skill}
                                  onClick={() => handleSecondarySkillToggle(skill)}
                                  disabled={isDisabled}
                                  className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                                    isSelected 
                                      ? "bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900" 
                                      : "bg-transparent text-nexa-text-secondary border-nexa-border hover:border-nexa-amber/50",
                                    isDisabled && "opacity-50 cursor-not-allowed"
                                  )}
                                >
                                  {skill.replace(/ Finder$/, "")}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <NexaCard className="p-6 space-y-6">
                          <div>
                            <div className="flex justify-between mb-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Years of Experience</label>
                              <span className="font-bold text-nexa-amber">{formData.experienceYears} Years</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" max="20" 
                              value={formData.experienceYears} 
                              onChange={(e) => setFormData({...formData, experienceYears: parseInt(e.target.value)})}
                              className="w-full accent-nexa-amber h-2 bg-nexa-border rounded-lg appearance-none cursor-pointer"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between mb-2">
                              <label className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Service Radius</label>
                              <span className="font-bold text-nexa-amber">{formData.radiusKm} km</span>
                            </div>
                            <input 
                              type="range" 
                              min="5" max="50" step="5"
                              value={formData.radiusKm} 
                              onChange={(e) => setFormData({...formData, radiusKm: parseInt(e.target.value)})}
                              className="w-full accent-nexa-amber h-2 bg-nexa-border rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-[10px] text-nexa-text-faint mt-2">
                              <span>5km (Local)</span>
                              <span>50km (State-wide)</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Brief Bio</label>
                            <textarea 
                              className="w-full h-24 p-4 bg-nexa-bg-base border border-nexa-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-nexa-amber/20 transition-all text-sm"
                              placeholder="Describe your experience in 2–3 sentences. This is shown to customers."
                              value={formData.bio}
                              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                          </div>
                          
                          <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Tools & Equipment</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {["Own full toolkit", "Need power tools provided", "Have van/vehicle"].map(tool => (
                                <label key={tool} className={cn(
                                  "flex items-center gap-2 p-3 border rounded-xl cursor-pointer transition-colors text-sm font-medium",
                                  formData.toolsOwned.includes(tool) ? "border-nexa-amber bg-nexa-amber/5 text-nexa-amber" : "border-nexa-border bg-nexa-bg-base"
                                )}>
                                  <input 
                                    type="checkbox" 
                                    className="hidden"
                                    checked={formData.toolsOwned.includes(tool)}
                                    onChange={() => handleToolsToggle(tool)}
                                  />
                                  <CheckSquare className={cn("w-4 h-4", formData.toolsOwned.includes(tool) ? "text-nexa-amber" : "text-nexa-text-faint")} />
                                  <span className="text-xs">{tool}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </NexaCard>
                      </motion.section>
                    )}
                  </div>

                  <div className="flex justify-between mt-8">
                    <NexaButton variant="secondary" size="lg" onClick={prevStep} leftIcon={<ArrowLeft className="w-5 h-5" />}>Back</NexaButton>
                    <NexaButton 
                      size="lg" 
                      onClick={nextStep} 
                      disabled={!formData.nicheId || !formData.primarySkill}
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="bg-nexa-amber hover:bg-nexa-amber/90 text-white"
                    >
                      Next Step
                    </NexaButton>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: DOCUMENTS */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <h1 className="text-3xl md:text-4xl font-extrabold text-display mb-2">Required Documents</h1>
                  <p className="text-nexa-text-secondary mb-8">Upload documents for verification and payment setup.</p>

                  <div className="p-4 mb-8 bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 rounded-2xl border border-blue-200 dark:border-blue-800/50 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium leading-relaxed">
                      <strong>Encryption Notice:</strong> Your documents are encrypted and stored securely. Only Nexa compliance staff can access them.
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <NexaCard className="p-6 border-dashed border-2 hover:border-nexa-amber/50 cursor-pointer flex flex-col items-center justify-center text-center h-48 bg-nexa-bg-surface group">
                        <UploadCloud className="w-8 h-8 text-nexa-text-faint mb-3 group-hover:text-nexa-amber transition-colors" />
                        <h4 className="font-bold text-sm mb-1">Government ID <span className="text-red-500">*</span></h4>
                        <p className="text-[10px] text-nexa-text-faint uppercase tracking-widest">NIN, Driver's License</p>
                      </NexaCard>
                      
                      <NexaCard className="p-6 border-dashed border-2 hover:border-nexa-amber/50 cursor-pointer flex flex-col items-center justify-center text-center h-48 bg-nexa-bg-surface group">
                        <UploadCloud className="w-8 h-8 text-nexa-text-faint mb-3 group-hover:text-nexa-amber transition-colors" />
                        <h4 className="font-bold text-sm mb-1">Proof of Address <span className="text-red-500">*</span></h4>
                        <p className="text-[10px] text-nexa-text-faint uppercase tracking-widest">Utility Bill, Bank Statement</p>
                      </NexaCard>
                      
                      <NexaCard className="p-6 border-dashed border-2 hover:border-nexa-amber/50 cursor-pointer flex flex-col items-center justify-center text-center h-48 bg-nexa-bg-surface group">
                        <UploadCloud className="w-8 h-8 text-nexa-text-faint mb-3 group-hover:text-nexa-amber transition-colors" />
                        <h4 className="font-bold text-sm mb-1">Trade Certificate</h4>
                        <p className="text-[10px] text-nexa-text-faint uppercase tracking-widest">Optional (Boosts profile)</p>
                      </NexaCard>
                      
                      <NexaCard className="p-6 border-dashed border-2 hover:border-nexa-amber/50 cursor-pointer flex flex-col items-center justify-center text-center h-48 bg-nexa-bg-surface group">
                        <UploadCloud className="w-8 h-8 text-nexa-text-faint mb-3 group-hover:text-nexa-amber transition-colors" />
                        <h4 className="font-bold text-sm mb-1">Association Membership</h4>
                        <p className="text-[10px] text-nexa-text-faint uppercase tracking-widest">Optional (e.g. COREN)</p>
                      </NexaCard>
                    </div>

                    <NexaCard className="p-8">
                      <h3 className="font-extrabold text-sm uppercase tracking-widest text-nexa-text-faint mb-6 border-b border-nexa-border pb-4">Bank Details (For Payouts)</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <NexaInput 
                          label="Bank Name" 
                          placeholder="e.g. GTBank"
                          value={formData.bankName}
                          onChange={e => setFormData({...formData, bankName: e.target.value})}
                        />
                        <NexaInput 
                          label="Account Number" 
                          maxLength={10}
                          value={formData.accountNumber}
                          onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                        />
                        <div className="md:col-span-2">
                          <NexaInput 
                            label="Account Name" 
                            disabled
                            value={formData.accountName || "Will auto-fill via Paystack"}
                            className="bg-nexa-bg-base text-nexa-text-faint"
                          />
                        </div>
                      </div>
                    </NexaCard>
                  </div>

                  <div className="flex justify-between mt-8">
                    <NexaButton variant="secondary" size="lg" onClick={prevStep} leftIcon={<ArrowLeft className="w-5 h-5" />}>Back</NexaButton>
                    <NexaButton 
                      size="lg" 
                      onClick={nextStep} 
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="bg-nexa-amber hover:bg-nexa-amber/90 text-white"
                    >
                      Next Step
                    </NexaButton>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: BACKGROUND CHECK */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-nexa-amber/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShieldCheck className="w-10 h-10 text-nexa-amber" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-display mb-4">Background Check Consent</h1>
                    <p className="text-nexa-text-secondary max-w-lg mx-auto">
                      To protect our customers and maintain the NexaGuaranteed standard, all technicians undergo a formal background check.
                    </p>
                  </div>

                  <NexaCard className="p-8 max-w-2xl mx-auto border-nexa-amber/20 shadow-xl">
                    <div className="flex items-center justify-between mb-8 pb-6 border-b border-nexa-border">
                      <span className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Verification Partner</span>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 dark:text-white">VerifyMe Nigeria</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                    </div>

                    <div className="space-y-4 mb-8">
                      <h4 className="font-bold">What this check covers:</h4>
                      <ul className="space-y-3">
                        {["Identity verification against NIMC database", "Criminal record check via local authorities", "Address verification"].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-nexa-text-secondary">
                            <div className="w-1.5 h-1.5 rounded-full bg-nexa-amber" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <label className={cn(
                      "flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all border-2",
                      formData.consentGiven ? "border-nexa-amber bg-nexa-amber/5" : "border-nexa-border bg-nexa-bg-base"
                    )}>
                      <input 
                        type="checkbox" 
                        className="mt-1 w-5 h-5 accent-nexa-amber"
                        checked={formData.consentGiven}
                        onChange={e => setFormData({...formData, consentGiven: e.target.checked})}
                      />
                      <div className="flex-1">
                        <p className="font-bold text-sm mb-1">I authorize NexaNG and its partners to conduct a background check.</p>
                        <p className="text-xs text-nexa-text-faint">By checking this box, you provide explicit informed consent for the verification processes described above.</p>
                      </div>
                    </label>

                    {formData.consentGiven && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-nexa-amber/10 text-nexa-amber rounded-full text-xs font-bold border border-nexa-amber/20">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-nexa-amber opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-nexa-amber"></span>
                          </span>
                          Submitted — Results in 1-3 business days
                        </div>
                      </motion.div>
                    )}
                  </NexaCard>

                  <div className="flex justify-between mt-8 max-w-2xl mx-auto">
                    <NexaButton variant="secondary" size="lg" onClick={prevStep} leftIcon={<ArrowLeft className="w-5 h-5" />}>Back</NexaButton>
                    <NexaButton 
                      size="lg" 
                      onClick={nextStep} 
                      disabled={!formData.consentGiven}
                      rightIcon={<ArrowRight className="w-5 h-5" />}
                      className="bg-nexa-amber hover:bg-nexa-amber/90 text-white"
                    >
                      Next Step
                    </NexaButton>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: ASSESSMENT BOOKING */}
              {step === 5 && (
                <motion.div
                  key="step5"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-display mb-4">Book Skills Assessment</h1>
                    <p className="text-nexa-text-secondary max-w-lg mx-auto">
                      Before your first job, we need to confirm your skills. Choose an assessment slot that works for you.
                    </p>
                  </div>

                  <NexaCard className="p-8 max-w-3xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-8">
                        <div>
                          <h3 className="font-extrabold text-sm uppercase tracking-widest text-nexa-text-faint mb-4">1. Assessment Format</h3>
                          <div className="space-y-3">
                            {["in-person", "video"].map(type => (
                              <label key={type} className={cn(
                                "flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors",
                                formData.assessmentType === type ? "border-nexa-amber bg-nexa-amber/5" : "border-nexa-border hover:border-nexa-amber/30"
                              )}>
                                <input 
                                  type="radio" 
                                  name="assessmentType"
                                  className="accent-nexa-amber"
                                  checked={formData.assessmentType === type}
                                  onChange={() => setFormData({...formData, assessmentType: type})}
                                />
                                <div>
                                  <p className="font-bold text-sm capitalize">{type.replace("-", " ")}</p>
                                  <p className="text-[10px] text-nexa-text-secondary">{type === "in-person" ? "Lagos, Abuja, PH offices" : "Live video call via Zoom"}</p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="font-extrabold text-sm uppercase tracking-widest text-nexa-text-faint mb-4">What to expect</h3>
                          <div className="p-4 bg-nexa-bg-base border border-nexa-border rounded-xl text-sm text-nexa-text-secondary space-y-2">
                            <p className="font-bold text-slate-800 dark:text-white">For {formData.primarySkill || "your trade"}:</p>
                            <ul className="list-disc pl-4 space-y-1">
                              <li>Brief interview on past experience</li>
                              <li>Scenario-based troubleshooting questions</li>
                              <li>Tool and equipment check</li>
                              <li>NexaNG customer service standards</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <h3 className="font-extrabold text-sm uppercase tracking-widest text-nexa-text-faint mb-4">2. Select Date & Time</h3>
                        
                        <NexaInput 
                          label="Choose Date" 
                          type="date"
                          value={formData.assessmentDate}
                          onChange={e => setFormData({...formData, assessmentDate: e.target.value})}
                        />
                        
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Available Time Slots</label>
                          <div className="grid grid-cols-2 gap-3">
                            {["09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM"].map(time => (
                              <button
                                key={time}
                                onClick={() => setFormData({...formData, assessmentTime: time})}
                                className={cn(
                                  "py-3 rounded-xl text-sm font-bold transition-colors border",
                                  formData.assessmentTime === time 
                                    ? "bg-nexa-amber text-white border-nexa-amber" 
                                    : "bg-transparent text-nexa-text-secondary border-nexa-border hover:border-nexa-amber/50"
                                )}
                              >
                                {time}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </NexaCard>

                  <div className="flex justify-between mt-12 max-w-3xl mx-auto">
                    <NexaButton variant="secondary" size="lg" onClick={prevStep} leftIcon={<ArrowLeft className="w-5 h-5" />}>Back</NexaButton>
                    <NexaButton 
                      size="lg" 
                      onClick={handleSubmit} 
                      isLoading={isSubmitting}
                      disabled={!formData.assessmentDate || !formData.assessmentTime}
                      className="bg-nexa-amber hover:bg-nexa-amber/90 text-white px-12 shadow-xl shadow-nexa-amber/20"
                    >
                      Complete Application
                    </NexaButton>
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

export default function TechnicianOnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-nexa-bg-base flex items-center justify-center"><div className="w-8 h-8 border-4 border-nexa-amber border-t-transparent rounded-full animate-spin" /></div>}>
      <TechnicianOnboardingContent />
    </Suspense>
  );
}
