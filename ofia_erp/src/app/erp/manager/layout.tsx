import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Line Manager Portal | Ofia ERP",
};

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
