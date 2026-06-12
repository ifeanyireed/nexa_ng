"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ChevronLeft,
  Github,
  Chrome
} from "lucide-react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaInput } from "@/components/nexa/NexaInput";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="bg-nexa-bg-base min-h-screen flex flex-col">
      <NexaNavbar />
      
      <div className="flex-1 flex items-center justify-center p-4 pt-32 pb-24">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-nexa-brand/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-nexa-accent/5 blur-[120px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md relative z-10"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-nexa-text-faint hover:text-nexa-brand transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4" /> Back to Home
          </Link>

          <NexaCard variant="glass" className="p-8 md:p-10 shadow-2xl border-nexa-border/50">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-extrabold text-display mb-2">Welcome Back</h1>
              <p className="text-nexa-text-secondary text-sm">Log in to manage your bookings and orders.</p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <NexaInput
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />
              
              <div className="space-y-1">
                <NexaInput
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
                <div className="text-right">
                  <Link href="#" className="text-xs font-bold text-nexa-brand hover:underline">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <NexaButton size="lg" className="w-full h-14 rounded-2xl shadow-xl shadow-nexa-brand/20 font-extrabold text-lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Sign In
              </NexaButton>
            </form>

            <div className="mt-10 mb-8 flex items-center gap-4">
              <div className="h-px bg-nexa-border flex-1" />
              <span className="text-[10px] font-bold text-nexa-text-faint uppercase tracking-widest whitespace-nowrap">Or continue with</span>
              <div className="h-px bg-nexa-border flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <NexaButton variant="secondary" className="h-12 rounded-xl" leftIcon={<Chrome className="w-4 h-4" />}>
                Google
              </NexaButton>
              <NexaButton variant="secondary" className="h-12 rounded-xl" leftIcon={<Github className="w-4 h-4" />}>
                Github
              </NexaButton>
            </div>

            <p className="text-center text-sm text-nexa-text-secondary">
              Don't have an account?{" "}
              <Link href="/signup" className="text-nexa-brand font-bold hover:underline">
                Create Account
              </Link>
            </p>
          </NexaCard>
        </motion.div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
