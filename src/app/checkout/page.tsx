"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  MapPin,
  ChevronRight,
  Lock,
  Building,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaInput } from "@/components/nexa/NexaInput";

export default function CheckoutPage() {
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("card");

  // Mock cart items
  const cartItems = [
    { name: "Industrial Wrench Set", price: "₦15,000", qty: 1, image: "https://images.unsplash.com/photo-1586864387917-f538a5a9261c?auto=format&fit=crop&q=80&w=100" },
    { name: "Safety Gloves (Large)", price: "₦2,500", qty: 2, image: "https://images.unsplash.com/photo-1590674899484-13da0d1b58f5?auto=format&fit=crop&q=80&w=100" }
  ];

  const subtotal = 20000;
  const delivery = 2500;
  const total = subtotal + delivery;

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <div className="container mx-auto px-4 pt-32">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* LEFT: CHECKOUT FORM */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-extrabold text-display">Checkout</h1>
              <div className="flex items-center gap-2">
                {[1, 2].map((s) => (
                  <div 
                    key={s} 
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                      step >= s ? "bg-nexa-brand text-white" : "bg-nexa-bg-surface text-nexa-text-faint"
                    )}
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>

            {step === 1 ? (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <section>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-nexa-brand" />
                    Delivery Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <NexaInput label="Full Name" placeholder="John Doe" />
                    <NexaInput label="Phone Number" placeholder="+234 803 000 0000" />
                    <div className="md:col-span-2">
                      <NexaInput label="Shipping Address" placeholder="Street name and number" />
                    </div>
                    <NexaInput label="City" placeholder="Lekki" />
                    <NexaInput label="State" placeholder="Lagos" />
                  </div>
                </section>

                <NexaButton size="lg" className="w-full h-14" onClick={() => setStep(2)} rightIcon={<ChevronRight className="w-5 h-5" />}>
                  Continue to Payment
                </NexaButton>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <button onClick={() => setStep(1)} className="text-xs font-bold text-nexa-brand uppercase tracking-widest flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back to Shipping
                </button>

                <section>
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-nexa-brand" />
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
                          paymentMethod === m.id ? "border-nexa-brand bg-nexa-brand/5" : "border-nexa-border bg-nexa-bg-surface hover:border-nexa-brand/30"
                        )}
                      >
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", paymentMethod === m.id ? "bg-nexa-brand text-white" : "bg-nexa-bg-base text-nexa-text-faint")}>
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

                  {paymentMethod === "transfer" && (
                    <div className="p-6 rounded-2xl bg-nexa-bg-surface border border-nexa-border space-y-4 animate-in fade-in slide-in-from-bottom-2">
                      <p className="text-sm text-nexa-text-secondary">Please transfer the total amount to the account below:</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-xs text-nexa-text-faint font-bold uppercase">Bank</span>
                          <span className="text-sm font-bold">Nexa Bank (Providus)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-nexa-text-faint font-bold uppercase">Account Number</span>
                          <span className="text-sm font-bold tracking-widest">1234567890</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-nexa-text-faint font-bold uppercase">Account Name</span>
                          <span className="text-sm font-bold">NEXA TECHNOLOGIES LTD</span>
                        </div>
                      </div>
                    </div>
                  )}
                </section>

                <Link href="/checkout/success">
                  <NexaButton size="lg" className="w-full h-16 rounded-2xl shadow-xl shadow-nexa-brand/20 text-lg mt-8" leftIcon={<Lock className="w-5 h-5" />}>
                    Pay ₦{total.toLocaleString()}
                  </NexaButton>
                </Link>
                
                <p className="text-center text-[10px] text-nexa-text-faint font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Secure Encryption by NexaPay
                </p>
              </motion.div>
            )}
          </div>

          {/* RIGHT: ORDER SUMMARY */}
          <div className="w-full lg:w-[400px]">
            <NexaCard variant="glass" className="p-8 sticky top-32 border-none shadow-2xl bg-nexa-bg-surface/80 backdrop-blur-2xl">
              <h3 className="text-xl font-extrabold mb-8 pb-4 border-b border-nexa-border">Order Summary</h3>
              
              <div className="space-y-6 mb-8">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl bg-white overflow-hidden border border-nexa-border shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{item.name}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-nexa-text-faint">Qty: {item.qty}</p>
                        <p className="text-sm font-bold">{item.price}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-nexa-border">
                <div className="flex justify-between text-sm text-nexa-text-secondary font-medium">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-nexa-text-secondary font-medium">
                  <span>Delivery Fee</span>
                  <span>₦{delivery.toLocaleString()}</span>
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
                  Your purchase is protected by <strong>Nexa Buyer Guarantee</strong>. Full refund if item is not as described.
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
