import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ofia ERP | Enterprise Operating System & Suite",
  description:
    "Complete enterprise operating system orchestrating Multi-Warehouse Inventory (IMS), Touch POS Cashier, Zonal Dispatch Logistics, General Ledger Accounting, HR Appraisals, and Ofia AI Swarm.",
  openGraph: {
    title: "Ofia ERP | Enterprise Operating System & Suite",
    description:
      "Complete enterprise operating system orchestrating Multi-Warehouse Inventory (IMS), Touch POS Cashier, Zonal Dispatch Logistics, General Ledger Accounting, HR Appraisals, and Ofia AI Swarm.",
    siteName: "Ofia ERP",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "Ofia ERP Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ofia ERP | Enterprise Operating System & Suite",
    description:
      "Complete enterprise operating system orchestrating Multi-Warehouse Inventory (IMS), Touch POS Cashier, Zonal Dispatch Logistics, General Ledger Accounting, HR Appraisals, and Ofia AI Swarm.",
    images: ["/logo.png"],
  },
};

export default function ErpRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
