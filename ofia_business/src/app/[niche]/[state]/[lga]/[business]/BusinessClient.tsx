"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Navigation,
  Calendar,
  ChevronRight,
  ChevronLeft,
  X,
  ArrowRight,
  Info,
  Phone,
  Mail,
  Globe,
  ShoppingBag,
  Award,
  Play,
  Image as ImageIcon
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
import { GoogleMap } from "@/components/nexa/GoogleMap";

// Mapping of areas to base coordinates in Nigeria
const AREA_COORDINATES: Record<string, [number, number]> = {
  // Lagos
  "ikeja": [6.6018, 3.3515],
  "lekki": [6.4281, 3.4219],
  "surulere": [6.5059, 3.3619],
  "yaba": [6.5095, 3.3711],
  "victoriaisland": [6.4281, 3.4219],
  "ikoyi": [6.4549, 3.4410],
  "festac": [6.4674, 3.2842],
  "festactown": [6.4674, 3.2842],
  // Abuja
  "garki": [9.0238, 7.4831],
  "wuse": [9.0683, 7.4789],
  "maitama": [9.0913, 7.5028],
  // Other Cities
  "ibadan": [7.3775, 3.9470],
  "portharcourt": [4.8156, 7.0498],
  "kano": [12.0022, 8.5919],
  "benincity": [6.3350, 5.6263],
  "abeokuta": [7.1599, 3.3486],
  "enugu": [6.4584, 7.5086],
  "kaduna": [10.5105, 7.4165],
  "jos": [9.8965, 8.8583],
  // Fallbacks
  "lagos": [6.5244, 3.3792],
  "abuja": [9.0578, 7.4951]
};

