import { NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone = "", subject = "General Inquiry", message } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Your name is required." }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Please provide your message or inquiry." }, { status: 400 });
    }

    const ticketNumber = `TKT-${Math.floor(8000 + Math.random() * 1999)}`;
    const id = `cnt-${Date.now()}`;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");
    const priority = subject === "Billing / Payments" ? "HIGH" : "MEDIUM";

    // Insert into MySQL contact_inquiries table
    await executeQuery(
      `INSERT INTO contact_inquiries
       (id, ticket_number, name, email, phone, subject, message, priority, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?, ?)`,
      [id, ticketNumber, name.trim(), email.trim().toLowerCase(), phone.trim(), subject, message.trim(), priority, now, now]
    );

    const newContactSubmission = {
      id,
      ticketNumber,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject,
      message: message.trim(),
      priority,
      status: "OPEN",
      createdAt: now,
    };

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been received! Our support team will get back to you shortly.",
        ticketNumber,
        ticket: newContactSubmission,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to submit contact message: " + err.message },
      { status: 500 }
    );
  }
}
