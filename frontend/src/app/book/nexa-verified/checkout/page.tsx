"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaInput } from "@/components/nexa/NexaInput";

import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/components/nexa/AuthContext";

export default function NexaVerifiedCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Get data from query params for booking
  const service = searchParams.get("service") || "Nexa Verified Service";
  const amountParam = searchParams.get("amount");
  const amount = amountParam ? parseFloat(amountParam) : 50000; // Default amount for verified service

  const subtotal = amount;
  const serviceFee = subtotal * 0.05; // 5% service fee
  const total = subtotal + serviceFee;

  const handlePay = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const response = await api.post("/bookings/nexa-verified", {
        service_name: service,
        amount: total,
      });
      const bookingRef = response.data.reference;
      router.push(`/book/nexa-verified/confirmed/${bookingRef}`);
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) return null;

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <div className="container mx-auto px-4 pt-32">
        {error && (
           <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3">
              <ShieldCheck className="w-5 h-5" />
              {error}
           </div>
        )}
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT: CHECKOUT FORM */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-extrabold text-display">Nexa Verified Checkout</h1>
            </div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <section>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-nexa-brand" />
                  Payment Details
                </h3>
                <div className="space-y-6">
                  <NexaInput label="Card Number" placeholder="0000 0000 0000 0000" />
                  <div className="grid grid-cols-2 gap-6">
                    <NexaInput label="Expiry Date" placeholder="MM/YY" />
                    <NexaInput label="CVV" placeholder="123" />
                  </div>
                </div>
              </section>

              <NexaButton 
                size="lg" 
                className="w-full h-16 rounded-2xl shadow-xl shadow-nexa-brand/20 text-lg mt-8" 
                leftIcon={<Lock className="w-5 h-5" />}
                onClick={handlePay}
                isLoading={isSubmitting}
              >
                Pay ₦{total.toLocaleString()}
              </NexaButton>
              
              <p className="text-center text-[10px] text-nexa-text-faint font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Secure Encryption by NexaPay
              </p>
            </motion.div>
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="w-full lg:w-[400px]">
            <NexaCard variant="glass" className="p-8 sticky top-32 border-none shadow-2xl bg-nexa-bg-surface/80 backdrop-blur-2xl">
              <h3 className="text-xl font-extrabold mb-8 pb-4 border-b border-nexa-border">Order Summary</h3>
              
              <div className="space-y-6 mb-8">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate">{service}</h4>
                    <p className="text-sm font-bold mt-1">₦{subtotal.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-nexa-border">
                <div className="flex justify-between text-sm text-nexa-text-secondary font-medium">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-nexa-text-secondary font-medium">
                  <span>Nexa Service Fee (5%)</span>
                  <span>₦{serviceFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-extrabold pt-2">
                  <span>Total</span>
                  <span className="text-nexa-brand">₦{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-nexa-brand/5 border border-nexa-brand/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-nexa-brand/10 text-nexa-brand flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-[10px] text-nexa-text-secondary leading-tight">
                  You're subscribing to a <strong>Nexa Verified</strong> technician. This guarantees premium service and priority support.
                </p>
              </div>
            </NexaCard>
          </div>

        </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
