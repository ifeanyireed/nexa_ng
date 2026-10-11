"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

interface BlogPost {
  id: string | number;
  title: string;
  slug: string;
  excerpt: string;
  cover_image?: string;
  category?: string;
  published_at?: string;
  created_at?: string;
}

export default function BlogListClient({ posts }: { posts: BlogPost[] }) {
  return (
    <>
      {/* HERO HEADER */}
      <div className="max-w-3xl mb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 bg-nexa-brand/10 text-nexa-brand px-4 py-1.5 rounded-full border border-nexa-brand/20 mb-6"
        >
          <Sparkles className="w-4 h-4 text-nexa-brand" />
          <span className="text-xs font-bold uppercase tracking-[0.2em]">
            Ofia Journal &amp; Engineering
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-display tracking-tight text-slate-900 mb-6 leading-tight"
        >
          Commerce, Logistics <br />
          <span className="text-nexa-brand">&amp; Autonomous AI.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="text-lg sm:text-xl text-nexa-text-secondary leading-relaxed"
        >
          Read the latest technical breakthroughs, merchant playbooks, and platform
          updates driving the new digital economy across Nigeria and West Africa.
        </motion.p>
      </div>

      {posts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-slate-500 py-20 bg-white/60 rounded-2xl border border-nexa-border"
        >
          No blog posts published yet.
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, idx) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 55 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: idx * 0.1, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/90 backdrop-blur-md rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-nexa-border hover:border-nexa-brand/40 group h-full"
            >
              <div className="relative h-56 overflow-hidden bg-slate-100">
                <img
                  src={
                    post.cover_image ||
                    "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686487/ofia_ng_assets/bzilvzajdn8pxlx2m0bb.png"
                  }
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/95 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-slate-200/50">
                    {post.category || "Ecosystem"}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-medium">
                  <span>
                    {new Date(
                      post.published_at || post.created_at || Date.now()
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>Ofia Editorial</span>
                </div>

                <h2 className="text-xl font-bold mb-3 text-slate-900 leading-snug line-clamp-2 group-hover:text-nexa-brand transition-colors">
                  {post.title}
                </h2>

                <p className="text-sm text-nexa-text-secondary mb-6 flex-1 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>

                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-bold text-nexa-brand hover:text-nexa-brand-hover transition-colors group-hover:translate-x-0.5 duration-200"
                  >
                    Read Article <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </>
  );
}
