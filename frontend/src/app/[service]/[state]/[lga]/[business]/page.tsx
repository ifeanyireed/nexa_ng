import { getNicheData } from "@/lib/niche-data";
import { slugify } from "@/lib/utils";
import BusinessClient from "./BusinessClient";

export async function generateStaticParams() {
  const paths = [
    {
      service: "example-service",
      state: "example-state",
      lga: "example-lga",
      business: "example-business"
    }
  ];

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const res = await fetch(`${apiUrl}/discovery/pros`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const pros = await res.json();
      pros.forEach((pro: any) => {
        const service = slugify(pro.subService || pro.specialties || "service");
        const state = slugify(pro.city || "state");
        const lga = slugify(pro.area || "lga");
        const name = pro.user?.name || pro.businessName || "professional";
        const business = `${slugify(name)}-business-${pro.id}`;
        
        paths.push({
          service,
          state,
          lga,
          business
        });
      });
    }
  } catch (error) {
    console.warn("Could not fetch pros for static params:", error);
  }

  const uniquePaths = Array.from(new Set(paths.map(p => JSON.stringify(p)))).map(s => JSON.parse(s));
  return uniquePaths;
}

export default function BusinessProfilePage({ params }: { params: { service: string; state: string; lga: string; business: string } }) {
  const data = getNicheData("home-services");
  return <BusinessClient data={data} businessSlug={params.business} />;
}
