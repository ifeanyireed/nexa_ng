"use client";

import React, { useState, useRef, useEffect } from "react";
import { resolveAvatarUrl } from "@/lib/avatar";
import { NexaButton } from "@/components/nexa/NexaButton";
import { NexaAvatar } from "@/components/nexa/NexaAvatar";
import {
  X,
  Upload,
  Sparkles,
  Link as LinkIcon,
  Check,
  Camera,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export interface EditAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    id?: string;
    name?: string;
    email?: string;
    avatar?: string;
    role?: string;
  } | null;
  onAvatarUpdated?: (newAvatarUrl: string) => void;
  tenantSlug?: string;
}

// Preset 20 Character Avatars available across Ofia ERP
const CHARACTER_AVATARS = Array.from({ length: 20 }, (_, i) => ({
  id: `character${i + 1}`,
  filename: `character${i + 1}.jpg`,
  url: `https://res.cloudinary.com/ihfqdysu/image/upload/ofia_ng_assets/character${i + 1}.jpg`,
}));

export function EditAvatarModal({
  isOpen,
  onClose,
  currentUser,
  onAvatarUpdated,
  tenantSlug,
}: EditAvatarModalProps) {
  const [activeTab, setActiveTab] = useState<"PRESETS" | "UPLOAD" | "URL">("PRESETS");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [customUrlInput, setCustomUrlInput] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize selected avatar from currentUser prop or localStorage
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      let initial = currentUser?.avatar || "";
      if (!initial && typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("erp_current_user");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.avatar) initial = parsed.avatar;
          }
        } catch {}
      }
      setSelectedAvatar(initial || "character1.jpg");
      setCustomUrlInput(initial.startsWith("http") ? initial : "");
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const currentDisplayAvatar = resolveAvatarUrl(selectedAvatar, currentUser?.name || "Staff");

  // Handle preset click
  const handleSelectPreset = (filename: string) => {
    setSelectedAvatar(filename);
    setErrorMsg(null);
  };

  // Handle local file selection and upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please select a valid image file (PNG, JPG, WEBP, or GIF).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg("Image size exceeds 8MB. Please select a smaller photo.");
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (tenantSlug) formData.append("tenantSlug", tenantSlug);
      formData.append("folder", "avatars");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && (data.url || data.secure_url)) {
        const uploadedUrl = data.url || data.secure_url;
        setSelectedAvatar(uploadedUrl);
        setCustomUrlInput(uploadedUrl);
      } else {
        // Fallback: convert to base64 preview
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          if (result) setSelectedAvatar(result);
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      console.warn("Upload fallback to local FileReader:", err.message);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) setSelectedAvatar(result);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle custom URL input apply
  const handleApplyCustomUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) {
      setErrorMsg("Please enter an image URL.");
      return;
    }
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("data:")) {
      setErrorMsg("Image URL must start with http:// or https://");
      return;
    }
    setSelectedAvatar(trimmed);
    setErrorMsg(null);
  };

  // Save Avatar to Endpoint
  const handleSaveAvatar = async () => {
    if (!selectedAvatar) {
      setErrorMsg("Please select or upload an avatar first.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    // Resolve user identification
    let effectiveUserId = currentUser?.id || "";
    let effectiveEmail = currentUser?.email || "";
    let effectiveTenant = tenantSlug || "";

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("erp_current_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (!effectiveUserId && parsed.id) effectiveUserId = parsed.id;
          if (!effectiveEmail && parsed.email) effectiveEmail = parsed.email;
          if (!effectiveTenant && parsed.tenantSlug) effectiveTenant = parsed.tenantSlug;
        }
        if (!effectiveEmail) effectiveEmail = localStorage.getItem("nexa_user_email") || "";
        if (!effectiveTenant) {
          effectiveTenant = localStorage.getItem("nexa_active_tenant") || "";
        }
      } catch {}
    }

    try {
      const payload = {
        userId: effectiveUserId,
        id: effectiveUserId,
        email: effectiveEmail,
        avatar: selectedAvatar,
        tenantSlug: effectiveTenant,
      };

      const res = await fetch("/api/erp/users/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(effectiveTenant ? { "x-tenant-slug": effectiveTenant } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok && !data.success) {
        throw new Error(data.error || "Failed to update avatar");
      }

      const finalAvatar = data.avatar || selectedAvatar;

      // Update localStorage session
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("erp_current_user");
          const parsed = stored ? JSON.parse(stored) : {};
          const merged = { ...parsed, avatar: finalAvatar };
          localStorage.setItem("erp_current_user", JSON.stringify(merged));
          localStorage.setItem("nexa_user_avatar", finalAvatar);

          // Dispatch sync events across the entire window
          window.dispatchEvent(
            new CustomEvent("erp_current_user_updated", { detail: merged })
          );
          window.dispatchEvent(
            new CustomEvent("erp_avatar_updated", { detail: { avatar: finalAvatar } })
          );
        } catch {}
      }

      if (onAvatarUpdated) {
        onAvatarUpdated(finalAvatar);
      }

      setSuccessMsg("Avatar updated successfully!");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error("Failed to save avatar:", err);
      // Optimistic client-side fallback if offline
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("erp_current_user");
          const parsed = stored ? JSON.parse(stored) : {};
          const merged = { ...parsed, avatar: selectedAvatar };
          localStorage.setItem("erp_current_user", JSON.stringify(merged));
          window.dispatchEvent(
            new CustomEvent("erp_current_user_updated", { detail: merged })
          );
          window.dispatchEvent(
            new CustomEvent("erp_avatar_updated", { detail: { avatar: selectedAvatar } })
          );
        } catch {}
      }
      if (onAvatarUpdated) {
        onAvatarUpdated(selectedAvatar);
      }
      setSuccessMsg("Avatar updated locally.");
      setTimeout(() => {
        onClose();
      }, 1000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] rounded-3xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--nexa-border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-500 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[var(--nexa-text-primary)]">Change Profile Avatar</h3>
              <p className="text-xs text-[var(--nexa-text-muted)] font-medium">Choose a character illustration or upload your photo</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] p-1 rounded-full cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Preview Center */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-500/30 ring-4 ring-blue-500/10 shadow-lg bg-[var(--nexa-bg-base)] flex items-center justify-center">
              <img
                src={currentDisplayAvatar}
                alt={currentUser?.name || "Preview"}
                className="w-full h-full object-cover object-center rounded-full"
              />
            </div>
            <div className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#1A56DB] text-white shadow-md border-2 border-[var(--nexa-bg-surface)]">
              <Camera className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-center">
            <h4 className="text-sm font-bold text-[var(--nexa-text-primary)]">
              {currentUser?.name || "Staff Member"}
            </h4>
            <p className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
              {currentUser?.role ? currentUser.role.toUpperCase() : "ACCOUNT"} • Live Preview
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-2 border-b border-[var(--nexa-border)] pb-2.5">
          <button
            type="button"
            onClick={() => setActiveTab("PRESETS")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "PRESETS"
                ? "bg-[#1A56DB] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)] border border-transparent hover:border-[var(--nexa-border)]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Character Presets
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("UPLOAD")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "UPLOAD"
                ? "bg-[#1A56DB] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)] border border-transparent hover:border-[var(--nexa-border)]"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Photo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("URL")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "URL"
                ? "bg-[#1A56DB] text-white shadow-sm"
                : "text-[var(--nexa-text-secondary)] hover:bg-[var(--nexa-bg-base)] border border-transparent hover:border-[var(--nexa-border)]"
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Web Image URL
          </button>
        </div>

        {/* TAB 1: PRESETS */}
        {activeTab === "PRESETS" && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[var(--nexa-text-muted)] block">
              Choose an official illustrated character:
            </span>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 max-h-52 overflow-y-auto p-2 bg-[var(--nexa-bg-base)] rounded-2xl border border-[var(--nexa-border)]">
              {CHARACTER_AVATARS.map((char) => {
                const isSelected = selectedAvatar.includes(char.id);
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => handleSelectPreset(char.filename)}
                    className={`relative rounded-full aspect-square overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                      isSelected
                        ? "border-[#1A56DB] ring-2 ring-[#1A56DB]/30 scale-105"
                        : "border-transparent hover:border-[var(--nexa-border)] hover:scale-105"
                    }`}
                  >
                    <img
                      src={char.url}
                      alt={char.id}
                      className="w-full h-full object-cover rounded-full"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#1A56DB]/40 rounded-full flex items-center justify-center text-white">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD */}
        {activeTab === "UPLOAD" && (
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 border-2 border-dashed border-[var(--nexa-border)] hover:border-[#1A56DB]/50 rounded-2xl text-center cursor-pointer transition-colors bg-[var(--nexa-bg-base)] flex flex-col items-center justify-center gap-2.5 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </div>
              <div>
                <span className="text-xs font-bold text-[var(--nexa-text-primary)] block">
                  Click to select photo from device
                </span>
                <span className="text-[10px] text-[var(--nexa-text-muted)] font-medium">
                  Supports PNG, JPG, WEBP, or GIF up to 8MB
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DIRECT URL */}
        {activeTab === "URL" && (
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-[var(--nexa-text-muted)] block">
              Paste direct image link:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or https://..."
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-[var(--nexa-text-primary)] focus:outline-none focus:border-[#1A56DB] transition-colors"
              />
              <NexaButton
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyCustomUrl}
                className="rounded-full text-xs font-bold shrink-0"
              >
                Preview
              </NexaButton>
            </div>
          </div>
        )}

        {/* Status Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--nexa-border)]">
          <NexaButton
            variant="outline"
            size="sm"
            type="button"
            onClick={onClose}
            className="rounded-full"
            disabled={isSaving}
          >
            Cancel
          </NexaButton>
          <NexaButton
            variant="primary"
            size="sm"
            type="button"
            onClick={handleSaveAvatar}
            disabled={isSaving || !selectedAvatar}
            className="bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white rounded-full font-bold shadow-sm flex items-center gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                Save Avatar
              </>
            )}
          </NexaButton>
        </div>
      </div>
    </div>
  );
}
