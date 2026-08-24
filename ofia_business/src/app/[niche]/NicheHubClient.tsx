"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MapPin, 
  Filter, 
  Star, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  ShoppingBag, 
  FileText, 
  Tag, 
  ChevronRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  MessageSquare,
  Plus,
  Eye,
  Edit3,
  BarChart3,
  Calendar,
  Wrench,
  ZapOff,
  Hammer,
  Paintbrush,
  Layers,
  Thermometer,
  Sun,
  Settings2,
  Droplets,
  Scissors,
  User2,
  Shirt,
  Smartphone,
  Briefcase,
  PenTool,
  GraduationCap,
  Music,
  HeartPulse,
  Truck,
  Car,
  UtensilsCrossed,
  Sprout,
  Home
} from "lucide-react";
import { cn, getProImage, getProLink, getArticleSlug } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaRating } from "@/components/nexa/NexaRating";
import { useNiche } from "@/components/nexa/NicheContext";
import { useLocation } from "@/components/nexa/LocationContext";
import { api } from "@/lib/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { NicheLayoutRenderer } from "@/components/templates/NicheLayoutRenderer";

// --- HELPERS ---

const getServiceIcon = (service: string) => {
  const s = service.toLowerCase();
  if (s.includes("plumber")) return <Droplets className="w-6 h-6" />;
  if (s.includes("electrician")) return <Zap className="w-6 h-6" />;
  if (s.includes("carpenter")) return <Hammer className="w-6 h-6" />;
  if (s.includes("painter")) return <Paintbrush className="w-6 h-6" />;
  if (s.includes("tiler")) return <Layers className="w-6 h-6" />;
  if (s.includes("welder")) return <Settings2 className="w-6 h-6" />;
  if (s.includes("solar")) return <Sun className="w-6 h-6" />;
  if (s.includes("ac technician") || s.includes("air conditioning")) return <Thermometer className="w-6 h-6" />;
  if (s.includes("generator")) return <ZapOff className="w-6 h-6" />;
  if (s.includes("tailor")) return <Scissors className="w-6 h-6" />;
  if (s.includes("hairdresser") || s.includes("barber")) return <User2 className="w-6 h-6" />;
  if (s.includes("laundry") || s.includes("wardrobe")) return <Shirt className="w-6 h-6" />;
  if (s.includes("tech") || s.includes("developer")) return <Smartphone className="w-6 h-6" />;
  if (s.includes("lawyer") || s.includes("accountant") || s.includes("corporate")) return <Briefcase className="w-6 h-6" />;
  if (s.includes("writer") || s.includes("content")) return <PenTool className="w-6 h-6" />;
  if (s.includes("tutor") || s.includes("academic") || s.includes("education")) return <GraduationCap className="w-6 h-6" />;
  if (s.includes("music")) return <Music className="w-6 h-6" />;
  if (s.includes("medical") || s.includes("nurse") || s.includes("health")) return <HeartPulse className="w-6 h-6" />;
  if (s.includes("transport") || s.includes("driver")) return <Truck className="w-6 h-6" />;
  if (s.includes("mechanic") || s.includes("repair")) return <Wrench className="w-6 h-6" />;
  if (s.includes("car")) return <Car className="w-6 h-6" />;
  if (s.includes("chef") || s.includes("culinary") || s.includes("caterer")) return <UtensilsCrossed className="w-6 h-6" />;
  if (s.includes("agro") || s.includes("farm")) return <Sprout className="w-6 h-6" />;
  if (s.includes("property") || s.includes("estate") || s.includes("building")) return <Home className="w-6 h-6" />;
  
  return <Wrench className="w-6 h-6" />;
};

// --- COMPONENTS ---

const SectionHeader = ({ title, viewAll = true, href }: { title: string, viewAll?: boolean, href?: string }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-bold text-display">{title}</h2>
    {viewAll && href && (
      <Link href={href}>
        <NexaButton variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
          View All
        </NexaButton>
      </Link>
    )}
  </div>
);

// --- BUYER MODE SECTIONS ---

