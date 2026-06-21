"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface City {
  name: string;
  slug: string;
  areas?: string[];
}

export const CITIES: City[] = [
  { name: "Lagos", slug: "lagos", areas: ["Lekki", "Ikeja", "Surulere", "Yaba", "Victoria Island", "Ikoyi"] },
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
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [currentCity, setCurrentCityState] = useState<City>(CITIES[0]);
  const [currentArea, setCurrentAreaState] = useState<string>("Lekki");
  const [userCoords, setUserCoordsState] = useState<[number, number] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCity = localStorage.getItem("nexa_location");
    const savedArea = localStorage.getItem("nexa_area");
    const savedCoords = sessionStorage.getItem("nexa_user_coords");

    if (savedCity) {
      try {
        const city = JSON.parse(savedCity);
        setCurrentCityState(city);
      } catch (e) {
        console.error("Failed to parse saved city", e);
      }
    }
    if (savedArea) {
      setCurrentAreaState(savedArea);
    } else {
      const city = savedCity ? JSON.parse(savedCity) : CITIES[0];
      setCurrentAreaState(city.areas?.[0] || "");
    }
    if (savedCoords) {
      try {
        setUserCoordsState(JSON.parse(savedCoords));
      } catch (e) {}
    }
    setIsLoading(false);
  }, []);

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
      sessionStorage.setItem("nexa_user_coords", JSON.stringify(coords));
    } else {
      sessionStorage.removeItem("nexa_user_coords");
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
        isLoading 
      }}
    >
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
