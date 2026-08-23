import { NextRequest, NextResponse } from "next/server";
import {
  findSuperAdminByCredentials,
  signSuperAdminJWT,
  AUTH_COOKIE_NAME,
} from "@/lib/jwt-auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = findSuperAdminByCredentials(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid operator credentials or unauthorized scope" },
        { status: 401 }
      );
    }

    const token = await signSuperAdminJWT(user);

    const response = NextResponse.json({
      success: true,
      token,
      user,
      message: "SuperAdmin session authorized",
    });

    // Set secure HttpOnly cookie for Edge middleware validation
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Authentication system error: " + (error?.message || "Unknown error") },
      { status: 500 }
    );
  }
}