const BuyerModeLayout = ({ data, nicheSlug, activeSubService, setActiveSubService, pros, articles }: any) => {
  const { currentCity, currentArea } = useLocation();
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    router.push(`/${nicheSlug}/search?q=${encodeURIComponent(searchInput.trim())}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className={cn("absolute inset-0 z-0 opacity-10", data.colorClass)} />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <NexaBadge variant="neutral" className="mb-4">{data.name}</NexaBadge>
            <h1 className="text-4xl md:text-6xl font-extrabold text-display mb-8 leading-tight">
              {data.heroTitle} <br />
              <span className={cn("text-nexa-brand", `text-${data.id}`)}>{data.name} in {currentCity.name}.</span>
            </h1>

            <form onSubmit={handleSearch} className="liquid-glass p-2 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center gap-2 shadow-xl border border-white/20">
              <div className="flex-1 flex items-center px-4">
                <Search className="w-5 h-5 text-nexa-text-faint" />
                <input 
                  type="text" 
                  placeholder={`Find a ${activeSubService.replace(" Finder", "")}...`}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="bg-transparent border-none outline-none w-full h-12 px-3 text-nexa-text-primary"
                />
              </div>
              <div className="hidden md:block w-px h-8 bg-nexa-border" />
              <Link href={`/${nicheSlug}/near-me`} className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-xl transition-colors">
                <MapPin className="w-5 h-5 text-nexa-brand animate-pulse" />
                <span className="text-sm font-bold whitespace-nowrap">
                  Near Me
                </span>
              </Link>
              <NexaButton type="submit" size="lg" className="rounded-xl shadow-lg shadow-nexa-brand/20">
                Search
              </NexaButton>
            </form>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-nexa-bg-surface">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data.subServices.map((service: string) => (
              <NexaCard 
                key={service}
                variant={activeSubService === service ? "glass" : "flat"}
                onClick={() => setActiveSubService(service)}
                className={cn(
                  "cursor-pointer flex flex-col items-center justify-center p-6 text-center transition-all group",
                  activeSubService === service ? "border-nexa-brand ring-1 ring-nexa-brand/20" : "hover:border-nexa-brand/50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                  activeSubService === service ? "bg-nexa-brand text-white" : "bg-nexa-bg-base text-nexa-brand"
                )}>
                  {getServiceIcon(service)}
                </div>
                <span className="text-sm font-bold">{service}</span>
              </NexaCard>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 space-y-16">
        {/* DYNAMIC 7-LAYOUT TEMPLATE COCKPIT */}
        <section>
          <NicheLayoutRenderer nicheSlug={nicheSlug} />
        </section>

        <section>
          <SectionHeader 
            title={`Top Rated ${activeSubService.replace(" Finder", "s")} Near You`} 
            href={`/${nicheSlug}/search`} 
          />
          <div className="space-y-6">
            {pros.filter((pro: any) => {
              const serviceKeyword = activeSubService.replace(" Finder", "");
              const matchesService = pro.specialties?.toLowerCase().includes(serviceKeyword.toLowerCase());
              const matchesCity = pro.city?.toLowerCase() === currentCity.name.toLowerCase();
              return matchesService && matchesCity;
            }).length === 0 && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl text-sm flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <span>
                  No local {activeSubService.replace(" Finder", "s")} found in {currentCity.name} yet. Showing top rated professionals from other locations:
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {(() => {
                const serviceKeyword = activeSubService.replace(" Finder", "");
                const local = pros.filter((pro: any) => {
                  const matchesService = pro.specialties?.toLowerCase().includes(serviceKeyword.toLowerCase());
                  const matchesCity = pro.city?.toLowerCase() === currentCity.name.toLowerCase();
                  return matchesService && matchesCity;
                });
                
                const listToRender = local.length > 0 
                  ? local 
                  : pros.filter((pro: any) => pro.specialties?.toLowerCase().includes(serviceKeyword.toLowerCase()));

                return listToRender.length > 0 ? (
                  listToRender.map((pro: any) => (
                    <Link href={getProLink(pro)} key={pro.id}>
                      <NexaCard variant="glass" className="p-0 overflow-hidden group">
                        <div className="relative h-48 bg-slate-200 overflow-hidden">
                          <img 
                            src={getProImage(pro.specialties, pro.subService)} 
                            alt={pro.user?.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          />
                          <div className="absolute top-3 right-3 z-10">
                            {pro.verified && <NexaBadge variant="verified">Verified</NexaBadge>}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                          <div className="absolute bottom-3 left-3 flex items-center gap-2 z-20">
                            <NexaRating value={pro.rating} />
                            <span className="text-white text-xs font-bold">(24 reviews)</span>
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="text-lg font-bold mb-1">{pro.user?.name || "Professional"}</h3>
                          <div className="flex items-center gap-2 text-nexa-text-secondary text-xs mb-4">
                            <MapPin className="w-3 h-3" />
                            <span>{pro.city || "Lagos"}{pro.area ? `, ${pro.area}` : ""}</span>
                            <span className="mx-1">•</span>
                            <Clock className="w-3 h-3" />
                            <span className="text-emerald-500 font-bold">Fast response</span>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t border-nexa-border">
                            <span className="text-xs font-bold text-nexa-brand uppercase tracking-wider">Available Today</span>
                            <NexaButton variant="ghost" size="sm" className="h-8 px-0 text-nexa-brand">Book Now</NexaButton>
                          </div>
                        </div>
                      </NexaCard>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-3 py-12 text-center text-nexa-text-faint italic">
                    No professionals found in this category yet.
                  </div>
                );
              })()}
            </div>
          </div>
        </section>

        <section className="bg-nexa-brand/5 -mx-4 px-4 py-16 rounded-[40px] border border-nexa-brand/10">
          <SectionHeader title="Available for Hire Right Now" href={`/${nicheSlug}/available`} />
          <div className="-mx-4 px-4">
            {(() => {
              const localVerified = pros.filter((p: any) => p.verified && p.city?.toLowerCase() === currentCity.name.toLowerCase());
              const hasLocal = localVerified.length > 0;
              const listToRender = hasLocal ? localVerified : pros.filter((p: any) => p.verified);

              return (
                <div className="space-y-4">
                  {!hasLocal && (
                    <p className="text-sm text-nexa-text-secondary px-4 italic">
                      No verified professionals found in {currentCity.name} right now. Showing professionals from other areas:
                    </p>
                  )}
                  <div className="flex gap-6 overflow-x-auto py-8 no-scrollbar snap-x snap-mandatory scroll-edge-fade">
                    {listToRender.map((pro: any) => (
                      <div key={pro.id} className="flex-shrink-0 w-72 snap-start">
                        <NexaCard variant="glass" className="bg-white/80 dark:bg-slate-900/80 shadow-xl border-none">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-14 h-14 rounded-full bg-nexa-brand/10 border border-nexa-brand/20 flex items-center justify-center text-nexa-brand font-bold text-xl">
                              {pro.user?.name?.[0] || "P"}
                            </div>
                            <div>
                              <h4 className="font-bold">{pro.user?.name}</h4>
                              <div className="flex items-center gap-1 text-[10px] text-nexa-text-faint uppercase font-bold">
                                <Zap className="w-3 h-3 fill-amber-500 text-amber-500" />
                                <span>Instant Booking • {pro.city || "Lagos"}{pro.area ? `, ${pro.area}` : ""}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-xs text-nexa-text-secondary line-clamp-2 mb-4">
                            {pro.bio || "Available for high-quality service."}
                          </p>
                          <div className="flex items-center justify-between">
                            <NexaBadge variant="neutral" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                              Available Today
                            </NexaBadge>
                            <NexaButton size="sm" className="h-8">Hire</NexaButton>
                          </div>
                        </NexaCard>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        <section>
          <SectionHeader title={`${data.name} Supplies & Tools`} href={`/${nicheSlug}/shop`} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data.products.map((product: any, i: number) => (
              <Link href={`/${nicheSlug}/shop/product-${i}`} key={i}>
                <NexaCard variant="flat" padding="none" className="group cursor-pointer h-full flex flex-col">
                  <div className="aspect-square relative overflow-hidden bg-slate-100">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    <div className="absolute bottom-2 right-2">
                      <button className="w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-nexa-brand">
                        <ShoppingBag className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <h4 className="text-sm font-bold mb-1 line-clamp-2">{product.name}</h4>
                    <p className="text-nexa-brand font-bold mt-auto">{product.price}</p>
                  </div>
                </NexaCard>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Expert Articles & Guides" href={`/${nicheSlug}/articles`} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles && articles.length > 0 ? (
              articles.slice(0, 3).map((article: any) => {
                const authorName = article.proProfile?.user?.name || "John Doe";
                const initials = authorName.split(" ").map((n: any) => n[0]).join("").toUpperCase();
                return (
                  <Link href={`/${nicheSlug}/articles/${getArticleSlug(article)}`} key={article.id}>
                    <div className="group cursor-pointer">
                      <div className="aspect-video bg-slate-200 rounded-2xl mb-4 overflow-hidden relative">
                        <img 
                          src={article.image || getProImage(article.proProfile?.specialties || "", article.niche)} 
                          alt={article.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <NexaBadge variant="neutral" className="text-[10px] py-0">
                          {activeSubService.replace(" Finder", "")} Guide
                        </NexaBadge>
                        <span className="text-[10px] text-nexa-text-faint font-bold uppercase">5 min read</span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-nexa-brand transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-nexa-brand/10 flex items-center justify-center text-[10px] font-bold text-nexa-brand">
                          {initials}
                        </div>
                        <span className="text-xs text-nexa-text-secondary font-medium">
                          by {authorName} • Verified Pro
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              // Fallback placeholders if loading or no articles seeded
              [0, 1, 2].map(i => (
                <Link href={`/${nicheSlug}/articles/article-${i}`} key={i}>
                  <div className="group cursor-pointer">
                    <div className="aspect-video bg-slate-200 rounded-2xl mb-4 overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400 group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <NexaBadge variant="neutral" className="text-[10px] py-0">{activeSubService.replace(" Finder", "")} Guide</NexaBadge>
                      <span className="text-[10px] text-nexa-text-faint font-bold uppercase">5 min read</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-nexa-brand transition-colors line-clamp-2">
                      How to choose the best {activeSubService.replace(" Finder", "")} for your project in {currentCity.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-nexa-brand/10 flex items-center justify-center text-[10px] font-bold">JD</div>
                      <span className="text-xs text-nexa-text-secondary font-medium">by John Doe • Verified Seller</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="py-12 border-y border-nexa-border">
          <SectionHeader title="Verified Excellence" viewAll={false} />
          {(() => {
            const localExcellent = pros.filter((p: any) => p.verified && p.city?.toLowerCase() === currentCity.name.toLowerCase());
            const hasLocal = localExcellent.length > 0;
            const listToRender = (hasLocal ? localExcellent : pros.filter((p: any) => p.verified)).slice(0, 2);

            return (
              <div className="space-y-4">
                {!hasLocal && (
                  <p className="text-sm text-nexa-text-secondary italic">
                    No verified excellence found in {currentCity.name} yet. Showing featured professionals:
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listToRender.map((pro: any) => (
                    <NexaCard key={pro.id} variant="glass" className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                      <div className="w-24 h-24 rounded-2xl bg-nexa-brand/10 flex items-center justify-center relative flex-shrink-0">
                        <ShieldCheck className="w-12 h-12 text-nexa-brand" />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="text-center sm:text-left flex-1">
                        <h3 className="text-xl font-bold mb-1">{pro.user?.name}</h3>
                        <p className="text-sm text-nexa-text-secondary mb-3">
                          {pro.rating} rating • {pro.city || "Lagos"}{pro.area ? `, ${pro.area}` : ""} • Professional on Nexa
                        </p>
                        <div className="flex items-center justify-center sm:justify-start gap-3">
                          <Link href={getProLink(pro)}>
                            <NexaButton size="sm" variant="secondary">View Profile</NexaButton>
                          </Link>
                          <span className="text-xs font-bold text-emerald-500">Highly Recommended</span>
                        </div>
                      </div>
                    </NexaCard>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>
      </div>
    </motion.div>
  );
};

const SellerModeLayout = ({ data }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 pt-32 pb-24"
    >
      <div className="flex flex-col gap-12">
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Live Profile Preview</h2>
            <NexaButton variant="ghost" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
              View Live Page
            </NexaButton>
          </div>
          <div className="rounded-3xl border-8 border-nexa-bg-surface shadow-2xl overflow-hidden aspect-[16/7] relative group">
             <div className="absolute inset-0 bg-slate-200 animate-pulse" />
             <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <NexaButton variant="secondary" leftIcon={<Edit3 className="w-4 h-4" />}>Edit Profile</NexaButton>
             </div>
             <div className="absolute top-4 right-4">
                <NexaBadge variant="verified">Live Now</NexaBadge>
             </div>
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Profile Views", value: "1,240", change: "+12%", icon: <Eye className="w-5 h-5 text-blue-500" /> },
            { label: "New Leads", value: "48", change: "+5%", icon: <Zap className="w-5 h-5 text-amber-500" /> },
            { label: "Bookings", value: "12", change: "0%", icon: <Calendar className="w-5 h-5 text-emerald-500" /> },
            { label: "Earnings", value: "₦420k", change: "+8%", icon: <TrendingUp className="w-5 h-5 text-fuchsia-500" /> },
          ].map((kpi, i) => (
            <NexaCard key={i} variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-nexa-bg-base flex items-center justify-center">
                  {kpi.icon}
                </div>
                <span className="text-xs font-bold text-emerald-500">{kpi.change}</span>
              </div>
              <p className="text-nexa-text-faint text-xs font-bold uppercase tracking-wider mb-1">{kpi.label}</p>
              <h3 className="text-2xl font-extrabold">{kpi.value}</h3>
            </NexaCard>
          ))}
        </section>

        <section>
          <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Add Photo", icon: <Plus className="w-6 h-6" /> },
              { label: "Create Deal", icon: <Tag className="w-6 h-6" /> },
              { label: "Write Article", icon: <FileText className="w-6 h-6" /> },
              { label: "Bookings", icon: <Calendar className="w-6 h-6" /> },
              { label: "Add Product", icon: <ShoppingBag className="w-6 h-6" /> },
              { label: "Messages", icon: <MessageSquare className="w-6 h-6" /> },
            ].map((action, i) => (
              <button key={i} className="flex flex-col items-center justify-center p-6 rounded-2xl bg-nexa-bg-surface hover:bg-nexa-bg-glass border border-nexa-border transition-all group">
                <div className="w-12 h-12 rounded-full bg-nexa-brand/10 text-nexa-brand flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                <span className="text-xs font-bold">{action.label}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
           <NexaCard variant="glass" className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-nexa-brand" />
                <h3 className="font-bold">Trending in {data.name}</h3>
              </div>
              <div className="space-y-4">
                {["Emergency Repair", "Weekend Service", "Premium Materials"].map((term, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-nexa-bg-base/50">
                    <span className="text-sm font-medium">{term}</span>
                    <NexaBadge variant="neutral" className="text-[10px]">+{(30 - i*5)}%</NexaBadge>
                  </div>
                ))}
              </div>
           </NexaCard>
           
           <NexaCard variant="glass" className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-nexa-brand" />
                <h3 className="font-bold">Niche Leaderboard</h3>
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((pos) => (
                  <div key={pos} className={cn(
                    "flex items-center justify-between p-3 rounded-xl",
                    pos === 2 ? "bg-nexa-brand/10 border border-nexa-brand/20" : "bg-nexa-bg-base/50"
                  )}>
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-bold w-4">{pos}</span>
                       <div className="w-8 h-8 rounded-full bg-slate-300" />
                       <span className="text-sm font-medium">Business {pos} {pos === 2 && "(You)"}</span>
                    </div>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  </div>
                ))}
              </div>
           </NexaCard>
        </div>
      </div>
    </motion.div>
  );
};

export default function NicheHubClient({ data }: any) {
  const { mode, setCurrentNiche } = useNiche();
  const params = useParams();
  const nicheSlug = (params?.niche as string) || data.id;
  const [activeSubService, setActiveSubService] = useState(data.subServices[0]);
  const [pros, setPros] = useState<any[]>([]);
  const [loadingPros, setLoadingPros] = useState(true);
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    setCurrentNiche(data.id);
    const fetchPros = async () => {
      try {
        const slug = window.location.pathname.split("/").pop();
        const result = await api.get(`/discovery/pros?niche=${data.id}&sub_niche=${slug}`);
        setPros(result);
      } catch (error) {
        console.error("Error fetching pros:", error);
      } finally {
        setLoadingPros(false);
      }
    };

    const fetchArticles = async () => {
      try {
        const result = await api.get(`/discovery/articles?niche=${data.id}`);
        setArticles(result);
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };

    fetchPros();
    fetchArticles();
    return () => setCurrentNiche(null);
  }, [data.id, setCurrentNiche]);

  return (
    <>
      <NexaNavbar />
      
      <AnimatePresence mode="wait">
        {mode === "buyer" ? (
          <BuyerModeLayout 
            key="buyer"
            data={data} 
            nicheSlug={nicheSlug}
            activeSubService={activeSubService} 
            setActiveSubService={setActiveSubService} 
            pros={pros}
            articles={articles}
          />
        ) : (
          <SellerModeLayout 
            key="seller"
            data={data} 
          />
        )}
      </AnimatePresence>

      <NexaBottomBar />
    </>
  );
}
