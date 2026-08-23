"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Menu,
  Check,
  CheckCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import { NexaThemeToggle } from "@/components/nexa/NexaThemeToggle";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/nexa/AuthContext";
import { RoleGuard } from "@/components/nexa/RoleGuard";
import { api, getAuthToken } from "@/lib/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [bookingsCount, setBookingsCount] = useState<number>(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState<number>(0);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = async () => {
    try {
      const data = await api.get("/notifications");
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const fetchBookingsCount = async () => {
    try {
      const data = await api.get("/bookings");
      if (data && Array.isArray(data)) {
        const count = data.filter(b => b.status.toLowerCase() === "pending").length;
        setBookingsCount(count);
      }
    } catch (err) {
      console.error("Failed to fetch bookings count:", err);
    }
  };

  const fetchUnreadMessagesCount = async () => {
    try {
      const data = await api.get("/chat/conversations");
      if (data && Array.isArray(data)) {
        const sum = data.reduce((acc, conv) => acc + (conv.unread || 0), 0);
        setUnreadMessagesCount(sum);
      }
    } catch (err) {
      console.error("Failed to fetch unread messages count:", err);
    }
  };

  useEffect(() => {
    fetchBookingsCount();
    fetchUnreadMessagesCount();
  }, [pathname]);

  useEffect(() => {
    fetchNotifications();

    const token = getAuthToken();
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8085/api";
    const wsUrl = apiUrl.replace("http://", "ws://").replace("https://", "wss://") + `/ws?token=${token}`;

    let socket: WebSocket | null = null;
    let reconnectTimeout: any = null;

    const connectWS = () => {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log("Dashboard Layout WebSocket connected");
      };

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === "notification" && payload.data) {
            setNotifications(prev => {
              if (prev.some(n => n.id === payload.data.id)) return prev;
              return [payload.data, ...prev];
            });
            if (payload.data.type === "BOOKING") {
              fetchBookingsCount();
            }
          } else if (payload.senderId && payload.text) {
            setUnreadMessagesCount(prev => prev + 1);
          }
        } catch (err) {
          // Ignore non-notification events
        }
      };

      socket.onclose = () => {
        console.log("Dashboard Layout WebSocket disconnected. Reconnecting...");
        reconnectTimeout = setTimeout(connectWS, 5000);
      };
    };

    connectWS();

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {});
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all", {});
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const getNotifStyles = (type: string) => {
    switch (type) {
      case "BOOKING":
        return { bg: "bg-teal-500/10 text-teal-500 border-teal-500/20", label: "Booking" };
      case "ORDER":
        return { bg: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Order" };
      case "DELIVERY":
        return { bg: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "Delivery" };
      case "SUBSCRIPTION":
        return { bg: "bg-rose-500/10 text-rose-500 border-rose-500/20", label: "Subscription" };
      case "ADMIN_PUSH":
        return { bg: "bg-purple-500/10 text-purple-500 border-purple-500/20", label: "Announcement" };
      default:
        return { bg: "bg-slate-500/10 text-slate-500 border-slate-500/20", label: "System" };
    }
  };

  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  const isPro = user?.role === "PRO";
  const isAdmin = user?.role === "ADMIN";
  
  const menuItems = [
    { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, href: "/dashboard" },
    ...(isPro || isAdmin ? [
      { label: "My Profile", icon: <UserCircle className="w-5 h-5" />, href: "/dashboard/profile" }
    ] : [
      { label: "Become a Pro", icon: <UserCircle className="w-5 h-5" />, href: "/dashboard/profile" }
    ]),
    { label: "Bookings", icon: <Calendar className="w-5 h-5" />, href: "/dashboard/bookings", badge: bookingsCount > 0 ? String(bookingsCount) : undefined },
    { label: "Messages", icon: <MessageSquare className="w-5 h-5" />, href: "/dashboard/messages", badge: unreadMessagesCount > 0 ? String(unreadMessagesCount) : undefined },
    ...(isPro || isAdmin ? [
      { label: "NexaShop", icon: <ShoppingBag className="w-5 h-5" />, href: "/dashboard/shop" },
      { label: "Articles", icon: <FileText className="w-5 h-5" />, href: "/dashboard/articles" },
      { label: "Analytics", icon: <BarChart3 className="w-5 h-5" />, href: "/dashboard/analytics" }
    ] : [])
  ];

  return (
    <RoleGuard allowedRoles={["CLIENT", "PRO"]}>
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
                <img src="/logo.png" alt="Ofia Compass" className="w-8 h-8" />
                <span className="text-xl font-extrabold text-display">Ofia Compass</span>
             </Link>
           )}
           {!isSidebarOpen && <img src="/logo.png" alt="Ofia Compass" className="w-8 h-8 mx-auto" />}
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
           <button onClick={logout} className="w-full flex items-center gap-4 p-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all text-left">
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
              <h2 className="text-xl font-bold hidden md:block">Welcome back, {user?.name?.split(" ")[0] || "User"}</h2>
           </div>
 
           <div className="flex items-center gap-6">
              <div className="hidden lg:flex items-center bg-nexa-bg-base px-4 py-2 rounded-xl border border-nexa-border gap-3 w-64">
                 <Search className="w-4 h-4 text-nexa-text-faint" />
                 <input type="text" placeholder="Search dashboard..." className="bg-transparent text-xs outline-none w-full" />
              </div>
              <NexaThemeToggle />
              <div className="relative" ref={dropdownRef}>
                 <button 
                   onClick={() => setIsNotifOpen(!isNotifOpen)}
                   className="relative p-2 hover:bg-nexa-bg-base rounded-xl cursor-pointer text-nexa-text-secondary focus:outline-none transition-colors"
                 >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full border border-white dark:border-slate-900 text-[9px] font-bold text-white flex items-center justify-center px-1 animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                 </button>

                 {isNotifOpen && (
                   <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-nexa-bg-surface border border-nexa-border rounded-2xl shadow-2xl z-[100] overflow-hidden flex flex-col max-h-[500px]">
                      {/* Header */}
                      <div className="p-4 border-b border-nexa-border flex items-center justify-between bg-nexa-bg-base/50">
                         <span className="font-extrabold text-sm text-display">Notifications</span>
                         {unreadCount > 0 && (
                           <button 
                             onClick={markAllAsRead}
                             className="text-xs text-nexa-brand hover:underline font-bold flex items-center gap-1"
                           >
                              <CheckCheck className="w-3.5 h-3.5" />
                              Mark all read
                           </button>
                         )}
                      </div>

                      {/* Scrollable list */}
                      <div className="flex-1 overflow-y-auto divide-y divide-nexa-border max-h-[350px]">
                         {notifications.length === 0 ? (
                           <div className="p-8 text-center text-nexa-text-faint">
                              <p className="text-sm font-semibold">All caught up! 🎉</p>
                              <p className="text-xs mt-1">No notifications to show.</p>
                           </div>
                         ) : (
                           notifications.map((notif) => {
                             const styles = getNotifStyles(notif.type);
                             return (
                               <div 
                                 key={notif.id}
                                 className={cn(
                                   "p-4 transition-colors flex gap-3 items-start relative group hover:bg-nexa-bg-base/30",
                                   !notif.isRead && "bg-nexa-brand/5 dark:bg-nexa-brand/10"
                                 )}
                               >
                                  <div className="flex-1">
                                     <div className="flex items-center gap-2 mb-1">
                                        <span className={cn("text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider", styles.bg)}>
                                          {styles.label}
                                        </span>
                                        <span className="text-[10px] text-nexa-text-faint font-semibold">
                                          {timeAgo(notif.createdAt)}
                                        </span>
                                     </div>
                                     <h4 className="text-xs font-bold text-nexa-text-primary">{notif.title}</h4>
                                     <p className="text-xs text-nexa-text-secondary mt-0.5 leading-relaxed">{notif.message}</p>
                                  </div>

                                  {!notif.isRead && (
                                    <button 
                                      onClick={() => markAsRead(notif.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-nexa-bg-base rounded-lg text-nexa-text-secondary transition-all"
                                      title="Mark as read"
                                    >
                                       <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    </button>
                                  )}
                               </div>
                             );
                           })
                         )}
                      </div>
                   </div>
                 )}
              </div>
              <div className="h-8 w-px bg-nexa-border" />
              <div className="flex items-center gap-3">
                 <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold">{user?.name || "User"}</p>
                    <p className="text-[10px] text-emerald-500 font-extrabold uppercase">
                      {user?.role === "PRO" ? (user?.pro_profile?.niche || "Professional") : "Client"}
                    </p>
                 </div>
                 <NexaAvatar size="md" isOnline name={user?.name || "User"} />
              </div>
           </div>
        </header>

        <div className="p-8">
           {children}
        </div>
      </main>
    </div>
    </RoleGuard>
  );
}

