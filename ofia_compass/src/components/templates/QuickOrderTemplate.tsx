"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Plus,
  Minus,
  Clock,
  MapPin,
  Star,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Search,
  Filter,
  BadgePercent,
  Sparkles,
} from "lucide-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
  prepTime: string;
  image: string;
  description: string;
  isPopular?: boolean;
}

const DEFAULT_MENU_ITEMS: MenuItem[] = [
  {
    id: "itm-01",
    name: "Smokey Jollof Rice & Crispy Peppered Turkey",
    category: "Main Dishes",
    price: 6500,
    rating: 4.9,
    prepTime: "20-25 mins",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400",
    description: "Authentic firewood smoked party jollof served with spicy fried plantains and tender turkey.",
    isPopular: true,
  },
  {
    id: "itm-02",
    name: "Grilled Catfish Point & Kill (Full Platter)",
    category: "Grills & BBQ",
    price: 14500,
    rating: 5.0,
    prepTime: "30-35 mins",
    image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=400",
    description: "Charcoal grilled fresh live catfish basted in signature spicy habanero herb glaze.",
    isPopular: true,
  },
  {
    id: "itm-03",
    name: "Egusi Soup with Assorted Goat Meat & Pounded Yam",
    category: "Traditional Soups",
    price: 8000,
    rating: 4.8,
    prepTime: "15-20 mins",
    image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=400",
    description: "Rich melon seed soup prepared with bitterleaf, stockfish, shaki, and piping hot pounded yam.",
  },
  {
    id: "itm-04",
    name: "Crispy Beef Shawarma (Double Sausage Loaded)",
    category: "Fast Bites",
    price: 4500,
    rating: 4.7,
    prepTime: "10-15 mins",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&q=80&w=400",
    description: "Thin toasted pita flatbread stuffed with marinated beef strips, sweet cabbage cream, and two sausages.",
  },
];

interface QuickOrderTemplateProps {
  title?: string;
  subtitle?: string;
  subdomain?: string;
}

export const QuickOrderTemplate: React.FC<QuickOrderTemplateProps> = ({
  title = "Food & Fast Delivery",
  subtitle = "Order from verified cloud kitchens and instant eateries with 25-minute doorstep dispatch across Lagos.",
  subdomain = "food",
}) => {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");

  const categories = ["ALL", "Main Dishes", "Grills & BBQ", "Traditional Soups", "Fast Bites"];

  const filteredItems = DEFAULT_MENU_ITEMS.filter((item) => {
    const matchesCat = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      }
      return { ...prev, [id]: next };
    });
  };

  const totalItemsCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const totalAmount = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = DEFAULT_MENU_ITEMS.find((i) => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  return (
    <div className="space-y-6 pb-24">
      {/* HERO BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#E02424]/10 via-[var(--nexa-bg-surface)] to-[var(--nexa-bg-base)] border border-[#E02424]/20 space-y-4 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <NexaBadge variant="red" className="font-mono text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 inline mr-1" />
            Quick-Order Express • {subdomain}.ofia.ng
          </NexaBadge>
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--nexa-text-muted)]">
            <Clock className="w-3.5 h-3.5 text-[#0E9F6E]" />
            <span>Average Delivery: 22 Mins</span>
          </div>
        </div>

        <div className="max-w-2xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--nexa-text-primary)] tracking-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--nexa-text-secondary)] leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* DELIVERY ADDRESS / SEARCH STRIP */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[var(--nexa-text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes, snacks, or restaurants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-primary)] focus:border-[#E02424] outline-none transition-all shadow-inner"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto px-4 py-2 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-xs text-[var(--nexa-text-primary)] font-bold">
            <MapPin className="w-4 h-4 text-[#E02424]" />
            <span>Delivering to Lekki Phase 1, Lagos</span>
          </div>
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? "bg-[#E02424] text-white shadow-sm"
                : "bg-[var(--nexa-bg-surface)] hover:bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] text-[var(--nexa-text-secondary)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* DISHES / MENU GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const qty = cart[item.id] || 0;
          return (
            <NexaCard
              key={item.id}
              variant="glass"
              padding="md"
              className="border border-[var(--nexa-border)] hover:border-[#E02424]/40 transition-all flex flex-col sm:flex-row gap-4 justify-between"
            >
              <div className="w-full sm:w-32 h-32 rounded-2xl overflow-hidden bg-[var(--nexa-bg-base)] shrink-0 border border-[var(--nexa-border)]">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-[var(--nexa-text-muted)] uppercase">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-[#C88A3A]">
                      <Star className="w-3 h-3 fill-current" />
                      {item.rating}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] leading-tight mt-0.5">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-[var(--nexa-text-secondary)] line-clamp-2 mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)]">
                  <div className="text-sm font-black font-mono text-[var(--nexa-text-primary)]">
                    ₦{item.price.toLocaleString()}
                  </div>

                  {/* +/- STEPPER */}
                  {qty === 0 ? (
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-3 py-1.5 rounded-xl bg-[#E02424] hover:bg-[#C81E1E] text-white text-xs font-bold transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add to Tray
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-[var(--nexa-bg-surface)] hover:bg-[#E02424] hover:text-white text-[var(--nexa-text-primary)] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs text-[var(--nexa-text-primary)]">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-6 h-6 rounded-lg bg-[var(--nexa-bg-surface)] hover:bg-[#0E9F6E] hover:text-white text-[var(--nexa-text-primary)] flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </NexaCard>
          );
        })}
      </div>

      {/* FLOATING ORDER TRAY SUMMARY (BOTTOM DOCK) */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-40 animate-slide-up">
          <div className="p-4 rounded-2xl bg-[#0B0F19] text-white border border-[var(--nexa-border)] shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E02424] flex items-center justify-center text-white font-black text-sm">
                {totalItemsCount}
              </div>
              <div>
                <div className="text-xs text-gray-400">Total Tray Value</div>
                <div className="text-base font-black font-mono">₦{totalAmount.toLocaleString()}</div>
              </div>
            </div>

            <Link href="/checkout">
              <NexaButton variant="primary" className="bg-[#E02424] hover:bg-[#C81E1E] text-white text-xs font-bold">
                Order & Fast Dispatch <ArrowRight className="w-4 h-4 ml-1" />
              </NexaButton>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
