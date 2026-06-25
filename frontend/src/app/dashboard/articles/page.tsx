"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Bookmark, 
  MessageSquare, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  BarChart3,
  ArrowRight,
  ExternalLink,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { api } from "@/lib/api";
import { useAuth } from "@/components/nexa/AuthContext";
import Link from "next/link";

export default function ArticleManagerPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("published");
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const proId = user?.pro_profile?.id || user?.pro_profile?.ID;
      if (!proId) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.get(`/discovery/articles?proId=${proId}`);
        // Map all to published for now as we don't have draft status in schema
        const mapped = data.map((a: any) => ({ ...a, status: "published" }));
        setArticles(mapped);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchArticles();
    }
  }, [user]);

  const filteredArticles = articles.filter(a => a.status === activeTab);

  if (loading) return (
     <div className="space-y-8 animate-pulse">
        <div className="h-20 bg-nexa-bg-surface rounded-[32px]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {[1, 2, 3].map(i => <div key={i} className="h-24 bg-nexa-bg-surface rounded-2xl" />)}
        </div>
        <div className="space-y-4">
           {[1, 2].map(i => <div key={i} className="h-40 bg-nexa-bg-surface rounded-3xl" />)}
        </div>
     </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-display">Article Manager</h1>
          <p className="text-nexa-text-secondary text-sm mt-1">Establish authority and boost your SEO with professional insights.</p>
        </div>
        <div className="flex items-center gap-3">
          <NexaButton variant="secondary" leftIcon={<BarChart3 className="w-4 h-4" />}>Content Analytics</NexaButton>
          <Link href="/dashboard/articles/new">
             <NexaButton leftIcon={<Plus className="w-4 h-4" />}>Write New Article</NexaButton>
          </Link>
        </div>
      </div>

      {/* ENGAGEMENT STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Total Article Views", val: "4.8k", icon: <Eye className="text-blue-500" />, change: "+12%" },
           { label: "Total Saves/Bookmarks", val: "182", icon: <Bookmark className="text-fuchsia-500" />, change: "+5%" },
           { label: "Nexa Authority Score", val: "84/100", icon: <CheckCircle2 className="text-emerald-500" />, change: "+2" },
         ].map((stat, i) => (
           <NexaCard key={i} variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                 <div className="w-10 h-10 rounded-xl bg-nexa-bg-base flex items-center justify-center">
                    {React.cloneElement(stat.icon as React.ReactElement<any>, { className: "w-5 h-5" })}
                 </div>
                 <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">{stat.change}</span>
              </div>
              <p className="text-nexa-text-faint text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <h4 className="text-2xl font-extrabold">{stat.val}</h4>
           </NexaCard>
         ))}
      </div>

      <div className="space-y-6">
         {/* TABS & SEARCH */}
         <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 p-1 bg-nexa-bg-surface border border-nexa-border rounded-xl">
               {["published", "drafts"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab === "drafts" ? "draft" : "published")}
                    className={cn(
                      "px-6 py-2 rounded-lg text-xs font-extrabold uppercase tracking-widest transition-all",
                      (activeTab === "published" && tab === "published") || (activeTab === "draft" && tab === "drafts")
                        ? "bg-white dark:bg-slate-800 text-nexa-brand shadow-sm border border-nexa-border" 
                        : "text-nexa-text-faint hover:text-nexa-text-secondary"
                    )}
                  >
                    {tab}
                  </button>
               ))}
            </div>
            <div className="relative w-full md:w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-nexa-text-faint" />
               <input 
                 type="text" 
                 placeholder="Search articles..." 
                 className="w-full h-11 pl-11 pr-4 bg-nexa-bg-surface border border-nexa-border rounded-xl focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all text-sm"
               />
            </div>
         </div>

         {/* ARTICLE LIST */}
         <div className="space-y-4">
            <AnimatePresence mode="popLayout">
               {filteredArticles.map((article) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                  >
                     <NexaCard variant="interactive" className="p-6 border-none bg-nexa-bg-surface/50 group">
                        <div className="flex flex-col md:flex-row md:items-center gap-8">
                           <div className="w-full md:w-48 aspect-video rounded-2xl bg-nexa-bg-base border border-nexa-border overflow-hidden shrink-0 flex items-center justify-center text-nexa-text-faint">
                              <FileText className="w-10 h-10 opacity-20" />
                           </div>
                           
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                 <NexaBadge variant="neutral" className="text-[9px] font-extrabold py-0">{user?.pro_profile?.niche}</NexaBadge>
                                 <span className="text-[10px] text-nexa-text-faint font-bold uppercase">{new Date(article.createdAt).toLocaleDateString()}</span>
                              </div>
                              <h3 className="text-lg font-bold mb-2 group-hover:text-nexa-brand transition-colors truncate">{article.title}</h3>
                              <p className="text-xs text-nexa-text-secondary line-clamp-2 leading-relaxed mb-4">
                                 {article.content}
                              </p>
                              
                              <div className="flex items-center gap-6">
                                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-nexa-text-faint uppercase">
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>{Math.floor(Math.random() * 100) + 10} views</span>
                                 </div>
                                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-nexa-text-faint uppercase">
                                    <Bookmark className="w-3.5 h-3.5" />
                                    <span>{Math.floor(Math.random() * 20)} saves</span>
                                 </div>
                                 <div className="flex items-center gap-1.5 text-[10px] font-bold text-nexa-text-faint uppercase">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    <span>{Math.floor(Math.random() * 5)} comments</span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-2 md:flex-col md:items-end justify-between md:justify-center shrink-0">
                              {article.status === "published" && (
                                 <NexaButton size="sm" variant="secondary" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>View Live</NexaButton>
                              )}
                              <div className="flex items-center gap-2">
                                 <button className="p-2.5 rounded-xl bg-nexa-bg-base border border-nexa-border text-nexa-text-secondary hover:text-nexa-brand transition-colors">
                                    <Edit3 className="w-4 h-4" />
                                 </button>
                                 <button className="p-2.5 rounded-xl bg-nexa-bg-base border border-nexa-border text-red-500 hover:bg-red-500/10 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                 </button>
                              </div>
                           </div>
                        </div>
                     </NexaCard>
                  </motion.div>
               ))}
            </AnimatePresence>

            {filteredArticles.length === 0 && (
               <div className="py-32 text-center bg-nexa-bg-surface/30 rounded-[40px] border border-dashed border-nexa-border">
                  <div className="w-20 h-20 bg-nexa-bg-surface rounded-full flex items-center justify-center mx-auto mb-6 text-nexa-text-faint">
                     <BookOpen className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-extrabold mb-2">No {activeTab} articles yet</h3>
                  <p className="text-nexa-text-secondary max-w-xs mx-auto mb-8">
                     Start writing professional guides to increase your visibility on the niche hub.
                  </p>
                  <NexaButton leftIcon={<Plus className="w-5 h-5" />}>Create My First Article</NexaButton>
               </div>
            )}
         </div>

         {/* TIPS PANEL */}
         <NexaCard variant="glass" className="p-8 bg-gradient-to-r from-nexa-brand/5 to-transparent border-nexa-brand/10">
            <div className="flex flex-col md:flex-row items-center gap-12">
               <div className="flex-1">
                  <h4 className="text-lg font-extrabold mb-3">Boosting your search ranking</h4>
                  <p className="text-sm text-nexa-text-secondary leading-relaxed mb-6">
                     Articles written by verified sellers are prioritized in the niche article feed. Each published guide increases your business profile visibility by up to 15%.
                  </p>
                  <div className="flex flex-wrap gap-4">
                     <div className="flex items-center gap-2 text-xs font-bold text-nexa-text-primary">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Use niche keywords
                     </div>
                     <div className="flex items-center gap-2 text-xs font-bold text-nexa-text-primary">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Add quality images
                     </div>
                     <div className="flex items-center gap-2 text-xs font-bold text-nexa-text-primary">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Solve a problem
                     </div>
                  </div>
               </div>
               <NexaButton variant="ghost" className="text-nexa-brand font-extrabold" rightIcon={<ArrowRight className="w-4 h-4" />}>Learn More</NexaButton>
            </div>
         </NexaCard>
      </div>
    </div>
  );
}
