/**
 * AI & Web Intelligence Email Enricher for CRM Audience Lists & Contacts
 * 
 * Powered by:
 * 1. Internal CRM Cross-Reference (matches from verified crm_leads records)
 * 2. Google Places & Business Profile Search (live official website & Google listing email)
 * 3. Apify Google Places & Business Scraper (extracts verified corporate website & email)
 * 4. Direct Corporate Website & Domain Crawler (/contact, /contact-us, /about, /team, /)
 * 
 * Note: Purely extracts real, publicly available or verified emails.
 * Synthetic email permutations/patterns are not generated.
 */

export interface EmailCandidate {
  email: string;
  type: "DIRECT_DECISION_MAKER" | "EXECUTIVE_OFFICE" | "CORPORATE_HQ" | "GENERAL";
  confidence: number; // 0 - 100
  sourceName: string;
  sourceUrl?: string;
  website?: string;
  domain?: string;
  companyMatched?: string;
}

export interface EmailEnrichmentResult {
  success: boolean;
  subscriberId: string;
  companyName: string;
  contactName: string;
  currentEmail: string;
  currentPhone?: string;
  linkedinUrl?: string;
  candidates: EmailCandidate[];
  error?: string;
}

const COMMON_FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "outlook.com",
  "hotmail.com",
  "aol.com",
  "icloud.com",
  "zoho.com",
  "protonmail.com",
  "mail.com",
  "yandex.com",
  "example.com",
  "example.ng",
  "example.com.ng",
]);

const DUMMY_SUBSTRINGS = [
  "sentry",
  "wixpress",
  "example.com",
  "example.ng",
  "example.com.ng",
  "doe.com",
  "test.com",
  "schema.org",
  "domain.com",
  "sample.com",
  "placeholder",
  "yourcompany.com",
  "yoursite.com",
];

const DUMMY_PREFIXES = [
  "john.doe@",
  "johndoe@",
  "john@",
  "jane.doe@",
  "user@",
  "email@",
  "yourname@",
  "test@",
  "name@",
];

/**
 * Validates whether an email string is well-formed and not a dummy template placeholder
 */
export function isValidEmail(email?: string | null): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) return false;

  // Filter out image assets, fonts, or dummy strings
  if (
    trimmed.endsWith(".png") ||
    trimmed.endsWith(".jpg") ||
    trimmed.endsWith(".jpeg") ||
    trimmed.endsWith(".webp") ||
    trimmed.endsWith(".svg") ||
    trimmed.endsWith(".gif") ||
    trimmed.endsWith(".css") ||
    trimmed.endsWith(".js")
  ) {
    return false;
  }

  // Filter out placeholder domains and dummy examples
  for (const dummy of DUMMY_SUBSTRINGS) {
    if (trimmed.includes(dummy)) return false;
  }

  // Filter out template placeholder prefixes (e.g. john@doe.com)
  for (const pref of DUMMY_PREFIXES) {
    if (trimmed.startsWith(pref)) return false;
  }

  return true;
}

/**
 * Derives a clean company domain guess from company name for crawl fallback
 * e.g. "Chevron Nigeria Limited" -> "chevron.com"
 * e.g. "Erisco Foods Limited" -> "eriscofoods.com"
 */
