"use client";

import React, { useEffect, useRef, useState } from "react";
import { loadGoogleMapsScript, nexaMapStyles, GOOGLE_MAPS_API_KEY } from "@/lib/google-maps";
import { MapPin, Navigation } from "lucide-react";

interface GoogleMapProps {
  center: { lat: number; lng: number };
  zoom?: number;
  title?: string;
  subtitle?: string;
  className?: string;
  showNavigateButton?: boolean;
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    title: string;
    subtitle?: string;
    icon?: string;
    onClick?: () => void;
  }>;
}

export function GoogleMap({
  center,
  zoom = 14,
  title,
  subtitle,
  className = "w-full h-64",
  showNavigateButton = true,
  markers = [],
}: GoogleMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    loadGoogleMapsScript(GOOGLE_MAPS_API_KEY)
      .then((maps) => {
        if (!isMounted || !mapContainerRef.current) return;

        const map = new maps.Map(mapContainerRef.current, {
          center,
          zoom,
          styles: nexaMapStyles,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        mapInstanceRef.current = map;

        // Add primary center marker if no explicit markers passed
        if (markers.length === 0) {
          const marker = new maps.Marker({
            position: center,
            map,
            title: title || "Location",
            animation: maps.Animation.DROP,
          });

          if (title || subtitle) {
            const infoWindow = new maps.InfoWindow({
              content: `
                <div style="padding: 6px; font-family: system-ui, sans-serif;">
                  <strong style="font-size: 14px; color: #0f172a;">${title || "Location"}</strong>
                  ${subtitle ? `<p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">${subtitle}</p>` : ""}
                </div>
              `,
            });
            infoWindow.open(map, marker);
          }
        } else {
          // Add custom markers
          markers.forEach((m) => {
            const marker = new maps.Marker({
              position: { lat: m.lat, lng: m.lng },
              map,
              title: m.title,
            });

            if (m.onClick) {
              marker.addListener("click", m.onClick);
            }
          });
        }

        setMapLoaded(true);
      })
      .catch((err) => {
        console.warn("Google Maps JS API load notice, falling back to static embed:", err);
        setLoadError(true);
      });

    return () => {
      isMounted = false;
    };
  }, [center.lat, center.lng, zoom, markers.length]);

  const handleOpenGoogleMaps = () => {
    const query = subtitle ? `${title || ""}, ${subtitle}` : `${center.lat},${center.lng}`;
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, "_blank");
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      {!loadError ? (
        <div ref={mapContainerRef} className={className} />
      ) : (
        // Fallback Google Maps iframe embed with user's API key
        <iframe
          title="Google Map Location"
          width="100%"
          height="100%"
          className={className}
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(subtitle || `${center.lat},${center.lng}`)}&zoom=${zoom}`}
        />
      )}

      {!mapLoaded && !loadError && (
        <div className="absolute inset-0 bg-nexa-bg-surface flex items-center justify-center z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-nexa-text-secondary">
            <div className="w-5 h-5 border-2 border-nexa-brand border-t-transparent rounded-full animate-spin" />
            Loading Google Maps...
          </div>
        </div>
      )}

      {showNavigateButton && (
        <button
          onClick={handleOpenGoogleMaps}
          className="absolute bottom-3 right-3 z-20 px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded-xl shadow-lg border border-nexa-border text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 transition-all"
        >
          <Navigation className="w-3.5 h-3.5 text-nexa-brand" />
          Navigate on Google Maps
        </button>
      )}
    </div>
  );
}
