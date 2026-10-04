"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Search,
  Filter,
  Car,
  Gauge,
  Settings2,
  Fuel,
  CheckCircle2,
  Calendar,
  X,
  SlidersHorizontal,
} from "lucide-react";

export default function CarsListingsPage() {
  const store = MOCK_STORES.cars;
  const allCars = MOCK_PRODUCTS.filter((p) => p.vertical === "cars");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMake, setSelectedMake] = useState<string>("All");
  const [selectedCondition, setSelectedCondition] = useState<string>("All");
  const [selectedTransmission, setSelectedTransmission] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("featured");

  // Derive unique makes
  const makes = useMemo(() => {
    const list = new Set<string>();
    allCars.forEach((c) => {
      if (c.carMeta?.make) list.add(c.carMeta.make);
    });
    return ["All", ...Array.from(list)];
  }, [allCars]);

  const filteredCars = useMemo(() => {
    return allCars
      .filter((car) => {
        const meta = car.carMeta;
        if (!meta) return true;

        if (
          searchQuery &&
          !car.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !meta.make.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !meta.model.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        if (selectedMake !== "All" && meta.make !== selectedMake) {
          return false;
        }

        if (selectedCondition !== "All" && meta.condition !== selectedCondition) {
          return false;
        }

        if (
          selectedTransmission !== "All" &&
          meta.transmission !== selectedTransmission
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "year-desc") {
          return (b.carMeta?.year || 0) - (a.carMeta?.year || 0);
        }
        return 0;
      });
  }, [allCars, searchQuery, selectedMake, selectedCondition, selectedTransmission, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0F172A] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header & Breadcrumb */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/cars" className="hover:text-blue-600 transition-colors">
              Cars
            </Link>
            <span>/</span>
            <span className="text-slate-900">Listings & Inventory</span>
          </div>
          <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Vehicle Fleet Inventory
          </h1>
          <p className="text-sm text-slate-500">
            Explore certified pre-owned, foreign used, and brand new luxury models inspected and ready for immediate delivery.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by make, model, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Make Selector */}
            <div>
              <select
                value={selectedMake}
                onChange={(e) => setSelectedMake(e.target.value)}
                aria-label="Filter by vehicle make"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              >
                {makes.map((mk) => (
                  <option key={mk} value={mk}>
                    Make: {mk}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Selector */}
            <div>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                aria-label="Filter by vehicle condition"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              >
                <option value="All">Condition: All</option>
                <option value="Brand New">Brand New</option>
                <option value="Foreign Used">Foreign Used</option>
                <option value="Certified Pre-Owned">Certified Pre-Owned</option>
              </select>
            </div>

            {/* Sort Selector */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort vehicle inventory"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
              >
                <option value="featured">Sort: Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="year-desc">Year: Newest First</option>
              </select>
            </div>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Quick Transmission:</span>
            {["All", "Automatic", "Manual"].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTransmission(t)}
                className={`px-3 py-1 rounded-full font-bold transition-colors ${
                  selectedTransmission === t
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {t}
              </button>
            ))}

            {(selectedMake !== "All" ||
              selectedCondition !== "All" ||
              selectedTransmission !== "All" ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedMake("All");
                  setSelectedCondition("All");
                  setSelectedTransmission("All");
                  setSearchQuery("");
                }}
                className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
          <span>Showing {filteredCars.length} vehicles matching your criteria</span>
        </div>

        {/* Vehicle Grid */}
        {filteredCars.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 space-y-4">
            <Car className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-dropa text-lg font-bold text-slate-800">
              No vehicles found
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              We couldn&apos;t find any vehicles matching your filter options. Try resetting your filters or contacting our dealership desk directly.
            </p>
            <button
              onClick={() => {
                setSelectedMake("All");
                setSelectedCondition("All");
                setSelectedTransmission("All");
                setSearchQuery("");
              }}
              className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => {
              const meta = car.carMeta;
              return (
                <div
                  key={car.id}
                  className="group rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Vehicle Image */}
                    <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                      <img
                        src={car.images[0]}
                        alt={car.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-white backdrop-blur-xs border border-white/10">
                          {meta?.condition || "Certified"}
                        </span>
                        {meta?.year && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                            {meta.year}
                          </span>
                        )}
                      </div>
                      {meta?.inspectionScore && (
                        <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white flex items-center gap-1 backdrop-blur-xs">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Audit: {meta.inspectionScore}/100</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="p-5 space-y-4">
                      <div>
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                          {meta?.make} · {meta?.model}
                        </span>
                        <h3 className="font-dropa text-lg font-bold text-slate-900 mt-0.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {car.title}
                        </h3>
                      </div>

                      {/* Specs Matrix */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-[11px] text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Gauge className="w-3.5 h-3.5 text-slate-400" />
                          <span>{meta?.mileage || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Settings2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{meta?.transmission || "Auto"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Fuel className="w-3.5 h-3.5 text-slate-400" />
                          <span>{meta?.fuelType || "Petrol"}</span>
                        </div>
                      </div>

                      {/* Highlights */}
                      <ul className="space-y-1 text-xs text-slate-600">
                        {car.highlights.slice(0, 2).map((item, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                            <span className="line-clamp-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                        Outright Price
                      </span>
                      <span className="font-dropa text-lg font-bold text-slate-900">
                        {store.currency}{car.price.toLocaleString()}
                      </span>
                    </div>

                    <Link
                      href={`/cars/listing/${car.id}`}
                      className="px-4 py-2 rounded-full text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <Car className="w-3.5 h-3.5" />
                      <span>View Vehicle & Test-Drive</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <StoreFooter store={store} />
    </div>
  );
}
