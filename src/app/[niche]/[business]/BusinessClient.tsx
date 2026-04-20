"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
import { BookingModal } from "@/components/nexa/BookingModal";
import { NICHE_DETAILS } from "@/lib/niche-data";

export default function BusinessClient({ data }: { data: any }) {
  const params = useParams();
  const businessSlug = params.business as string;
  
  const [activeTab, setActiveTab] = useState("about");
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | undefined>(undefined);

  const businessName = businessSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const handleBook = (service?: string) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-32 lg:pb-12">
      <NexaNavbar />
      
      {/* COVER & PROFILE HEADER */}
      <section className="relative">
         <div className={cn("h-64 md:h-96 w-full relative overflow-hidden", data.colorClass)}>
            <div className="absolute inset-0 bg-black/20" />
            <img 
              src={data.products[0]?.image || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=1200"} 
              alt="Cover" 
              className="w-full h-full object-cover mix-blend-overlay opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-nexa-bg-base via-transparent to-transparent" />
         </div>

         <div className="container mx-auto px-4">
            <div className="relative -mt-24 md:-mt-32 flex flex-col md:flex-row items-end gap-6 mb-12">
               <div className="w-32 h-32 md:w-48 md:h-48 rounded-[40px] bg-white dark:bg-slate-800 p-2 shadow-2xl z-10">
                  <div className={cn("w-full h-full rounded-[32px] flex items-center justify-center text-5xl md:text-7xl font-extrabold text-white shadow-inner", data.colorClass)}>
                    {businessName.charAt(0)}
                  </div>
               </div>
               
               <div className="flex-1 pb-4">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                     <h1 className="text-3xl md:text-5xl font-extrabold text-display tracking-tight">
                       {businessName}
                     </h1>
                     <div className="flex items-center gap-1 bg-nexa-brand/10 text-nexa-brand px-3 py-1 rounded-full border border-nexa-brand/20">
                        <ShieldCheck className="w-4 h-4 fill-current" />
                        <span className="text-xs font-bold uppercase tracking-wider">Verified</span>
                     </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-nexa-text-secondary">
                     <div className="flex items-center gap-1.5">
                        <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                        <span className="text-nexa-text-primary text-lg">4.9</span>
                        <span className="text-nexa-text-faint">(124 reviews)</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <MapPin className="w-5 h-5 text-nexa-brand" />
                        <span>Lekki Phase 1, Lagos</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-xs">Open Now</span>
                     </div>
                  </div>
               </div>

               <div className="hidden lg:flex items-center gap-3 pb-4">
                  <NexaButton variant="secondary" size="lg" className="px-8" leftIcon={<MessageSquare className="w-5 h-5" />}>Chat</NexaButton>
                  <NexaButton size="lg" className="px-8 shadow-xl shadow-nexa-brand/20" leftIcon={<Calendar className="w-5 h-5" />} onClick={() => handleBook()}>Book Now</NexaButton>
               </div>
            </div>
         </div>
      </section>

      {/* TABS NAVIGATION */}
      <section className="border-y border-nexa-border bg-nexa-bg-surface/80 backdrop-blur-xl sticky top-[72px] z-30">
         <div className="container mx-auto px-4">
            <div className="flex items-center gap-8 h-16 overflow-x-auto no-scrollbar">
               {["about", "services", "gallery", "reviews", "shop"].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "h-full px-4 text-sm font-bold uppercase tracking-[0.2em] transition-all relative whitespace-nowrap",
                      activeTab === tab ? "text-nexa-brand" : "text-nexa-text-faint hover:text-nexa-text-secondary"
                    )}
                  >
                    {tab}
                    {activeTab === tab && (
                      <motion.div layoutId="profile-tab" className="absolute bottom-0 left-0 right-0 h-1 bg-nexa-brand rounded-t-full" />
                    )}
                  </button>
               ))}
            </div>
         </div>
      </section>

      <div className="container mx-auto px-4 py-16">
         <div className="flex flex-col lg:row gap-16">
            {/* MAIN CONTENT */}
            <div className="flex-1 space-y-20">
               <AnimatePresence mode="wait">
                  {activeTab === "about" && (
                     <motion.div 
                        key="about"
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-16"
                     >
                        <section>
                           <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-3">
                              <div className={cn("w-1.5 h-8 rounded-full", data.colorClass)} />
                              About {businessName}
                           </h2>
                           <p className="text-nexa-text-secondary leading-relaxed text-xl max-w-4xl">
                              We are a premier {data.name.toLowerCase()} business dedicated to providing top-notch services in Lagos. With over 10 years of experience, our team of certified professionals ensures every job is done to perfection using the best industry tools.
                           </p>
                        </section>
                        
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <NexaCard variant="glass" className="p-8 border-none bg-nexa-bg-surface/50">
                              <h3 className="font-bold text-lg mb-6 flex items-center gap-3">
                                 <Clock className="w-6 h-6 text-nexa-brand" />
                                 Working Hours
                              </h3>
                              <div className="space-y-4">
                                 {["Monday - Friday", "Saturday", "Sunday"].map((day, i) => (
                                    <div key={day} className="flex justify-between items-center pb-3 border-b border-nexa-border last:border-0 last:pb-0">
                                       <span className="text-nexa-text-secondary font-medium">{day}</span>
                                       <span className={cn("font-bold", i === 2 ? "text-nexa-text-faint" : "text-nexa-text-primary")}>
                                          {i === 2 ? "Closed" : "08:00 AM - 06:00 PM"}
                                       </span>
                                    </div>
                                 ))}
                              </div>
                           </NexaCard>
                           
                           <NexaCard variant="glass" className="p-8 border-none bg-nexa-bg-surface/50">
                              <h3 className="font-bold text-lg mb-6 flex items-center gap-3">
                                 <ShieldCheck className="w-6 h-6 text-nexa-brand" />
                                 Trust & Safety
                              </h3>
                              <div className="space-y-5">
                                 {[
                                    { icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, text: "CAC Verified & Registered" },
                                    { icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, text: "Accepts POS & Bank Transfers" },
                                    { icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, text: "Nexa Secure Payment Protected" },
                                    { icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />, text: "Verified Physical Address" }
                                 ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 text-sm font-bold">
                                       {item.icon}
                                       <span>{item.text}</span>
                                    </div>
                                 ))}
                              </div>
                           </NexaCard>
                        </section>
                     </motion.div>
                  )}

                  {activeTab === "services" && (
                     <motion.div 
                        key="services"
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid gap-6"
                     >
                        <h2 className="text-2xl font-extrabold mb-4 flex items-center gap-3">
                           <div className={cn("w-1.5 h-8 rounded-full", data.colorClass)} />
                           Service Menu
                        </h2>
                        {data.subServices.map((service: string, i: number) => (
                           <NexaCard key={i} variant="interactive" className="flex items-center justify-between p-8 group">
                              <div className="flex items-center gap-6">
                                 <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform", data.colorClass)}>
                                    <Tag className="w-8 h-8" />
                                 </div>
                                 <div>
                                    <h3 className="font-bold text-xl mb-1">{service}</h3>
                                    <p className="text-nexa-text-secondary">Standard {service.toLowerCase()} package including professional inspection and basic parts.</p>
                                 </div>
                              </div>
                              <div className="text-right flex flex-col items-end gap-3">
                                 <div>
                                    <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest mb-1">Starting at</p>
                                    <p className="text-2xl font-extrabold text-nexa-brand">₦{((i+1)*5000 + 2500).toLocaleString()}</p>
                                 </div>
                                 <NexaButton size="sm" variant="secondary" onClick={() => handleBook(service)}>Book Service</NexaButton>
                              </div>
                           </NexaCard>
                        ))}
                     </motion.div>
                  )}

                  {activeTab === "gallery" && (
                     <motion.div 
                        key="gallery"
                        initial={{ opacity: 0, scale: 0.98 }} 
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-8"
                     >
                        <h2 className="text-2xl font-extrabold mb-4 flex items-center gap-3">
                           <div className={cn("w-1.5 h-8 rounded-full", data.colorClass)} />
                           Work Portfolio
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                           {[...Array(9)].map((_, i) => (
                              <div key={i} className="aspect-square rounded-[32px] bg-slate-200 overflow-hidden group cursor-pointer relative shadow-lg">
                                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors z-10" />
                                 <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                                 <img 
                                    src={`https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?auto=format&fit=crop&q=80&w=400`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    alt="Portfolio"
                                 />
                              </div>
                           ))}
                        </div>
                     </motion.div>
                  )}

                  {activeTab === "reviews" && (
                     <motion.div 
                        key="reviews"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="space-y-12"
                     >
                        <div className="flex flex-col md:flex-row gap-12 items-center pb-12 border-b border-nexa-border">
                           <div className="text-center md:text-left">
                              <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-[0.3em] mb-2">Average Rating</p>
                              <div className="flex items-center gap-4">
                                 <span className="text-7xl font-extrabold">4.9</span>
                                 <div>
                                    <div className="flex gap-1 mb-1">
                                       {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />)}
                                    </div>
                                    <p className="text-sm font-bold text-nexa-text-secondary">Based on 124 reviews</p>
                                 </div>
                              </div>
                           </div>
                           <div className="flex-1 w-full space-y-3">
                              {[5, 4, 3, 2, 1].map((star) => (
                                 <div key={star} className="flex items-center gap-4">
                                    <span className="text-xs font-bold w-4">{star}</span>
                                    <div className="flex-1 h-2 bg-nexa-bg-surface rounded-full overflow-hidden">
                                       <div 
                                          className={cn("h-full", data.colorClass)} 
                                          style={{ width: `${star === 5 ? 85 : star === 4 ? 12 : 1}%` }} 
                                       />
                                    </div>
                                    <span className="text-xs font-bold text-nexa-text-faint w-8">{star === 5 ? "85%" : star === 4 ? "12%" : "1%"}</span>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-8">
                           {[1, 2, 3].map(i => (
                              <NexaCard key={i} variant="flat" className="p-8 border-none bg-nexa-bg-surface/30">
                                 <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                       <div className="w-12 h-12 rounded-2xl bg-nexa-brand/10 flex items-center justify-center font-extrabold">JD</div>
                                       <div>
                                          <p className="font-bold">Customer {i}</p>
                                          <p className="text-[10px] text-nexa-text-faint uppercase font-bold">2 days ago • Verified Booking</p>
                                       </div>
                                    </div>
                                    <div className="flex gap-0.5">
                                       {[...Array(5)].map((_, idx) => <Star key={idx} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />)}
                                    </div>
                                 </div>
                                 <p className="text-nexa-text-secondary leading-relaxed">
                                    "Absolutely fantastic experience! The team was professional, arrived on time, and finished the work ahead of schedule. Would highly recommend to anyone in Lekki looking for quality {data.name.toLowerCase()}."
                                 </p>
                              </NexaCard>
                           ))}
                        </div>
                     </motion.div>
                  )}

                  {activeTab === "shop" && (
                     <motion.div 
                        key="shop"
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                     >
                        <h2 className="text-2xl font-extrabold mb-4 flex items-center gap-3">
                           <div className={cn("w-1.5 h-8 rounded-full", data.colorClass)} />
                           Storefront
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                           {data.products.map((product: any, i: number) => (
                              <NexaCard key={i} variant="flat" padding="none" className="group overflow-hidden flex flex-col h-full bg-nexa-bg-surface/50 border-none shadow-sm">
                                 <div className="aspect-square relative overflow-hidden bg-white">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    <div className="absolute bottom-3 right-3 translate-y-12 group-hover:translate-y-0 transition-transform">
                                       <Link href={`/${params.niche}/${businessSlug}/shop`}>
                                          <NexaButton size="sm" className="shadow-xl">View in Shop</NexaButton>
                                       </Link>
                                    </div>
                                 </div>
                                 <div className="p-4 flex-1 flex flex-col">
                                    <h4 className="font-bold text-sm mb-1 line-clamp-2">{product.name}</h4>
                                    <p className="text-nexa-brand font-extrabold mt-auto">{product.price}</p>
                                 </div>
                              </NexaCard>
                           ))}
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>

            {/* SIDEBAR */}
            <aside className="w-full lg:w-[400px] space-y-8">
               <NexaCard variant="glass" className="p-8 sticky top-40 border-none shadow-2xl bg-nexa-bg-surface/80 backdrop-blur-2xl">
                  <h3 className="text-xl font-extrabold mb-8 pb-4 border-b border-nexa-border flex items-center gap-3">
                     Contact Information
                  </h3>
                  <div className="space-y-8">
                     <button className="w-full h-16 rounded-[24px] bg-emerald-500 text-white font-extrabold flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-transform active:scale-95">
                        <MessageSquare className="w-6 h-6 fill-white" />
                        Message on WhatsApp
                     </button>
                     
                     <div className="space-y-6">
                        {[
                           { icon: <Phone className="w-5 h-5 text-nexa-brand" />, label: "Call Us", value: "+234 803 000 0000" },
                           { icon: <Globe className="w-5 h-5 text-nexa-brand" />, label: "Website", value: "www.business.ng" },
                           { icon: <Navigation className="w-5 h-5 text-nexa-brand" />, label: "Location", value: "Lekki Phase 1, Lagos" }
                        ].map((item, i) => (
                           <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-nexa-bg-base/50 hover:bg-white transition-colors cursor-pointer group">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                 {item.icon}
                              </div>
                              <div>
                                 <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest mb-0.5">{item.label}</p>
                                 <p className="font-bold text-nexa-text-primary">{item.value}</p>
                              </div>
                           </div>
                        ))}
                     </div>

                     <div className="pt-8 border-t border-nexa-border flex items-center justify-center gap-6">
                        <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center text-nexa-text-faint hover:text-pink-500 hover:scale-110 transition-all cursor-pointer shadow-sm">
                           <Instagram className="w-5 h-5" />
                        </div>
                        <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center text-nexa-text-faint hover:text-blue-400 hover:scale-110 transition-all cursor-pointer shadow-sm">
                           <Twitter className="w-5 h-5" />
                        </div>
                        <div className="w-12 h-12 rounded-full liquid-glass flex items-center justify-center text-nexa-text-faint hover:text-blue-600 hover:scale-110 transition-all cursor-pointer shadow-sm">
                           <Globe className="w-5 h-5" />
                        </div>
                     </div>
                  </div>
               </NexaCard>
            </aside>
         </div>
      </div>

      {/* MOBILE CONVERSION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-nexa-border p-4 px-6 flex items-center gap-4">
         <button className="w-14 h-14 rounded-2xl bg-nexa-bg-surface border border-nexa-border flex items-center justify-center text-nexa-text-secondary active:scale-95 transition-transform">
            <MessageSquare className="w-6 h-6" />
         </button>
         <NexaButton size="lg" className="flex-1 h-14 rounded-2xl shadow-xl shadow-nexa-brand/20 font-extrabold text-lg" onClick={() => handleBook()}>
            Book Now
         </NexaButton>
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        businessName={businessName}
        serviceName={selectedService}
      />

      <NexaBottomBar />
    </main>
  );
}
