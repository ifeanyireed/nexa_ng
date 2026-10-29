import { NextRequest, NextResponse } from "next/server";
import {
  registerDomainOnEdge,
  removeDomainFromEdge,
  verifyDomainDnsAndEdge,
  cleanDomainInput,
} from "@/lib/domain-edge-manager";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, projectId } = body;

    if (!domain) {
      return NextResponse.json({ success: false, error: "Domain is required" }, { status: 400 });
    }

    const result = await registerDomainOnEdge(domain, projectId);
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");
    const projectId = searchParams.get("projectId") || undefined;

    if (!domain) {
      return NextResponse.json(
        { success: false, error: "domain query parameter is required" },
        { status: 400 }
      );
    }

    const result = await verifyDomainDnsAndEdge(domain, projectId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message, status: "INVALID_DOMAIN" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let domain = searchParams.get("domain");
    let projectId = searchParams.get("projectId") || undefined;

    if (!domain) {
      const body = await req.json().catch(() => ({}));
      domain = body.domain;
      projectId = projectId || body.projectId;
    }

    if (!domain) {
      return NextResponse.json({ success: false, error: "Domain is required" }, { status: 400 });
    }

    const result = await removeDomainFromEdge(domain, projectId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
