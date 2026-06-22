"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "./NexaButton";
import { NexaCard } from "./NexaCard";
import { NexaBadge } from "./NexaBadge";
import { NexaVerifiedBadge } from "./NexaVerifiedBadge";
import { api } from "@/lib/api";
import Link from "next/link";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  serviceName?: string;
  proProfileId?: string;
  initialDate?: Date;
  initialTime?: string;
}

export function BookingModal({ isOpen, onClose, businessName, serviceName, proProfileId, initialDate, initialTime }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isNexaVerified, setIsNexaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      day: days[d.getDay()],
      date: d.getDate(),
      full: d
    };
  });

  const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM"];

  React.useEffect(() => {
    if (isOpen) {
      if (initialDate) {
        const index = dates.findIndex(d => 
          d.full.getFullYear() === initialDate.getFullYear() &&
          d.full.getMonth() === initialDate.getMonth() &&
          d.full.getDate() === initialDate.getDate()
        );
        if (index !== -1) {
          setSelectedDate(index);
        }
      }
      if (initialTime) {
        setSelectedTime(initialTime);
      }
    }
  }, [isOpen, initialDate, initialTime]);

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirmBooking = async () => {
    if (!proProfileId || selectedDate === null || !selectedTime) return;
    
    setLoading(true);
    setError("");
    
    try {
      const scheduledAt = new Date(dates[selectedDate].full);
      const [time, period] = selectedTime.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      scheduledAt.setHours(hours, minutes, 0, 0);

      await api.post("/bookings", {
        pro_profile_id: proProfileId,
        scheduled_at: scheduledAt.toISOString(),
        service_name: serviceName || "Standard Consultation",
        amount: 0, // Standard bookings are free upfront
        type: "STANDARD"
      });
      
      setStep(4);
    } catch (err: any) {
      setError(err.message || "Failed to create booking. Are you logged in?");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedDate(null);
    setSelectedTime(null);
    setIsNexaVerified(false);
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center lg:p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
          />
          <motion.div 
            initial={{ y: "100%", opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: "100%", opacity: 0 }}
            className="relative w-full lg:max-w-2xl bg-nexa-bg-base rounded-t-[32px] lg:rounded-[40px] shadow-2xl z-[110] overflow-hidden max-h-[95vh] lg:max-h-[90vh] flex flex-col"
          >
            {/* HEADER */}
            <div className="p-6 border-b border-nexa-border flex items-center justify-between bg-nexa-bg-surface flex-shrink-0">
              <div className="flex items-center gap-3">
                {step > 1 && step < 4 && (
                  <button onClick={handleBack} className="p-2 hover:bg-nexa-bg-base rounded-xl transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <div>
                   <h2 className="text-xl font-extrabold">Book Service</h2>
                   <p className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-widest">{businessName}</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-nexa-bg-base rounded-xl transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto no-scrollbar">
               {error && (
                 <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-3">
                   <AlertCircle className="w-4 h-4" />
                   {error}
                 </div>
               )}

               <AnimatePresence mode="wait">
                  {step === 1 && (
                     <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                        <div>
                           <h3 className="text-sm font-bold uppercase tracking-widest text-nexa-text-faint mb-4">Select Date</h3>
                           <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                              {dates.map((d, i) => (
                                 <button
                                    key={i}
                                    onClick={() => setSelectedDate(i)}
                                    className={cn(
                                       "flex flex-col items-center justify-center min-w-[70px] h-24 rounded-2xl border-2 transition-all",
                                       selectedDate === i 
                                          ? "border-nexa-brand bg-nexa-brand/5 shadow-lg shadow-nexa-brand/10" 
                                          : "border-nexa-border bg-nexa-bg-surface hover:border-nexa-brand/30"
                                    )}
                                 >
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{d.day}</span>
                                    <span className="text-xl font-extrabold">{d.date}</span>
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div>
                           <h3 className="text-sm font-bold uppercase tracking-widest text-nexa-text-faint mb-4">Select Time</h3>
                           <div className="grid grid-cols-3 gap-3">
                              {timeSlots.map((time) => (
                                 <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={cn(
                                       "py-3 rounded-xl border-2 text-xs font-bold transition-all",
                                       selectedTime === time 
                                          ? "border-nexa-brand bg-nexa-brand/5 text-nexa-brand" 
                                          : "border-nexa-border bg-nexa-bg-surface hover:border-nexa-brand/30"
                                    )}
                                 >
                                    {time}
                                 </button>
                              ))}
                           </div>
                        </div>

                        <NexaButton 
                           size="lg" 
                           className="w-full h-14" 
                           disabled={selectedDate === null || selectedTime === null}
                           onClick={handleNext}
                           rightIcon={<ChevronRight className="w-5 h-5" />}
                        >
                           Continue
                        </NexaButton>
                     </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-8">
                      <div className="text-center space-y-2">
                        <div className="flex justify-center mb-4">
                          <NexaVerifiedBadge />
                        </div>
                        <h3 className="text-2xl font-extrabold text-display">Upgrade your booking?</h3>
                        <p className="text-sm text-nexa-text-secondary max-w-xs mx-auto">Choose standard or get a NexaVerified professional for maximum peace of mind.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button 
                          onClick={() => { setIsNexaVerified(false); handleNext(); }}
                          className="liquid-glass p-6 rounded-[32px] border-nexa-border hover:border-nexa-brand/30 transition-all text-left group"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-nexa-bg-base flex items-center justify-center mb-4 text-nexa-text-faint group-hover:scale-110 transition-transform">
                            <Clock className="w-6 h-6" />
                          </div>
                          <h4 className="font-bold text-lg mb-1">Standard</h4>
                          <p className="text-xs text-nexa-text-faint mb-4">Book with {businessName} directly.</p>
                          <p className="text-lg font-extrabold text-nexa-text-primary">₦0.00 <span className="text-xs font-bold text-nexa-text-faint">extra</span></p>
                        </button>

                        <button 
                          onClick={() => { setIsNexaVerified(true); handleNext(); }}
                          className="liquid-glass p-6 rounded-[32px] border-nexa-amber/40 bg-nexa-amber/5 relative overflow-hidden group text-left"
                        >
                          <motion.div
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-nexa-amber/10 to-transparent skew-x-12"
                          />
                          <div className="absolute top-4 right-4">
                             <NexaBadge variant="secondary" className="bg-nexa-amber text-white border-none text-[8px]">RECOMMENDED</NexaBadge>
                          </div>
                          <div className="w-12 h-12 rounded-2xl bg-nexa-amber/20 flex items-center justify-center mb-4 text-nexa-amber group-hover:scale-110 transition-transform relative z-10">
                            <ShieldCheck className="w-6 h-6" />
                          </div>
                          <h4 className="font-bold text-lg mb-1 relative z-10">NexaVerified</h4>
                          <p className="text-xs text-nexa-amber/80 font-bold mb-4 relative z-10">Vetted Nexa Technician dispatched by us.</p>
                          <p className="text-lg font-extrabold text-nexa-amber relative z-10">+₦5,000 <span className="text-xs font-bold opacity-60">premium</span></p>
                        </button>
                      </div>

                      <button onClick={handleNext} className="w-full text-xs font-bold text-nexa-text-faint uppercase tracking-widest hover:text-nexa-text-secondary transition-colors">
                        What is NexaVerified?
                      </button>
                    </motion.div>
                  )}

                  {step === 3 && (
                     <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                        <NexaCard variant="glass" className={cn("p-6 border-nexa-brand/20 bg-nexa-brand/5", isNexaVerified && "border-nexa-amber/30 bg-nexa-amber/5")}>
                           <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xs font-bold text-nexa-text-faint uppercase tracking-widest">Booking Details</h4>
                              {isNexaVerified && <NexaVerifiedBadge showText={false} />}
                           </div>
                           <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                 <span className="text-sm font-medium text-nexa-text-secondary">Service</span>
                                 <span className="text-sm font-bold">{serviceName || "Standard Consultation"}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-sm font-medium text-nexa-text-secondary">Tier</span>
                                 <span className={cn("text-sm font-bold", isNexaVerified ? "text-nexa-amber" : "text-nexa-brand")}>
                                    {isNexaVerified ? "NexaVerified Premium" : "Standard Booking"}
                                 </span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-sm font-medium text-nexa-text-secondary">Date</span>
                                 <span className="text-sm font-bold">{dates[selectedDate!].day}, {dates[selectedDate!].date}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-sm font-medium text-nexa-text-secondary">Time</span>
                                 <span className="text-sm font-bold">{selectedTime}</span>
                              </div>
                           </div>
                        </NexaCard>

                        <div className="space-y-4">
                           <p className="text-xs text-nexa-text-secondary leading-relaxed">
                              {isNexaVerified 
                                ? "NexaVerified jobs require a deposit to secure your professional. Protected by Nexa Guarantee."
                                : "By confirming, you agree to the seller's cancellation policy. No payment is required upfront."}
                           </p>
                           {isNexaVerified ? (
                              <Link href={`/checkout?proId=${proProfileId}&service=${serviceName || "Premium Service"}&date=${dates[selectedDate!].full.toISOString()}&time=${selectedTime}&type=NEXA_VERIFIED&amount=5000`}>
                                 <NexaButton size="lg" className="w-full h-14 bg-nexa-amber hover:bg-nexa-amber/90">
                                    Proceed to Checkout
                                 </NexaButton>
                              </Link>
                           ) : (
                              <NexaButton size="lg" className="w-full h-14" onClick={handleConfirmBooking} isLoading={loading}>
                                 Confirm Booking
                              </NexaButton>
                           )}
                        </div>

                        <div className="flex items-center gap-2 justify-center py-2">
                           <ShieldCheck className="w-4 h-4 text-emerald-500" />
                           <span className="text-[10px] font-bold text-nexa-text-faint uppercase tracking-widest">Nexa Secure Booking</span>
                        </div>
                     </motion.div>
                  )}

                  {step === 4 && (
                     <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-10 space-y-8">
                        <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                           <CheckCircle2 className="w-10 h-10" />
                        </div>
                        <div>
                           <h3 className="text-2xl font-extrabold mb-2">Booking Requested!</h3>
                           <p className="text-sm text-nexa-text-secondary leading-relaxed max-w-xs mx-auto">
                              Your request has been sent to <strong>{businessName}</strong>. You'll be notified once they confirm.
                           </p>
                        </div>
                        <div className="flex flex-col gap-3">
                           <NexaButton variant="secondary" onClick={handleClose}>Back to Profile</NexaButton>
                           <Link href="/dashboard" className="w-full" onClick={handleClose}>
                              <NexaButton className="w-full">View My Dashboard</NexaButton>
                           </Link>
                        </div>
                     </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
