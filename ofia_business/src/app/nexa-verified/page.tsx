"use client";

import React from "react";
import Link from "next/link";
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
import { Footer } from "@/components/nexa/Footer";
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
      <section className="relative min-h-screen flex items-center justify-start pt-32 overflow-hidden">
        {/* Background image & gradient blur overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img 
            src="/nexa-guaranteed-1.jpeg" 
            alt="Nexa Guaranteed background" 
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Water translucent blurry overlay resolving to zero opacity/blur to the right */}
          <div 
            className="absolute inset-0"
            style={{
              backdropFilter: 'blur(24px) saturate(220%) brightness(1.05)',
              WebkitBackdropFilter: 'blur(24px) saturate(220%) brightness(1.05)',
              maskImage: 'linear-gradient(to right, black 25%, transparent 75%)',
              WebkitMaskImage: 'linear-gradient(to right, black 25%, transparent 75%)'
            }}
          />
          {/* Vertical gradient tending towards the header area (reaches far right of the header) */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white via-white/90 to-transparent" />
          {/* Left horizontal gradient to shield text content */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 via-30% to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-12 lg:px-20 relative z-10 text-left flex flex-col items-start">
          <motion.div
            initial={{ rotate: 0, scale: 0 }}
            animate={{ rotate: 360, scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-20 h-20 bg-nexa-amber/10 rounded-full flex items-center justify-center mb-8 border border-nexa-amber/30 backdrop-blur-md shadow-lg"
          >
            <ShieldCheck className="w-10 h-10 text-nexa-amber" />
          </motion.div>

          <motion.h1 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-display text-slate-900 mb-6 tracking-tighter text-left leading-[1.1]"
          >
            <span className="block mb-2">
              {"Your Service.".split(" ").map((word, i) => (
                <motion.span key={`w1-${i}`} variants={itemVariants} className="inline-block mr-2">
                  {word}
                </motion.span>
              ))}
            </span>
            <span className="block">
              {"Guaranteed by Nexa.".split(" ").map((word, i) => (
                <motion.span key={`w2-${i}`} variants={itemVariants} className="inline-block mr-2 text-nexa-amber">
                  {word}
                </motion.span>
              ))}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-lg md:text-xl text-slate-700 max-w-2xl text-left mb-12"
          >
            NexaGuaranteed Technicians are background-checked, insured, and dispatched directly by NexaNG.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="flex flex-col lg:flex-row items-center justify-start gap-6 w-full"
          >
            <NexaButton size="xl" className="bg-nexa-amber text-white font-extrabold hover:bg-nexa-amber/90 border-none shadow-xl w-full lg:w-auto px-10">
              Book a NexaGuaranteed Technician
            </NexaButton>
            <button className="flex items-center gap-2 text-slate-700 font-bold uppercase tracking-widest text-xs hover:text-nexa-brand transition-colors group">
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
                {React.cloneElement(pillar.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
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
                <div className="text-[120px] font-black text-slate-900/5 dark:text-white/5 absolute -top-6 -right-4 select-none pointer-events-none leading-none">
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

        <div className="liquid-glass p-12 rounded-3xl bg-nexa-brand text-white overflow-hidden relative group max-w-fit mx-auto">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full -mr-64 -mt-64 blur-[100px] group-hover:scale-110 transition-transform duration-1000" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full overflow-hidden bg-white/10 border border-white/20 mb-6 w-max">
                <ShieldCheck className="w-4 h-4 text-white" />
                <span className="text-[10px] font-extrabold text-white uppercase tracking-wider relative z-10">
                  NexaGuaranteed
                </span>
              </div>
              <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6">Are you a professional?</h2>
              <p className="text-lg text-white font-medium leading-relaxed">
                Join the NexaGuaranteed team and get dispatched to high-value jobs. We provide the tools, the trust, and the customers.
              </p>
            </div>
            <Link href="/join/technician" className="w-full lg:w-auto">
              <NexaButton size="xl" variant="secondary" className="bg-white text-nexa-brand hover:bg-slate-100 w-full" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Apply as a Technician
              </NexaButton>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <NexaBottomBar />
    </main>
  );
}
