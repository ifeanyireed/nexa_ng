"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { NexaNavbar, NexaBottomBar } from '@/components/nexa/NexaNav';
import { NexaCard } from '@/components/nexa/NexaCard';
import { NexaButton } from '@/components/nexa/NexaButton';

export default function ConfirmationClient({ refId }: { refId: string }) {
  return (
    <main className="bg-nexa-bg-base min-h-screen flex flex-col items-center justify-center p-4">
      <NexaNavbar />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <NexaCard
          variant="glass"
          className="max-w-lg w-full text-center p-8 lg:p-12 shadow-2xl bg-nexa-bg-surface/80 backdrop-blur-2xl"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
            className="mx-auto bg-green-500/10 text-green-500 rounded-full h-24 w-24 flex items-center justify-center"
          >
            <CheckCircle className="h-12 w-12" />
          </motion.div>

          <h1 className="text-3xl font-extrabold text-display mt-6">
            Booking Confirmed!
          </h1>
          <p className="text-nexa-text-secondary mt-2">
            Your Nexa Verified technician is now scheduled.
          </p>

          <div className="mt-8 bg-nexa-bg-base rounded-2xl p-4">
            <p className="text-sm text-nexa-text-faint font-bold uppercase tracking-widest">
              Booking Reference
            </p>
            <p className="text-2xl font-mono font-bold text-nexa-brand mt-1 tracking-wider">
              {refId || 'N/A'}
            </p>
          </div>

          <p className="text-xs text-nexa-text-faint mt-6">
            A confirmation has been sent to your email and you can track the status of your booking in your dashboard.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href={`/booking/${refId}/track`} legacyBehavior passHref>
              <NexaButton size="lg" className="w-full" rightIcon={<ArrowRight />}>
                Track Booking
              </NexaButton>
            </Link>
            <Link href="/dashboard/bookings" legacyBehavior passHref>
              <NexaButton size="lg" variant="secondary" className="w-full">
                Go to Dashboard
              </NexaButton>
            </Link>
          </div>
        </NexaCard>
      </motion.div>
      <NexaBottomBar />
    </main>
  );
}
