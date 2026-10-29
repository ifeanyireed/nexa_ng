/**
 * AI & Web Intelligence Phone Enricher for CRM Leads
 * 
 * Powered by:
 * 1. Apify Google Places & Maps Scraper (real-time verified corporate phone, address, website)
 * 2. Direct Corporate Website & Domain Crawler (/contact, /about)
 * 3. Nigerian / E.164 Phone Normalizer & Heuristic Classifier
 */

export interface PhoneCandidate {
  phone: string;
  formattedPhone: string;
  type: "DIRECT_MOBILE" | "HEAD_OFFICE_SWITCHBOARD" | "CUSTOMER_CARE" | "GENERAL";
  confidence: number; // 0 - 100
  sourceName: string;
  sourceUrl: string;
  address?: string;
  website?: string;
  companyMatched?: string;
}

export interface EnrichmentResult {
  success: boolean;
  leadId: string;
  companyName: string;
  contactName: string;
  currentPhone: string;
  candidates: PhoneCandidate[];
  error?: string;
}

/**
 * Checks if a given phone string is missing, blank, or placeholder
 */
export function isPhoneMissingOrInvalid(phone?: string | null): boolean {
  if (!phone) return true;
  const trimmed = phone.trim().toLowerCase();
  if (
    trimmed === "" ||
    trimmed === "no phone" ||
    trimmed === "none" ||
    trimmed === "n/a" ||
    trimmed === "tbd" ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return true;
  }

  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length < 7) return true;

  // Obvious dummy sequences
  if (/^0+$/.test(digits) || /^12345/.test(digits) || digits === "2340000000000") {
    return true;
  }

  return false;
}

/**
 * Formats digits into clean Nigerian / International E.164 format
 */
export function formatPhoneNumber(raw: string): { formatted: string; rawDigits: string; type: "DIRECT_MOBILE" | "HEAD_OFFICE_SWITCHBOARD" | "CUSTOMER_CARE" | "GENERAL" } {
  const digits = raw.replace(/[^0-9]/g, "");

  // Nigerian Mobile (+234 80X, 70X, 90X, 91X)
  if (digits.startsWith("234") && digits.length === 13) {
    const prefix = digits.substring(3, 6);
    const mid = digits.substring(6, 9);
    const end = digits.substring(9);
    return {
      formatted: `+234 ${prefix} ${mid} ${end}`,
      rawDigits: `+${digits}`,
      type: "DIRECT_MOBILE",
    };
  }

  // Local Nigerian Mobile (080X, 070X, 090X, 081X, 091X)
  if (digits.startsWith("0") && digits.length === 11 && ["8", "7", "9"].includes(digits[1])) {
    const intl = "234" + digits.substring(1);
    const prefix = intl.substring(3, 6);
    const mid = intl.substring(6, 9);
    const end = intl.substring(9);
    return {
      formatted: `+234 ${prefix} ${mid} ${end}`,
      rawDigits: `+${intl}`,
      type: "DIRECT_MOBILE",
    };
  }

  // Nigerian Landline (01-XXXXXXX or 2341XXXXXXX - e.g. Lagos Corporate Switchboard)
  if (digits.startsWith("2341") && (digits.length === 11 || digits.length === 12)) {
    const local = digits.substring(4);
    return {
      formatted: `+234 1 ${local.substring(0, 3)} ${local.substring(3)}`,
      rawDigits: `+${digits}`,
      type: "HEAD_OFFICE_SWITCHBOARD",
    };
  }

  if (digits.startsWith("01") && digits.length === 9) {
    const local = digits.substring(2);
    return {
      formatted: `+234 1 ${local.substring(0, 3)} ${local.substring(3)}`,
      rawDigits: `+2341${local}`,
      type: "HEAD_OFFICE_SWITCHBOARD",
    };
  }

  // Nigerian 0800 / 0700 Toll-Free Customer Care
  if (digits.startsWith("0800") || digits.startsWith("0700") || digits.startsWith("234800")) {
    return {
      formatted: raw.trim(),
      rawDigits: raw.trim(),
      type: "CUSTOMER_CARE",
    };
  }

  // General international or existing formatted
  if (raw.startsWith("+")) {
    return {
      formatted: raw.trim(),
      rawDigits: raw.trim(),
      type: "GENERAL",
    };
  }

  return {
    formatted: `+234 ${digits.substring(Math.max(0, digits.length - 10))}`,
    rawDigits: `+234${digits.substring(Math.max(0, digits.length - 10))}`,
    type: "GENERAL",
  };
}

/**
 * Queries Apify Google Places & Maps Scraper for verified company listing
 */
