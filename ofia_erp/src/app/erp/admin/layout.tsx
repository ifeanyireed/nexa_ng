import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Command Center | Ofia ERP",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
