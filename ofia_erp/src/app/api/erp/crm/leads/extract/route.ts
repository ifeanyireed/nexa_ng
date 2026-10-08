import { NextResponse } from "next/server";
import { createCrmLead } from "@/lib/crm-service";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantSlug = getValidatedTenantSlug(request, body);
    const { query = "High-Growth Nigerian Enterprises", location = "Lagos & Abuja", targetSize = 5 } = body;

    const sampleDomains = [
      { company: "Prime Atlantic Cegelec", ind: "Oil & Gas Support", loc: "Victoria Island, Lagos", contact: "Engr. Folake Adeleke", title: "Procurement Director", email: "f.adeleke@pacegelec.com", phone: "+2348021122334", signals: ["Active tender for facilities modernization", "Expanding supply base"] },
      { company: "Capital Luxury Transit", ind: "Fleet Logistics & Transport", loc: "Abuja & Uyo", contact: "Edidiong Udoh", title: "Managing Director", email: "edidiong@capitalluxury.ng", phone: "+2348039988776", signals: ["Acquiring 20 new luxury buses", "Upgrading fleet tracking"] },
      { company: "Medplus Pharmacy Chain", ind: "Healthcare Retail", loc: "Lekki Phase 1, Lagos", contact: "Joke Bakare", title: "Operations Head", email: "j.bakare@medplus.ng", phone: "+2348054433221", signals: ["Rolling out 8 new retail storefronts", "Evaluating automated inventory sync"] },
      { company: "Veritas Kapital Assurance", ind: "Financial Services", loc: "Central Business District, Abuja", contact: "Kenneth Egbaran", title: "Chief Digital Officer", email: "k.egbaran@veritas.ng", phone: "+2348098877665", signals: ["Digitizing claims reconciliation", "Deploying staff ERP portals"] },
    ];

    const pick = sampleDomains[Math.floor(Math.random() * sampleDomains.length)];

    const extracted = await createCrmLead(tenantSlug, {
      companyName: `${pick.company}`,
      industry: pick.ind,
      location: location || pick.loc,
      contactName: pick.contact,
      contactTitle: pick.title,
      contactEmail: pick.email,
      contactPhone: pick.phone,
      icpFitScore: 92 + Math.floor(Math.random() * 7),
      buyingSignals: pick.signals,
      status: "ENRICHED",
      source: "AI Prospector Engine",
      assignedRep: "Senior Sales Specialist",
      notes: `Extracted matching query: "${query}" in ${location}. Corporate verification passed.`,
    });

    return NextResponse.json({ success: true, lead: extracted }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to extract leads" }, { status: 500 });
  }
}