async function searchApifyGooglePlaces(
  companyName: string,
  location: string
): Promise<PhoneCandidate[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    console.warn("[CRM-Enricher] APIFY_API_TOKEN not configured; skipping Apify Places search");
    return [];
  }

  const cleanLocation = location ? location.replace(/&/g, " ").trim() : "Nigeria";
  const searchQuery = `${companyName} ${cleanLocation}`.trim();

  try {
    const actorId = "nwua9Gu5YrADL7ZDj"; // compass/crawler-google-places
    const url = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${encodeURIComponent(
      token
    )}&timeout=25`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        searchStringsArray: [searchQuery],
        maxCrawledPlacesPerSearch: 2,
        language: "en",
      }),
      signal: AbortSignal.timeout(28000),
    });

    if (!res.ok) {
      console.warn(`[CRM-Enricher] Apify returned HTTP ${res.status}`);
      return [];
    }

    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) return [];

    const candidates: PhoneCandidate[] = [];

    for (const place of items) {
      const rawPhone = place.phone || place.phoneUnformatted;
      if (!rawPhone) continue;

      const { formatted, rawDigits, type } = formatPhoneNumber(rawPhone);
      const isMobile = type === "DIRECT_MOBILE";

      candidates.push({
        phone: rawDigits,
        formattedPhone: formatted,
        type: isMobile ? "DIRECT_MOBILE" : "HEAD_OFFICE_SWITCHBOARD",
        confidence: 95,
        sourceName: "Google Maps Verified Profile",
        sourceUrl: place.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyName)}`,
        address: place.address || undefined,
        website: place.website || undefined,
        companyMatched: place.title || companyName,
      });
    }

    return candidates;
  } catch (err: any) {
    console.error("[CRM-Enricher] Apify search failed:", err.message);
    return [];
  }
}

/**
 * Attempts direct domain contact page crawling
 */
async function crawlDomainForPhone(domainOrUrl: string, companyName: string): Promise<PhoneCandidate[]> {
  if (!domainOrUrl) return [];

  let domain = domainOrUrl.trim().toLowerCase();
  if (domain.includes("@")) {
    domain = domain.split("@")[1];
  }
  domain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

  // Skip common generic webmail domains
  const freeEmailDomains = new Set([
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "aol.com",
    "icloud.com",
    "zoho.com",
    "protonmail.com",
    "example.com",
    "example.ng",
    "example.com.ng",
  ]);

  if (freeEmailDomains.has(domain)) return [];

  const candidateUrls = [
    `https://${domain}/contact`,
    `https://${domain}/contact-us`,
    `https://${domain}/about`,
    `https://${domain}/`,
  ];

  const results: PhoneCandidate[] = [];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OfiaBot/1.0",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) continue;
      const html = await res.text();

      // Extract Nigerian phone matches: 080..., 070..., 090..., +234...
      const phoneRegex = /(?:(?:\+?234\s*(?:\(0\))?\s*)|0)(?:[789][01]\d{1}[\s-]?\d{3}[\s-]?\d{4}|1[\s-]?\d{3}[\s-]?\d{4})/g;
      const matches = html.match(phoneRegex);

      if (matches && matches.length > 0) {
        for (const raw of matches.slice(0, 3)) {
          const { formatted, rawDigits, type } = formatPhoneNumber(raw);
          if (results.some((r) => r.phone.replace(/[^0-9]/g, "") === rawDigits.replace(/[^0-9]/g, ""))) {
            continue;
          }
          results.push({
            phone: rawDigits,
            formattedPhone: formatted,
            type,
            confidence: 90,
            sourceName: `Corporate Website (${domain})`,
            sourceUrl: url,
            website: `https://${domain}`,
            companyMatched: companyName,
          });
        }
        if (results.length > 0) break;
      }
    } catch {
      // Continue to next URL candidate
    }
  }

  return results;
}

/**
 * Main enrichment coordinator
 */
export async function enrichLeadContact(params: {
  leadId: string;
  companyName: string;
  contactName: string;
  currentPhone: string;
  email?: string;
  website?: string;
  location?: string;
}): Promise<EnrichmentResult> {
  const { leadId, companyName, contactName, currentPhone, email, website, location } = params;

  const allCandidates: PhoneCandidate[] = [];

  // Strategy 1: Apify Google Places & Maps Scraper (High Accuracy)
  const apifyResults = await searchApifyGooglePlaces(companyName, location || "Nigeria");
  allCandidates.push(...apifyResults);

  // Strategy 2: Direct Website / Domain Contact Crawler
  const targetDomain = website || (email && email.includes("@") ? email.split("@")[1] : "");
  if (targetDomain) {
    const webResults = await crawlDomainForPhone(targetDomain, companyName);
    for (const wr of webResults) {
      if (!allCandidates.some((c) => c.phone.replace(/[^0-9]/g, "") === wr.phone.replace(/[^0-9]/g, ""))) {
        allCandidates.push(wr);
      }
    }
  }

  // Deduplicate candidates by last 8 digits
  const seenDigits = new Set<string>();
  const uniqueCandidates: PhoneCandidate[] = [];

  for (const cand of allCandidates) {
    const digits = cand.phone.replace(/[^0-9]/g, "");
    const key = digits.length >= 8 ? digits.slice(-8) : digits;
    if (!seenDigits.has(key)) {
      seenDigits.add(key);
      uniqueCandidates.push(cand);
    }
  }

  // Sort candidates by confidence desc
  uniqueCandidates.sort((a, b) => b.confidence - a.confidence);

  return {
    success: uniqueCandidates.length > 0,
    leadId,
    companyName,
    contactName,
    currentPhone,
    candidates: uniqueCandidates,
    error: uniqueCandidates.length === 0 ? "No verified phone numbers found online for this company." : undefined,
  };
}
