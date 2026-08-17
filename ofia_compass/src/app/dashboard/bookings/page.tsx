"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/nexa/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  MessageSquare,
  Phone,
  User,
  Search,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import Link from "next/link";

export default function BookingsManagerPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("pending");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isPro = user?.role === "PRO";

  const fetchBookings = async () => {
    try {
      const data = await api.get("/bookings");
      setBookings(data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.put(`/bookings/${id}/status`, { status });
      fetchBookings();
    } catch (error) {
      console.error("Error updating booking status:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return <NexaBadge variant="neutral" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</NexaBadge>;
      case "confirmed": return <NexaBadge variant="brand">Confirmed</NexaBadge>;
      case "completed": return <NexaBadge variant="success">Completed</NexaBadge>;
      case "cancelled": return <NexaBadge variant="neutral" className="bg-red-500/10 text-red-600 border-red-500/20">Cancelled</NexaBadge>;
      case "declined": return <NexaBadge variant="neutral" className="bg-red-500/10 text-red-600 border-red-500/20">Declined</NexaBadge>;
      default: return <NexaBadge variant="neutral">{status}</NexaBadge>;
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === "all") return true;
    return b.status.toLowerCase() === activeTab.toLowerCase();
  });

  // Calculate dynamic stats
  const totalCount = bookings.length;
  const activeCount = bookings.filter(b => b.status.toLowerCase() === "confirmed" || b.status.toLowerCase() === "pending").length;
  const completedCount = bookings.filter(b => b.status.toLowerCase() === "completed").length;
  
  const totalFinancial = bookings
    .filter(b => b.status.toLowerCase() === "completed" || b.status.toLowerCase() === "confirmed")
    .reduce((sum, b) => sum + (b.amount || 0), 0);

  if (loading) return (
     <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-nexa-bg-surface rounded-[32px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="md:col-span-2 space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-32 bg-nexa-bg-surface rounded-3xl" />)}
           </div>
           <div className="h-64 bg-nexa-bg-surface rounded-3xl" />
        </div>
     </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-display">Booking Manager</h1>
          <p className="text-nexa-text-secondary text-sm mt-1">
            {isPro 
              ? "Track and manage your upcoming service appointments and customer requests." 
              : "Track and manage your appointments with Nexa service professionals."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NexaButton variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>Filter</NexaButton>
          {isPro ? (
            <NexaButton leftIcon={<CalendarIcon className="w-4 h-4" />}>Schedule Availability</NexaButton>
          ) : (
            <Link href="/">
              <NexaButton leftIcon={<Search className="w-4 h-4" />}>Find Services</NexaButton>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* LEFT COLUMN: LIST & TABS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TABS */}
          <div className="flex items-center gap-2 p-1 bg-nexa-bg-surface border border-nexa-border rounded-xl overflow-x-auto no-scrollbar">
            {["pending", "confirmed", "completed", "all"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all whitespace-nowrap",
                  activeTab === tab 
                    ? "bg-white dark:bg-slate-800 text-nexa-brand shadow-sm border border-nexa-border" 
                    : "text-nexa-text-faint hover:text-nexa-text-secondary"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* SEARCH BAR */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nexa-text-faint" />
            <input 
              type="text" 
              placeholder={isPro ? "Search by customer name or service..." : "Search by professional name or service..."}
              className="w-full h-12 pl-12 pr-4 bg-nexa-bg-surface border border-nexa-border rounded-xl focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all text-sm"
            />
          </div>

          {/* BOOKING FEED */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredBookings.map((booking) => {
                const displayName = isPro 
                  ? (booking.client?.name || "Client") 
                  : (booking.proProfile?.businessName || booking.proProfile?.user?.name || "Professional");
                const avatarLetter = displayName.charAt(0).toUpperCase();

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                  >
                    <NexaCard variant="interactive" className="p-0 overflow-hidden border-none bg-nexa-bg-surface/50 group">
                      <div className="flex flex-col md:flex-row md:items-stretch">
                        {/* Date Part */}
                        <div className="md:w-32 bg-nexa-bg-base p-6 flex flex-col items-center justify-center text-center border-r border-nexa-border">
                          <span className="text-[10px] font-extrabold uppercase text-nexa-text-faint tracking-widest mb-1">
                            {new Date(booking.scheduledAt).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-3xl font-extrabold leading-none">
                            {new Date(booking.scheduledAt).getDate()}
                          </span>
                          <div className="flex items-center gap-1 mt-2 text-nexa-brand font-bold text-[10px]">
                             <Clock className="w-3 h-3" />
                             {new Date(booking.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <NexaAvatar fallback={avatarLetter} name={displayName} />
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg">{displayName}</h3>
                                <span className="text-[10px] text-nexa-text-faint font-medium">#{booking.id.slice(-6).toUpperCase()}</span>
                              </div>
                              <p className="text-sm text-nexa-text-secondary font-medium">{booking.serviceName || "Service"}</p>
                              <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-nexa-text-faint uppercase">
                                 <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    Lagos, Nigeria
                                 </div>
                                 <span>•</span>
                                 <span className="text-nexa-brand">₦{(booking.amount || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-3">
                             {getStatusBadge(booking.status)}
                             <div className="flex items-center gap-2">
                                <Link href="/dashboard/messages">
                                  <button className="p-2 rounded-xl bg-nexa-bg-base border border-nexa-border text-nexa-text-secondary hover:text-nexa-brand transition-colors">
                                     <MessageSquare className="w-4 h-4" />
                                  </button>
                                </Link>
                                <button className="p-2 rounded-xl bg-nexa-bg-base border border-nexa-border text-nexa-text-secondary hover:text-emerald-500 transition-colors">
                                   <Phone className="w-4 h-4" />
                                </button>
                                <div className="relative">
                                   <button className="p-2 rounded-xl bg-nexa-bg-base border border-nexa-border text-nexa-text-secondary hover:bg-white transition-colors">
                                      <MoreHorizontal className="w-4 h-4" />
                                   </button>
                                </div>
                             </div>
                          </div>
                        </div>
                      </div>

                      {/* Pending Actions (Pro View) */}
                      {booking.status.toLowerCase() === "pending" && isPro && (
                         <div className="bg-amber-500/5 border-t border-amber-500/10 p-3 px-6 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-amber-700 flex items-center gap-2 uppercase tracking-widest">
                               <AlertCircle className="w-3.5 h-3.5" />
                               Awaiting your confirmation
                            </p>
                            <div className="flex items-center gap-3">
                               <NexaButton size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleUpdateStatus(booking.id, "DECLINED")}>Decline</NexaButton>
                               <NexaButton size="sm" onClick={() => handleUpdateStatus(booking.id, "CONFIRMED")}>Accept Booking</NexaButton>
                            </div>
                         </div>
                      )}

                      {/* Cancel Actions (Client View) */}
                      {["pending", "confirmed"].includes(booking.status.toLowerCase()) && !isPro && (
                         <div className="bg-red-500/5 border-t border-red-500/10 p-3 px-6 flex items-center justify-between">
                            <p className="text-[10px] font-bold text-red-700 flex items-center gap-2 uppercase tracking-widest">
                               <AlertCircle className="w-3.5 h-3.5" />
                               Manage Appointment
                            </p>
                            <div className="flex items-center gap-3">
                               <NexaButton size="sm" variant="ghost" className="text-red-500 hover:bg-red-50" onClick={() => handleUpdateStatus(booking.id, "CANCELLED")}>Cancel Booking</NexaButton>
                            </div>
                         </div>
                      )}
                    </NexaCard>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredBookings.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-nexa-bg-surface rounded-full flex items-center justify-center mx-auto text-nexa-text-faint">
                   <CalendarIcon className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-xl">No {activeTab} bookings found</h3>
                <p className="text-nexa-text-secondary max-w-xs mx-auto">
                  {isPro 
                    ? "Your customers haven't scheduled any services in this category yet." 
                    : "You haven't scheduled any service appointments in this category yet."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CALENDAR & STATS */}
        <aside className="space-y-8">
           
           {/* MINI CALENDAR WIDGET */}
           <NexaCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold">October 2026</h3>
                 <div className="flex items-center gap-1">
                    <button className="p-1 hover:bg-nexa-bg-base rounded-md transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    <button className="p-1 hover:bg-nexa-bg-base rounded-md transition-colors"><ChevronRight className="w-4 h-4" /></button>
                 </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                 {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                   <span key={`${d}-${i}`} className="text-[10px] font-extrabold text-nexa-text-faint">{d}</span>
                 ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                 {[...Array(31)].map((_, i) => {
                    const day = i + 1;
                    const isToday = day === 16;
                    const hasBooking = [18, 20, 24].includes(day);
                    return (
                      <div 
                        key={i} 
                        className={cn(
                          "h-10 flex flex-col items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer relative",
                          isToday ? "bg-nexa-brand text-white shadow-lg shadow-nexa-brand/20" : "hover:bg-nexa-bg-base",
                          hasBooking && !isToday && "text-nexa-brand"
                        )}
                      >
                         {day}
                         {hasBooking && (
                            <div className={cn("absolute bottom-1 w-1 h-1 rounded-full", isToday ? "bg-white" : "bg-nexa-brand")} />
                         )}
                      </div>
                    );
                 })}
              </div>
           </NexaCard>

           {/* BOOKING STATS */}
           <NexaCard variant="glass" className="p-8 bg-gradient-to-br from-nexa-brand/5 to-transparent border-nexa-brand/20">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-nexa-text-faint mb-6">Monthly Summary</h3>
              <div className="space-y-6">
                 {[
                   { label: "Total Bookings", val: totalCount, change: `+${totalCount}` },
                   { label: isPro ? "Completed" : "Active Bookings", val: isPro ? completedCount : activeCount, change: "Current" },
                   { label: isPro ? "Revenue" : "Total Spend", val: `₦${totalFinancial.toLocaleString()}`, change: "Processed" },
                 ].map((stat, i) => (
                   <div key={i} className="flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-bold text-nexa-text-secondary uppercase">{stat.label}</p>
                         <p className="text-xl font-extrabold">{stat.val}</p>
                      </div>
                      <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{stat.change}</span>
                   </div>
                 ))}
              </div>
              <div className="pt-8 mt-8 border-t border-nexa-border">
                 <NexaButton variant="ghost" className="w-full text-xs font-extrabold uppercase tracking-widest text-nexa-brand" rightIcon={<ArrowRight className="w-4 h-4" />}>
                   {isPro ? "View Detailed Reports" : "Browse Service Catalog"}
                 </NexaButton>
              </div>
           </NexaCard>

        </aside>

      </div>
    </div>
  );
}
