import { NextRequest, NextResponse } from "next/server";
import { verifySuperAdminJWT, AUTH_COOKIE_NAME } from "@/lib/jwt-auth";

export async function GET(req: NextRequest) {
  const token =
    req.cookies.get(AUTH_COOKIE_NAME)?.value ||
    req.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await verifySuperAdminJWT(token);
  if (!user) {
    return NextResponse.json({ error: "Invalid or expired session token" }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user,
  });
}
