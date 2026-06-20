"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Navigation, 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  Star,
  ExternalLink,
  Info
} from "lucide-react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { getProLink } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { api } from "@/lib/api";
import Link from "next/link";

// Mapping of areas to base coordinates in Nigeria
const AREA_COORDINATES: Record<string, [number, number]> = {
  // Lagos
  "ikeja": [6.6018, 3.3515],
  "lekki": [6.4281, 3.4219],
  "surulere": [6.5059, 3.3619],
  "yaba": [6.5095, 3.3711],
  "victoriaisland": [6.4281, 3.4219],
  "ikoyi": [6.4549, 3.4410],
  // Abuja
  "garki": [9.0238, 7.4831],
  "wuse": [9.0683, 7.4789],
  "maitama": [9.0913, 7.5028],
  // Fallbacks
  "lagos": [6.5244, 3.3792],
  "abuja": [9.0578, 7.4951]
};

// Deterministic jitter/offset helper
const getCoordinates = (areaName: string, cityName: string, proId: string) => {
  const normArea = (areaName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normCity = (cityName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  
  let baseCoords = AREA_COORDINATES[normArea] || AREA_COORDINATES[normCity] || [6.5244, 3.3792];
  
  // Deterministic offset based on proId string hash
  let hash = 0;
  const str = proId || "";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const latOffset = ((hash & 0xFF) / 255 - 0.5) * 0.008;
  const lngOffset = (((hash >> 8) & 0xFF) / 255 - 0.5) * 0.008;
  
  return [baseCoords[0] + latOffset, baseCoords[1] + lngOffset] as [number, number];
};

export default function NearMeClient({ data }: { data: any }) {
  const [radius, setRadius] = useState(5);
  const [pros, setPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activePro, setActivePro] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  
  // 1. Fetch professionals
  useEffect(() => {
    const fetchPros = async () => {
      setLoading(true);
      try {
        const result = await api.get(`/discovery/pros?niche=${data.id}`);
        setPros(result);
      } catch (error) {
        console.error("Failed to fetch pros near me:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPros();
  }, [data.id]);

  // 2. Inject Leaflet assets dynamically (build-safe)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin = "";
    document.head.appendChild(link);

    // Load Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.async = true;
    script.onload = () => {
      setMapLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  // 3. Initialize Map & Plot Markers
  useEffect(() => {
    if (!mapLoaded || loading) return;
    const L = (window as any).L;
    if (!L) return;

    // Clean up previous instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default map center (Lagos)
    const map = L.map("leaflet-map-container", {
      zoomControl: false,
      attributionControl: false
    }).setView([6.5244, 3.3792], 11);

    mapInstanceRef.current = map;
    markersRef.current = {};

    // Add TileLayer (OpenStreetMap Hot Style tiles)
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      maxZoom: 19
    }).addTo(map);

    // Add Attribution
    L.control.attribution({
      prefix: false
    }).addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors').addTo(map);

    // Filtered list of pros
    const filteredPros = pros.filter(pro => 
      (pro.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pro.specialties || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Plot Markers
    const bounds: any[] = [];
    filteredPros.forEach((pro) => {
      const coords = getCoordinates(pro.area, pro.city, pro.id);
      bounds.push(coords);

      const markerHtml = `
        <div class="relative flex items-center justify-center">
          <div class="absolute -top-7 w-9 h-9 rounded-full bg-nexa-brand text-white border-2 border-white flex items-center justify-center shadow-xl font-extrabold text-xs select-none hover:scale-110 transition-transform">
            ${(pro.user?.name || "P")[0]}
          </div>
          <div class="w-3.5 h-3.5 rounded-full bg-nexa-brand border-2 border-white shadow-md animate-ping absolute top-0"></div>
          <div class="w-3.5 h-3.5 rounded-full bg-nexa-brand border-2 border-white shadow-md absolute top-0"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: "custom-leaflet-marker",
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      // HTML template for Popups
      const popupContent = `
        <div class="p-2 space-y-2 font-sans w-52">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-nexa-brand uppercase tracking-wider">${pro.specialties?.split(",")[0] || 'Service'}</span>
            <span class="flex items-center gap-0.5 text-xs font-bold bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">
              ★ ${pro.rating || '5.0'}
            </span>
          </div>
          <h4 class="font-extrabold text-sm text-slate-800">${pro.user?.name}</h4>
          <p class="text-[10px] text-slate-500 flex items-center gap-1">
            <svg class="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            ${pro.area || 'Area'}, ${pro.city || 'City'}
          </p>
          <a href="${getProLink(pro)}" class="inline-flex items-center justify-center w-full h-8 text-center text-xs font-bold bg-nexa-brand text-white rounded-lg hover:bg-opacity-90 transition-colors shadow">
            Book Service
          </a>
        </div>
      `;

      const marker = L.marker(coords, { icon: customIcon })
        .addTo(map)
        .bindPopup(popupContent, {
          closeButton: false,
          offset: [0, -20]
        });

      // Bind click events
      marker.on("click", () => {
        setActivePro(pro);
        // Scroll sidebar item into view
        const element = document.getElementById(`pro-card-${pro.id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });

      markersRef.current[pro.id] = marker;
    });

    // Zoom map to fit all bounds if markers exist
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [mapLoaded, loading, pros, searchQuery]);

  // Center on selected professional
  const handleProClick = (pro: any) => {
    setActivePro(pro);
    if (!mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const coords = getCoordinates(pro.area, pro.city, pro.id);
    mapInstanceRef.current.setView(coords, 14, { animate: true });

    // Open Leaflet popup
    const marker = markersRef.current[pro.id];
    if (marker) {
      marker.openPopup();
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };
  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };
  const handleRecenter = () => {
    if (mapInstanceRef.current && pros.length > 0) {
      const bounds = pros.map(p => getCoordinates(p.area, p.city, p.id));
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  const filteredPros = pros.filter(pro => 
    (pro.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (pro.specialties || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-0">
      <NexaNavbar />
      
      <div className="pt-20 h-[calc(100vh-64px)] lg:h-screen flex flex-col lg:flex-row overflow-hidden">
        {/* SIDEBAR LIST */}
        <aside className="w-full lg:w-[400px] bg-nexa-bg-surface border-r border-nexa-border flex flex-col z-20">
           <div className="p-6 border-b border-nexa-border">
              <div className="flex items-center justify-between mb-6">
                 <h1 className="text-xl font-bold">Near Me</h1>
                 <NexaBadge variant="brand">{data.name}</NexaBadge>
              </div>
              <div className="space-y-4">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexa-text-faint" />
                    <input 
                      type="text" 
                      placeholder={`Find ${data.name.toLowerCase()}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-11 pl-10 pr-4 bg-nexa-bg-base border border-nexa-border rounded-xl text-sm focus:outline-none"
                    />
                 </div>
                 <div className="flex items-center gap-2">
                    <NexaButton variant="secondary" size="sm" className="flex-1" leftIcon={<SlidersHorizontal className="w-3.5 h-3.5" />}>
                       Filters
                    </NexaButton>
                    <div className="flex-1 px-3 h-9 bg-nexa-bg-base border border-nexa-border rounded-lg flex items-center justify-between">
                       <span className="text-xs font-bold text-nexa-text-secondary">{radius}km radius</span>
                       <ChevronDown className="w-3.5 h-3.5" />
                    </div>
                 </div>
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
              {loading ? (
                <div className="py-12 text-center">
                   <div className="inline-block w-6 h-6 border-2 border-nexa-brand border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                filteredPros.map((pro, i) => (
                  <div 
                    key={pro.id} 
                    id={`pro-card-${pro.id}`}
                    onClick={() => handleProClick(pro)}
                    className="block"
                  >
                    <NexaCard 
                      variant={activePro?.id === pro.id ? "glass" : "interactive"} 
                      className={`p-4 cursor-pointer group transition-all duration-300 ${activePro?.id === pro.id ? "border-nexa-brand ring-1 ring-nexa-brand/20 bg-nexa-brand/5" : ""}`}
                    >
                       <div className="flex gap-4">
                          <div className={`w-16 h-16 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center font-bold transition-colors ${activePro?.id === pro.id ? "bg-nexa-brand text-white" : "bg-nexa-brand/10 text-nexa-brand"}`}>
                             {pro.user?.name?.[0]}
                          </div>
                          <div className="flex-1">
                             <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-sm line-clamp-1 group-hover:text-nexa-brand transition-colors">{pro.user?.name}</h3>
                                <div className="flex items-center gap-1 text-[10px] font-bold">
                                   <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                   <span>{pro.rating || '5.0'}</span>
                                </div>
                             </div>
                             <p className="text-[10px] text-nexa-text-secondary mb-2">{(0.5 + i * 0.4).toFixed(1)}km • {pro.area || 'Lekki'}, {pro.city || 'Lagos'}</p>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                   <NexaBadge variant="success" className="text-[9px] py-0">Available</NexaBadge>
                                   <span className="text-[10px] text-nexa-text-faint font-bold uppercase tracking-tighter">Fast Response</span>
                                </div>
                                {activePro?.id === pro.id && (
                                  <Link href={getProLink(pro)} onClick={(e) => e.stopPropagation()}>
                                    <span className="text-xs font-bold text-nexa-brand flex items-center gap-1 hover:underline">
                                      View Profile <ExternalLink className="w-3 h-3" />
                                    </span>
                                  </Link>
                                )}
                             </div>
                          </div>
                       </div>
                    </NexaCard>
                  </div>
                ))
              )}
              {!loading && filteredPros.length === 0 && (
                <div className="py-12 text-center text-nexa-text-faint italic px-6">
                  No professionals found near your location.
                </div>
              )}
           </div>
        </aside>

        {/* MAP VIEW */}
        <section className="flex-1 relative bg-[#e5e7eb] overflow-hidden">
           {/* Leaflet map container */}
           <div id="leaflet-map-container" className="w-full h-full z-10" />

           {!mapLoaded && (
              <div className="absolute inset-0 bg-[#e5e7eb] flex items-center justify-center z-20">
                 <div className="text-nexa-text-faint flex flex-col items-center gap-4">
                    <Navigation className="w-12 h-12 animate-pulse" />
                    <p className="font-bold text-sm uppercase tracking-widest text-center px-6">
                       Initializing Map...
                    </p>
                 </div>
              </div>
           )}

           {mapLoaded && (
             <>
               <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                  <NexaButton 
                    size="lg" 
                    className="rounded-full shadow-2xl px-8" 
                    leftIcon={<Navigation className="w-5 h-5" />}
                    onClick={handleRecenter}
                  >
                     Recenter Map
                  </NexaButton>
               </div>
               
               <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
                  <button 
                    onClick={handleZoomIn}
                    className="w-12 h-12 rounded-xl liquid-glass flex items-center justify-center shadow-lg text-nexa-text-primary hover:bg-white/20 transition-all font-bold text-xl"
                  >
                     +
                  </button>
                  <button 
                    onClick={handleZoomOut}
                    className="w-12 h-12 rounded-xl liquid-glass flex items-center justify-center shadow-lg text-nexa-text-primary hover:bg-white/20 transition-all font-bold text-xl"
                  >
                     −
                  </button>
               </div>
             </>
           )}
        </section>
      </div>

      <div className="lg:hidden">
         <NexaBottomBar />
      </div>
    </main>
  );
}
