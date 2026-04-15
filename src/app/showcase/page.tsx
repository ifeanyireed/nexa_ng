"use client";

import React, { useState } from "react";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { NexaRating } from "@/components/nexa/NexaRating";
import { NexaChip } from "@/components/nexa/NexaChip";
import { NexaToast, ToastType } from "@/components/nexa/NexaToast";
import { NexaSkeleton } from "@/components/nexa/NexaSkeleton";
import { NexaModal } from "@/components/nexa/NexaModal";
import { NexaBottomSheet } from "@/components/nexa/NexaBottomSheet";
import { NexaDivider } from "@/components/nexa/NexaDivider";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { Search, MapPin, Check, Plus, Trash2, ShieldCheck, Github } from "lucide-react";
import { AnimatePresence } from "framer-motion";

export default function ShowcasePage() {
  const [toasts, setToasts] = useState<{ id: string; type: ToastType; title: string; message: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [rating, setRating] = useState(4);

  const addToast = (type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, title: `${type.toUpperCase()} Toast`, message: "This is a micro-animation obsessed toast notification." }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="min-h-screen pb-20 sm:pb-32 bg-nexa-bg-base">
      <NexaNavbar />
      
      <div className="container mx-auto px-4 pt-32">
        <header className="mb-12">
          <h1 className="text-4xl font-extrabold text-display mb-4">Nexa Design System</h1>
          <p className="text-nexa-text-secondary max-w-2xl">
            Intelligently beautiful, Apple-level polish, liquid glass glassmorphism throughout.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* LIGHT CANVAS */}
          <div className="space-y-12">
            <h2 className="text-sm font-bold uppercase tracking-widest text-nexa-brand">Light Mode</h2>
            
            <section className="space-y-6">
              <NexaDivider label="Buttons" />
              <div className="flex flex-wrap gap-4">
                <NexaButton>Primary Button</NexaButton>
                <NexaButton variant="secondary">Secondary Button</NexaButton>
                <NexaButton variant="ghost">Ghost Button</NexaButton>
                <NexaButton variant="danger" leftIcon={<Trash2 className="w-4 h-4" />}>Delete</NexaButton>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <NexaButton size="sm">Small</NexaButton>
                <NexaButton size="md">Medium</NexaButton>
                <NexaButton size="lg">Large</NexaButton>
                <NexaButton size="xl" isLoading>Loading...</NexaButton>
              </div>
            </section>

            <section className="space-y-6">
              <NexaDivider label="Inputs" />
              <div className="grid gap-6 max-w-md">
                <NexaInput label="Full Name" placeholder="e.g. Kola Adewale" />
                <NexaInput label="Search Businesses" variant="search" placeholder="Try 'barbers in Lekki'" />
                <NexaInput label="Phone Number" variant="phone" placeholder="803 000 0000" />
                <NexaInput label="Invalid Field" error="This field is required" defaultValue="Wrong data" />
              </div>
            </section>

            <section className="space-y-6">
              <NexaDivider label="Cards" />
              <div className="grid sm:grid-cols-2 gap-4">
                <NexaCard variant="glass">
                  <h4 className="font-bold mb-2">Liquid Glass Card</h4>
                  <p className="text-sm text-nexa-text-secondary">Signature material with backdrop blur and saturation.</p>
                </NexaCard>
                <NexaCard variant="interactive">
                  <h4 className="font-bold mb-2">Interactive Card</h4>
                  <p className="text-sm text-nexa-text-secondary">Hover me to see the lift animation and shadow.</p>
                </NexaCard>
              </div>
            </section>

            <section className="space-y-6">
              <NexaDivider label="Feedback & Status" />
              <div className="flex flex-wrap gap-3 mb-6">
                <NexaBadge variant="brand">New</NexaBadge>
                <NexaBadge variant="success">Open</NexaBadge>
                <NexaBadge variant="warning">Low Stock</NexaBadge>
                <NexaBadge variant="danger">Closed</NexaBadge>
                <NexaBadge variant="verified">Verified Business</NexaBadge>
              </div>
              <div className="flex items-center gap-6">
                <NexaAvatar size="lg" isOnline fallback="KA" />
                <NexaRating value={rating} onChange={setRating} readonly={false} />
              </div>
              <div className="flex flex-wrap gap-2">
                <NexaChip label="Lekki" selected />
                <NexaChip label="Pharmacy" onDismiss={() => {}} />
                <NexaChip label="Open Now" icon={<Check className="w-3 h-3" />} />
              </div>
            </section>

            <section className="space-y-6">
              <NexaDivider label="Overlay Components" />
              <div className="flex flex-wrap gap-4">
                <NexaButton variant="secondary" onClick={() => setIsModalOpen(true)}>Open Modal</NexaButton>
                <NexaButton variant="secondary" onClick={() => setIsSheetOpen(true)}>Open Bottom Sheet</NexaButton>
                <NexaButton variant="secondary" onClick={() => addToast("success")}>Show Toast</NexaButton>
              </div>
            </section>

            <section className="space-y-6">
              <NexaDivider label="Skeletons" />
              <div className="grid gap-6">
                <NexaSkeleton variant="profile" />
                <NexaSkeleton variant="card" />
              </div>
            </section>
          </div>

          {/* DARK CANVAS (Simulated) */}
          <div className="space-y-12 dark bg-[#0B0E1A] p-8 rounded-3xl border border-white/5">
            <h2 className="text-sm font-bold uppercase tracking-widest text-nexa-brand">Dark Mode</h2>
            
            <section className="space-y-6">
              <NexaDivider label="Buttons" />
              <div className="flex flex-wrap gap-4">
                <NexaButton>Primary Button</NexaButton>
                <NexaButton variant="secondary">Secondary Button</NexaButton>
                <NexaButton variant="ghost">Ghost Button</NexaButton>
              </div>
            </section>

            <section className="space-y-6">
              <NexaDivider label="Cards" />
              <div className="grid sm:grid-cols-2 gap-4">
                <NexaCard variant="glass">
                  <h4 className="font-bold mb-2">Dark Glass Card</h4>
                  <p className="text-sm text-nexa-text-secondary">Nuanced borders and deep shadows in dark mode.</p>
                </NexaCard>
                <NexaCard variant="interactive">
                  <h4 className="font-bold mb-2">Interactive Card</h4>
                  <p className="text-sm text-nexa-text-secondary">Premium feel with subtle glows.</p>
                </NexaCard>
              </div>
            </section>

            <section className="space-y-6">
              <NexaDivider label="Feedback & Status" />
              <div className="flex flex-wrap gap-3">
                <NexaBadge variant="brand">Premium</NexaBadge>
                <NexaBadge variant="verified">Verified Business</NexaBadge>
              </div>
              <div className="flex items-center gap-6">
                <NexaAvatar size="lg" isOnline src="https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=100&h=100" />
                <NexaRating value={4.5} />
              </div>
            </section>

            <section className="space-y-6">
              <NexaDivider label="Skeletons" />
              <NexaSkeleton variant="card" />
            </section>
          </div>
        </div>
      </div>

      {/* OVERLAYS */}
      <NexaModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nexa Premium">
        <p className="text-nexa-text-secondary mb-6">
          Unlock advanced search filters and business analytics with a Nexa Premium account.
        </p>
        <div className="flex flex-col gap-3">
          <NexaButton className="w-full">Get Started</NexaButton>
          <NexaButton variant="ghost" className="w-full" onClick={() => setIsModalOpen(false)}>Maybe Later</NexaButton>
        </div>
      </NexaModal>

      <NexaBottomSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
        <h3 className="text-xl font-bold mb-4">Select Location</h3>
        <div className="space-y-4">
          {["Lagos", "Abuja", "Port Harcourt", "Kano", "Ibadan"].map((city) => (
            <div key={city} className="flex items-center justify-between p-3 rounded-xl hover:bg-nexa-brand-light cursor-pointer group">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-nexa-text-faint group-hover:text-nexa-brand" />
                <span className="font-medium">{city}</span>
              </div>
              <Check className="w-5 h-5 text-nexa-brand opacity-0 group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </NexaBottomSheet>

      <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <div key={toast.id} className="pointer-events-auto">
              <NexaToast {...toast} onClose={removeToast} />
            </div>
          ))}
        </AnimatePresence>
      </div>

      <NexaBottomBar />
    </div>
  );
}
