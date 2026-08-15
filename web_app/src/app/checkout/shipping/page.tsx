"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Truck, MapPin, ShieldCheck, Star, Clock, Building } from "lucide-react";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useRouter } from "next/navigation";

// Mock Data for Dispatch Riders retrieved from the DB (Rates are now centrally controlled by Nexa)
const dispatchRiders = [
  { id: "r1", name: "Kolawole J.", rating: 4.9, trips: 342, time: "25 mins away" },
  { id: "r2", name: "Chinedu E.", rating: 4.8, trips: 156, time: "40 mins away" }
];

// Nexa Standardized Rate Calculator (Base fee + Weight/Bulkiness)
const calculateNexaRate = (weight: number, isBulky: boolean) => {
  const baseRate = 2500;
  return baseRate + (weight * 100) + (isBulky ? 1500 : 0);
};

const nexaFixedRate = calculateNexaRate(5, false); // ₦3,000

export default function CheckoutShipping() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [lga, setLga] = useState("");
  const [step, setStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  return (
      <main className="min-h-screen bg-nexa-bg-base flex flex-col md:flex-row">
         {/* LEFT PANEL - MAP/VISUAL */}
         <div className="hidden md:flex md:w-1/2 relative overflow-hidden flex-col justify-end p-12 bg-nexa-bg-base border-r border-nexa-border">
            <div className="absolute inset-0 z-0 pointer-events-none">
               <img src="/nexa-delivery.jpeg" alt="Nexa Delivery" className="w-full h-full object-cover object-center" />
               <div 
                 className="absolute inset-0"
                 style={{
                   backdropFilter: 'blur(16px) saturate(150%)',
                   WebkitBackdropFilter: 'blur(16px) saturate(150%)',
                   maskImage: 'linear-gradient(to bottom, transparent 30%, black 70%)',
                   WebkitMaskImage: 'linear-gradient(to bottom, transparent 30%, black 70%)'
                 }}
               />
               <div className="absolute bottom-0 left-0 right-0 h-[75%] bg-gradient-to-t from-white/95 via-white/60 to-transparent" />
            </div>
            
            <div className="relative z-20 space-y-6 max-w-md mb-8">
               <NexaBadge variant="brand" className="bg-nexa-brand/10 text-nexa-brand border-nexa-brand/20 backdrop-blur-md">Nexa Logistics</NexaBadge>
               <h1 className="text-4xl lg:text-6xl font-extrabold text-display leading-[1.1] text-slate-900">
                  Last-Mile Delivery. <br/><span className="text-nexa-brand">Sorted.</span>
               </h1>
               <p className="text-slate-700 text-lg font-medium">We automatically match you with verified independent dispatch riders in your LGA for rapid delivery.</p>
            </div>
         </div>

         {/* RIGHT PANEL - FORM */}
         <div className="flex-1 overflow-y-auto">
            <div className="p-6 md:p-12 max-w-xl mx-auto">
               <button onClick={() => window.history.back()} className="inline-flex items-center gap-2 text-nexa-text-faint hover:text-nexa-brand transition-colors mb-12">
                  <ArrowLeft className="w-4 h-4" /> <span className="text-xs font-bold uppercase tracking-wider">Back to Cart</span>
               </button>

               {step === 1 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                     <div>
                        <h2 className="text-3xl font-extrabold text-display mb-2">Delivery Details</h2>
                        <p className="text-nexa-text-secondary">Where should we drop off your items?</p>
                     </div>

                     <div className="space-y-5">
                        <NexaInput 
                           label="Delivery Address" 
                           placeholder="e.g. 14 Admiralty Way" 
                           value={address} 
                           onChange={(e) => setAddress(e.target.value)}
                           leftIcon={<MapPin className="w-4 h-4 text-nexa-text-faint" />}
                        />
                        <div className="grid grid-cols-2 gap-5">
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-nexa-text-secondary uppercase tracking-wider">State</label>
                              <div className="h-12 rounded-xl bg-nexa-bg-surface border border-nexa-border flex items-center px-4 font-bold text-nexa-text-primary">
                                 Lagos
                              </div>
                           </div>
                           <div className="space-y-1.5">
                              <label className="text-xs font-bold text-nexa-text-secondary uppercase tracking-wider">LGA</label>
                              <select 
                                 className="w-full h-12 rounded-xl bg-nexa-bg-base border border-nexa-border px-4 font-medium outline-none focus:border-nexa-brand"
                                 value={lga}
                                 onChange={(e) => setLga(e.target.value)}
                              >
                                 <option value="">Select LGA</option>
                                 <option value="eti-osa">Eti-Osa (VI / Lekki)</option>
                                 <option value="ikeja">Ikeja</option>
                                 <option value="surulere">Surulere</option>
                                 <option value="yaba">Yaba</option>
                              </select>
                           </div>
                        </div>
                     </div>

                     <NexaButton 
                        size="xl" 
                        className="w-full" 
                        disabled={!address || !lga}
                        onClick={() => setStep(2)}
                     >
                        Find Riders Nearby
                     </NexaButton>
                  </motion.div>
               )}

               {step === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                     <div>
                        <h2 className="text-3xl font-extrabold text-display mb-2">Select Delivery Method</h2>
                        <p className="text-nexa-text-secondary">We found {dispatchRiders.length} verified dispatch riders near {address}.</p>
                     </div>                     
                     <div className="space-y-6">
                        {/* MODEL 1: SAME DAY DELIVERY (LOCAL) */}
                        <div className="space-y-3">
                           <h3 className="font-bold text-sm text-nexa-text-secondary uppercase tracking-wider mb-2">1. Same Day Delivery (Local)</h3>
                           <p className="text-xs text-nexa-text-faint mb-4">Fulfilled by Nexa-verified riders. Riders are prioritized by proximity. Fixed Nexa Rates apply.</p>
                           {dispatchRiders.map((rider) => (
                              <div 
                                 key={rider.id}
                                 onClick={() => setSelectedMethod(rider.id)}
                                 className={`cursor-pointer rounded-2xl border-2 transition-all p-5 ${selectedMethod === rider.id ? 'border-nexa-brand bg-nexa-brand/5 shadow-xl shadow-nexa-brand/10' : 'border-nexa-border bg-nexa-bg-surface hover:border-nexa-text-faint'}`}
                              >
                                 <div className="flex items-start justify-between">
                                    <div className="flex gap-4">
                                       <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden relative">
                                          <img src={`https://i.pravatar.cc/150?u=${rider.id}`} alt={rider.name} className="w-full h-full object-cover" />
                                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                                       </div>
                                       <div>
                                          <div className="flex items-center gap-1.5 mb-1">
                                             <h4 className="font-bold">{rider.name}</h4>
                                             <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                                          </div>
                                          <div className="flex items-center gap-3 text-xs text-nexa-text-secondary">
                                             <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-current" /> {rider.rating}</span>
                                             <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {rider.time}</span>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="text-right">
                                       <span className="font-extrabold text-lg block mb-1">₦{nexaFixedRate.toLocaleString()}</span>
                                       <NexaBadge variant="neutral" className="bg-nexa-brand/10 text-nexa-brand border-none text-[10px]">NEXA FIXED RATE</NexaBadge>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>

                        {/* MODEL 2: ON-PLATFORM INTERSTATE (ESCROW) */}
                        <div className="space-y-3 pt-6 border-t border-nexa-border">
                           <h3 className="font-bold text-sm text-nexa-brand uppercase tracking-wider mb-2 flex items-center gap-2">
                              <ShieldCheck className="w-4 h-4" /> 2. Nexa Protected (Interstate)
                           </h3>
                           <p className="text-xs text-nexa-text-secondary mb-4">Store owner drops item at a Nexa Collection Point. Funds are escrowed for 7 days until the return policy closes.</p>
                           <div 
                              onClick={() => setSelectedMethod("nexa_escrow")}
                              className={`cursor-pointer rounded-2xl border-2 transition-all p-5 ${selectedMethod === 'nexa_escrow' ? 'border-nexa-brand bg-nexa-brand/5 shadow-xl shadow-nexa-brand/10' : 'border-nexa-border bg-nexa-bg-surface hover:border-nexa-brand/30'}`}
                           >
                              <div className="flex items-start justify-between">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedMethod === 'nexa_escrow' ? 'bg-nexa-brand text-white' : 'bg-nexa-brand/10 text-nexa-brand'}`}>
                                       <Building className="w-5 h-5" />
                                    </div>
                                    <div>
                                       <h4 className="font-bold">Nexa Escrow Delivery</h4>
                                       <p className="text-xs text-nexa-text-secondary mt-1">3-5 days • Full Buyer Protection</p>
                                    </div>
                                 </div>
                                 <span className="font-extrabold text-lg">₦4,500</span>
                              </div>
                           </div>
                        </div>

                        {/* MODEL 3: OFF-PLATFORM INTERSTATE */}
                        <div className="space-y-3 pt-6 border-t border-nexa-border">
                           <h3 className="font-bold text-sm text-nexa-text-faint uppercase tracking-wider mb-2">3. Off-Platform (Interstate)</h3>
                           <p className="text-xs text-nexa-text-secondary mb-4">Fulfilled entirely by the seller via 3rd-party logistics. <strong className="text-rose-500">No guarantees or tracking provided.</strong></p>
                           <div 
                              onClick={() => setSelectedMethod("off_platform")}
                              className={`cursor-pointer rounded-2xl border-2 transition-all p-5 ${selectedMethod === 'off_platform' ? 'border-rose-500 bg-rose-500/5 shadow-xl shadow-rose-500/10' : 'border-nexa-border bg-nexa-bg-surface hover:border-nexa-text-faint'}`}
                           >
                              <div className="flex items-start justify-between">
                                 <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selectedMethod === 'off_platform' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-nexa-text-faint'}`}>
                                       <Truck className="w-5 h-5" />
                                    </div>
                                    <div>
                                       <h4 className="font-bold">Standard 3rd-Party</h4>
                                       <p className="text-xs text-nexa-text-secondary mt-1">Provider sets the terms.</p>
                                    </div>
                                 </div>
                                 <div className="text-right">
                                    <span className="font-extrabold text-lg text-nexa-text-secondary block mb-1">TBD</span>
                                    <NexaBadge variant="neutral" className="bg-rose-50 text-rose-600 border-rose-100 text-[10px]">PAY ON DELIVERY</NexaBadge>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-4 pt-6">
                        <NexaButton variant="ghost" size="lg" onClick={() => setStep(1)}>Back</NexaButton>
                        <NexaButton 
                           size="lg" 
                           className="flex-1 shadow-2xl" 
                           disabled={!selectedMethod}
                           rightIcon={<ArrowRight className="w-4 h-4" />}
                           onClick={() => router.push("/checkout")}
                        >
                           Proceed to Checkout
                        </NexaButton>
                     </div>
                  </motion.div>
               )}
            </div>
         </div>
      </main>
  );
}
