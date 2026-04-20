"use client";

import React, { useState } from "react";
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
import { NexaInput } from "@/components/nexa/NexaInput";

export default function BookingsManagerPage() {
  const [activeTab, setActiveTab] = useState("pending");
  
  const bookings = [
    {
      id: "BK-1024",
      customer: "Amina Sanni",
      service: "Standard Plumbing Check",
      date: "Oct 20, 2026",
      time: "10:00 AM",
      status: "pending",
      amount: "₦15,000",
      location: "Lekki Phase 1",
      phone: "+234 803 111 2222"
    },
    {
      id: "BK-1025",
      customer: "Chidi Okafor",
      service: "Emergency Leak Repair",
      date: "Oct 20, 2026",
      time: "02:30 PM",
      status: "confirmed",
      amount: "₦25,000",
      location: "Victoria Island",
      phone: "+234 802 333 4444"
    },
    {
      id: "BK-1022",
      customer: "Tunde Bakare",
      service: "Full House Inspection",
      date: "Oct 18, 2026",
      time: "09:00 AM",
      status: "completed",
      amount: "₦40,000",
      location: "Ikoyi",
      phone: "+234 805 555 6666"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <NexaBadge variant="neutral" className="bg-amber-500/10 text-amber-600 border-amber-500/20">Pending</NexaBadge>;
      case "confirmed": return <NexaBadge variant="brand">Confirmed</NexaBadge>;
      case "completed": return <NexaBadge variant="success">Completed</NexaBadge>;
      case "cancelled": return <NexaBadge variant="neutral" className="bg-red-500/10 text-red-600 border-red-500/20">Cancelled</NexaBadge>;
      default: return null;
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (activeTab === "all") return true;
    return b.status === activeTab;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-display">Booking Manager</h1>
          <p className="text-nexa-text-secondary text-sm mt-1">Track and manage your upcoming service appointments.</p>
        </div>
        <div className="flex items-center gap-3">
          <NexaButton variant="secondary" leftIcon={<Filter className="w-4 h-4" />}>Filter</NexaButton>
          <NexaButton leftIcon={<CalendarIcon className="w-4 h-4" />}>Schedule Availability</NexaButton>
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
              placeholder="Search by customer name or booking ID..." 
              className="w-full h-12 pl-12 pr-4 bg-nexa-bg-surface border border-nexa-border rounded-xl focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all text-sm"
            />
          </div>

          {/* BOOKING FEED */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredBookings.map((booking) => (
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
                          {booking.date.split(' ')[0]}
                        </span>
                        <span className="text-3xl font-extrabold leading-none">
                          {booking.date.split(' ')[1].replace(',', '')}
                        </span>
                        <div className="flex items-center gap-1 mt-2 text-nexa-brand font-bold text-[10px]">
                           <Clock className="w-3 h-3" />
                           {booking.time}
                        </div>
                      </div>

                      {/* Main Info */}
                      <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                          <NexaAvatar fallback={booking.customer.charAt(0)} />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">{booking.customer}</h3>
                              <span className="text-[10px] text-nexa-text-faint font-medium">#{booking.id}</span>
                            </div>
                            <p className="text-sm text-nexa-text-secondary font-medium">{booking.service}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-nexa-text-faint uppercase">
                               <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {booking.location}
                               </div>
                               <span>•</span>
                               <span className="text-nexa-brand">{booking.amount}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                           {getStatusBadge(booking.status)}
                           <div className="flex items-center gap-2">
                              <button className="p-2 rounded-xl bg-nexa-bg-base border border-nexa-border text-nexa-text-secondary hover:text-nexa-brand transition-colors">
                                 <MessageSquare className="w-4 h-4" />
                              </button>
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

                    {/* Pending Actions */}
                    {booking.status === "pending" && (
                       <div className="bg-amber-500/5 border-t border-amber-500/10 p-3 px-6 flex items-center justify-between">
                          <p className="text-[10px] font-bold text-amber-700 flex items-center gap-2 uppercase tracking-widest">
                             <AlertCircle className="w-3.5 h-3.5" />
                             Awaiting your confirmation
                          </p>
                          <div className="flex items-center gap-3">
                             <NexaButton size="sm" variant="ghost" className="text-red-500 hover:bg-red-50">Decline</NexaButton>
                             <NexaButton size="sm">Accept Booking</NexaButton>
                          </div>
                       </div>
                    )}
                  </NexaCard>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredBookings.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-nexa-bg-surface rounded-full flex items-center justify-center mx-auto text-nexa-text-faint">
                   <CalendarIcon className="w-10 h-10" />
                </div>
                <h3 className="font-bold text-xl">No {activeTab} bookings found</h3>
                <p className="text-nexa-text-secondary max-w-xs mx-auto">Your customers haven't scheduled any services in this category yet.</p>
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
                   { label: "Bookings", val: "24", change: "+15%" },
                   { label: "Completion", val: "92%", change: "+2%" },
                   { label: "Revenue", val: "₦340k", change: "+24%" },
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
                 <NexaButton variant="ghost" className="w-full text-xs font-extrabold uppercase tracking-widest text-nexa-brand" rightIcon={<ArrowRight className="w-4 h-4" />}>View Detailed Reports</NexaButton>
              </div>
           </NexaCard>

        </aside>

      </div>
    </div>
  );
}
