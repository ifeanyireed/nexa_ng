"use client";

import { useState, useEffect } from "react";

export type ContrastTheme = "light" | "dark" | "auto";

/**
 * Hook to determine if an image has a dark or light background in the top-left area.
 * Returns true if the background is dark (requires white text), false if light (requires dark text).
 */
export function useImageContrast(
  imageUrl?: string,
  initialTheme: ContrastTheme = "auto"
): boolean {
  // If initialTheme is explicitly provided ('dark' or 'light'), initialize accordingly
  const [isDark, setIsDark] = useState<boolean>(initialTheme === "dark");

  useEffect(() => {
    if (initialTheme === "dark") {
      setIsDark(true);
      return;
    }
    if (initialTheme === "light") {
      setIsDark(false);
      return;
    }
    if (!imageUrl) return;

    let isMounted = true;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      if (!isMounted) return;
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        // Sample the top-left quadrant (top 35% height, left 50% width) where the title and count sit
        const sampleW = Math.max(img.naturalWidth * 0.5, 1);
        const sampleH = Math.max(img.naturalHeight * 0.35, 1);

        ctx.drawImage(img, 0, 0, sampleW, sampleH, 0, 0, 24, 24);
        const imgData = ctx.getImageData(0, 0, 24, 24).data;

        let totalLuminance = 0;
        let count = 0;

        for (let i = 0; i < imgData.length; i += 4) {
          const r = imgData[i];
          const g = imgData[i + 1];
          const b = imgData[i + 2];
          // ITU-R BT.601 perceived luminance formula
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuminance += lum;
          count++;
        }

        const avgLuminance = count > 0 ? totalLuminance / count : 255;
        // Threshold: Below 138 is perceived as dark background -> use white text for contrast
        setIsDark(avgLuminance < 138);
      } catch {
        // In case of CORS or canvas security restrictions, fallback gracefully
      }
    };

    return () => {
      isMounted = false;
    };
  }, [imageUrl, initialTheme]);

  return isDark;
}