export function deriveCompanyDomains(companyName: string): string[] {
  if (!companyName) return [];
  const clean = companyName
    .toLowerCase()
    .replace(/[“"”]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\b(plc|limited|ltd|corp|corporation|inc|incorporated|holdings|group|enterprise|enterprises|nigeria|nig|west africa)\b/gi, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();

  if (!clean || clean.length < 2) return [];

  return [
    `${clean}.com`,
    `${clean}.com.ng`,
    `${clean}.ng`,
  ];
}

/**
 * Direct Google Places API search for verified company website and listing details
 */
async function searchGooglePlacesForWebsite(
  companyName: string,
  location: string = "Nigeria"
): Promise<{ website?: string; domain?: string; sourceUrl?: string; companyMatched?: string }> {
  const apiKey =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "AIzaSyCPSko-yh7VsQtpPyKzRmbXJWQOdcCJ8BE";

  if (!apiKey || !companyName) return {};

  try {
    const cleanLocation = location ? location.replace(/&/g, " ").trim() : "Nigeria";
    const query = `${companyName} ${cleanLocation}`.trim();
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${apiKey}`;

    const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(6000) });
    if (!searchRes.ok) return {};

    const searchData = await searchRes.json();
    const firstResult = searchData.results?.[0];
    if (!firstResult || !firstResult.place_id) return {};

    const placeId = firstResult.place_id;
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,website,formatted_phone_number,url&key=${apiKey}`;
    const detailsRes = await fetch(detailsUrl, { signal: AbortSignal.timeout(6000) });
    if (!detailsRes.ok) return {};

    const detailsData = await detailsRes.json();
    const place = detailsData.result;
    if (!place) return {};

    let detectedWebsite = place.website;
    let detectedDomain = "";
    if (detectedWebsite) {
      detectedDomain = detectedWebsite
        .replace(/^https?:\/\//i, "")
        .replace(/^www\./i, "")
        .split("/")[0]
        .toLowerCase();
    }

    return {
      website: detectedWebsite || undefined,
      domain: detectedDomain || undefined,
      sourceUrl: place.url || undefined,
      companyMatched: place.name || companyName,
    };
  } catch (err: any) {
    console.warn("[CRM-EmailEnricher] Google Places search warning:", err.message);
    return {};
  }
}

/**
 * Scrapes Google Places business profiles via Apify (if token configured)
 */
async function searchApifyPlacesForEmail(
  companyName: string,
  location: string = "Nigeria"
): Promise<{ emails: EmailCandidate[]; website?: string; domain?: string }> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    return { emails: [] };
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

    if (!res.ok) return { emails: [] };

    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) return { emails: [] };

    const emails: EmailCandidate[] = [];
    let detectedWebsite = "";
    let detectedDomain = "";

    for (const place of items) {
      if (place.website) {
        detectedWebsite = place.website;
        const cleanDomain = place.website
          .replace(/^https?:\/\//i, "")
          .replace(/^www\./i, "")
          .split("/")[0]
          .toLowerCase();
        if (cleanDomain && !COMMON_FREE_EMAIL_DOMAINS.has(cleanDomain)) {
          detectedDomain = cleanDomain;
        }
      }

      if (place.email && isValidEmail(place.email)) {
        emails.push({
          email: place.email.trim().toLowerCase(),
          type: "CORPORATE_HQ",
          confidence: 96,
          sourceName: "Google Maps Verified Profile",
          sourceUrl: place.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyName)}`,
          website: place.website || undefined,
          domain: detectedDomain || undefined,
          companyMatched: place.title || companyName,
        });
      }
    }

    return { emails, website: detectedWebsite, domain: detectedDomain };
  } catch (err: any) {
    console.error("[CRM-EmailEnricher] Apify search failed:", err.message);
    return { emails: [] };
  }
}

/**
 * Crawls a website domain's /contact, /about, /team, and homepage to extract published emails
 */
async function crawlDomainForEmails(
  domainOrUrl: string,
  companyName: string
): Promise<EmailCandidate[]> {
  if (!domainOrUrl) return [];

  let domain = domainOrUrl.trim().toLowerCase();
  if (domain.includes("@")) {
    domain = domain.split("@")[1];
  }
  domain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");

  if (COMMON_FREE_EMAIL_DOMAINS.has(domain)) return [];

  const candidateUrls = [
    `https://${domain}/contact`,
    `https://${domain}/contact-us`,
    `https://${domain}/about`,
    `https://${domain}/about-us`,
    `https://${domain}/team`,
    `https://${domain}/`,
  ];

  const results: EmailCandidate[] = [];
  const seenEmails = new Set<string>();

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OfiaBot/1.0",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(4500),
      });

      if (!res.ok) continue;
      const html = await res.text();

      // 1. Extract mailto: links directly
      const mailtoRegex = /href=["']mailto:([^"'>\?]+)/gi;
      let mailtoMatch: RegExpExecArray | null;
      while ((mailtoMatch = mailtoRegex.exec(html)) !== null) {
        const mail = mailtoMatch[1]?.trim().toLowerCase();
        if (isValidEmail(mail) && !seenEmails.has(mail)) {
          seenEmails.add(mail);
          const emailDomain = mail.split("@")[1];
          const isMatchingDomain = emailDomain === domain || emailDomain.endsWith(`.${domain}`);
          results.push({
            email: mail,
            type: mail.startsWith("info@") || mail.startsWith("contact@") ? "CORPORATE_HQ" : "DIRECT_DECISION_MAKER",
            confidence: isMatchingDomain ? 95 : 88,
            sourceName: `Corporate Website (${domain})`,
            sourceUrl: url,
            website: `https://${domain}`,
            domain,
            companyMatched: companyName,
          });
        }
      }

      // 2. Extract general email patterns from body text
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const matches = html.match(emailRegex);

      if (matches && matches.length > 0) {
        for (const raw of matches) {
          const cleanEmail = raw.toLowerCase().trim();
          if (!isValidEmail(cleanEmail) || seenEmails.has(cleanEmail)) continue;

          const emailDomain = cleanEmail.split("@")[1];
          const isMatchingDomain = emailDomain === domain || emailDomain.endsWith(`.${domain}`);
          const confidence = isMatchingDomain ? 94 : 85;

          const isDirect =
            !cleanEmail.startsWith("info@") &&
            !cleanEmail.startsWith("contact@") &&
            !cleanEmail.startsWith("support@") &&
            !cleanEmail.startsWith("sales@");

          seenEmails.add(cleanEmail);
          results.push({
            email: cleanEmail,
            type: isDirect ? "DIRECT_DECISION_MAKER" : "CORPORATE_HQ",
            confidence,
            sourceName: `Corporate Website (${domain})`,
            sourceUrl: url,
            website: `https://${domain}`,
            domain,
            companyMatched: companyName,
          });
        }
        if (results.length >= 5) break;
      }
    } catch {
      // Continue next URL
    }
  }

  return results;
}

