"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  MapPin,
  ChevronRight,
  Lock,
  Building,
  Smartphone,
  Calendar,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaVerifiedBadge } from "@/components/nexa/NexaVerifiedBadge";

export default function PremiumCheckoutPage() {
  const searchParams = useSearchParams();
  const service = searchParams.get("service") || "Professional Service";
  const date = searchParams.get("date") || "12";
  const time = searchParams.get("time") || "09:00 AM";

  const [paymentMethod, setPaymentMethod] = useState("card");

  const depositAmount = 5000;
  const serviceFee = 1500;
  const total = depositAmount + serviceFee;

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <div className="container mx-auto px-4 pt-32">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT: CHECKOUT FORM */}
          <div className="flex-1 space-y-8">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Link href="/nexa-verified" className="p-2 hover:bg-nexa-bg-surface rounded-xl transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <NexaVerifiedBadge />
              </div>
              <h1 className="text-3xl lg:text-5xl font-extrabold text-display">Secure Premium Booking</h1>
            </div>

            <section className="space-y-8">
              <div className="liquid-glass p-8 rounded-[32px] border-none bg-nexa-bg-surface/50">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-nexa-amber" />
                  Service Location
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <NexaInput label="Full Name" placeholder="John Doe" />
                  <NexaInput label="Phone Number" placeholder="+234 803 000 0000" />
                  <div className="md:col-span-2">
                    <NexaInput label="Detailed Address" placeholder="Street name, Apartment/Suite number" />
                  </div>
                </div>
              </div>

              <div className="liquid-glass p-8 rounded-[32px] border-none bg-nexa-bg-surface/50">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-nexa-amber" />
                  Payment Method
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  {[
                    { id: "card", label: "Card", icon: <CreditCard className="w-5 h-5" /> },
                    { id: "transfer", label: "Transfer", icon: <Building className="w-5 h-5" /> },
                    { id: "ussd", label: "USSD", icon: <Smartphone className="w-5 h-5" /> }
                  ].map((m) => (
                    <button 
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={cn(
                        "p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3",
                        paymentMethod === m.id ? "border-nexa-amber bg-nexa-amber/5" : "border-nexa-border bg-nexa-bg-surface hover:border-nexa-amber/20"
                      )}
                    >
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", paymentMethod === m.id ? "bg-nexa-amber text-white" : "bg-nexa-bg-base text-nexa-text-faint")}>
                        {m.icon}
                      </div>
                      <span className="text-sm font-bold">{m.label}</span>
                    </button>
                  ))}
                </div>

                {paymentMethod === "card" && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                    <NexaInput label="Card Number" placeholder="0000 0000 0000 0000" />
                    <div className="grid grid-cols-2 gap-6">
                      <NexaInput label="Expiry Date" placeholder="MM/YY" />
                      <NexaInput label="CVV" placeholder="123" />
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="w-full lg:w-[450px]">
            <div className="liquid-glass p-8 sticky top-32 border-nexa-amber/30 bg-nexa-amber-light/10 dark:bg-nexa-amber/5 rounded-[40px] shadow-2xl">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-nexa-amber/10">
                <h3 className="text-xl font-extrabold">Booking Summary</h3>
                <NexaVerifiedBadge showText={false} />
              </div>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/50 dark:bg-black/20 border border-nexa-amber/10">
                  <div className="w-12 h-12 rounded-xl bg-nexa-amber/10 flex items-center justify-center text-nexa-amber shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{service}</h4>
                    <div className="flex items-center gap-4 mt-1 text-[10px] font-bold text-nexa-text-faint uppercase tracking-widest">
                       <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Oct {date}</span>
                       <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {time}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-nexa-amber/10">
                <div className="flex justify-between text-sm text-nexa-text-secondary font-medium">
                  <span>Commitment Deposit</span>
                  <span className="font-bold">₦{depositAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-nexa-text-secondary font-medium">
                  <span>Nexa Service Fee</span>
                  <span className="font-bold">₦{serviceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-2xl font-extrabold pt-4 border-t border-nexa-amber/20">
                  <span>Due Now</span>
                  <span className="text-nexa-amber">₦{total.toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-nexa-text-faint font-bold text-right italic">
                  *Remaining balance will be paid to technician upon completion.
                </p>
              </div>

              <div className="mt-8 p-6 rounded-[24px] bg-nexa-amber/10 border border-nexa-amber/20 space-y-3">
                <div className="flex items-center gap-2 text-nexa-amber">
                   <ShieldCheck className="w-5 h-5" />
                   <span className="text-xs font-extrabold uppercase tracking-widest">Escrow Protected</span>
                </div>
                <p className="text-[10px] text-nexa-text-secondary leading-relaxed font-medium">
                  Your payment is held in escrow by NexaNG. Funds are only released to the technician once you confirm the job is complete and satisfactory.
                </p>
              </div>

              <Link href="/book/nexa-verified/confirmed/NXV-78291">
                <NexaButton size="xl" className="w-full h-20 rounded-[24px] bg-nexa-amber hover:bg-nexa-amber/90 shadow-2xl shadow-nexa-amber/20 text-xl mt-8 font-black" leftIcon={<Lock className="w-6 h-6" />}>
                  Confirm & Pay ₦{total.toLocaleString()}
                </NexaButton>
              </Link>
            </div>
          </div>

        </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
