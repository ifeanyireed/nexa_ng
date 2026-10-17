import { NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/jwt-auth";

export const dynamic = "force-dynamic";

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "https://ofia-user-service.onrender.com";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

export async function GET(request: Request) {
  const { errorResponse } = await authenticateApiRequest(request);
  if (errorResponse) return errorResponse;

  try {
    const { search } = new URL(request.url);
    const res = await fetch(`${USER_BASE}/crm/contact${search}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    const messages = Array.isArray(data)
      ? data.map((row: any) => ({
          id: row.id,
          ticketNumber: row.ticket_number || row.TicketNumber,
          name: row.name || row.Name,
          email: row.email || row.Email,
          phone: row.phone || row.Phone,
          subject: row.subject || row.Subject,
          message: row.message || row.Message,
          priority: row.priority || row.Priority || "MEDIUM",
          status: row.status || row.Status || "OPEN",
          assignedTo: row.assigned_to || row.AssignedTo,
          resolutionNotes: row.resolution_notes || row.ResolutionNotes,
          createdAt: row.created_at || row.CreatedAt,
          updatedAt: row.updated_at || row.UpdatedAt,
        }))
      : [];

    return NextResponse.json(messages);
  } catch (err: any) {
    return NextResponse.json(
      { error: "User microservice connection error: " + err.message },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const res = await fetch(`${USER_BASE}/crm/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      signal: AbortSignal.timeout(10000),
    });
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { error: "User microservice connection error: " + err.message },
      { status: 502 }
    );
  }
}
