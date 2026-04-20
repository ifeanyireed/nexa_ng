"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Image as ImageIcon,
  Bold,
  Italic,
  Link as LinkIcon,
  Heading1,
  Heading2,
  List,
  Video,
  MoreHorizontal,
  CheckCircle2,
  Globe,
  Tag
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ArticleEditorPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaved, setIsSaved] = useState(true);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* EDITOR HEADER */}
      <header className="flex items-center justify-between mb-6 pb-4 border-b border-nexa-border">
         <div className="flex items-center gap-4">
            <Link href="/dashboard/articles" className="p-2 hover:bg-nexa-bg-surface rounded-xl transition-colors">
               <ArrowLeft className="w-5 h-5 text-nexa-text-secondary" />
            </Link>
            <div className="h-6 w-px bg-nexa-border" />
            <div>
               <p className="text-[10px] text-nexa-text-faint font-extrabold uppercase tracking-widest mb-1">
                 {isSaved ? "Saved to Drafts" : "Unsaved Changes"}
               </p>
               <h1 className="font-bold text-sm line-clamp-1">{title || "Untitled Article"}</h1>
            </div>
         </div>
         <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500 mr-2">
               <CheckCircle2 className="w-3.5 h-3.5" /> Auto-saved
            </span>
            <NexaButton variant="secondary" size="sm" leftIcon={<Save className="w-4 h-4" />}>
               Save Draft
            </NexaButton>
            <NexaButton size="sm" leftIcon={<Send className="w-4 h-4" />}>
               Publish
            </NexaButton>
         </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
         {/* MAIN EDITOR AREA */}
         <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center">
            <div className="w-full max-w-3xl space-y-6 pb-24">
               
               {/* COVER IMAGE */}
               <div className="w-full h-64 border-2 border-dashed border-nexa-border rounded-3xl flex flex-col items-center justify-center text-nexa-text-faint hover:bg-nexa-bg-surface/50 hover:border-nexa-brand/50 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-nexa-bg-surface flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                     <ImageIcon className="w-5 h-5 group-hover:text-nexa-brand transition-colors" />
                  </div>
                  <p className="font-bold text-sm">Add Cover Image</p>
                  <p className="text-xs">Recommended 1200x630px</p>
               </div>

               {/* TITLE */}
               <input 
                 type="text" 
                 placeholder="Article Title..." 
                 value={title}
                 onChange={(e) => { setTitle(e.target.value); setIsSaved(false); }}
                 className="w-full bg-transparent text-4xl md:text-5xl font-extrabold text-display placeholder:text-nexa-text-faint outline-none"
               />

               {/* TOOLBAR */}
               <div className="sticky top-0 z-10 flex items-center gap-1 p-2 bg-nexa-bg-surface/80 backdrop-blur-xl border border-nexa-border rounded-2xl shadow-sm">
                  {[Bold, Italic, LinkIcon, Heading1, Heading2, List, ImageIcon, Video].map((Icon, i) => (
                     <button key={i} className="p-2 text-nexa-text-secondary hover:text-nexa-text-primary hover:bg-nexa-bg-base rounded-xl transition-colors">
                        <Icon className="w-4 h-4" />
                     </button>
                  ))}
                  <div className="flex-1" />
                  <button className="p-2 text-nexa-text-secondary hover:text-nexa-text-primary hover:bg-nexa-bg-base rounded-xl transition-colors">
                     <MoreHorizontal className="w-4 h-4" />
                  </button>
               </div>

               {/* CONTENT AREA (MOCK) */}
               <textarea 
                 placeholder="Write your article here... Tip: Focus on value and local insights." 
                 value={content}
                 onChange={(e) => { setContent(e.target.value); setIsSaved(false); }}
                 className="w-full min-h-[400px] bg-transparent text-lg text-nexa-text-secondary leading-relaxed placeholder:text-nexa-text-faint outline-none resize-none"
               />
            </div>
         </div>

         {/* SIDEBAR (SEO & SETTINGS) */}
         <aside className="w-full lg:w-80 flex-shrink-0 overflow-y-auto no-scrollbar space-y-6">
            
            <NexaCard variant="flat" className="p-0 overflow-hidden border-nexa-border">
               <div className="p-4 border-b border-nexa-border bg-nexa-bg-surface/50 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-nexa-text-secondary" />
                  <h3 className="font-bold text-sm">SEO Preview</h3>
               </div>
               <div className="p-4 space-y-2">
                  <p className="text-xs text-nexa-text-faint">This is how your article will appear on Google and inside the Nexa Niche Hub.</p>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
                     <p className="text-[10px] text-nexa-text-faint mb-1 truncate">nexa.ng/home-services/articles/...</p>
                     <h4 className="text-[#1a0dab] dark:text-[#8ab4f8] text-sm font-medium line-clamp-1 hover:underline cursor-pointer">
                        {title || "Your Article Title Will Appear Here"} - NexaNG
                     </h4>
                     <p className="text-xs text-[#4d5156] dark:text-[#9aa0a6] line-clamp-2 mt-1">
                        {content ? content.substring(0, 150) : "Write a compelling excerpt or first paragraph so customers know what your article is about before they click."}...
                     </p>
                  </div>
               </div>
            </NexaCard>

            <NexaCard variant="flat" className="p-0 overflow-hidden border-nexa-border">
               <div className="p-4 border-b border-nexa-border bg-nexa-bg-surface/50 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-nexa-text-secondary" />
                  <h3 className="font-bold text-sm">Categorisation</h3>
               </div>
               <div className="p-4 space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-nexa-text-faint uppercase tracking-widest mb-2">Sub-Service Tag</label>
                     <select className="w-full h-11 bg-nexa-bg-base border border-nexa-border rounded-xl px-3 text-sm font-medium focus:outline-none focus:border-nexa-brand">
                        <option>Plumbing Repair</option>
                        <option>Pipe Installation</option>
                        <option>Water Heater</option>
                        <option>General Maintenance</option>
                     </select>
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-nexa-text-faint uppercase tracking-widest mb-2">Custom Excerpt</label>
                     <textarea 
                       className="w-full bg-nexa-bg-base border border-nexa-border rounded-xl p-3 text-sm text-nexa-text-secondary focus:outline-none focus:border-nexa-brand resize-none h-24"
                       placeholder="Auto-generated from content if left blank..."
                     />
                  </div>
               </div>
            </NexaCard>

            <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 text-sm text-blue-600 dark:text-blue-400">
               <p className="font-bold mb-1">Writing Tip</p>
               <p className="leading-relaxed opacity-90">Articles that mention specific locations (e.g. "Lekki", "Ikeja") perform 3x better in local searches.</p>
            </div>

         </aside>
      </div>
    </div>
  );
}
