"use client";

import React from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { 
  ShieldCheck, 
  Award, 
  Star, 
  MapPin, 
  MessageSquare, 
  Wallet,
  ArrowRight,
  ChevronDown
} from "lucide-react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaVerifiedBadge } from "@/components/nexa/NexaVerifiedBadge";
import { cn } from "@/lib/utils";

const Counter = ({ value, label }: { value: string; label: string }) => {
  const displayValue = value.replace(/[,+★]/g, "");
  const numValue = parseInt(displayValue);
  const spring = useSpring(0, { stiffness: 40, damping: 20 });
  const display = useTransform(spring, (current) => {
    const formatted = Math.floor(current).toLocaleString();
    return value.replace(displayValue, formatted);
  });

  React.useEffect(() => {
    spring.set(numValue);
  }, [numValue, spring]);

  return (
    <div className="text-center">
      <motion.div className="text-3xl lg:text-5xl font-extrabold text-display mb-2 text-nexa-amber">
        <motion.span>{display}</motion.span>
      </motion.div>
      <p className="text-xs font-bold text-nexa-text-faint uppercase tracking-widest">{label}</p>
    </div>
  );
};

export default function NexaVerifiedLanding() {
  const trustPillars = [
    { icon: <ShieldCheck />, title: "Background Verified", body: "Every Nexa technician passes a police clearance check and identity verification before their first job." },
    { icon: <Award />, title: "Skills Certified", body: "Techs complete a NexaNG assessment and practical skills test for their trade category." },
    { icon: <Star />, title: "Service Guaranteed", body: "If you're not satisfied, we'll send another technician or refund you. No questions." },
    { icon: <MapPin />, title: "Real-Time Tracking", body: "Watch your technician travel to you live on a map. Know exactly when they'll arrive." },
    { icon: <MessageSquare />, title: "Direct Nexa Support", body: "Chat directly with our operations team before, during, and after your service." },
    { icon: <Wallet />, title: "Secure Payment", body: "Pay securely via Paystack. Funds held in escrow — released only when job is confirmed complete." },
  ];

  const steps = [
    { title: "Choose your service", body: "Search within your niche and select the 'NexaVerified' filter." },
    { title: "See available techs", body: "View profiles, ratings, Nexa ID, and real-time availability." },
    { title: "Book and pay", body: "Secure escrow payment via Paystack with instant confirmation." },
    { title: "Track & receive", body: "Watch them arrive live, receive service, and confirm completion." },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen">
      <NexaNavbar />
      
      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B1120] pt-20">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-nexa-brand/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-nexa-amber/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ rotate: 0, scale: 0 }}
            animate={{ rotate: 360, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-24 h-24 lg:w-32 lg:h-32 bg-nexa-amber/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-nexa-amber/20 backdrop-blur-xl"
          >
            <ShieldCheck className="w-12 h-12 lg:w-16 lg:h-16 text-nexa-amber" />
          </motion.div>

          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-4xl lg:text-7xl font-extrabold text-display text-white mb-6 tracking-tight"
          >
            {"Your Service. Guaranteed by Nexa.".split(" ").map((word, i) => (
              <motion.span key={i} variants={itemVariants} className="inline-block mr-3">
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-12"
          >
            NexaVerified technicians are background-checked, insured, and dispatched directly by NexaNG.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col lg:flex-row items-center justify-center gap-6"
          >
            <NexaButton size="xl" className="bg-nexa-amber hover:bg-nexa-amber/90 border-nexa-amber/30 w-full lg:w-auto">
              Book a NexaVerified Technician
            </NexaButton>
            <button className="flex items-center gap-2 text-white font-bold uppercase tracking-widest text-xs group">
              How it works 
              <ChevronDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* TRUST PILLARS */}
      <section className="py-24 lg:py-32 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trustPillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="liquid-glass p-8 rounded-2xl group hover:border-nexa-amber/30 transition-all"
            >
              <div className="w-12 h-12 rounded-xl bg-nexa-amber/10 flex items-center justify-center text-nexa-amber mb-6 group-hover:scale-110 transition-transform">
                {React.cloneElement(pillar.icon as React.ReactElement, { className: "w-6 h-6" })}
              </div>
              <h3 className="text-xl font-extrabold mb-4 text-display">{pillar.title}</h3>
              <p className="text-sm text-nexa-text-secondary leading-relaxed">{pillar.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 lg:py-32 bg-nexa-bg-surface border-y border-nexa-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-3xl lg:text-5xl font-extrabold text-display mb-6">Simple, Secure, Seamless.</h2>
            <p className="text-nexa-text-muted max-w-xl mx-auto font-medium">Getting professional help has never been this transparent or reliable.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative"
              >
                <div className="text-[120px] font-black text-nexa-brand/5 absolute -top-16 -left-4 select-none">
                  {i + 1}
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-nexa-brand text-white flex items-center justify-center font-black mb-6 shadow-lg shadow-nexa-brand/20">
                    {i + 1}
                  </div>
                  <h4 className="text-lg font-extrabold mb-3 text-display">{step.title}</h4>
                  <p className="text-sm text-nexa-text-secondary leading-relaxed">{step.body}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-[2px] bg-gradient-to-r from-nexa-brand/20 to-transparent -ml-6" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF / COUNTERS */}
      <section className="py-24 lg:py-32 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-24">
          <Counter value="12,400+" label="Jobs Completed" />
          <Counter value="4.9★" label="Average Rating" />
          <Counter value="98%" label="On-Time Rate" />
        </div>

        <div className="liquid-glass p-12 rounded-3xl bg-nexa-brand text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full -mr-64 -mt-64 blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <NexaVerifiedBadge className="bg-white/10 border-white/20 mb-6" />
              <h2 className="text-3xl lg:text-5xl font-extrabold text-display mb-6">Are you a professional?</h2>
              <p className="text-lg text-white/80 font-medium leading-relaxed">
                Join the NexaVerified team and get dispatched to high-value jobs. We provide the tools, the trust, and the customers.
              </p>
            </div>
            <NexaButton size="xl" variant="secondary" className="bg-white text-nexa-brand hover:bg-slate-100 w-full lg:w-auto" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Apply as a Technician
            </NexaButton>
          </div>
        </div>
      </section>

      <NexaBottomBar />
    </main>
  );
}
