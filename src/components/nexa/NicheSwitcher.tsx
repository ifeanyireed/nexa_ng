"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { NexaModal } from "./NexaModal";
import { NexaCard } from "./NexaCard";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface NicheInfo {
  id: string;
  name: string;
  tagline: string;
  color: string;
  icon: string;
  slug: string;
}

export const NICHES: NicheInfo[] = [
  { id: "home-services", name: "Home & Maintenance", tagline: "Reliable help for your home", color: "bg-home", icon: "/handyman.png", slug: "home-services" },
  { id: "fashion", name: "Fashion & Grooming", tagline: "Style and personal care", color: "bg-fashion", icon: "/style.png", slug: "fashion-grooming" },
  { id: "professionals", name: "Professional Services", tagline: "Expert business solutions", color: "bg-professionals", icon: "/corporate.png", slug: "professional-services" },
  { id: "education", name: "Education & Skills", tagline: "Learn and grow your skills", color: "bg-education", icon: "/academic.png", slug: "education-skills" },
  { id: "events", name: "Events & Entertainment", tagline: "Celebrate life's big moments", color: "bg-events", icon: "/planning.png", slug: "events-entertainment" },
  { id: "health", name: "Health & Wellness", tagline: "Your well-being is our priority", color: "bg-health", icon: "/medical.png", slug: "health-wellness" },
  { id: "logistics", name: "Logistics & Transport", tagline: "Move anything, anywhere fast", color: "bg-logistics", icon: "/delivery.png", slug: "logistics-transport" },
  { id: "auto", name: "Automotive Services", tagline: "Keep your wheels turning", color: "bg-auto", icon: "/repair.png", slug: "automotive-services" },
  { id: "food", name: "Food & Agribusiness", tagline: "Farm to table culinary delights", color: "bg-food", icon: "/culinary.png", slug: "food-agribusiness" },
  { id: "realestate", name: "Real Estate & Construction", tagline: "Build and find your dream home", color: "bg-realestate", icon: "/property.png", slug: "real-estate-construction" },
];

interface NicheSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NicheSwitcher = ({ isOpen, onClose }: NicheSwitcherProps) => {
  return (
    <NexaModal isOpen={isOpen} onClose={onClose} title="Switch Niche Hub" size="xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 py-4">
        {NICHES.map((niche, i) => (
          <motion.div
            key={niche.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link href={`/${niche.slug}`} onClick={onClose}>
              <NexaCard 
                variant="interactive" 
                padding="none" 
                className="h-full group overflow-hidden border-none bg-nexa-bg-base/50"
              >
                <div className={cn("h-24 flex items-center justify-center relative", niche.color)}>
                  <img src={niche.icon} alt={niche.name} className="w-16 h-16 object-contain z-10 transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm mb-1 line-clamp-1 group-hover:text-nexa-brand transition-colors">{niche.name}</h3>
                  <p className="text-[10px] text-nexa-text-secondary line-clamp-2 leading-relaxed">{niche.tagline}</p>
                  <div className="mt-3 flex items-center text-[10px] font-bold text-nexa-brand opacity-0 group-hover:opacity-100 transition-opacity">
                    EXPLORE <ArrowRight className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </NexaCard>
            </Link>
          </motion.div>
        ))}
      </div>
    </NexaModal>
  );
};
