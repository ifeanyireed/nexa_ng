"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { NexaMode } from "./NexaModeToggle";

export type NicheId = 
  | "home-services" 
  | "fashion" 
  | "professionals" 
  | "education" 
  | "events" 
  | "health" 
  | "logistics" 
  | "auto" 
  | "food" 
  | "realestate";

interface NicheContextType {
  mode: NexaMode;
  setMode: (mode: NexaMode) => void;
  currentNiche: NicheId | null;
  setCurrentNiche: (niche: NicheId | null) => void;
}

const defaultContextValue: NicheContextType = {
  mode: "buyer",
  setMode: () => {},
  currentNiche: null,
  setCurrentNiche: () => {},
};

const NicheContext = createContext<NicheContextType>(defaultContextValue);

export const NicheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<NexaMode>("buyer");
  const [currentNiche, setCurrentNiche] = useState<NicheId | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem("nexa-mode") as NexaMode;
      if (savedMode) setModeState(savedMode);
    }
  }, []);

  const setMode = (newMode: NexaMode) => {
    setModeState(newMode);
    if (typeof window !== "undefined") {
      localStorage.setItem("nexa-mode", newMode);
    }
  };

  return (
    <NicheContext.Provider value={{ mode, setMode, currentNiche, setCurrentNiche }}>
      {children}
    </NicheContext.Provider>
  );
};

export const useNiche = () => {
  return useContext(NicheContext) || defaultContextValue;
};
