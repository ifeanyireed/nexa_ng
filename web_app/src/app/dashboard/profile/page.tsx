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
  Image as ImageIcon,
  Trash2,
  Play,
  Film
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
    homeDelivery: false,
    catalog: [] as { id: string; title: string; items: { id: string; title: string; type: string; url: string }[] }[]
  });

  useEffect(() => {
    if (user?.pro_profile) {
      const p = user.pro_profile;
      let loadedCatalog = [];
      if (p.catalog) {
        try {
          loadedCatalog = JSON.parse(p.catalog);
        } catch (e) {
          console.error("Error parsing catalog:", e);
        }
      }
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
        homeDelivery: p.homeDelivery || p.home_delivery || false,
        catalog: loadedCatalog
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
        home_delivery: profileData.homeDelivery,
        catalog: JSON.stringify(profileData.catalog)
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
    { id: "catalog", label: "Business Catalog", icon: <ImageIcon className="w-4 h-4" /> },
    { id: "tags", label: "Services & Tags", icon: <Tag className="w-4 h-4" /> }
  ];

  return (
    <div className="flex flex-col gap-12">
      
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
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-nexa-text-faint">Business Display Name</label>
                    <input 
                      type="text"
                      className="w-full h-14 px-4 bg-nexa-bg-base border border-nexa-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all text-sm font-bold"
                      value={profileData.businessName}
                      onChange={(e) => setProfileData({...profileData, businessName: e.target.value})}
                    />
                  </div>
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

            {activeTab === "catalog" && (
               <motion.div
                 key="catalog"
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="space-y-8"
               >
                 <div className="flex items-center justify-between border-b border-nexa-border pb-4">
                   <div>
                     <h3 className="text-lg font-bold text-display">Catalog Showcase</h3>
                     <p className="text-xs text-nexa-text-secondary">Organize your showcase items into custom-titled catalog groups.</p>
                   </div>
                   <NexaButton 
                     size="sm" 
                     leftIcon={<Plus className="w-4 h-4" />}
                     onClick={() => {
                       const newGroup = {
                         id: `g-${Date.now()}`,
                         title: "New Catalog Group",
                         items: []
                       };
                       setProfileData({
                         ...profileData,
                         catalog: [...profileData.catalog, newGroup]
                       });
                     }}
                   >
                     Add New Group
                   </NexaButton>
                 </div>

                 <div className="space-y-8">
                   {profileData.catalog.length === 0 ? (
                     <div className="text-center py-12 border-2 border-dashed border-nexa-border rounded-3xl bg-nexa-bg-base">
                       <ImageIcon className="w-12 h-12 text-nexa-text-faint mx-auto mb-3" />
                       <p className="font-bold text-sm text-nexa-text-secondary">No catalog groups added yet</p>
                       <p className="text-xs text-nexa-text-faint mt-1 max-w-sm mx-auto">Create group titles (e.g. "Bridal Makeup", "Men's Cuts") and load photos/videos into them.</p>
                     </div>
                   ) : (
                     profileData.catalog.map((group, groupIdx) => (
                       <div key={group.id} className="p-6 border border-nexa-border rounded-3xl bg-nexa-bg-base space-y-6">
                         <div className="flex items-center justify-between gap-4">
                           <div className="flex-1">
                             <input 
                               type="text" 
                               value={group.title}
                               onChange={(e) => {
                                 const updated = [...profileData.catalog];
                                 updated[groupIdx].title = e.target.value;
                                 setProfileData({ ...profileData, catalog: updated });
                               }}
                               className="font-bold text-lg bg-transparent border-b border-transparent hover:border-nexa-border focus:border-nexa-brand focus:outline-none w-full pb-1 transition-all"
                               placeholder="Group Title (e.g., Living Room Modern Setup)"
                             />
                           </div>
                           <button 
                             onClick={() => {
                               const updated = profileData.catalog.filter(g => g.id !== group.id);
                               setProfileData({ ...profileData, catalog: updated });
                             }}
                             className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                             title="Delete Group"
                           >
                             <Trash2 className="w-5 h-5" />
                           </button>
                         </div>

                         {/* Items Grid */}
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           {group.items.map((item, itemIdx) => (
                             <div key={item.id} className="aspect-[4/3] rounded-2xl bg-nexa-bg-surface border border-nexa-border group relative flex flex-col items-center justify-center overflow-hidden">
                               <img src={item.url} className="w-full h-full object-cover absolute inset-0" alt={item.title} />
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 z-10">
                                 <div className="flex justify-end">
                                   <button 
                                     onClick={() => {
                                       const updated = [...profileData.catalog];
                                       updated[groupIdx].items = updated[groupIdx].items.filter(it => it.id !== item.id);
                                       setProfileData({ ...profileData, catalog: updated });
                                     }}
                                     className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                   >
                                     <X className="w-4 h-4" />
                                   </button>
                                 </div>
                                 <p className="text-white text-[10px] font-bold text-center line-clamp-2 truncate">{item.title}</p>
                               </div>
                               {item.type === "video" && (
                                 <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-none">
                                   <div className="w-8 h-8 rounded-full bg-nexa-brand flex items-center justify-center text-white">
                                     <Play className="w-3.5 h-3.5 fill-white" />
                                   </div>
                                 </div>
                               )}
                             </div>
                           ))}

                           {/* Add Tile Button */}
                           <button 
                             onClick={() => {
                               const title = prompt("Enter a title for this photo/video:", "Showcase Work");
                               if (!title) return;
                               const url = prompt("Enter the photo/video Unsplash or media URL:", "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=400");
                               if (!url) return;
                               const isVideo = confirm("Is this a video? (Cancel for photo)");
                               const updated = [...profileData.catalog];
                               updated[groupIdx].items.push({
                                 id: `item-${Date.now()}`,
                                 title,
                                 type: isVideo ? "video" : "photo",
                                 url
                               });
                               setProfileData({ ...profileData, catalog: updated });
                             }}
                             className="aspect-[4/3] rounded-2xl border-2 border-dashed border-nexa-border bg-nexa-bg-surface hover:border-nexa-brand transition-all flex flex-col items-center justify-center text-nexa-text-faint hover:text-nexa-brand cursor-pointer p-4"
                           >
                             <Plus className="w-6 h-6 mb-2" />
                             <span className="text-[10px] font-bold uppercase tracking-wider">Add Photo/Video</span>
                           </button>
                         </div>
                       </div>
                     ))
                   )}
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
      <aside className="w-full max-w-[480px] mx-auto">
        <div className="space-y-6">
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

                   {/* Catalog Preview */}
                   {profileData.catalog && profileData.catalog.length > 0 && (
                     <div className="space-y-3 pt-2">
                       <div className="h-px bg-nexa-border w-full" />
                       <span className="text-[8px] font-bold tracking-widest text-nexa-text-faint">CATALOG GROUPS</span>
                       <div className="space-y-3">
                         {profileData.catalog.slice(0, 2).map((group: any) => (
                           <div key={group.id} className="space-y-1">
                             <p className="text-[9px] font-bold text-nexa-brand truncate">{group.title}</p>
                             <div className="grid grid-cols-3 gap-2">
                               {group.items?.slice(0, 3).map((item: any) => (
                                 <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-slate-200 border border-nexa-border relative">
                                   <img src={item.url} className="w-full h-full object-cover" alt="" />
                                   {item.type === "video" && (
                                     <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                       <div className="w-4 h-4 rounded-full bg-nexa-brand flex items-center justify-center text-white scale-75">
                                         <Play className="w-2 h-2 fill-white text-white" />
                                       </div>
                                     </div>
                                   )}
                                 </div>
                               ))}
                             </div>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}

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
