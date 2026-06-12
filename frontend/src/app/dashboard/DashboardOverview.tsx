"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  ShoppingBag, 
  Zap, 
  Plus, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  ArrowRight, 
  Eye, 
  FileText, 
  Tag, 
  Users, 
  ShieldCheck,
  Store
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { NICHE_DETAILS } from "@/lib/niche-data";
import { useAuth } from "@/components/nexa/AuthContext";
import { api } from "@/lib/api";
import Link from "next/link";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsData, walletData] = await Promise.all([
          api.get("/bookings"),
          api.get("/wallet"),
        ]);
        setBookings(bookingsData);
        setWallet(walletData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nicheData = user?.pro_profile?.niche ? NICHE_DETAILS[user.pro_profile.niche] : NICHE_DETAILS["handyman-finders"];
  
  const kpis = [
    { label: "Profile Views", value: "1,240", change: "+12%", trend: "up", icon: <Eye className="w-5 h-5 text-blue-500" /> },
    { label: "New Leads", value: "48", change: "+5%", trend: "up", icon: <Zap className="w-5 h-5 text-amber-500" /> },
    { label: "Bookings", value: bookings.length.toString(), change: "0%", trend: "neutral", icon: <Calendar className="w-5 h-5 text-emerald-500" /> },
    { label: "Wallet Balance", value: `₦${wallet?.balance?.toLocaleString() || "0"}`, change: "+8%", trend: "up", icon: <TrendingUp className="w-5 h-5 text-fuchsia-500" /> },
  ];

  return (
    <div className="space-y-12">
      {/* NICHE CONTEXT BAR */}
      <NexaCard variant="glass" padding="none" className="overflow-hidden bg-gradient-to-r from-nexa-brand/10 to-transparent border-nexa-brand/20">
         <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 text-center md:text-left">
               <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl", nicheData?.colorClass || "bg-nexa-brand")}>
                  <Store className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-2xl font-extrabold text-display">Welcome, {user?.name}</h3>
                  <p className="text-nexa-text-secondary text-sm">
                    {user?.role === "PRO" 
                      ? `Managing your listings in the ${nicheData?.name || "Marketplace"}.` 
                      : "Manage your bookings and wallet here."}
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-800/50 p-2 rounded-2xl border border-nexa-border">
               <div className="px-4 py-2">
                  <p className="text-[10px] text-nexa-text-faint font-extrabold uppercase tracking-widest mb-1">Status</p>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-xs font-bold">{user?.pro_profile?.verified ? "Live & Verified" : "Awaiting Verification"}</span>
                  </div>
               </div>
               <Link href={user?.pro_profile?.niche ? `/${user.pro_profile.niche}/business-${user.pro_profile.id}` : "#"}>
                  <NexaButton size="sm" variant="secondary" rightIcon={<Eye className="w-4 h-4" />}>Preview Profile</NexaButton>
               </Link>
            </div>
         </div>
      </NexaCard>

      {/* KPI GRID */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
         {kpis.map((kpi, i) => (
           <NexaCard key={i} variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                 <div className="w-10 h-10 rounded-xl bg-nexa-bg-base flex items-center justify-center">
                   {kpi.icon}
                 </div>
                 <div className={cn(
                   "flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-full",
                   kpi.trend === "up" ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"
                 )}>
                   {kpi.change}
                 </div>
              </div>
              <p className="text-nexa-text-faint text-[10px] font-bold uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
              <h3 className="text-2xl font-extrabold">{kpi.value}</h3>
           </NexaCard>
         ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         
         <div className="lg:col-span-2 space-y-12">
            
            <section>
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-extrabold flex items-center gap-2">
                     <Zap className="w-5 h-5 text-nexa-brand" />
                     Quick Actions
                  </h3>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: "Add Portfolio", icon: <Plus className="w-6 h-6" />, desc: "Upload past work" },
                    { label: "Post a Deal", icon: <Tag className="w-6 h-6" />, desc: "Create discount" },
                    { label: "Write Article", icon: <FileText className="w-6 h-6" />, desc: "SEO boost" },
                    { label: "Add Product", icon: <ShoppingBag className="w-6 h-6" />, desc: "NexaShop item" },
                    { label: "Get Verified", icon: <ShieldCheck className="w-6 h-6" />, desc: "CAC Upload" },
                    { label: "Invite Leads", icon: <Users className="w-6 h-6" />, desc: "Share profile" },
                  ].map((action, i) => (
                    <NexaCard key={i} variant="interactive" className="p-6 flex flex-col items-center text-center group cursor-pointer border-none bg-nexa-bg-surface/50">
                       <div className="w-12 h-12 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-nexa-brand group-hover:text-white transition-all shadow-sm">
                          {action.icon}
                       </div>
                       <h4 className="font-bold text-sm mb-1">{action.label}</h4>
                       <p className="text-[10px] text-nexa-text-faint uppercase font-bold">{action.desc}</p>
                    </NexaCard>
                  ))}
               </div>
            </section>

            <section>
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-extrabold flex items-center gap-2">
                     <Calendar className="w-5 h-5 text-nexa-brand" />
                     Recent Bookings
                  </h3>
                  <NexaButton variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>View All</NexaButton>
               </div>
               <div className="space-y-4">
                  {bookings.length > 0 ? (
                    bookings.slice(0, 3).map((booking) => (
                      <NexaCard key={booking.id} variant="flat" className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-none bg-nexa-bg-surface/30">
                         <div className="flex items-center gap-4">
                            <NexaAvatar fallback={booking.client?.name?.[0] || "C"} />
                            <div>
                               <h4 className="font-bold">{booking.client?.name || "Client"}</h4>
                               <p className="text-xs text-nexa-text-faint font-medium">{booking.status} • Scheduled for {new Date(booking.scheduled_at).toLocaleDateString()}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-12">
                            <div className="text-right">
                               <p className="text-xs font-bold">₦{booking.pro_profile?.hourly_rate?.toLocaleString() || "0"}</p>
                               <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-wider">{new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="flex items-center gap-2">
                               <NexaButton size="sm" variant="secondary">Message</NexaButton>
                               {booking.status === "PENDING" && <NexaButton size="sm">Accept</NexaButton>}
                            </div>
                         </div>
                      </NexaCard>
                    ))
                  ) : (
                    <div className="py-12 text-center text-nexa-text-faint italic bg-nexa-bg-surface/10 rounded-3xl border border-dashed border-nexa-border">
                      No recent bookings found.
                    </div>
                  )}
               </div>
            </section>
         </div>

         <aside className="space-y-12">
            
            <section>
               <NexaCard variant="glass" className="p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="font-bold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-emerald-500" />
                        Availability
                     </h3>
                     <NexaBadge variant="success">Active</NexaBadge>
                  </div>
                  <p className="text-xs text-nexa-text-secondary mb-6 leading-relaxed">
                     When enabled, you appear in the "Available for Hire" feed on the hub.
                  </p>
                  <div className="bg-nexa-bg-base p-4 rounded-2xl border border-nexa-border flex items-center justify-between mb-6">
                     <span className="text-sm font-bold">Available Now</span>
                     <div className="w-12 h-6 bg-emerald-500 rounded-full relative p-1 cursor-pointer">
                        <div className="absolute right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                     </div>
                  </div>
                  <NexaButton variant="secondary" className="w-full text-xs font-extrabold uppercase tracking-widest">Update Schedule</NexaButton>
               </NexaCard>
            </section>

            <section>
               <h3 className="text-lg font-extrabold mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-nexa-brand" />
                  Niche Pulse
               </h3>
               <div className="space-y-4">
                  {[
                    { term: "Emergency Leak", growth: "+45%", niche: "Plumbing" },
                    { term: "Weekend Service", growth: "+22%", niche: "Handyman" },
                    { term: "Premium Fixtures", growth: "+18%", niche: "Installation" },
                  ].map((trend, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-nexa-bg-surface/50 border border-nexa-border hover:border-nexa-brand/30 transition-all cursor-default">
                       <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-bold">{trend.term}</span>
                          <span className="text-[10px] font-extrabold text-emerald-500">{trend.growth}</span>
                       </div>
                       <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest">{trend.niche}</p>
                    </div>
                  ))}
               </div>
            </section>

         </aside>
      </div>
    </div>
  );
}
