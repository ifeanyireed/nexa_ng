"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  CheckCircle2, 
  ArrowRight, 
  ShoppingBag, 
  Calendar,
  Download,
  Share2
} from "lucide-react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";

export default function CheckoutSuccessPage() {
  return (
    <main className="bg-nexa-bg-base min-h-screen flex flex-col">
      <NexaNavbar />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-32 pb-24">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl relative z-10 text-center"
        >
          <div className="w-24 h-24 rounded-[32px] bg-emerald-500 text-white flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 className="w-12 h-12" />
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-display mb-6">Order Placed!</h1>
          <p className="text-xl text-nexa-text-secondary mb-12 max-w-md mx-auto leading-relaxed">
            Your order <strong>#NX-88291</strong> has been successfully placed. We've sent the receipt to your email.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
            <NexaCard variant="glass" className="p-6 border-emerald-500/20 bg-emerald-500/5">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-emerald-500" />
                Track Order
              </h3>
              <p className="text-sm text-nexa-text-secondary mb-6">
                The seller has been notified and will begin processing your items shortly.
              </p>
              <Link href="/account?tab=orders">
                <NexaButton size="sm" variant="secondary" className="w-full">View Order Status</NexaButton>
              </Link>
            </NexaCard>

            <NexaCard variant="glass" className="p-6">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-nexa-brand" />
                What's Next?
              </h3>
              <p className="text-sm text-nexa-text-secondary mb-6">
                You can now view your bookings or continue exploring other niches.
              </p>
              <Link href="/">
                <NexaButton size="sm" variant="secondary" className="w-full">Back to Marketplace</NexaButton>
              </Link>
            </NexaCard>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <NexaButton size="lg" className="h-14 px-8 rounded-2xl" leftIcon={<Download className="w-5 h-5" />}>
              Download Receipt
            </NexaButton>
            <NexaButton variant="secondary" size="lg" className="h-14 px-8 rounded-2xl" leftIcon={<Share2 className="w-5 h-5" />}>
              Share Nexa
            </NexaButton>
          </div>
        </motion.div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
