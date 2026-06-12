"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Star, 
  ShieldCheck, 
  Camera, 
  Upload, 
  CheckCircle2,
  X,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaVerifiedBadge } from "@/components/nexa/NexaVerifiedBadge";

export default function PostServiceRatingPage() {
  const params = useParams();
  const ref = params.ref as string;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = [
    "Punctuality",
    "Work Quality",
    "Professionalism",
    "Communication",
    "Cleanliness"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <div className="container mx-auto px-4 pt-32 max-w-2xl">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
              <div className="text-center">
                <div className="flex justify-center mb-6">
                   <div className="w-24 h-24 rounded-3xl overflow-hidden border-4 border-nexa-amber shadow-2xl relative">
                      <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200" alt="Tech" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-nexa-amber/10" />
                   </div>
                </div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-display mb-2">How was Samuel's work?</h1>
                <p className="text-nexa-text-secondary font-medium">Your feedback helps us maintain the NexaVerified standard.</p>
              </div>

              {/* STAR SELECTOR */}
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2"
                  >
                    <Star 
                      className={cn(
                        "w-12 h-12 transition-colors duration-200",
                        (hoverRating || rating) >= star 
                          ? "fill-nexa-amber text-nexa-amber" 
                          : "text-nexa-border"
                      )} 
                    />
                  </motion.button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-12">
                {/* CATEGORIES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <div key={cat} className="liquid-glass p-6 rounded-2xl flex items-center justify-between group">
                      <span className="text-sm font-bold text-nexa-text-secondary">{cat}</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <div key={s} className="w-2 h-2 rounded-full bg-nexa-border group-hover:bg-nexa-amber/20 transition-colors" />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* TEXT FEEDBACK */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-nexa-text-faint">Your Comments</h3>
                  <textarea 
                    className="w-full h-40 p-6 rounded-3xl bg-nexa-bg-surface border border-nexa-border focus:border-nexa-amber focus:ring-4 focus:ring-nexa-amber/10 outline-none transition-all font-medium text-lg resize-none"
                    placeholder="Describe your experience with the service..."
                  />
                </div>

                {/* PHOTO UPLOAD */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black uppercase tracking-widest text-nexa-text-faint">Job Photos (Optional)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button type="button" className="aspect-square rounded-2xl border-2 border-dashed border-nexa-border flex flex-col items-center justify-center gap-2 text-nexa-text-faint hover:border-nexa-amber hover:text-nexa-amber transition-all group">
                       <Camera className="w-6 h-6 group-hover:scale-110 transition-transform" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Add Photo</span>
                    </button>
                    {[1, 2].map((i) => (
                       <div key={i} className="aspect-square rounded-2xl bg-slate-100 dark:bg-slate-800 border border-nexa-border relative group overflow-hidden">
                          <img src={`https://images.unsplash.com/photo-${1581091226825 + i}?auto=format&fit=crop&q=80&w=200`} className="w-full h-full object-cover" alt="Job" />
                          <button className="absolute top-2 right-2 w-6 h-6 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <X className="w-4 h-4" />
                          </button>
                       </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-nexa-border">
                  <NexaButton 
                    type="submit" 
                    size="xl" 
                    className="w-full h-20 rounded-3xl bg-nexa-amber hover:bg-nexa-amber/90 shadow-2xl shadow-nexa-amber/20 text-xl font-black"
                    disabled={rating === 0}
                  >
                    Submit Review & Release Payment
                  </NexaButton>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 space-y-12"
            >
              <div className="relative inline-block">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-48 h-48 rounded-full border-4 border-dashed border-nexa-amber/30"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 bg-nexa-amber text-white rounded-full flex items-center justify-center shadow-2xl shadow-nexa-amber/30">
                    <CheckCircle2 className="w-16 h-16" />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-4xl lg:text-6xl font-black text-display mb-6">Thank You!</h2>
                <p className="text-xl text-nexa-text-secondary font-medium max-w-md mx-auto leading-relaxed">
                  Your feedback has been recorded and the payment has been released to Samuel.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                 <Link href="/account">
                    <NexaButton size="lg" className="w-full" rightIcon={<ArrowRight className="w-5 h-5" />}>
                       Go to Dashboard
                    </NexaButton>
                 </Link>
                 <Link href={`/support/${ref}`}>
                    <button className="text-xs font-black text-nexa-text-faint uppercase tracking-widest hover:text-nexa-brand transition-colors flex items-center justify-center gap-2">
                       <MessageSquare className="w-4 h-4" /> Need help with this booking?
                    </button>
                 </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <NexaBottomBar />
    </main>
  );
}
