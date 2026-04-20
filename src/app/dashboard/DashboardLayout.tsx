"use client";

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  UserCircle, 
  Calendar, 
  ShoppingBag, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Grid,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { NexaThemeToggle } from "@/components/nexa/NexaThemeToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  
  const menuItems = [
    { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, href: "/dashboard" },
    { label: "My Profile", icon: <UserCircle className="w-5 h-5" />, href: "/dashboard/profile" },
    { label: "Bookings", icon: <Calendar className="w-5 h-5" />, href: "/dashboard/bookings", badge: "3" },
    { label: "NexaShop", icon: <ShoppingBag className="w-5 h-5" />, href: "/dashboard/shop" },
    { label: "Messages", icon: <MessageSquare className="w-5 h-5" />, href: "/dashboard/messages", badge: "12" },
    { label: "Articles", icon: <FileText className="w-5 h-5" />, href: "/dashboard/articles" },
    { label: "Analytics", icon: <BarChart3 className="w-5 h-5" />, href: "/dashboard/analytics" },
  ];

  return (
    <div className="min-h-screen bg-nexa-bg-base flex relative">
      
      {/* SIDEBAR */}
      <aside className={cn(
        "bg-nexa-bg-surface border-r border-nexa-border transition-all duration-500 flex flex-col z-50 sticky top-0 h-screen",
        isSidebarOpen ? "w-72" : "w-20"
      )}>
        {/* COLLAPSE TOGGLE BUTTON */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 bg-white dark:bg-slate-800 border border-nexa-border rounded-full flex items-center justify-center shadow-lg text-nexa-brand hover:scale-110 transition-transform z-[60]"
        >
          {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className="p-6 flex items-center justify-between">
           {isSidebarOpen && (
             <Link href="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="Nexa" className="w-8 h-8" />
                <span className="text-xl font-extrabold text-display">Nexa</span>
             </Link>
           )}
           {!isSidebarOpen && <img src="/logo.png" alt="Nexa" className="w-8 h-8 mx-auto" />}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-8">
           {menuItems.map((item, i) => {
             const isActive = pathname === item.href;
             return (
               <Link href={item.href} key={i}>
                 <button
                   className={cn(
                     "w-full flex items-center gap-4 p-3 rounded-xl transition-all group mb-1",
                     isActive ? "bg-nexa-brand text-white shadow-lg shadow-nexa-brand/20" : "text-nexa-text-faint hover:bg-nexa-bg-base hover:text-nexa-text-primary"
                   )}
                 >
                    <div className={cn("transition-transform group-hover:scale-110", isActive ? "text-white" : "text-nexa-brand")}>
                      {item.icon}
                    </div>
                    {isSidebarOpen && (
                      <div className="flex-1 flex items-center justify-between text-left">
                        <span className="font-bold text-sm">{item.label}</span>
                        {item.badge && (
                          <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                 </button>
               </Link>
             );
           })}
        </nav>

        <div className="p-4 border-t border-nexa-border space-y-2">
           <Link href="/dashboard/settings">
             <button className={cn("w-full flex items-center gap-4 p-3 rounded-xl transition-all mb-1", pathname === "/dashboard/settings" ? "bg-nexa-brand text-white shadow-lg shadow-nexa-brand/20" : "text-nexa-text-faint hover:bg-nexa-bg-base hover:text-nexa-text-primary")}>
                <div className={cn("transition-transform group-hover:scale-110", pathname === "/dashboard/settings" ? "text-white" : "text-nexa-brand")}>
                  <Settings className="w-5 h-5" />
                </div>
                {isSidebarOpen && <span className="font-bold text-sm">Settings</span>}
             </button>
           </Link>
           <button className="w-full flex items-center gap-4 p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all text-left">
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="font-bold text-sm">Logout</span>}
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto">
        
        {/* DASHBOARD HEADER */}
        <header className="h-20 bg-nexa-bg-surface/80 backdrop-blur-xl border-b border-nexa-border sticky top-0 z-40 px-8 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-nexa-bg-base rounded-xl transition-colors"
              >
                 <Menu className="w-5 h-5 text-nexa-text-secondary" />
              </button>
              <h2 className="text-xl font-bold hidden md:block">Welcome back, Kola</h2>
           </div>

           <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center bg-nexa-bg-base px-4 py-2 rounded-xl border border-nexa-border gap-3 w-64">
                 <Search className="w-4 h-4 text-nexa-text-faint" />
                 <input type="text" placeholder="Search dashboard..." className="bg-transparent text-xs outline-none w-full" />
              </div>
              <NexaThemeToggle />
              <div className="relative p-2 hover:bg-nexa-bg-base rounded-xl cursor-pointer">
                 <Bell className="w-5 h-5 text-nexa-text-secondary" />
                 <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
              </div>
              <div className="h-8 w-px bg-nexa-border" />
              <div className="flex items-center gap-3">
                 <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold">Kola Adewale</p>
                    <p className="text-[10px] text-emerald-500 font-extrabold uppercase">Home Expert</p>
                 </div>
                 <NexaAvatar size="md" isOnline />
              </div>
           </div>
        </header>

        <div className="p-8">
           {children}
        </div>
      </main>
    </div>
  );
}

