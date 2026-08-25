import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { INITIAL_CONTACT_MESSAGES, ContactMessageItem } from "@/lib/admin-data";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, priority, assignedTo, resolutionNotes } = body;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Update in MySQL
    await executeQuery(
      `UPDATE contact_inquiries
       SET status = COALESCE(?, status),
           priority = COALESCE(?, priority),
           assigned_to = COALESCE(?, assigned_to),
           resolution_notes = COALESCE(?, resolution_notes),
           updated_at = ?
       WHERE id = ?`,
      [status || null, priority || null, assignedTo !== undefined ? assignedTo : null, resolutionNotes !== undefined ? resolutionNotes : null, now, id]
    );

    const msgIndex = INITIAL_CONTACT_MESSAGES.findIndex((m) => m.id === id);
    if (msgIndex !== -1) {
      const current = INITIAL_CONTACT_MESSAGES[msgIndex];
      const updated: ContactMessageItem = {
        ...current,
        status: status || current.status,
        priority: priority || current.priority,
        assignedTo: assignedTo !== undefined ? assignedTo : current.assignedTo,
        resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : current.resolutionNotes,
        updatedAt: now,
      };
      INITIAL_CONTACT_MESSAGES[msgIndex] = updated;
      return NextResponse.json(updated);
    }

    const dbResult = await executeQuery<any[]>(
      "SELECT * FROM contact_inquiries WHERE id = ? LIMIT 1",
      [id]
    );

    if (dbResult && dbResult.length > 0) {
      const row = dbResult[0];
      return NextResponse.json({
        id: row.id,
        ticketNumber: row.ticket_number,
        name: row.name,
        email: row.email,
        phone: row.phone,
        subject: row.subject,
        message: row.message,
        priority: row.priority,
        status: row.status,
        assignedTo: row.assigned_to,
        resolutionNotes: row.resolution_notes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      });
    }

    return NextResponse.json({ error: "Contact ticket not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to update contact ticket: " + err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await executeQuery("DELETE FROM contact_inquiries WHERE id = ?", [id]);

    const msgIndex = INITIAL_CONTACT_MESSAGES.findIndex((m) => m.id === id);
    if (msgIndex !== -1) {
      INITIAL_CONTACT_MESSAGES.splice(msgIndex, 1);
    }

    return NextResponse.json({ success: true, message: "Ticket deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to delete ticket: " + err.message }, { status: 500 });
  }
}
