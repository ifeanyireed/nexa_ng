"use client";

import React from "react";

export default function LoadingScreen({ message = "Synchronizing performance data..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 bg-[#F0F2F5]/80 backdrop-blur-md z-[9999] flex flex-col items-center justify-center p-6 transition-all duration-300">
      <div className="flex flex-col items-center gap-6 max-w-sm w-full text-center">
        {/* Animated Glow Logo Ring Container */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          {/* Pulsing Blue Backglow */}
          <div className="absolute inset-0 bg-blue-600/15 rounded-full blur-xl animate-pulse" />
          
          {/* Inner Spinning Ring - Blue Dashboard Spinner */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />

          {/* Core Logo Dot in Circle */}
          <div className="relative z-10 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm overflow-hidden p-1.5 border border-slate-100">
            <img src="/favicon.png" alt="Nets Loading Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Loading Message and Brand Details */}
        <div className="flex flex-col gap-1.5">
          <h4 className="text-xs uppercase tracking-widest font-black text-blue-600">{message}</h4>
          <p className="text-[11px] text-slate-400 font-bold">Please wait while we connect to the database.</p>
        </div>
      </div>
    </div>
  );
}

