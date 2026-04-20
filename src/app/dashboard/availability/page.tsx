"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  Calendar as CalendarIcon, 
  ToggleRight, 
  ToggleLeft,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { AddTimeOffModal } from "@/components/nexa/AddTimeOffModal";

export default function AvailabilityManagerPage() {
  const [isAvailableNow, setIsAvailableNow] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [schedule, setSchedule] = useState([
    { day: "Monday", active: true, start: "08:00 AM", end: "06:00 PM" },
    { day: "Tuesday", active: true, start: "08:00 AM", end: "06:00 PM" },
    { day: "Wednesday", active: true, start: "08:00 AM", end: "06:00 PM" },
    { day: "Thursday", active: true, start: "08:00 AM", end: "06:00 PM" },
    { day: "Friday", active: true, start: "08:00 AM", end: "06:00 PM" },
    { day: "Saturday", active: true, start: "10:00 AM", end: "04:00 PM" },
    { day: "Sunday", active: false, start: "00:00", end: "00:00" },
  ]);

  const [exceptions, setExceptions] = useState([
    { date: "Dec 25, 2026", reason: "Christmas Holiday" },
    { date: "Jan 1, 2027", reason: "New Year" }
  ]);

  const handleAddException = (newException: any) => {
    setExceptions([...exceptions, newException]);
  };

  const toggleDay = (index: number) => {
    const newSchedule = [...schedule];
    newSchedule[index].active = !newSchedule[index].active;
    setSchedule(newSchedule);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-extrabold text-display mb-2">Availability & Schedule</h1>
            <p className="text-nexa-text-secondary">Manage your working hours and instant hiring status.</p>
         </div>
         <NexaButton size="lg" leftIcon={<Save className="w-5 h-5" />}>
            Save Changes
         </NexaButton>
      </header>

      {/* AVAILABLE NOW TOGGLE */}
      <NexaCard variant="glass" className="p-6 md:p-8 bg-gradient-to-r from-emerald-500/10 to-transparent border-emerald-500/20">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className={cn(
                 "w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-colors",
                 isAvailableNow ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
               )}>
                  <Clock className="w-8 h-8" />
               </div>
               <div>
                  <h2 className="text-xl font-bold mb-1">Instant Availability</h2>
                  <p className="text-nexa-text-secondary text-sm max-w-lg">
                    Turn this on to appear in the "Available Now" feed on your Niche Hub. Buyers can hire you instantly for immediate dispatch.
                  </p>
               </div>
            </div>
            
            <button 
              onClick={() => setIsAvailableNow(!isAvailableNow)}
              className="relative inline-flex h-12 w-24 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 bg-nexa-bg-base"
              style={{ backgroundColor: isAvailableNow ? "#10b981" : "" }}
            >
              <span className="sr-only">Use setting</span>
              <span
                aria-hidden="true"
                className={cn(
                  isAvailableNow ? "translate-x-12" : "translate-x-0",
                  "pointer-events-none inline-block h-11 w-11 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
                )}
              />
            </button>
         </div>
      </NexaCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* WEEKLY SCHEDULE */}
         <div className="lg:col-span-2 space-y-6">
            <NexaCard variant="flat" className="p-0 overflow-hidden">
               <div className="p-6 border-b border-nexa-border bg-nexa-bg-surface/50">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                     <CalendarIcon className="w-5 h-5 text-nexa-brand" />
                     Standard Operating Hours
                  </h3>
               </div>
               <div className="divide-y divide-nexa-border">
                  {schedule.map((day, i) => (
                     <div key={day.day} className={cn(
                        "p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors",
                        !day.active && "bg-nexa-bg-surface opacity-60"
                     )}>
                        <div className="flex items-center gap-4 w-40">
                           <button 
                             onClick={() => toggleDay(i)}
                             className={cn(
                               "w-6 h-6 rounded-md flex items-center justify-center border",
                               day.active ? "bg-nexa-brand border-nexa-brand text-white" : "border-nexa-border text-transparent"
                             )}
                           >
                              <CheckCircle2 className="w-4 h-4" />
                           </button>
                           <span className="font-bold">{day.day}</span>
                        </div>

                        {day.active ? (
                           <div className="flex items-center gap-4 flex-1 sm:justify-end">
                              <select className="bg-nexa-bg-base border border-nexa-border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-nexa-brand" defaultValue={day.start}>
                                 <option>07:00 AM</option>
                                 <option>08:00 AM</option>
                                 <option>09:00 AM</option>
                                 <option>10:00 AM</option>
                              </select>
                              <span className="text-nexa-text-faint font-medium">to</span>
                              <select className="bg-nexa-bg-base border border-nexa-border rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-nexa-brand" defaultValue={day.end}>
                                 <option>04:00 PM</option>
                                 <option>05:00 PM</option>
                                 <option>06:00 PM</option>
                                 <option>07:00 PM</option>
                                 <option>08:00 PM</option>
                              </select>
                           </div>
                        ) : (
                           <div className="flex-1 sm:text-right">
                              <NexaBadge variant="neutral">Closed</NexaBadge>
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </NexaCard>
         </div>

         {/* EXCEPTIONS & TIME OFF */}
         <div className="space-y-6">
            <NexaCard variant="flat" className="p-0 overflow-hidden">
               <div className="p-6 border-b border-nexa-border bg-nexa-bg-surface/50 flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                     <AlertCircle className="w-5 h-5 text-amber-500" />
                     Time Off
                  </h3>
                  <NexaButton variant="ghost" size="sm" className="p-2 h-auto" onClick={() => setIsModalOpen(true)}>
                     <Plus className="w-5 h-5" />
                  </NexaButton>
               </div>
               <div className="p-6 space-y-4">
                  {exceptions.map((exc, i) => (
                     <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-nexa-border bg-nexa-bg-base">
                        <div>
                           <p className="font-bold text-sm mb-1">{exc.reason}</p>
                           <p className="text-[10px] text-nexa-text-faint uppercase font-extrabold tracking-wider">{exc.date}</p>
                        </div>
                        <button className="p-2 text-nexa-text-faint hover:text-red-500 transition-colors">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  ))}
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-nexa-border text-nexa-text-faint hover:text-nexa-brand hover:border-nexa-brand hover:bg-nexa-brand/5 transition-all font-bold text-sm"
                  >
                     <Plus className="w-4 h-4" />
                     Add Time Off
                  </button>
               </div>
            </NexaCard>
         </div>
      </div>

      <AddTimeOffModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAddException={handleAddException} 
      />
    </div>
  );
}
