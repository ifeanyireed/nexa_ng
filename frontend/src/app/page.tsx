"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { cn, getProImage, getProLink } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaChip } from "@/components/nexa/NexaChip";
import { NexaInput } from "@/components/nexa/NexaInput";
import { NexaRating } from "@/components/nexa/NexaRating";
import { useNiche } from "@/components/nexa/NicheContext";
import { LocationDropdown } from "@/components/nexa/LocationDropdown";
import { useLocation } from "@/components/nexa/LocationContext";
import { Footer } from "@/components/nexa/Footer";
import { api } from "@/lib/api";

// --- COMPONENTS ---

const HeroSection = () => {
  const [searchValue, setSearchValue] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const { setCurrentNiche } = useNiche();
  const router = useRouter();

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

  // Background image rotation (hero5.jpeg to hero8.jpeg)
  const heroImages = [
    "/hero5.jpeg",
    "/hero6.jpeg",
    "/hero7.jpeg",
    "/hero8.jpeg"
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const imgInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 6000); // Cross-fade every 6 seconds
    return () => clearInterval(imgInterval);
  }, []);

  const toggleFilter = (tag: string) => {
    setSelectedFilters((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchValue.trim()) {
      params.set("q", searchValue.trim());
    }
    selectedFilters.forEach((filter) => {
      if (filter === "Open Now") params.set("open_now", "true");
      if (filter === "Verified") params.set("verified", "true");
      if (filter === "Accepts POS") params.set("accepts_pos", "true");
      if (filter === "Home Delivery") params.set("home_delivery", "true");
      if (filter === "Near Me") params.set("near_me", "true");
    });
    const queryString = params.toString();
    router.push(queryString ? `/search?${queryString}` : `/search`);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-start pt-32 overflow-hidden">
      {/* Background image & gradient blur overlay */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.img 
            key={heroImages[currentImageIndex]}
            src={heroImages[currentImageIndex]} 
            alt="Hero background" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </AnimatePresence>
        {/* Water translucent blurry overlay resolving to zero opacity/blur to the right */}
        <div 
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(24px) saturate(220%) brightness(1.05)',
            WebkitBackdropFilter: 'blur(24px) saturate(220%) brightness(1.05)',
            maskImage: 'linear-gradient(to right, black 25%, transparent 75%)',
            WebkitMaskImage: 'linear-gradient(to right, black 25%, transparent 75%)'
          }}
        />
        {/* Vertical gradient tending towards the header area (reaches far right of the header) */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white via-white/90 to-transparent" />
        {/* Left horizontal gradient to shield text content */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 via-30% to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-12 lg:px-20 relative z-10 text-left flex flex-col items-start">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-display mb-6 tracking-tight text-left text-slate-900"
        >
          Find Any Business. <br />
          <span className="text-nexa-brand">Anywhere in Nigeria.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-xl text-slate-700 mb-12 max-w-2xl text-left"
        >
          Discover, book, buy — all in one place. Nigeria's most trusted business platform.
        </motion.p>

        {/* Search Centerpiece */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="w-full max-w-3xl text-left"
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="bg-white/90 backdrop-blur-md border border-slate-200/80 !overflow-visible relative z-30 p-2 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-2 shadow-2xl"
          >
            <div className="flex-1 flex items-center px-4">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder={placeholders[placeholderIndex]}
                className="bg-transparent border-none outline-none w-full h-12 px-3 text-slate-800 placeholder:text-slate-400 focus:ring-0 focus:outline-none placeholder:transition-all"
              />
            </div>
            <div className="hidden md:block w-px h-8 bg-slate-200/80" />
            <LocationDropdown buttonClassName="!bg-slate-50 hover:!bg-slate-100 border border-slate-200/60 text-slate-800 shadow-sm" />
            <NexaButton type="submit" size="lg" className="rounded-xl px-8 bg-nexa-brand text-white hover:bg-nexa-brand/90 transition-all shadow-md">
              Search
            </NexaButton>
          </form>

          <div className="flex flex-wrap justify-start gap-2 mt-6">
            {["Open Now", "Verified", "Accepts POS", "Home Delivery", "Near Me"].map((tag, i) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
              >
                <NexaChip 
                  label={tag} 
                  selected={selectedFilters.includes(tag)}
                  onSelect={() => toggleFilter(tag)}
                  className={cn(
                    "border border-slate-200/60 shadow-sm transition-all duration-200",
                    selectedFilters.includes(tag)
                      ? "bg-blue-600 text-white shadow-md shadow-nexa-brand-glow"
                      : "bg-white/70 hover:bg-white text-slate-700 hover:text-slate-900"
                  )}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const CategoryGrid = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085/api'}/discovery/stats/niches`)
      .then(res => res.json())
      .then(data => setCounts(data))
      .catch(err => console.error("Failed to fetch niche stats", err));
  }, []);

  const subGroups = [
    { slug: "handyman-finders", parent: "Home & Maintenance", name: "Handyman Finders", icon: "/handyman.png", color: "bg-home/10", services: ["Plumber Finder", "Electrician Finder", "Carpenter Finder", "Painter Finder", "Tiler Finder", "Welder Finder"], countKey: "home" },
    { slug: "specialist-finders", parent: "Home & Maintenance", name: "Specialist Finders", icon: "/specialist.png", color: "bg-home/10", services: ["Solar Installer Finder", "Generator Repairer Finder", "AC Technician Finder", "Borehole Driller Finder", "Inverter Repairer Finder"], countKey: "home" },
    { slug: "sanitation-finders", parent: "Home & Maintenance", name: "Sanitation Finders", icon: "/sanitation.png", color: "bg-home/10", services: ["Home Cleaner Finder", "Fumigator (Pest Control) Finder", "Waste Disposal Finder", "Water Tank Cleaner Finder"], countKey: "home" },
    { slug: "style-finders", parent: "Fashion & Grooming", name: "Style Finders", icon: "/style.png", color: "bg-fashion/10", services: ["Tailor (Bespoke) Finder", "Hairdresser (Braider) Finder", "Barber Finder", "Makeup Artist Finder", "Manicurist (Nail Tech) Finder"], countKey: "fashion" },
    { slug: "wardrobe-finders", parent: "Fashion & Grooming", name: "Wardrobe Finders", icon: "/wardrobe.png", color: "bg-fashion/10", services: ["Laundry Finder", "Dry Cleaner Finder", "Personal Shopper Finder", "Cobbler (Shoe Repair) Finder"], countKey: "fashion" },
    { slug: "tech-finders", parent: "Professional Services", name: "Tech Finders", icon: "/tech.png", color: "bg-professionals/10", services: ["Web Developer Finder", "App Developer Finder", "UI/UX Designer Finder", "SEO Expert Finder", "Cybersecurity Consultant Finder"], countKey: "professionals" },
    { slug: "corporate-finders", parent: "Professional Services", name: "Corporate Finders", icon: "/corporate.png", color: "bg-professionals/10", services: ["Lawyer Finder", "Accountant Finder", "Tax Consultant Finder", "Business Consultant Finder", "Grant Writer Finder"], countKey: "professionals" },
    { slug: "content-finders", parent: "Professional Services", name: "Content Finders", icon: "/content.png", color: "bg-professionals/10", services: ["Copywriter Finder", "Social Media Manager Finder", "Graphic Designer Finder", "Video Editor Finder", "Translator Finder"], countKey: "professionals" },
    { slug: "talent-finders", parent: "Professional Services", name: "Talent Finders", icon: "/talent.png", color: "bg-professionals/10", services: ["Model Finder", "Actor Finder", "Voice-Over Artist Finder"], countKey: "professionals" },
    { slug: "academic-finders", parent: "Education & Skills", name: "Academic Finders", icon: "/academic.png", color: "bg-education/10", services: ["Home Tutor Finder", "Music Instructor Finder", "Language Teacher Finder", "Exam Prep Tutor Finder", "School Finder"], countKey: "education" },
    { slug: "vocational-finders", parent: "Education & Skills", name: "Vocational Finders", icon: "/vocational.png", color: "bg-education/10", services: ["Driving School Instructor Finder", "Tech Skill Trainer Finder", "Fashion School Instructor Finder", "Catering School Instructor Finder"], countKey: "education" },
    { slug: "planning-finders", parent: "Events & Entertainment", name: "Planning Finders", icon: "/planning.png", color: "bg-events/10", services: ["Event Planner Finder", "Decorator Finder", "Souvenir Vendor Finder", "Ushering Agency Finder"], countKey: "events" },
    { slug: "entertainment-finders", parent: "Events & Entertainment", name: "Entertainment Finders", icon: "/entertain.png", color: "bg-events/10", services: ["DJ Finder", "MC Finder", "Photographer Finder", "Videographer Finder", "Drone Pilot Finder", "Live Band / Musician Finder"], countKey: "events" },
    { slug: "medical-finders", parent: "Health & Wellness", name: "Medical Finders", icon: "/medical.png", color: "bg-health/10", services: ["Private Nurse Finder", "Physiotherapist Finder", "Dentist Finder", "Optician Finder", "Pharmacy Finder"], countKey: "health" },
    { slug: "wellness-finders", parent: "Health & Wellness", name: "Wellness Finders", icon: "/wellness.png", color: "bg-health/10", services: ["Gym Instructor Finder", "Yoga Teacher Finder", "Nutritionist Finder", "Massage Therapist Finder"], countKey: "health" },
    { slug: "care-finders", parent: "Health & Wellness", name: "Care Finders", icon: "/care.png", color: "bg-health/10", services: ["Nanny Finder", "Elderly Companion Finder", "Pet Sitter Finder"], countKey: "health" },
    { slug: "transport-finders", parent: "Logistics & Transport", name: "Transport Finders", icon: "/transport.png", color: "bg-logistics/10", services: ["Professional Driver Finder", "Towing Van Finder", "Car Rental Finder", "Bus Hire Finder"], countKey: "logistics" },
    { slug: "delivery-finders", parent: "Logistics & Transport", name: "Delivery Finders", icon: "/delivery.png", color: "bg-logistics/10", services: ["Dispatch Rider (Logistics) Finder", "Errand Runner Finder", "Moving / Relocation Service Finder"], countKey: "logistics" },
    { slug: "repair-finders", parent: "Automotive Services", name: "Repair Finders", icon: "/repair.png", color: "bg-auto/10", services: ["Car Mechanic Finder", "Vulcanizer Finder", "Panel Beater Finder", "Auto Electrician Finder"], countKey: "auto" },
    { slug: "auto-care-finders", parent: "Automotive Services", name: "Auto Care Finders", icon: "/auto-care.png", color: "bg-auto/10", services: ["Mobile Car Wash Finder", "Car Tracker Installer Finder", "CCTV / Security Installer Finder"], countKey: "auto" },
    { slug: "culinary-finders", parent: "Food & Agribusiness", name: "Culinary Finders", icon: "/culinary.png", color: "bg-food/10", services: ["Private Chef Finder", "Caterer Finder", "Cake Baker Finder", "Bulk Food Supplier Finder"], countKey: "food" },
    { slug: "agro-finders", parent: "Food & Agribusiness", name: "Agro Finders", icon: "/agro.png", color: "bg-food/10", services: ["Farm Manager Finder", "Agro-Processor Finder", "Veterinary Doctor Finder", "Pet Groomer Finder", "Poultry Farmer Finder", "Fish Farmer Finder"], countKey: "food" },
    { slug: "property-finders", parent: "Real Estate & Construction", name: "Property Finders", icon: "/property.png", color: "bg-realestate/10", services: ["Estate Agent Finder", "Facility Manager Finder", "Surveyor Finder", "Quantity Surveyor Finder"], countKey: "realestate" },
    { slug: "building-finders", parent: "Real Estate & Construction", name: "Building Finders", icon: "/building.png", color: "bg-realestate/10", services: ["Architect Finder", "Bricklayer Finder", "Aluminum Fitter Finder", "POP Ceiling Installer Finder"], countKey: "realestate" },
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
                            {(counts[group.countKey] || 0).toLocaleString()} businesses
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

const BusinessCard = ({ name, category, rating, count, image, isVerified, city, area, email }: any) => {
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
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = "tel:+2348006392776";
                }}
                className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-nexa-text-secondary hover:text-nexa-brand transition-colors"
                title="Call Business"
              >
                <Phone className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `mailto:${encodeURIComponent(email || "contact@business.com")}?subject=${encodeURIComponent("Inquiry regarding " + category)}`;
                }}
                className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-nexa-text-secondary hover:text-nexa-brand transition-colors"
                title="Send Message"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const query = encodeURIComponent(`${name}, ${area || ""}, ${city || "Lagos"}, Nigeria`);
                  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
                }}
                className="w-8 h-8 rounded-full liquid-glass flex items-center justify-center text-nexa-text-secondary hover:text-nexa-brand transition-colors"
                title="Get Directions"
              >
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
  const { currentCity } = useLocation();
  const [pros, setPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPros = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/discovery/pros?city=${encodeURIComponent(currentCity.name)}`);
        setPros(data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching featured pros:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPros();
  }, [currentCity.name]);

  return (
    <section className="py-24 bg-nexa-bg-base">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-1 h-8 bg-nexa-accent rounded-full" />
          <h2 className="text-3xl font-bold text-display">Top Picks in {currentCity.name}</h2>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-nexa-brand border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pros.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pros.map((pro, i) => (
              <Link href={getProLink(pro)} key={pro.id} className="block">
                <BusinessCard 
                  name={pro.user?.name || "Professional"}
                  category={pro.specialties?.split(",")[0] || "Service"}
                  rating={pro.rating}
                  count={24}
                  image={getProImage(pro.specialties || "", pro.subService || "")}
                  isVerified={pro.verified}
                  city={pro.city}
                  area={pro.area}
                  email={pro.user?.email}
                />
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-center text-nexa-text-faint italic py-12 bg-nexa-bg-surface/10 border border-dashed border-nexa-border rounded-2xl">
            More verified top picks coming soon in {currentCity.name}!
          </p>
        )}
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

const BusinessHero = () => {
  return (
    <section className="py-24 bg-nexa-bg-base text-nexa-text-primary overflow-hidden relative border-t border-nexa-border">
      <div className="absolute inset-0 bg-gradient-to-tr from-nexa-brand/5 via-transparent to-transparent opacity-75 pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-nexa-brand/10 border border-nexa-brand/20 text-nexa-brand px-4 py-2 rounded-full mb-8 backdrop-blur-md mx-auto">
               <Briefcase className="w-4 h-4 animate-pulse" />
               <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Nexa for Business</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
              Scale your business <br className="hidden sm:block" />
              with <span className="text-nexa-brand">Nexa Enterprise</span>.
            </h2>
            <p className="text-base md:text-lg text-nexa-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
              Unlock priority discovery search, verified ratings, B2B CRM pipelines, custom APIs, and the verified Gold Badge.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/business">
                <NexaButton size="lg" className="px-10 h-16 rounded-2xl bg-nexa-brand text-white hover:bg-nexa-brand/90 transition-all shadow-xl shadow-nexa-brand/20">
                  Explore Business Solutions <ArrowRight className="w-4 h-4 ml-2 inline-block transition-transform group-hover:translate-x-1" />
                </NexaButton>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
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

      <BusinessHero />

      <section className="py-24 relative overflow-hidden">
        {/* Decorative Background Gradients */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-nexa-brand/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-nexa-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4">
          <NexaCard variant="glass" padding="none" className="bg-gradient-to-br from-nexa-brand to-nexa-brand-mid text-white overflow-hidden relative shadow-2xl">

            <div className="grid lg:grid-cols-12 gap-12 p-8 md:p-16 items-center relative z-10">
              <div className="lg:col-span-7 xl:col-span-8">
                {/* Glowing Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/12 border border-white/25 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 text-white backdrop-blur-md">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  Nexa Mobile App
                </div>

                <h2 className="text-4xl md:text-5xl font-extrabold text-display mb-6 tracking-tighter leading-[1.05] text-white">
                  Nexa is better <br className="hidden md:block"/>on the mobile app
                </h2>
                
                <p className="text-white/90 mb-8 text-lg">
                  Experience Nigeria's smartest service marketplace right in your pocket. Built for speed, security, and convenience.
                </p>

                {/* Features List */}
                <div className="space-y-5 mb-10">
                  <div className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 p-2.5 bg-white/12 border border-white/25 rounded-xl text-amber-300 group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-base">Instant Booking & Matching</h4>
                      <p className="text-sm text-white/85">Connect with reliable service professionals near you in under 60 seconds.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 p-2.5 bg-white/12 border border-white/25 rounded-xl text-sky-300 group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-base">Hyper-Local Finders</h4>
                      <p className="text-sm text-white/85">Find verified specialists in Lagos, Abuja, Port Harcourt, and more.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 p-2.5 bg-white/12 border border-white/25 rounded-xl text-emerald-300 group-hover:bg-white/20 group-hover:text-white transition-all duration-300">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-base">Verified & Escrow Secured</h4>
                      <p className="text-sm text-white/85">Guaranteed service quality with Nexa Escrow payments and verified experts.</p>
                    </div>
                  </div>
                </div>

                {/* App Download Badges */}
                <div className="flex flex-wrap gap-4">
                  {/* Apple App Store */}
                  <a 
                    href="#download-ios" 
                    className="flex items-center gap-3 bg-black hover:bg-slate-900 border border-white/15 hover:border-white/25 px-5 py-2.5 rounded-2xl transition-all duration-300 shadow-lg text-left select-none"
                  >
                    <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z"/>
                    </svg>
                    <div>
                      <p className="text-[10px] uppercase text-white/70 tracking-wider font-semibold leading-none">Download on the</p>
                      <p className="text-sm font-bold text-white leading-tight mt-0.5">App Store</p>
                    </div>
                  </a>

                  {/* Google Play Store */}
                  <a 
                    href="#download-android" 
                    className="flex items-center gap-3 bg-black hover:bg-slate-900 border border-white/15 hover:border-white/25 px-5 py-2.5 rounded-2xl transition-all duration-300 shadow-lg text-left select-none"
                  >
                    <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 466 512" fill="none">
                      <g fillRule="nonzero">
                        {/* Blue Path */}
                        <path fill="#4285F4" d="M1.39 41.86C0 46.04 0 51.63 0 57.2v397.64c0 5.57 0 9.76 1.4 15.34l216.27-214.86L1.39 41.86z"/>
                        {/* Green Path */}
                        <path fill="#34A853" d="M199.42 273.45 329.27 145.1 87.9 8.37C79.53 2.79 68.36 0 57.2 0 30.7 0 6.98 18.14 1.4 41.86l198.02 231.59z"/>
                        {/* Red Path */}
                        <path fill="#EA4335" d="M199.9 237.8 1.4 470.17c7.22 24.57 30.16 41.81 55.8 41.81 11.16 0 20.93-2.79 29.3-8.37l244.16-139.46L199.9 237.8z"/>
                        {/* Yellow Path */}
                        <path fill="#FBBC04" d="m433.91 205.1-104.65-60-111.61 110.22 113.01 108.83 104.64-58.6c18.14-9.77 30.7-29.3 30.7-50.23-1.4-20.93-13.95-40.46-32.09-50.22z"/>
                      </g>
                    </svg>
                    <div>
                      <p className="text-[10px] uppercase text-white/70 tracking-wider font-semibold leading-none">Get it on</p>
                      <p className="text-sm font-bold text-white leading-tight mt-0.5">Google Play</p>
                    </div>
                  </a>
                </div>
              </div>
              <div className="lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-end">
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative group"
                >
                  {/* Phone Glow Effect */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-nexa-brand-mid to-nexa-brand rounded-[54px] blur-xl opacity-30 group-hover:opacity-50 transition duration-1000" />
                  
                  {/* Phone Bezel / Outer Body */}
                  <div className="w-[280px] h-[570px] bg-slate-950 rounded-[48px] border-4 border-slate-800 shadow-2xl relative p-2.5 flex flex-col justify-between overflow-hidden outline outline-1 outline-slate-700/50">
                    
                    {/* Buttons: Silent, Vol Up, Vol Down (Left Side) */}
                    <div className="absolute left-[-2px] top-24 w-[3px] h-6 bg-slate-800 rounded-l" />
                    <div className="absolute left-[-2px] top-34 w-[3px] h-10 bg-slate-800 rounded-l" />
                    <div className="absolute left-[-2px] top-48 w-[3px] h-10 bg-slate-800 rounded-l" />
                    
                    {/* Button: Power (Right Side) */}
                    <div className="absolute right-[-2px] top-38 w-[3px] h-14 bg-slate-800 rounded-r" />

                    {/* Inner Screen */}
                    <div className="w-full h-full rounded-[38px] overflow-hidden relative border border-slate-950 bg-black flex flex-col">
                      
                      {/* Dynamic Island */}
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5.5 bg-black rounded-full z-30 flex items-center justify-between px-3 border border-white/5 shadow-inner">
                        {/* Camera Lens Reflection */}
                        <div className="w-2 h-2 bg-[#08081a] rounded-full border border-slate-900 flex items-center justify-center">
                          <div className="w-0.5 h-0.5 bg-[#102040] rounded-full" />
                        </div>
                        {/* Sensor green dot */}
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                      </div>

                      {/* Status Bar */}
                      <div className="absolute top-0 inset-x-0 h-9 px-6 flex items-center justify-between z-20 text-[10px] font-semibold text-white/90 tracking-tight">
                        <span>9:41</span>
                        <div className="flex items-center gap-1">
                          {/* Signal bars */}
                          <div className="flex items-end gap-[1.5px] h-[8px]">
                            <span className="w-[2px] h-[2.5px] bg-white rounded-[0.5px]" />
                            <span className="w-[2px] h-[4px] bg-white rounded-[0.5px]" />
                            <span className="w-[2px] h-[6px] bg-white rounded-[0.5px]" />
                            <span className="w-[2px] h-[8px] bg-white rounded-[0.5px]" />
                          </div>
                          {/* Wifi */}
                          <svg className="w-[11px] h-[11px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 20h.01"/>
                            <path d="M8.5 16.5a5 5 0 0 1 7 0"/>
                            <path d="M5 13a10 10 0 0 1 14 0"/>
                            <path d="M1.5 9.5a15 15 0 0 1 21 0"/>
                          </svg>
                          {/* Battery */}
                          <div className="w-4.5 h-2 border border-white/70 rounded-[3px] p-[1px] flex items-center">
                            <div className="h-full w-2.5 bg-emerald-400 rounded-[1px]" />
                            <div className="w-[1px] h-0.5 bg-white/70 rounded-r-[1px] -mr-[2px]" />
                          </div>
                        </div>
                      </div>

                      {/* Screen Content - App Image */}
                      <div className="w-full h-full relative">
                        <img 
                          src="/nexa_app.png" 
                          alt="Nexa Mobile App" 
                          className="w-full h-full object-cover object-top select-none"
                        />
                        {/* Glass Glare Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/10 pointer-events-none mix-blend-overlay" />
                        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                      </div>

                      {/* Home Indicator Bar */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 bg-white rounded-full z-20" />
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
