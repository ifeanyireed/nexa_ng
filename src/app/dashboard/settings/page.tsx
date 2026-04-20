"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Bell, 
  Shield, 
  HelpCircle, 
  LogOut,
  Smartphone,
  Mail,
  MessageSquare,
  Lock,
  EyeOff,
  UserX,
  CreditCard,
  LifeBuoy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("notifications");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h1 className="text-3xl font-extrabold text-display mb-2">Settings & Support</h1>
            <p className="text-nexa-text-secondary">Manage your account preferences and get help.</p>
         </div>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
         {/* SIDEBAR */}
         <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
            {[
               { id: "notifications", label: "Notifications", icon: <Bell className="w-5 h-5" /> },
               { id: "security", label: "Security & Login", icon: <Shield className="w-5 h-5" /> },
               { id: "billing", label: "Billing & Plans", icon: <CreditCard className="w-5 h-5" /> },
               { id: "support", label: "Help & Support", icon: <LifeBuoy className="w-5 h-5" /> },
            ].map(tab => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={cn(
                   "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all text-left",
                   activeTab === tab.id 
                     ? "bg-nexa-brand text-white shadow-lg shadow-nexa-brand/20" 
                     : "text-nexa-text-secondary hover:bg-nexa-bg-surface hover:text-nexa-text-primary"
                 )}
               >
                  {tab.icon}
                  {tab.label}
               </button>
            ))}
            
            <div className="pt-8 mt-8 border-t border-nexa-border">
               <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-red-500 hover:bg-red-500/10 transition-colors text-left">
                  <LogOut className="w-5 h-5" />
                  Sign Out
               </button>
            </div>
         </aside>

         {/* CONTENT */}
         <main className="flex-1">
            {activeTab === "notifications" && (
               <div className="space-y-6">
                  <NexaCard variant="flat" className="p-0 overflow-hidden border-nexa-border">
                     <div className="p-6 border-b border-nexa-border bg-nexa-bg-surface/50">
                        <h2 className="text-xl font-bold">Notification Preferences</h2>
                        <p className="text-sm text-nexa-text-secondary">Control how you want to be alerted about new leads and messages.</p>
                     </div>
                     <div className="p-6 space-y-6">
                        {[
                           { title: "New Leads (PPL)", desc: "Get notified immediately when a new lead matches your criteria.", sms: true, email: true, push: true },
                           { title: "Direct Messages", desc: "When a customer sends you a direct message.", sms: false, email: true, push: true },
                           { title: "Booking Requests", desc: "When a customer requests a booking on your calendar.", sms: true, email: true, push: true },
                           { title: "Reviews & Ratings", desc: "When a customer leaves a review on your profile.", sms: false, email: true, push: false },
                        ].map((item, i) => (
                           <div key={i} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 py-4 border-b border-nexa-border last:border-0 last:pb-0">
                              <div className="flex-1">
                                 <h3 className="font-bold mb-1">{item.title}</h3>
                                 <p className="text-sm text-nexa-text-secondary">{item.desc}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked={item.sms} className="w-4 h-4 rounded border-nexa-border text-nexa-brand focus:ring-nexa-brand" />
                                    <span className="text-xs font-bold text-nexa-text-faint flex items-center gap-1"><Smartphone className="w-3 h-3" /> SMS</span>
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" defaultChecked={item.email} className="w-4 h-4 rounded border-nexa-border text-nexa-brand focus:ring-nexa-brand" />
                                    <span className="text-xs font-bold text-nexa-text-faint flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>
                                 </label>
                              </div>
                           </div>
                        ))}
                     </div>
                  </NexaCard>
                  <div className="flex justify-end">
                     <NexaButton>Save Preferences</NexaButton>
                  </div>
               </div>
            )}

            {activeTab === "security" && (
               <div className="space-y-6">
                  <NexaCard variant="flat" className="p-6 border-nexa-border">
                     <h2 className="text-xl font-bold mb-6">Password</h2>
                     <div className="space-y-4 max-w-md">
                        <div>
                           <label className="block text-xs font-bold text-nexa-text-faint uppercase tracking-widest mb-2">Current Password</label>
                           <input type="password" placeholder="••••••••" className="w-full h-12 bg-nexa-bg-base border border-nexa-border rounded-xl px-4 focus:outline-none focus:border-nexa-brand" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-nexa-text-faint uppercase tracking-widest mb-2">New Password</label>
                           <input type="password" placeholder="••••••••" className="w-full h-12 bg-nexa-bg-base border border-nexa-border rounded-xl px-4 focus:outline-none focus:border-nexa-brand" />
                        </div>
                        <NexaButton className="w-full">Update Password</NexaButton>
                     </div>
                  </NexaCard>

                  <NexaCard variant="flat" className="p-6 border-nexa-border">
                     <h2 className="text-xl font-bold mb-2 text-red-500">Danger Zone</h2>
                     <p className="text-sm text-nexa-text-secondary mb-6">Permanently delete your account and all associated data. This action cannot be undone.</p>
                     <NexaButton variant="secondary" className="text-red-500 border-red-500/20 hover:bg-red-500/10">Delete Account</NexaButton>
                  </NexaCard>
               </div>
            )}

            {activeTab === "support" && (
               <div className="space-y-6">
                  <NexaCard variant="flat" className="p-6 border-nexa-border text-center">
                     <div className="w-16 h-16 rounded-full bg-nexa-brand/10 text-nexa-brand flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8" />
                     </div>
                     <h2 className="text-xl font-bold mb-2">Need Help?</h2>
                     <p className="text-sm text-nexa-text-secondary max-w-md mx-auto mb-6">
                        Our support team is available 24/7 to help you with your account, billing, or any platform issues.
                     </p>
                     <NexaButton size="lg" className="px-12">Start Live Chat</NexaButton>
                  </NexaCard>

                  <h3 className="font-bold text-lg px-2">Frequently Asked Questions</h3>
                  <div className="space-y-3">
                     {[
                        "How do I get my business verified?",
                        "How does Pay-Per-Lead work?",
                        "When do I receive my payouts for bookings?",
                        "Can I change my registered niche?"
                     ].map((faq, i) => (
                        <div key={i} className="p-4 rounded-xl border border-nexa-border bg-nexa-bg-surface hover:border-nexa-brand/50 cursor-pointer transition-colors flex items-center justify-between">
                           <span className="font-bold text-sm">{faq}</span>
                           <HelpCircle className="w-5 h-5 text-nexa-text-faint" />
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </main>
      </div>
    </div>
  );
}
