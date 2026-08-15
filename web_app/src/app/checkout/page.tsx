"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useAuth } from "@/components/nexa/AuthContext";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";

const PaystackButton = dynamic(() => import("@/components/nexa/PaystackButton"), { ssr: false });

import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  ShieldCheck, 
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

import { useRouter, useSearchParams } from "next/navigation";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/checkout");
    }
  }, [user, authLoading, router]);

  // Get data from query params for booking checkouts
  const proId = searchParams.get("proId");
  const service = searchParams.get("service");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const type = searchParams.get("type") || "SHOP";
  const amountParam = searchParams.get("amount");
  const amount = amountParam ? parseFloat(amountParam) : 0;

  // Mock cart items (fallback if not a booking checkout)
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    if (proId) {
      setCartItems([{
        name: service || "Premium Service",
        qty: 1,
        price: amount,
        image: "https://api.dicebear.com/7.x/initials/svg?seed=Nexa"
      }]);
    } else {
      try {
        const savedCart = localStorage.getItem("nexa_cart");
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCartItems(parsed);
          }
        }
      } catch (e) {
        console.error("Cart hydration failed", e);
      }
    }
  }, [proId, service, amount]);

  const subtotal = cartItems.reduce((acc, item) => {
    const p = typeof item.price === 'string' ? parseInt(item.price.replace(/\D/g, '')) : item.price;
    return acc + (p * item.qty);
  }, 0);
  
  // Checkout + Delivery is only for products. If proId is present, it's a direct service booking, so delivery is 0.
  const delivery = proId ? 0 : 3500; 
  const total = subtotal + delivery;

  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || "customer@nexa.com",
    amount: total * 100, // Convert to kobo
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "",
  };

  const finalizeBookingAndRoute = async () => {
    if (proId) {
      try {
        await api.post("/bookings", {
          pro_profile_id: proId,
          scheduled_at: date ? new Date(date).toISOString() : new Date().toISOString(),
          service_name: service,
          amount: amount,
          type: type
        });
      } catch (e) {
        console.error("Failed to save booking:", e);
      }
    } else {
      try {
        const fullAddress = `${address}, ${city}, ${stateName}`;
        for (const item of cartItems) {
          const itemPrice = typeof item.price === 'string' ? parseInt(item.price.replace(/\D/g, '')) : item.price;
          await api.post("/orders", {
            product_id: item.id,
            quantity: item.qty,
            amount: itemPrice * item.qty,
            shipping_address: fullAddress,
            phone: phone || "+234 803 000 0000"
          });
        }
        localStorage.removeItem("nexa_cart");
      } catch (e) {
        console.error("Failed to save order:", e);
      }
    }
    router.push("/dashboard?payment=success");
  };

  const handlePayZero = async () => {
    setIsSubmitting(true);
    await finalizeBookingAndRoute();
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
            <h1 className="text-3xl font-extrabold text-display mb-8">Checkout Details</h1>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <section>
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-nexa-brand" />
                  Billing & Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <NexaInput label="Full Name" placeholder="John Doe" defaultValue={user?.name || ""} />
                  <NexaInput label="Email Address" placeholder="customer@nexa.com" defaultValue={user?.email || ""} disabled />
                  <NexaInput label="Phone Number" placeholder="+234 803 000 0000" value={phone} onChange={e => setPhone(e.target.value)} />
                  <div className="md:col-span-2">
                    <NexaInput label="Delivery / Service Address" placeholder="Street name and number" value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                  <NexaInput label="City" placeholder="Lekki" value={city} onChange={e => setCity(e.target.value)} />
                  <NexaInput label="State" placeholder="Lagos" value={stateName} onChange={e => setStateName(e.target.value)} />
                </div>
              </section>

              <div className="p-6 rounded-2xl bg-nexa-brand/5 border border-nexa-brand/20">
                <h4 className="font-bold text-nexa-brand mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Secure Payment via Paystack
                </h4>
                <p className="text-sm text-nexa-text-secondary">
                  We route all transactions securely through Paystack. You will be able to choose between Card, Transfer, USSD, and other local payment methods directly inside the Paystack modal.
                </p>
              </div>
            </motion.div>
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
                        <p className="text-sm font-bold">₦{typeof item.price === 'number' ? item.price.toLocaleString() : item.price}</p>
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
                {!proId && (
                  <div className="flex justify-between text-sm text-nexa-text-secondary font-medium">
                    <span>Delivery Fee</span>
                    <span>₦{delivery.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-extrabold pt-2">
                  <span>Total</span>
                  <span className="text-nexa-brand">₦{total.toLocaleString()}</span>
                </div>
              </div>

              {total === 0 ? (
                <NexaButton 
                  size="lg" 
                  className="w-full h-16 rounded-2xl shadow-xl shadow-nexa-brand/20 text-lg mt-8" 
                  leftIcon={<Lock className="w-5 h-5" />}
                  onClick={handlePayZero}
                  isLoading={isSubmitting}
                >
                  Confirm Booking
                </NexaButton>
              ) : (
                <div className="mt-8">
                  <PaystackButton 
                    config={paystackConfig}
                    onSuccess={finalizeBookingAndRoute}
                    onClose={() => {}}
                    text={`Pay ₦${total.toLocaleString()}`}
                    className="w-full h-16 rounded-2xl shadow-xl shadow-nexa-brand/20 text-lg"
                  />
                </div>
              )}
              
              <p className="text-center text-[10px] text-nexa-text-faint font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-6">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Secure Encryption by NexaPay
              </p>
              
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

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-nexa-bg-base flex items-center justify-center"><div className="w-8 h-8 border-4 border-nexa-brand border-t-transparent rounded-full animate-spin" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
