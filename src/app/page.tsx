"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  MapPin,
  ChevronDown,
  Phone,
  MessageSquare,
  Navigation,
  ArrowRight,
  Star,
  Download,
  ShieldCheck,
  UtensilsCrossed,
  Pill,
  Scissors,
  Car,
  Gavel,
  PartyPopper,
  Laptop,
  Home,
  Scale,
  Zap,
  GraduationCap,
  Truck,
  Building2,
  Briefcase,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaChip } from "@/components/nexa/NexaChip";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaRating } from "@/components/nexa/NexaRating";
import { useNiche } from "@/components/nexa/NicheContext";

// --- COMPONENTS ---

const HeroSection = () => {
  const [searchValue, setSearchValue] = useState("");
  const { setCurrentNiche } = useNiche();

  useEffect(() => {
    setCurrentNiche(null);
  }, [setCurrentNiche]);

  const placeholders = [
    "Try 'barbers in Lekki'",
    "Try 'restaurants near me'",
    "Try 'pharmacies in Ikeja'",
    "Try 'hotels in Abuja'",
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-32">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-nexa-brand/20 via-transparent to-nexa-accent/10 animate-pulse" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-nexa-brand/10 blur-[120px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-nexa-accent/10 blur-[120px] rounded-full"
        />
      </div>

      {/* Floating Glass Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ y: 0 }}
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
            className="absolute liquid-glass rounded-full blur-sm opacity-40"
            style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              top: `${20 + i * 15}%`,
              left: `${10 + i * 20}%`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-display mb-6 tracking-tight"
        >
          Find Any Business. <br />
          <span className="text-nexa-brand">Anywhere in Nigeria.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-xl text-nexa-text-secondary mb-12 max-w-2xl mx-auto"
        >
          Discover, book, buy — all in one place. Nigeria's most trusted business platform.
        </motion.p>

        {/* Search Centerpiece */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <div className="liquid-glass p-2 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-2 shadow-2xl">
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 text-nexa-text-faint" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={placeholders[placeholderIndex]}
                className="bg-transparent border-none outline-none w-full h-12 px-3 text-nexa-text-primary placeholder:transition-all"
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-nexa-border" />
            <div className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-nexa-brand-light rounded-xl transition-colors">
              <MapPin className="w-5 h-5 text-nexa-brand" />
              <span className="font-medium">Lagos</span>
              <ChevronDown className="w-4 h-4 text-nexa-text-faint" />
            </div>
            <NexaButton size="lg" className="rounded-xl px-8">
              Search
            </NexaButton>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {["Open Now", "Verified", "Accepts POS", "Home Delivery"].map((tag, i) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <NexaChip label={tag} className="bg-nexa-bg-glass/50" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const CategoryGrid = () => {
  const subGroups = [
    { slug: "handyman-finders", parent: "Home & Maintenance", name: "Handyman Finders", icon: "/handyman.png", color: "bg-home/10", services: ["Plumber Finder", "Electrician Finder", "Carpenter Finder", "Painter Finder", "Tiler Finder", "Welder Finder"], count: "1,240 businesses" },
    { slug: "specialist-finders", parent: "Home & Maintenance", name: "Specialist Finders", icon: "/specialist.png", color: "bg-home/10", services: ["Solar Installer Finder", "Generator Repairer Finder", "AC Technician Finder", "Borehole Driller Finder", "Inverter Repairer Finder"], count: "820 businesses" },
    { slug: "sanitation-finders", parent: "Home & Maintenance", name: "Sanitation Finders", icon: "/sanitation.png", color: "bg-home/10", services: ["Home Cleaner Finder", "Fumigator (Pest Control) Finder", "Waste Disposal Finder", "Water Tank Cleaner Finder"], count: "610 businesses" },
    { slug: "style-finders", parent: "Fashion & Grooming", name: "Style Finders", icon: "/style.png", color: "bg-fashion/10", services: ["Tailor (Bespoke) Finder", "Hairdresser (Braider) Finder", "Barber Finder", "Makeup Artist Finder", "Manicurist (Nail Tech) Finder"], count: "1,100 businesses" },
    { slug: "wardrobe-finders", parent: "Fashion & Grooming", name: "Wardrobe Finders", icon: "/wardrobe.png", color: "bg-fashion/10", services: ["Laundry Finder", "Dry Cleaner Finder", "Personal Shopper Finder", "Cobbler (Shoe Repair) Finder"], count: "790 businesses" },
    { slug: "tech-finders", parent: "Professional Services", name: "Tech Finders", icon: "/tech.png", color: "bg-professionals/10", services: ["Web Developer Finder", "App Developer Finder", "UI/UX Designer Finder", "SEO Expert Finder", "Cybersecurity Consultant Finder"], count: "640 businesses" },
    { slug: "corporate-finders", parent: "Professional Services", name: "Corporate Finders", icon: "/corporate.png", color: "bg-professionals/10", services: ["Lawyer Finder", "Accountant Finder", "Tax Consultant Finder", "Business Consultant Finder", "Grant Writer Finder"], count: "480 businesses" },
    { slug: "content-finders", parent: "Professional Services", name: "Content Finders", icon: "/content.png", color: "bg-professionals/10", services: ["Copywriter Finder", "Social Media Manager Finder", "Graphic Designer Finder", "Video Editor Finder", "Translator Finder"], count: "840 businesses" },
    { slug: "talent-finders", parent: "Professional Services", name: "Talent Finders", icon: "/talent.png", color: "bg-professionals/10", services: ["Model Finder", "Actor Finder", "Voice-Over Artist Finder"], count: "310 businesses" },
    { slug: "academic-finders", parent: "Education & Skills", name: "Academic Finders", icon: "/academic.png", color: "bg-education/10", services: ["Home Tutor Finder", "Music Instructor Finder", "Language Teacher Finder", "Exam Prep Tutor Finder", "School Finder"], count: "520 businesses" },
    { slug: "vocational-finders", parent: "Education & Skills", name: "Vocational Finders", icon: "/vocational.png", color: "bg-education/10", services: ["Driving School Instructor Finder", "Tech Skill Trainer Finder", "Fashion School Instructor Finder", "Catering School Instructor Finder"], count: "920 businesses" },
    { slug: "planning-finders", parent: "Events & Entertainment", name: "Planning Finders", icon: "/planning.png", color: "bg-events/10", services: ["Event Planner Finder", "Decorator Finder", "Souvenir Vendor Finder", "Ushering Agency Finder"], count: "430 businesses" },
    { slug: "entertainment-finders", parent: "Events & Entertainment", name: "Entertainment Finders", icon: "/entertain.png", color: "bg-events/10", services: ["DJ Finder", "MC Finder", "Photographer Finder", "Videographer Finder", "Drone Pilot Finder", "Live Band / Musician Finder"], count: "380 businesses" },
    { slug: "medical-finders", parent: "Health & Wellness", name: "Medical Finders", icon: "/medical.png", color: "bg-health/10", services: ["Private Nurse Finder", "Physiotherapist Finder", "Dentist Finder", "Optician Finder", "Pharmacy Finder"], count: "810 businesses" },
    { slug: "wellness-finders", parent: "Health & Wellness", name: "Wellness Finders", icon: "/wellness.png", color: "bg-health/10", services: ["Gym Instructor Finder", "Yoga Teacher Finder", "Nutritionist Finder", "Massage Therapist Finder"], count: "720 businesses" },
    { slug: "care-finders", parent: "Health & Wellness", name: "Care Finders", icon: "/care.png", color: "bg-health/10", services: ["Nanny Finder", "Elderly Companion Finder", "Pet Sitter Finder"], count: "390 businesses" },
    { slug: "transport-finders", parent: "Logistics & Transport", name: "Transport Finders", icon: "/transport.png", color: "bg-logistics/10", services: ["Professional Driver Finder", "Towing Van Finder", "Car Rental Finder", "Bus Hire Finder"], count: "450 businesses" },
    { slug: "delivery-finders", parent: "Logistics & Transport", name: "Delivery Finders", icon: "/delivery.png", color: "bg-logistics/10", services: ["Dispatch Rider (Logistics) Finder", "Errand Runner Finder", "Moving / Relocation Service Finder"], count: "340 businesses" },
    { slug: "repair-finders", parent: "Automotive Services", name: "Repair Finders", icon: "/repair.png", color: "bg-auto/10", services: ["Car Mechanic Finder", "Vulcanizer Finder", "Panel Beater Finder", "Auto Electrician Finder"], count: "420 businesses" },
    { slug: "auto-care-finders", parent: "Automotive Services", name: "Auto Care Finders", icon: "/auto-care.png", color: "bg-auto/10", services: ["Mobile Car Wash Finder", "Car Tracker Installer Finder", "CCTV / Security Installer Finder"], count: "350 businesses" },
    { slug: "culinary-finders", parent: "Food & Agribusiness", name: "Culinary Finders", icon: "/culinary.png", color: "bg-food/10", services: ["Private Chef Finder", "Caterer Finder", "Cake Baker Finder", "Bulk Food Supplier Finder"], count: "950 businesses" },
    { slug: "agro-finders", parent: "Food & Agribusiness", name: "Agro Finders", icon: "/agro.png", color: "bg-food/10", services: ["Farm Manager Finder", "Agro-Processor Finder", "Veterinary Doctor Finder", "Pet Groomer Finder", "Poultry Farmer Finder", "Fish Farmer Finder"], count: "1,050 businesses" },
    { slug: "property-finders", parent: "Real Estate & Construction", name: "Property Finders", icon: "/property.png", color: "bg-realestate/10", services: ["Estate Agent Finder", "Facility Manager Finder", "Surveyor Finder", "Quantity Surveyor Finder"], count: "880 businesses" },
    { slug: "building-finders", parent: "Real Estate & Construction", name: "Building Finders", icon: "/building.png", color: "bg-realestate/10", services: ["Architect Finder", "Bricklayer Finder", "Aluminum Fitter Finder", "POP Ceiling Installer Finder"], count: "570 businesses" },
  ];

  return (
    <section className="pt-32 pb-24 bg-nexa-bg-surface overflow-hidden">
      <div className="container mx-auto px-4 mb-12">
        <div className="flex items-center gap-4">
          <div className="w-1 h-8 bg-nexa-brand rounded-full" />
          <h2 className="text-3xl font-bold text-display">Browse by Specialty</h2>
        </div>
      </div>

      <div className="overflow-x-auto py-12 no-scrollbar snap-x snap-mandatory scroll-edge-fade">
        <div className="flex flex-nowrap gap-6 px-[max(1rem,calc((100vw-1280px)/2+1rem))] pb-4">
          <div className="grid grid-rows-2 grid-flow-col gap-6">
            {subGroups.map((group, i) => (
              <motion.div
                key={group.name}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="w-[420px] snap-start"
              >
                <Link href={`/${group.slug}`}>
                  <NexaCard variant="interactive" padding="none" className="h-full group overflow-hidden cursor-pointer">
                    <div className="glass-glint" />
                    <div className="flex items-stretch h-full">
                      {/* Left Side (1/3 Width) */}
                      <div className={cn("w-1/3 flex items-center justify-center border-r-[0.5px] border-black/5 dark:border-white/5 relative", group.color)}>
                        <img
                          src={group.icon}
                          alt={group.name}
                          className="w-20 h-20 object-contain drop-shadow-2xl transition-transform group-hover:scale-110 duration-500 z-10"
                        />
                        <div className="absolute inset-0 bg-white/10 blur-2xl rounded-full scale-50" />
                      </div>

                      {/* Right Side (2/3 Width) */}
                      <div className="w-2/3 py-5 px-6 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-nexa-brand/70 mb-1 block">
                            {group.parent}
                          </span>
                          <h3 className="text-xl font-bold text-display mb-2 leading-tight group-hover:text-nexa-brand transition-colors">
                            {group.name}
                          </h3>
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 leading-snug">
                            {group.services.map((service, idx) => (
                              <React.Fragment key={service}>
                                <span className="text-xs text-nexa-text-secondary hover:text-nexa-brand transition-colors cursor-pointer">
                                  {service}
                                </span>
                                {idx < group.services.length - 1 && <span className="text-[10px] text-nexa-text-faint self-center">•</span>}
                              </React.Fragment>
                            ))}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t-[0.5px] border-nexa-border flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-nexa-text-faint italic">
                            {group.count}
                          </span>
                          <ArrowRight className="w-4 h-4 text-nexa-brand opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                        </div>
                      </div>
                    </div>
                  </NexaCard>
                </Link>
              </motion.div>            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const BusinessCard = ({ name, category, rating, count, image, isVerified }: any) => {
  return (
    <motion.div whileHover={{ y: -8 }} transition={{ duration: 0.3 }}>
      <NexaCard variant="glass" padding="none" className="h-full group">
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {isVerified && (
            <div className="absolute top-3 right-3">
              <NexaBadge variant="verified">Verified</NexaBadge>
            </div>
          )}
          <div className="absolute bottom-3 left-3 w-12 h-12 rounded-xl liquid-glass border border-white/40 flex items-center justify-center shadow-lg p-2">
            <img src="/logo.png" alt="Nexa" className="w-full h-full object-contain" />
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-nexa-brand">{category}</span>
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="text-xs font-bold">{rating}</span>
              <span className="text-[10px] text-nexa-text-faint">({count})</span>
            </div>
          </div>
          <h3 className="text-lg font-bold mb-4 line-clamp-1">{name}</h3>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-nexa-accent" />
              <span className="text-xs font-medium text-nexa-accent">Open Now</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-nexa-text-secondary hover:text-nexa-brand transition-colors">
                <Phone className="w-3.5 h-3.5" />
              </button>
              <button className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-nexa-text-secondary hover:text-nexa-brand transition-colors">
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
              <button className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-nexa-text-secondary hover:text-nexa-brand transition-colors">
                <Navigation className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </NexaCard>
    </motion.div>
  );
};

const FeaturedSection = () => {
  const businesses = [
    {
      name: "The Yellow Chilli",
      category: "Restaurant",
      rating: 4.8,
      count: 120,
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=400&h=250",
      isVerified: true,
    },
    {
      name: "MedPlus Pharmacy",
      category: "Health",
      rating: 4.5,
      count: 340,
      image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&q=80&w=400&h=250",
      isVerified: true,
    },
    {
      name: "Ozone Cinemas",
      category: "Entertainment",
      rating: 4.2,
      count: 210,
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=400&h=250",
      isVerified: false,
    },
  ];

  return (
    <section className="py-24 bg-nexa-bg-base">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-1 h-8 bg-nexa-accent rounded-full" />
            <h2 className="text-3xl font-bold text-display">Top Picks in Lagos</h2>
          </div>
          <NexaButton variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
            View All
          </NexaButton>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {businesses.map((biz, i) => (
            <BusinessCard key={biz.name} {...biz} />
          ))}
        </div>
      </div>
    </section>
  );
};

const HowItWorks = () => {
  const steps = [
    { title: "Search & Discover", desc: "Find any business across Nigeria's 36 states with ease.", icon: <Search className="w-10 h-10" /> },
    { title: "View & Compare", desc: "Check reviews, photos, and verified status in seconds.", icon: <Scale className="w-10 h-10" /> },
    { title: "Book or Buy", desc: "Message directly, get directions, or order online instantly.", icon: <Zap className="w-10 h-10" /> },
  ];

  return (
    <section className="py-24 bg-nexa-bg-surface border-y border-nexa-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-display mb-4">How Nexa Works</h2>
          <p className="text-nexa-text-secondary max-w-xl mx-auto">The simplest way to connect with verified businesses in Nigeria.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl liquid-glass flex items-center justify-center text-nexa-brand group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-nexa-brand text-white flex items-center justify-center font-bold text-sm shadow-lg">
                  {i + 1}
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{step.title}</h3>
              <p className="text-nexa-text-secondary text-sm">{step.desc}</p>
            </div>
          ))}
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-nexa-border-mid -z-10" />
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  const socials = [
    { icon: <Twitter className="w-5 h-5" />, href: "#" },
    { icon: <Instagram className="w-5 h-5" />, href: "#" },
    { icon: <Facebook className="w-5 h-5" />, href: "#" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#" },
  ];

  return (
    <footer className="pt-24 pb-12 bg-nexa-bg-base border-t-2 border-nexa-brand/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <img src="/logo.png" alt="Nexa Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold text-display">Nexa</span>
            </div>
            <p className="text-nexa-text-secondary text-sm mb-6 leading-relaxed">
              Nigeria's #1 business discovery and conversion platform. Empowering local businesses and consumers through technology.
            </p>
            <div className="flex gap-4">
              {socials.map((social, i) => (
                <div key={i} className="w-10 h-10 rounded-full liquid-glass flex items-center justify-center cursor-pointer hover:bg-nexa-brand hover:text-white transition-all">
                  {social.icon}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-display tracking-widest uppercase text-[10px]">Platform</h4>
            <ul className="space-y-4 text-sm text-nexa-text-secondary">
              <Link href="/categories"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Browse Categories</li></Link>
              <Link href="/trending"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Trending Businesses</li></Link>
              <Link href="/search"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Global Search</li></Link>
              <li className="hover:text-nexa-brand cursor-pointer transition-colors opacity-50">Nexa App (Coming Soon)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-display tracking-widest uppercase text-[10px]">Company</h4>
            <ul className="space-y-4 text-sm text-nexa-text-secondary">
              <Link href="/about"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Our Story</li></Link>
              <Link href="/contact"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Contact & Support</li></Link>
              <Link href="/legal/privacy"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Privacy Policy</li></Link>
              <Link href="/legal/terms"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Terms of Service</li></Link>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-display tracking-widest uppercase text-[10px]">Business</h4>
            <ul className="space-y-4 text-sm text-nexa-text-secondary">
              <Link href="/join">
                <li className="hover:text-nexa-brand cursor-pointer transition-colors font-bold text-nexa-brand">List your Business</li>
              </Link>
              <Link href="/business"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Enterprise Solutions</li></Link>
              <Link href="/business"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Advertising</li></Link>
              <Link href="/success-stories"><li className="hover:text-nexa-brand cursor-pointer transition-colors">Success Stories</li></Link>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Newsletter</h4>
            <p className="text-sm text-nexa-text-secondary mb-4">Get the best local deals and business tips delivered to you.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="email@nexa.ng" className="flex-1 bg-nexa-bg-surface border border-nexa-border rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-nexa-brand-glow" />
              <NexaButton size="sm">Join</NexaButton>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-nexa-border text-xs text-nexa-text-faint">
          <p>© 2026 Nexa Technologies. All rights reserved.</p>
          <p className="mt-4 md:mt-0 flex items-center gap-1">Made with ❤️ for Nigeria 🇳🇬</p>
        </div>
      </div>
    </footer>
  );
};

// --- MAIN PAGE ---

export default function HomePage() {
  return (
    <main className="bg-nexa-bg-base">
      <NexaNavbar />

      <HeroSection />

      <CategoryGrid />

      <FeaturedSection />

      <HowItWorks />

      <section className="py-24">
        <div className="container mx-auto px-4">
          <NexaCard variant="glass" padding="none" className="bg-gradient-to-br from-nexa-brand to-nexa-brand-mid text-white overflow-hidden">
            <div className="grid md:grid-cols-2 gap-8 p-12 items-center">
              <div>
                <h2 className="text-4xl font-extrabold text-display mb-6">Nexa is better on the app</h2>
                <p className="text-white/80 mb-8 text-lg">
                  Get exclusive deals, real-time alerts for businesses near you, and a smoother booking experience.
                </p>
                <div className="flex flex-wrap gap-4">
                  <NexaButton variant="secondary" className="bg-black text-white border-white/20" leftIcon={<Download className="w-5 h-5" />}>
                    App Store
                  </NexaButton>
                  <NexaButton variant="secondary" className="bg-black text-white border-white/20" leftIcon={<Download className="w-5 h-5" />}>
                    Play Store
                  </NexaButton>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-64 h-[500px] bg-black rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl" />
                  <div className="p-4 pt-12">
                    <div className="w-full h-40 liquid-glass rounded-2xl mb-4" />
                    <div className="w-full h-8 bg-white/10 rounded-lg mb-2" />
                    <div className="w-2/3 h-8 bg-white/10 rounded-lg mb-8" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 liquid-glass rounded-2xl" />
                      <div className="h-24 liquid-glass rounded-2xl" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </NexaCard>
        </div>
      </section>

      <Footer />

      <NexaBottomBar />
    </main>
  );
}
