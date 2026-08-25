import { NextResponse } from "next/server";
import { INITIAL_WAITLIST_LEADS } from "@/lib/admin-data";

export async function GET() {
  try {
    const headers = [
      "Queue Number",
      "Lead ID",
      "Full Name",
      "Business Name",
      "Email",
      "Phone",
      "Role",
      "Industry Niche",
      "State",
      "City",
      "Status",
      "Referral Code",
      "Invite Code",
      "Created At",
    ];

    const rows = INITIAL_WAITLIST_LEADS.map((l) => [
      `#${l.queueNumber}`,
      l.id,
      `"${l.fullName.replace(/"/g, '""')}"`,
      `"${l.businessName.replace(/"/g, '""')}"`,
      l.email,
      `"${l.phone}"`,
      l.role,
      l.niche,
      l.state,
      `"${(l.city || "").replace(/"/g, '""')}"`,
      l.status,
      l.referralCode,
      l.inviteCode || "N/A",
      l.createdAt,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ofia_waitlist_export_${Date.now()}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to export CSV: " + err.message }, { status: 500 });
  }
}
