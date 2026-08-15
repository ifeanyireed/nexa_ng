"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  MapPin, 
  Navigation, 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  Star,
  ExternalLink,
  Info,
  Loader2
} from "lucide-react";
import { NexaNavbar, NexaBottomBar } from "@/components/nexa/NexaNav";
import { getProLink } from "@/lib/utils";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { useLocation } from "@/components/nexa/LocationContext";
import { api } from "@/lib/api";
import { loadGoogleMapsScript, nexaMapStyles, GOOGLE_MAPS_API_KEY } from "@/lib/google-maps";
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
  "festac": [6.4674, 3.2842],
  "festactown": [6.4674, 3.2842],
  // Abuja
  "garki": [9.0238, 7.4831],
  "wuse": [9.0683, 7.4789],
  "maitama": [9.0913, 7.5028],
  // Other Cities
  "ibadan": [7.3775, 3.9470],
  "portharcourt": [4.8156, 7.0498],
  "kano": [12.0022, 8.5919],
  "benincity": [6.3350, 5.6263],
  "abeokuta": [7.1599, 3.3486],
  "enugu": [6.4584, 7.5086],
  "kaduna": [10.5105, 7.4165],
  "jos": [9.8965, 8.8583],
  // Fallbacks
  "lagos": [6.5244, 3.3792],
  "abuja": [9.0578, 7.4951]
};

