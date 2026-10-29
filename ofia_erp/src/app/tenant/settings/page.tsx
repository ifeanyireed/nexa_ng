"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Copy,
  Globe,
  Save,
  Server,
  Settings,
  ShieldCheck,
  Sliders,
  UserCheck,
  Building2,
  RefreshCw,
  Image as ImageIcon,
  Upload,
  Palette,
  Sparkles,
  Mail,
  Send,
  AlertCircle,
  Key,
  Lock,
  Eye,
  EyeOff,
  Bot,
  Cpu,
  Zap,
  ExternalLink,
  MessageSquare,
  Trash2,
  Plus,
  Star,
  Check,
  Phone,
  PhoneCall,
  PhoneForwarded,
  Volume2,
  Clock,
} from "lucide-react";
import { ErpAdminShell } from "@/components/erp/ErpAdminShell";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaInput } from "@/components/nexa/NexaInput";
import { useAuth } from "@/components/nexa/AuthContext";
import { useActiveTenant, applyTenantBranding, DEFAULT_TENANT_BRANDING } from "@/lib/tenant-context";

export interface SenderProfileItem {
  id: string;
  profileName: string;
  provider: string;
  host: string;
  port: number;
  encryption: "tls" | "ssl" | "none";
  fromEmail: string;
  fromName: string;
  username: string;
  password?: string;
  hasPassword?: boolean;
  isDefault?: boolean;
}

