import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { INITIAL_WAITLIST_LEADS, WaitlistLeadItem } from "@/lib/admin-data";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, generateInviteCode, inviteCode } = body;

    let finalInviteCode = inviteCode;
    if (generateInviteCode) {
      finalInviteCode = `OFIA-VIP-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Update in MySQL
    await executeQuery(
      `UPDATE waitlist_leads 
       SET status = COALESCE(?, status), 
           notes = COALESCE(?, notes), 
           invite_code = COALESCE(?, invite_code),
           updated_at = ?
       WHERE id = ?`,
      [status || null, notes !== undefined ? notes : null, finalInviteCode || null, now, id]
    );

    // Also update in-memory fallback
    const leadIndex = INITIAL_WAITLIST_LEADS.findIndex((l) => l.id === id);
    if (leadIndex !== -1) {
      const current = INITIAL_WAITLIST_LEADS[leadIndex];
      const updated: WaitlistLeadItem = {
        ...current,
        status: status || current.status,
        notes: notes !== undefined ? notes : current.notes,
        inviteCode: finalInviteCode || current.inviteCode,
      };
      INITIAL_WAITLIST_LEADS[leadIndex] = updated;
      return NextResponse.json(updated);
    }

    // Query updated row from MySQL
    const dbResult = await executeQuery<any[]>(
      "SELECT * FROM waitlist_leads WHERE id = ? LIMIT 1",
      [id]
    );

    if (dbResult && dbResult.length > 0) {
      const row = dbResult[0];
      return NextResponse.json({
        id: row.id,
        fullName: row.full_name,
        businessName: row.business_name,
        email: row.email,
        phone: row.phone,
        role: row.role,
        businessType: row.business_type,
        toolType: row.tool_type,
        state: row.state,
        city: row.city,
        queueNumber: row.queue_number,
        referralCode: row.referral_code,
        status: row.status,
        inviteCode: row.invite_code,
        notes: row.notes,
        createdAt: row.created_at,
      });
    }

    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update lead: " + err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await executeQuery("DELETE FROM waitlist_leads WHERE id = ?", [id]);

    const leadIndex = INITIAL_WAITLIST_LEADS.findIndex((l) => l.id === id);
    if (leadIndex !== -1) {
      INITIAL_WAITLIST_LEADS.splice(leadIndex, 1);
    }

    return NextResponse.json({ success: true, message: "Lead removed from pipeline" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete lead: " + err.message }, { status: 500 });
  }
}
