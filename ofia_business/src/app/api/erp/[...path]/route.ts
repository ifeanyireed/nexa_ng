import { NextResponse } from "next/server";

const ERP_BASE = process.env.ERP_SERVICE_URL || process.env.NEXT_PUBLIC_ERP_SERVICE_URL || "http://localhost:8084";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const subPath = path.join("/");
  const url = new URL(request.url);
  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": request.headers.get("x-tenant-slug") || "neweratransports",
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP backend connection error: " + err.message }, { status: 502 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const subPath = path.join("/");
  const url = new URL(request.url);
  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;

  try {
    const body = await request.text();
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": request.headers.get("x-tenant-slug") || "neweratransports",
      },
      body: body || "{}",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP backend error: " + err.message }, { status: 502 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const subPath = path.join("/");
  const url = new URL(request.url);
  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;

  try {
    const body = await request.text();
    const res = await fetch(targetUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": request.headers.get("x-tenant-slug") || "neweratransports",
      },
      body: body || "{}",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP backend error: " + err.message }, { status: 502 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const subPath = path.join("/");
  const url = new URL(request.url);
  const targetUrl = `${ERP_BASE}/${subPath}${url.search}`;

  try {
    const res = await fetch(targetUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "x-tenant-slug": request.headers.get("x-tenant-slug") || "neweratransports",
      },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: "ERP backend error: " + err.message }, { status: 502 });
  }
}