/**
 * Main coordinator for finding verified, real-time public email addresses
 */
export async function enrichSubscriberEmail(params: {
  subscriberId: string;
  companyName: string;
  contactName: string;
  phone?: string;
  linkedinUrl?: string;
  tenantSlug: string;
  sql: any;
}): Promise<EmailEnrichmentResult> {
  const { subscriberId, companyName, contactName, phone, linkedinUrl, tenantSlug, sql } = params;

  const allCandidates: EmailCandidate[] = [];
  const seenEmails = new Set<string>();

  // Strategy 1: Check Internal CRM Database (crm_leads) for exact matches
  try {
    const cleanPhone = (phone || "").replace(/[^0-9]/g, "");
    const last8Digits = cleanPhone.length >= 8 ? cleanPhone.slice(-8) : "";
    const cleanComp = companyName.toLowerCase().trim();
    const cleanLinkedin = (linkedinUrl || "").toLowerCase().trim();

    const leadMatches = await sql`
      SELECT email, name, company, linkedin_url, phone
      FROM crm_leads
      WHERE LOWER(tenant_slug) = ${tenantSlug}
        AND email IS NOT NULL AND TRIM(email) != ''
        AND (
          (${cleanLinkedin !== ""} AND LOWER(TRIM(linkedin_url)) = ${cleanLinkedin})
          OR (${cleanComp !== ""} AND LOWER(TRIM(company)) = ${cleanComp})
          OR (${last8Digits !== ""} AND phone != '' AND RIGHT(REGEXP_REPLACE(phone, '[^0-9]', '', 'g'), 8) = ${last8Digits})
        )
      ORDER BY created_at DESC
      LIMIT 5;
    `;

    for (const lm of leadMatches) {
      const email = String(lm.email).toLowerCase().trim();
      if (isValidEmail(email) && !seenEmails.has(email)) {
        seenEmails.add(email);
        const isExactName = contactName && lm.name && lm.name.toLowerCase().includes(contactName.toLowerCase());
        allCandidates.push({
          email,
          type: "DIRECT_DECISION_MAKER",
          confidence: isExactName ? 98 : 92,
          sourceName: "Verified CRM Lead Record",
          companyMatched: lm.company || companyName,
        });
      }
    }
  } catch (err: any) {
    console.warn("[CRM-EmailEnricher] DB cross-ref error:", err.message);
  }

  // Strategy 2: Google Places Direct API Search for Company Website
  let targetDomain = "";
  if (companyName) {
    const placesRes = await searchGooglePlacesForWebsite(companyName, "Nigeria");
    if (placesRes.domain) {
      targetDomain = placesRes.domain;
    }
  }

  // Strategy 3: Apify Google Places & Business Scraper (if token configured)
  if (companyName) {
    const apifyRes = await searchApifyPlacesForEmail(companyName, "Nigeria");
    if (apifyRes.domain && !targetDomain) {
      targetDomain = apifyRes.domain;
    }
    for (const c of apifyRes.emails) {
      if (!seenEmails.has(c.email)) {
        seenEmails.add(c.email);
        allCandidates.push(c);
      }
    }
  }

  // Strategy 4: Real Corporate Website Crawl for Published Emails
  const candidateDomains = targetDomain
    ? [targetDomain]
    : deriveCompanyDomains(companyName);

  for (const d of candidateDomains) {
    const crawled = await crawlDomainForEmails(d, companyName);
    for (const c of crawled) {
      if (!seenEmails.has(c.email)) {
        seenEmails.add(c.email);
        allCandidates.push(c);
      }
    }
    if (crawled.length > 0) {
      break;
    }
  }

  // Sort candidates strictly by confidence descending
  allCandidates.sort((a, b) => b.confidence - a.confidence);

  return {
    success: allCandidates.length > 0,
    subscriberId,
    companyName,
    contactName,
    currentEmail: "",
    currentPhone: phone,
    linkedinUrl,
    candidates: allCandidates,
    error: allCandidates.length === 0 ? "No verified corporate email addresses found online for this company." : undefined,
  };
}
