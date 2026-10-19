import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import VerticalHeroBento from "@/components/common/VerticalHeroBento";
import VerticalCategoryBentoGrid from "@/components/common/VerticalCategoryBentoGrid";
import StorefrontCartRail from "@/components/common/StorefrontCartRail";
import {
  UtensilsCrossed,
  Clock,
  Flame,
  ChefHat,
  HeartHandshake,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Food",
  description: "Gourmet Afro-fusion, wood-fired grills & artisan pastries made fresh to order.",
};

export default function FoodStorefrontPage() {
  const store = MOCK_STORES.food;
  const foodProducts = MOCK_PRODUCTS.filter((p) => p.vertical === "food");

  return (
    <div className="min-h-screen bg-[#ECEEF2] text-[#1E1B18] flex flex-col justify-between">
      <StoreHeader store={store} />

      {/* Hero & Category Collage Section:
          Fits exactly in desktop viewport height (100vh - header),
          Cards on Line 1 and Line 2 have almost the same height (flex-1 min-h-0),
          and their sum fits into the screen height. */}
      <section className="w-full max-w-[1720px] mx-auto px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-3.5 flex flex-col gap-3 sm:gap-4 lg:gap-4 lg:h-[calc(100vh-70px)] lg:min-h-[560px] lg:max-h-[calc(100vh-70px)] box-border">
        {/* Live Kitchen Status Strip */}
        <div className="w-full bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-950 py-1.5 px-4 sm:px-6 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-amber-950">
              Kitchen is Live & Grilling:
            </span>
            <span className="text-amber-900">
              Average preparation time currently <strong>20 - 25 minutes</strong>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 font-semibold text-amber-800 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Serving fresh till 10:30 PM today</span>
          </div>
        </div>

        {/* Row 1: Top Hero Showcase (9 cols) & Companion Cart Rail (3 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-4 w-full lg:flex-1 min-h-0 items-stretch">
          <div className="lg:col-span-9 flex h-full min-h-0">
            <VerticalHeroBento
              eyebrow="Wood-Fired Afro-Fusion"
              headline={"Smoky Jollof\n& Grills"}
              highlightText="· Fresh to Order Daily"
              description="Wood-fired grills, slow-braised short-ribs, smoky firewood jollof bowls, and craft pastries prepared with farm-to-table ingredients."
              ctaLabel="Explore Full Menu & Order"
              ctaHref="/food/menu"
              footnote="Kitchen Live: 20-25 Min Express Prep · Open Daily till 10:30 PM"
              image="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80"
              imageAlt="Savory Republic Gourmet Kitchen"
              badge="Fire & Soul"
              bgColor="#FAF6F0"
            />
          </div>

          {/* Companion Cart Rail */}
          <div className="lg:col-span-3 hidden lg:flex h-full min-h-0">
            <StorefrontCartRail sampleProducts={foodProducts} />
          </div>
        </div>

        {/* Row 2: 3-Card Category Bento Grid (Card 1: 25%, Card 2: 25%, Card 3: 50%) */}
        <div className="w-full lg:flex-1 min-h-0">
          <VerticalCategoryBentoGrid
            card1={{
              title: "Gourmet Bowls\n& Jollof",
              count: "35+ dishes",
              image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
              href: "/food/menu",
            }}
            card2={{
              title: "Wood-Fired\nGrills & Suya",
              count: "28+ cuts",
              image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
              href: "/food/menu",
            }}
            card3={{
              title: "Top Collation",
              href: "/food/menu",
              backgroundImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
              pills: [
                {
                  label: "Pastries & Cakes",
                  count: "42 treats",
                  image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=120&q=80",
                  href: "/food/menu",
                },
                {
                  label: "Craft Mocktails",
                  count: "26 blends",
                  image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=120&q=80",
                  href: "/food/menu",
                },
                {
                  label: "Catering Platters",
                  count: "14 packages",
                  image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=120&q=80",
                  href: "/food/custom-order",
                },
              ],
            }}
          />
        </div>
      </section>

      {/* Content Container */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-16">
          {/* Value Badges */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
              <Flame className="w-7 h-7 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">Cooked to Order</h4>
                <p className="text-xs text-stone-500 mt-0.5">Zero microwave holding</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
              <Clock className="w-7 h-7 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">25 Min Average Prep</h4>
                <p className="text-xs text-stone-500 mt-0.5">Live kitchen tracking</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
              <ShieldCheck className="w-7 h-7 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">Thermal Packaging</h4>
                <p className="text-xs text-stone-500 mt-0.5">Arrives piping hot</p>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center gap-3.5">
              <HeartHandshake className="w-7 h-7 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-zinc-900">Dietary Accommodated</h4>
                <p className="text-xs text-stone-500 mt-0.5">Halal, vegan & gluten-free</p>
              </div>
            </div>
          </section>

          {/* Chef Specials & Menu Highlights */}
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-600">Daily Kitchen Signatures</span>
                <h2 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 tracking-tight mt-1">
                  Featured Chef Creations
                </h2>
              </div>
              <Link
                href="/food/menu"
                className="text-sm sm:text-base font-bold text-amber-600 hover:text-amber-700 flex items-center gap-2 transition-colors"
              >
                <span>View Full Menu</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {foodProducts.map((item) => {
                const meta = item.foodMeta;
                return (
                  <div
                    key={item.id}
                    className="group rounded-3xl bg-white border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Food Photo */}
                      <div className="relative aspect-16/10 overflow-hidden bg-stone-100">
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {meta?.prepTime && (
                          <div className="absolute top-3.5 left-3.5 px-3 py-1 rounded-full text-xs font-bold bg-zinc-950/80 text-white flex items-center gap-1.5 backdrop-blur-xs">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Prep: {meta.prepTime}</span>
                          </div>
                        )}
                        {meta?.dietary && meta.dietary.length > 0 && (
                          <div className="absolute bottom-3.5 left-3.5 flex flex-wrap gap-1.5">
                            {meta.dietary.slice(0, 2).map((d) => (
                              <span
                                key={d}
                                className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-white/90 text-zinc-800 shadow-xs"
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-6 space-y-3.5">
                        <div>
                          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                            {item.category}
                          </span>
                          <h3 className="font-dropa text-xl sm:text-2xl font-bold text-zinc-900 mt-1 line-clamp-1 group-hover:text-amber-600 transition-colors">
                            {item.title}
                          </h3>
                        </div>

                        <p className="text-xs sm:text-sm text-stone-500 line-clamp-2 leading-relaxed font-light">
                          {item.description}
                        </p>

                        {/* Portions summary */}
                        {meta?.portionSizes && (
                          <div className="text-xs text-stone-600 pt-2 border-t border-stone-100 flex items-center justify-between">
                            <span className="text-stone-400">Available Sizes:</span>
                            <span className="font-medium text-stone-700">
                              {meta.portionSizes.map((p) => p.name).join(" · ")}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing and Action */}
                    <div className="p-6 pt-0 border-t border-stone-100 mt-2 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-medium text-stone-400 uppercase tracking-wider block">
                          Starts From
                        </span>
                        <span className="font-dropa text-xl sm:text-2xl font-bold text-zinc-900">
                          {store.currency}{item.price.toLocaleString()}
                        </span>
                      </div>

                      <Link
                        href={`/food/item/${item.id}`}
                        className="px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 transition-colors flex items-center gap-2 shadow-xs"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Customize & Order</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Custom Catering & Celebration Cake Banner */}
          <section className="rounded-3xl bg-amber-950 text-white p-8 sm:p-12 border border-amber-900/60 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 text-xs sm:text-sm font-bold uppercase tracking-wider">
                <ChefHat className="w-4 h-4" />
                <span>Bespoke Pastry & Private Catering</span>
              </div>
              <h3 className="font-dropa text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Planning a Celebration or Private Dinner?
              </h3>
              <p className="text-amber-100/80 text-sm sm:text-base leading-relaxed">
                Custom multi-tier celebration cakes, corporate luncheon buffets, and private chef tasting menus designed tailored to your guest headcount and culinary preferences.
              </p>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <Link
                href="/food/custom-order"
                className="w-full md:w-auto px-7 py-4 rounded-full bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-amber-400/20 transition-colors"
              >
                <span>Request Custom Order / Catering</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
        </main>

        <StoreFooter store={store} />
    </div>
  );
}
