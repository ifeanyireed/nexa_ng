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
  Store,
  Search,
  MessageSquare,
  Settings
} from "lucide-react";
import { cn, getProLink } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { getNicheData } from "@/lib/niche-data";
import { useAuth } from "@/components/nexa/AuthContext";
import { api } from "@/lib/api";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardOverview() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>({ profileViews: 0, newLeads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bookingsData = await api.get("/bookings");
        setBookings(bookingsData || []);
        const walletData = await api.get("/wallet");
        setWallet(walletData);
        if (user?.role === "PRO" || user?.role === "ADMIN") {
          const analyticsData = await api.get("/pro/analytics");
          if (analyticsData) setAnalytics(analyticsData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchData();
  }, [user]);

  const isPro = user?.role === "PRO";
  const nicheData = getNicheData(user?.pro_profile?.niche || "handyman-finders");
  const pathname = usePathname();
  const isClientPath = pathname?.startsWith("/client");
  const prefix = isClientPath ? "/client/dashboard" : "/dashboard";

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      const bookingsData = await api.get("/bookings");
      setBookings(bookingsData || []);
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };
  
  const kpis = isPro ? [
    { label: "Profile Views", value: analytics.profileViews.toLocaleString(), change: "+12%", trend: "up", icon: <Eye className="w-5 h-5 text-blue-500" /> },
    { label: "New Leads", value: analytics.newLeads.toLocaleString(), change: "+5%", trend: "up", icon: <Zap className="w-5 h-5 text-amber-500" /> },
    { label: "Bookings", value: bookings.length.toString(), change: "0%", trend: "neutral", icon: <Calendar className="w-5 h-5 text-emerald-500" /> },
    { label: "Wallet Balance", value: `₦${wallet?.balance?.toLocaleString() || "0"}`, change: "+8%", trend: "up", icon: <TrendingUp className="w-5 h-5 text-fuchsia-500" /> },
  ] : [
    { label: "Active Bookings", value: bookings.filter(b => b.status.toLowerCase() === "pending" || b.status.toLowerCase() === "confirmed").length.toString(), change: "0%", trend: "neutral", icon: <Calendar className="w-5 h-5 text-emerald-500" /> },
    { label: "Completed Bookings", value: bookings.filter(b => b.status.toLowerCase() === "completed").length.toString(), change: "0%", trend: "neutral", icon: <CheckCircle2 className="w-5 h-5 text-blue-500" /> },
    { label: "Total Bookings", value: bookings.length.toString(), change: "0%", trend: "neutral", icon: <Clock className="w-5 h-5 text-amber-500" /> },
    { label: "Wallet Balance", value: `₦${wallet?.balance?.toLocaleString() || "0"}`, change: "0%", trend: "neutral", icon: <TrendingUp className="w-5 h-5 text-fuchsia-500" /> },
  ];

  const quickActions = isPro ? [
    { label: "Add Portfolio", icon: <Plus className="w-6 h-6" />, desc: "Upload past work", href: `${prefix}/profile` },
    { label: "Post a Deal", icon: <Tag className="w-6 h-6" />, desc: "Create discount", href: `${prefix}/deals` },
    { label: "Write Article", icon: <FileText className="w-6 h-6" />, desc: "SEO boost", href: `${prefix}/articles` },
    { label: "Add Product", icon: <ShoppingBag className="w-6 h-6" />, desc: "NexaShop item", href: `${prefix}/shop` },
    { label: "Get Verified", icon: <ShieldCheck className="w-6 h-6" />, desc: "CAC Upload", href: `${prefix}/profile` },
    { label: "Invite Leads", icon: <Users className="w-6 h-6" />, desc: "Share profile", href: `${prefix}/profile` },
  ] : [
    { label: "Find a Pro", icon: <Search className="w-6 h-6" />, desc: "Explore niches", href: "/" },
    { label: "Deposit Funds", icon: <TrendingUp className="w-6 h-6" />, desc: "Top up wallet", href: `${prefix}/wallet` },
    { label: "My Bookings", icon: <Calendar className="w-6 h-6" />, desc: "Manage appointments", href: `${prefix}/bookings` },
    { label: "Inbox Messages", icon: <MessageSquare className="w-6 h-6" />, desc: "Chat with pros", href: `${prefix}/messages` },
    { label: "NexaShop", icon: <ShoppingBag className="w-6 h-6" />, desc: "Buy products", href: "/shop" },
    { label: "Account Settings", icon: <Settings className="w-6 h-6" />, desc: "Update details", href: `${prefix}/settings` },
  ];

  return (
    <div className="space-y-12">
      {/* NICHE CONTEXT BAR */}
      <NexaCard variant="glass" padding="none" className="overflow-hidden bg-gradient-to-r from-nexa-brand/10 to-transparent border-nexa-brand/20">
         <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6 text-center md:text-left">
               <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl bg-emerald-500")}>
                  <Store className="w-8 h-8" />
               </div>
               <div>
                  <h3 className="text-2xl font-extrabold text-display">Welcome, {user?.name}</h3>
                  <p className="text-nexa-text-secondary text-sm">
                    {isPro 
                      ? `Managing your listings in the ${nicheData?.name || "Marketplace"}.` 
                      : "Manage your bookings and wallet here."}
                  </p>
               </div>
            </div>
            {isPro ? (
              <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-800/50 p-2 rounded-2xl border border-nexa-border">
                 <div className="px-4 py-2">
                    <p className="text-[10px] text-nexa-text-faint font-extrabold uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-xs font-bold">{user?.pro_profile?.verified ? "Live & Verified" : "Awaiting Verification"}</span>
                    </div>
                 </div>
                 <Link href={user?.pro_profile ? getProLink({ ...user.pro_profile, user }) : "#"}>
                    <NexaButton size="sm" variant="secondary" rightIcon={<Eye className="w-4 h-4" />}>Preview Profile</NexaButton>
                 </Link>
              </div>
            ) : (
              <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-800/50 p-2 rounded-2xl border border-nexa-border">
                 <div className="px-4 py-2">
                    <p className="text-[10px] text-nexa-text-faint font-extrabold uppercase tracking-widest mb-1">Account Type</p>
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-xs font-bold">Standard Client</span>
                    </div>
                 </div>
                 <Link href="/">
                    <NexaButton size="sm" variant="secondary" rightIcon={<ArrowRight className="w-4 h-4" />}>Find Services</NexaButton>
                 </Link>
              </div>
            )}
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
                  {quickActions.map((action, i) => (
                    <Link href={action.href} key={i}>
                      <NexaCard variant="interactive" className="p-6 flex flex-col items-center text-center group cursor-pointer border-none bg-nexa-bg-surface/50 h-full">
                         <div className="w-12 h-12 rounded-2xl bg-nexa-brand/10 text-nexa-brand flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-nexa-brand group-hover:text-white transition-all shadow-sm mx-auto">
                            {action.icon}
                         </div>
                         <h4 className="font-bold text-sm mb-1">{action.label}</h4>
                         <p className="text-[10px] text-nexa-text-faint uppercase font-bold">{action.desc}</p>
                      </NexaCard>
                    </Link>
                  ))}
               </div>
            </section>

            <section>
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-extrabold flex items-center gap-2">
                     <Calendar className="w-5 h-5 text-nexa-brand" />
                     Recent Bookings
                  </h3>
                  <Link href={`${prefix}/bookings`}>
                     <NexaButton variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>View All</NexaButton>
                  </Link>
               </div>
               <div className="space-y-4">
                  {bookings.length > 0 ? (
                    bookings.slice(0, 3).map((booking) => {
                      const clientName = booking.client?.name;
                      const proName = booking.proProfile?.businessName;
                      const displayName = isPro ? (clientName || "Client") : (proName || "Nexa Professional");
                      const displayFallback = displayName.charAt(0);

                      return (
                        <NexaCard key={booking.id} variant="flat" className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-none bg-nexa-bg-surface/30">
                           <div className="flex items-center gap-4">
                              <NexaAvatar fallback={displayFallback} />
                              <div>
                                 <h4 className="font-bold">{displayName}</h4>
                                 <p className="text-xs text-nexa-text-faint font-medium">{booking.status} • Scheduled for {new Date(booking.scheduledAt || booking.scheduled_at).toLocaleDateString()}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-12">
                              <div className="text-right">
                                 <p className="text-xs font-bold">₦{(booking.amount || booking.proProfile?.hourlyRate || 0).toLocaleString()}</p>
                                 <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-wider">{new Date(booking.scheduledAt || booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Link href={`${prefix}/messages`}>
                                    <NexaButton size="sm" variant="secondary">Message</NexaButton>
                                 </Link>
                                 {booking.status === "PENDING" && isPro && (
                                    <NexaButton size="sm" onClick={() => handleUpdateStatus(booking.id, "CONFIRMED")}>Accept</NexaButton>
                                 )}
                              </div>
                           </div>
                        </NexaCard>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-nexa-text-faint italic bg-nexa-bg-surface/10 rounded-3xl border border-dashed border-nexa-border">
                      No recent bookings found.
                    </div>
                  )}
               </div>
            </section>
         </div>

         <aside className="space-y-12">
            {isPro ? (
              <>
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
                      <Link href={`${prefix}/availability`}>
                        <NexaButton variant="secondary" className="w-full text-xs font-extrabold uppercase tracking-widest">Update Schedule</NexaButton>
                      </Link>
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
              </>
            ) : (
              <>
                <section>
                   <NexaCard variant="glass" className="p-6 bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/20">
                      <div className="flex items-center justify-between mb-6">
                         <h3 className="font-bold flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" />
                            Nexa Escrow Protect
                         </h3>
                         <NexaBadge variant="success">Protected</NexaBadge>
                      </div>
                      <p className="text-xs text-nexa-text-secondary mb-6 leading-relaxed">
                         All bookings on Nexa are protected by our 100% secure escrow payment system.
                      </p>
                      <ul className="space-y-3 mb-6">
                        <li className="flex items-start gap-2 text-xs font-medium text-nexa-text-secondary">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Payments held securely in escrow.</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs font-medium text-nexa-text-secondary">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Released only when service is complete.</span>
                        </li>
                        <li className="flex items-start gap-2 text-xs font-medium text-nexa-text-secondary">
                          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>Full refund if pro doesn't show.</span>
                        </li>
                      </ul>
                      <Link href={`${prefix}/wallet`}>
                         <NexaButton variant="secondary" className="w-full text-xs font-extrabold uppercase tracking-widest">View Wallet Details</NexaButton>
                      </Link>
                   </NexaCard>
                </section>

                <section>
                   <h3 className="text-lg font-extrabold mb-6 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-nexa-brand" />
                      Nexa News & Tips
                   </h3>
                   <div className="space-y-4">
                      {[
                        { term: "Avoid Upfront Cash", desc: "Always pay through the Nexa Wallet to keep your funds protected under escrow.", tag: "Safety" },
                        { term: "Check Verified Badges", desc: "Pros with a green verified shield have submitted credentials.", tag: "Trust" },
                        { term: "NexaShop is Live", desc: "Purchase products recommended by professionals directly from their catalogs.", tag: "Shop" },
                      ].map((tip, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-nexa-bg-surface/50 border border-nexa-border hover:border-nexa-brand/30 transition-all cursor-default">
                           <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-bold">{tip.term}</span>
                              <span className="text-[10px] font-extrabold text-emerald-500">{tip.tag}</span>
                           </div>
                           <p className="text-xs text-nexa-text-secondary mt-1">{tip.desc}</p>
                        </div>
                      ))}
                   </div>
                </section>
              </>
            )}
         </aside>
      </div>
    </div>
  );
}
