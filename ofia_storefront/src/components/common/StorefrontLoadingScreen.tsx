"use client";

import React from "react";

interface StorefrontLoadingScreenProps {
  tenantSlug?: string | null;
}

export default function StorefrontLoadingScreen({ tenantSlug }: StorefrontLoadingScreenProps) {
  return (
    <div className="min-h-screen bg-white text-[#111318] flex flex-col justify-between animate-pulse selection:bg-stone-200">
      {/* 1. Header / Navbar Skeleton */}
      <header className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo & Store Name */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-stone-200/90 shrink-0" />
            <div className="space-y-1.5">
              <div className="w-28 sm:w-36 h-4 sm:h-5 rounded-md bg-stone-200/90" />
              <div className="w-16 h-3 rounded-md bg-stone-100 hidden sm:block" />
            </div>
          </div>

          {/* Search Bar Skeleton */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="w-full h-10 rounded-full bg-stone-100 border border-stone-200/70" />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <div className="w-20 sm:w-24 h-9 sm:h-10 rounded-full bg-stone-100 hidden sm:block" />
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-200" />
            <div className="w-24 sm:w-28 h-9 sm:h-10 rounded-full bg-stone-300" />
          </div>
        </div>
      </header>

      {/* 2. Hero & Category Collage Bento Section */}
      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-5 lg:px-6 py-3 sm:py-4 flex flex-col gap-4 box-border">
        {/* Row 1: Hero Showcase (9 cols) & Cart Rail (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
          {/* Hero Bento */}
          <div className="lg:col-span-9 rounded-3xl bg-stone-100/90 border border-stone-200/80 p-6 sm:p-10 flex flex-col justify-between min-h-[380px] sm:min-h-[460px] relative overflow-hidden">
            <div className="space-y-4 max-w-lg z-10">
              <div className="w-28 h-6 rounded-full bg-stone-200" />
              <div className="space-y-2.5">
                <div className="w-3/4 h-10 sm:h-12 rounded-xl bg-stone-300/80" />
                <div className="w-1/2 h-10 sm:h-12 rounded-xl bg-stone-300/80" />
              </div>
              <div className="space-y-2 pt-2">
                <div className="w-full h-4 rounded bg-stone-200" />
                <div className="w-4/5 h-4 rounded bg-stone-200" />
              </div>
              <div className="pt-4 flex items-center gap-3">
                <div className="w-44 h-11 rounded-full bg-stone-300" />
                <div className="w-32 h-11 rounded-full bg-stone-200" />
              </div>
            </div>

            {/* Faded Backdrop */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2 bg-gradient-to-l from-stone-200/50 to-transparent rounded-r-3xl hidden md:block" />
          </div>

          {/* Cart Rail Skeleton */}
          <div className="lg:col-span-3 hidden lg:flex flex-col justify-between rounded-3xl bg-stone-50 border border-stone-200/80 p-5 space-y-4 min-h-[380px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="w-24 h-5 rounded bg-stone-200" />
                <div className="w-6 h-6 rounded-full bg-stone-200" />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-stone-100">
                  <div className="w-12 h-12 rounded-xl bg-stone-200 shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-3/4 h-3.5 rounded bg-stone-200" />
                    <div className="w-1/2 h-3 rounded bg-stone-100" />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-stone-200 space-y-2">
              <div className="flex justify-between">
                <div className="w-16 h-4 rounded bg-stone-200" />
                <div className="w-20 h-4 rounded bg-stone-200" />
              </div>
              <div className="w-full h-11 rounded-full bg-stone-300" />
            </div>
          </div>
        </div>

        {/* Row 2: 3-Card Category Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-44 sm:h-52 rounded-3xl bg-stone-100/90 border border-stone-200/70 p-5 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="w-28 h-5 rounded bg-stone-200" />
                <div className="w-16 h-3 rounded bg-stone-200/70" />
              </div>
              <div className="w-20 h-7 rounded-full bg-stone-200" />
            </div>
          ))}
        </div>
      </div>

      {/* 3. Products Grid Section Skeleton */}
      <section className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="w-32 h-4 rounded-full bg-stone-200" />
            <div className="w-64 h-8 rounded-xl bg-stone-300" />
          </div>
          <div className="w-28 h-5 rounded bg-stone-200 hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-stone-200/80 bg-white overflow-hidden p-3.5 space-y-3 shadow-xs"
            >
              <div className="w-full aspect-[4/5] rounded-2xl bg-stone-100" />
              <div className="space-y-2.5 p-1">
                <div className="w-20 h-3 rounded bg-stone-200" />
                <div className="w-4/5 h-5 rounded bg-stone-200" />
                <div className="w-3/5 h-3.5 rounded bg-stone-100" />
                <div className="flex items-center justify-between pt-2">
                  <div className="w-24 h-6 rounded bg-stone-300" />
                  <div className="w-20 h-8 rounded-full bg-stone-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Footer Skeleton */}
      <footer className="w-full border-t border-stone-200/80 bg-stone-50/80 py-8 px-6 mt-12">
        <div className="max-w-[1720px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-stone-200" />
            <div className="w-28 h-4 rounded bg-stone-200" />
          </div>
          <div className="flex gap-4">
            <div className="w-16 h-3 rounded bg-stone-200" />
            <div className="w-16 h-3 rounded bg-stone-200" />
            <div className="w-16 h-3 rounded bg-stone-200" />
          </div>
        </div>
      </footer>
    </div>
  );
}
