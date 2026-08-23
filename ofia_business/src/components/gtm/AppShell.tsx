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
}

export const AppShell = ({
  children,
  title = "Ofia AI",
  subtitle = "15 multi-agent LLM worker units coordinating outbound cold outreach, lead scoring, and growth analytics.",
  action,
  subTabs,
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
