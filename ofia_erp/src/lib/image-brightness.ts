/**
 * Utility to detect whether an image is predominantly dark or light.
 * Used for automatic contrast inversion of UI overlays, text, and cards.
 */

export async function detectImageBrightness(imageUrl: string): Promise<"dark" | "light"> {
  if (!imageUrl || typeof window === "undefined") {
    return "dark";
  }

  return new Promise((resolve) => {
    // 1.5s timeout safety fallback
    const timer = setTimeout(() => {
      resolve("dark");
    }, 1500);

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          resolve("dark");
          return;
        }

        // Downsample to 40x40 for instant, low-overhead pixel sampling
        const width = 40;
        const height = 40;
        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        let totalLuminance = 0;
        let count = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Sample visible pixels
          if (a > 30) {
            // ITU-R BT.709 perceived luminance formula
            const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
            totalLuminance += lum;
            count++;
          }
        }

        if (count === 0) {
          resolve("dark");
          return;
        }

        const avgLuminance = totalLuminance / count;
        // Luminance threshold: < 135 is classified as dark, >= 135 as light
        resolve(avgLuminance < 135 ? "dark" : "light");
      } catch {
        // Fallback heuristic if CORS blocks direct canvas read
        const lower = imageUrl.toLowerCase();
        if (lower.includes("white") || lower.includes("light") || lower.includes("bright")) {
          resolve("light");
        } else {
          resolve("dark");
        }
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve("dark");
    };

    img.src = imageUrl;
  });
}
