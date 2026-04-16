"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Star, 
  Clock, 
  Phone, 
  MessageSquare, 
  Navigation, 
  ShieldCheck, 
  CheckCircle2, 
  Globe, 
  Instagram, 
  Twitter,
  Calendar,
  Image as ImageIcon,
  Info,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaRating } from "@/components/nexa/NexaRating";
import { NICHE_DETAILS } from "@/lib/niche-data";

export default function BusinessProfilePage() {
  const params = useParams();
  const nicheSlug = params.niche as string;
  const businessSlug = params.business as string;
  const data = NICHE_DETAILS[nicheSlug] || NICHE_DETAILS["home-services"];
  
  const [activeTab, setActiveTab] = useState("about");

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-0">
      <NexaNavbar />
      
      {/* COVER & PROFILE HEADER */}
      <section className="relative">
         <div className="h-64 md:h-80 bg-slate-300 w-full relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
         </div>
         <div className="container mx-auto px-4">
            <div className="relative -mt-20 flex flex-col md:flex-row items-end gap-6 mb-8">
               <div className="w-40 h-40 rounded-[40px] bg-white p-2 shadow-2xl z-10">
                  <div className="w-full h-full rounded-[32px] bg-nexa-brand/10 flex items-center justify-center text-4xl font-extrabold text-nexa-brand">
                    {businessSlug.charAt(0).toUpperCase()}
                  </div>
               </div>
               <div className="flex-1 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                     <h1 className="text-3xl md:text-4xl font-extrabold text-display text-white md:text-nexa-text-primary drop-shadow-sm md:drop-shadow-none">
                       {businessSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                     </h1>
                     <ShieldCheck className="w-6 h-6 text-nexa-brand" />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                     <div className="flex items-center gap-1 text-nexa-brand">
                        <Star className="w-4 h-4 fill-current" />
                        <span>4.9 (124 reviews)</span>
                     </div>
                     <div className="flex items-center gap-1 text-nexa-text-secondary">
                        <MapPin className="w-4 h-4" />
                        <span>Lekki Phase 1, Lagos</span>
                     </div>
                     <NexaBadge variant="success">Open Now</NexaBadge>
                  </div>
               </div>
               <div className="flex items-center gap-3 pb-4">
                  <NexaButton variant="secondary" leftIcon={<MessageSquare className="w-4 h-4" />}>Chat</NexaButton>
                  <NexaButton leftIcon={<Calendar className="w-4 h-4" />}>Book Now</NexaButton>
               </div>
            </div>
         </div>
      </section>

      {/* TABS & CONTENT */}
      <section className="border-y border-nexa-border bg-nexa-bg-surface sticky top-16 md:top-20 z-20">
         <div className="container mx-auto px-4">
            <div className="flex items-center gap-8 h-14">
               {["about", "services", "gallery", "reviews", "shop"].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "h-full px-2 text-sm font-bold uppercase tracking-widest transition-all relative",
                      activeTab === tab ? "text-nexa-brand" : "text-nexa-text-faint hover:text-nexa-text-secondary"
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-nexa-brand" />
                    )}
                  </button>
               ))}
            </div>
         </div>
      </section>

      <div className="container mx-auto px-4 py-12">
         <div className="flex flex-col lg:flex-row gap-12">
            {/* MAIN CONTENT */}
            <div className="flex-1 space-y-12">
               {activeTab === "about" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                     <section>
                        <h2 className="text-xl font-bold mb-4">About the Business</h2>
                        <p className="text-nexa-text-secondary leading-relaxed text-lg">
                           We are a premier {data.name.toLowerCase()} business dedicated to providing top-notch services in Lagos. With over 10 years of experience, our team of certified professionals ensures every job is done to perfection.
                        </p>
                     </section>
                     
                     <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <NexaCard variant="flat" className="p-6">
                           <h3 className="font-bold mb-4 flex items-center gap-2">
                              <Clock className="w-5 h-5 text-nexa-brand" />
                              Working Hours
                           </h3>
                           <div className="space-y-2 text-sm">
                              {["Mon - Fri", "Sat", "Sun"].map((day, i) => (
                                 <div key={day} className="flex justify-between">
                                    <span className="text-nexa-text-secondary">{day}</span>
                                    <span className="font-bold">{i === 2 ? "Closed" : "08:00 AM - 06:00 PM"}</span>
                                 </div>
                              ))}
                           </div>
                        </NexaCard>
                        <NexaCard variant="flat" className="p-6">
                           <h3 className="font-bold mb-4 flex items-center gap-2">
                              <Info className="w-5 h-5 text-nexa-brand" />
                              Business Info
                           </h3>
                           <div className="space-y-3">
                              <div className="flex items-center gap-3 text-sm">
                                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                 <span>CAC Verified Business</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                 <span>Accepts POS & Transfers</span>
                              </div>
                              <div className="flex items-center gap-3 text-sm">
                                 <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                 <span>Home Service Available</span>
                              </div>
                           </div>
                        </NexaCard>
                     </section>
                  </motion.div>
               )}

               {activeTab === "services" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4">
                     {data.subServices.map((service, i) => (
                        <NexaCard key={i} variant="interactive" className="flex items-center justify-between p-6">
                           <div>
                              <h3 className="font-bold text-lg mb-1">{service}</h3>
                              <p className="text-sm text-nexa-text-secondary">Standard service with professional tools.</p>
                           </div>
                           <div className="text-right">
                              <p className="text-lg font-extrabold text-nexa-brand mb-1">From ₦{((i+1)*5000).toLocaleString()}</p>
                              <NexaButton size="sm" variant="ghost">Details</NexaButton>
                           </div>
                        </NexaCard>
                     ))}
                  </motion.div>
               )}

               {activeTab === "gallery" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 md:grid-cols-3 gap-4">
                     {[...Array(9)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-2xl bg-slate-200 overflow-hidden group cursor-pointer">
                           <div className="w-full h-full group-hover:scale-110 transition-transform duration-500 bg-slate-300" />
                        </div>
                     ))}
                  </motion.div>
               )}
            </div>

            {/* SIDEBAR */}
            <aside className="w-full lg:w-96 space-y-8">
               <NexaCard variant="glass" className="p-8 sticky top-36">
                  <h3 className="text-xl font-bold mb-6">Contact Information</h3>
                  <div className="space-y-6">
                     <button className="w-full h-14 rounded-2xl bg-emerald-500 text-white font-bold flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-transform">
                        <MessageSquare className="w-5 h-5 fill-white" />
                        Message on WhatsApp
                     </button>
                     <div className="space-y-4">
                        <div className="flex items-center gap-4 text-nexa-text-secondary">
                           <Phone className="w-5 h-5" />
                           <span className="font-medium">+234 803 000 0000</span>
                        </div>
                        <div className="flex items-center gap-4 text-nexa-text-secondary">
                           <Globe className="w-5 h-5" />
                           <span className="font-medium">www.business.ng</span>
                        </div>
                        <div className="flex items-center gap-4 text-nexa-text-secondary">
                           <Navigation className="w-5 h-5" />
                           <span className="font-medium">Get Directions</span>
                        </div>
                     </div>
                     <div className="pt-6 border-t border-nexa-border flex items-center gap-4">
                        <Instagram className="w-5 h-5 text-nexa-text-faint hover:text-pink-500 cursor-pointer" />
                        <Twitter className="w-5 h-5 text-nexa-text-faint hover:text-blue-400 cursor-pointer" />
                     </div>
                  </div>
               </NexaCard>
            </aside>
         </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
