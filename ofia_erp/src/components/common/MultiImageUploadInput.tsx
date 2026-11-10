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
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  ZoomIn,
  Trash2,
  Wand2,
} from "lucide-react";

export interface MultiImageUploadInputProps {
  label?: string;
  value?: string[];
  onChange: (urls: string[]) => void;
  tenantSlug?: string;
  placeholder?: string;
  helperText?: string;
  maxImages?: number;
  folder?: string;
  className?: string;
  id?: string;
}

export function MultiImageUploadInput({
  label = "Product Images & Gallery",
  value = [],
  onChange,
  tenantSlug,
  placeholder = "https://... or paste direct image URL",
  helperText,
  maxImages = 10,
  folder = "catalog",
  className = "",
  id,
}: MultiImageUploadInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ current: number; total: number } | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processingWhiteBgIndex, setProcessingWhiteBgIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const images = Array.isArray(value) ? value.filter(Boolean) : [];

  const handleFilesSelected = async (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    if (images.length + fileArray.length > maxImages) {
      setUploadError(`Maximum of ${maxImages} images allowed. You can only add ${Math.max(0, maxImages - images.length)} more.`);
      return;
    }

    // Size limit verification: 10MB per file
    for (const f of fileArray) {
      if (f.size > 10 * 1024 * 1024) {
        setUploadError(`Image "${f.name}" exceeds the 10MB limit.`);
        return;
      }
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    setUploadProgress({ current: 0, total: fileArray.length });

    let resolvedTenant = tenantSlug || "";
    if (!resolvedTenant && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      resolvedTenant = params.get("tenant") || "";
    }

    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        setUploadProgress({ current: i + 1, total: fileArray.length });

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
          throw new Error(data.error || `Failed to upload "${file.name}" (Status ${res.status})`);
        }
        uploadedUrls.push(data.url);
      }

      const nextImages = [...images, ...uploadedUrls];
      onChange(nextImages);
      setUploadSuccess(
        `Successfully uploaded ${uploadedUrls.length} ${
          uploadedUrls.length === 1 ? "image" : "images"
        } to Cloudinary!`
      );
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      console.error("Multi-image upload error:", err);
      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
      }
      setUploadError(err.message || "Failed to upload one or more images.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (images.includes(trimmed)) {
      setUploadError("This image URL has already been added.");
      return;
    }

    if (images.length >= maxImages) {
      setUploadError(`Maximum of ${maxImages} images reached.`);
      return;
    }

    onChange([...images, trimmed]);
    setUrlInput("");
    setUploadError(null);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const item = images[index];
    const next = [item, ...images.filter((_, i) => i !== index)];
    onChange(next);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const target = direction === "left" ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const temp = next[index];
    next[index] = next[target];
    next[target] = temp;
    onChange(next);
  };

  const handleRemove = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    onChange(next);
  };

  const handleMakeWhiteBackground = async (index: number) => {
    const targetUrl = images[index];
    if (!targetUrl) return;

    setProcessingWhiteBgIndex(index);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      let resolvedTenant = tenantSlug || "";
      if (!resolvedTenant && typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        resolvedTenant = params.get("tenant") || "";
      }

      const res = await fetch("/api/upload/white-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: targetUrl,
          tenantSlug: resolvedTenant,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Failed to convert background to pure white");
      }

      const updated = [...images];
      updated[index] = data.url;
      onChange(updated);
      setUploadSuccess("Photo background converted to pure white studio backdrop!");
      setTimeout(() => setUploadSuccess(null), 4000);
    } catch (err: any) {
      console.error("White background error:", err);
      setUploadError(err.message || "Failed to convert photo background.");
    } finally {
      setProcessingWhiteBgIndex(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  return (
    <div className={`space-y-3 w-full min-w-0 ${className}`}>
      {/* Label and Counter */}
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-xs font-bold text-[var(--nexa-text-primary)] block truncate">
          {label}
        </label>
        <span className="text-[11px] font-mono text-[var(--nexa-text-muted)] bg-[var(--nexa-bg-base)] border border-[var(--nexa-border)] px-2 py-0.5 rounded-md">
          {images.length} / {maxImages} {images.length === 1 ? "image" : "images"}
        </span>
      </div>

      {/* Main Drag-and-Drop & Action Hub */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
          isDragging
            ? "border-[#1A56DB] bg-blue-500/10 scale-[1.005]"
            : "border-[var(--nexa-border)] bg-[var(--nexa-bg-base)]/50 hover:border-blue-500/40"
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[#1A56DB] flex items-center justify-center shrink-0">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Upload Multiple Apparel Photos
              </h5>
              <p className="text-[11px] text-[var(--nexa-text-muted)]">
                Select or drag multiple files (PNG, JPG, WEBP up to 10MB each).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || images.length >= maxImages}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 shadow-sm cursor-pointer ${
                isUploading || images.length >= maxImages
                  ? "bg-[var(--nexa-bg-base)] border-[var(--nexa-border)] text-[var(--nexa-text-muted)] cursor-not-allowed opacity-60"
                  : "bg-[#1A56DB] hover:bg-blue-700 text-white border-blue-600"
              }`}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>
                    Uploading {uploadProgress?.current}/{uploadProgress?.total}...
                  </span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Files</span>
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              disabled={isUploading || images.length >= maxImages}
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />
          </div>
        </div>

        {/* Direct URL input bar */}
        <div className="pt-3 mt-3 border-t border-[var(--nexa-border)] flex items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <input
              id={id}
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddUrl();
                }
              }}
              placeholder={placeholder}
              disabled={images.length >= maxImages}
              className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-[var(--nexa-bg-surface)] border border-[var(--nexa-border)] outline-none focus:border-[#1A56DB] text-[var(--nexa-text-primary)]"
            />
          </div>
          <button
            type="button"
            onClick={() => handleAddUrl()}
            disabled={!urlInput.trim() || images.length >= maxImages}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--nexa-bg-surface)] hover:bg-[#1A56DB] hover:text-white border border-[var(--nexa-border)] text-[var(--nexa-text-secondary)] transition-colors flex items-center gap-1 shrink-0 disabled:opacity-40 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add URL</span>
          </button>
        </div>
      </div>

      {/* Upload Feedback Alerts */}
      {uploadSuccess && (
        <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1.5 animate-in fade-in duration-200">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadSuccess}</span>
        </p>
      )}

      {uploadError && (
        <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1.5 animate-in fade-in duration-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{uploadError}</span>
        </p>
      )}

      {/* Image Gallery Cards Grid */}
      {images.length > 0 ? (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[var(--nexa-text-secondary)] uppercase tracking-wider">
              Product Image Carousel Order ({images.length})
            </span>
            <span className="text-[10px] text-[var(--nexa-text-muted)]">
              Slot #1 is the primary storefront cover photo
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {images.map((imgUrl, index) => {
              const isCover = index === 0;
              return (
                <div
                  key={`${imgUrl}-${index}`}
                  className={`group relative rounded-2xl overflow-hidden border transition-all aspect-square flex flex-col justify-between bg-[var(--nexa-bg-base)] shadow-xs ${
                    isCover
                      ? "border-amber-500 ring-2 ring-amber-500/20 shadow-md"
                      : "border-[var(--nexa-border)] hover:border-blue-500/50"
                  }`}
                >
                  {/* Thumbnail Image */}
                  <img
                    src={imgUrl}
                    alt={`Product photo ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />

                  {/* Top Badge: Cover or Index Number */}
                  <div className="absolute top-1.5 left-1.5 right-1.5 flex items-center justify-between pointer-events-none z-10">
                    {isCover ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>Cover</span>
                      </span>
                    ) : (
                      <span className="w-5 h-5 rounded-full text-[10px] font-bold bg-black/60 text-white flex items-center justify-center backdrop-blur-xs">
                        {index + 1}
                      </span>
                    )}

                    {/* Quick Delete button (always accessible on top right) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(index);
                      }}
                      className="pointer-events-auto w-5 h-5 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                      title="Delete image"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Hover Overlay Controls */}
                  <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2 z-20">
                    <div className="flex items-center gap-1">
                      {/* Zoom button */}
                      <button
                        type="button"
                        onClick={() => setPreviewModalUrl(imgUrl)}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-black transition-colors cursor-pointer"
                        title="Zoom full image"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>

                      {/* AI White Background */}
                      <button
                        type="button"
                        onClick={() => handleMakeWhiteBackground(index)}
                        disabled={processingWhiteBgIndex === index}
                        className="p-1.5 rounded-lg bg-amber-500/80 hover:bg-amber-500 text-white transition-colors cursor-pointer disabled:opacity-50"
                        title="AI White Studio Background (Click to replace photo background with pure white #FFFFFF)"
                      >
                        {processingWhiteBgIndex === index ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Move left */}
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, "left")}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-black transition-colors cursor-pointer"
                          title="Move left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Move right */}
                      {index < images.length - 1 && (
                        <button
                          type="button"
                          onClick={() => handleMove(index, "right")}
                          className="p-1.5 rounded-lg bg-white/20 hover:bg-white text-white hover:text-black transition-colors cursor-pointer"
                          title="Move right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-1 w-full px-1">
                      {/* Quick White Studio BG action button */}
                      <button
                        type="button"
                        onClick={() => handleMakeWhiteBackground(index)}
                        disabled={processingWhiteBgIndex === index}
                        className="w-full px-2 py-0.5 rounded-lg bg-white/25 hover:bg-white text-white hover:text-stone-900 text-[9px] font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                        title="Convert background to pure white"
                      >
                        {processingWhiteBgIndex === index ? (
                          <>
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-2.5 h-2.5" />
                            <span>White Studio BG</span>
                          </>
                        )}
                      </button>

                      {/* Set as Cover button */}
                      {!isCover && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(index)}
                          className="w-full px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[9px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                          title="Make this the primary cover image"
                        >
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>Set Cover</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl border border-[var(--nexa-border)] bg-[var(--nexa-bg-base)] text-center text-[var(--nexa-text-muted)] space-y-1">
          <ImageIcon className="w-6 h-6 mx-auto opacity-40 mb-1" />
          <p className="text-xs font-semibold">No apparel images uploaded yet</p>
          <p className="text-[10px]">
            Upload or paste images above to populate the fashion gallery.
          </p>
        </div>
      )}

      {/* Helper text */}
      {helperText && !uploadError && (
        <p className="text-[10px] text-[var(--nexa-text-muted)] font-medium leading-relaxed">
          {helperText}
        </p>
      )}

      {/* Lightbox / Zoom Modal */}
      {previewModalUrl && (
        <div
          onClick={() => setPreviewModalUrl(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full max-h-[85vh] bg-[var(--nexa-bg-surface)] rounded-3xl overflow-hidden shadow-2xl border border-[var(--nexa-border)] flex flex-col"
          >
            <div className="p-3 border-b border-[var(--nexa-border)] flex items-center justify-between bg-[var(--nexa-bg-base)]">
              <span className="text-xs font-bold text-[var(--nexa-text-primary)]">
                Apparel Photo Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="p-1 rounded-full text-[var(--nexa-text-muted)] hover:text-[var(--nexa-text-primary)] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex-1 flex items-center justify-center overflow-auto bg-black/5 min-h-[300px]">
              <img
                src={previewModalUrl}
                alt="Enlarged photo preview"
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-md"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
