import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { INITIAL_WAITLIST_LEADS, WaitlistLeadItem } from "@/lib/admin-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const status = searchParams.get("status");
    const role = searchParams.get("role");
    const businessType = searchParams.get("businessType");
    const toolType = searchParams.get("toolType");
    const state = searchParams.get("state");

    // Fetch from MySQL
    const dbLeads = await executeQuery<any[]>(
      "SELECT * FROM waitlist_leads ORDER BY queue_number ASC"
    );

    let leads: WaitlistLeadItem[] = [];

    if (dbLeads && dbLeads.length > 0) {
      leads = dbLeads.map((row) => ({
        id: row.id,
        fullName: row.full_name,
        businessName: row.business_name,
        email: row.email,
        phone: row.phone,
        role: row.role || "MERCHANT",
        businessType: row.business_type || "Retail Store",
        toolType: row.tool_type || "Full Ecosystem",
        customBusinessType: row.custom_business_type,
        customToolType: row.custom_tool_type,
        niche: row.niche || "general",
        state: row.state || "Lagos",
        city: row.city || "Ikeja",
        teamSize: row.team_size || "1-5",
        featuresInterest: row.features_interest ? (typeof row.features_interest === "string" ? JSON.parse(row.features_interest) : row.features_interest) : [],
        queueNumber: row.queue_number,
        referralCode: row.referral_code,
        referredBy: row.referred_by,
        status: row.status || "PENDING",
        inviteCode: row.invite_code,
        notes: row.notes,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
      }));
    } else {
      leads = [...INITIAL_WAITLIST_LEADS];
    }

    // Apply filters
    if (search) {
      leads = leads.filter(
        (lead) =>
          lead.fullName.toLowerCase().includes(search) ||
          lead.businessName.toLowerCase().includes(search) ||
          lead.email.toLowerCase().includes(search) ||
          lead.phone.includes(search) ||
          lead.referralCode.toLowerCase().includes(search) ||
          (lead.businessType && lead.businessType.toLowerCase().includes(search)) ||
          (lead.toolType && lead.toolType.toLowerCase().includes(search))
      );
    }

    if (status && status !== "ALL") {
      leads = leads.filter((l) => l.status === status);
    }

    if (role && role !== "ALL") {
      leads = leads.filter((l) => l.role === role);
    }

    if (businessType && businessType !== "ALL") {
      leads = leads.filter((l) => l.businessType?.includes(businessType) || l.niche?.includes(businessType));
    }

    if (toolType && toolType !== "ALL") {
      leads = leads.filter((l) => l.toolType?.includes(toolType) || (l.featuresInterest && l.featuresInterest.some((f) => f.includes(toolType))));
    }

    if (state && state !== "ALL") {
      leads = leads.filter((l) => l.state === state);
    }

    return NextResponse.json({
      leads,
      kpis: {
        totalSignups: leads.length,
        qualifiedCount: leads.filter((l) => l.status === "QUALIFIED").length,
        invitedCount: leads.filter((l) => l.status === "INVITED").length,
        onboardedCount: leads.filter((l) => l.status === "ONBOARDED").length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to query CRM waitlist: " + err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      fullName,
      businessName,
      email,
      phone,
      role = "MERCHANT",
      businessType = "Retail Store",
      toolType = "Full Ecosystem",
      customBusinessType = "",
      customToolType = "",
      state = "Lagos",
      city = "Ikeja",
      teamSize = "1-5",
      featuresInterest = [],
      status = "QUALIFIED",
    } = body;

    const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const referralCode = `REF-${businessName.substring(0, 3).toUpperCase()}${shortId}`;
    const id = `wt-${Date.now()}-${shortId}`;
    const queueNumber = 1084 + Math.floor(Math.random() * 200);
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const featuresJson = JSON.stringify(featuresInterest);

    // Insert into MySQL
    await executeQuery(
      `INSERT INTO waitlist_leads 
       (id, queue_number, full_name, business_name, email, phone, role, business_type, tool_type, custom_business_type, custom_tool_type, state, city, team_size, features_interest, referral_code, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        queueNumber,
        fullName.trim(),
        businessName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        role,
        businessType,
        toolType,
        customBusinessType,
        customToolType,
        state,
        city,
        teamSize,
        featuresJson,
        referralCode,
        status,
        now,
        now,
      ]
    );

    const newLead: WaitlistLeadItem = {
      id,
      fullName,
      businessName,
      email,
      phone,
      role,
      businessType,
      toolType,
      customBusinessType,
      customToolType,
      niche: "general",
      state,
      city,
      teamSize,
      featuresInterest,
      queueNumber,
      referralCode,
      referredBy: null,
      status,
      inviteCode: null,
      notes: null,
      createdAt: now,
    };

    INITIAL_WAITLIST_LEADS.unshift(newLead);
    return NextResponse.json(newLead, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create waitlist lead: " + err.message }, { status: 500 });
  }
}
