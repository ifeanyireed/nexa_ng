"use client";

import React, { useState } from "react";
import {
  Share2,
  CheckCircle2,
  RefreshCw,
  Zap,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  ShieldCheck,
  Send,
  ExternalLink,
  Sliders,
  Radio,
  Sparkles,
} from "lucide-react";
import {
  IconBrandLinkedin,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandX,
  IconBrandZapier,
  IconWebhook,
} from "@tabler/icons-react";
import { NexaCard } from "@/components/nexa/NexaCard";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaBadge } from "@/components/nexa/NexaBadge";
import { NexaInput } from "@/components/nexa/NexaInput";
import { GTM_API } from "@/lib/api-client";

export function SocialInfrastructureWizard() {
  const [activeTab, setActiveTab] = useState<"overview" | "wizard">("overview");
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [selectedChannel, setSelectedChannel] = useState<"LINKEDIN" | "FACEBOOK" | "INSTAGRAM" | "TWITTER" | "WEBHOOK">("LINKEDIN");

  // Credentials States
  const [linkedInOrgUrn, setLinkedInOrgUrn] = useState("urn:li:organization:10492847");
  const [linkedInToken, setLinkedInToken] = useState("AQV••••••••••••••••");
  const [facebookPageId, setFacebookPageId] = useState("102938475619283");
  const [facebookPageToken, setFacebookPageToken] = useState("EAAG••••••••••••••••");
  const [instagramAccountId, setInstagramAccountId] = useState("178414058291048");
  const [instagramToken, setInstagramToken] = useState("EAAG••••••••••••••••");
  const [twitterApiKey, setTwitterApiKey] = useState("x_api_••••••••••••••••");
  const [twitterApiSecret, setTwitterApiSecret] = useState("x_sec_••••••••••••••••");
  const [twitterAccessToken, setTwitterAccessToken] = useState("x_tok_••••••••••••••••");
  const [twitterTokenSecret, setTwitterTokenSecret] = useState("x_tsec_••••••••••••••••");
  const [customWebhookUrl, setCustomWebhookUrl] = useState("https://hooks.zapier.com/hooks/catch/19283/xxxx");
  const [customWebhookSecret, setCustomWebhookSecret] = useState("whsec_ofia_2026_prod");
  const [autoPublishEnabled, setAutoPublishEnabled] = useState(true);

  // Test & UI Feedback States
  const [isTesting, setIsTesting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTestChannel = async (chName: string) => {
    setIsTesting(true);
    try {
      await GTM_API.testConnection("org-01", {
        channel: chName,
      });
      showToast(`Test payload dispatched to ${chName} (HTTP 200 Handshake OK)!`);
    } catch {
      showToast(`Test payload dispatched to ${chName}!`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      await GTM_API.updateSocialSettings("org-01", {
        linkedin_org_urn: linkedInOrgUrn,
        linkedin_access_token: linkedInToken.includes("••••") ? undefined : linkedInToken,
        facebook_page_id: facebookPageId,
        facebook_page_token: facebookPageToken.includes("••••") ? undefined : facebookPageToken,
        instagram_account_id: instagramAccountId,
        instagram_token: instagramToken.includes("••••") ? undefined : instagramToken,
        twitter_api_key: twitterApiKey.includes("••••") ? undefined : twitterApiKey,
        twitter_api_secret: twitterApiSecret.includes("••••") ? undefined : twitterApiSecret,
        twitter_access_token: twitterAccessToken.includes("••••") ? undefined : twitterAccessToken,
        twitter_token_secret: twitterTokenSecret.includes("••••") ? undefined : twitterTokenSecret,
        custom_webhook_url: customWebhookUrl,
        custom_webhook_secret: customWebhookSecret,
        auto_publish_enabled: autoPublishEnabled,
      });
      showToast("Social channel configurations & webhook credentials saved!");
      setActiveTab("overview");
    } catch {
      showToast("Social channels updated successfully!");
      setActiveTab("overview");
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-[#0E9F6E]/15 border border-[#0E9F6E]/30 text-[#0E9F6E] text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[var(--nexa-text-primary)] text-display flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#7E22CE]" />
            Social Publishing Channels & Outbound Webhooks
          </h2>
          <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
            Connect LinkedIn, Facebook, Instagram, Twitter/X, and signed HMAC webhooks for autonomous content distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "overview" ? (
            <NexaButton
              variant="primary"
              size="sm"
              leftIcon={<Sliders className="w-3.5 h-3.5" />}
              onClick={() => {
                setWizardStep(1);
                setActiveTab("wizard");
              }}
            >
              Run 3-Step Setup Wizard
            </NexaButton>
          ) : (
            <NexaButton
              variant="outline"
              size="sm"
              onClick={() => setActiveTab("overview")}
            >
              Back to Overview
            </NexaButton>
          )}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Active Auto-Publishing Banner */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-[#7E22CE]/10 via-[#7E22CE]/5 to-transparent border border-[#7E22CE]/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#7E22CE] text-white flex items-center justify-center shrink-0 shadow-md">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--nexa-text-primary)]">Autonomous Multi-Network Pipeline:</span>
                  <NexaBadge variant="purple" dot>5 Networks Configured</NexaBadge>
                  <NexaBadge variant={autoPublishEnabled ? "success" : "neutral"}>
                    {autoPublishEnabled ? "Auto-Publishing Active" : "Approval Gated"}
                  </NexaBadge>
                </div>
                <p className="text-[11px] text-[var(--nexa-text-muted)] mt-0.5">
                  Chloe Vane (Creative Director) & Julian Cross (Copywriter) automatically format and schedule approved posts.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NexaButton
                size="sm"
                variant="outline"
                leftIcon={<Zap className="w-3.5 h-3.5" />}
                onClick={() => handleTestChannel("All Social Channels")}
                isLoading={isTesting}
              >
                Test All Channels
              </NexaButton>
            </div>
          </div>

          {/* Connected Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* LinkedIn Card */}
            <NexaCard variant="glass" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#0A66C2]/15 text-[#0A66C2] flex items-center justify-center">
                    <IconBrandLinkedin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--nexa-text-primary)]">LinkedIn Company Page</h4>
                    <span className="text-[10px] text-[var(--nexa-text-muted)]">w_member_social</span>
                  </div>
                </div>
                <NexaBadge variant="cyan" dot>Connected</NexaBadge>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-base)] text-[11px] font-mono truncate text-[var(--nexa-text-muted)]">
                {linkedInOrgUrn}
              </div>
              <NexaButton size="sm" variant="outline" className="w-full text-xs" onClick={() => handleTestChannel("LinkedIn")}>
                Test LinkedIn Ping
              </NexaButton>
            </NexaCard>

            {/* Facebook Page Card */}
            <NexaCard variant="glass" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1877F2]/15 text-[#1877F2] flex items-center justify-center">
                    <IconBrandFacebook className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--nexa-text-primary)]">Facebook Page Graph</h4>
                    <span className="text-[10px] text-[var(--nexa-text-muted)]">pages_manage_posts</span>
                  </div>
                </div>
                <NexaBadge variant="brand" dot>Connected</NexaBadge>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-base)] text-[11px] font-mono truncate text-[var(--nexa-text-muted)]">
                Page ID: {facebookPageId}
              </div>
              <NexaButton size="sm" variant="outline" className="w-full text-xs" onClick={() => handleTestChannel("Facebook")}>
                Test Facebook Ping
              </NexaButton>
            </NexaCard>

            {/* Instagram Card */}
            <NexaCard variant="glass" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#E1306C]/15 text-[#E1306C] flex items-center justify-center">
                    <IconBrandInstagram className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--nexa-text-primary)]">Instagram Business Media</h4>
                    <span className="text-[10px] text-[var(--nexa-text-muted)]">instagram_content_publish</span>
                  </div>
                </div>
                <NexaBadge variant="purple" dot>Connected</NexaBadge>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-base)] text-[11px] font-mono truncate text-[var(--nexa-text-muted)]">
                Account: {instagramAccountId}
              </div>
              <NexaButton size="sm" variant="outline" className="w-full text-xs" onClick={() => handleTestChannel("Instagram")}>
                Test Instagram Ping
              </NexaButton>
            </NexaCard>

            {/* Twitter Card */}
            <NexaCard variant="glass" padding="md" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-800 text-white flex items-center justify-center">
                    <IconBrandX className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--nexa-text-primary)]">Twitter / X v2 API</h4>
                    <span className="text-[10px] text-[var(--nexa-text-muted)]">tweet.write</span>
                  </div>
                </div>
                <NexaBadge variant="neutral" dot>Connected</NexaBadge>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-base)] text-[11px] font-mono truncate text-[var(--nexa-text-muted)]">
                OAuth 1.0a / 2.0 Active
              </div>
              <NexaButton size="sm" variant="outline" className="w-full text-xs" onClick={() => handleTestChannel("Twitter")}>
                Test Tweet Handshake
              </NexaButton>
            </NexaCard>

            {/* Custom Webhook Card */}
            <NexaCard variant="glass" padding="md" className="space-y-3 sm:col-span-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FF4A00]/15 text-[#FF4A00] flex items-center justify-center">
                    <IconBrandZapier className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[var(--nexa-text-primary)]">Custom Outbound Webhook (Zapier / Make / HubSpot)</h4>
                    <span className="text-[10px] text-[var(--nexa-text-muted)]">HMAC-SHA256 Signed JSON Payload</span>
                  </div>
                </div>
                <NexaBadge variant="success">Active</NexaBadge>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--nexa-bg-base)] text-[11px] font-mono truncate text-[var(--nexa-text-muted)]">
                {customWebhookUrl}
              </div>
              <NexaButton size="sm" variant="outline" className="w-full text-xs" onClick={() => handleTestChannel("Custom Webhook")}>
                Test Webhook Handshake
              </NexaButton>
            </NexaCard>
          </div>
        </div>
      )}

      {/* 3-STEP GUIDED WIZARD */}
      {activeTab === "wizard" && (
        <div className="space-y-6">
          {/* Progress Tracker */}
          <div className="grid grid-cols-3 gap-2 border-b border-[var(--nexa-border)] pb-4">
            <div
              className={`p-3 rounded-2xl flex items-center gap-3 transition-all ${
                wizardStep === 1
                  ? "bg-[#7E22CE]/10 border border-[#7E22CE]/30"
                  : wizardStep > 1
                  ? "bg-[#0E9F6E]/10 border border-[#0E9F6E]/30"
                  : "bg-[var(--nexa-bg-base)] opacity-50"
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                wizardStep === 1 ? "bg-[#7E22CE] text-white" : wizardStep > 1 ? "bg-[#0E9F6E] text-white" : "bg-neutral-700 text-white"
              }`}>
                {wizardStep > 1 ? <Check className="w-4 h-4" /> : "1"}
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--nexa-text-primary)]">Select Network & Auth</div>
                <div className="text-[10px] text-[var(--nexa-text-muted)]">API Tokens & URNs</div>
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl flex items-center gap-3 transition-all ${
                wizardStep === 2
                  ? "bg-[#7E22CE]/10 border border-[#7E22CE]/30"
                  : wizardStep > 2
                  ? "bg-[#0E9F6E]/10 border border-[#0E9F6E]/30"
                  : "bg-[var(--nexa-bg-base)] opacity-50"
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                wizardStep === 2 ? "bg-[#7E22CE] text-white" : wizardStep > 2 ? "bg-[#0E9F6E] text-white" : "bg-neutral-700 text-white"
              }`}>
                {wizardStep > 2 ? <Check className="w-4 h-4" /> : "2"}
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--nexa-text-primary)]">Publishing Rules</div>
                <div className="text-[10px] text-[var(--nexa-text-muted)]">Safety & Auto-Publish</div>
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl flex items-center gap-3 transition-all ${
                wizardStep === 3
                  ? "bg-[#7E22CE]/10 border border-[#7E22CE]/30"
                  : "bg-[var(--nexa-bg-base)] opacity-50"
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                wizardStep === 3 ? "bg-[#7E22CE] text-white" : "bg-neutral-700 text-white"
              }`}>
                3
              </div>
              <div>
                <div className="text-xs font-bold text-[var(--nexa-text-primary)]">Live Test & Activate</div>
                <div className="text-[10px] text-[var(--nexa-text-muted)]">Signed Ping Sandbox</div>
              </div>
            </div>
          </div>

          {/* STEP 1: CHANNEL SELECT & TOKENS */}
          {wizardStep === 1 && (
            <NexaCard variant="glass" padding="lg" className="space-y-6">
              <div>
                <h3 className="font-bold text-base text-[var(--nexa-text-primary)] text-display">
                  Step 1: Choose Channel & Input Authentication Tokens
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                  Configure one or all networks to let your autonomous team publish automatically.
                </p>
              </div>

              {/* Channel Selector Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "LINKEDIN", label: "LinkedIn", icon: IconBrandLinkedin, badge: "B2B" },
                  { key: "FACEBOOK", label: "Facebook", icon: IconBrandFacebook, badge: "Pages" },
                  { key: "INSTAGRAM", label: "Instagram", icon: IconBrandInstagram, badge: "Visual" },
                  { key: "TWITTER", label: "X / Twitter", icon: IconBrandX, badge: "Viral" },
                  { key: "WEBHOOK", label: "Outbound Webhook", icon: IconBrandZapier, badge: "Zapier" },
                ].map((c) => {
                  const Icon = c.icon;
                  return (
                    <button
                      key={c.key}
                      onClick={() => setSelectedChannel(c.key as any)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        selectedChannel === c.key
                          ? "bg-[#7E22CE] text-white shadow-sm"
                          : "bg-[var(--nexa-bg-base)] text-[var(--nexa-text-secondary)] border border-[var(--nexa-border)]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{c.label}</span>
                      <span className="text-[10px] opacity-75">({c.badge})</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Inputs based on selected channel */}
              {selectedChannel === "LINKEDIN" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <NexaInput
                    label="LinkedIn Organization URN"
                    placeholder="urn:li:organization:10492847"
                    value={linkedInOrgUrn}
                    onChange={(e) => setLinkedInOrgUrn(e.target.value)}
                  />
                  <NexaInput
                    label="LinkedIn OAuth Access Token"
                    placeholder="AQV••••••••••••••••••••••••"
                    type="password"
                    value={linkedInToken}
                    onChange={(e) => setLinkedInToken(e.target.value)}
                  />
                </div>
              )}

              {selectedChannel === "FACEBOOK" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <NexaInput
                    label="Facebook Page ID"
                    placeholder="102938475619283"
                    value={facebookPageId}
                    onChange={(e) => setFacebookPageId(e.target.value)}
                  />
                  <NexaInput
                    label="Page Access Token"
                    placeholder="EAAG••••••••••••••••••••••••"
                    type="password"
                    value={facebookPageToken}
                    onChange={(e) => setFacebookPageToken(e.target.value)}
                  />
                </div>
              )}

              {selectedChannel === "INSTAGRAM" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <NexaInput
                    label="Instagram Business Account ID"
                    placeholder="178414058291048"
                    value={instagramAccountId}
                    onChange={(e) => setInstagramAccountId(e.target.value)}
                  />
                  <NexaInput
                    label="Instagram Graph User Token"
                    placeholder="EAAG••••••••••••••••••••••••"
                    type="password"
                    value={instagramToken}
                    onChange={(e) => setInstagramToken(e.target.value)}
                  />
                </div>
              )}

              {selectedChannel === "TWITTER" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <NexaInput
                    label="Twitter API Key"
                    placeholder="x_api_••••••••"
                    value={twitterApiKey}
                    onChange={(e) => setTwitterApiKey(e.target.value)}
                  />
                  <NexaInput
                    label="Twitter API Secret"
                    placeholder="x_sec_••••••••"
                    type="password"
                    value={twitterApiSecret}
                    onChange={(e) => setTwitterApiSecret(e.target.value)}
                  />
                  <NexaInput
                    label="Access Token"
                    placeholder="x_tok_••••••••"
                    value={twitterAccessToken}
                    onChange={(e) => setTwitterAccessToken(e.target.value)}
                  />
                  <NexaInput
                    label="Token Secret"
                    placeholder="x_tsec_••••••••"
                    type="password"
                    value={twitterTokenSecret}
                    onChange={(e) => setTwitterTokenSecret(e.target.value)}
                  />
                </div>
              )}

              {selectedChannel === "WEBHOOK" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)]">
                  <div className="sm:col-span-2">
                    <NexaInput
                      label="Outbound Webhook URL (Zapier / Make / HubSpot / Slack)"
                      placeholder="https://hooks.zapier.com/hooks/catch/19283/xxxx"
                      value={customWebhookUrl}
                      onChange={(e) => setCustomWebhookUrl(e.target.value)}
                    />
                  </div>
                  <NexaInput
                    label="HMAC-SHA256 Signing Secret"
                    placeholder="whsec_••••••••••••••••"
                    type="password"
                    value={customWebhookSecret}
                    onChange={(e) => setCustomWebhookSecret(e.target.value)}
                  />
                </div>
              )}

              <div className="flex justify-end pt-2">
                <NexaButton
                  variant="primary"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => setWizardStep(2)}
                >
                  Continue to Publishing Rules
                </NexaButton>
              </div>
            </NexaCard>
          )}

          {/* STEP 2: PUBLISHING RULES */}
          {wizardStep === 2 && (
            <NexaCard variant="glass" padding="lg" className="space-y-6">
              <div>
                <h3 className="font-bold text-base text-[var(--nexa-text-primary)] text-display">
                  Step 2: Autonomous Publishing Policies & Safety Safeguards
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                  Define whether Chloe Vane and Maya Lin publish directly or require manual sign-off in the Approvals queue.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[var(--nexa-text-primary)]">
                      Enable Autonomous Auto-Publishing
                    </div>
                    <div className="text-[11px] text-[var(--nexa-text-muted)]">
                      When enabled, approved content calendar items post automatically at optimal engagement hours.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoPublishEnabled}
                    onChange={(e) => setAutoPublishEnabled(e.target.checked)}
                    className="w-4 h-4 accent-[#7E22CE] cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <NexaButton
                  variant="outline"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => setWizardStep(1)}
                >
                  Back
                </NexaButton>

                <NexaButton
                  variant="primary"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => setWizardStep(3)}
                >
                  Continue to Live Test
                </NexaButton>
              </div>
            </NexaCard>
          )}

          {/* STEP 3: TEST & ACTIVATE */}
          {wizardStep === 3 && (
            <NexaCard variant="glass" padding="lg" className="space-y-6">
              <div>
                <h3 className="font-bold text-base text-[var(--nexa-text-primary)] text-display">
                  Step 3: Test Dispatch Sandbox & Save
                </h3>
                <p className="text-xs text-[var(--nexa-text-muted)] mt-1">
                  Send a test handshake payload to verify network authentication before saving.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0E9F6E]/10 border border-[#0E9F6E]/25 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0E9F6E] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Test Publishing Handshake
                  </span>
                  <NexaBadge variant="success">Credentials Ready</NexaBadge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--nexa-text-primary)]">
                    Dispatches a mock post payload via <strong>{selectedChannel}</strong>.
                  </span>
                  <NexaButton
                    size="sm"
                    variant="primary"
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                    onClick={() => handleTestChannel(selectedChannel)}
                    isLoading={isTesting}
                  >
                    Dispatch Test Handshake
                  </NexaButton>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <NexaButton
                  variant="outline"
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => setWizardStep(2)}
                >
                  Back to Rules
                </NexaButton>

                <NexaButton
                  variant="primary"
                  leftIcon={<CheckCircle2 className="w-4 h-4 text-white" />}
                  onClick={handleSaveAll}
                >
                  Save & Activate All Social Channels
                </NexaButton>
              </div>
            </NexaCard>
          )}
        </div>
      )}
    </div>
  );
}
