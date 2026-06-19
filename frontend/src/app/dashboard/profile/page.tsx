"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Clock, 
  Phone, 
  Globe, 
  MapPin, 
  Camera, 
  Tag, 
  Users, 
  ShieldCheck, 
  Plus, 
  X, 
  Save, 
  Eye,
  Info,
  Facebook,
  Instagram,
  Twitter,
  Star,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaInput } from "@/components/nexa/NexaInput";
import { getNicheData } from "@/lib/niche-data";
import { useAuth } from "@/components/nexa/AuthContext";
import { api } from "@/lib/api";

export default function ProfileEditorPage() {
  const { user } = useAuth();
  const nicheKey = user?.pro_profile?.niche || "home-services";
  const data = getNicheData(nicheKey);
  const [activeTab, setActiveTab] = useState("info");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [profileData, setProfileData] = useState({
    businessName: "",
    description: "",
    phone: "",
    email: "",
    website: "",
    location: "",
    tags: [] as string[],
    hours: {
      weekday: "08:00 AM - 06:00 PM",
      saturday: "09:00 AM - 04:00 PM",
      sunday: "Closed"
    },
    acceptsPos: false,
    homeDelivery: false
  });

  useEffect(() => {
    if (user?.pro_profile) {
      const p = user.pro_profile;
      setProfileData({
        businessName: p.businessName || user.name || "",
        description: p.bio || "",
        phone: p.phone || "",
        email: p.businessEmail || user.email || "",
        website: "", // Not in schema yet, mock it
        location: p.city ? `${p.area ? p.area + ", " : ""}${p.city}` : "",
        tags: p.specialties ? p.specialties.split(",") : [],
        hours: {
          weekday: "08:00 AM - 06:00 PM",
          saturday: "09:00 AM - 04:00 PM",
          sunday: "Closed"
        },
        acceptsPos: p.acceptsPos || p.accepts_pos || false,
        homeDelivery: p.homeDelivery || p.home_delivery || false
      });
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ text: "", type: "" });
    try {
      // We can use the onboard endpoint or profile update endpoint
      await api.post("/pro/profile", {
        business_name: profileData.businessName,
        bio: profileData.description,
        phone: profileData.phone,
        business_email: profileData.email,
        specialties: profileData.tags.join(","),
        niche: user?.pro_profile?.niche || "home-services",
        accepts_pos: profileData.acceptsPos,
        home_delivery: profileData.homeDelivery
      });
      setMessage({ text: "Profile updated successfully!", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error: any) {
      setMessage({ text: error.message || "Failed to update profile.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: "info", label: "General Info", icon: <Info className="w-4 h-4" /> },
    { id: "hours", label: "Working Hours", icon: <Clock className="w-4 h-4" /> },
    { id: "contact", label: "Contact & Social", icon: <Phone className="w-4 h-4" /> },
    { id: "branding", label: "Branding & Photos", icon: <Camera className="w-4 h-4" /> },
    { id: "tags", label: "Services & Tags", icon: <Tag className="w-4 h-4" /> }
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-12">
      
      {/* EDITOR PANEL */}
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-display">Profile Editor</h1>
            <p className="text-nexa-text-secondary text-sm mt-1">Manage how your business appears to potential customers.</p>
          </div>
          <div className="flex items-center gap-4">
            {message.text && (
              <span className={cn("text-xs font-bold", message.type === "success" ? "text-emerald-500" : "text-red-500")}>
                {message.text}
              </span>
            )}
            <NexaButton 
              leftIcon={<Save className="w-5 h-5" />} 
              className="px-8 shadow-xl shadow-nexa-brand/20"
              onClick={handleSave}
              isLoading={isSaving}
            >
              Save Changes
            </NexaButton>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex items-center gap-2 p-1.5 bg-nexa-bg-surface border border-nexa-border rounded-2xl overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-white dark:bg-slate-800 text-nexa-brand shadow-sm border border-nexa-border" 
                  : "text-nexa-text-faint hover:text-nexa-text-secondary"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* EDITOR CONTENT */}
        <NexaCard className="p-8 min-h-[500px]">
          <AnimatePresence mode="wait">
            {activeTab === "info" && (
              <motion.div
                key="info"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <NexaInput 
                    label="Business Display Name" 
                    value={profileData.businessName}
                    onChange={(e) => setProfileData({...profileData, businessName: e.target.value})}
                  />
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Business Category</label>
                    <div className="h-14 px-4 bg-nexa-bg-base border border-nexa-border rounded-2xl flex items-center text-sm font-bold opacity-60">
                      Home & Maintenance › Handyman Finders
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Business Bio / Description</label>
                  <textarea 
                    className="w-full min-h-[160px] p-4 bg-nexa-bg-base border border-nexa-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all text-sm leading-relaxed"
                    value={profileData.description}
                    onChange={(e) => setProfileData({...profileData, description: e.target.value})}
                  />
                  <p className="text-[10px] text-nexa-text-faint text-right">Max 500 characters. SEO optimized bio recommended.</p>
                </div>

                <div className="pt-6 border-t border-nexa-border space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Service Options</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-4 bg-nexa-bg-base border border-nexa-border rounded-2xl cursor-pointer hover:border-nexa-brand/30 transition-all select-none">
                      <input 
                        type="checkbox" 
                        checked={profileData.acceptsPos}
                        onChange={(e) => setProfileData({ ...profileData, acceptsPos: e.target.checked })}
                        className="w-5 h-5 rounded-lg border-nexa-border text-nexa-brand focus:ring-nexa-brand/20 cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-bold">Accepts POS</p>
                        <p className="text-[10px] text-nexa-text-secondary font-medium">Accept card payments via POS terminal</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-nexa-bg-base border border-nexa-border rounded-2xl cursor-pointer hover:border-nexa-brand/30 transition-all select-none">
                      <input 
                        type="checkbox" 
                        checked={profileData.homeDelivery}
                        onChange={(e) => setProfileData({ ...profileData, homeDelivery: e.target.checked })}
                        className="w-5 h-5 rounded-lg border-nexa-border text-nexa-brand focus:ring-nexa-brand/20 cursor-pointer"
                      />
                      <div>
                        <p className="text-sm font-bold">Home Delivery</p>
                        <p className="text-[10px] text-nexa-text-secondary font-medium">Offer delivery directly to client location</p>
                      </div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "hours" && (
              <motion.div
                key="hours"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/50 flex items-start gap-4 mb-8">
                  <Clock className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm font-bold text-blue-800 dark:text-blue-400 mb-1">Operating Status</p>
                    <p className="text-xs text-blue-700 dark:text-blue-500">Your "Open Now" status is automatically calculated based on these hours.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.entries(profileData.hours).map(([day, val]) => (
                    <div key={day} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-nexa-bg-base rounded-2xl border border-nexa-border">
                      <span className="font-bold text-sm capitalize">{day}</span>
                      <div className="flex items-center gap-4">
                        <NexaInput 
                          value={val} 
                          onChange={(e) => setProfileData({
                            ...profileData, 
                            hours: {...profileData.hours, [day]: e.target.value}
                          })}
                          className="w-full md:w-64"
                        />
                        <div className="w-12 h-6 bg-emerald-500 rounded-full relative p-1 cursor-pointer shrink-0">
                           <div className="absolute right-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "contact" && (
              <motion.div
                key="contact"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <NexaInput 
                    label="Public Phone Number" 
                    value={profileData.phone}
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  />
                  <NexaInput 
                    label="Business Email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  />
                  <NexaInput 
                    label="Website URL" 
                    value={profileData.website}
                    onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                  />
                  <NexaInput 
                    label="Map Address" 
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  />
                </div>

                <div className="pt-8 border-t border-nexa-border">
                   <h3 className="font-bold text-sm mb-6">Social Media Links</h3>
                   <div className="space-y-4">
                      {[
                        { icon: <Facebook className="w-5 h-5" />, label: "Facebook Page" },
                        { icon: <Instagram className="w-5 h-5" />, label: "Instagram Profile" },
                        { icon: <Twitter className="w-5 h-5" />, label: "Twitter / X" }
                      ].map((social, i) => (
                        <div key={i} className="flex items-center gap-4 bg-nexa-bg-base p-2 rounded-2xl border border-nexa-border">
                           <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center border border-nexa-border">
                              {social.icon}
                           </div>
                           <input type="text" placeholder={`Link to your ${social.label}`} className="bg-transparent flex-1 outline-none text-sm" />
                        </div>
                      ))}
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === "branding" && (
               <motion.div
                key="branding"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                 <div className="flex flex-col md:flex-row gap-12">
                    <div className="space-y-4">
                       <label className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Business Logo</label>
                       <div className="w-48 h-48 rounded-[40px] border-2 border-dashed border-nexa-border bg-nexa-bg-base flex flex-col items-center justify-center text-center p-6 group hover:border-nexa-brand transition-all cursor-pointer overflow-hidden relative">
                          <div className={cn("absolute inset-0 opacity-10", data.colorClass)} />
                          <Camera className="w-10 h-10 text-nexa-text-faint group-hover:scale-110 transition-transform mb-3" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-nexa-text-faint">Replace Logo</p>
                       </div>
                    </div>
                    <div className="flex-1 space-y-4">
                       <label className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Cover Image</label>
                       <div className="h-48 rounded-3xl border-2 border-dashed border-nexa-border bg-nexa-bg-base flex flex-col items-center justify-center text-center p-8 group hover:border-nexa-brand transition-all cursor-pointer relative overflow-hidden">
                          <ImageIcon className="w-10 h-10 text-nexa-text-faint group-hover:scale-110 transition-transform mb-3" />
                          <p className="text-[10px] font-bold uppercase tracking-widest text-nexa-text-faint">Upload high-resolution cover photo</p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Portfolio Gallery (Max 12)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                       {[...Array(5)].map((_, i) => (
                          <div key={i} className="aspect-square rounded-2xl bg-slate-200 border border-nexa-border group relative cursor-move">
                             <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-lg">
                                <X className="w-3.5 h-3.5" />
                             </div>
                          </div>
                       ))}
                       <div className="aspect-square rounded-2xl border-2 border-dashed border-nexa-border bg-nexa-bg-base flex items-center justify-center group hover:border-nexa-brand transition-all cursor-pointer">
                          <Plus className="w-6 h-6 text-nexa-text-faint group-hover:text-nexa-brand" />
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "tags" && (
               <motion.div
                key="tags"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                 <div className="space-y-6">
                    <label className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Core Specialties (Keywords for Search)</label>
                    <div className="flex flex-wrap gap-3">
                       {profileData.tags.map(tag => (
                          <div key={tag} className="flex items-center gap-2 px-4 py-2 bg-nexa-brand/10 text-nexa-brand border border-nexa-brand/20 rounded-xl text-sm font-bold">
                             {tag}
                             <X className="w-3.5 h-3.5 cursor-pointer hover:scale-125 transition-transform" />
                          </div>
                       ))}
                       <button className="flex items-center gap-2 px-4 py-2 bg-nexa-bg-base text-nexa-text-faint border border-nexa-border border-dashed rounded-xl text-sm font-bold hover:border-nexa-brand transition-all">
                          <Plus className="w-3.5 h-3.5" />
                          Add Specialty
                       </button>
                    </div>
                 </div>

                 <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-100 dark:border-emerald-900/50">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2 flex items-center gap-2">
                       <ShieldCheck className="w-5 h-5" />
                       Verified Specialties
                    </h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-500 mb-6 leading-relaxed">
                       These specialties require certification upload. Verified tags appear with a shield badge on your profile and boost your search rank by 2x.
                    </p>
                    <NexaButton size="sm" variant="secondary" className="bg-white">Manage Certifications</NexaButton>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </NexaCard>
      </div>

      {/* LIVE PREVIEW SIDEBAR */}
      <aside className="w-full xl:w-[480px]">
        <div className="sticky top-40 space-y-6">
          <div className="flex items-center justify-between px-2">
             <h3 className="font-extrabold text-sm uppercase tracking-widest text-nexa-text-faint flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Live Profile Preview
             </h3>
             <span className="text-[10px] font-bold text-emerald-500 animate-pulse uppercase">Updating Real-time</span>
          </div>
          
          <div className="rounded-[48px] border-8 border-nexa-bg-surface shadow-2xl overflow-hidden bg-nexa-bg-base relative aspect-[9/16] max-h-[800px] mx-auto w-full group">
             {/* SIMULATED PHONE FRAME HEADER */}
             <div className="h-6 w-full bg-nexa-bg-surface flex items-center justify-center">
                <div className="w-16 h-1 rounded-full bg-nexa-border" />
             </div>

             <div className="h-full overflow-y-auto no-scrollbar pb-20">
                {/* PREVIEW CONTENT (Mini version of Public Profile) */}
                <div className={cn("h-40 w-full relative", data.colorClass)}>
                   <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className="px-6 relative -mt-12 mb-8">
                   <div className={cn("w-24 h-24 rounded-[30px] border-4 border-white dark:border-slate-900 flex items-center justify-center text-3xl font-extrabold text-white shadow-xl", data.colorClass)}>
                      {profileData.businessName.charAt(0)}
                   </div>
                   <div className="mt-4">
                      <div className="flex items-center gap-2 mb-1">
                         <h4 className="font-extrabold text-xl line-clamp-1">{profileData.businessName}</h4>
                         <ShieldCheck className="w-4 h-4 text-nexa-brand" />
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-nexa-text-secondary">
                         <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>4.9 (124)</span>
                         </div>
                         <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-nexa-brand" />
                            <span>Lekki, Lagos</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="px-6 space-y-6">
                   <div className="p-4 bg-nexa-bg-surface rounded-2xl">
                      <p className="text-[10px] text-nexa-text-secondary leading-relaxed line-clamp-3 italic">
                         "{profileData.description}"
                      </p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-3">
                      <div className="h-10 bg-nexa-brand text-white rounded-xl flex items-center justify-center text-[10px] font-bold">Book Now</div>
                      <div className="h-10 bg-nexa-bg-surface text-nexa-text-primary border border-nexa-border rounded-xl flex items-center justify-center text-[10px] font-bold">Message</div>
                   </div>

                   <div className="space-y-3">
                      <div className="h-px bg-nexa-border w-full" />
                      <div className="flex justify-between items-center text-[10px] font-bold">
                         <span className="text-nexa-text-faint">SPECIALTY</span>
                         <span className="text-nexa-brand">HANDYMAN</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                         {profileData.tags.map(t => (
                            <span key={t} className="px-2 py-0.5 bg-nexa-bg-surface text-[8px] font-extrabold uppercase rounded-md border border-nexa-border">{t}</span>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
             
             {/* HOVER OVERLAY */}
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-12 text-center pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-4">
                   <Eye className="w-6 h-6 text-nexa-brand" />
                </div>
                <p className="text-white text-sm font-bold">This is a live preview of your public profile across all Nexa platforms.</p>
             </div>
          </div>
        </div>
      </aside>

    </div>
  );
}
