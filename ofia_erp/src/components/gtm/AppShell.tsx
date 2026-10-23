"use client";

import React, { useState } from "react";
import { ErpAdminShell, SubNavItem } from "@/components/erp/ErpAdminShell";
import { AgentDrawer } from "@/components/gtm/AgentDrawer";
import { VoiceAssistantHUD } from "@/components/gtm/VoiceAssistantHUD";
import { AIAgent } from "@/lib/gtm-data";

interface AppShellProps {
  children: React.ReactNode;
  currentTab?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  subTabs?: SubNavItem[];
  isLoading?: boolean;
}

export const AppShell = ({
  children,
  title = "Ofia Voice Agent",
  subtitle = "Autonomous telephone outreach and sales qualification engine for corporate B2B mobility.",
  action,
  subTabs,
  isLoading,
}: AppShellProps) => {
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);

  return (
    <ErpAdminShell
      title={title}
      subtitle={subtitle}
      action={action}
      activeModule="ai"
      subTabs={subTabs}
      isLoading={isLoading}
    >
      {children}

      {/* Voice Assistant HUD Floating Capsule */}
      <VoiceAssistantHUD isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} />

      {/* Agent Detail / Configuration Drawer */}
      <AgentDrawer
        agent={selectedAgent}
        isOpen={Boolean(selectedAgent)}
        onClose={() => setSelectedAgent(null)}
      />
    </ErpAdminShell>
  );
};
