/**
 * AI & Web Intelligence Email Enricher for CRM Audience Lists & Contacts
 * 
 * Powered by:
 * 1. Internal CRM Cross-Reference (matches from crm_leads, verified subscribers & call logs)
 * 2. Apify Google Places & Business Scraper (extracts verified corporate website & email)
 * 3. Direct Corporate Website & Domain Crawler (/contact, /about, /team)
 * 4. Decision Maker Email Syntax & Permutation Engine (first.last@, f.last@, info@)
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

/**
 * Validates whether an email string is well-formed
 */
export function isValidEmail(email?: string | null): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) return false;

  // Filter out image assets or dummy strings
  if (
    trimmed.endsWith(".png") ||
    trimmed.endsWith(".jpg") ||
    trimmed.endsWith(".webp") ||
    trimmed.endsWith(".svg") ||
    trimmed.includes("sentry") ||
    trimmed.includes("wixpress")
  ) {
    return false;
  }

  return true;
}

/**
 * Derives a clean company domain guess from company name
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
    `${clean}.ng`,
    `${clean}.com.ng`,
  ];
}

/**
 * Generates decision-maker email permutations from contact name and domain
 */
export function generateEmailPermutations(
  firstName: string,
  lastName: string,
  domain: string,
  companyName: string
): EmailCandidate[] {
  if (!domain || COMMON_FREE_EMAIL_DOMAINS.has(domain)) return [];

  const fn = firstName.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  const ln = lastName.toLowerCase().replace(/[^a-z0-9]/g, "").trim();
  const candidates: EmailCandidate[] = [];

  if (fn && ln) {
    // 1. first.last@domain (Standard corporate format - 92% confidence)
    candidates.push({
      email: `${fn}.${ln}@${domain}`,
      type: "DIRECT_DECISION_MAKER",
      confidence: 92,
      sourceName: `Corporate Domain Pattern (${domain})`,
      domain,
      companyMatched: companyName,
    });

    // 2. f.last@domain (High prevalence - 88% confidence)
    candidates.push({
      email: `${fn[0]}.${ln}@${domain}`,
      type: "DIRECT_DECISION_MAKER",
      confidence: 88,
      sourceName: `Corporate Domain Pattern (${domain})`,
      domain,
      companyMatched: companyName,
    });

    // 3. flast@domain (85% confidence)
    candidates.push({
      email: `${fn[0]}${ln}@${domain}`,
      type: "DIRECT_DECISION_MAKER",
      confidence: 85,
      sourceName: `Corporate Domain Pattern (${domain})`,
      domain,
      companyMatched: companyName,
    });

    // 4. first@domain (82% confidence)
    candidates.push({
      email: `${fn}@${domain}`,
      type: "DIRECT_DECISION_MAKER",
      confidence: 82,
      sourceName: `Corporate Domain Pattern (${domain})`,
      domain,
      companyMatched: companyName,
    });
  } else if (fn) {
    candidates.push({
      email: `${fn}@${domain}`,
      type: "DIRECT_DECISION_MAKER",
      confidence: 80,
      sourceName: `Corporate Domain Pattern (${domain})`,
      domain,
      companyMatched: companyName,
    });
  }

  // General corporate inboxes (always reliable fallbacks)
  candidates.push({
    email: `info@${domain}`,
    type: "CORPORATE_HQ",
    confidence: 78,
    sourceName: `Corporate HQ Switchboard (${domain})`,
    domain,
    companyMatched: companyName,
  });

  candidates.push({
    email: `contact@${domain}`,
    type: "CORPORATE_HQ",
    confidence: 75,
    sourceName: `Corporate Inquiries (${domain})`,
    domain,
    companyMatched: companyName,
  });

  return candidates;
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
 * Crawls a website domain's /contact, /about, and homepage to extract emails
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
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) continue;
      const html = await res.text();

      // Email regex
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const matches = html.match(emailRegex);

      if (matches && matches.length > 0) {
        for (const raw of matches) {
          const cleanEmail = raw.toLowerCase().trim();
          if (!isValidEmail(cleanEmail) || seenEmails.has(cleanEmail)) continue;

          // Prefer emails matching the company domain
          const emailDomain = cleanEmail.split("@")[1];
          const isMatchingDomain = emailDomain === domain || emailDomain.endsWith(`.${domain}`);
          const confidence = isMatchingDomain ? 94 : 85;

          const isDirect = !cleanEmail.startsWith("info@") && !cleanEmail.startsWith("contact@") && !cleanEmail.startsWith("support@") && !cleanEmail.startsWith("sales@");

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
        if (results.length >= 3) break;
      }
    } catch {
      // Continue next URL
    }
  }

  return results;
}

/**
 * Main coordinator for finding verified and probable email addresses
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

  const nameParts = contactName.trim().split(/\s+/);
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

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

  // Strategy 2: Google Places & Apify Intelligence
  let targetDomain = "";
  if (companyName) {
    const apifyRes = await searchApifyPlacesForEmail(companyName, "Nigeria");
    if (apifyRes.domain) {
      targetDomain = apifyRes.domain;
    }
    for (const c of apifyRes.emails) {
      if (!seenEmails.has(c.email)) {
        seenEmails.add(c.email);
        allCandidates.push(c);
      }
    }
  }

  // Strategy 3: Domain Guessing & Direct Website Crawl
  const candidateDomains = targetDomain
    ? [targetDomain]
    : deriveCompanyDomains(companyName);

  for (const d of candidateDomains) {
    if (!targetDomain) targetDomain = d;
    const crawled = await crawlDomainForEmails(d, companyName);
    for (const c of crawled) {
      if (!seenEmails.has(c.email)) {
        seenEmails.add(c.email);
        allCandidates.push(c);
      }
    }
    if (crawled.length > 0) {
      targetDomain = d;
      break;
    }
  }

  // Strategy 4: Corporate Decision Maker Email Permutations (if target domain resolved)
  if (targetDomain) {
    const perms = generateEmailPermutations(firstName, lastName, targetDomain, companyName);
    for (const p of perms) {
      if (!seenEmails.has(p.email)) {
        seenEmails.add(p.email);
        allCandidates.push(p);
      }
    }
  }

  // Sort candidates by confidence descending
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
