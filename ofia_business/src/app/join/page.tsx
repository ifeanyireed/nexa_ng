"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Globe, 
  Users,
  MessageSquare,
  BarChart3,
  Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import Link from "next/link";

export default function SellerLandingPage() {
  const benefits = [
    {
      title: "Niche-Specific Hubs",
      desc: "Your business is listed in a dedicated marketplace for your industry, not a generic directory.",
      icon: <Globe className="w-6 h-6" />,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Verified Authority",
      desc: "Get the Nexa Verified badge and build instant trust with potential customers.",
      icon: <ShieldCheck className="w-6 h-6" />,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Direct Conversion",
      desc: "Receive bookings, messages, and calls directly through our high-converting niche hubs.",
      icon: <Zap className="w-6 h-6" />,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      title: "Built-in Marketing",
      desc: "Publish articles and deals to drive SEO and reach more customers in your city.",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "text-fuchsia-500",
      bg: "bg-fuchsia-500/10"
    }
  ];

  return (
    <main className="bg-nexa-bg-base min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-nexa-border">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-nexa-brand/5 blur-[120px] rounded-full -z-10" />
        
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 bg-nexa-brand/10 text-nexa-brand px-4 py-2 rounded-full border border-nexa-brand/20 mb-8">
              <Award className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">Partner with Nexa</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-display mb-8 leading-[1.1]">
              Grow your business in your <br />
              <span className="text-nexa-brand">Dedicated Niche.</span>
            </h1>
            
            <p className="text-xl text-nexa-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
              Join 10k+ verified professionals across Nigeria. Get listed in a marketplace built specifically for your industry.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/join/register">
                <NexaButton size="lg" className="h-16 px-12 text-lg rounded-2xl shadow-2xl shadow-nexa-brand/20">
                  Join as a Seller
                </NexaButton>
              </Link>
              <NexaButton variant="secondary" size="lg" className="h-16 px-12 text-lg rounded-2xl">
                How it Works
              </NexaButton>
            </div>

            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 text-nexa-text-faint text-sm font-bold uppercase tracking-widest">
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free Registration</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Professional Dashboard</span>
              <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Direct Lead Delivery</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* BENEFITS GRID */}
      <section className="py-24 bg-nexa-bg-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-extrabold text-display mb-4">Why Choose NexaNG?</h2>
            <p className="text-nexa-text-secondary">We provide the infrastructure so you can focus on your craft.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <NexaCard className="h-full p-8 group hover:border-nexa-brand/50 transition-all">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", benefit.bg, benefit.color)}>
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                  <p className="text-nexa-text-secondary leading-relaxed">{benefit.desc}</p>
                </NexaCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <NexaCard variant="glass" className="bg-gradient-to-br from-nexa-brand to-nexa-brand-mid text-white p-12 md:p-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-20 -mt-20" />
            
            <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
              <div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-display mb-8">Ready to take your business online?</h2>
                <p className="text-white/80 text-xl mb-12 leading-relaxed">
                  "Since joining the Home Services niche on Nexa, my plumbing business has seen a 40% increase in verified bookings. The dashboard makes it easy to manage everything."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-xl">OA</div>
                  <div>
                    <p className="font-bold text-lg">Oluwaseun Adeyemi</p>
                    <p className="text-white/60">Verified Plumber • Lagos</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <NexaCard className="bg-white/10 border-white/20 p-8 text-center backdrop-blur-md">
                  <h4 className="text-3xl font-extrabold mb-2 text-white">40%</h4>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Revenue Growth</p>
                </NexaCard>
                <NexaCard className="bg-white/10 border-white/20 p-8 text-center backdrop-blur-md">
                  <h4 className="text-3xl font-extrabold mb-2 text-white">10k+</h4>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Active Sellers</p>
                </NexaCard>
                <NexaCard className="bg-white/10 border-white/20 p-8 text-center backdrop-blur-md">
                  <h4 className="text-3xl font-extrabold mb-2 text-white">50k+</h4>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Monthly Leads</p>
                </NexaCard>
                <NexaCard className="bg-white/10 border-white/20 p-8 text-center backdrop-blur-md">
                  <h4 className="text-3xl font-extrabold mb-2 text-white">#1</h4>
                  <p className="text-white/60 text-xs font-bold uppercase tracking-wider">Finder Platform</p>
                </NexaCard>
              </div>
            </div>
          </NexaCard>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-24 bg-nexa-bg-surface">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-display mb-8">Stop being just another name in a directory.</h2>
          <p className="text-xl text-nexa-text-secondary mb-12 max-w-2xl mx-auto">
            Build authority in your specific niche marketplace today. Registration takes less than 2 minutes.
          </p>
          <Link href="/join/register">
            <NexaButton size="lg" className="h-16 px-16 text-lg rounded-2xl shadow-xl shadow-nexa-brand/20">
              Get Started for Free
            </NexaButton>
          </Link>
        </div>
      </section>

      <NexaBottomBar />
    </main>
  );
}