export default function TenantSettingsPage() {
  const { user } = useAuth();
  const { activeTenant, reloadTenants, isLoading } = useActiveTenant(user?.email);

  const [orgName, setOrgName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [loginImageUrl, setLoginImageUrl] = useState("");
  const [isUploadingLoginImage, setIsUploadingLoginImage] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#1A56DB");
  const [secondaryColor, setSecondaryColor] = useState("#0E9F6E");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [customDomain, setCustomDomain] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [erpExt, setErpExt] = useState(true);
  const [shopExt, setShopExt] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Active Settings Navigation Tab
  const [activeTab, setActiveTab] = useState<"profile" | "domain" | "smtp" | "ai_byok">("profile");

  // Multi-Profile Sender & SMTP Settings
  const [senderProfiles, setSenderProfiles] = useState<SenderProfileItem[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("new");
  const [activeProfileId, setActiveProfileId] = useState<string>("");
  const [profileName, setProfileName] = useState("");
  const [smtpProvider, setSmtpProvider] = useState("brevo");
  const [smtpHost, setSmtpHost] = useState("smtp-relay.brevo.com");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpEncryption, setSmtpEncryption] = useState<"tls" | "ssl" | "none">("tls");
  const [smtpFromEmail, setSmtpFromEmail] = useState("");
  const [smtpFromName, setSmtpFromName] = useState("");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [smtpHasPassword, setSmtpHasPassword] = useState(false);
  const [isDefaultProfile, setIsDefaultProfile] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [isSavingSmtp, setIsSavingSmtp] = useState(false);
  const [smtpSaveSuccess, setSmtpSaveSuccess] = useState(false);
  const [isDeletingProfile, setIsDeletingProfile] = useState<string | null>(null);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [smtpTestRecipient, setSmtpTestRecipient] = useState("");
  const [smtpTestStatus, setSmtpTestStatus] = useState<{ success: boolean; message: string } | null>(null);

  // AI BYOK & Model Gateway States
  const [anthropicKey, setAnthropicKey] = useState("sk-ant-api03-••••••••••••••••••••••••");
  const [openaiKey, setOpenaiKey] = useState("sk-proj-••••••••••••••••••••••••");
  const [geminiKey, setGeminiKey] = useState("AIzaSy••••••••••••••••••••••••");
  const [whatsappKey, setWhatsappKey] = useState("EAAQ••••••••••••••••••••••••");
  const [groqKey, setGroqKey] = useState("gsk_••••••••••••••••••••••••");
  const [deepseekKey, setDeepseekKey] = useState("sk-••••••••••••••••••••••••");
  const [byokVisible, setByokVisible] = useState<{ [key: string]: boolean }>({});

  // Voice Agent Telephony & Guardrail States
  const [telephonyProvider, setTelephonyProvider] = useState<"voicebip" | "termii" | "twilio" | "africas_talking" | "webrtc_browser">("voicebip");
  const [voicebipApiKey, setVoicebipApiKey] = useState("");
  const [voicebipApiSecret, setVoicebipApiSecret] = useState("");
  const [voicebipSipEndpoint, setVoicebipSipEndpoint] = useState("sip.voicebip.com:5060");
  const [telephonyAccountSid, setTelephonyAccountSid] = useState("");
  const [telephonyAuthToken, setTelephonyAuthToken] = useState("");
  const [telephonyFromNumber, setTelephonyFromNumber] = useState("+234 1 888 0000");
  const [termiiApiKey, setTermiiApiKey] = useState("");
  const [voiceAgentName, setVoiceAgentName] = useState("Ofia Executive Voice Assistant");
  const [voiceAccent, setVoiceAccent] = useState("en-NG-Standard-A");
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState("");
  const [aiDisclosureEnabled, setAiDisclosureEnabled] = useState(true);
  const [aiDisclosureText, setAiDisclosureText] = useState(
    "Hello, I am Ofia's automated executive assistant calling on behalf of the corporate mobility team."
  );
  const [humanEscalationNumber, setHumanEscalationNumber] = useState("+234 800 000 0000");
  const [callingHoursStart, setCallingHoursStart] = useState("09:00");
  const [callingHoursEnd, setCallingHoursEnd] = useState("17:00");
  const [maxCallDurationSec, setMaxCallDurationSec] = useState(300);
  const [maxRetries, setMaxRetries] = useState(2);
  const [autoWhatsAppDeck, setAutoWhatsAppDeck] = useState(true);
  const [isSavingVoice, setIsSavingVoice] = useState(false);
  const [voiceSaveSuccess, setVoiceSaveSuccess] = useState(false);

  const toggleByokVis = (k: string) => {
    setByokVisible(prev => ({ ...prev, [k]: !prev[k] }));
  };

  // Ofia AI Outreach Delivery States
  const [aiDeliveryMode, setAiDeliveryMode] = useState<"smtp" | "resend" | "brevo" | "ses">("smtp");
  const [resendApiKey, setResendApiKey] = useState("");
  const [brevoApiKey, setBrevoApiKey] = useState("");
  const [awsSesAccessKey, setAwsSesAccessKey] = useState("");
  const [awsSesSecretKey, setAwsSesSecretKey] = useState("");
  const [awsSesRegion, setAwsSesRegion] = useState("us-east-1");
  const [isTestingAiChannel, setIsTestingAiChannel] = useState(false);
  // Custom Domain Live DNS Verification States
  const [isCheckingDns, setIsCheckingDns] = useState(false);
  const [dnsVerified, setDnsVerified] = useState<boolean | null>(null);
  const [dnsMessage, setDnsMessage] = useState("");

  const handleVerifyDns = async (domainToTest?: string) => {
    const dom = domainToTest || customDomain;
    if (!dom || !dom.trim()) {
      setDnsMessage("Please enter a custom domain host first.");
      setDnsVerified(false);
      return;
    }
    setIsCheckingDns(true);
    setDnsMessage("");
    try {
      const res = await fetch(`/api/erp/domain/verify?domain=${encodeURIComponent(dom.trim())}`);
      const data = await res.json();
      setDnsVerified(Boolean(data.verified));
      setDnsMessage(data.message || (data.verified ? "Domain CNAME verified." : "DNS check failed."));
    } catch (e: any) {
      setDnsVerified(false);
      setDnsMessage("DNS check failed: " + e.message);
    } finally {
      setIsCheckingDns(false);
    }
  };

  const [aiChannelStatus, setAiChannelStatus] = useState<string | null>(null);

  const handleTestAiChannel = async () => {
    const currentSlug = activeTenant?.slug || slug;
    if (!currentSlug) {
      setAiChannelStatus("Workspace slug required. Please save workspace first.");
      return;
    }
    setIsTestingAiChannel(true);
    setAiChannelStatus(null);
    try {
      const res = await fetch("/api/erp/byok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_channel",
          tenantSlug: currentSlug,
          aiDeliveryMode,
          resendApiKey,
          brevoApiKey,
          awsSesAccessKey,
          awsSesSecretKey,
          awsSesRegion,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiChannelStatus(data.message);
      } else {
        setAiChannelStatus(data.message || data.error || "Channel verification failed.");
      }
    } catch (err: any) {
      setAiChannelStatus("Verification network error: " + err.message);
    } finally {
      setIsTestingAiChannel(false);
    }
  };

  const handleSaveVoiceSettings = async () => {
    const currentSlug = activeTenant?.slug || slug;
    if (!currentSlug) return;
    setIsSavingVoice(true);
    setVoiceSaveSuccess(false);
    try {
      await fetch("/api/erp/byok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_voice",
          tenantSlug: currentSlug,
          voiceConfig: {
            telephony_provider: telephonyProvider,
            voicebip_api_key: voicebipApiKey,
            voicebip_api_secret: voicebipApiSecret,
            voicebip_sip_endpoint: voicebipSipEndpoint,
            from_phone_number: telephonyFromNumber,
            telephony_account_sid: telephonyAccountSid,
            telephony_auth_token: telephonyAuthToken,
            termii_api_key: termiiApiKey,
            agent_name: voiceAgentName,
            voice_id: voiceAccent,
            elevenlabs_api_key: elevenLabsApiKey,
            ai_disclosure_enabled: aiDisclosureEnabled,
            ai_disclosure_text: aiDisclosureText,
            human_escalation_phone: humanEscalationNumber,
            calling_hours_start: callingHoursStart,
            calling_hours_end: callingHoursEnd,
            max_duration_sec: maxCallDurationSec,
            max_retries: maxRetries,
            auto_whatsapp_deck: autoWhatsAppDeck,
          },
        }),
      });
      setVoiceSaveSuccess(true);
      setTimeout(() => setVoiceSaveSuccess(false), 3000);
    } catch (err) {
      console.warn("Failed to save voice config:", err);
    } finally {
      setIsSavingVoice(false);
    }
  };

  useEffect(() => {
    if (activeTenant) {
      const identifier = activeTenant.slug || activeTenant.id || "org-01";
      const savedName =
        typeof window !== "undefined"
          ? localStorage.getItem("tenant_admin_name_" + identifier) ||
            localStorage.getItem("tenant_admin_name_" + activeTenant.id) ||
            localStorage.getItem("tenant_admin_name_" + activeTenant.slug) ||
            localStorage.getItem("nexa_user_name")
          : null;
      const savedEmail =
        typeof window !== "undefined"
          ? localStorage.getItem("tenant_admin_email_" + identifier) ||
            localStorage.getItem("tenant_admin_email_" + activeTenant.id) ||
            localStorage.getItem("tenant_admin_email_" + activeTenant.slug) ||
            localStorage.getItem("nexa_user_email")
          : null;
      const savedLoginImage =
        typeof window !== "undefined"
          ? localStorage.getItem("tenant_login_image_" + identifier) ||
            localStorage.getItem("tenant_login_image_" + activeTenant.id) ||
            localStorage.getItem("tenant_login_image_" + activeTenant.slug) ||
            localStorage.getItem("nexa_tenant_login_image")
          : null;
      const savedHeroTitle =
        typeof window !== "undefined"
          ? localStorage.getItem("tenant_hero_title_" + identifier) ||
            localStorage.getItem("tenant_hero_title_" + activeTenant.id) ||
            localStorage.getItem("tenant_hero_title_" + activeTenant.slug) ||
            localStorage.getItem("nexa_tenant_hero_title") ||
            DEFAULT_TENANT_BRANDING[activeTenant.slug]?.heroTitle ||
            DEFAULT_TENANT_BRANDING[activeTenant.id]?.heroTitle ||
            DEFAULT_TENANT_BRANDING[identifier]?.heroTitle
          : null;
      const savedHeroSubtitle =
        typeof window !== "undefined"
          ? localStorage.getItem("tenant_hero_subtitle_" + identifier) ||
            localStorage.getItem("tenant_hero_subtitle_" + activeTenant.id) ||
            localStorage.getItem("tenant_hero_subtitle_" + activeTenant.slug) ||
            localStorage.getItem("nexa_tenant_hero_subtitle") ||
            DEFAULT_TENANT_BRANDING[activeTenant.slug]?.heroSubtitle ||
            DEFAULT_TENANT_BRANDING[activeTenant.id]?.heroSubtitle ||
            DEFAULT_TENANT_BRANDING[identifier]?.heroSubtitle
          : null;
      const savedLogo =
        typeof window !== "undefined"
          ? localStorage.getItem("tenant_logo_" + identifier) ||
            localStorage.getItem("tenant_logo_" + activeTenant.id) ||
            localStorage.getItem("tenant_logo_" + activeTenant.slug) ||
            localStorage.getItem("nexa_tenant_logo") ||
            DEFAULT_TENANT_BRANDING[activeTenant.slug]?.logo ||
            DEFAULT_TENANT_BRANDING[activeTenant.id]?.logo ||
            DEFAULT_TENANT_BRANDING[identifier]?.logo
          : null;

      setOrgName(activeTenant.name || "");
      setSlug(activeTenant.slug || "");
      setLogoUrl(activeTenant.logo || savedLogo || "");
      setLoginImageUrl(activeTenant.loginImage || savedLoginImage || "");
      setHeroTitle(activeTenant.heroTitle || savedHeroTitle || "");
      setHeroSubtitle(activeTenant.heroSubtitle || savedHeroSubtitle || "");
      setPrimaryColor(activeTenant.primaryColor || "#1A56DB");
      setSecondaryColor(activeTenant.secondaryColor || "#0E9F6E");
      setCustomDomain(activeTenant.domain || "");
      if (activeTenant.erpEnabled !== undefined) setErpExt(Boolean(activeTenant.erpEnabled));
      if (activeTenant.shopEnabled !== undefined) setShopExt(Boolean(activeTenant.shopEnabled));
      setOwnerName(activeTenant.ownerName || savedName || user?.name || "Workspace Admin");
      setOwnerEmail(activeTenant.ownerEmail || savedEmail || user?.email || (activeTenant.slug ? `admin@${activeTenant.slug}.ofia.ng` : ""));

      // Restore saved BYOK and AI Outreach configuration
      if (typeof window !== "undefined") {
        const savedByok =
          localStorage.getItem("tenant_byok_" + identifier) ||
          localStorage.getItem("tenant_byok_" + activeTenant.id) ||
          localStorage.getItem("tenant_byok_" + activeTenant.slug);
        if (savedByok) {
          try {
            const parsed = JSON.parse(savedByok);
            if (parsed.anthropicKey) setAnthropicKey(parsed.anthropicKey);
            if (parsed.openaiKey) setOpenaiKey(parsed.openaiKey);
            if (parsed.geminiKey) setGeminiKey(parsed.geminiKey);
            if (parsed.whatsappKey) setWhatsappKey(parsed.whatsappKey);
            if (parsed.groqKey) setGroqKey(parsed.groqKey);
            if (parsed.deepseekKey) setDeepseekKey(parsed.deepseekKey);
            if (parsed.aiDeliveryMode) setAiDeliveryMode(parsed.aiDeliveryMode);
            if (parsed.resendApiKey) setResendApiKey(parsed.resendApiKey);
            if (parsed.brevoApiKey) setBrevoApiKey(parsed.brevoApiKey);
            if (parsed.awsSesAccessKey) setAwsSesAccessKey(parsed.awsSesAccessKey);
            if (parsed.awsSesSecretKey) setAwsSesSecretKey(parsed.awsSesSecretKey);
            if (parsed.awsSesRegion) setAwsSesRegion(parsed.awsSesRegion);
          } catch {}
        }
      }
    }
  }, [activeTenant, user]);

  const populateProfileForm = useCallback((p: SenderProfileItem) => {
    setActiveProfileId(p.id.startsWith("prof_init_") ? p.id : p.id);
    setProfileName(p.profileName || "");
    setSmtpProvider(p.provider || "custom");
    setSmtpHost(p.host || "");
    setSmtpPort(p.port ? String(p.port) : "587");
    setSmtpEncryption(p.encryption || "tls");
    setSmtpFromEmail(p.fromEmail || "");
    setSmtpFromName(p.fromName || "");
    setSmtpUsername(p.username || "");
    setSmtpPassword(p.password || "");
    setSmtpHasPassword(Boolean(p.hasPassword || (p.password && p.password.length > 0)));
    setIsDefaultProfile(Boolean(p.isDefault));
    setSmtpTestStatus(null);
  }, []);

  const handleAddNewProfile = useCallback(() => {
    setSelectedProfileId("new");
    setActiveProfileId("");
    setProfileName("");
    setSmtpProvider("brevo");
    setSmtpHost("smtp-relay.brevo.com");
    setSmtpPort("587");
    setSmtpEncryption("tls");
    setSmtpFromEmail(ownerEmail || (activeTenant?.slug ? `notifications@${activeTenant.slug}.ofia.ng` : ""));
    setSmtpFromName(orgName ? `${orgName} Notifications` : "Workspace Admin");
    setSmtpUsername("");
    setSmtpPassword("");
    setSmtpHasPassword(false);
    setIsDefaultProfile(senderProfiles.length === 0);
    setSmtpTestStatus(null);
  }, [activeTenant?.slug, orgName, ownerEmail, senderProfiles.length]);

  const loadSenderProfiles = useCallback(async (tenantSlugToUse?: string, targetProfileId?: string) => {
    const targetSlug = tenantSlugToUse || activeTenant?.slug || slug;
    if (!targetSlug) return;
    setIsLoadingProfiles(true);
    try {
      const res = await fetch(`/api/erp/sender-profiles?tenant=${encodeURIComponent(targetSlug)}`);
      const data = await res.json();
      if (data.success) {
        const loaded: SenderProfileItem[] = Array.isArray(data.profiles) ? data.profiles : [];
        setSenderProfiles(loaded);

        if (loaded.length > 0) {
          const profileToSelect = targetProfileId || selectedProfileId;
          let current = loaded.find((p) => p.id === profileToSelect);
          if (!current && profileToSelect !== "new") {
            current = loaded.find((p) => p.isDefault) || loaded[0];
          }
          if (current) {
            setSelectedProfileId(current.id);
            populateProfileForm(current);
          }
        } else if (data.defaultSmtp?.host && data.defaultSmtp?.fromEmail) {
          const fallback: SenderProfileItem = {
            id: `prof_init_${targetSlug.replace(/[^a-zA-Z0-9]/g, "_")}`,
            profileName: `${(data.defaultSmtp.provider || "Primary").toUpperCase()} Relay`,
            provider: data.defaultSmtp.provider || "custom",
            host: data.defaultSmtp.host,
            port: data.defaultSmtp.port || 587,
            encryption: data.defaultSmtp.encryption || "tls",
            fromEmail: data.defaultSmtp.fromEmail,
            fromName: data.defaultSmtp.fromName || "Workspace Admin",
            username: data.defaultSmtp.username || "",
            password: data.defaultSmtp.password || "",
            hasPassword: data.defaultSmtp.hasPassword,
            isDefault: true,
          };
          setSenderProfiles([fallback]);
          setSelectedProfileId(fallback.id);
          populateProfileForm(fallback);
        } else {
          handleAddNewProfile();
        }
      }
    } catch (err) {
      console.warn("Failed to load sender profiles:", err);
    } finally {
      setIsLoadingProfiles(false);
    }
  }, [activeTenant?.slug, slug, selectedProfileId, populateProfileForm, handleAddNewProfile]);

  const loadByokFromDb = useCallback(async (targetSlug: string) => {
    if (!targetSlug) return;
    try {
      const res = await fetch(`/api/erp/byok?tenant=${encodeURIComponent(targetSlug)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.configured && data.settings) {
          const s = data.settings;
          if (s.anthropicKey) setAnthropicKey(s.anthropicKey);
          if (s.openaiKey) setOpenaiKey(s.openaiKey);
          if (s.geminiKey) setGeminiKey(s.geminiKey);
          if (s.whatsappKey) setWhatsappKey(s.whatsappKey);
          if (s.groqKey) setGroqKey(s.groqKey);
          if (s.deepseekKey) setDeepseekKey(s.deepseekKey);
          if (s.aiDeliveryMode) setAiDeliveryMode(s.aiDeliveryMode);
          if (s.resendApiKey) setResendApiKey(s.resendApiKey);
          if (s.brevoApiKey) setBrevoApiKey(s.brevoApiKey);
          if (s.awsSesAccessKey) setAwsSesAccessKey(s.awsSesAccessKey);
          if (s.awsSesSecretKey) setAwsSesSecretKey(s.awsSesSecretKey);
          if (s.awsSesRegion) setAwsSesRegion(s.awsSesRegion);
        }
        if (data.voiceConfig) {
          const vc = data.voiceConfig;
          if (vc.telephony_provider) setTelephonyProvider(vc.telephony_provider);
          if (vc.voicebip_api_key) setVoicebipApiKey(vc.voicebip_api_key);
          if (vc.voicebip_api_secret) setVoicebipApiSecret(vc.voicebip_api_secret);
          if (vc.voicebip_sip_endpoint) setVoicebipSipEndpoint(vc.voicebip_sip_endpoint);
          if (vc.from_phone_number) setTelephonyFromNumber(vc.from_phone_number);
          if (vc.telephony_account_sid) setTelephonyAccountSid(vc.telephony_account_sid);
          if (vc.telephony_auth_token) setTelephonyAuthToken(vc.telephony_auth_token);
          if (vc.termii_api_key) setTermiiApiKey(vc.termii_api_key);
          if (vc.agent_name) setVoiceAgentName(vc.agent_name);
          if (vc.voice_id) setVoiceAccent(vc.voice_id);
          if (vc.elevenlabs_api_key) setElevenLabsApiKey(vc.elevenlabs_api_key);
          if (vc.ai_disclosure_enabled !== undefined) setAiDisclosureEnabled(vc.ai_disclosure_enabled);
          if (vc.ai_disclosure_text) setAiDisclosureText(vc.ai_disclosure_text);
          if (vc.human_escalation_phone) setHumanEscalationNumber(vc.human_escalation_phone);
          if (vc.calling_hours_start) setCallingHoursStart(vc.calling_hours_start);
          if (vc.calling_hours_end) setCallingHoursEnd(vc.calling_hours_end);
          if (vc.max_duration_sec) setMaxCallDurationSec(vc.max_duration_sec);
          if (vc.max_retries) setMaxRetries(vc.max_retries);
          if (vc.auto_whatsapp_deck !== undefined) setAutoWhatsAppDeck(vc.auto_whatsapp_deck);
        }
      }
    } catch (err) {
      console.warn("Failed to load BYOK settings from database:", err);
    }
  }, []);

  // Load Sender Profiles and BYOK configurations on mount or slug change
  useEffect(() => {
    const targetSlug = activeTenant?.slug || slug;
    if (targetSlug) {
      loadSenderProfiles(targetSlug);
      loadByokFromDb(targetSlug);
    }
  }, [activeTenant?.slug, slug, loadSenderProfiles, loadByokFromDb]);

  const handleSelectProfile = (p: SenderProfileItem) => {
    setSelectedProfileId(p.id);
    populateProfileForm(p);
  };

  const handleProviderSelect = (prov: string) => {
    setSmtpProvider(prov);
    switch (prov) {
      case "brevo":
        setSmtpHost("smtp-relay.brevo.com");
        setSmtpPort("587");
        setSmtpEncryption("tls");
        break;
      case "hostinger":
        setSmtpHost("smtp.hostinger.com");
        setSmtpPort("465");
        setSmtpEncryption("ssl");
        break;
      case "gmail":
        setSmtpHost("smtp.gmail.com");
        setSmtpPort("587");
        setSmtpEncryption("tls");
        break;
      case "sendgrid":
        setSmtpHost("smtp.sendgrid.net");
        setSmtpPort("587");
        setSmtpEncryption("tls");
        setSmtpUsername("apikey");
        break;
      case "ses":
        setSmtpHost("email-smtp.us-east-1.amazonaws.com");
        setSmtpPort("587");
        setSmtpEncryption("tls");
        break;
      case "mailgun":
        setSmtpHost("smtp.mailgun.org");
        setSmtpPort("587");
        setSmtpEncryption("tls");
        break;
      case "outlook":
        setSmtpHost("smtp.office365.com");
        setSmtpPort("587");
        setSmtpEncryption("tls");
        break;
      case "resend":
        setSmtpHost("smtp.resend.com");
        setSmtpPort("465");
        setSmtpEncryption("ssl");
        setSmtpUsername("resend");
        break;
      case "zoho":
        setSmtpHost("smtp.zoho.com");
        setSmtpPort("465");
        setSmtpEncryption("ssl");
        break;
      default:
        break;
    }
  };

  const handleSaveSmtp = async () => {
    const currentSlug = activeTenant?.slug || slug;
    if (!currentSlug) {
      setSmtpTestStatus({ success: false, message: "Workspace slug not found. Please save workspace first." });
      return;
    }

    if (!smtpHost.trim() || !smtpFromEmail.trim()) {
      setSmtpTestStatus({ success: false, message: "Host and From Email are required." });
      return;
    }

    setIsSavingSmtp(true);
    setSmtpTestStatus(null);
    try {
      const res = await fetch("/api/erp/smtp-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: currentSlug,
          provider: smtpProvider,
          host: smtpHost.trim(),
          port: Number(smtpPort) || 587,
          encryption: smtpEncryption,
          fromEmail: smtpFromEmail.trim(),
          fromName: smtpFromName.trim() || orgName || "Workspace Admin",
          username: smtpUsername.trim() || smtpFromEmail.trim(),
          password: smtpPassword === "••••••••" ? "" : smtpPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save SMTP configuration");
      }

      setSmtpSaveSuccess(true);
      setSmtpHasPassword(Boolean(smtpPassword || smtpHasPassword));
      setTimeout(() => setSmtpSaveSuccess(false), 3500);
      await loadSenderProfiles(currentSlug);
    } catch (err: any) {
      setSmtpTestStatus({ success: false, message: err.message });
    } finally {
      setIsSavingSmtp(false);
    }
  };

  const handleSaveProfile = async () => {
    const currentSlug = activeTenant?.slug || slug;
    if (!currentSlug) {
      setSmtpTestStatus({ success: false, message: "Workspace slug not found. Please save workspace first." });
      return;
    }

    if (!smtpHost.trim() || !smtpFromEmail.trim()) {
      setSmtpTestStatus({ success: false, message: "SMTP Host and From Email (SE) are required." });
      return;
    }

    setIsSavingProfile(true);
    setSmtpTestStatus(null);
    try {
      const derivedName = profileName.trim() || `${smtpProvider.toUpperCase()} Profile (${smtpFromEmail.trim()})`;
      const res = await fetch("/api/erp/sender-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeProfileId || undefined,
          tenantSlug: currentSlug,
          profileName: derivedName,
          provider: smtpProvider,
          host: smtpHost.trim(),
          port: Number(smtpPort) || 587,
          encryption: smtpEncryption,
          fromEmail: smtpFromEmail.trim(),
          fromName: smtpFromName.trim() || orgName || "Workspace Admin",
          username: smtpUsername.trim() || smtpFromEmail.trim(),
          password: smtpPassword === "••••••••" ? "" : smtpPassword,
          isDefault: isDefaultProfile || senderProfiles.length === 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save sender profile");
      }

      setProfileSaveSuccess(true);
      setSmtpHasPassword(Boolean(smtpPassword || smtpHasPassword));
      setSmtpTestStatus({ success: true, message: `Sender profile "${derivedName}" saved successfully!` });
      setTimeout(() => setProfileSaveSuccess(false), 3500);

      const savedId = data.profile?.id;
      if (savedId) {
        setSelectedProfileId(savedId);
        setActiveProfileId(savedId);
      }
      await loadSenderProfiles(currentSlug, savedId);
    } catch (err: any) {
      setSmtpTestStatus({ success: false, message: err.message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSetDefaultProfile = async (p: SenderProfileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentSlug = activeTenant?.slug || slug;
    if (!currentSlug) return;

    try {
      const res = await fetch("/api/erp/sender-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...p,
          tenantSlug: currentSlug,
          isDefault: true,
        }),
      });
      if (res.ok) {
        setSmtpTestStatus({ success: true, message: `"${p.profileName}" is now the default sender profile.` });
        await loadSenderProfiles(currentSlug, p.id);
      }
    } catch (err) {
      console.warn("Failed to set default profile:", err);
    }
  };

  const handleDeleteProfile = async (id: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentSlug = activeTenant?.slug || slug;
    if (!currentSlug) return;
    if (!confirm(`Are you sure you want to delete profile "${title}"?`)) return;

    setIsDeletingProfile(id);
    try {
      const res = await fetch(`/api/erp/sender-profiles?tenant=${encodeURIComponent(currentSlug)}&id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setSmtpTestStatus({ success: true, message: `Sender profile "${title}" deleted successfully.` });
        await loadSenderProfiles(currentSlug);
      }
    } catch (err) {
      console.warn("Failed to delete sender profile:", err);
    } finally {
      setIsDeletingProfile(null);
    }
  };

  const handleTestSmtp = async () => {
    const currentSlug = activeTenant?.slug || slug;
    const recipient = smtpTestRecipient.trim() || ownerEmail || user?.email;
    if (!recipient) {
      setSmtpTestStatus({ success: false, message: "Please provide a valid test recipient email address." });
      return;
    }

    if (!smtpHost.trim() || !smtpFromEmail.trim()) {
      setSmtpTestStatus({ success: false, message: "Host and From Email must be provided before sending a test." });
      return;
    }

    setIsTestingSmtp(true);
    setSmtpTestStatus(null);
    try {
      const res = await fetch("/api/erp/smtp-settings/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantSlug: currentSlug,
          profileId: activeProfileId || undefined,
          testEmail: recipient,
          provider: smtpProvider,
          host: smtpHost.trim(),
          port: Number(smtpPort) || 587,
          encryption: smtpEncryption,
          fromEmail: smtpFromEmail.trim(),
          fromName: smtpFromName.trim() || orgName || "Workspace Admin",
          username: smtpUsername.trim() || smtpFromEmail.trim(),
          password: smtpPassword === "••••••••" ? "" : smtpPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "SMTP test failed");
      }

      setSmtpTestStatus({ success: true, message: data.message });
    } catch (err: any) {
      setSmtpTestStatus({ success: false, message: err.message });
    } finally {
      setIsTestingSmtp(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Image exceeds 2MB limit.");
      return;
    }

    try {
      setIsUploadingLogo(true);
      setErrorMessage("");

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Image = reader.result;

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image, tenantId: activeTenant?.slug || activeTenant?.id || "default" }),
        });

        const data = await res.json();
        if (res.ok) {
          setLogoUrl(data.url);
        } else {
          setErrorMessage(data.error || "Upload failed");
        }
        setIsUploadingLogo(false);
      };
    } catch (err: any) {
      setErrorMessage(err.message || "Upload failed");
      setIsUploadingLogo(false);
    }
  };

  const handleLoginImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage("Image exceeds 8MB limit.");
      return;
    }

    try {
      setIsUploadingLoginImage(true);
      setErrorMessage("");

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Image = reader.result;

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image, tenantId: activeTenant?.slug || activeTenant?.id || "default" }),
        });

        const data = await res.json();
        if (res.ok) {
          setLoginImageUrl(data.url);
        } else {
          setErrorMessage(data.error || "Upload failed");
        }
        setIsUploadingLoginImage(false);
      };
    } catch (err: any) {
      setErrorMessage(err.message || "Upload failed");
      setIsUploadingLoginImage(false);
    }
  };

  const handleSave = async () => {
    const targetIdentifier = activeTenant?.id || activeTenant?.slug || slug || "org-01";

    try {
      setIsSaving(true);
      setErrorMessage("");

      const payload = {
        name: orgName,
        slug: slug,
        domain: customDomain,
        logo: logoUrl,
        favicon: logoUrl,
        loginImage: loginImageUrl,
        login_image: loginImageUrl,
        loginBgUrl: loginImageUrl,
        backgroundImage: loginImageUrl,
        heroTitle: heroTitle,
        hero_title: heroTitle,
        heroSubtitle: heroSubtitle,
        hero_subtitle: heroSubtitle,
        primaryColor: primaryColor,
        secondaryColor: secondaryColor,
        ownerName: ownerName,
        owner_name: ownerName,
        adminName: ownerName,
        admin_name: ownerName,
        ownerEmail: ownerEmail,
        owner_email: ownerEmail,
        adminEmail: ownerEmail,
        admin_email: ownerEmail,
        erpEnabled: erpExt,
        erp_enabled: erpExt,
        shopEnabled: shopExt,
        shop_enabled: shopExt,
      };

      // 1. Persist to localStorage directly under multiple keys for instant, permanent access
      if (typeof window !== "undefined") {
        if (orgName) {
          localStorage.setItem("tenant_name_" + slug, orgName);
          if (activeTenant?.id) localStorage.setItem("tenant_name_" + activeTenant.id, orgName);
          if (activeTenant?.slug) localStorage.setItem("tenant_name_" + activeTenant.slug, orgName);
          localStorage.setItem("nexa_tenant_name", orgName);
        }

        if (logoUrl) {
          localStorage.setItem("tenant_logo_" + slug, logoUrl);
          if (activeTenant?.id) localStorage.setItem("tenant_logo_" + activeTenant.id, logoUrl);
          if (activeTenant?.slug) localStorage.setItem("tenant_logo_" + activeTenant.slug, logoUrl);
          localStorage.setItem("nexa_tenant_logo", logoUrl);
        }

        if (loginImageUrl) {
          localStorage.setItem("tenant_login_image_" + slug, loginImageUrl);
          if (activeTenant?.id) localStorage.setItem("tenant_login_image_" + activeTenant.id, loginImageUrl);
          if (activeTenant?.slug) localStorage.setItem("tenant_login_image_" + activeTenant.slug, loginImageUrl);
          localStorage.setItem("nexa_tenant_login_image", loginImageUrl);
        }

        if (heroTitle) {
          localStorage.setItem("tenant_hero_title_" + slug, heroTitle);
          if (activeTenant?.id) localStorage.setItem("tenant_hero_title_" + activeTenant.id, heroTitle);
          if (activeTenant?.slug) localStorage.setItem("tenant_hero_title_" + activeTenant.slug, heroTitle);
          localStorage.setItem("nexa_tenant_hero_title", heroTitle);
        }

        if (heroSubtitle) {
          localStorage.setItem("tenant_hero_subtitle_" + slug, heroSubtitle);
          if (activeTenant?.id) localStorage.setItem("tenant_hero_subtitle_" + activeTenant.id, heroSubtitle);
          if (activeTenant?.slug) localStorage.setItem("tenant_hero_subtitle_" + activeTenant.slug, heroSubtitle);
          localStorage.setItem("nexa_tenant_hero_subtitle", heroSubtitle);
        }

        if (primaryColor) {
          localStorage.setItem("tenant_primary_color_" + slug, primaryColor);
          if (activeTenant?.id) localStorage.setItem("tenant_primary_color_" + activeTenant.id, primaryColor);
          if (activeTenant?.slug) localStorage.setItem("tenant_primary_color_" + activeTenant.slug, primaryColor);
          localStorage.setItem("nexa_tenant_primary_color", primaryColor);
        }

        if (secondaryColor) {
          localStorage.setItem("tenant_secondary_color_" + slug, secondaryColor);
          if (activeTenant?.id) localStorage.setItem("tenant_secondary_color_" + activeTenant.id, secondaryColor);
          if (activeTenant?.slug) localStorage.setItem("tenant_secondary_color_" + activeTenant.slug, secondaryColor);
          localStorage.setItem("nexa_tenant_secondary_color", secondaryColor);
        }

        if (slug) {
          localStorage.setItem("nexa_tenant_slug", slug);
          localStorage.setItem("tenant_slug", slug);
          localStorage.setItem("nexa_org_id", slug);
        }

        // Immediately apply branding to the active document without needing a refresh
        applyTenantBranding({
          ...activeTenant,
          logo: logoUrl,
          favicon: logoUrl,
          loginImage: loginImageUrl,
          primaryColor,
          secondaryColor,
        });

        if (ownerName) {
          localStorage.setItem("nexa_user_name", ownerName);
          if (slug) localStorage.setItem("tenant_admin_name_" + slug, ownerName);
          if (activeTenant?.id) localStorage.setItem("tenant_admin_name_" + activeTenant.id, ownerName);
          if (activeTenant?.slug) localStorage.setItem("tenant_admin_name_" + activeTenant.slug, ownerName);
          document.cookie = `nexa_user_name=${encodeURIComponent(ownerName)}; path=/; max-age=2592000; SameSite=Lax`;

          const stored = localStorage.getItem("erp_current_user");
          if (stored) {
            try {
              const u = JSON.parse(stored);
              localStorage.setItem(
                "erp_current_user",
                JSON.stringify({
                  ...u,
                  name: ownerName,
                  email: ownerEmail || u.email,
                })
              );
            } catch {}
          }
        }

        if (ownerEmail) {
          localStorage.setItem("nexa_user_email", ownerEmail);
          if (slug) localStorage.setItem("tenant_admin_email_" + slug, ownerEmail);
          if (activeTenant?.id) localStorage.setItem("tenant_admin_email_" + activeTenant.id, ownerEmail);
          if (activeTenant?.slug) localStorage.setItem("tenant_admin_email_" + activeTenant.slug, ownerEmail);
          document.cookie = `nexa_user_email=${encodeURIComponent(ownerEmail)}; path=/; max-age=2592000; SameSite=Lax`;
        }
      }

      // 2. Send PUT request to API
      let saveError = "";
      try {
        const res = await fetch(`/api/organizations/${encodeURIComponent(targetIdentifier)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const postRes = await fetch("/api/organizations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, id: targetIdentifier }),
          });
          if (!postRes.ok) {
            const errData = await postRes.json().catch(() => null);
            saveError = errData?.error || "Failed to persist workspace settings to database";
          }
        }
      } catch (reqErr: any) {
        console.warn("API organization update error:", reqErr);
      }

      if (saveError) {
        setErrorMessage(saveError);
      } else {
        setErrorMessage("");
      }

      // 3. Update activeTenant reference immediately
      if (activeTenant) {
        activeTenant.name = orgName;
        activeTenant.slug = slug;
        activeTenant.domain = customDomain;
        activeTenant.logo = logoUrl;
        activeTenant.favicon = logoUrl;
        activeTenant.loginImage = loginImageUrl;
        activeTenant.primaryColor = primaryColor;
        activeTenant.secondaryColor = secondaryColor;
        activeTenant.ownerName = ownerName;
        activeTenant.ownerEmail = ownerEmail;
        activeTenant.erpEnabled = erpExt;
        activeTenant.shopEnabled = shopExt;
      }

      // 4. Update ERP staff users table in Postgres
      if (ownerName && (slug || activeTenant?.slug)) {
        try {
          await fetch("/api/erp/users", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-tenant-slug": slug || activeTenant?.slug || "",
            },
            body: JSON.stringify({
              id: user?.id || "USR-001",
              name: ownerName,
              email: ownerEmail || user?.email || "admin@ofia.ng",
              role: "admin",
              department: "Executive Directorate",
              designation: "Executive Director & Workspace Admin",
              company: orgName || activeTenant?.name,
              location: "Lagos, Nigeria",
            }),
          });
        } catch (erpErr) {
          console.warn("ERP staff sync:", erpErr);
        }
      }

      // 5. Update SMTP configuration if provided
      if (smtpHost.trim() && smtpFromEmail.trim() && targetIdentifier) {
        try {
          await fetch("/api/erp/smtp-settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              tenantSlug: targetIdentifier,
              provider: smtpProvider,
              host: smtpHost.trim(),
              port: Number(smtpPort) || 587,
              encryption: smtpEncryption,
              fromEmail: smtpFromEmail.trim(),
              fromName: smtpFromName.trim() || orgName || "Workspace Admin",
              username: smtpUsername.trim() || smtpFromEmail.trim(),
              password: smtpPassword === "••••••••" ? "" : smtpPassword,
            }),
          });
        } catch (smtpErr) {
          console.warn("SMTP save on tenant update:", smtpErr);
        }
      }

      // 6. Save BYOK and AI Outreach configuration directly to Neon Database
      const byokPayload = {
        tenantSlug: targetIdentifier,
        anthropicKey,
        openaiKey,
        geminiKey,
        whatsappKey,
        groqKey,
        deepseekKey,
        aiDeliveryMode,
        resendApiKey,
        brevoApiKey,
        awsSesAccessKey,
        awsSesSecretKey,
        awsSesRegion,
        voiceConfig: {
          telephony_provider: telephonyProvider,
          voicebip_api_key: voicebipApiKey,
          voicebip_api_secret: voicebipApiSecret,
          voicebip_sip_endpoint: voicebipSipEndpoint,
          from_phone_number: telephonyFromNumber,
          telephony_account_sid: telephonyAccountSid,
          telephony_auth_token: telephonyAuthToken,
          termii_api_key: termiiApiKey,
          agent_name: voiceAgentName,
          voice_id: voiceAccent,
          elevenlabs_api_key: elevenLabsApiKey,
          ai_disclosure_enabled: aiDisclosureEnabled,
          ai_disclosure_text: aiDisclosureText,
          human_escalation_phone: humanEscalationNumber,
          calling_hours_start: callingHoursStart,
          calling_hours_end: callingHoursEnd,
          max_duration_sec: maxCallDurationSec,
          max_retries: maxRetries,
          auto_whatsapp_deck: autoWhatsAppDeck,
        },
      };

      try {
        await fetch("/api/erp/byok", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(byokPayload),
        });
      } catch (byokErr) {
        console.warn("Database BYOK save warning:", byokErr);
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("tenant_byok_" + targetIdentifier, JSON.stringify(byokPayload));
        if (activeTenant?.id) localStorage.setItem("tenant_byok_" + activeTenant.id, JSON.stringify(byokPayload));
        if (activeTenant?.slug) localStorage.setItem("tenant_byok_" + activeTenant.slug, JSON.stringify(byokPayload));
      }

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
      reloadTenants();
    } catch (err: any) {
      console.warn("Save tenant notification:", err);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ErpAdminShell
      title="Workspace Settings & Tenant Profile"
      subtitle="Manage organization branding, admin contact details, domain DNS routing, and modular extensions."
      action={
        <NexaButton
          size="sm"
          variant="primary"
          onClick={handleSave}
          disabled={isSaving || isLoading}
          leftIcon={isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          className="bg-[#1A56DB] text-white hover:bg-[#1545B0] rounded-full font-bold shadow-xs"
        >
          {isSaving ? "Saving..." : isSaved ? "Saved Successfully!" : "Save Changes"}
        </NexaButton>
      }
    >
      <div className="space-y-6 max-w-4xl font-sans">
        {isSaved && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Workspace details saved successfully to the database.
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage("")}
              className="text-xs text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* WORKSPACE SETTINGS NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] shadow-xs">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "profile"
                ? "bg-[#1A56DB] text-white shadow-md shadow-[#1A56DB]/20"
                : "text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)]"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Profile & Branding</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("domain")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "domain"
                ? "bg-[#1A56DB] text-white shadow-md shadow-[#1A56DB]/20"
                : "text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)]"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Custom Domain</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("smtp")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "smtp"
                ? "bg-[#1A56DB] text-white shadow-md shadow-[#1A56DB]/20"
                : "text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)]"
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>SMTP Email Relay</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ai_byok")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === "ai_byok"
                ? "bg-[#7E22CE] text-white shadow-md shadow-[#7E22CE]/20"
                : "text-[var(--nexa-text-secondary)] hover:text-[var(--nexa-text-primary)] hover:bg-[var(--nexa-bg-base)]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ofia AI & BYOK Keys</span>
            <NexaBadge variant="purple">AI Vault</NexaBadge>
          </button>
        </div>

        {/* TAB 1: PROFILE, BRANDING & EXTENSIONS */}
        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in">
        {/* ORGANIZATION BRANDING & SUBDOMAIN */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#1A56DB]" />
              Organization Profile & Subdomain
            </h3>
            <NexaBadge variant="brand">{activeTenant?.slug || "Active Tenant"}</NexaBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g. Acme Logistics Ltd"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Tenant Slug Identifier
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. acme"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-mono"
              />
              <span className="text-[10px] text-[var(--nexa-text-muted)]">
                Determines {slug || "tenant"}.ofia.ng and custom domain routing.
              </span>
            </div>
          </div>

          {/* WORKSPACE LOGIN URL DISPLAY */}
          <div className="mt-2 p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#1A56DB]/10 text-[#1A56DB] flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--nexa-text-primary)]">Workspace Login Page URL:</span>
                <p className="text-[11px] font-mono text-[#1A56DB] font-semibold">
                  {customDomain
                    ? (customDomain.startsWith("http") ? `${customDomain}/login` : `https://${customDomain}/login`)
                    : `https://${slug || activeTenant?.slug || "tenant"}.ofia.ng/login`}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                const url = customDomain
                  ? (customDomain.startsWith("http") ? `${customDomain}/login` : `https://${customDomain}/login`)
                  : `https://${slug || activeTenant?.slug || "tenant"}.ofia.ng/login`;
                navigator.clipboard.writeText(url);
                alert("Login URL copied to clipboard: " + url);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-black/30 border border-[var(--nexa-border)] hover:bg-[#1A56DB] hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Login URL</span>
            </button>
          </div>
        </NexaCard>

                {/* WORKSPACE BRANDING */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#F59E0B]" />
              Workspace Branding
            </h3>
            <NexaBadge variant="amber">Design</NexaBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Tenant Logo & Favicon
              </label>
              <div className="border-2 border-dashed border-[var(--nexa-border)] rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-[var(--nexa-bg-base)]/50 transition-colors cursor-pointer group h-[190px] relative">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/svg+xml" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleLogoUpload}
                  disabled={isUploadingLogo}
                />
                <div className="w-16 h-16 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  {isUploadingLogo ? (
                    <RefreshCw className="w-6 h-6 text-[var(--nexa-text-muted)] animate-spin" />
                  ) : logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-[var(--nexa-text-muted)]" />
                  )}
                </div>
                <h4 className="text-xs font-bold text-[var(--nexa-text-primary)] mb-1">Upload Workspace Logo</h4>
                <p className="text-[10px] text-[var(--nexa-text-muted)] max-w-[250px]">
                  PNG, JPG or SVG. This image will automatically be used as your browser favicon.
                </p>
                <div className="mt-3 bg-[#1A56DB] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 group-hover:bg-blue-700 transition-colors">
                  {isUploadingLogo ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} 
                  {isUploadingLogo ? "Uploading..." : "Select File"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center justify-between">
                <span>Login Image Wallpaper</span>
                <span className="text-[10px] text-[var(--nexa-text-muted)] font-normal">Under login form</span>
              </label>
              <div className="border-2 border-dashed border-[var(--nexa-border)] rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-[var(--nexa-bg-base)]/50 transition-colors cursor-pointer group h-[190px] relative overflow-hidden">
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg, image/webp" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleLoginImageUpload}
                  disabled={isUploadingLoginImage}
                />
                {loginImageUrl ? (
                  <div className="relative w-full h-full flex flex-col items-center justify-center">
                    <img 
                      src={loginImageUrl} 
                      alt="Login Background" 
                      className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-60 group-hover:opacity-40 transition-opacity" 
                    />
                    <div className="relative z-10 flex flex-col items-center bg-black/60 backdrop-blur-xs px-3 py-2 rounded-xl border border-white/20">
                      <ImageIcon className="w-5 h-5 text-white mb-1" />
                      <span className="text-[11px] font-bold text-white">Change Login Image</span>
                      <span className="text-[9px] text-white/70">Displayed under workspace login</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      {isUploadingLoginImage ? (
                        <RefreshCw className="w-6 h-6 text-[var(--nexa-text-muted)] animate-spin" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-[var(--nexa-text-muted)]" />
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-[var(--nexa-text-primary)] mb-1">Upload Login Image</h4>
                    <p className="text-[10px] text-[var(--nexa-text-muted)] max-w-[250px]">
                      JPG, PNG or WebP. Appears dynamically under the workspace login form.
                    </p>
                    <div className="mt-3 bg-[#1A56DB] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1.5 group-hover:bg-blue-700 transition-colors">
                      {isUploadingLoginImage ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />} 
                      {isUploadingLoginImage ? "Uploading..." : "Select File"}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--nexa-border)]">
            <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-bold text-[var(--nexa-text-primary)]">Primary Color</div>
                <div className="text-[10px] text-[var(--nexa-text-muted)]">Main buttons and active states</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[var(--nexa-text-muted)] uppercase">{primaryColor}</span>
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-xs font-bold text-[var(--nexa-text-primary)]">Secondary Color</div>
                <div className="text-[10px] text-[var(--nexa-text-muted)]">Badges, highlights, and success states</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[var(--nexa-text-muted)] uppercase">{secondaryColor}</span>
                <input type="color" value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent" />
              </div>
            </div>
          </div>
        </NexaCard>

        {/* LOGIN PAGE HERO MESSAGING (CUSTOMIZABLE PER TENANT) */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1A56DB]" />
              Login Page Hero Messaging
            </h3>
            <NexaBadge variant="brand">Split-Screen</NexaBadge>
          </div>

          <p className="text-xs text-[var(--nexa-text-muted)] leading-relaxed">
            Customize the hero headline and subtitle displayed on the left half of your tenant&apos;s split-screen login page (<code className="font-mono text-[11px] text-[#1A56DB]">{slug || "tenant"}.ofia.ng/login</code>).
          </p>

          <div className="space-y-4 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Hero Headline
              </label>
              <input
                type="text"
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="e.g. Powering next-generation transport, logistics & fleet intelligence."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-semibold"
              />
              <span className="text-[10px] text-[var(--nexa-text-muted)]">
                Main bold headline on the left side over your wallpaper.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Hero Subtext / Paragraph
              </label>
              <textarea
                rows={3}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="e.g. Real-time zonal dispatch, fleet telemetry, manifest auditing, and ledger reconciliation in one synchronized ecosystem."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] leading-relaxed resize-none"
              />
              <span className="text-[10px] text-[var(--nexa-text-muted)]">
                Descriptive tagline explaining your enterprise value propositions.
              </span>
            </div>
          </div>
        </NexaCard>

        {/* TENANT ADMIN OWNER CONTACT */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-500" />
              Tenant Primary Admin Contact
            </h3>
            <NexaBadge variant="green">Admin</NexaBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Admin Full Name
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Samuel Ade"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Admin Email Address
              </label>
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="e.g. admin@organization.com"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
              />
            </div>
          </div>
        </NexaCard>

        {/* MODULAR EXTENSIONS TOGGLES */}
        <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
          <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
            <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0E9F6E]" />
              Modular Tenant Extensions
            </h3>
            <NexaBadge variant="green">Active</NexaBadge>
          </div>

          <div className="space-y-3 text-xs">
            {/* ERP EXT */}
            <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-[var(--nexa-text-primary)]">
                  <span>Enterprise ERP Suite (`erp_ext`)</span>
                  <NexaBadge variant="purple" className="text-[9px]">Internal</NexaBadge>
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Enables Admin AI Swarm, Accountant General Ledger, HR Appraisal Cycles, and Operations Desks.
                </p>
              </div>
              <button
                onClick={() => setErpExt(!erpExt)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  erpExt ? "bg-[#1A56DB]" : "bg-neutral-300 dark:bg-neutral-700"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    erpExt ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>

            {/* SHOP FRONT EXT */}
            <div className="p-3.5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-[var(--nexa-text-primary)]">
                  <span>Digital Shopfront (`shop_front_ext`)</span>
                  <NexaBadge variant="green" className="text-[9px]">Public</NexaBadge>
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Serves public customer-facing storefront and booking engine on your domain.
                </p>
              </div>
              <button
                onClick={() => setShopExt(!shopExt)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  shopExt ? "bg-[#0E9F6E]" : "bg-neutral-300 dark:bg-neutral-700"
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    shopExt ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--nexa-text-muted)]">
              All branding and module extensions persist directly to your PostgreSQL workspace record.
            </span>
            <NexaButton
              size="sm"
              variant="primary"
              onClick={handleSave}
              disabled={isSaving || isLoading}
              leftIcon={isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              className="bg-[#1A56DB] text-white hover:bg-[#1545B0] rounded-xl font-bold shadow-xs px-4 py-2"
            >
              {isSaving ? "Saving..." : isSaved ? "Saved Successfully!" : "Save Profile & Extensions"}
            </NexaButton>
          </div>
        </NexaCard>
          </div>
        )}

        {/* TAB 2: CUSTOM DOMAIN ROUTING */}
        {activeTab === "domain" && (
          <div className="space-y-6 animate-in fade-in">
            {/* CUSTOM DOMAIN DNS */}
            <NexaCard variant="glass" padding="lg" className="space-y-4 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
              <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
                <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#9061F9]" />
                  Custom Domain Routing
                </h3>
                <div className="flex items-center gap-2">
                  {dnsVerified === true && (
                    <NexaBadge variant="green">
                      <CheckCircle2 className="w-3 h-3 inline mr-1" />
                      CNAME Validated
                    </NexaBadge>
                  )}
                  {dnsVerified === false && (
                    <NexaBadge variant="amber">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      Pending Propagation
                    </NexaBadge>
                  )}
                  {dnsVerified === null && (
                    <NexaBadge variant="neutral">
                      <Globe className="w-3 h-3 inline mr-1" />
                      DNS Unverified
                    </NexaBadge>
                  )}
                  <button
                    type="button"
                    onClick={() => handleVerifyDns()}
                    disabled={isCheckingDns || !customDomain}
                    className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] hover:bg-[var(--nexa-border)] text-[var(--nexa-text-primary)] cursor-pointer flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isCheckingDns ? "animate-spin" : ""}`} />
                    {isCheckingDns ? "Checking..." : "Verify DNS"}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Custom Domain Host
                  </label>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => {
                      setCustomDomain(e.target.value);
                      setDnsVerified(null);
                      setDnsMessage("");
                    }}
                    placeholder="e.g. portal.organization.com"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                  />
                  <span className="text-[10px] text-[var(--nexa-text-muted)]">
                    Point your DNS CNAME record to `cname.ofia.ng` to serve your branded ERP portal.
                  </span>
                  {dnsMessage && (
                    <p className={`text-[11px] font-medium pt-1 ${dnsVerified ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                      {dnsMessage}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--nexa-text-muted)]">
                  Custom domain configuration is stored in PostgreSQL and synced to the routing mesh.
                </span>
                <NexaButton
                  size="sm"
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSaving || isLoading}
                  leftIcon={isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  className="bg-[#1A56DB] text-white hover:bg-[#1545B0] rounded-xl font-bold shadow-xs px-4 py-2"
                >
                  {isSaving ? "Saving..." : isSaved ? "Saved Successfully!" : "Save Domain Settings"}
                </NexaButton>
              </div>
            </NexaCard>
          </div>
        )}

        {/* TAB 3: SMTP EMAIL RELAY & MULTI-SENDER PROFILES */}
        {activeTab === "smtp" && (
          <div className="space-y-6 animate-in fade-in">
        <NexaCard variant="glass" padding="lg" className="space-y-5 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--nexa-border)] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#1A56DB] flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[var(--nexa-text-primary)]">
                  Outbound Sender Profiles & Domains
                </h3>
                <p className="text-[11px] text-[var(--nexa-text-muted)]">
                  Configure multiple sending identities, distinct From Email addresses, and sender display names for different departments (marketing, support, admissions, billing, etc.).
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddNewProfile}
              className="px-3.5 py-1.5 rounded-xl bg-[#1A56DB] hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 self-start sm:self-auto shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Sender Profile
            </button>
          </div>

          {/* SENDER PROFILES LIST */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-2">
                <span>Configured Profiles</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-mono font-semibold">
                  {senderProfiles.length} configured
                </span>
              </label>
              <button
                type="button"
                onClick={handleAddNewProfile}
                className="text-xs font-bold text-[#1A56DB] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add New Profile
              </button>
            </div>

            {senderProfiles.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-[var(--nexa-border)] text-center space-y-2 bg-[var(--nexa-bg-base)]">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 text-[#1A56DB] flex items-center justify-center mx-auto">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-[var(--nexa-text-primary)]">No Sender Profiles Configured</div>
                <p className="text-[11px] text-[var(--nexa-text-muted)] max-w-md mx-auto">
                  Add your first outbound profile to send email blasts, customer notifications, and automated alerts under your verified domain.
                </p>
                <button
                  type="button"
                  onClick={handleAddNewProfile}
                  className="mt-2 px-3 py-1.5 rounded-xl bg-[#1A56DB] text-white text-xs font-bold cursor-pointer"
                >
                  Create Sender Profile
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {senderProfiles.map((p) => {
                  const isSelected = selectedProfileId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectProfile(p)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between gap-3 ${
                        isSelected
                          ? "bg-[#1A56DB]/5 border-[#1A56DB] shadow-xs ring-1 ring-[#1A56DB]"
                          : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] hover:border-slate-400 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[var(--nexa-text-primary)]">{p.profileName}</span>
                            {p.isDefault && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-medium text-[var(--nexa-text-secondary)]">
                            {p.fromName ? `${p.fromName} <${p.fromEmail}>` : p.fromEmail}
                          </div>
                        </div>

                        <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 border border-blue-500/20 shrink-0">
                          {p.provider}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[var(--nexa-border)] text-[10px] text-[var(--nexa-text-muted)] font-mono">
                        <span className="truncate max-w-[180px]">{p.host}:{p.port} ({p.encryption.toUpperCase()})</span>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          {!p.isDefault && (
                            <button
                              type="button"
                              onClick={(e) => handleSetDefaultProfile(p, e)}
                              className="text-[10px] text-amber-600 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Star className="w-2.5 h-2.5" />
                              Set Default
                            </button>
                          )}
                          {senderProfiles.length > 1 && (
                            <button
                              type="button"
                              disabled={isDeletingProfile === p.id}
                              onClick={(e) => handleDeleteProfile(p.id, p.profileName, e)}
                              className="text-rose-500 hover:text-rose-700 p-1 rounded hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                              title="Delete profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PROFILE EDITOR FORM */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--nexa-border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#1A56DB]" />
                <h4 className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  {selectedProfileId === "new"
                    ? "Add New Outbound Sender Profile"
                    : `Editing Profile: ${profileName || "Sender Profile"}`}
                </h4>
              </div>
              {selectedProfileId !== "new" && (
                <button
                  type="button"
                  onClick={handleAddNewProfile}
                  className="text-[11px] font-bold text-[#1A56DB] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Create Another Profile
                </button>
              )}
            </div>

            {/* IDENTITY FIELDS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Profile Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="e.g. Ofia Enterprise Growth, ResultsPro Support"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                />
                <span className="text-[10px] text-[var(--nexa-text-muted)]">Internal label in dropdowns</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Sender Display Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={smtpFromName}
                  onChange={(e) => setSmtpFromName(e.target.value)}
                  placeholder="e.g. ResultsPro Educational Support, Ofia Enterprise Growth"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                />
                <span className="text-[10px] text-[var(--nexa-text-muted)]">Visible name in recipients' inbox</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  From Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={smtpFromEmail}
                  onChange={(e) => setSmtpFromEmail(e.target.value)}
                  placeholder="e.g. noreply@resultspro.ng, growth@ofia.ng"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                />
                <span className="text-[10px] text-[var(--nexa-text-muted)]">Sending mailbox address</span>
              </div>
            </div>

            {/* DEFAULT PROFILE TOGGLE */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isDefaultProfileCheck"
                checked={isDefaultProfile}
                onChange={(e) => setIsDefaultProfile(e.target.checked)}
                className="rounded border-[var(--nexa-border)] text-[#1A56DB] focus:ring-[#1A56DB] cursor-pointer"
              />
              <label htmlFor="isDefaultProfileCheck" className="text-xs font-semibold text-[var(--nexa-text-primary)] cursor-pointer">
                Set as default sender profile for workspace email blasts and notifications
              </label>
            </div>

            {/* PROVIDER PRESETS */}
            <div className="space-y-2 pt-2 border-t border-[var(--nexa-border)]">
              <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center justify-between">
                <span>Email Provider Preset</span>
                <span className="text-[10px] text-[var(--nexa-text-muted)]">Select provider to auto-fill host & ports</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {[
                  { id: "brevo", label: "Brevo (Sendinblue)", desc: "smtp-relay.brevo.com" },
                  { id: "hostinger", label: "Hostinger", desc: "smtp.hostinger.com" },
                  { id: "custom", label: "Custom SMTP", desc: "Your mail server" },
                  { id: "gmail", label: "Google / Gmail", desc: "App Password req." },
                  { id: "sendgrid", label: "SendGrid", desc: "API key auth" },
                  { id: "ses", label: "Amazon SES", desc: "AWS SES SMTP" },
                  { id: "mailgun", label: "Mailgun", desc: "Domain credentials" },
                  { id: "outlook", label: "Microsoft 365", desc: "Office 365 SMTP" },
                  { id: "resend", label: "Resend", desc: "Modern developer API" },
                  { id: "zoho", label: "Zoho Mail", desc: "Zoho corporate" },
                ].map((p) => {
                  const isSelected = smtpProvider === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleProviderSelect(p.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#1A56DB]/10 border-[#1A56DB] text-[#1A56DB] font-bold shadow-xs"
                          : "bg-[var(--nexa-bg-surface)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-slate-400 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="text-xs font-bold truncate">{p.label}</div>
                      <div className="text-[10px] text-[var(--nexa-text-muted)] truncate">{p.desc}</div>
                    </button>
                  );
                })}
              </div>

              {smtpProvider === "brevo" && (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-700 dark:text-blue-300 flex items-center justify-between">
                    <div>
                      <span className="font-bold">Brevo Relay:</span> Use your Brevo login email as SMTP Username, Port 587 (TLS), and your Brevo SMTP Master Key.
                    </div>
                    <a
                      href="https://app.brevo.com/settings/keys/smtp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-[#1A56DB] text-white hover:bg-[#1A56DB]/90 flex items-center gap-1 shrink-0 ml-3 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Brevo Dashboard
                    </a>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        Brevo Open &amp; Click Tracking Webhook:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const hookUrl = `https://${slug || activeTenant?.slug || "your-workspace"}.ofia.ng/api/erp/crm/webhooks/brevo`;
                          navigator.clipboard.writeText(hookUrl);
                          alert("Webhook URL copied to clipboard: " + hookUrl);
                        }}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        Copy Webhook URL
                      </button>
                    </div>
                    <div className="font-mono text-[11px] bg-white/70 dark:bg-black/30 px-2 py-1 rounded border border-emerald-500/20 truncate">
                      https://{slug || activeTenant?.slug || "your-workspace"}.ofia.ng/api/erp/crm/webhooks/brevo
                    </div>
                    <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
                      In Brevo &rarr; Settings &rarr; Webhooks: Add this URL and select <strong>Opens</strong>, <strong>Clicks</strong>, <strong>Bounces</strong>, and <strong>Unsubscribes</strong> to automatically sync live engagement to your CRM.
                    </p>
                  </div>
                </div>
              )}

              {smtpProvider === "hostinger" && (
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-700 dark:text-purple-300 flex items-center justify-between">
                  <div>
                    <span className="font-bold">Hostinger Mail Relay:</span> Use your full email address (e.g. noreply@yourdomain.com) as SMTP Username, Port 465 (SSL), and mailbox password.
                  </div>
                </div>
              )}
            </div>

            {/* SMTP SERVER CREDENTIALS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  SMTP Server / Host <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  placeholder="e.g. smtp.hostinger.com, smtp-relay.brevo.com"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  SMTP Port <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(e.target.value)}
                  placeholder="587"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  Security / Encryption
                </label>
                <select
                  value={smtpEncryption}
                  onChange={(e) => setSmtpEncryption(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] cursor-pointer"
                >
                  <option value="tls">STARTTLS / TLS (Port 587 recommended)</option>
                  <option value="ssl">SSL / SMTPS (Port 465)</option>
                  <option value="none">None (Port 25 - unencrypted)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                  SMTP Username
                </label>
                <input
                  type="text"
                  value={smtpUsername}
                  onChange={(e) => setSmtpUsername(e.target.value)}
                  placeholder="Username or email address"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    SMTP Password / App Key
                  </label>
                  {smtpHasPassword && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Password saved
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    placeholder={smtpHasPassword ? "•••••••• (Leave blank to keep current)" : "Enter password or App Key"}
                    className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] transition-colors cursor-pointer z-10 p-1"
                    title={showPassword ? "Hide password" : "Show password"}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* TEST CONNECTION & SAVE PROFILE ACTIONS */}
            <div className="pt-3 border-t border-[var(--nexa-border)] space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--nexa-bg-surface)] p-3 rounded-xl border border-[var(--nexa-border)]">
                <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="email"
                    value={smtpTestRecipient}
                    onChange={(e) => setSmtpTestRecipient(e.target.value)}
                    placeholder={ownerEmail || user?.email || "Recipient email for test..."}
                    className="px-3 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] flex-1 min-w-[200px]"
                  />
                  <button
                    type="button"
                    onClick={handleTestSmtp}
                    disabled={isTestingSmtp}
                    className="px-3.5 py-2 text-xs font-bold rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--nexa-text-primary)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isTestingSmtp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 text-blue-600" />
                        Send Test Email
                      </>
                    )}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#1A56DB] hover:bg-blue-700 text-white flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : profileSaveSuccess ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      {selectedProfileId === "new" ? "Save New Profile" : "Update Profile"}
                    </>
                  )}
                </button>
              </div>

              {/* STATUS NOTIFICATIONS */}
              {smtpTestStatus && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border shadow-xs ${
                    smtpTestStatus.success
                      ? "bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-950 dark:text-emerald-100 dark:border-emerald-500 font-semibold"
                      : "bg-rose-100 text-rose-950 border-rose-400 dark:bg-rose-950 dark:text-rose-100 dark:border-rose-500 font-semibold"
                  }`}
                >
                  {smtpTestStatus.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-800 dark:text-emerald-300 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-800 dark:text-rose-300 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span>{smtpTestStatus.message}</span>
                    {smtpTestStatus.success && (
                      <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-normal mt-0.5">
                        Note: If the email does not show up in your Primary Inbox, please check your Spam or Junk folder.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </NexaCard>
          </div>
        )}

        {/* TAB 4: OFIA AI OUTREACH & BYOK MODEL GATEWAY VAULT */}
        {activeTab === "ai_byok" && (
          <div className="space-y-6 animate-in fade-in">
            {/* BYOK MODEL KEYS VAULT */}
            <NexaCard variant="glass" padding="lg" className="space-y-5 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--nexa-border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-[#7E22CE] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                      Bring-Your-Own-Key (BYOK) AI Model Vault
                      <NexaBadge variant="purple">AES-256 Encrypted</NexaBadge>
                    </h3>
                    <p className="text-[11px] text-[var(--nexa-text-muted)]">
                      Connect your proprietary API keys for Claude, OpenAI, and Gemini to power your 15 autonomous agents and custom workflows.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Zero-Knowledge Vault</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ANTHROPIC */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-purple-600" />
                      Anthropic Claude Key (Claude 3.5 Sonnet)
                    </label>
                    <span className="text-[10px] text-purple-600 font-semibold">Primary Agent Brain</span>
                  </div>
                  <div className="relative">
                    <input
                      type={byokVisible["anthropic"] ? "text" : "password"}
                      value={anthropicKey}
                      onChange={(e) => setAnthropicKey(e.target.value)}
                      placeholder="sk-ant-api03-••••••••••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#7E22CE] text-[var(--nexa-text-primary)] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleByokVis("anthropic")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
                    >
                      {byokVisible["anthropic"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-[var(--nexa-text-muted)]">
                    Powers autonomous strategic reasoning and lead negotiation.
                  </span>
                </div>

                {/* OPENAI */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-emerald-600" />
                      OpenAI API Key (GPT-4o & Embeddings)
                    </label>
                    <span className="text-[10px] text-emerald-600 font-semibold">Vector & Search</span>
                  </div>
                  <div className="relative">
                    <input
                      type={byokVisible["openai"] ? "text" : "password"}
                      value={openaiKey}
                      onChange={(e) => setOpenaiKey(e.target.value)}
                      placeholder="sk-proj-••••••••••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#7E22CE] text-[var(--nexa-text-primary)] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleByokVis("openai")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
                    >
                      {byokVisible["openai"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-[var(--nexa-text-muted)]">
                    Powers semantic vector lookup and fast structured classification.
                  </span>
                </div>

                {/* GOOGLE GEMINI */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Google Gemini 2.5 Pro Key
                    </label>
                    <span className="text-[10px] text-blue-600 font-semibold">Multimodal & Vision</span>
                  </div>
                  <div className="relative">
                    <input
                      type={byokVisible["gemini"] ? "text" : "password"}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      placeholder="AIzaSy••••••••••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#7E22CE] text-[var(--nexa-text-primary)] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleByokVis("gemini")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
                    >
                      {byokVisible["gemini"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-[var(--nexa-text-muted)]">
                    Powers receipt scanning, product images, and document OCR.
                  </span>
                </div>

                {/* META WHATSAPP WABA */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      Meta WhatsApp Cloud API Token
                    </label>
                    <span className="text-[10px] text-emerald-600 font-semibold">2-Way Messaging</span>
                  </div>
                  <div className="relative">
                    <input
                      type={byokVisible["whatsapp"] ? "text" : "password"}
                      value={whatsappKey}
                      onChange={(e) => setWhatsappKey(e.target.value)}
                      placeholder="EAAQ••••••••••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#7E22CE] text-[var(--nexa-text-primary)] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleByokVis("whatsapp")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
                    >
                      {byokVisible["whatsapp"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-[var(--nexa-text-muted)]">
                    Powers autonomous 2-way customer engagement on WhatsApp.
                  </span>
                </div>

                {/* GROQ FAST INFERENCE */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Groq / Llama 3 Fast Inference Key
                    </label>
                    <span className="text-[10px] text-amber-600 font-semibold">500 T/s Speed</span>
                  </div>
                  <div className="relative">
                    <input
                      type={byokVisible["groq"] ? "text" : "password"}
                      value={groqKey}
                      onChange={(e) => setGroqKey(e.target.value)}
                      placeholder="gsk_••••••••••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#7E22CE] text-[var(--nexa-text-primary)] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleByokVis("groq")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
                    >
                      {byokVisible["groq"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-[var(--nexa-text-muted)]">
                    Ultra low-latency intent detection and conversational responses.
                  </span>
                </div>

                {/* DEEPSEEK / OPENROUTER */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5 text-blue-500" />
                      DeepSeek / OpenRouter Gateway Key
                    </label>
                    <span className="text-[10px] text-blue-600 font-semibold">Budget Reasoning</span>
                  </div>
                  <div className="relative">
                    <input
                      type={byokVisible["deepseek"] ? "text" : "password"}
                      value={deepseekKey}
                      onChange={(e) => setDeepseekKey(e.target.value)}
                      placeholder="sk-••••••••••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#7E22CE] text-[var(--nexa-text-primary)] font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => toggleByokVis("deepseek")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] cursor-pointer"
                    >
                      {byokVisible["deepseek"] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-[var(--nexa-text-muted)]">
                    High reasoning-efficiency inference for long-context tasks.
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--nexa-border)] flex items-center justify-between">
                <span className="text-[11px] text-[var(--nexa-text-muted)]">
                  Proprietary model keys are encrypted at rest with AES-256 before being committed to PostgreSQL.
                </span>
                <NexaButton
                  size="sm"
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSaving || isLoading}
                  leftIcon={isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  className="bg-[#7E22CE] text-white hover:bg-[#6B21A8] rounded-xl font-bold shadow-xs px-4 py-2"
                >
                  {isSaving ? "Saving..." : isSaved ? "Saved to Vault!" : "Save AI Model Keys"}
                </NexaButton>
              </div>
            </NexaCard>

            {/* OFIA AI AUTONOMOUS EMAIL OUTREACH RELAY CARD */}
            <NexaCard variant="glass" padding="lg" className="space-y-5 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--nexa-border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#1A56DB] flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                      Ofia AI Cold Email & Autonomous Outreach Pipe
                      <NexaBadge variant="brand">GTM Engine</NexaBadge>
                    </h3>
                    <p className="text-[11px] text-[var(--nexa-text-muted)]">
                      Select the delivery pipe used by autonomous agents for outbound prospecting, drip campaigns, and lead qualification.
                    </p>
                  </div>
                </div>
              </div>

              {/* OUTREACH DELIVERY MODE SELECTOR */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                {[
                  { id: "smtp", title: "Workspace SMTP", desc: "Use Corporate SMTP Relay" },
                  { id: "resend", title: "Resend Engine", desc: "Resend Developer API" },
                  { id: "brevo", title: "Brevo Transactional", desc: "Brevo v3 Marketing Pool" },
                  { id: "ses", title: "Amazon SES", desc: "AWS Multi-Region IAM" },
                ].map((mode) => {
                  const isSel = aiDeliveryMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setAiDeliveryMode(mode.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSel
                          ? "bg-[#1A56DB]/10 border-[#1A56DB] text-[#1A56DB] font-bold shadow-xs"
                          : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-slate-400"
                      }`}
                    >
                      <div className="text-xs font-bold flex items-center justify-between">
                        {mode.title}
                        {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-[#1A56DB]" />}
                      </div>
                      <div className="text-[10px] text-[var(--nexa-text-muted)] mt-0.5">{mode.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* DYNAMIC PIPE CREDENTIALS */}
              {aiDeliveryMode === "resend" && (
                <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Resend API Key
                  </label>
                  <input
                    type="password"
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    placeholder="re_••••••••••••••••"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] font-mono text-[var(--nexa-text-primary)]"
                  />
                  <p className="text-[10px] text-[var(--nexa-text-muted)]">
                    Generate at resend.com/api-keys. Requires verified sending domain on Resend.
                  </p>
                </div>
              )}

              {aiDeliveryMode === "brevo" && (
                <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-2">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)]">
                    Brevo v3 API Key
                  </label>
                  <input
                    type="password"
                    value={brevoApiKey}
                    onChange={(e) => setBrevoApiKey(e.target.value)}
                    placeholder="xkeysib-••••••••••••••••"
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] font-mono text-[var(--nexa-text-primary)]"
                  />
                  <p className="text-[10px] text-[var(--nexa-text-muted)]">
                    Generate under Brevo Dashboard &rarr; SMTP & API &rarr; API Keys.
                  </p>
                </div>
              )}

              {aiDeliveryMode === "ses" && (
                <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[var(--nexa-text-primary)]">AWS Region</label>
                      <select
                        value={awsSesRegion}
                        onChange={(e) => setAwsSesRegion(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)]"
                      >
                        <option value="us-east-1">us-east-1 (N. Virginia)</option>
                        <option value="eu-west-1">eu-west-1 (Ireland)</option>
                        <option value="af-south-1">af-south-1 (Cape Town)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--nexa-text-primary)]">AWS Access Key ID</label>
                      <input
                        type="text"
                        value={awsSesAccessKey}
                        onChange={(e) => setAwsSesAccessKey(e.target.value)}
                        placeholder="AKIA••••••••"
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none font-mono text-[var(--nexa-text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--nexa-text-primary)]">AWS Secret Access Key</label>
                      <input
                        type="password"
                        value={awsSesSecretKey}
                        onChange={(e) => setAwsSesSecretKey(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none font-mono text-[var(--nexa-text-primary)]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {aiDeliveryMode === "smtp" && (
                <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/15 text-xs text-[var(--nexa-text-secondary)] flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#1A56DB] shrink-0" />
                  <span>
                    Outbound AI agent emails will dispatch through your workspace SMTP server configured in the <strong>SMTP Email Relay</strong> tab.
                  </span>
                </div>
              )}

              {/* TEST PIPE & FEEDBACK */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[var(--nexa-border)]">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestAiChannel}
                    disabled={isTestingAiChannel}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--nexa-text-primary)] flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isTestingAiChannel ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Testing Pipe...
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Test AI Outreach Channel
                      </>
                    )}
                  </button>

                  <NexaButton
                    size="sm"
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving || isLoading}
                    leftIcon={isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    className="bg-[#1A56DB] text-white hover:bg-[#1545B0] rounded-xl font-bold shadow-xs px-4 py-2"
                  >
                    {isSaving ? "Saving..." : isSaved ? "Saved to Database!" : "Save Outreach Settings"}
                  </NexaButton>
                </div>

                {aiChannelStatus && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {aiChannelStatus}
                  </span>
                )}
              </div>
            </NexaCard>

            {/* OFIA AI VOICE AGENT TELEPHONY INFRASTRUCTURE CARD */}
            <NexaCard variant="glass" padding="lg" className="space-y-5 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--nexa-border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-[#1A56DB] flex items-center justify-center">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                      Ofia Voice Agent Telephony & Carrier Infrastructure
                      <NexaBadge variant="brand">PSTN & SIP</NexaBadge>
                    </h3>
                    <p className="text-[11px] text-[var(--nexa-text-muted)]">
                      Configure your telephony carrier for automated outbound calling to Nigerian GSM/PSTN numbers (+234).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Telecom Whitelisted</span>
                </div>
              </div>

              {/* TELEPHONY PROVIDER SELECTOR */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--nexa-text-primary)] block">
                  Telephony Carrier & Audio Pipeline
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {[
                    { id: "voicebip", title: "Voicebip Service", desc: "Enterprise Nigerian PSTN & SIP (+234)" },
                    { id: "termii", title: "Termii Voice", desc: "Local Nigerian Telco Routes (+234)" },
                    { id: "twilio", title: "Twilio Voice", desc: "Programmable SIP & Audio Stream" },
                    { id: "africas_talking", title: "Africa's Talking", desc: "Pan-African Voice Gateway" },
                    { id: "webrtc_browser", title: "In-Browser WebRTC", desc: "Interactive Simulator & Testing" },
                  ].map((p) => {
                    const isSel = telephonyProvider === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setTelephonyProvider(p.id as any)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSel
                            ? "bg-[#1A56DB]/10 border-[#1A56DB] text-[#1A56DB] font-bold shadow-xs"
                            : "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] hover:border-slate-400"
                        }`}
                      >
                        <div className="text-xs font-bold flex items-center justify-between">
                          {p.title}
                          {isSel && <CheckCircle2 className="w-3.5 h-3.5 text-[#1A56DB]" />}
                        </div>
                        <div className="text-[10px] text-[var(--nexa-text-muted)] mt-0.5">{p.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* TELEPHONY CREDENTIALS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                    Outbound Caller ID (From Number)
                  </label>
                  <input
                    type="text"
                    value={telephonyFromNumber}
                    onChange={(e) => setTelephonyFromNumber(e.target.value)}
                    placeholder="+234 1 888 0000"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none font-mono text-[var(--nexa-text-primary)]"
                  />
                  <span className="text-[10px] text-[var(--nexa-text-muted)] mt-1 block">
                    Verified Nigerian CLI phone number presented to prospects.
                  </span>
                </div>

                {telephonyProvider === "voicebip" && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                        Voicebip API Key / Token
                      </label>
                      <input
                        type="password"
                        value={voicebipApiKey}
                        onChange={(e) => setVoicebipApiKey(e.target.value)}
                        placeholder="vb_live_••••••••••••••••"
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none font-mono text-[var(--nexa-text-primary)]"
                      />
                      <span className="text-[10px] text-[var(--nexa-text-muted)] mt-1 block">
                        Voicebip Console &rarr; API & SIP Tokens.
                      </span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                        Voicebip API Secret
                      </label>
                      <input
                        type="password"
                        value={voicebipApiSecret}
                        onChange={(e) => setVoicebipApiSecret(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none font-mono text-[var(--nexa-text-primary)]"
                      />
                      <span className="text-[10px] text-[var(--nexa-text-muted)] mt-1 block">
                        HMAC signature key for outbound dialing.
                      </span>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                        Voicebip SIP Endpoint / Trunk
                      </label>
                      <input
                        type="text"
                        value={voicebipSipEndpoint}
                        onChange={(e) => setVoicebipSipEndpoint(e.target.value)}
                        placeholder="sip.voicebip.com:5060"
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none font-mono text-[var(--nexa-text-primary)]"
                      />
                      <span className="text-[10px] text-[var(--nexa-text-muted)] mt-1 block">
                        Direct SIP trunk for sub-second audio streaming.
                      </span>
                    </div>
                  </>
                )}

                {telephonyProvider === "termii" && (
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                      Termii API Key
                    </label>
                    <input
                      type="password"
                      value={termiiApiKey}
                      onChange={(e) => setTermiiApiKey(e.target.value)}
                      placeholder="TL••••••••••••••••"
                      className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none font-mono text-[var(--nexa-text-primary)]"
                    />
                    <span className="text-[10px] text-[var(--nexa-text-muted)] mt-1 block">
                      Obtained from Termii Dashboard &rarr; Settings &rarr; API Tokens.
                    </span>
                  </div>
                )}

                {telephonyProvider === "twilio" && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                        Twilio Account SID
                      </label>
                      <input
                        type="text"
                        value={telephonyAccountSid}
                        onChange={(e) => setTelephonyAccountSid(e.target.value)}
                        placeholder="AC••••••••••••••••"
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none font-mono text-[var(--nexa-text-primary)]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                        Twilio Auth Token
                      </label>
                      <input
                        type="password"
                        value={telephonyAuthToken}
                        onChange={(e) => setTelephonyAuthToken(e.target.value)}
                        placeholder="••••••••••••••••"
                        className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none font-mono text-[var(--nexa-text-primary)]"
                      />
                    </div>
                  </>
                )}

                {telephonyProvider === "webrtc_browser" && (
                  <div className="sm:col-span-2 flex items-center p-3 rounded-xl bg-blue-500/10 text-xs text-[#1A56DB] gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>In-Browser testing mode uses local WebRTC and WebSockets. No external telephony carrier credits required.</span>
                  </div>
                )}
              </div>
            </NexaCard>

            {/* OFIA AI VOICE PERSONA & COMPLIANCE GUARDRAILS CARD */}
            <NexaCard variant="glass" padding="lg" className="space-y-5 border border-[var(--nexa-border)] shadow-xs rounded-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--nexa-border)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[var(--nexa-text-primary)] flex items-center gap-2">
                      Voice Persona, Speech Synthesis & Compliance Guardrails
                      <NexaBadge variant="green">Regulatory Compliant</NexaBadge>
                    </h3>
                    <p className="text-[11px] text-[var(--nexa-text-muted)]">
                      Control speaking cadence, mandatory AI disclosure, human escalation triggers, and permissible calling windows.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* AGENT NAME */}
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                    Spoken Agent Identity
                  </label>
                  <input
                    type="text"
                    value={voiceAgentName}
                    onChange={(e) => setVoiceAgentName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)] font-semibold"
                  />
                  <span className="text-[10px] text-[var(--nexa-text-muted)] mt-1 block">
                    The name the agent introduces itself with to corporate prospects.
                  </span>
                </div>

                {/* VOICE ACCENT */}
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                    Spoken Accent & Locale
                  </label>
                  <select
                    value={voiceAccent}
                    onChange={(e) => setVoiceAccent(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)] font-semibold"
                  >
                    <option value="en-NG-Standard-A">Nigerian English (Lagos Business Professional)</option>
                    <option value="en-GB-Standard-B">British English (Corporate International)</option>
                    <option value="af-ZA-Standard-A">Neutral African English</option>
                  </select>
                  <span className="text-[10px] text-[var(--nexa-text-muted)] mt-1 block">
                    Calibrated for optimal natural cadence over Nigerian mobile telephone connections.
                  </span>
                </div>

                {/* HUMAN ESCALATION NUMBER */}
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1 flex items-center gap-1.5">
                    <PhoneForwarded className="w-3.5 h-3.5 text-[#1A56DB]" />
                    Human Closer Escalation Phone
                  </label>
                  <input
                    type="text"
                    value={humanEscalationNumber}
                    onChange={(e) => setHumanEscalationNumber(e.target.value)}
                    placeholder="+234 800 000 0000"
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none font-mono text-[var(--nexa-text-primary)]"
                  />
                  <span className="text-[10px] text-[var(--nexa-text-muted)] mt-1 block">
                    Call will immediately bridge to this closer number if prospect asks for human director.
                  </span>
                </div>

                {/* CALLING WINDOWS */}
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    Permissible Calling Window (West Africa Time)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={callingHoursStart}
                      onChange={(e) => setCallingHoursStart(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)]"
                    />
                    <span className="text-xs text-[var(--nexa-text-muted)]">to</span>
                    <input
                      type="time"
                      value={callingHoursEnd}
                      onChange={(e) => setCallingHoursEnd(e.target.value)}
                      className="px-3 py-1.5 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)]"
                    />
                  </div>
                  <span className="text-[10px] text-[var(--nexa-text-muted)] mt-1 block">
                    Outreach dials strictly within Nigerian business hours (09:00 - 17:00 WAT).
                  </span>
                </div>

                {/* MAX DURATION & RETRIES */}
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                    Max Call Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    value={maxCallDurationSec}
                    onChange={(e) => setMaxCallDurationSec(Number(e.target.value) || 300)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none font-mono text-[var(--nexa-text-primary)]"
                  />
                  <span className="text-[10px] text-[var(--nexa-text-muted)] mt-1 block">
                    Hard ceiling per call to prevent runaway telephony minutes (Default: 300s = 5m).
                  </span>
                </div>

                {/* MAX RETRIES */}
                <div>
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] block mb-1">
                    Max Dial Attempts per Contact
                  </label>
                  <input
                    type="number"
                    value={maxRetries}
                    onChange={(e) => setMaxRetries(Number(e.target.value) || 2)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none font-mono text-[var(--nexa-text-primary)]"
                  />
                  <span className="text-[10px] text-[var(--nexa-text-muted)] mt-1 block">
                    Stops retrying if prospect does not answer after configured attempts.
                  </span>
                </div>
              </div>

              {/* MANDATORY AI DISCLOSURE */}
              <div className="space-y-2 p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--nexa-text-primary)] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Mandatory AI Identity Disclosure
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-[var(--nexa-text-secondary)]">
                    <input
                      type="checkbox"
                      checked={aiDisclosureEnabled}
                      onChange={(e) => setAiDisclosureEnabled(e.target.checked)}
                      className="rounded text-[#1A56DB] focus:ring-0"
                    />
                    <span>Enforce on all calls</span>
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={aiDisclosureText}
                  onChange={(e) => setAiDisclosureText(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none text-[var(--nexa-text-primary)] resize-none"
                />
                <span className="text-[10px] text-[var(--nexa-text-muted)] block">
                  Mandatory opening disclosure ensuring compliance with direct-marketing and telecommunications regulations.
                </span>
              </div>

              {/* AUTOMATION TOGGLES */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-[var(--nexa-text-primary)] block">
                      Auto-Dispatch WhatsApp Route Deck
                    </span>
                    <span className="text-[10px] text-[var(--nexa-text-muted)]">
                      Immediately sends Ofia corporate transport PDF to prospect's WhatsApp if call outcome is interested.
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={autoWhatsAppDeck}
                  onChange={(e) => setAutoWhatsAppDeck(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                />
              </div>

              {/* SAVE BUTTON */}
              <div className="pt-2 flex items-center justify-between border-t border-[var(--nexa-border)]">
                <span className="text-[11px] text-[var(--nexa-text-muted)]">
                  Voice configuration is synchronized to the Ofia Voice microservice and CRM dispatcher.
                </span>
                <div className="flex items-center gap-2">
                  {voiceSaveSuccess && (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Voice Settings Saved!
                    </span>
                  )}
                  <NexaButton
                    size="sm"
                    variant="primary"
                    onClick={handleSaveVoiceSettings}
                    disabled={isSavingVoice}
                    leftIcon={isSavingVoice ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    className="bg-[#1A56DB] text-white hover:bg-[#1545B0] rounded-xl font-bold shadow-xs px-4 py-2"
                  >
                    {isSavingVoice ? "Saving..." : "Save Voice Agent Settings"}
                  </NexaButton>
                </div>
              </div>
            </NexaCard>
          </div>
        )}
      </div>
    </ErpAdminShell>
  );
}

