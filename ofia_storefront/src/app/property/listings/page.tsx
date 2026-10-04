"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MOCK_STORES, MOCK_PRODUCTS } from "@/data/mockStores";
import StoreHeader from "@/components/common/StoreHeader";
import StoreFooter from "@/components/common/StoreFooter";
import {
  Building2,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Search,
  MapPin,
  X,
  SlidersHorizontal,
} from "lucide-react";

export default function PropertyListingsPage() {
  const store = MOCK_STORES.property;
  const allProperties = MOCK_PRODUCTS.filter((p) => p.vertical === "property");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedBedrooms, setSelectedBedrooms] = useState("All");
  const [selectedFurnished, setSelectedFurnished] = useState("All");
  const [sortBy, setSortBy] = useState("featured");

  const propertyTypes = ["All", "Apartment", "Penthouse", "Villa", "Townhouse", "Short-let"];

  const filteredProperties = useMemo(() => {
    return allProperties
      .filter((item) => {
        const meta = item.propertyMeta;
        if (!meta) return true;

        if (
          searchQuery &&
          !item.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !meta.location.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return false;
        }

        if (selectedType !== "All" && meta.propertyType !== selectedType) {
          return false;
        }

        if (selectedBedrooms !== "All") {
          const beds = parseInt(selectedBedrooms);
          if (selectedBedrooms === "4+" && meta.bedrooms < 4) return false;
          if (selectedBedrooms !== "4+" && meta.bedrooms !== beds) return false;
        }

        if (selectedFurnished !== "All" && meta.furnished !== selectedFurnished) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "sqft-desc") {
          return (b.propertyMeta?.squareFeet || 0) - (a.propertyMeta?.squareFeet || 0);
        }
        return 0;
      });
  }, [allProperties, searchQuery, selectedType, selectedBedrooms, selectedFurnished, sortBy]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#111318] flex flex-col justify-between">
      <StoreHeader store={store} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/property" className="hover:text-blue-600 transition-colors">
              Property
            </Link>
            <span>/</span>
            <span className="text-slate-900">Listings & Residences</span>
          </div>
          <h1 className="font-dropa text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Available Residences & Penthouses
          </h1>
          <p className="text-sm text-slate-500">
            Prime residential architecture with title certification, dedicated maintenance, and private viewings.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by neighborhood, building or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
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

            {/* Property Type */}
            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                aria-label="Filter by property type"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {propertyTypes.map((t) => (
                  <option key={t} value={t}>
                    Type: {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Furnished Status */}
            <div>
              <select
                value={selectedFurnished}
                onChange={(e) => setSelectedFurnished(e.target.value)}
                aria-label="Filter by furnished status"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="All">Furnishing: All</option>
                <option value="Fully Furnished">Fully Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                aria-label="Sort property listings"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="featured">Sort: Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="sqft-desc">Size: Largest Sqft</option>
              </select>
            </div>
          </div>

          {/* Quick Bedroom Selector */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-medium">Bedrooms:</span>
            {["All", "1", "2", "3", "4+"].map((bed) => (
              <button
                key={bed}
                onClick={() => setSelectedBedrooms(bed)}
                className={`px-3 py-1 rounded-full font-bold transition-colors ${
                  selectedBedrooms === bed
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {bed === "All" ? "All Beds" : `${bed} Beds`}
              </button>
            ))}

            {(selectedType !== "All" ||
              selectedBedrooms !== "All" ||
              selectedFurnished !== "All" ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedType("All");
                  setSelectedBedrooms("All");
                  setSelectedFurnished("All");
                  setSearchQuery("");
                }}
                className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {filteredProperties.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 space-y-4">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-dropa text-lg font-bold text-slate-800">
              No residences matched your criteria
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try adjusting your bedroom count, property type, or location search to view more listings.
            </p>
            <button
              onClick={() => {
                setSelectedType("All");
                setSelectedBedrooms("All");
                setSelectedFurnished("All");
                setSearchQuery("");
              }}
              className="px-5 py-2.5 rounded-full bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((item) => {
              const meta = item.propertyMeta;
              return (
                <div
                  key={item.id}
                  className="group rounded-3xl bg-white border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-900/90 text-white backdrop-blur-xs border border-white/10">
                          {meta?.propertyType || "Apartment"}
                        </span>
                        {meta?.furnished && (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                            {meta.furnished}
                          </span>
                        )}
                      </div>
                      {meta?.location && (
                        <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-900/80 text-white flex items-center gap-1 backdrop-blur-xs">
                          <MapPin className="w-3 h-3 text-blue-400" />
                          <span>{meta.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Specs */}
                    <div className="p-5 space-y-4">
                      <h3 className="font-dropa text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>

                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-[11px] text-slate-600 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-3.5 h-3.5 text-slate-400" />
                          <span>{meta?.bedrooms} Beds</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Bath className="w-3.5 h-3.5 text-slate-400" />
                          <span>{meta?.bathrooms} Baths</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{meta?.squareFeet} sqft</span>
                        </div>
                      </div>

                      {meta?.amenities && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {meta.amenities.slice(0, 3).map((amenity) => (
                            <span
                              key={amenity}
                              className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200/60"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
                        {meta?.rentalTerms || "Annual Rent"}
                      </span>
                      <span className="font-dropa text-lg font-bold text-slate-900">
                        {store.currency}{item.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/property/listing/${item.id}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                      >
                        Specs
                      </Link>
                      <Link
                        href={`/property/schedule-viewing/${item.id}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Viewing</span>
                      </Link>
                    </div>
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
