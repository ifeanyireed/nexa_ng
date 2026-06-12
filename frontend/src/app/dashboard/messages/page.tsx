"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  MoreVertical, 
  Phone, 
  Video, 
  Info, 
  Send, 
  Smile, 
  Paperclip, 
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Zap,
  Tag,
  Star,
  MapPin,
  ChevronLeft,
  SearchX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState<number | null>(0);
  
  const conversations = [
    {
      id: 0,
      name: "Amina Sanni",
      lastMsg: "Is the price for the plumbing check fixed?",
      time: "2m ago",
      unread: 2,
      isLead: true,
      niche: "Plumbing",
      status: "online"
    },
    {
      id: 1,
      name: "Chidi Okafor",
      lastMsg: "Thank you for the quick repair yesterday!",
      time: "1h ago",
      unread: 0,
      isLead: false,
      niche: "Maintenance",
      status: "offline"
    },
    {
      id: 2,
      name: "Tunde Bakare",
      lastMsg: "Can you come by on Saturday instead?",
      time: "3h ago",
      unread: 0,
      isLead: true,
      niche: "Installation",
      status: "online"
    }
  ];

  const messages = [
    { id: 1, sender: "them", text: "Hello, I saw your profile on the Home Services hub.", time: "10:15 AM" },
    { id: 2, sender: "them", text: "I need a standard plumbing check for my apartment in Lekki.", time: "10:15 AM" },
    { id: 3, sender: "me", text: "Hello Amina! I'd be happy to help. My standard check covers all pipes and drainage points.", time: "10:18 AM" },
    { id: 4, sender: "them", text: "Is the price for the plumbing check fixed?", time: "10:20 AM" },
  ];

  return (
    <div className="h-[calc(100vh-160px)] flex bg-nexa-bg-surface border border-nexa-border rounded-[40px] overflow-hidden shadow-2xl">
      
      {/* CONVERSATION LIST */}
      <div className="w-full md:w-80 lg:w-96 border-r border-nexa-border flex flex-col bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div className="p-6 border-b border-nexa-border">
          <h2 className="text-xl font-extrabold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexa-text-faint" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full h-10 pl-10 pr-4 bg-nexa-bg-base border border-nexa-border rounded-xl focus:outline-none focus:ring-2 focus:ring-nexa-brand/20 transition-all text-xs"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {conversations.map((chat) => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={cn(
                "p-4 flex items-center gap-4 cursor-pointer transition-all border-b border-nexa-border/50",
                selectedChat === chat.id ? "bg-nexa-brand/5 border-l-4 border-l-nexa-brand" : "hover:bg-nexa-bg-base/50"
              )}
            >
              <NexaAvatar fallback={chat.name.charAt(0)} isOnline={chat.status === "online"} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className={cn("font-bold text-sm truncate", chat.unread > 0 && "text-nexa-text-primary")}>{chat.name}</h4>
                  <span className="text-[10px] text-nexa-text-faint font-bold">{chat.time}</span>
                </div>
                <p className={cn("text-xs truncate", chat.unread > 0 ? "text-nexa-text-primary font-bold" : "text-nexa-text-secondary")}>
                  {chat.lastMsg}
                </p>
                <div className="flex items-center justify-between mt-2">
                   <div className="flex gap-1">
                      {chat.isLead && <NexaBadge variant="neutral" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[8px] py-0 px-1.5">New Lead</NexaBadge>}
                      <NexaBadge variant="neutral" className="text-[8px] py-0 px-1.5 opacity-60 uppercase">{chat.niche}</NexaBadge>
                   </div>
                   {chat.unread > 0 && (
                      <div className="w-5 h-5 rounded-full bg-nexa-brand text-white text-[10px] font-extrabold flex items-center justify-center shadow-lg shadow-nexa-brand/20">
                        {chat.unread}
                      </div>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT THREAD */}
      <div className="flex-1 flex flex-col bg-nexa-bg-base/20">
        {selectedChat !== null ? (
          <>
            {/* THREAD HEADER */}
            <div className="h-20 px-8 border-b border-nexa-border flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
               <div className="flex items-center gap-4">
                  <NexaAvatar fallback={conversations[selectedChat].name.charAt(0)} isOnline={conversations[selectedChat].status === "online"} />
                  <div>
                     <h3 className="font-bold">{conversations[selectedChat].name}</h3>
                     <div className="text-[10px] text-emerald-500 font-extrabold uppercase flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Online Now
                     </div>
                  </div>
               </div>
               <div className="flex items-center gap-2">
                  <button className="p-2.5 rounded-xl hover:bg-nexa-bg-surface text-nexa-text-secondary transition-colors"><Phone className="w-5 h-5" /></button>
                  <button className="p-2.5 rounded-xl hover:bg-nexa-bg-surface text-nexa-text-secondary transition-colors"><Video className="w-5 h-5" /></button>
                  <div className="w-px h-8 bg-nexa-border mx-2" />
                  <button className="p-2.5 rounded-xl hover:bg-nexa-bg-surface text-nexa-text-secondary transition-colors"><Info className="w-5 h-5" /></button>
               </div>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-gradient-to-b from-transparent to-nexa-brand/5">
               <div className="flex justify-center mb-8">
                  <span className="px-4 py-1 rounded-full bg-nexa-bg-surface border border-nexa-border text-[10px] font-extrabold text-nexa-text-faint uppercase tracking-widest">Today</span>
               </div>

               {messages.map((m) => (
                  <div key={m.id} className={cn(
                    "flex flex-col max-w-[70%]",
                    m.sender === "me" ? "ml-auto items-end" : "items-start"
                  )}>
                     <div className={cn(
                        "p-4 px-6 rounded-[24px] text-sm leading-relaxed shadow-sm",
                        m.sender === "me" 
                          ? "bg-nexa-brand text-white rounded-tr-none shadow-nexa-brand/10" 
                          : "bg-white dark:bg-slate-800 text-nexa-text-primary rounded-tl-none border border-nexa-border"
                     )}>
                        {m.text}
                     </div>
                     <span className="text-[9px] font-bold text-nexa-text-faint mt-1 uppercase tracking-tighter">{m.time}</span>
                  </div>
               ))}
            </div>

            {/* QUICK REPLIES */}
            <div className="px-8 py-3 flex gap-2 overflow-x-auto no-scrollbar border-t border-nexa-border/30">
               {["I'm available", "Send invoice", "Call me now", "Location sent"].map(t => (
                  <button key={t} className="px-4 py-1.5 rounded-full border border-nexa-border bg-nexa-bg-surface text-[10px] font-bold text-nexa-text-secondary hover:border-nexa-brand hover:text-nexa-brand transition-all whitespace-nowrap">
                     {t}
                  </button>
               ))}
            </div>

            {/* INPUT AREA */}
            <div className="p-6 pt-0">
               <div className="liquid-glass p-2 px-4 rounded-[24px] border border-nexa-border flex items-center gap-4 bg-white dark:bg-slate-900 shadow-2xl">
                  <button className="text-nexa-text-faint hover:text-nexa-brand transition-colors"><Smile className="w-5 h-5" /></button>
                  <button className="text-nexa-text-faint hover:text-nexa-brand transition-colors"><Paperclip className="w-5 h-5" /></button>
                  <div className="w-px h-6 bg-nexa-border" />
                  <input 
                    type="text" 
                    placeholder="Type your message to Amina..." 
                    className="flex-1 bg-transparent border-none outline-none text-sm h-12"
                  />
                  <NexaButton size="sm" className="w-12 h-12 rounded-2xl p-0 flex items-center justify-center shadow-lg shadow-nexa-brand/20">
                     <Send className="w-5 h-5 rotate-45 -translate-y-0.5" />
                  </NexaButton>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
             <div className="w-24 h-24 rounded-full bg-nexa-bg-surface flex items-center justify-center mb-6 text-nexa-text-faint">
                <SearchX className="w-12 h-12" />
             </div>
             <h3 className="text-2xl font-extrabold mb-2">No conversation selected</h3>
             <p className="text-nexa-text-secondary max-w-xs">Select a customer from the left to start responding to inquiries.</p>
          </div>
        )}
      </div>

      {/* LEAD CONTEXT SIDEBAR (Desktop Only) */}
      <div className="hidden xl:flex w-80 border-l border-nexa-border flex-col bg-white/30 dark:bg-slate-900/30">
         {selectedChat !== null ? (
            <div className="p-8 space-y-12">
               <div className="text-center">
                  <NexaAvatar size="xl" fallback={conversations[selectedChat].name.charAt(0)} className="mx-auto mb-4 border-4 border-white shadow-xl" />
                  <h4 className="font-extrabold text-lg">{conversations[selectedChat].name}</h4>
                  <p className="text-xs text-nexa-text-faint font-bold uppercase mt-1">Active Customer</p>
               </div>

               <div className="space-y-6">
                  <h5 className="text-[10px] font-extrabold text-nexa-text-faint uppercase tracking-[0.2em] border-b border-nexa-border pb-2">Business Lead Info</h5>
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center"><Zap className="w-4 h-4" /></div>
                        <div>
                           <p className="text-[10px] font-bold text-nexa-text-faint uppercase">Intent</p>
                           <p className="text-xs font-bold">Standard Plumbing Check</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center"><MapPin className="w-4 h-4" /></div>
                        <div>
                           <p className="text-[10px] font-bold text-nexa-text-faint uppercase">Location</p>
                           <p className="text-xs font-bold">Lekki Phase 1, Lagos</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-6 pt-4">
                  <h5 className="text-[10px] font-extrabold text-nexa-text-faint uppercase tracking-[0.2em] border-b border-nexa-border pb-2">Quick CRM Actions</h5>
                  <div className="grid grid-cols-1 gap-3">
                     <NexaButton variant="secondary" size="sm" className="justify-start px-4 text-xs" leftIcon={<Star className="w-4 h-4" />}>Mark as VIP</NexaButton>
                     <NexaButton variant="secondary" size="sm" className="justify-start px-4 text-xs" leftIcon={<Tag className="w-4 h-4" />}>Add Custom Tag</NexaButton>
                     <NexaButton variant="secondary" size="sm" className="justify-start px-4 text-xs" leftIcon={<CheckCircle2 className="w-4 h-4 text-red-500" />}>Archive Lead</NexaButton>
                  </div>
               </div>

               <NexaCard variant="glass" className="bg-emerald-500/10 border-emerald-500/20 mt-12">
                  <p className="text-[10px] font-bold text-emerald-700 leading-relaxed">
                     Tip: Responding within 5 minutes increases your lead-to-booking conversion by 40%.
                  </p>
               </NexaCard>
            </div>
         ) : (
            <div className="h-full flex items-center justify-center p-8 opacity-20">
               <Info className="w-20 h-20" />
            </div>
         )}
      </div>
    </div>
  );
}
