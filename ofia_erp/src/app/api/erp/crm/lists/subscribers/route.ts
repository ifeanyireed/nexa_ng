import { NextResponse } from "next/server";
import { getCrmSubscribers, addCrmSubscriber, bulkAddCrmSubscribers, updateCrmSubscriber, deleteCrmSubscriber } from "@/lib/crm-service";
import { getValidatedTenantSlug } from "@/lib/crm-tenant";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const tenantSlug = getValidatedTenantSlug(request);
    const { searchParams } = new URL(request.url);
    const listId = searchParams.get("listId");
    if (!listId) {
      return NextResponse.json({ error: "listId query param is required" }, { status: 400 });
    }
    const subscribers = await getCrmSubscribers(tenantSlug, listId);
    return NextResponse.json({ success: true, subscribers });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch subscribers" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantSlug = getValidatedTenantSlug(request, body);
    const { listId, subscriber, subscribers } = body;
    if (!listId) {
      return NextResponse.json({ error: "listId is required" }, { status: 400 });
    }

    if (Array.isArray(subscribers) && subscribers.length > 0) {
      const count = await bulkAddCrmSubscribers(tenantSlug, listId, subscribers);
      return NextResponse.json({ success: true, addedCount: count }, { status: 201 });
    }

    if (subscriber) {
      const added = await addCrmSubscriber(tenantSlug, listId, subscriber);
      return NextResponse.json({ success: true, subscriber: added }, { status: 201 });
    }

    return NextResponse.json({ error: "Either subscriber or subscribers array must be provided" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to add subscriber(s)" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const tenantSlug = getValidatedTenantSlug(request, body);
    const { id, subscriber, email, firstName, lastName, company, phone, linkedinUrl, status } = body;

    const subId = id || subscriber?.id;
    if (!subId) {
      return NextResponse.json({ error: "Subscriber ID is required" }, { status: 400 });
    }

    const updates = {
      email: email !== undefined ? email : subscriber?.email,
      firstName: firstName !== undefined ? firstName : subscriber?.firstName,
      lastName: lastName !== undefined ? lastName : subscriber?.lastName,
      company: company !== undefined ? company : subscriber?.company,
      phone: phone !== undefined ? phone : subscriber?.phone,
      linkedinUrl: linkedinUrl !== undefined ? linkedinUrl : subscriber?.linkedinUrl,
      status: status !== undefined ? status : subscriber?.status,
    };

    const updated = await updateCrmSubscriber(tenantSlug, subId, updates);
    if (!updated) {
      return NextResponse.json({ error: "Subscriber not found or could not be updated" }, { status: 404 });
    }

    return NextResponse.json({ success: true, subscriber: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update subscriber" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  return PATCH(request);
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tenantSlug = getValidatedTenantSlug(request);
    if (!id) {
      return NextResponse.json({ error: "Subscriber ID is required" }, { status: 400 });
    }
    await deleteCrmSubscriber(tenantSlug, id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete subscriber" }, { status: 500 });
  }
}