const getCoordinates = (areaName: string, cityName: string, proId: string) => {
  const normArea = (areaName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normCity = (cityName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  
  let baseCoords = AREA_COORDINATES[normArea] || AREA_COORDINATES[normCity] || [6.5244, 3.3792];
  
  // Deterministic offset based on proId string hash
  let hash = 0;
  const str = proId || "";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((hash & 0xFF) / 255 - 0.5) * 0.008;
  const lngOffset = (((hash >> 8) & 0xFF) / 255 - 0.5) * 0.008;
  
  return [baseCoords[0] + latOffset, baseCoords[1] + lngOffset] as [number, number];
};

interface BusinessClientProps {
  data: any;
  businessSlug: string;
}

export default function BusinessClient({ data, businessSlug }: BusinessClientProps) {
  const params = useParams();
  const niche = params.niche as string;
  const state = params.state as string;
  const lga = params.lga as string;

  const [pro, setPro] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const [preselectedDate, setPreselectedDate] = useState<Date | undefined>(undefined);
  const [preselectedTime, setPreselectedTime] = useState<string | undefined>(undefined);
  
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(new Date());
  const [timeSlotsModalOpen, setTimeSlotsModalOpen] = useState(false);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const getDaysInMonth = (y: number, m: number) => {
    const date = new Date(y, m, 1);
    const daysList = [];
    const startDayOfWeek = date.getDay();
    
    for (let i = 0; i < startDayOfWeek; i++) {
      daysList.push(null);
    }
    
    while (date.getMonth() === m) {
      daysList.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    
    return daysList;
  };

  const monthDays = getDaysInMonth(year, month);
  const monthName = currentMonthDate.toLocaleString("default", { month: "long" });

  const handlePrevMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonthDate(d);
  };

  const handleNextMonth = () => {
    const d = new Date(currentMonthDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonthDate(d);
  };

  const calendarTimeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const isSlotBooked = (date: Date, timeSlot: string) => {
    if (!pro || !pro.bookings) return false;
    const [time, period] = timeSlot.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    
    const targetDate = new Date(date);
    targetDate.setHours(hours, minutes, 0, 0);
    
    return pro.bookings.some((booking: any) => {
      const bookingDate = new Date(booking.scheduledAt || booking.scheduled_at);
      return bookingDate.getFullYear() === targetDate.getFullYear() &&
             bookingDate.getMonth() === targetDate.getMonth() &&
             bookingDate.getDate() === targetDate.getDate() &&
             bookingDate.getHours() === targetDate.getHours() &&
             booking.status !== "CANCELLED" && 
             booking.status !== "DECLINED" && 
             booking.status !== "REJECTED";
    });
  };

  const getDayAvailabilityStats = (date: Date | null) => {
    if (!date) return { status: "empty" };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    
    if (compareDate < today) {
      return { status: "past" };
    }

    const isClosed = isWeekend(date);
    if (isClosed) {
      return { status: "closed" };
    }
    
    let bookedCount = 0;
    const totalCount = calendarTimeSlots.length;
    
    calendarTimeSlots.forEach((slot) => {
      if (isSlotBooked(date, slot)) {
        bookedCount++;
      }
    });
    
    if (bookedCount === totalCount) {
      return { status: "unavailable" };
    } else if (bookedCount > 0) {
      return { status: "partial", bookedCount, totalCount };
    } else {
      return { status: "available" };
    }
  };

  const handleBookSlot = (date: Date, timeSlot: string) => {
    setPreselectedDate(date);
    setPreselectedTime(timeSlot);
    setIsBookingOpen(true);
  };

  const [activeLightboxGroup, setActiveLightboxGroup] = useState<any>(null);
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number>(0);

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
           <Link href={`/${niche}`}>
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
                   <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-nexa-border shadow-xl relative z-10">
                      <img 
                        src={pro.logoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"} 
                        alt={pro.user?.name} 
                        className="w-full h-full object-cover" 
                      />
                   </div>
                    {pro.verified && (
                       <div className="absolute -bottom-2 -right-2 z-20 scale-110">
                          <NexaVerifiedBadge />
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
                     <button 
                        onClick={() => {
                           const query = `${pro.businessName || pro.user?.name || "Professional"}, ${pro.area ? pro.area + ", " : ""}${pro.city || "Lagos"}`;
                           window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
                        }}
                        className="w-16 h-16 rounded-2xl bg-nexa-bg-surface border border-nexa-border flex items-center justify-center hover:bg-nexa-bg-base transition-colors text-nexa-brand"
                        title="Navigate to Location"
                     >
                        <Navigation className="w-6 h-6" />
                     </button>
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
                  <h2 className="text-2xl font-bold text-display">About {pro.businessName || pro.user?.name || "the Professional"}</h2>
                  <p className="text-base text-nexa-text-secondary leading-relaxed">
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
               {/* CATALOG */}
               {(() => {
                  let catalogGroups = [];
                  if (pro.catalog) {
                     try {
                        catalogGroups = JSON.parse(pro.catalog);
                     } catch (e) {
                        console.error("Failed to parse catalog JSON:", e);
                     }
                  }
                  
                  if (!catalogGroups || catalogGroups.length === 0) {
                     catalogGroups = [
                        {
                           id: "g-mock-1",
                           title: "Living Room Modern Concepts",
                           items: [
                              { id: "item-1-1", title: "Minimalist Lounge Setup", type: "photo", url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=400" },
                              { id: "item-1-2", title: "Ambient Lighting Installation", type: "photo", url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=400" },
                              { id: "item-1-3", title: "Luxury Furniture Suite", type: "photo", url: "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=400" }
                           ]
                        },
                        {
                           id: "g-mock-2",
                           title: "Luxury Kitchen Projects",
                           items: [
                              { id: "item-2-1", title: "Marble Countertop & Cabinets", type: "photo", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400" },
                              { id: "item-2-2", title: "Video Walkthrough & Walk-in Pantry", type: "video", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=400" },
                              { id: "item-2-3", title: "Premium Cabinet Installation", type: "photo", url: "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&q=80&w=400" }
                           ]
                        }
                     ];
                  }

                  return (
                     <section className="space-y-8">
                        <div className="flex items-center justify-between border-b border-nexa-border pb-4">
                           <div>
                              <h2 className="text-2xl font-bold text-display">Business Catalog</h2>
                              <p className="text-xs text-nexa-text-faint font-medium mt-1">Explore our work showcases and media groups</p>
                           </div>
                           <NexaBadge variant="neutral" className="bg-nexa-brand/10 text-nexa-brand border-nexa-brand/20">
                              {catalogGroups.length} {catalogGroups.length === 1 ? "Group" : "Groups"}
                           </NexaBadge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                           {catalogGroups.map((group: any) => {
                              const itemsCount = group.items?.length || 0;
                              
                              return (
                                 <div 
                                    key={group.id} 
                                    onClick={() => {
                                       if (itemsCount > 0) {
                                          setActiveLightboxGroup(group);
                                          setActiveLightboxIndex(0);
                                       }
                                    }}
                                    className="group cursor-pointer space-y-3 select-none"
                                 >
                                    {/* Collage block */}
                                    {itemsCount === 0 ? (
                                       <div className="h-48 rounded-2xl border border-nexa-border bg-nexa-bg-surface flex flex-col items-center justify-center text-nexa-text-faint p-4">
                                          <ImageIcon className="w-8 h-8 mb-2" />
                                          <span className="text-[10px] font-bold uppercase tracking-wider">Empty Showcase</span>
                                       </div>
                                    ) : itemsCount === 1 ? (
                                       <div className="h-48 rounded-2xl overflow-hidden shadow-sm border border-nexa-border bg-nexa-bg-base relative">
                                          <img src={group.items[0].url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                                          {group.items[0].type === "video" && (
                                             <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                                <Play className="w-6 h-6 fill-white text-white" />
                                             </div>
                                          )}
                                       </div>
                                    ) : itemsCount === 2 ? (
                                       <div className="grid grid-cols-2 gap-1.5 h-48 rounded-2xl overflow-hidden shadow-sm border border-nexa-border bg-nexa-bg-base relative">
                                          <div className="relative overflow-hidden w-full h-full">
                                             <img src={group.items[0].url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                                             {group.items[0].type === "video" && (
                                                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                                   <Play className="w-4 h-4 fill-white text-white" />
                                                </div>
                                             )}
                                          </div>
                                          <div className="relative overflow-hidden w-full h-full">
                                             <img src={group.items[1].url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                                             {group.items[1].type === "video" && (
                                                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                                   <Play className="w-4 h-4 fill-white text-white" />
                                                </div>
                                             )}
                                          </div>
                                       </div>
                                    ) : (
                                       <div className="grid grid-cols-5 gap-1.5 h-48 rounded-2xl overflow-hidden shadow-sm border border-nexa-border bg-nexa-bg-base relative">
                                          {/* Left column (stacked small images) */}
                                          <div className="col-span-2 grid grid-rows-2 gap-1.5 h-full">
                                             <div className="relative overflow-hidden w-full h-full bg-nexa-bg-surface">
                                                <img src={group.items[0].url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                                                {group.items[0].type === "video" && (
                                                   <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                      <Play className="w-3.5 h-3.5 fill-white text-white" />
                                                   </div>
                                                )}
                                             </div>
                                             <div className="relative overflow-hidden w-full h-full bg-nexa-bg-surface">
                                                <img src={group.items[1].url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                                                {group.items[1].type === "video" && (
                                                   <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                      <Play className="w-3.5 h-3.5 fill-white text-white" />
                                                   </div>
                                                )}
                                             </div>
                                          </div>
                                          {/* Right column (large image) */}
                                          <div className="col-span-3 relative overflow-hidden w-full h-full bg-nexa-bg-surface">
                                             <img src={group.items[2].url} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="" />
                                             {group.items[2].type === "video" && (
                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                                   <div className="w-10 h-10 rounded-full bg-nexa-brand flex items-center justify-center text-white shadow-lg">
                                                      <Play className="w-4.5 h-4.5 fill-white text-white ml-0.5" />
                                                   </div>
                                                </div>
                                             )}
                                          </div>
                                       </div>
                                    )}

                                    {/* Text below the collage */}
                                    <div className="pl-0.5">
                                       <h4 className="font-bold text-sm text-nexa-text-primary line-clamp-1 group-hover:text-nexa-brand transition-colors">
                                          {group.title}
                                       </h4>
                                       <p className="text-xs text-nexa-text-faint font-semibold mt-0.5">
                                          {itemsCount} {itemsCount === 1 ? "Photo" : "Photos"}
                                       </p>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </section>
                  );
               })()}

               {/* PRODUCTS */}
               {(() => {
                  const displayProducts = (pro.products && pro.products.length > 0) 
                    ? pro.products 
                    : [
                        { id: "p-mock-1", name: "Premium Maintenance Kit", price: 12500, description: "All-in-one professional maintenance and preparation kit for service clients." },
                        { id: "p-mock-2", name: "Heavy-Duty Hardware Set", price: 8000, description: "Industry-grade structural hardware components and replacement materials." }
                      ];
                  return (
                     <section className="space-y-8">
                        <div className="flex items-center justify-between">
                           <h2 className="text-2xl font-bold text-display">Products for Sale</h2>
                           <NexaBadge variant="neutral" className="bg-nexa-brand/10 text-nexa-brand border-nexa-brand/20">{displayProducts.length} Products</NexaBadge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                           {displayProducts.map((product: any, idx: number) => {
                              const fallbackImages = [
                                 "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?auto=format&fit=crop&q=80&w=400",
                                 "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=400"
                              ];
                              const productImage = product.image || fallbackImages[idx % fallbackImages.length];
                              return (
                                 <Link href={`/checkout?proId=${pro.id}&service=${encodeURIComponent(product.name)}&amount=${product.price}&type=PRODUCT`} key={product.id} className="block">
                                    <NexaCard variant="flat" padding="none" className="group h-full flex flex-col">
                                       <div className="aspect-square relative overflow-hidden bg-slate-100">
                                          <div className="absolute top-3 left-3 z-10">
                                             <NexaBadge variant="neutral" className="bg-white/80 backdrop-blur-sm border-none shadow-sm text-black">New</NexaBadge>
                                          </div>
                                          <button className="absolute top-3 right-3 z-10 w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-nexa-text-faint hover:text-rose-500 transition-colors">
                                             <Heart className="w-3.5 h-3.5" />
                                          </button>
                                          <img 
                                             src={productImage} 
                                             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                             alt={product.name}
                                          />
                                          
                                          <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                                             <NexaButton className="w-full shadow-lg h-9 text-xs rounded-xl">Buy Now</NexaButton>
                                          </div>
                                       </div>
                                       <div className="p-3 flex-1 flex flex-col">
                                          <div className="flex items-center justify-between mb-1.5">
                                             <span className="text-[8px] font-bold text-nexa-text-faint uppercase tracking-wider line-clamp-1">{pro.user?.name || "Verified Seller"}</span>
                                             <div className="flex items-center gap-0.5">
                                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                                <span className="text-[8px] font-bold">{pro.rating || "5.0"}</span>
                                             </div>
                                          </div>
                                          <h3 className="font-bold text-xs mb-1 line-clamp-2 group-hover:text-nexa-brand transition-colors leading-snug">
                                             {product.name}
                                          </h3>
                                          <div className="mt-auto flex items-center justify-between">
                                             <p className="font-extrabold text-nexa-brand text-sm">₦{product.price.toLocaleString()}</p>
                                             <span className="text-[8px] text-nexa-text-faint line-through">₦{(product.price * 1.2).toLocaleString()}</span>
                                          </div>
                                       </div>
                                    </NexaCard>
                                 </Link>
                              );
                           })}
                        </div>
                     </section>
                  );
               })()}

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

               {/* MAP VIEW */}
               <NexaCard className="p-0 overflow-hidden space-y-0">
                   <div className="p-8 pb-4 space-y-4">
                      <div className="flex items-center gap-3">
                         <MapPin className="w-6 h-6 text-nexa-brand" />
                         <h3 className="font-bold">Business Location</h3>
                      </div>
                      <p className="text-xs text-nexa-text-secondary leading-relaxed">
                         {pro.area ? `${pro.area}, ` : ""}{pro.city || "Lagos"}, Nigeria
                      </p>
                   </div>
                   <div className="h-64 relative border-t border-nexa-border">
                      {pro && (
                         <GoogleMap
                            center={{
                               lat: getCoordinates(pro.area, pro.city, pro.id)[0],
                               lng: getCoordinates(pro.area, pro.city, pro.id)[1]
                            }}
                            title={pro.businessName || pro.user?.name || "Business Location"}
                            subtitle={`${pro.area ? pro.area + ", " : ""}${pro.city || "Lagos"}, Nigeria`}
                            className="w-full h-full"
                         />
                      )}
                    </div>
                 </NexaCard>

                 {/* CALENDAR AVAILABILITY CARD */}
                 <NexaCard className="p-8 space-y-5">
                    <div className="flex items-center gap-3">
                       <Calendar className="w-6 h-6 text-nexa-brand" />
                       <h3 className="font-bold">Booking Availability</h3>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex items-center justify-between border-t border-nexa-border/30 pt-3">
                       <button
                          type="button"
                          onClick={handlePrevMonth}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-nexa-text-secondary transition-colors"
                       >
                          <ChevronLeft className="w-5 h-5" />
                       </button>
                       <span className="text-xs font-extrabold text-nexa-text-primary capitalize tracking-wider">
                          {monthName} {year}
                       </span>
                       <button
                          type="button"
                          onClick={handleNextMonth}
                          className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-nexa-text-secondary transition-colors"
                       >
                          <ChevronRight className="w-5 h-5" />
                       </button>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 gap-1 text-center">
                       {["S", "M", "T", "W", "T", "F", "S"].map((day, idx) => (
                          <span key={idx} className="text-[10px] font-extrabold text-nexa-text-faint">
                             {day}
                          </span>
                       ))}
                    </div>

                    {/* Month Days Grid */}
                    <div className="grid grid-cols-7 gap-1.5 justify-items-center">
                       {monthDays.map((d, idx) => {
                          if (!d) {
                             return <div key={`empty-${idx}`} className="w-10 h-10 sm:w-12 sm:h-12" />;
                          }
                          
                          const stats = getDayAvailabilityStats(d);
                          const isSelected = selectedCalendarDate.getFullYear() === d.getFullYear() &&
                                             selectedCalendarDate.getMonth() === d.getMonth() &&
                                             selectedCalendarDate.getDate() === d.getDate();
                          
                          const isAvailable = stats.status === "available" || stats.status === "partial";
                          
                          if (stats.status === "past") {
                             return (
                                <div key={idx} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm sm:text-base font-bold text-slate-300 dark:text-slate-800 cursor-not-allowed select-none">
                                   {d.getDate()}
                                </div>
                             );
                          }
                          
                          if (!isAvailable) {
                             // Weekend closed or fully booked: solid background circle with crossed out number (filled number)
                             return (
                                <div key={idx} className="relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-sm sm:text-base font-bold bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 text-slate-400 dark:text-slate-600 rounded-full cursor-not-allowed select-none">
                                   <span className="z-10 line-through opacity-60">{d.getDate()}</span>
                                </div>
                             );
                          }
                          
                          // Available day (free number): plain text, hover effects, clickable
                          return (
                             <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                   setSelectedCalendarDate(d);
                                   setTimeSlotsModalOpen(true);
                                }}
                                className={cn(
                                   "w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-sm sm:text-base font-bold transition-all focus:outline-none",
                                   isSelected
                                      ? "bg-nexa-brand text-white shadow-lg shadow-nexa-brand/20"
                                      : "bg-transparent hover:bg-slate-100 dark:hover:bg-white/5 text-nexa-text-primary hover:text-nexa-brand"
                                )}
                             >
                                {d.getDate()}
                             </button>
                          );
                       })}
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
                      <Link href={`/${niche}/${state}/${lga}/${businessSlug}/shop`} className="block">
                        <NexaButton variant="secondary" className="w-full" rightIcon={<ChevronRight className="w-4 h-4" />}>
                           Visit Shop
                        </NexaButton>
                     </Link>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-nexa-brand/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
               </NexaCard>

               {/* PRICING & CTA CARD */}
               <NexaCard className="p-8 border-nexa-brand/20 bg-nexa-bg-surface sticky top-32 z-30">
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
             </aside>
         </div>
      </div>

      <NexaBottomBar />

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => {
          setIsBookingOpen(false);
          setPreselectedDate(undefined);
          setPreselectedTime(undefined);
        }} 
        businessName={pro.user?.name || "Professional"} 
        serviceName={selectedService?.name}
        proProfileId={pro.id}
        initialDate={preselectedDate}
        initialTime={preselectedTime}
      />

      <AnimatePresence>
         {timeSlotsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               {/* Backdrop */}
               <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  onClick={() => setTimeSlotsModalOpen(false)}
                  className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
               />
               
               {/* Modal Box */}
               <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ type: "spring", duration: 0.4 }}
                  className="relative z-10 w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6 overflow-hidden"
               >
                  {/* Decorative glow */}
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-nexa-brand/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                  {/* Header */}
                  <div className="flex items-start justify-between relative z-10">
                     <div className="space-y-1">
                        <h3 className="font-extrabold text-lg text-nexa-text-primary">Available Slots</h3>
                        <p className="text-xs text-nexa-text-secondary">
                           Select a time for <span className="font-bold text-nexa-brand">{selectedCalendarDate.toLocaleDateString("default", { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                        </p>
                     </div>
                     <button 
                        onClick={() => setTimeSlotsModalOpen(false)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-nexa-text-secondary transition-colors"
                     >
                        <X className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Slots Grid */}
                  <div className="grid grid-cols-2 gap-2.5 relative z-10 max-h-[60vh] overflow-y-auto py-1">
                     {calendarTimeSlots.map((slot) => {
                        const booked = isSlotBooked(selectedCalendarDate, slot);
                        
                        return (
                           <button
                              key={slot}
                              type="button"
                              disabled={booked}
                              onClick={() => {
                                 handleBookSlot(selectedCalendarDate, slot);
                                 setTimeSlotsModalOpen(false);
                              }}
                              className={cn(
                                 "py-3 rounded-2xl border text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 relative group",
                                 booked
                                    ? "bg-slate-50 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800/40 text-nexa-text-faint cursor-not-allowed line-through"
                                    : "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:shadow-md hover:shadow-emerald-500/5"
                              )}
                           >
                              <span>{slot}</span>
                              {!booked && (
                                 <span className="text-[9px] px-1 bg-emerald-500 text-white rounded font-extrabold scale-90 group-hover:scale-95 transition-transform">
                                    BOOK
                                 </span>
                              )}
                           </button>
                        );
                     })}
                  </div>

                  {/* Footer notice */}
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/5 p-3.5 rounded-2xl text-[10px] text-nexa-text-secondary leading-relaxed border border-slate-200/10">
                     <Info className="w-4 h-4 text-nexa-brand shrink-0" />
                     <span>Clicking a slot will prefill the booking details and open the final checkout scheduler.</span>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {activeLightboxGroup && (
         <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col justify-between p-4 md:p-8 select-none">
            {/* Header */}
            <div className="flex justify-between items-center text-white max-w-7xl mx-auto w-full">
               <div>
                  <h4 className="font-bold text-lg">{activeLightboxGroup.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">
                     Item {activeLightboxIndex + 1} of {activeLightboxGroup.items.length}
                  </p>
               </div>
               <button 
                  onClick={() => setActiveLightboxGroup(null)}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all focus:outline-none"
               >
                  <X className="w-5 h-5" />
               </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex items-center justify-between gap-4 my-6 max-w-7xl mx-auto w-full">
               {/* Prev Button */}
               <button 
                  disabled={activeLightboxIndex === 0}
                  onClick={() => setActiveLightboxIndex(activeLightboxIndex - 1)}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-20 disabled:pointer-events-none transition-all focus:outline-none shrink-0"
               >
                  <ChevronLeft className="w-6 h-6" />
               </button>

               {/* Center Image / Video */}
               <div className="max-w-4xl max-h-[70vh] flex-1 flex items-center justify-center overflow-hidden">
                  {(() => {
                     const item = activeLightboxGroup.items[activeLightboxIndex];
                     if (!item) return null;
                     if (item.type === "video") {
                        return (
                           <video 
                              src={item.url} 
                              controls 
                              autoPlay
                              className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl"
                           />
                        );
                     } else {
                        return (
                           <img 
                              src={item.url} 
                              className="max-w-full max-h-[70vh] rounded-2xl object-contain shadow-2xl" 
                              alt={item.title}
                           />
                        );
                     }
                  })()}
               </div>

               {/* Next Button */}
               <button 
                  disabled={activeLightboxIndex === activeLightboxGroup.items.length - 1}
                  onClick={() => setActiveLightboxIndex(activeLightboxIndex + 1)}
                  className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white disabled:opacity-20 disabled:pointer-events-none transition-all focus:outline-none shrink-0"
               >
                  <ChevronRight className="w-6 h-6" />
               </button>
            </div>

            {/* Caption / Title */}
            <div className="text-center text-white pb-4 max-w-7xl mx-auto w-full">
               <p className="font-semibold text-base">
                  {activeLightboxGroup.items[activeLightboxIndex]?.title}
               </p>
            </div>
         </div>
      )}
    </main>
  );
}
