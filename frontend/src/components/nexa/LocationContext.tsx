"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface City {
  name: string;
  slug: string;
}

export const CITIES: City[] = [
  { name: "Lagos", slug: "lagos" },
  { name: "Abuja", slug: "abuja" },
  { name: "Ibadan", slug: "ibadan" },
  { name: "Port Harcourt", slug: "port-harcourt" },
  { name: "Kano", slug: "kano" },
  { name: "Benin City", slug: "benin-city" },
  { name: "Abeokuta", slug: "abeokuta" },
  { name: "Enugu", slug: "enugu" },
  { name: "Kaduna", slug: "kaduna" },
  { name: "Jos", slug: "jos" },
];

interface LocationContextType {
  currentCity: City;
  setCurrentCity: (city: City) => void;
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentCity, setCurrentCityState] = useState<City>(CITIES[0]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCity = localStorage.getItem("nexa_location");
    if (savedCity) {
      try {
        const city = JSON.parse(savedCity);
        setCurrentCityState(city);
      } catch (e) {
        console.error("Failed to parse saved city", e);
      }
    }
    setIsLoading(false);
  }, []);

  const setCurrentCity = (city: City) => {
    setCurrentCityState(city);
    localStorage.setItem("nexa_location", JSON.stringify(city));
  };

  return (
    <LocationContext.Provider value={{ currentCity, setCurrentCity, isLoading }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
