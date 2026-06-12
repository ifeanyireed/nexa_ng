"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  ArrowRight, 
  Clock, 
  User, 
  ChevronRight,
  BookOpen,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import Link from "next/link";
import { api } from "@/lib/api";

export default function ArticlesClient({ data }: any) {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const nicheSlug = data.id;

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const result = await api.get(`/discovery/articles?niche=${data.id}`);
        setArticles(result);
      } catch (error) {
        console.error("Error fetching niche articles:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [data.id]);

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredArticle = filteredArticles[0];
  const regularArticles = filteredArticles.slice(1);

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      {/* ARTICLES HERO */}
      <section className="pt-32 pb-16 overflow-hidden bg-nexa-bg-surface border-b border-nexa-border">
        <div className="container mx-auto px-4">
           <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1">
                 <NexaBadge variant="brand" className="mb-4">Expert Guides</NexaBadge>
                 <h1 className="text-4xl md:text-5xl font-extrabold text-display mb-6">
                    Insights for {data.name}
                 </h1>
                 <p className="text-lg text-nexa-text-secondary mb-8 max-w-xl">
                    Professional tips, maintenance guides, and industry news written by verified {data.name} experts in Nigeria.
                 </p>
                 <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-nexa-text-faint" />
                    <input 
                      type="text" 
                      placeholder="Search articles..." 
                      className="w-full h-14 pl-12 pr-4 bg-nexa-bg-base border border-nexa-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                 </div>
              </div>
              <div className="hidden lg:block w-1/3">
                 <div className={cn("aspect-square rounded-[40px] flex items-center justify-center opacity-20", data.colorClass)}>
                    <BookOpen className="w-32 h-32" />
                 </div>
              </div>
           </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {loading ? (
           <div className="space-y-12">
              <div className="h-96 rounded-[40px] bg-nexa-bg-surface animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[1, 2, 3].map(i => <div key={i} className="h-64 rounded-3xl bg-nexa-bg-surface animate-pulse" />)}
              </div>
           </div>
        ) : filteredArticles.length > 0 ? (
           <>
              {/* FEATURED ARTICLE */}
              {featuredArticle && (
                <section className="mb-16">
                   <Link href={`/${nicheSlug}/articles/${featuredArticle.id}`}>
                     <NexaCard variant="interactive" padding="none" className="overflow-hidden flex flex-col md:flex-row min-h-[400px]">
                        <div className="flex-1 bg-slate-200 relative">
                           <img 
                              src={featuredArticle.image || "https://images.unsplash.com/photo-1454165833767-027ffea9e77b?auto=format&fit=crop&q=80&w=800"} 
                              className="w-full h-full object-cover" 
                              alt={featuredArticle.title} 
                           />
                           <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
                        </div>
                        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center">
                           <div className="flex items-center gap-2 mb-4">
                              <NexaBadge variant="neutral" className="bg-nexa-brand/10 text-nexa-brand border-nexa-brand/20 uppercase tracking-tighter">Featured</NexaBadge>
                              <span className="text-xs text-nexa-text-faint font-bold">5 min read</span>
                           </div>
                           <h2 className="text-3xl font-extrabold mb-6 group-hover:text-nexa-brand transition-colors">
                              {featuredArticle.title}
                           </h2>
                           <p className="text-nexa-text-secondary mb-8 line-clamp-3">
                              {featuredArticle.content}
                           </p>
                           <div className="flex items-center justify-between mt-auto">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-nexa-brand/10 flex items-center justify-center font-bold">
                                    {featuredArticle.proProfile?.user?.name.charAt(0)}
                                 </div>
                                 <div>
                                    <p className="text-sm font-bold">{featuredArticle.proProfile?.user?.name}</p>
                                    <p className="text-[10px] text-nexa-text-faint uppercase font-bold">Verified Seller</p>
                                 </div>
                              </div>
                              <NexaButton variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>Read More</NexaButton>
                           </div>
                        </div>
                     </NexaCard>
                   </Link>
                </section>
              )}

              {/* ARTICLES GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {regularArticles.map((article, i) => (
                   <motion.div
                     key={article.id}
                     initial={{ opacity: 0, y: 20 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: i * 0.1 }}
                   >
                      <Link href={`/${nicheSlug}/articles/${article.id}`}>
                         <div className="group cursor-pointer">
                            <div className="aspect-video bg-slate-200 rounded-2xl mb-4 overflow-hidden relative">
                               <img 
                                  src={article.image || "https://images.unsplash.com/photo-1454165833767-027ffea9e77b?auto=format&fit=crop&q=80&w=400"} 
                                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                  alt={article.title} 
                               />
                               <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                               <NexaBadge variant="neutral" className="text-[10px] py-0">{data.name}</NexaBadge>
                               <span className="text-[10px] text-nexa-text-faint font-bold uppercase">{new Date(article.createdAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-nexa-brand transition-colors line-clamp-2 leading-snug">
                               {article.title}
                            </h3>
                            <p className="text-sm text-nexa-text-secondary line-clamp-2 mb-4">
                              {article.content}
                            </p>
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-nexa-brand/10 flex items-center justify-center text-[10px] font-bold">
                                  {article.proProfile?.user?.name.charAt(0)}
                               </div>
                               <span className="text-xs text-nexa-text-secondary font-medium">by {article.proProfile?.user?.name}</span>
                            </div>
                         </div>
                      </Link>
                   </motion.div>
                 ))}
              </div>
           </>
        ) : (
           <div className="py-24 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-nexa-bg-surface flex items-center justify-center mx-auto text-nexa-text-faint">
                 <BookOpen className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold">No articles found</h3>
              <p className="text-nexa-text-secondary">Try a different search term or check back later.</p>
           </div>
        )}
        
        {/* LOAD MORE */}
        {!loading && filteredArticles.length > 5 && (
           <div className="mt-16 flex justify-center">
              <NexaButton variant="secondary" size="lg" className="px-12">
                 Load More Articles
              </NexaButton>
           </div>
        )}
      </div>

      <NexaBottomBar />
    </main>
  );
}
