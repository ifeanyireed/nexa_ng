"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Package, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Scale, 
  Box
} from "lucide-react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaBadge } from "@/components/nexa/NexaBadge";

// Mock Data
const activeDeliveries = [
  { id: "DL-9823", status: "PICKUP", origin: "Lekki Phase 1", destination: "Victoria Island", distance: "4.2km", payout: 3000, item: "Premium Leather Shoes" },
  { id: "DL-9824", status: "TRANSIT", origin: "Yaba", destination: "Surulere", distance: "8.5km", payout: 4500, item: "MacBook Pro M2" },
];

export default function LogisticsDashboard() {
  const [activeTab, setActiveTab] = useState<"deliveries" | "calculator">("deliveries");
  
  // Calculator State
  const [weight, setWeight] = useState("1");
  const [isBulky, setIsBulky] = useState(false);
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [calculatedRate, setCalculatedRate] = useState<number | null>(null);

  const calculateRate = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(weight) || 0;
    // Base fee 2500 + 100 per kg + 1500 if bulky
    const rate = 2500 + (w * 100) + (isBulky ? 1500 : 0);
    setCalculatedRate(rate);
  };

  return (
    <main className="min-h-screen bg-nexa-bg-base flex flex-col">
      <NexaNavbar />

      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-display mb-2">Logistics Module</h1>
            <p className="text-nexa-text-secondary">Manage deliveries and calculate standard Nexa fixed rates.</p>
          </div>
          
          <div className="flex bg-nexa-bg-surface p-1 rounded-xl border border-nexa-border shrink-0">
            <button 
              onClick={() => setActiveTab("deliveries")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "deliveries" ? "bg-nexa-brand text-white shadow-lg" : "text-nexa-text-secondary hover:text-nexa-text-primary"}`}
            >
              Rider Queue
            </button>
            <button 
              onClick={() => setActiveTab("calculator")}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === "calculator" ? "bg-nexa-brand text-white shadow-lg" : "text-nexa-text-secondary hover:text-nexa-text-primary"}`}
            >
              Provider Calculator
            </button>
          </div>
        </div>

        {activeTab === "deliveries" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <NexaCard variant="glass" className="p-6">
                <div className="w-12 h-12 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center mb-4">
                  <Package className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-extrabold">12</h3>
                <p className="text-xs text-nexa-text-secondary font-bold uppercase tracking-wider">Completed Today</p>
              </NexaCard>
              <NexaCard variant="glass" className="p-6">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-extrabold">₦34,500</h3>
                <p className="text-xs text-nexa-text-secondary font-bold uppercase tracking-wider">Today's Earnings</p>
              </NexaCard>
              <NexaCard variant="glass" className="p-6 bg-nexa-brand/5 border-nexa-brand/20">
                <div className="w-12 h-12 rounded-2xl bg-nexa-brand text-white flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-1">Nexa Protected</h3>
                <p className="text-xs text-nexa-text-secondary">You are operating under standardized platform rates.</p>
              </NexaCard>
            </div>

            <h2 className="text-xl font-extrabold mb-4">Active Queue</h2>
            <div className="space-y-4">
              {activeDeliveries.map(delivery => (
                <div key={delivery.id} className="p-6 rounded-2xl border border-nexa-border bg-nexa-bg-surface flex flex-col md:flex-row gap-6 md:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <NexaBadge variant="neutral" className={delivery.status === "PICKUP" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}>
                        {delivery.status}
                      </NexaBadge>
                      <span className="text-sm font-bold text-nexa-text-faint">{delivery.id}</span>
                    </div>
                    <h3 className="font-bold text-lg mb-4">{delivery.item}</h3>
                    <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-rose-500 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-nexa-text-faint uppercase tracking-wider mb-0.5">Pickup</p>
                          <p className="text-sm font-bold">{delivery.origin}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-emerald-500 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold text-nexa-text-faint uppercase tracking-wider mb-0.5">Dropoff</p>
                          <p className="text-sm font-bold">{delivery.destination}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-4 shrink-0 border-t md:border-t-0 md:border-l border-nexa-border pt-4 md:pt-0 md:pl-6">
                    <div className="text-left md:text-right">
                      <p className="text-[10px] font-bold text-nexa-text-faint uppercase tracking-wider mb-0.5">Your Payout</p>
                      <p className="text-2xl font-extrabold text-emerald-600">₦{delivery.payout.toLocaleString()}</p>
                    </div>
                    <NexaButton size="sm" rightIcon={<Truck className="w-4 h-4" />}>
                      {delivery.status === "PICKUP" ? "Confirm Pickup" : "Mark Delivered"}
                    </NexaButton>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === "calculator" && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <NexaCard variant="glass" className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-extrabold mb-2">Provider Rate Calculator</h2>
                <p className="text-sm text-nexa-text-secondary">Calculate exact delivery costs for your products based on our unified fixed-rate formula. External delivery agents cannot inflate these prices.</p>
              </div>

              <form onSubmit={calculateRate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <NexaInput 
                    label="Pickup LGA" 
                    placeholder="e.g. Ikeja" 
                    value={pickup} 
                    onChange={(e) => setPickup(e.target.value)} 
                    required 
                  />
                  <NexaInput 
                    label="Dropoff LGA" 
                    placeholder="e.g. Lekki" 
                    value={dropoff} 
                    onChange={(e) => setDropoff(e.target.value)} 
                    required 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <NexaInput 
                    label="Estimated Weight (kg)" 
                    type="number" 
                    min="0.1" 
                    step="0.1" 
                    value={weight} 
                    onChange={(e) => setWeight(e.target.value)} 
                    required 
                    leftIcon={<Scale className="w-5 h-5" />}
                  />
                  
                  <div className="space-y-1.5 flex flex-col justify-end pb-2">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isBulky ? 'bg-nexa-brand border-nexa-brand' : 'border-nexa-border group-hover:border-nexa-brand/50'}`}>
                        {isBulky && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">Item is Bulky</p>
                        <p className="text-[10px] text-nexa-text-faint">Requires specialized handling or extra trunk space.</p>
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={isBulky} 
                        onChange={(e) => setIsBulky(e.target.checked)} 
                      />
                    </label>
                  </div>
                </div>

                <NexaButton type="submit" size="lg" className="w-full h-14 mt-4">Calculate Rate</NexaButton>
              </form>

              {calculatedRate !== null && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-6 rounded-2xl bg-nexa-brand/5 border border-nexa-brand/20 text-center">
                  <p className="text-sm font-bold text-nexa-text-secondary uppercase tracking-wider mb-2">Standardized Delivery Fee</p>
                  <p className="text-5xl font-extrabold text-nexa-brand mb-4">₦{calculatedRate.toLocaleString()}</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-nexa-text-faint">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Rate is locked. Riders cannot overcharge.</span>
                  </div>
                </motion.div>
              )}
            </NexaCard>
          </motion.div>
        )}
      </div>

      <NexaBottomBar />
    </main>
  );
}
