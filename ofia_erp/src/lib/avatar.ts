/**
 * Resolves avatar image URLs across Ofia ERP.
 * Handles relative character avatars (e.g. "/character4.jpg", "character4.jpg"),
 * absolute Cloudinary URLs, null/undefined/empty values, and generates deterministic fallbacks.
 */
export function resolveAvatarUrl(avatar?: string | null, seed: string = "user", index: number = 0): string {
  if (!avatar || typeof avatar !== "string" || !avatar.trim()) {
    let hash = 0;
    const str = seed || "staff";
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const charIndex = (Math.abs(hash + index) % 20) + 1;
    return `https://res.cloudinary.com/ihfqdysu/image/upload/ofia_ng_assets/character${charIndex}.jpg`;
  }

  const trimmed = avatar.trim();

  // If already an absolute HTTP/HTTPS URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // If it's a character avatar relative path, e.g. "/character4.jpg" or "character4.jpg"
  if (trimmed.includes("character")) {
    const filename = trimmed.startsWith("/") ? trimmed.slice(1) : trimmed;
    return `https://res.cloudinary.com/ihfqdysu/image/upload/ofia_ng_assets/${filename}`;
  }

  // Any other relative path starting with /
  if (trimmed.startsWith("/")) {
    return `https://res.cloudinary.com/ihfqdysu/image/upload/ofia_ng_assets${trimmed}`;
  }

  return `https://res.cloudinary.com/ihfqdysu/image/upload/ofia_ng_assets/${trimmed}`;
}