// Deterministic jitter/offset helper
const getCoordinates = (areaName: string, cityName: string, proId: string) => {
  const normArea = (areaName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normCity = (cityName || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  
  let baseCoords = AREA_COORDINATES[normArea] || AREA_COORDINATES[normCity] || [6.5244, 3.3792];
  
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
  const { currentCity, currentArea, userCoords, isLoading, autoDetectLocation } = useLocation();

  useEffect(() => {
    autoDetectLocation();
  }, [autoDetectLocation]);

  const [radius] = useState(5);
  const [pros, setPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activePro, setActivePro] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const infoWindowsRef = useRef<Record<string, any>>({});
  
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

  const normCity = (currentCity?.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const normArea = (currentArea || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const baseCoords = AREA_COORDINATES[normArea] || AREA_COORDINATES[normCity] || [6.5244, 3.3792];
  const mapCenterCoords = userCoords ? { lat: userCoords[0], lng: userCoords[1] } : { lat: baseCoords[0], lng: baseCoords[1] };

  // 2. Initialize Google Maps
  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then((maps) => {
        if (!isMounted || !mapContainerRef.current) return;

        const map = new maps.Map(mapContainerRef.current, {
          center: mapCenterCoords,
          zoom: 13,
          styles: nexaMapStyles,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: false,
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);
      })
      .catch((err) => {
        console.error("Failed to initialize Google Maps in NearMe:", err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered list of pros
  const localPros = pros.filter(pro => {
    const matchesSearch = 
      (pro.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pro.specialties || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = pro.city?.toLowerCase() === currentCity?.name?.toLowerCase();
    return matchesSearch && matchesCity;
  });

  const hasLocal = localPros.length > 0;
  const filteredPros = hasLocal 
    ? localPros 
    : pros.filter(pro => 
        (pro.user?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (pro.specialties || "").toLowerCase().includes(searchQuery.toLowerCase())
      );

  // 3. Plot Google Maps Markers
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || typeof window === "undefined") return;
    const maps = (window as any).google?.maps;
    if (!maps) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker: any) => marker.setMap(null));
    markersRef.current = {};
    infoWindowsRef.current = {};

    const map = mapInstanceRef.current;
    const bounds = new maps.LatLngBounds();

    // Plot user location marker if available
    if (userCoords) {
      const userLatLng = new maps.LatLng(userCoords[0], userCoords[1]);
      bounds.extend(userLatLng);

      new maps.Marker({
        position: userLatLng,
        map,
        title: "Your Location",
        icon: {
          path: maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#3b82f6",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });
    }

    // Plot pro markers
    filteredPros.forEach((pro) => {
      const coords = getCoordinates(pro.area, pro.city, pro.id);
      const position = new maps.LatLng(coords[0], coords[1]);
      bounds.extend(position);

      const marker = new maps.Marker({
        position,
        map,
        title: pro.user?.name || pro.businessName || "Pro Location",
      });

      const infoContent = `
        <div style="padding: 10px; font-family: system-ui, sans-serif; max-width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 11px; font-weight: bold; color: #ff5722; text-transform: uppercase;">${pro.specialties?.split(",")[0] || "Service"}</span>
            <span style="font-size: 11px; font-weight: bold; background: #fef3c7; color: #d97706; padding: 2px 6px; border-radius: 4px;">★ ${pro.rating || "5.0"}</span>
          </div>
          <h4 style="font-size: 14px; font-weight: bold; margin: 0 0 4px; color: #0f172a;">${pro.user?.name || pro.businessName}</h4>
          <p style="font-size: 12px; color: #64748b; margin: 0 0 8px;">${pro.area ? pro.area + ", " : ""}${pro.city || "Lagos"}</p>
          <a href="${getProLink(pro)}" style="display: block; text-align: center; background: #ff5722; color: #ffffff; text-decoration: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: bold;">
            Book Service
          </a>
        </div>
      `;

      const infoWindow = new maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener("click", () => {
        // Close other info windows
        Object.values(infoWindowsRef.current).forEach((iw: any) => iw.close());
        infoWindow.open(map, marker);
        setActivePro(pro);

        // Scroll into view on sidebar
        const element = document.getElementById(`pro-card-${pro.id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });

      markersRef.current[pro.id] = marker;
      infoWindowsRef.current[pro.id] = infoWindow;
    });

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    }
  }, [mapLoaded, filteredPros, userCoords]);

  // Center on selected professional
  const handleProClick = (pro: any) => {
    setActivePro(pro);
    if (!mapInstanceRef.current || typeof window === "undefined") return;
    const maps = (window as any).google?.maps;
    if (!maps) return;

    const coords = getCoordinates(pro.area, pro.city, pro.id);
    const position = new maps.LatLng(coords[0], coords[1]);
    mapInstanceRef.current.panTo(position);
    mapInstanceRef.current.setZoom(15);

    const marker = markersRef.current[pro.id];
    const infoWindow = infoWindowsRef.current[pro.id];
    if (marker && infoWindow) {
      Object.values(infoWindowsRef.current).forEach((iw: any) => iw.close());
      infoWindow.open(mapInstanceRef.current, marker);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setZoom(mapInstanceRef.current.getZoom() - 1);
    }
  };

  const handleRecenter = () => {
    if (mapInstanceRef.current && typeof window !== "undefined") {
      const maps = (window as any).google?.maps;
      if (!maps) return;
      const bounds = new maps.LatLngBounds();
      filteredPros.forEach((p) => {
        const coords = getCoordinates(p.area, p.city, p.id);
        bounds.extend(new maps.LatLng(coords[0], coords[1]));
      });
      if (!bounds.isEmpty()) {
        mapInstanceRef.current.fitBounds(bounds);
      }
    }
  };

  return (
    <main className="bg-nexa-bg-base min-h-screen pb-24 lg:pb-0">
      <NexaNavbar />
      
      <div className="pt-20 h-[calc(100vh-64px)] lg:h-screen flex flex-col lg:flex-row overflow-hidden">
        {/* SIDEBAR LIST */}
        <aside className="w-full lg:w-[400px] bg-nexa-bg-surface border-r border-nexa-border flex flex-col z-20">
           <div className="p-6 border-b border-nexa-border">
              <div className="flex items-center justify-between mb-4">
                 <h1 className="text-xl font-bold">Near Me</h1>
                 <NexaBadge variant="brand">{data.name}</NexaBadge>
              </div>
              
              {currentCity.name && currentCity.slug !== "" && currentCity.slug !== "detecting" && (
                <div className="flex items-center gap-2 text-xs font-bold text-nexa-brand mb-4 bg-nexa-brand/5 border border-nexa-brand/10 p-3 rounded-xl">
                  <MapPin className="w-4 h-4 animate-pulse flex-shrink-0" />
                  <span className="line-clamp-1">
                    Detected: {currentCity.name}{currentArea ? `, ${currentArea} LGA` : ""}
                  </span>
                </div>
              )}
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
                <>
                  {!hasLocal && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl text-xs flex items-start gap-2 mb-2 mx-1 animate-pulse">
                      <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>
                        No professionals found in {currentCity.name} yet. Showing professionals from other locations:
                      </span>
                    </div>
                  )}
                  {filteredPros.map((pro, i) => (
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
                         <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-xl bg-nexa-brand/10 border border-nexa-brand/20 flex items-center justify-center font-bold text-nexa-brand flex-shrink-0 text-base">
                               {(pro.user?.name || "P")[0]}
                            </div>
                            <div className="flex-1">
                               <div className="flex items-center justify-between mb-1">
                                  <h3 className="font-bold text-sm line-clamp-1 group-hover:text-nexa-brand transition-colors">{pro.user?.name}</h3>
                                  <div className="flex items-center gap-1 text-[10px] font-bold">
                                     <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                     <span>{pro.rating || '5.0'}</span>
                                   </div>
                               </div>
                               <p className="text-[10px] text-nexa-text-secondary mb-2">{(0.5 + i * 0.4).toFixed(1)}km • {pro.area ? `${pro.area}, ` : ""}{pro.city || 'Lagos'}</p>
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
                  ))}
                </>
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
           <div ref={mapContainerRef} className="w-full h-full z-10" />

            {!userCoords && !currentCity.slug && isLoading && (
               <div className="absolute inset-0 bg-[#e5e7eb] flex flex-col items-center justify-center z-50 text-slate-800 p-6 text-center">
                  <Loader2 className="w-10 h-10 text-nexa-brand animate-spin mb-4" />
                  <p className="font-extrabold text-sm uppercase tracking-widest">
                     Locating You...
                  </p>
                  <p className="text-xs text-nexa-text-faint mt-1">
                     Fetching your dynamic State and LGA...
                  </p>
               </div>
            )}

            {!userCoords && !currentCity.slug && !isLoading && (
               <div className="absolute inset-0 bg-[#e5e7eb] flex flex-col items-center justify-center z-50 text-slate-800 p-6 text-center">
                  <MapPin className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
                  <p className="font-extrabold text-sm uppercase tracking-widest text-rose-600">
                     Location Detection Failed
                  </p>
                  <p className="text-xs text-nexa-text-faint mt-2 max-w-sm">
                     Could not auto-detect your location. Please check browser GPS permissions or select your city manually above.
                  </p>
               </div>
            )}

            {!mapLoaded && (
               <div className="absolute inset-0 bg-[#e5e7eb] flex items-center justify-center z-20">
                  <div className="text-nexa-text-faint flex flex-col items-center gap-4">
                     <Navigation className="w-12 h-12 animate-pulse" />
                     <p className="font-bold text-sm uppercase tracking-widest text-center px-6">
                        Initializing Google Maps...
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
                    className="w-12 h-12 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-lg text-nexa-text-primary hover:bg-white transition-all font-bold text-xl border border-nexa-border"
                  >
                     +
                  </button>
                  <button 
                    onClick={handleZoomOut}
                    className="w-12 h-12 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md flex items-center justify-center shadow-lg text-nexa-text-primary hover:bg-white transition-all font-bold text-xl border border-nexa-border"
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
