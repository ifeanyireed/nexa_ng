import { SignJWT, jwtVerify } from "jose";
import { NextResponse } from "next/server";

export const JWT_SECRET_KEY = process.env.JWT_SECRET || "nexa-jwt-secret-key-production-2026";
export const AUTH_COOKIE_NAME = "ofia_superadmin_jwt";

export type AdminRole = "SUPER_ADMIN" | "SECURITY_ADMIN" | "VIEWER";

export interface RolePermissions {
  canManageTenants: boolean;     // create, update, delete tenant orgs
  canManagePlans: boolean;       // create, update subscription plans & tiers
  canManageSecurity: boolean;    // feature flags, email relays, system metrics, audit logs
  canResolveDisputes: boolean;   // mediate and release escrow in marketplace
  canExportData: boolean;        // export waitlist and CRM pipelines to CSV
  canMutate: boolean;            // general create/update/delete actions across console
}

export const ROLE_PERMISSIONS: Record<AdminRole, RolePermissions> = {
  SUPER_ADMIN: {
    canManageTenants: true,
    canManagePlans: true,
    canManageSecurity: true,
    canResolveDisputes: true,
    canExportData: true,
    canMutate: true,
  },
  SECURITY_ADMIN: {
    canManageTenants: false,
    canManagePlans: false,
    canManageSecurity: true,
    canResolveDisputes: false,
    canExportData: true,
    canMutate: false,
  },
  VIEWER: {
    canManageTenants: false,
    canManagePlans: false,
    canManageSecurity: false,
    canResolveDisputes: false,
    canExportData: false,
    canMutate: false,
  },
};

export function getPermissionsForRole(role: AdminRole): RolePermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.VIEWER;
}

export interface SuperAdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
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
    name: "Grace Jude",
    email: "grace.jude@ofia.ng",
    passwordHash: "OfiaSuperAdmin2026!",
    role: "SUPER_ADMIN",
    scope: "PLATFORM_ROOT",
    department: "Executive Engineering",
    avatar: "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686456/ofia_ng_assets/rr1m5fkqj8ei3eao1qjm.jpg",
  },
  {
    id: "admin-secops-02",
    name: "Ibrahim Musa",
    email: "secops@ofia.ng",
    passwordHash: "SecOpsAudit2026!",
    role: "SECURITY_ADMIN",
    scope: "AUDIT_COMPLIANCE",
    department: "Security & Trust Operations",
    avatar: "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686464/ofia_ng_assets/dkbgzs7l252oasr7rwpa.jpg",
  },
  {
    id: "admin-viewer-03",
    name: "Chioma Okonkwo",
    email: "auditor@ofia.ng",
    passwordHash: "AuditorPass2026!",
    role: "VIEWER",
    scope: "READ_ONLY",
    department: "Financial & Systems Audit",
    avatar: "https://res.cloudinary.com/ihfqdysu/image/upload/v1790686465/ofia_ng_assets/rpiuip9fu0em4wpsrvfm.jpg",
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
    avatar: user.avatar,
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
    const userId = payload.sub as string;
    const seeded = SEEDED_SUPER_ADMINS.find((u) => u.id === userId);

    let name = (seeded?.name || payload.name) as string;
    let email = (seeded?.email || payload.email) as string;

    // Sanitize any legacy cached token claims for admin-root-01 or Adeyemi Phillips
    if (userId === "admin-root-01" || name?.toLowerCase().includes("adeyemi")) {
      name = "Grace Jude";
      email = "grace.jude@ofia.ng";
    }

    return {
      id: userId,
      email,
      name,
      role: (payload.role as AdminRole) || seeded?.role || "VIEWER",
      scope: (payload.scope as string) || seeded?.scope || "READ_ONLY",
      department: seeded?.department || (payload.department as string) || "General",
      avatar: seeded?.avatar || (payload.avatar as string) || undefined,
    };
  } catch {
    return null;
  }
}

export function findSuperAdminByCredentials(email: string, password: string): SuperAdminUser | null {
  const cleanEmail = email.trim().toLowerCase();
  const found = SEEDED_SUPER_ADMINS.find(
    (u) =>
      (u.email.toLowerCase() === cleanEmail ||
        (cleanEmail === "superadmin@ofia.ng" && u.id === "admin-root-01")) &&
      u.passwordHash === password
  );

  if (!found) return null;

  const { passwordHash, ...safeUser } = found;
  return safeUser;
}

export async function authenticateApiRequest(
  req: Request,
  options?: {
    allowedRoles?: AdminRole[];
    requireMutation?: boolean;
    requirePermission?: keyof RolePermissions;
  }
): Promise<{ user: SuperAdminUser | null; errorResponse: NextResponse | null }> {
  // 1. Check if edge middleware already verified the operator
  const operatorRole = req.headers.get("x-operator-role") as AdminRole | null;
  const operatorId = req.headers.get("x-operator-id");
  const operatorEmail = req.headers.get("x-operator-email");

  let user: SuperAdminUser | null = null;

  if (operatorRole && operatorId) {
    user = {
      id: operatorId,
      name: operatorEmail?.split("@")[0] || "SuperAdmin Operator",
      email: operatorEmail || "superadmin@ofia.ng",
      role: operatorRole,
      scope: "PLATFORM_ROOT",
      department: "Platform Operations",
    };
  }

  let token: string | undefined;

  // 2. Check Cookie header if user not already resolved
  if (!user) {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader
        .split(";")
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
      if (match) {
        token = decodeURIComponent(match.substring(AUTH_COOKIE_NAME.length + 1));
      }
    }

    // 3. Check Authorization header
    if (!token) {
      const authHeader = req.headers.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7).trim();
      }
    }

    if (token) {
      user = await verifySuperAdminJWT(token);
    }
  }

  // 4. In development mode or local testing, provide fallback operator if no token found
  if (!user && process.env.NODE_ENV !== "production") {
    user = SEEDED_SUPER_ADMINS[0];
  }

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized: Missing or invalid session token" },
        { status: 401 }
      ),
    };
  }

  // Role checks
  if (options?.allowedRoles && !options.allowedRoles.includes(user.role)) {
    return {
      user,
      errorResponse: NextResponse.json(
        {
          error: `Forbidden: Role '${user.role}' lacks permission for this action`,
          requiredRoles: options.allowedRoles,
        },
        { status: 403 }
      ),
    };
  }

  // Mutation permission checks
  if (options?.requireMutation && user.role === "VIEWER") {
    return {
      user,
      errorResponse: NextResponse.json(
        { error: "Forbidden: Viewer role has read-only privileges" },
        { status: 403 }
      ),
    };
  }

  // Specific granular permission check
  if (options?.requirePermission) {
    const permissions = getPermissionsForRole(user.role);
    if (!permissions[options.requirePermission]) {
      return {
        user,
        errorResponse: NextResponse.json(
          {
            error: `Forbidden: Missing required permission '${options.requirePermission}'`,
          },
          { status: 403 }
        ),
      };
    }
  }

  return { user, errorResponse: null };
}
