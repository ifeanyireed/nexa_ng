"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Star, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  MessageSquare,
  Share2,
  Heart,
  Calendar,
  ChevronRight,
  ArrowRight,
  Info,
  Phone,
  Mail,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  ShoppingBag,
  Award
} from "lucide-react";
import { cn, getProImage } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaRating } from "@/components/nexa/NexaRating";
import { BookingModal } from "@/components/nexa/BookingModal";
import { NexaVerifiedBadge } from "@/components/nexa/NexaVerifiedBadge";
import { api } from "@/lib/api";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getNicheData } from "@/lib/niche-data";

interface BusinessClientProps {
  data: any;
  businessSlug: string;
}

export default function BusinessClient({ data, businessSlug }: BusinessClientProps) {
  const params = useParams();
  const service = params.service as string;
  const state = params.state as string;
  const lga = params.lga as string;

  const [pro, setPro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const proId = businessSlug.includes("business-") 
    ? businessSlug.split("business-")[1] 
    : businessSlug;

  useEffect(() => {
    const fetchPro = async () => {
      try {
        const result = await api.get(`/discovery/pros/${proId}`);
        setPro(result);
      } catch (error) {
        console.error("Error fetching pro:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPro();
  }, [proId]);

  if (loading) {
    return (
      <main className="bg-nexa-bg-base min-h-screen pt-32 pb-24">
        <NexaNavbar />
        <div className="container mx-auto px-4 animate-pulse space-y-8">
           <div className="h-64 bg-nexa-bg-surface rounded-[40px]" />
           <div className="h-32 bg-nexa-bg-surface rounded-[32px] w-2/3" />
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-2 h-96 bg-nexa-bg-surface rounded-[32px]" />
              <div className="h-96 bg-nexa-bg-surface rounded-[32px]" />
           </div>
        </div>
      </main>
    );
  }

  const nicheData = pro ? getNicheData(pro.niche) : data;

  if (!pro) {
    return (
      <main className="bg-nexa-bg-base min-h-screen flex items-center justify-center pt-32 pb-24">
        <NexaNavbar />
        <div className="text-center space-y-6">
           <div className="w-24 h-24 rounded-full bg-nexa-bg-surface flex items-center justify-center mx-auto text-nexa-text-faint">
              <Info className="w-12 h-12" />
           </div>
           <h2 className="text-3xl font-extrabold text-display">Business Not Found</h2>
           <p className="text-nexa-text-secondary">The professional profile you are looking for does not exist or has been moved.</p>
           <Link href={`/${nicheData.id}`}>
              <NexaButton variant="secondary">Back to {nicheData.name}</NexaButton>
           </Link>
        </div>
      </main>
    );
  }

  const handleBookNow = (service?: any) => {
    setSelectedService(service);
    setIsBookingOpen(true);
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
        
        {/* HERO SECTION */}
        <section className="relative pt-32 pb-12 overflow-hidden">
          {/* Category Background Cover */}
          <div className="absolute inset-0 z-0 select-none opacity-20">
            <img 
              src={getProImage(pro.specialties, pro.subService)} 
              className="w-full h-full object-cover blur-[2px]" 
              alt="Profile Cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-nexa-bg-base via-nexa-bg-base/70 to-transparent" />
          </div>
           <div className={cn("absolute inset-0 opacity-20 blur-3xl z-0", nicheData.colorClass)} />
          
          <div className="container mx-auto px-4 relative z-10">
             <div className="flex flex-col lg:flex-row gap-12 items-start lg:items-end">
                <div className="relative group">
                   <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-nexa-border shadow-xl relative z-10">
                      <img 
                        src={pro.logoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"} 
                        alt={pro.user?.name} 
                        className="w-full h-full object-cover" 
                      />
                   </div>
                   {pro.verified && (
                      <div className="absolute -bottom-2 -right-2 z-20">
                         <NexaVerifiedBadge size="lg" />
                      </div>
                   )}
                </div>
                
                <div className="space-y-4 flex-1">
                   <div className="flex flex-wrap items-center gap-3">
                      <NexaBadge variant="neutral" className="bg-nexa-bg-surface border-nexa-border uppercase tracking-widest text-[10px]">{nicheData.name}</NexaBadge>
                     <div className="flex items-center gap-1 text-sm font-bold text-nexa-text-primary bg-nexa-bg-surface px-3 py-1 rounded-full border border-nexa-border">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        {pro.rating || "0.0"}
                        <span className="text-nexa-text-faint ml-1 font-medium">({Math.floor(Math.random() * 50) + 10} Reviews)</span>
                     </div>
                  </div>

                  <h1 className="text-4xl md:text-6xl font-extrabold text-display tracking-tight">{pro.user?.name}</h1>
                  
                  <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-nexa-text-secondary">
                     <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Lagos, Nigeria
                     </div>
                     <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Response Time: &lt; 2hrs
                     </div>
                     <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        {Math.floor(Math.random() * 100) + 50}+ Jobs Completed
                     </div>
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                  <NexaButton 
                     size="lg" 
                     className="h-16 px-10 rounded-2xl shadow-xl shadow-nexa-brand/20"
                     onClick={() => handleBookNow()}
                  >
                     Book Direct
                  </NexaButton>
                  <div className="flex gap-2">
                     <button className="w-16 h-16 rounded-2xl bg-nexa-bg-surface border border-nexa-border flex items-center justify-center hover:bg-nexa-bg-base transition-colors">
                        <MessageSquare className="w-6 h-6" />
                     </button>
                     <button className="w-16 h-16 rounded-2xl bg-nexa-bg-surface border border-nexa-border flex items-center justify-center hover:bg-nexa-bg-base transition-colors text-rose-500">
                        <Heart className="w-6 h-6" />
                     </button>
                     <button className="w-16 h-16 rounded-2xl bg-nexa-bg-surface border border-nexa-border flex items-center justify-center hover:bg-nexa-bg-base transition-colors">
                        <Share2 className="w-6 h-6" />
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <div className="container mx-auto px-4 py-12">
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* LEFT COLUMN: ABOUT & SERVICES */}
            <div className="lg:col-span-2 space-y-12">
               
               {/* ABOUT */}
               <section className="space-y-6">
                  <h2 className="text-2xl font-bold text-display">About the Professional</h2>
                  <p className="text-lg text-nexa-text-secondary leading-relaxed">
                     {pro.bio || "No bio available for this professional. They are a verified member of the Nexa community."}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                     {pro.specialties?.split(",").map((spec: string, i: number) => (
                        <span key={i} className="px-4 py-2 rounded-xl bg-nexa-bg-surface border border-nexa-border text-sm font-bold text-nexa-text-secondary">
                           {spec.trim()}
                        </span>
                     ))}
                  </div>
               </section>

               {/* SERVICES */}
               <section className="space-y-8">
                  <div className="flex items-center justify-between">
                     <h2 className="text-2xl font-bold text-display">Services Offered</h2>
                     <NexaBadge variant="neutral" className="bg-nexa-bg-surface">{pro.services?.length || 0} Services</NexaBadge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {pro.services?.map((service: any) => (
                        <NexaCard key={service.id} variant="interactive" className="p-6 group">
                           <div className="flex justify-between items-start mb-4">
                              <div className="w-12 h-12 rounded-xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center group-hover:scale-110 transition-transform">
                                 <ShoppingBag className="w-6 h-6" />
                              </div>
                              <p className="text-xl font-extrabold text-nexa-brand">₦{service.price.toLocaleString()}</p>
                           </div>
                           <h3 className="text-lg font-bold mb-2 group-hover:text-nexa-brand transition-colors">{service.name}</h3>
                           <p className="text-sm text-nexa-text-faint mb-6 line-clamp-2">{service.description || "Standard professional service delivered to your doorstep."}</p>
                           <NexaButton 
                              variant="secondary" 
                              className="w-full"
                              onClick={() => handleBookNow(service)}
                           >
                              Select & Book
                           </NexaButton>
                        </NexaCard>
                     ))}
                  </div>
               </section>

               {/* REVIEWS PLACEHOLDER */}
               <section className="space-y-8">
                  <div className="flex items-center justify-between">
                     <h2 className="text-2xl font-bold text-display">Recent Reviews</h2>
                     <NexaButton variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>See All</NexaButton>
                  </div>
                  <div className="space-y-6">
                     {[1, 2].map((r) => (
                        <div key={r} className="p-8 rounded-[32px] bg-nexa-bg-surface border border-nexa-border space-y-4">
                           <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-slate-200" />
                                 <div>
                                    <p className="text-sm font-bold">Verified Client</p>
                                    <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest">Oct 2024</p>
                                 </div>
                              </div>
                              <NexaRating value={5} />
                           </div>
                           <p className="text-nexa-text-secondary leading-relaxed">
                              "Excellent service! They arrived on time and handled the work with great professionalism. I'm very satisfied and will definitely book again."
                           </p>
                        </div>
                     ))}
                  </div>
               </section>
            </div>

            {/* RIGHT COLUMN: SIDEBAR */}
            <aside className="space-y-8">
               
               {/* PRICING & CTA CARD */}
               <NexaCard className="p-8 border-nexa-brand/20 bg-nexa-bg-surface sticky top-32 z-10">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="font-bold">Consultation Fee</h3>
                     <p className="text-2xl font-extrabold">₦{pro.hourlyRate?.toLocaleString() || "5,000"}</p>
                  </div>
                  
                  <div className="space-y-6 mb-8">
                     <div className="flex items-center gap-3 text-sm text-nexa-text-secondary">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Verified Professional
                     </div>
                     <div className="flex items-center gap-3 text-sm text-nexa-text-secondary">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Nexa Guarantee Protected
                     </div>
                     <div className="flex items-center gap-3 text-sm text-nexa-text-secondary">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Secure NexaPay Accepted
                     </div>
                  </div>

                  <NexaButton size="lg" className="w-full h-16 rounded-2xl mb-4" onClick={() => handleBookNow()}>
                     Book Service Now
                  </NexaButton>
                  <p className="text-center text-[10px] font-bold text-nexa-text-faint uppercase tracking-widest">No payment required yet</p>
               </NexaCard>

               {/* TRUST BADGE */}
               <NexaCard variant="glass" className="p-8 border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-4 mb-4">
                     <ShieldCheck className="w-10 h-10 text-emerald-500" />
                     <div>
                        <h4 className="font-bold text-emerald-500">Nexa Protected</h4>
                        <p className="text-[10px] font-bold text-nexa-text-faint uppercase tracking-widest">Buyer Protection On</p>
                     </div>
                  </div>
                  <p className="text-xs text-nexa-text-secondary leading-relaxed">
                     Your payments are held in escrow and only released when you are satisfied with the service.
                  </p>
               </NexaCard>

               {/* CONTACT INFO */}
               <NexaCard className="p-8 space-y-6">
                  <h3 className="font-bold">Business Info</h3>
                  <div className="space-y-4">
                     <div className="flex items-center gap-4 text-sm text-nexa-text-secondary">
                        <div className="w-10 h-10 rounded-xl bg-nexa-bg-base flex items-center justify-center">
                           <Globe className="w-4 h-4" />
                        </div>
                        www.example.com
                     </div>
                     <div className="flex items-center gap-4 text-sm text-nexa-text-secondary">
                        <div className="w-10 h-10 rounded-xl bg-nexa-bg-base flex items-center justify-center">
                           <Mail className="w-4 h-4" />
                        </div>
                        {pro.user?.email || "contact@business.com"}
                     </div>
                     <div className="flex items-center gap-4 text-sm text-nexa-text-secondary">
                        <div className="w-10 h-10 rounded-xl bg-nexa-bg-base flex items-center justify-center">
                           <Phone className="w-4 h-4" />
                        </div>
                        +234 800 NEXA PRO
                     </div>
                  </div>
                  
                  <div className="pt-6 border-t border-nexa-border flex gap-3">
                     {[Instagram, Facebook, Twitter].map((Icon, i) => (
                        <button key={i} className="w-10 h-10 rounded-xl bg-nexa-bg-base flex items-center justify-center hover:bg-nexa-bg-surface border border-nexa-border transition-colors">
                           <Icon className="w-4 h-4" />
                        </button>
                     ))}
                  </div>
               </NexaCard>

               {/* SHOP PREVIEW */}
               <NexaCard className="p-8 group overflow-hidden relative">
                  <div className="relative z-10 space-y-4">
                     <div className="flex items-center gap-3">
                        <ShoppingBag className="w-6 h-6 text-nexa-brand" />
                        <h3 className="font-bold">Product Store</h3>
                     </div>
                     <p className="text-xs text-nexa-text-secondary leading-relaxed">
                        This business also sells quality materials and products.
                     </p>
                      <Link href={`/${service}/${state}/${lga}/${businessSlug}/shop`} className="block">
                        <NexaButton variant="secondary" className="w-full" rightIcon={<ChevronRight className="w-4 h-4" />}>
                           Visit Shop
                        </NexaButton>
                     </Link>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-nexa-brand/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
               </NexaCard>
            </aside>
         </div>
      </div>

      <NexaBottomBar />

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        businessName={pro.user?.name || "Professional"} 
        serviceName={selectedService?.name}
        proProfileId={pro.id}
      />
    </main>
  );
}
