import { SignJWT, jwtVerify } from "jose";

export const JWT_SECRET_KEY = process.env.JWT_SECRET || "nexa-jwt-secret-key-production-2026";
export const AUTH_COOKIE_NAME = "ofia_superadmin_jwt";

export interface SuperAdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "SECURITY_ADMIN" | "VIEWER";
  scope: string;
  department: string;
  avatar?: string;
}

export interface SeededSuperAdminAccount extends SuperAdminUser {
  passwordHash: string;
}

export const SEEDED_SUPER_ADMINS: SeededSuperAdminAccount[] = [
  {
    id: "admin-root-01",
    name: "Adeyemi Phillips",
    email: "superadmin@ofia.ng",
    passwordHash: "OfiaSuperAdmin2026!",
    role: "SUPER_ADMIN",
    scope: "PLATFORM_ROOT",
    department: "Executive Engineering",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80",
  },
  {
    id: "admin-secops-02",
    name: "Ibrahim Musa",
    email: "secops@ofia.ng",
    passwordHash: "SecOpsAudit2026!",
    role: "SECURITY_ADMIN",
    scope: "AUDIT_COMPLIANCE",
    department: "Security & Trust Operations",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&auto=format&fit=crop&q=80",
  },
  {
    id: "admin-viewer-03",
    name: "Chioma Okonkwo",
    email: "auditor@ofia.ng",
    passwordHash: "AuditorPass2026!",
    role: "VIEWER",
    scope: "READ_ONLY",
    department: "Financial & Systems Audit",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&auto=format&fit=crop&q=80",
  },
];

export async function signSuperAdminJWT(user: SuperAdminUser): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET_KEY);
  return await new SignJWT({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    scope: user.scope,
    department: user.department,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifySuperAdminJWT(token: string): Promise<SuperAdminUser | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET_KEY);
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as SuperAdminUser["role"],
      scope: payload.scope as string,
      department: payload.department as string,
    };
  } catch (error) {
    return null;
  }
}

export function findSuperAdminByCredentials(email: string, password: string): SuperAdminUser | null {
  const cleanEmail = email.trim().toLowerCase();
  const found = SEEDED_SUPER_ADMINS.find(
    (u) => u.email.toLowerCase() === cleanEmail && u.passwordHash === password
  );

  if (!found) return null;

  const { passwordHash, ...safeUser } = found;
  return safeUser;
}
