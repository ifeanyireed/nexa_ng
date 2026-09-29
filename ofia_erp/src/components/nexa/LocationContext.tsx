"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface City {
  name: string;
  slug: string;
  areas?: string[];
}

export const CITIES: City[] = [
  { name: "Lagos", slug: "lagos", areas: ["Lekki", "Ikeja", "Surulere", "Yaba", "Victoria Island", "Ikoyi", "Festac"] },
  { name: "Abuja", slug: "abuja", areas: ["Wuse", "Garki", "Maitama"] },
  { name: "Ibadan", slug: "ibadan", areas: ["Bodija", "Oluyole", "Ring Road"] },
  { name: "Port Harcourt", slug: "port-harcourt", areas: ["GRA", "Choba", "Trans Amadi"] },
  { name: "Kano", slug: "kano", areas: ["Nassarawa", "Fagge", "Tarauni"] },
  { name: "Benin City", slug: "benin-city", areas: ["GRA", "Oredo"] },
  { name: "Abeokuta", slug: "abeokuta", areas: ["Oke-Mosan", "Ibara"] },
  { name: "Enugu", slug: "enugu", areas: ["Independence Layout", "Achara Layout"] },
  { name: "Kaduna", slug: "kaduna", areas: ["Barnawa", "Tudun Wada"] },
  { name: "Jos", slug: "jos", areas: ["Anglo Jos", "Rayfield"] },
];

interface LocationContextType {
  currentCity: City;
  setCurrentCity: (city: City) => void;
  currentArea: string;
  setCurrentArea: (area: string) => void;
  userCoords: [number, number] | null;
  setUserCoords: (coords: [number, number] | null) => void;
  isLoading: boolean;
  autoDetectLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentCity, setCurrentCityState] = useState<City>(CITIES[0]);
  const [currentArea, setCurrentAreaState] = useState<string>("Lekki");
  const [userCoords, setUserCoordsState] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Define reusable auto-detect function
  const autoDetectLocation = useCallback(async () => {
    if (typeof window === "undefined") return;

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            setUserCoordsState([latitude, longitude]);
            localStorage.setItem("nexa_user_coords", JSON.stringify([latitude, longitude]));

            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`,
              { signal: AbortSignal.timeout(4000) }
            );
            if (res.ok) {
              const data = await res.json();
              const address = data.address || {};
              const rawState = address.state || address.region || address.city || "";
              const rawLga = address.county || address.city_district || address.suburb || address.neighbourhood || address.town || "";

              const stateName = rawState.replace(/\s+State$/i, "").trim();
              const lgaName = rawLga.replace(/\s+Local\s+Government\s+Area$/i, "").replace(/\s+LGA$/i, "").trim();

              if (stateName) {
                const matchedCity = CITIES.find(
                  (c) =>
                    c.name.toLowerCase().includes(stateName.toLowerCase()) ||
                    stateName.toLowerCase().includes(c.name.toLowerCase())
                );

                const finalCity = matchedCity || {
                  name: stateName,
                  slug: stateName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                  areas: lgaName ? [lgaName] : []
                };

                setCurrentCityState(finalCity);
                setCurrentAreaState(lgaName || finalCity.areas?.[0] || "");
                localStorage.setItem("nexa_location", JSON.stringify(finalCity));
                localStorage.setItem("nexa_area", lgaName || finalCity.areas?.[0] || "");
              }
            }
          } catch (err) {
            // Silently fallback without crashing
          }
        },
        async () => {
          // GPS unavailable/denied - try fast IP fallback
          try {
            const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(3000) });
            if (res.ok) {
              const ipData = await res.json();
              if (ipData.latitude && ipData.longitude) {
                const lat = ipData.latitude;
                const lon = ipData.longitude;
                setUserCoordsState([lat, lon]);
                localStorage.setItem("nexa_user_coords", JSON.stringify([lat, lon]));

                const rawState = ipData.region || ipData.city || "";
                const rawLga = ipData.city || "";

                const stateName = rawState.replace(/\s+State$/i, "").trim();
                const lgaName = rawLga.replace(/\s+Local\s+Government\s+Area$/i, "").replace(/\s+LGA$/i, "").trim();

                if (stateName) {
                  const matchedCity = CITIES.find(
                    (c) =>
                      c.name.toLowerCase().includes(stateName.toLowerCase()) ||
                      stateName.toLowerCase().includes(c.name.toLowerCase())
                  );

                  const finalCity = matchedCity || {
                    name: stateName,
                    slug: stateName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                    areas: lgaName ? [lgaName] : []
                  };

                  setCurrentCityState(finalCity);
                  setCurrentAreaState(lgaName || finalCity.areas?.[0] || "");
                  localStorage.setItem("nexa_location", JSON.stringify(finalCity));
                  localStorage.setItem("nexa_area", lgaName || finalCity.areas?.[0] || "");
                }
              }
            }
          } catch {
            // Silently retain default Lagos
          }
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    }
  }, []);

  // Load from localStorage and auto-detect location on mount
  useEffect(() => {
    // 1. Initial load from localStorage if present
    const savedCity = localStorage.getItem("nexa_location");
    const savedArea = localStorage.getItem("nexa_area");
    const savedCoords = localStorage.getItem("nexa_user_coords");

    if (savedCity) {
      try {
        setCurrentCityState(JSON.parse(savedCity));
      } catch {}
    }
    if (savedArea) {
      setCurrentAreaState(savedArea);
    }
    if (savedCoords) {
      try {
        setUserCoordsState(JSON.parse(savedCoords));
      } catch {}
    }

    // 2. Dynamic auto-detect
    autoDetectLocation();
  }, [autoDetectLocation]);

  const setCurrentCity = (city: City) => {
    setCurrentCityState(city);
    localStorage.setItem("nexa_location", JSON.stringify(city));
    const firstArea = city.areas?.[0] || "";
    setCurrentAreaState(firstArea);
    localStorage.setItem("nexa_area", firstArea);
  };

  const setCurrentArea = (area: string) => {
    setCurrentAreaState(area);
    localStorage.setItem("nexa_area", area);
  };

  const setUserCoords = (coords: [number, number] | null) => {
    setUserCoordsState(coords);
    if (coords) {
      localStorage.setItem("nexa_user_coords", JSON.stringify(coords));
    } else {
      localStorage.removeItem("nexa_user_coords");
    }
  };

  return (
    <LocationContext.Provider 
      value={{ 
        currentCity, 
        setCurrentCity, 
        currentArea, 
        setCurrentArea, 
        userCoords, 
        setUserCoords, 
        isLoading,
        autoDetectLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

const defaultLocationContext: LocationContextType = {
  currentCity: CITIES[0],
  setCurrentCity: () => {},
  currentArea: "Lekki",
  setCurrentArea: () => {},
  userCoords: null,
  setUserCoords: () => {},
  isLoading: false,
  autoDetectLocation: () => {},
};

export function useLocation() {
  const context = useContext(LocationContext);
  return context || defaultLocationContext;
}
