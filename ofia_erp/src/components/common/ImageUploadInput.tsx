"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  X,
  AlertCircle,
} from "lucide-react";

export interface ImageUploadInputProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  tenantSlug?: string;
  placeholder?: string;
  helperText?: string;
  aspectRatio?: "square" | "video" | "banner" | "wide" | "pill";
  compact?: boolean;
  className?: string;
  id?: string;
  folder?: string;
}

export function ImageUploadInput({
  label,
  value,
  onChange,
  tenantSlug,
  placeholder = "https://... or upload from device",
  helperText,
  aspectRatio = "video",
  compact = false,
  className = "",
  id,
  folder,
}: ImageUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square w-20 sm:w-24";
      case "banner":
        return "aspect-[21/9] w-full max-h-48";
      case "wide":
        return "aspect-[16/9] w-28 sm:w-36";
      case "pill":
        return "w-10 h-10 rounded-full";
      case "video":
      default:
        return "aspect-[4/3] w-24 sm:w-28";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Image size exceeds 10MB limit.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Resolve tenant slug dynamically
      let resolvedTenant = tenantSlug || "";
      if (!resolvedTenant && typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        resolvedTenant = params.get("tenant") || "";
      }

      const formData = new FormData();
      formData.append("file", file);
      if (resolvedTenant) formData.append("tenantSlug", resolvedTenant);
      if (folder) formData.append("folder", folder);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || `Upload failed with status ${res.status}`);
      }

      onChange(data.url);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 4000);
    } catch (err: any) {
      console.error("Cloudinary upload error:", err);
      setUploadError(err.message || "Failed to upload image to tenant Cloudinary storage.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const isCloudinary = value && value.includes("res.cloudinary.com");

  if (compact) {
    return (
      <div className={`space-y-1.5 w-full min-w-0 ${className}`}>
        {label && (
          <label htmlFor={id} className="block text-[11px] font-bold text-[var(--nexa-text-primary)] truncate">
            {label}
          </label>
        )}
        <div className="flex items-center gap-2 w-full min-w-0">
          {value ? (
            <div className="relative group shrink-0">
              <img
                src={value}
                alt="Thumbnail"
                className="w-8 h-8 rounded-lg object-cover border border-[var(--nexa-border)] shadow-xs"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                title="Clear image"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ) : null}

          <div className="relative flex-1 min-w-0">
            <input
              id={id}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full min-w-0 px-2.5 py-1.5 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
            />
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="shrink-0 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#1A56DB] hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            title="Upload image to Cloudinary"
          >
            {isUploading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            <span className="hidden xl:inline">{isUploading ? "..." : "Upload"}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {uploadError && (
          <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            {uploadError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2 w-full min-w-0 ${className}`}>
      {label && (
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={id} className="text-xs font-bold text-[var(--nexa-text-primary)] block truncate">
            {label}
          </label>
          {isCloudinary && (
            <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              <CheckCircle2 className="w-3 h-3" />
              Tenant Cloudinary
            </span>
          )}
        </div>
      )}

      {/* When aspectRatio is banner, stack vertically so preview and controls stay neatly inside card */}
      {aspectRatio === "banner" ? (
        <div className="space-y-3 w-full min-w-0">
          {/* Banner Preview Area */}
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/7] max-h-48 rounded-2xl border-2 border-dashed border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] overflow-hidden flex flex-col items-center justify-center group transition-all hover:border-[#1A56DB] shadow-inner">
            {value ? (
              <>
                <img
                  src={value}
                  alt="Banner Preview"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => onChange("")}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                    title="Remove banner image"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Remove Banner</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 text-center text-[var(--nexa-text-muted)]">
                <ImageIcon className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
                <span className="text-xs font-semibold block">No Banner Image Configured</span>
                <span className="text-[10px] text-[var(--nexa-text-muted)] block mt-0.5">
                  Upload a wide panoramic visual (recommended: 1200x500px or panoramic 21:9)
                </span>
              </div>
            )}
          </div>

          {/* Banner Upload Controls */}
          <div className="space-y-2 w-full min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isUploading
                    ? "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-muted)] cursor-not-allowed"
                    : "bg-[#1A56DB] hover:bg-blue-700 text-white border-blue-600 shadow-sm"
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading to Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{value ? "Upload New Banner" : "Upload Banner Image"}</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                or paste direct CDN URL below
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="relative w-full min-w-0">
              <input
                id={id}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] shadow-xs"
              />
            </div>

            {helperText && !uploadError && (
              <p className="text-[10px] text-[var(--nexa-text-muted)] font-medium">
                {helperText}
              </p>
            )}

            {uploadSuccess && (
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                Uploaded successfully to dedicated tenant Cloudinary storage!
              </p>
            )}

            {uploadError && (
              <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {uploadError}
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Standard side-by-side thumbnail layout for square, wide, and video aspect ratios */
        <div className="flex flex-col sm:flex-row gap-3 items-start w-full min-w-0">
          {/* Thumbnail Preview Area */}
          <div
            className={`relative rounded-2xl border-2 border-dashed border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] overflow-hidden flex flex-col items-center justify-center shrink-0 group transition-all hover:border-[#1A56DB] shadow-inner ${getAspectClass()}`}
          >
            {value ? (
              <>
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onChange("")}
                    className="p-1 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-md cursor-pointer"
                    title="Remove image"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="p-2 text-center text-[var(--nexa-text-muted)]">
                <ImageIcon className="w-5 h-5 mx-auto mb-1 opacity-50" />
                <span className="text-[10px] font-semibold block leading-tight">No Image</span>
              </div>
            )}
          </div>

          {/* Input & Upload Controls */}
          <div className="flex-1 min-w-0 w-full space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isUploading
                    ? "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-muted)] cursor-not-allowed"
                    : "bg-[#1A56DB] hover:bg-blue-700 text-white border-blue-600 shadow-sm"
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading to Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{value ? "Upload New Image" : "Upload from Device"}</span>
                  </>
                )}
              </button>

              <span className="text-[11px] text-[var(--nexa-text-muted)] font-medium">
                or paste direct CDN URL below
              </span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              disabled={isUploading}
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="relative w-full min-w-0">
              <input
                id={id}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)] shadow-xs"
              />
            </div>

            {helperText && !uploadError && (
              <p className="text-[10px] text-[var(--nexa-text-muted)] font-medium">
                {helperText}
              </p>
            )}

            {uploadSuccess && (
              <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 shrink-0" />
                Uploaded successfully to dedicated tenant Cloudinary storage!
              </p>
            )}

            {uploadError && (
              <p className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                {uploadError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
