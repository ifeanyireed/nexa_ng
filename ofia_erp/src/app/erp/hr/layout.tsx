import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HR Director & Appraisals | Ofia ERP",
};

export default function HRLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
