"use client";

import React from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Share2, 
  Bookmark, 
  MessageSquare, 
  Calendar, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NICHE_DETAILS } from "@/lib/niche-data";
import Link from "next/link";

export default function ArticleDetailPage() {
  const params = useParams();
  const nicheSlug = params.niche as string;
  const data = NICHE_DETAILS[nicheSlug] || NICHE_DETAILS["home-services"];

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
                 <NexaBadge variant="neutral" className="bg-nexa-brand/10 text-nexa-brand border-nexa-brand/20 uppercase tracking-tighter">Guide</NexaBadge>
                 <span className="text-sm text-nexa-text-faint font-medium">Published Oct 15, 2026 • 8 min read</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-display mb-8 leading-tight">
                How to Choose the Best {data.name} Professionals for Your Lagos Home
              </h1>
              
              <div className="flex items-center justify-between py-6 border-y border-nexa-border">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-nexa-brand/10 flex items-center justify-center font-bold text-lg">JD</div>
                    <div>
                       <div className="flex items-center gap-2">
                          <p className="font-bold">John Doe</p>
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
              {/* Placeholder for article image */}
           </div>
        </div>

        {/* CONTENT AREA */}
        <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-16">
           <div className="flex-1 max-w-3xl">
              <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-extrabold prose-p:text-nexa-text-secondary prose-p:leading-relaxed">
                 <p className="text-xl font-medium text-nexa-text-primary mb-12">
                    Whether you're embarking on a major renovation or just need a quick repair, finding the right professional in Nigeria's commercial capital requires a strategic approach.
                 </p>
                 
                 <h2 className="text-3xl mb-6">1. Verify Their Track Record</h2>
                 <p className="mb-8">
                    Don't just take their word for it. In the {data.name} industry, pictures of past work are non-negotiable. Always ask for a portfolio or check their verified Nexa profile for a gallery of completed projects.
                 </p>
                 
                 <div className="my-12 p-8 bg-nexa-brand/5 border-l-4 border-nexa-brand rounded-r-3xl italic text-xl text-nexa-text-secondary">
                    "Reliability is the most expensive currency in the Nigerian service market. When you find a professional who shows up on time, you've found gold."
                 </div>

                 <h2 className="text-3xl mb-6">2. Communication is Key</h2>
                 <p className="mb-8">
                    How quickly do they respond to your initial message? A professional who values your time will likely value the quality of their work. Look for the "Instant Responder" badge on Nexa.
                 </p>
              </div>

              {/* AUTHOR CARD CTA */}
              <NexaCard variant="glass" className="mt-20 p-8 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-nexa-brand/5 to-transparent border-nexa-brand/20">
                 <div className="w-24 h-24 rounded-[32px] bg-nexa-brand/10 flex items-center justify-center text-3xl font-bold flex-shrink-0">JD</div>
                 <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold mb-2">Need an expert {data.name.slice(0, -1)}?</h3>
                    <p className="text-nexa-text-secondary mb-6">John Doe has over 150+ successful projects and a 4.9-star rating on Nexa.</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4">
                       <NexaButton size="lg">Book John Doe Now</NexaButton>
                       <NexaButton variant="secondary" size="lg">View Full Profile</NexaButton>
                    </div>
                 </div>
              </NexaCard>
           </div>

           {/* SIDEBAR */}
           <aside className="w-full lg:w-80 space-y-12">
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
                    {[1, 2].map(i => (
                       <div key={i} className="group cursor-pointer">
                          <div className="aspect-video bg-slate-200 rounded-xl mb-3 overflow-hidden" />
                          <h5 className="font-bold text-sm group-hover:text-nexa-brand transition-colors line-clamp-2">
                             Top 10 {data.name} trends in Lagos for 2026
                          </h5>
                       </div>
                    ))}
                 </div>
              </div>
           </aside>
        </div>
      </article>

      <NexaBottomBar />
    </main>
  );
}
