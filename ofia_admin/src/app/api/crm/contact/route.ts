import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { INITIAL_CONTACT_MESSAGES, ContactMessageItem } from "@/lib/admin-data";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase();
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const subject = searchParams.get("subject");

    // Fetch from MySQL
    const dbMessages = await executeQuery<any[]>(
      "SELECT * FROM contact_inquiries ORDER BY created_at DESC"
    );

    let messages: ContactMessageItem[] = [];

    if (dbMessages && dbMessages.length > 0) {
      messages = dbMessages.map((row) => ({
        id: row.id,
        ticketNumber: row.ticket_number,
        name: row.name,
        email: row.email,
        phone: row.phone,
        subject: row.subject,
        message: row.message,
        priority: row.priority || "MEDIUM",
        status: row.status || "OPEN",
        assignedTo: row.assigned_to,
        resolutionNotes: row.resolution_notes,
        createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
      }));
    } else {
      messages = [...INITIAL_CONTACT_MESSAGES];
    }

    if (search) {
      messages = messages.filter(
        (msg) =>
          msg.name.toLowerCase().includes(search) ||
          msg.email.toLowerCase().includes(search) ||
          msg.ticketNumber.toLowerCase().includes(search) ||
          msg.message.toLowerCase().includes(search) ||
          (msg.phone && msg.phone.includes(search))
      );
    }

    if (status && status !== "ALL") {
      messages = messages.filter((msg) => msg.status === status);
    }

    if (priority && priority !== "ALL") {
      messages = messages.filter((msg) => msg.priority === priority);
    }

    if (subject && subject !== "ALL") {
      messages = messages.filter((msg) => msg.subject === subject);
    }

    return NextResponse.json({
      messages,
      kpis: {
        totalTickets: messages.length,
        openTickets: messages.filter((m) => m.status === "OPEN").length,
        inProgressTickets: messages.filter((m) => m.status === "IN_PROGRESS").length,
        resolvedTickets: messages.filter((m) => m.status === "RESOLVED").length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to fetch contact messages: " + err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone = "", subject = "General Inquiry", message, priority = "MEDIUM" } = body;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing required contact ticket fields" }, { status: 400 });
    }

    const ticketNumber = `TKT-${Math.floor(8000 + Math.random() * 1999)}`;
    const id = `cnt-${Date.now()}`;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    await executeQuery(
      `INSERT INTO contact_inquiries
       (id, ticket_number, name, email, phone, subject, message, priority, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)`,
      [id, ticketNumber, name.trim(), email.trim().toLowerCase(), phone.trim(), subject, message.trim(), priority, now, now]
    );

    const newMsg: ContactMessageItem = {
      id,
      ticketNumber,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject,
      message: message.trim(),
      priority,
      status: "OPEN",
      assignedTo: null,
      resolutionNotes: null,
      createdAt: now,
      updatedAt: now,
    };

    INITIAL_CONTACT_MESSAGES.unshift(newMsg);
    return NextResponse.json(newMsg, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to create contact ticket: " + err.message }, { status: 500 });
  }
}
