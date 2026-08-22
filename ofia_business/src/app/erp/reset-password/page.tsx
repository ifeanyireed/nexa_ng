"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useERPStore } from "@/lib/erp-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { users } = useERPStore();

  const emailParam = searchParams.get("email") || "";
  const tokenParam = searchParams.get("token") || "";

  const [emailInput, setEmailInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // If email and token are in query parameters, we are in "Update Password" mode.
  // Otherwise, we are in "Request Reset Email" mode.
  const isUpdateMode = !!emailParam && !!tokenParam;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = emailInput.trim();
    if (!targetEmail) {
      setStatusMessage({ text: "Please enter your email address.", type: "error" });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    const user = users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());

    try {
      const res = await fetch(`${API_BASE_URL}/send-reset-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email: targetEmail,
          userIds: user ? [user.id] : [] 
        }),
      });

      let data: any = {};
      const responseText = await res.text();
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseErr) {
          // not JSON
        }
      }

      if (res.ok) {
        setStatusMessage({
          text: `A password reset link has been sent to ${targetEmail}. Please check your inbox.`,
          type: "success",
        });
        setEmailInput("");
      } else {
        setStatusMessage({
          text: `Error: ${data.error || responseText || "Failed to initiate reset email"}`,
          type: "error",
        });
      }
    } catch (e: any) {
      setStatusMessage({ text: `Network error: ${e.message}`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      setStatusMessage({ text: "Please fill in all fields.", type: "error" });
      return;
    }

    if (newPassword.length < 8) {
      setStatusMessage({ text: "Password must be at least 8 characters long.", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`${API_BASE_URL}/update-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailParam,
          token: tokenParam,
          newPassword: newPassword,
        }),
      });

      let data: any = {};
      const responseText = await res.text();
      if (responseText) {
        try {
          data = JSON.parse(responseText);
        } catch (parseErr) {
          // not JSON
        }
      }

      if (res.ok) {
        setStatusMessage({
          text: "Your password has been reset successfully! Redirecting you to login page...",
          type: "success",
        });
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          router.push("/");
        }, 3000);
      } else {
        setStatusMessage({
          text: `Error: ${data.error || responseText || "Failed to update password"}`,
          type: "error",
        });
      }
    } catch (e: any) {
      setStatusMessage({ text: `Network error: ${e.message}`, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen font-sans flex items-center justify-center p-6 sm:p-12 md:p-20 relative bg-cover bg-center overflow-x-hidden"
      style={{ backgroundImage: "url('/background.jpeg')" }}
    >
      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/95 via-blue-900/80 to-blue-950/70 z-0" />

      {/* Floating Card */}
      <div className="relative z-10 w-full max-w-[420px] bg-slate-900/60 md:bg-white/80 p-8 rounded-[28px] border border-white/10 md:border-white/50 shadow-2xl backdrop-blur-xl flex flex-col gap-6">
        
        {/* Brand Header */}
        <div className="text-center">
          <img src="/nets.webp" alt="Nets Logo" className="w-24 h-24 object-contain mx-auto -mt-4" />
          <h2 className="text-2xl font-black text-white md:text-slate-800 tracking-tight mt-2">
            {isUpdateMode ? "Reset Password" : "Forgot Password?"}
          </h2>
          <p className="text-[10px] text-slate-400 md:text-slate-550 font-bold uppercase tracking-wider mt-1">
            {isUpdateMode ? "Choose a secure new password" : "Enter your email to request a reset link"}
          </p>
        </div>

        {/* Status Message Alert */}
        {statusMessage && (
          <div 
            className={`text-xs font-bold p-4 rounded-xl border ${
              statusMessage.type === "success" 
                ? "bg-emerald-500/10 md:bg-emerald-50 text-emerald-400 md:text-emerald-750 border-emerald-500/20 md:border-emerald-100" 
                : "bg-red-500/10 md:bg-red-50 text-red-400 md:text-red-650 border-red-500/20 md:border-red-100"
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {isUpdateMode ? (
          /* Form for Updating Password using the Token link */
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-300 md:text-slate-550 uppercase mb-1 tracking-wider">Email Address</label>
              <input
                type="text"
                value={emailParam}
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-950/20 md:bg-gray-100 border border-white/10 md:border-gray-200 rounded-xl text-xs text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-300 md:text-slate-550 uppercase mb-1 tracking-wider">New Password</label>
              <input
                type="password"
                placeholder="•••••••• (Min 8 chars)"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setStatusMessage(null); }}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950/50 md:bg-white border border-white/10 md:border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm text-xs text-white md:text-slate-800"
              />
            </div>

            <div>
              <label className="block text-[9px] font-extrabold text-slate-300 md:text-slate-550 uppercase mb-1 tracking-wider">Confirm New Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setStatusMessage(null); }}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950/50 md:bg-white border border-white/10 md:border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm text-xs text-white md:text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-98 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : "Save New Password"}
            </button>
          </form>
        ) : (
          /* Form for Requesting Password Reset Link */
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label className="block text-[9px] font-extrabold text-slate-300 md:text-slate-550 uppercase mb-1 tracking-wider">Enter your Email Address</label>
              <input
                type="email"
                placeholder="e.g. employee@neweratransports.com"
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setStatusMessage(null); }}
                required
                className="w-full px-3.5 py-2.5 bg-slate-950/50 md:bg-white border border-white/10 md:border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm text-xs text-white md:text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-all duration-300 hover:scale-[1.01] active:scale-98 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : "Send Reset Link"}
            </button>
          </form>
        )}

        {/* Back to Login link */}
        <div className="text-center mt-2">
          <button
            onClick={() => router.push("/")}
            className="text-xs font-bold text-blue-400 md:text-blue-600 hover:underline bg-transparent border-0 cursor-pointer"
          >
            Back to Login
          </button>
        </div>

      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-955 flex items-center justify-center text-white text-xs">
        Loading...
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
