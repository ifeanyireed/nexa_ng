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

const NicheContext = createContext<NicheContextType | undefined>(undefined);

export const NicheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<NexaMode>("buyer");
  const [currentNiche, setCurrentNiche] = useState<NicheId | null>(null);

  useEffect(() => {
    const savedMode = localStorage.getItem("nexa-mode") as NexaMode;
    if (savedMode) setModeState(savedMode);
  }, []);

  const setMode = (newMode: NexaMode) => {
    setModeState(newMode);
    localStorage.setItem("nexa-mode", newMode);
  };

  return (
    <NicheContext.Provider value={{ mode, setMode, currentNiche, setCurrentNiche }}>
      {children}
    </NicheContext.Provider>
  );
};

export const useNiche = () => {
  const context = useContext(NicheContext);
  if (context === undefined) {
    throw new Error("useNiche must be used within a NicheProvider");
  }
  return context;
};
