import { NICHE_DETAILS, getAllNicheSlugs } from "@/lib/niche-data";

export function generateStaticParams() {
  return getAllNicheSlugs().map((niche) => ({
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
