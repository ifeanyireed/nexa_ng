"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  ShieldCheck, 
  CheckCircle2,
  Info,
  Clock
} from "lucide-react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { api } from "@/lib/api";
import Link from "next/link";

export default function ArticleDetailClient({ data }: { data: any }) {
  const params = useParams();
  const nicheSlug = params.niche as string;
  const articleId = params.slug as string;
  
  const [article, setArticle] = useState<any>(null);
  const [relatedArticles, setRelatedArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticleAndRelated = async () => {
      try {
        const cleanId = articleId.replace(/^article-/, "");
        const result = await api.get(`/discovery/articles/${cleanId}`);
        setArticle(result);

        // Fetch related articles in the same niche category
        const allArticles = await api.get(`/discovery/articles?niche=${nicheSlug}`);
        const filtered = (allArticles || [])
          .filter((a: any) => a.id !== cleanId)
          .slice(0, 2);
        setRelatedArticles(filtered);
      } catch (error) {
        console.error("Error fetching article detail:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticleAndRelated();
  }, [articleId, nicheSlug]);

  if (loading) {
    return (
      <main className="bg-nexa-bg-base min-h-screen pt-32 pb-24">
        <NexaNavbar />
        <div className="container mx-auto px-4 animate-pulse space-y-12">
           <div className="h-12 bg-nexa-bg-surface rounded-2xl w-3/4" />
           <div className="aspect-[21/9] bg-nexa-bg-surface rounded-[40px]" />
           <div className="space-y-6">
              <div className="h-8 bg-nexa-bg-surface rounded-xl" />
              <div className="h-8 bg-nexa-bg-surface rounded-xl" />
              <div className="h-8 bg-nexa-bg-surface rounded-xl w-2/3" />
           </div>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="bg-nexa-bg-base min-h-screen flex items-center justify-center pt-32 pb-24">
        <NexaNavbar />
        <div className="text-center space-y-6">
           <div className="w-20 h-20 rounded-full bg-nexa-bg-surface flex items-center justify-center mx-auto text-nexa-text-faint">
              <Info className="w-10 h-10" />
           </div>
           <h2 className="text-2xl font-bold">Article Not Found</h2>
           <NexaButton variant="secondary" onClick={() => window.history.back()}>Go Back</NexaButton>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-12">
      <NexaNavbar />
      
      <article className="pt-32">
        {/* ARTICLE HEADER */}
        <div className="container mx-auto px-4 mb-12">
           <Link href={`/${nicheSlug}/articles`} className="inline-flex items-center gap-2 text-nexa-text-faint hover:text-nexa-brand transition-colors mb-8 group">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-bold uppercase tracking-wider">Back to Articles</span>
           </Link>
           
           <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                 <NexaBadge variant="neutral" className="bg-nexa-brand/10 text-nexa-brand border-nexa-brand/20 uppercase tracking-tighter">Expert Guide</NexaBadge>
                 <span className="text-sm text-nexa-text-faint font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Published {new Date(article.createdAt).toLocaleDateString()} • 5 min read
                 </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-display mb-8 leading-tight">
                {article.title}
              </h1>
              
              <div className="flex items-center justify-between py-6 border-y border-nexa-border">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-nexa-brand/10 flex items-center justify-center font-bold text-lg">
                       {article.proProfile?.user?.name.charAt(0)}
                    </div>
                    <div>
                       <div className="flex items-center gap-2">
                          <p className="font-bold">{article.proProfile?.user?.name}</p>
                          <ShieldCheck className="w-4 h-4 text-nexa-brand" />
                       </div>
                       <p className="text-xs text-nexa-text-secondary">Verified {data.name} Expert</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <button className="p-2 rounded-full hover:bg-nexa-bg-surface text-nexa-text-secondary transition-all">
                       <Share2 className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-nexa-bg-surface text-nexa-text-secondary transition-all">
                       <Bookmark className="w-5 h-5" />
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* FEATURE IMAGE */}
        <div className="container mx-auto px-4 mb-16">
           <div className="aspect-[21/9] bg-slate-200 rounded-[40px] overflow-hidden shadow-2xl">
              <img 
                 src={article.image || "https://images.unsplash.com/photo-1454165833767-027ffea9e77b?auto=format&fit=crop&q=80&w=1200"} 
                 className="w-full h-full object-cover" 
                 alt={article.title} 
              />
           </div>
        </div>

        {/* CONTENT AREA */}
        <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between gap-16">
           <div className="flex-1 max-w-4xl">
              <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-extrabold prose-p:text-nexa-text-secondary prose-p:leading-relaxed whitespace-pre-wrap">
                 {article.content}
              </div>

              {/* AUTHOR CARD CTA */}
              {article.proProfile && (
                <NexaCard variant="glass" className="mt-20 p-8 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-nexa-brand/5 to-transparent border-nexa-brand/20">
                   <div className="w-24 h-24 rounded-[32px] bg-nexa-brand/10 flex items-center justify-center text-3xl font-bold flex-shrink-0">
                      {article.proProfile.user?.name.charAt(0)}
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold mb-2">Need an expert {data.name.slice(0, -1)}?</h3>
                      <p className="text-nexa-text-secondary mb-6">{article.proProfile.user?.name} has a {article.proProfile.rating || "5.0"}-star rating on Nexa.</p>
                      <div className="flex flex-wrap justify-center md:justify-start gap-4">
                         <Link href={`/${nicheSlug}/business-${article.proProfile.id}`}>
                            <NexaButton size="lg">Book Now</NexaButton>
                         </Link>
                         <Link href={`/${nicheSlug}/business-${article.proProfile.id}`}>
                            <NexaButton variant="secondary" size="lg">View Full Profile</NexaButton>
                         </Link>
                      </div>
                   </div>
                </NexaCard>
              )}
           </div>

           {/* SIDEBAR */}
           <aside className="w-full lg:w-80 flex-shrink-0 space-y-12">
              <div>
                 <h4 className="font-bold mb-6 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    Quick Checklists
                 </h4>
                 <ul className="space-y-4">
                    {["Ask for CAC Docs", "Check Reviews", "Negotiate Price Early", "Request Timeline"].map(item => (
                       <li key={item} className="flex items-start gap-3 text-sm text-nexa-text-secondary">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          </div>
                          {item}
                       </li>
                    ))}
                 </ul>
              </div>

              <div className="pt-12 border-t border-nexa-border">
                 <h4 className="font-bold mb-6">Related Articles</h4>
                 <div className="space-y-6">
                    {relatedArticles.length > 0 ? (
                       relatedArticles.map((relArticle) => (
                          <Link key={relArticle.id} href={`/${nicheSlug}/articles/${relArticle.id}`} className="block group">
                             <div className="aspect-video bg-slate-200 rounded-xl mb-3 overflow-hidden relative">
                                <img 
                                   src={relArticle.image || "/hero6.jpeg"} 
                                   className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                   alt={relArticle.title} 
                                />
                             </div>
                             <h5 className="font-bold text-sm group-hover:text-nexa-brand transition-colors line-clamp-2">
                                {relArticle.title}
                             </h5>
                             <p className="text-[10px] text-nexa-text-faint mt-1 uppercase font-bold">
                                By {relArticle.proProfile?.user?.name || "Verified Expert"}
                             </p>
                          </Link>
                       ))
                    ) : (
                       <p className="text-xs text-nexa-text-faint italic">
                          More insights coming soon from our verified {data.name} experts.
                       </p>
                    )}
                 </div>
              </div>
           </aside>
        </div>
      </article>

      <NexaBottomBar />
    </main>
  );
}
