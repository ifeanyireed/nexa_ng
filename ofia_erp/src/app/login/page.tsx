"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  Users,
  CheckCircle2,
  Building2,
  Briefcase,
  Layers,
} from "lucide-react";

import { AUTH_API } from "@/lib/api-client";
import { resolveAvatarUrl } from "@/lib/avatar";
import {
  useActiveTenant,
  slugToTenantName,
  extractSubdomainOrParam,
  DEFAULT_TENANT_BRANDING,
} from "@/lib/tenant-context";
import { detectImageBrightness } from "@/lib/image-brightness";


export interface LoginPageProps {
  initialTenantSlug?: string;
  searchParams?: Record<string, string | string[] | undefined> | Promise<Record<string, string | string[] | undefined>>;
}

export default function LoginPage({ initialTenantSlug, searchParams }: LoginPageProps = {}) {
  const router = useRouter();

  // 1. Unwrap searchParams promise (Next.js 16 / React 19) or plain object
  let unwrappedParams: Record<string, string | string[] | undefined> = {};
  if (searchParams) {
    if (typeof (searchParams as any).then === "function") {
      unwrappedParams = React.use(searchParams as Promise<any>) || {};
    } else if (typeof searchParams === "object") {
      unwrappedParams = searchParams as any;
    }
  }

  // Synchronous slug resolution from props / searchParams
  const rawPropSlug =
    initialTenantSlug ||
    (typeof unwrappedParams.tenant === "string"
      ? unwrappedParams.tenant
      : typeof unwrappedParams.tenant_slug === "string"
      ? unwrappedParams.tenant_slug
      : typeof unwrappedParams.company === "string"
      ? unwrappedParams.company
      : typeof unwrappedParams.org === "string"
      ? unwrappedParams.org
      : undefined);

  // 2. Client-mounted host, subdomain, and tenant detection
  const [mountedHostTenant, setMountedHostTenant] = useState<string>(rawPropSlug || "");
  const [clientLogo, setClientLogo] = useState<string>("");
  const [clientHeroTitle, setClientHeroTitle] = useState<string>("");
  const [clientHeroSubtitle, setClientHeroSubtitle] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (typeof window !== "undefined") {
      const extracted = extractSubdomainOrParam(rawPropSlug);
      if (extracted) {
        setMountedHostTenant(extracted);
      }

      const activeSlug = rawPropSlug || extracted || "";
      const savedLogo =
        (activeSlug ? localStorage.getItem("tenant_logo_" + activeSlug) : null) ||
        localStorage.getItem("nexa_tenant_logo") ||
        (activeSlug ? DEFAULT_TENANT_BRANDING[activeSlug]?.logo : null) ||
        "";
      if (savedLogo) {
        setClientLogo(savedLogo);
      }

      const savedHeroTitle =
        (activeSlug ? localStorage.getItem("tenant_hero_title_" + activeSlug) : null) ||
        localStorage.getItem("nexa_tenant_hero_title") ||
        (activeSlug ? DEFAULT_TENANT_BRANDING[activeSlug]?.heroTitle : null) ||
        "";
      if (savedHeroTitle) {
        setClientHeroTitle(savedHeroTitle);
      }

      const savedHeroSubtitle =
        (activeSlug ? localStorage.getItem("tenant_hero_subtitle_" + activeSlug) : null) ||
        localStorage.getItem("nexa_tenant_hero_subtitle") ||
        (activeSlug ? DEFAULT_TENANT_BRANDING[activeSlug]?.heroSubtitle : null) ||
        "";
      if (savedHeroSubtitle) {
        setClientHeroSubtitle(savedHeroSubtitle);
      }
    }
  }, [rawPropSlug]);

  const resolvedInitialSlug = rawPropSlug || mountedHostTenant || undefined;
  const { activeTenant: hookActiveTenant, isLoading: isTenantLoading } = useActiveTenant(null, resolvedInitialSlug);

  // Prevent hydration mismatch by suppressing client-only derived tenant data until mounted
  const activeTenant = isMounted ? hookActiveTenant : undefined;

  const resolvedSlug =
    rawPropSlug ||
    activeTenant?.slug ||
    (isMounted ? mountedHostTenant : "") ||
    (isMounted
      ? localStorage.getItem("nexa_tenant_slug") ||
        localStorage.getItem("tenant_slug") ||
        localStorage.getItem("nexa_org_id") ||
        ""
      : "") ||
    "";

  const isCustomTenant = Boolean(
    resolvedSlug && !["www", "ofia", "app", "nexa", "erp", "admin"].includes(resolvedSlug.toLowerCase())
  );

  const tenantName = (isCustomTenant && (activeTenant?.name || slugToTenantName(resolvedSlug))) || "Ofia ERP";
  const tenantSlug = isCustomTenant ? resolvedSlug : "";

  // Multi-tier logo resolution ensuring tenant's set logo is always displayed:
  // 1. activeTenant?.logo (from database or resolved tenant object)
  // 2. clientLogo (from localStorage or default branding)
  // 3. localStorage keys (tenant_logo_${slug}, nexa_tenant_logo)
  // 4. DEFAULT_TENANT_BRANDING preset
  // 5. Cloudinary asset for New Era Transports if applicable
  const tenantLogo = isCustomTenant
    ? activeTenant?.logo ||
      clientLogo ||
      (isMounted
        ? (resolvedSlug ? localStorage.getItem("tenant_logo_" + resolvedSlug) : null) ||
          (activeTenant?.id ? localStorage.getItem("tenant_logo_" + activeTenant.id) : null) ||
          (activeTenant?.slug ? localStorage.getItem("tenant_logo_" + activeTenant.slug) : null) ||
          localStorage.getItem("nexa_tenant_logo") ||
          ""
        : "") ||
      DEFAULT_TENANT_BRANDING[resolvedSlug]?.logo ||
      DEFAULT_TENANT_BRANDING[activeTenant?.id || ""]?.logo ||
      (resolvedSlug.toLowerCase().includes("newera")
        ? "https://res.cloudinary.com/ihfqdysu/image/upload/v1790736847/ofia_ng_assets/emfgp9dinkhpkaevpnsx.png"
        : "")
    : "";

  const primaryColor =
    (isCustomTenant && (activeTenant?.primaryColor || DEFAULT_TENANT_BRANDING[resolvedSlug]?.primaryColor)) || "#1A56DB";
  const secondaryColor =
    (isCustomTenant && (activeTenant?.secondaryColor || DEFAULT_TENANT_BRANDING[resolvedSlug]?.secondaryColor)) || "#0E9F6E";
  const tenantDomain = (isCustomTenant && (activeTenant?.domain || `${resolvedSlug}.ofia.ng`)) || "ofia.ng";
  const loginImage = isCustomTenant
    ? activeTenant?.loginImage ||
      (isMounted
        ? (resolvedSlug ? localStorage.getItem("tenant_login_image_" + resolvedSlug) : null) ||
          (activeTenant?.id ? localStorage.getItem("tenant_login_image_" + activeTenant.id) : null) ||
          localStorage.getItem("nexa_tenant_login_image") ||
          ""
        : "") ||
      DEFAULT_TENANT_BRANDING[resolvedSlug]?.loginImage ||
      ""
    : "";

  // Dynamic automatic image brightness detection (ITU-R BT.709 perceived luminance)
  const [imageBrightness, setImageBrightness] = useState<"dark" | "light">("dark");

  React.useEffect(() => {
    if (!loginImage || typeof window === "undefined") {
      setImageBrightness("light");
      return;
    }
    let active = true;
    detectImageBrightness(loginImage).then((brightness) => {
      if (active) {
        setImageBrightness(brightness);
      }
    });
    return () => {
      active = false;
    };
  }, [loginImage]);

  const isDarkBg = Boolean(loginImage && imageBrightness === "dark");

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const activeName = (isCustomTenant && tenantName) ? tenantName : (tenantName || "Ofia ERP");
      document.title = `${activeName} — Login | Ofia ERP`;
    }
  }, [isCustomTenant, tenantName]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const normalizedEmail = email.trim().toLowerCase();
    const emailDomain = normalizedEmail.includes("@") ? normalizedEmail.split("@")[1].split(".")[0] : "";

    try {
      const res = await AUTH_API.login({ email, password });
      
      if (!res || !res.token || !res.user) {
        throw new Error("Invalid response from authentication server");
      }
      
      let resolvedRole = "employee";
      let resolvedName = res.user.name || email.split("@")[0] || "User";
      let resolvedDept = res.user.department || "Operations";
      let resolvedDesig = res.user.designation || "Staff Member";
      let resolvedAvatar = res.user.avatar || "/character1.jpg";
      let resolvedId = res.user.id || "";

      if (res.user.role) {
        const rawRole = String(res.user.role).toLowerCase();
        if (rawRole === "super_admin" || rawRole === "admin" || rawRole === "tenant_owner") {
          resolvedRole = "admin";
        } else if (rawRole.includes("growth") || rawRole.includes("sales")) {
          resolvedRole = "marketer";
        } else if (rawRole.includes("manager")) {
          resolvedRole = "manager";
        } else if (rawRole.includes("hr")) {
          resolvedRole = "hr";
        } else if (rawRole.includes("accountant")) {
          resolvedRole = "accountant";
        } else if (
          rawRole.includes("employee") ||
          rawRole.includes("staff") ||
          rawRole.includes("viewer") ||
          rawRole.includes("client")
        ) {
          resolvedRole = "employee";
        }
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("nexa_auth_token", res.token);
        localStorage.setItem("nexa_user_email", email);
        localStorage.setItem("nexa_user_role", resolvedRole);
        localStorage.setItem("nexa_user_name", resolvedName);
        if (emailDomain) {
          localStorage.setItem("nexa_org_id", emailDomain);
        }
        localStorage.setItem(
          "erp_current_user",
          JSON.stringify({
            id: resolvedId,
            email,
            role: resolvedRole,
            name: resolvedName,
            department: resolvedDept,
            designation: resolvedDesig,
            avatar: resolveAvatarUrl(resolvedAvatar, resolvedName),
          })
        );
        document.cookie = `nexa_user_role=${resolvedRole}; path=/; max-age=2592000; SameSite=Lax`;
        document.cookie = `nexa_user_email=${encodeURIComponent(email)}; path=/; max-age=2592000; SameSite=Lax`;
      }
      navigateUser(email, resolvedRole);
    } catch (err: any) {
      setError(err.message || "Invalid credentials or authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigateUser = (userEmail: string, userRole?: string) => {
    const activeRole =
      userRole ||
      (typeof window !== "undefined"
        ? localStorage.getItem("nexa_user_role") || "employee"
        : "employee");

    let route = "/erp/employee"; // Default to employee portal (least privilege)
    if (activeRole === "admin") {
      route = "/erp/admin";
    } else if (activeRole === "md") {
      route = "/erp/md";
    } else if (activeRole === "hr") {
      route = "/erp/hr";
    } else if (activeRole === "accountant") {
      route = "/erp/accountant";
    } else if (activeRole === "marketer") {
      route = "/erp/marketer";
    } else if (activeRole === "manager") {
      route = "/erp/manager";
    } else if (activeRole === "cashier") {
      route = "/erp/admin/shop/pos";
    } else if (activeRole === "inventory_officer") {
      route = "/erp/admin/shop/inventory";
    } else if (activeRole === "dispatcher") {
      route = "/erp/admin/logistics";
    } else {
      route = "/erp/employee";
    }

    // 1. Identify tenant slug from user email if on general erp.domain.ng
    let targetTenantSlug = tenantSlug;
    if (!targetTenantSlug && userEmail.includes("@")) {
      const domainPart = userEmail.split("@")[1].toLowerCase();
      const extracted = domainPart.split(".")[0];
      if (!["gmail", "yahoo", "outlook", "hotmail", "icloud", "ofia", "erp", "admin", "app"].includes(extracted)) {
        targetTenantSlug = extracted;
      }
    }

    if (typeof window !== "undefined" && targetTenantSlug) {
      localStorage.setItem("nexa_tenant_slug", targetTenantSlug);
      localStorage.setItem("tenant_slug", targetTenantSlug);
      localStorage.setItem("nexa_org_id", targetTenantSlug);
    }

    // 2. If on general erp.domain.ng -> route to tenant_slug.domain.ng
    if (typeof window !== "undefined" && targetTenantSlug && !tenantSlug) {
      const host = window.location.host.toLowerCase();
      const protocol = window.location.protocol;
      const cleanHost = host.replace(/^erp\./i, "").replace(/^www\./i, "");

      if (cleanHost && !cleanHost.startsWith(targetTenantSlug)) {
        window.location.href = `${protocol}//${targetTenantSlug}.${cleanHost}${route}`;
        return;
      }
    }

    router.push(route);
  };

  const heroTitle =
    activeTenant?.heroTitle ||
    clientHeroTitle ||
    (typeof window !== "undefined"
      ? (resolvedSlug ? localStorage.getItem("tenant_hero_title_" + resolvedSlug) : null) ||
        (activeTenant?.id ? localStorage.getItem("tenant_hero_title_" + activeTenant.id) : null) ||
        localStorage.getItem("nexa_tenant_hero_title")
      : null) ||
    DEFAULT_TENANT_BRANDING[resolvedSlug]?.heroTitle ||
    DEFAULT_TENANT_BRANDING[activeTenant?.id || ""]?.heroTitle ||
    (resolvedSlug.toLowerCase().includes("newera")
      ? "Powering next-generation transport, logistics & fleet intelligence."
      : isCustomTenant
      ? `Unified enterprise workspace for ${tenantName}.`
      : "Intelligent enterprise resource planning for modern business.");

  const heroSubtitle =
    activeTenant?.heroSubtitle ||
    clientHeroSubtitle ||
    (typeof window !== "undefined"
      ? (resolvedSlug ? localStorage.getItem("tenant_hero_subtitle_" + resolvedSlug) : null) ||
        (activeTenant?.id ? localStorage.getItem("tenant_hero_subtitle_" + activeTenant.id) : null) ||
        localStorage.getItem("nexa_tenant_hero_subtitle")
      : null) ||
    DEFAULT_TENANT_BRANDING[resolvedSlug]?.heroSubtitle ||
    DEFAULT_TENANT_BRANDING[activeTenant?.id || ""]?.heroSubtitle ||
    (resolvedSlug.toLowerCase().includes("newera")
      ? "Real-time zonal dispatch, fleet telemetry, manifest auditing, and ledger reconciliation in one synchronized ecosystem."
      : isCustomTenant
      ? `Streamline operations, financial accounting, inventory, and workforce workflows across ${tenantName}.`
      : "Empower your teams with real-time operations, inventory distribution, point of sale, and ledger reconciliation.");

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white text-slate-900 overflow-x-hidden">
      {/* ======================================================== */}
      {/* LEFT: HERO BRANDING & WALLPAPER (Expanded Hero Area)     */}
      {/* ======================================================== */}
      <div className="relative w-full lg:w-[58%] xl:w-[62%] min-h-[380px] lg:min-h-screen flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 overflow-hidden bg-slate-950 text-white select-none">
        {/* Background Wallpaper Image */}
        {loginImage ? (
          <div className="absolute inset-0 z-0">
            <img
              src={loginImage}
              alt={`${tenantName} Backdrop`}
              className="w-full h-full object-cover object-center filter transition-all duration-700 brightness-[0.82]"
            />
            {/* Rich gradient overlay ensuring hero text has maximum readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-slate-950/35 backdrop-blur-[0.5px]" />
          </div>
        ) : (
          <div
            className="absolute inset-0 z-0"
            style={{
              background: `radial-gradient(circle at 20% 30%, ${primaryColor}66 0%, #020617 100%)`,
            }}
          />
        )}

        {/* Left Top: Tenant Identity & Monogram */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            {tenantLogo ? (
              <img
                src={tenantLogo}
                alt={`${tenantName} Logo`}
                className="h-9 sm:h-10 w-auto max-w-[170px] object-contain shrink-0 drop-shadow-md"
                onError={(e) => {
                  const fallback =
                    DEFAULT_TENANT_BRANDING[resolvedSlug]?.logo ||
                    (resolvedSlug.toLowerCase().includes("newera")
                      ? "https://res.cloudinary.com/ihfqdysu/image/upload/v1790736847/ofia_ng_assets/emfgp9dinkhpkaevpnsx.png"
                      : "");
                  const target = e.target as HTMLImageElement;
                  if (fallback && target.src !== fallback) {
                    target.src = fallback;
                  } else if (!isCustomTenant) {
                    target.src = "/icon.png";
                  }
                }}
              />
            ) : isCustomTenant ? (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-md border"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, #020617)`,
                  borderColor: `${primaryColor}40`,
                }}
              >
                {tenantName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase() || "WP"}
              </div>
            ) : (
              <img
                src="/icon.png"
                alt="Ofia ERP Logo"
                className="w-9 h-9 object-contain"
              />
            )}

            <div className="flex flex-col">
              <span className="font-semibold text-base text-white flex items-center gap-2 drop-shadow-md">
                {tenantName}
                <span
                  className="text-[10px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full border backdrop-blur-md"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.15)",
                    borderColor: "rgba(255, 255, 255, 0.25)",
                    color: "#FFFFFF",
                  }}
                >
                  {tenantSlug ? tenantSlug.toUpperCase() : "ENTERPRISE"}
                </span>
              </span>
              <span className="text-[11px] text-white/80 font-medium tracking-wide drop-shadow-sm">
                {isCustomTenant ? "Enterprise Workspace" : "Unified Enterprise Suite"}
              </span>
            </div>
          </Link>
        </div>

        {/* Left Center: Bold Hero Typography & Feature Badges */}
        <div className="relative z-10 my-auto py-8 sm:py-12 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold text-white/95">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>Enterprise Operations & Management Suite</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-[1.15] drop-shadow-lg">
            {heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-white/85 leading-relaxed drop-shadow-sm font-normal max-w-lg">
            {heroSubtitle}
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-sm">
              <div className="p-2 rounded-xl bg-white/15 text-white shrink-0">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Real-Time Dispatch</div>
                <div className="text-[11px] text-white/70">Zonal manifests & fleet ops</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md shadow-sm">
              <div className="p-2 rounded-xl bg-white/15 text-white shrink-0">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Bank-Grade Ledger</div>
                <div className="text-[11px] text-white/70">Double-entry automated reconciliation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Bottom: Trust & Security Badges */}
        <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/70">
          <span className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            SOC2 Type II & 256-Bit AES Encryption
          </span>
          <span>© 2026 Ofia ERP</span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT: COMPACT LOGIN FORM OVER CLEAN WHITE BACKGROUND     */}
      {/* ======================================================== */}
      <div className="w-full lg:w-[42%] xl:w-[38%] min-h-screen flex flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12 bg-white text-slate-900 shrink-0">
        {/* Right Top Bar: Switch tenant / Register workspace */}
        <div className="flex items-center justify-end gap-2 text-xs">
          <span className="text-slate-500 font-medium text-[11px] sm:text-xs">
            {isCustomTenant ? "Need another organization?" : "Don't have an enterprise workspace?"}
          </span>
          <Link
            href="/join/register"
            className="font-bold hover:underline px-2.5 py-1 rounded-full transition-all text-xs"
            style={{ color: primaryColor }}
          >
            Setup Workspace →
          </Link>
        </div>

        {/* Right Center: Centered Login Form */}
        <div className="my-auto w-full max-w-sm sm:max-w-md mx-auto py-6 sm:py-10">
          {/* Tenant Logo prominently displayed over the crisp white background */}
          <div className="mb-8">
            {tenantLogo ? (
              <img
                src={tenantLogo}
                alt={`${tenantName} Logo`}
                className="h-14 sm:h-16 w-auto max-w-[240px] object-contain mb-5"
                onError={(e) => {
                  const fallback =
                    DEFAULT_TENANT_BRANDING[resolvedSlug]?.logo ||
                    (resolvedSlug.toLowerCase().includes("newera")
                      ? "https://res.cloudinary.com/ihfqdysu/image/upload/v1790736847/ofia_ng_assets/emfgp9dinkhpkaevpnsx.png"
                      : "");
                  const target = e.target as HTMLImageElement;
                  if (fallback && target.src !== fallback) {
                    target.src = fallback;
                  } else if (!isCustomTenant) {
                    target.src = "/icon.png";
                  }
                }}
              />
            ) : isCustomTenant ? (
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg mb-5"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, #020617)`,
                }}
              >
                {tenantName
                  .split(" ")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase() || "WP"}
              </div>
            ) : (
              <img
                src="/icon.png"
                alt="Ofia ERP Logo"
                className="h-12 w-12 object-contain mb-5"
              />
            )}

            <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              {isCustomTenant ? `Sign in to ${tenantName}` : "Sign in to Ofia ERP"}
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              {isCustomTenant
                ? `Enterprise Workspace • ${tenantDomain}`
                : "Access your enterprise workspace, accounting ledger, and AI tools."}
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider px-1">
                Enterprise Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-11 pr-4 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/erp/reset-password"
                  className="text-xs font-bold hover:underline transition-colors"
                  style={{ color: primaryColor }}
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-11 text-sm rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Device & 2FA Badge */}
            <div className="flex items-center justify-between text-xs px-1 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300"
                  style={{ accentColor: primaryColor }}
                />
                <span className="text-slate-600 font-medium">Remember this device</span>
              </label>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                2FA Enforced
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:brightness-110 active:scale-[0.99] mt-2"
              style={{
                backgroundColor: primaryColor,
                boxShadow: `0 8px 20px -4px ${primaryColor}40`,
              }}
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Info Hint */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              Sign in with your enterprise credentials or contact your system administrator.
            </p>
          </div>
        </div>

        {/* Right Bottom Footer */}
        <div className="pt-4 text-center text-xs text-slate-400">
          Protected by SOC2 Type II & 256-bit AES encryption • Powered by Ofia ERP
        </div>
      </div>
    </div>
  );
}


