import React from "react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErpAdminShell
      title="Marketplace Store Operations"
      subtitle="Manage your tenant's digital storefront, customer service bookings, deals, SEO articles, catalog shop items, and escrow payouts."
      activeModule="marketplace"
    >
      {children}
    </ErpAdminShell>
  );
}
