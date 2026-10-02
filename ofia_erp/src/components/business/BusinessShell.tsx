"use client";

import React from "react";
import { ErpAdminShell, SubNavItem } from "@/components/erp/ErpAdminShell";

export interface BusinessShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  activeModule?: any;
  subTabs?: SubNavItem[];
  isLoading?: boolean;
}

export function BusinessShell({
  children,
  title,
  subtitle,
  action,
  activeModule,
  subTabs,
  isLoading,
}: BusinessShellProps) {
  return (
    <ErpAdminShell
      title={title}
      subtitle={subtitle}
      action={action}
      activeModule={activeModule}
      subTabs={subTabs}
      isLoading={isLoading}
    >
      {children}
    </ErpAdminShell>
  );
}
