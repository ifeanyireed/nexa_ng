"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useERPStore, User } from "@/lib/erp-store";

export default function LandingLoginPage() {
  const router = useRouter();
  const { users } = useERPStore();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !password) {
      setError("Please fill in all fields.");
      return;
    }

    // Try to find matching user in our mock database
    const user = users.find(
      u => u.id.toLowerCase() === employeeId.toLowerCase() || u.email.toLowerCase() === employeeId.toLowerCase()
    );

    if (user) {
      localStorage.setItem("erp_current_user", JSON.stringify(user));
      // Redirect to respective dashboard
      router.push(`/${user.role}`);
    } else {
      setError("Invalid Employee ID or Email.");
    }
  };

  return (
    <div 
      className="min-h-screen font-sans flex items-center justify-end p-6 sm:p-12 md:p-20 relative bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: "url('/background.jpeg')" }}
    >
      {/* Rich blue/indigo full-screen gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/75 to-blue-950/40 z-0" />

      {/* Floating Logo/Brand Info on the Left (only visible on medium screens and up) */}
      <div className="hidden md:flex absolute left-12 lg:left-20 top-1/2 -translate-y-1/2 z-10 max-w-md flex-col gap-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
            <img src="/favicon.png" alt="Nets Logo" className="w-6 h-6 object-contain" />
          </div>
          <span className="font-extrabold text-xs tracking-widest uppercase text-blue-200">New Era Transport Services</span>
        </div>
        <div>
          <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight text-display">
            Empowering Talent, <br />
            <span className="text-blue-300">Driving Excellence.</span>
          </h1>
          <p className="text-xs text-blue-100/80 mt-4 leading-relaxed font-semibold">
            Welcome to the NETS ERP Worksuite. Log in to manage human resources, track operations, access financial workflows, and evaluate performance in one unified platform.
          </p>
        </div>
        <div className="text-[10px] text-blue-200/40 font-bold uppercase tracking-wider mt-4">
          © 2026 New Era Transport Services Limited. All rights reserved.
        </div>
      </div>

      {/* Floating Login Card on the Right */}
      <div className="relative z-10 w-full max-w-[370px] bg-slate-900/60 md:bg-white/80 p-6 rounded-[28px] border border-white/10 md:border-white/50 shadow-2xl backdrop-blur-xl flex flex-col gap-4">
        
        {/* Header */}
        <div className="text-center md:text-left">
          <img src="/nets.webp" alt="Nets Logo" className="w-32 h-32 object-contain mx-auto md:mx-0 -mt-6 -mb-12" />
          <h2 className="text-xl font-black text-white md:text-slate-800 tracking-tight">ERP Worksuite</h2>
          <p className="text-[9px] text-slate-400 md:text-slate-550 font-bold uppercase tracking-wide mt-0.5">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-3">
          {error && (
            <div className="bg-red-500/10 md:bg-red-50 text-red-400 md:text-red-650 text-[11px] font-bold p-3 rounded-xl border border-red-500/20 md:border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[9px] font-extrabold text-slate-300 md:text-slate-550 uppercase mb-1 tracking-wider">Employee ID or Email</label>
            <input
              type="text"
              placeholder="e.g. EMP001 or Jane Doe"
              value={employeeId}
              onChange={(e) => { setEmployeeId(e.target.value); setError(""); }}
              className="w-full px-3.5 py-2.5 bg-slate-950/50 md:bg-white border border-white/10 md:border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm text-xs text-white md:text-slate-800"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[9px] font-extrabold text-slate-300 md:text-slate-550 uppercase tracking-wider">Password</label>
              <button
                type="button"
                onClick={() => router.push("/reset-password")}
                className="text-[10px] font-bold text-blue-400 md:text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              className="w-full px-3.5 py-2.5 bg-slate-950/50 md:bg-white border border-white/10 md:border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm text-xs text-white md:text-slate-800"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-98 text-xs"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
