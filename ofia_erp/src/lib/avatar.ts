export function getAvatarFallbackUrl(seed: string = "staff", index: number = 0): string {
  let hash = 0;
  const str = seed || "staff";
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const charIndex = (Math.abs(hash + index) % 20) + 1;
  return `https://res.cloudinary.com/ihfqdysu/image/upload/ofia_ng_assets/character${charIndex}.jpg`;
}

/**
 * Resolves avatar image URLs across Ofia ERP.
 * Handles relative character avatars (e.g. "/character4.jpg", "character4.jpg"),
 * absolute Cloudinary URLs, null/undefined/empty values, and generates deterministic fallbacks.
 */
export function resolveAvatarUrl(avatar?: string | null, seed: string = "user", index: number = 0): string {
  if (!avatar || typeof avatar !== "string" || !avatar.trim()) {
    return getAvatarFallbackUrl(seed, index);
  }

  const trimmed = avatar.trim();

  // If already an absolute HTTP/HTTPS URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    // If it points to the legacy stale placeholder, replace it with deterministic character avatar
    if (trimmed.includes("rr1m5fkqj8ei3eao1qjm")) {
      return getAvatarFallbackUrl(seed, index);
    }
    return trimmed;
  }

  // If it's a character avatar relative path, e.g. "/character4.jpg" or "character4"
  if (trimmed.toLowerCase().includes("character")) {
    let filename = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
    if (!filename.includes(".")) {
      filename = `${filename}.jpg`;
    }
    return `https://res.cloudinary.com/ihfqdysu/image/upload/ofia_ng_assets/${filename}`;
  }

  // Any other local relative path (e.g. /avatar1.png or unrecognized path) falls back to character avatar
  return getAvatarFallbackUrl(seed, index);
}

