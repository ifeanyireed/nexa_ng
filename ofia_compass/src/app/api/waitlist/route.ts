import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

// Fallback in-memory store
let IN_MEMORY_WAITLIST: any[] = [
  {
    id: "wt-001",
    fullName: "Engr. Nnamdi Eze",
    businessName: "Eko Horizon Automation & Tech",
    email: "eze@ekoatlantic.com",
    phone: "+2348029988776",
    role: "SERVICE_PRO",
    businessType: "Technology & IT Services",
    toolType: "Autonomous AI Swarm, Multi-Store POS",
    niche: "professionals",
    state: "Lagos",
    city: "Victoria Island",
    teamSize: "11-50",
    featuresInterest: ["Autonomous AI Swarm", "Multi-Store POS"],
    queueNumber: 1084,
    referralCode: "REF-EKO801",
    referredBy: null,
    status: "QUALIFIED",
    inviteCode: "OFIA-VIP-9021",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: "wt-002",
    fullName: "Hajiya Amina Bello",
    businessName: "Amina Luxury Fabrics & Couture",
    email: "amina.bello@fabrics.ng",
    phone: "+2348054433221",
    role: "MERCHANT",
    businessType: "Fashion Boutique & Luxury Fabrics",
    toolType: "Multi-Store POS, Milestone Escrow",
    niche: "fashion",
    state: "Abuja FCT",
    city: "Maitama",
    teamSize: "5-10",
    featuresInterest: ["Multi-Store POS", "Milestone Escrow"],
    queueNumber: 1085,
    referralCode: "REF-AMN402",
    referredBy: null,
    status: "INVITED",
    inviteCode: "OFIA-VIP-4081",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("referralCode");

    if (code) {
      // Query database
      const dbResult = await executeQuery<any[]>(
        "SELECT * FROM waitlist_leads WHERE referral_code = ? LIMIT 1",
        [code]
      );
      if (dbResult && dbResult.length > 0) {
        const lead = dbResult[0];
        return NextResponse.json({
          lead: {
            id: lead.id,
            fullName: lead.full_name,
            businessName: lead.business_name,
            queueNumber: lead.queue_number,
            referralCode: lead.referral_code,
            status: lead.status,
          },
        });
      }

      const found = IN_MEMORY_WAITLIST.find((item) => item.referralCode === code);
      if (found) {
        return NextResponse.json({ lead: found });
      }
      return NextResponse.json({ error: "Referral code not found" }, { status: 404 });
    }

    // Return total count
    const countResult = await executeQuery<any[]>("SELECT COUNT(*) as total FROM waitlist_leads");
    const totalCount = countResult && countResult.length > 0 ? countResult[0].total : IN_MEMORY_WAITLIST.length;

    return NextResponse.json({
      totalCount,
      estimatedWaitTime: "< 2 Weeks",
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal error: " + err.message }, { status: 500 });
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
      referredBy = null,
    } = body;

    // Validation
    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }
    if (!businessName || !businessName.trim()) {
      return NextResponse.json({ error: "Business name is required." }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid work email is required." }, { status: 400 });
    }
    if (!phone || phone.trim().length < 8) {
      return NextResponse.json({ error: "Valid WhatsApp/phone number is required." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    // Check duplicate in DB
    const existingDb = await executeQuery<any[]>(
      "SELECT * FROM waitlist_leads WHERE email = ? OR phone = ? LIMIT 1",
      [cleanEmail, cleanPhone]
    );

    if (existingDb && existingDb.length > 0) {
      const existing = existingDb[0];
      const origin = request.headers.get("origin") || "https://ofia.ng";
      const referralLink = `${origin}/waitlist?ref=${existing.referral_code}`;

      return NextResponse.json({
        success: true,
        isExisting: true,
        message: "You are already on the VIP waitlist!",
        queueNumber: existing.queue_number,
        referralCode: existing.referral_code,
        referralLink,
        lead: {
          id: existing.id,
          fullName: existing.full_name,
          businessName: existing.business_name,
          email: existing.email,
          phone: existing.phone,
          status: existing.status,
          queueNumber: existing.queue_number,
          referralCode: existing.referral_code,
        },
      });
    }

    // Generate unique queue number & referral code
    const maxQueueDb = await executeQuery<any[]>(
      "SELECT MAX(queue_number) as max_queue FROM waitlist_leads"
    );
    const nextQueueNumber =
      maxQueueDb && maxQueueDb.length > 0 && maxQueueDb[0].max_queue
        ? maxQueueDb[0].max_queue + 1
        : 1084 + IN_MEMORY_WAITLIST.length;

    const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const referralCode = `REF-${businessName.substring(0, 3).toUpperCase()}${shortId}`;
    const id = `wt-${Date.now()}-${shortId}`;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const featuresJson = JSON.stringify(featuresInterest);

    // Insert into MySQL
    await executeQuery(
      `INSERT INTO waitlist_leads 
       (id, queue_number, full_name, business_name, email, phone, role, business_type, tool_type, custom_business_type, custom_tool_type, state, city, team_size, features_interest, referral_code, referred_by, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)`,
      [
        id,
        nextQueueNumber,
        fullName.trim(),
        businessName.trim(),
        cleanEmail,
        cleanPhone,
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
        referredBy,
        now,
        now,
      ]
    );

    const newLead = {
      id,
      fullName: fullName.trim(),
      businessName: businessName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      role,
      businessType,
      toolType,
      customBusinessType,
      customToolType,
      state,
      city,
      teamSize,
      featuresInterest,
      queueNumber: nextQueueNumber,
      referralCode,
      referredBy,
      status: "PENDING",
      inviteCode: null,
      createdAt: now,
    };

    IN_MEMORY_WAITLIST.unshift(newLead);

    const origin = request.headers.get("origin") || "https://ofia.ng";
    const referralLink = `${origin}/waitlist?ref=${referralCode}`;

    return NextResponse.json(
      {
        success: true,
        message: "You have been registered for early access!",
        queueNumber: nextQueueNumber,
        referralCode,
        referralLink,
        lead: newLead,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to register waitlist lead: " + err.message }, { status: 500 });
  }
}
