import { NICHE_DETAILS } from "@/lib/niche-data";

export function generateStaticParams() {
  return Object.keys(NICHE_DETAILS).map((niche) => ({
    niche: niche,
  }));
}

export default function NicheLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
