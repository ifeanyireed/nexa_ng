"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  ShoppingBag, 
  Heart, 
  Settings, 
  LogOut, 
  MapPin, 
  Star,
  ChevronRight,
  Clock,
  ShieldCheck,
  User,
  CreditCard,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useSearchParams, useRouter } from "next/navigation";

export default function AccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "bookings");

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const updateTab = (tab: string) => {
    setActiveTab(tab);
    router.push(`/account?tab=${tab}`, { scroll: false });
  };

  const tabs = [
    { id: "bookings", label: "My Bookings", icon: <Calendar className="w-4 h-4" /> },
    { id: "orders", label: "My Orders", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "favorites", label: "Favorites", icon: <Heart className="w-4 h-4" /> },
    { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <div className="container mx-auto px-4 pt-32">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* SIDEBAR */}
          <aside className="w-full lg:w-80 shrink-0">
            <NexaCard variant="glass" className="p-8 border-none shadow-2xl sticky top-32">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="relative mb-4 group cursor-pointer">
                  <NexaAvatar size="xl" fallback="JD" />
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                </div>
                <h2 className="text-xl font-extrabold mb-1">John Doe</h2>
                <p className="text-xs text-nexa-text-faint font-bold uppercase tracking-widest">Premium Member</p>
              </div>

              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => updateTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold transition-all",
                      activeTab === tab.id 
                        ? "bg-nexa-brand text-white shadow-lg shadow-nexa-brand/20" 
                        : "text-nexa-text-secondary hover:bg-nexa-bg-surface hover:text-nexa-text-primary"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-nexa-border">
                <button className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-bold text-coral hover:bg-coral/10 transition-all">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </NexaCard>
          </aside>

          {/* MAIN CONTENT */}
          <div className="flex-1 min-w-0">
             <AnimatePresence mode="wait">
                {activeTab === "bookings" && (
                  <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                    <div className="flex items-center justify-between">
                       <h1 className="text-3xl font-extrabold text-display">Service Bookings</h1>
                       <NexaBadge variant="neutral" className="bg-nexa-brand/10 text-nexa-brand border-none">2 Active</NexaBadge>
                    </div>

                    {[1, 2].map((i) => (
                      <NexaCard key={i} variant="interactive" className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 group">
                         <div className="flex items-center gap-6 w-full">
                            <div className="w-20 h-20 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center text-3xl font-extrabold shrink-0 group-hover:scale-110 transition-transform">
                               {i === 1 ? "K" : "A"}
                            </div>
                            <div className="min-w-0 flex-1">
                               <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-xl font-bold truncate">{i === 1 ? "Kola Handyman Services" : "Amina's Salon"}</h3>
                                  <ShieldCheck className="w-4 h-4 text-nexa-brand" />
                               </div>
                               <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-nexa-text-secondary uppercase tracking-widest">
                                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Oct 24, 2026</span>
                                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 10:00 AM</span>
                                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-coral" /> Lekki, Lagos</span>
                               </div>
                            </div>
                         </div>
                         <div className="flex flex-row md:flex-col items-center md:items-end gap-4 w-full md:w-auto">
                            <div className="text-right flex-1 md:flex-none">
                               <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest mb-1">Status</p>
                               <NexaBadge variant={i === 1 ? "success" : "neutral"}>
                                  {i === 1 ? "Confirmed" : "Pending"}
                                </NexaBadge>
                            </div>
                            <NexaButton size="sm" variant="secondary" rightIcon={<ChevronRight className="w-4 h-4" />}>Details</NexaButton>
                         </div>
                      </NexaCard>
                    ))}
                  </motion.div>
                )}

                {activeTab === "orders" && (
                   <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                      <div className="flex items-center justify-between">
                         <h1 className="text-3xl font-extrabold text-display">Product Orders</h1>
                         <NexaBadge variant="neutral" className="bg-emerald-500/10 text-emerald-500 border-none">1 Shipped</NexaBadge>
                      </div>

                      <NexaCard variant="flat" className="p-0 overflow-hidden border-none bg-nexa-bg-surface/50">
                         <div className="p-6 border-b border-nexa-border bg-nexa-bg-surface flex items-center justify-between">
                            <div>
                               <p className="text-xs font-bold text-nexa-text-faint uppercase tracking-widest mb-1">Order #NX-88291</p>
                               <h3 className="font-bold">Placed on Oct 20, 2026</h3>
                            </div>
                            <NexaButton size="sm" variant="secondary">Track Order</NexaButton>
                         </div>
                         <div className="p-6 space-y-6">
                            {[1, 2].map(p => (
                               <div key={p} className="flex gap-4">
                                  <div className="w-16 h-16 rounded-xl bg-white border border-nexa-border shrink-0" />
                                  <div className="flex-1">
                                     <h4 className="font-bold text-sm">Industrial Product {p}</h4>
                                     <p className="text-xs text-nexa-text-secondary">Sold by: Tunji Paints & Tools</p>
                                  </div>
                                  <p className="font-bold text-sm">₦7,500</p>
                               </div>
                            ))}
                         </div>
                         <div className="p-6 bg-nexa-bg-base flex items-center justify-between border-t border-nexa-border">
                            <span className="text-sm font-bold text-nexa-text-secondary">Order Total</span>
                            <span className="text-lg font-extrabold text-nexa-brand">₦15,000</span>
                         </div>
                      </NexaCard>
                   </motion.div>
                )}

                {activeTab === "favorites" && (
                   <motion.div key="favorites" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                      <h1 className="text-3xl font-extrabold text-display">Saved Businesses</h1>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {[1, 2, 3].map(i => (
                            <NexaCard key={i} variant="interactive" padding="none" className="overflow-hidden flex flex-col border-none shadow-sm group">
                               <div className="h-32 bg-nexa-brand/10 relative">
                                  <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white text-coral flex items-center justify-center shadow-lg">
                                     <Heart className="w-5 h-5 fill-current" />
                                  </button>
                               </div>
                               <div className="p-6">
                                  <h3 className="font-bold text-lg mb-1 group-hover:text-nexa-brand transition-colors">Premium Service {i}</h3>
                                  <div className="flex items-center gap-2 mb-4">
                                     <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                     <span className="text-xs font-bold">4.9</span>
                                     <span className="text-[10px] text-nexa-text-faint uppercase font-bold tracking-widest">• 124 Reviews</span>
                                  </div>
                                  <NexaButton size="sm" variant="secondary" className="w-full">View Profile</NexaButton>
                               </div>
                            </NexaCard>
                         ))}
                      </div>
                   </motion.div>
                )}

                {activeTab === "settings" && (
                   <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                      <h1 className="text-3xl font-extrabold text-display">Profile Settings</h1>
                      
                      <section className="space-y-8">
                         <h3 className="text-lg font-bold flex items-center gap-3">
                            <User className="w-5 h-5 text-nexa-brand" />
                            Personal Information
                         </h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-xs font-bold text-nexa-text-faint uppercase tracking-widest ml-1">Full Name</label>
                               <input type="text" defaultValue="John Doe" className="w-full h-14 bg-nexa-bg-surface border border-nexa-border rounded-2xl px-6 focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all font-medium" />
                            </div>
                            <div className="space-y-2">
                               <label className="text-xs font-bold text-nexa-text-faint uppercase tracking-widest ml-1">Email Address</label>
                               <input type="email" defaultValue="john@doe.com" className="w-full h-14 bg-nexa-bg-surface border border-nexa-border rounded-2xl px-6 focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all font-medium" />
                            </div>
                         </div>
                         <NexaButton size="lg" className="px-12">Update Profile</NexaButton>
                      </section>

                      <section className="space-y-8">
                         <h3 className="text-lg font-bold flex items-center gap-3">
                            <Bell className="w-5 h-5 text-nexa-brand" />
                            Notifications
                         </h3>
                         <div className="space-y-4">
                            {[
                               { label: "Booking Confirmations", desc: "Get notified when a seller confirms your booking." },
                               { label: "Deal Alerts", desc: "Receive updates when your favorite shops post deals." },
                               { label: "Promotional Emails", desc: "Occasional newsletters about new platform features." }
                            ].map((n, i) => (
                               <div key={i} className="flex items-center justify-between p-6 rounded-2xl bg-nexa-bg-surface border border-nexa-border">
                                  <div>
                                     <p className="font-bold text-sm mb-1">{n.label}</p>
                                     <p className="text-xs text-nexa-text-secondary">{n.desc}</p>
                                  </div>
                                  <div className={cn("w-12 h-6 rounded-full relative p-1 cursor-pointer transition-colors", i < 2 ? "bg-emerald-500" : "bg-nexa-border")}>
                                     <div className={cn("w-4 h-4 bg-white rounded-full shadow-sm absolute transition-all", i < 2 ? "right-1" : "left-1")} />
                                  </div>
                               </div>
                            ))}
                         </div>
                      </section>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>

      <NexaBottomBar />
    </main>
  );
}
