"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  UserCircle, 
  Calendar, 
  ShoppingBag, 
  MessageSquare, 
  BarChart3, 
  Zap, 
  Plus, 
  Settings, 
  LogOut,
  Bell,
  Search,
  CheckCircle2,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  ChevronRight,
  Eye,
  FileText,
  Tag,
  Star,
  Users,
  ShieldCheck,
  Menu,
  X,
  Store,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { NICHE_DETAILS } from "@/lib/niche-data";
import Link from "next/link";

export default function DashboardClient() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeNiche] = useState("home-services"); // Mocking a registered seller in Home Services
  const data = NICHE_DETAILS["handyman-finders"]; // Using handyman-finders data for mock
  
  const menuItems = [
    { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, active: true },
    { label: "My Profile", icon: <UserCircle className="w-5 h-5" /> },
    { label: "Bookings", icon: <Calendar className="w-5 h-5" />, badge: "3" },
    { label: "NexaShop", icon: <ShoppingBag className="w-5 h-5" /> },
    { label: "Messages", icon: <MessageSquare className="w-5 h-5" />, badge: "12" },
    { label: "Articles", icon: <FileText className="w-5 h-5" /> },
    { label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
  ];

  const kpis = [
    { label: "Profile Views", value: "1,240", change: "+12%", trend: "up", icon: <Eye className="w-5 h-5 text-blue-500" /> },
    { label: "New Leads", value: "48", change: "+5%", trend: "up", icon: <Zap className="w-5 h-5 text-amber-500" /> },
    { label: "Bookings", value: "12", change: "0%", trend: "neutral", icon: <Calendar className="w-5 h-5 text-emerald-500" /> },
    { label: "Earnings", value: "₦420k", change: "+8%", trend: "up", icon: <TrendingUp className="w-5 h-5 text-fuchsia-500" /> },
  ];

  return (
    <div className="min-h-screen bg-nexa-bg-base flex overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={cn(
        "bg-nexa-bg-surface border-r border-nexa-border transition-all duration-500 flex flex-col z-50",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        <div className="p-6 flex items-center justify-between">
           {isSidebarOpen && (
             <Link href="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="Nexa" className="w-8 h-8" />
                <span className="text-xl font-extrabold text-display">Nexa</span>
             </Link>
           )}
           {!isSidebarOpen && <img src="/logo.png" alt="Nexa" className="w-8 h-8 mx-auto" />}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
           {menuItems.map((item, i) => (
             <button
               key={i}
               className={cn(
                 "w-full flex items-center gap-4 p-3 rounded-xl transition-all group",
                 item.active ? "bg-nexa-brand text-white shadow-lg shadow-nexa-brand/20" : "text-nexa-text-faint hover:bg-nexa-bg-base hover:text-nexa-text-primary"
               )}
             >
                <div className={cn("transition-transform group-hover:scale-110", item.active ? "text-white" : "text-nexa-brand")}>
                  {item.icon}
                </div>
                {isSidebarOpen && (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="font-bold text-sm">{item.label}</span>
                    {item.badge && (
                      <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
             </button>
           ))}
        </nav>

        <div className="p-4 border-t border-nexa-border space-y-2">
           <button className="w-full flex items-center gap-4 p-3 rounded-xl text-nexa-text-faint hover:bg-nexa-bg-base hover:text-nexa-text-primary transition-all">
              <Settings className="w-5 h-5" />
              {isSidebarOpen && <span className="font-bold text-sm">Settings</span>}
           </button>
           <button className="w-full flex items-center gap-4 p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all">
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="font-bold text-sm">Logout</span>}
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        
        {/* DASHBOARD HEADER */}
        <header className="h-20 bg-nexa-bg-surface/80 backdrop-blur-xl border-b border-nexa-border sticky top-0 z-40 px-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-nexa-bg-base rounded-xl transition-colors"
              >
                 <Menu className="w-5 h-5 text-nexa-text-secondary" />
              </button>
              <h2 className="text-xl font-bold hidden md:block">Welcome back, Kola</h2>
           </div>

           <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center bg-nexa-bg-base px-4 py-2 rounded-xl border border-nexa-border gap-3 w-64">
                 <Search className="w-4 h-4 text-nexa-text-faint" />
                 <input type="text" placeholder="Search orders..." className="bg-transparent text-xs outline-none w-full" />
              </div>
              <div className="relative p-2 hover:bg-nexa-bg-base rounded-xl cursor-pointer">
                 <Bell className="w-5 h-5 text-nexa-text-secondary" />
                 <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
              </div>
              <div className="h-8 w-px bg-nexa-border" />
              <div className="flex items-center gap-3">
                 <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold">Kola Adewale</p>
                    <p className="text-[10px] text-emerald-500 font-extrabold uppercase">Home Expert</p>
                 </div>
                 <NexaAvatar size="md" isOnline />
              </div>
           </div>
        </header>

        <div className="p-8">
           
           {/* NICHE CONTEXT BAR */}
           <NexaCard variant="glass" padding="none" className="mb-12 overflow-hidden bg-gradient-to-r from-nexa-brand/10 to-transparent border-nexa-brand/20">
              <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                 <div className="flex items-center gap-6 text-center md:text-left">
                    <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl", data.colorClass)}>
                       <Store className="w-8 h-8" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-extrabold text-display">Your Home Services Hub</h3>
                       <p className="text-nexa-text-secondary text-sm">Managing your listings in the <span className="text-nexa-brand font-bold uppercase tracking-wider">Handyman Finders</span> sub-group.</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-4 bg-white/50 dark:bg-slate-800/50 p-2 rounded-2xl border border-nexa-border">
                    <div className="px-4 py-2">
                       <p className="text-[10px] text-nexa-text-faint font-extrabold uppercase tracking-widest mb-1">Status</p>
                       <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-xs font-bold">Live & Verified</span>
                       </div>
                    </div>
                    <Link href="/home-services/kola-handyman-services">
                       <NexaButton size="sm" variant="secondary" rightIcon={<Eye className="w-4 h-4" />}>Preview Profile</NexaButton>
                    </Link>
                 </div>
              </div>
           </NexaCard>

           {/* KPI GRID */}
           <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
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
              
              {/* LEFT & CENTER COLUMNS */}
              <div className="lg:col-span-2 space-y-12">
                 
                 {/* QUICK ACTIONS */}
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

                 {/* RECENT BOOKINGS */}
                 <section>
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-lg font-extrabold flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-nexa-brand" />
                          Recent Bookings
                       </h3>
                       <NexaButton variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>View All</NexaButton>
                    </div>
                    <div className="space-y-4">
                       {[1, 2, 3].map((item) => (
                         <NexaCard key={item} variant="flat" className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-none bg-nexa-bg-surface/30">
                            <div className="flex items-center gap-4">
                               <NexaAvatar fallback={`C${item}`} isOnline={item === 1} />
                               <div>
                                  <h4 className="font-bold">Customer Name {item}</h4>
                                  <p className="text-xs text-nexa-text-faint font-medium">Lekki Phase 1 • Standard Plumbing Check</p>
                               </div>
                            </div>
                            <div className="flex items-center gap-12">
                               <div className="text-right">
                                  <p className="text-xs font-bold">₦15,000</p>
                                  <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-wider">Tomorrow, 10 AM</p>
                               </div>
                               <div className="flex items-center gap-2">
                                  <NexaButton size="sm" variant="secondary">Message</NexaButton>
                                  <NexaButton size="sm">Accept</NexaButton>
                               </div>
                            </div>
                         </NexaCard>
                       ))}
                    </div>
                 </section>
              </div>

              {/* RIGHT COLUMN */}
              <aside className="space-y-12">
                 
                 {/* AVAILABILITY MANAGER */}
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
                          When enabled, you appear in the "Available for Hire" feed on the Home Services hub.
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

                 {/* NICHE PULSE */}
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
                    <NexaCard variant="glass" className="mt-8 p-6 bg-nexa-brand/5 border-nexa-brand/10">
                       <h4 className="text-sm font-extrabold mb-2">Tip of the Day</h4>
                       <p className="text-xs text-nexa-text-secondary leading-relaxed">
                          "Adding at least 3 photos of your latest project can increase your lead conversion by up to 25%."
                       </p>
                    </NexaCard>
                 </section>

              </aside>
           </div>
        </div>
      </main>
    </div>
  );
}
