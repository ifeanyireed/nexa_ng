import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employee Portal & Reviews | Ofia ERP",
};

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
