import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MD Executive Dashboard | Ofia ERP",
};

export default function MDLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
