export interface GeminiReplyResult {
  text: string;
  model: string;
  success: boolean;
  error?: string;
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const FALLBACK_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

const rawUserUrl =
  process.env.USER_SERVICE_URL ||
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ||
  "https://ofia-user-service.onrender.com";
const cleanUserUrl = rawUserUrl.replace(/\/+$/, "");
const USER_BASE = cleanUserUrl.endsWith("/api/v1") ? cleanUserUrl : `${cleanUserUrl}/api/v1`;

/**
 * Generate an AI support autoreply using Gemini 3.8 Flash
 * when human support staff is offline.
 */
export async function generateSupportAutoreply(params: {
  sessionId: string;
  visitorMessage: string;
  visitorName?: string;
}): Promise<GeminiReplyResult> {
  const { sessionId, visitorMessage, visitorName } = params;
  const apiKey = process.env.GEMINI_API_KEY;

  // 1. Fetch published KB articles via service_users HTTP proxy
  let kbContext = "";
  try {
    const kbRes = await fetch(`${USER_BASE}/support/kb/articles?status=published`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (kbRes.ok) {
      const articles = await kbRes.json();
      if (Array.isArray(articles) && articles.length > 0) {
        kbContext = "\n\n--- OFIA KNOWLEDGE BASE ---\n" + articles.slice(0, 10)
          .map((r: any) => `### ${r.title} (${r.category})\n${r.content}`)
          .join("\n\n");
      }
    }
  } catch (err) {
    console.warn("[Gemini Autoreply] Could not fetch KB articles:", err);
  }

  // 2. Fetch recent conversation history via service_users HTTP proxy
  const historyContents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];
  try {
    const histRes = await fetch(`${USER_BASE}/support/chat/history?session_id=${encodeURIComponent(sessionId)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (histRes.ok) {
      const messages = await histRes.json();
      if (Array.isArray(messages)) {
        for (const row of messages.slice(-8)) {
          const isUser = row.sender === "Visitor" || row.sender === "Guest Visitor" || row.sender === "Guest";
          historyContents.push({
            role: isUser ? "user" : "model",
            parts: [{ text: row.text }],
          });
        }
      }
    }
  } catch (err) {
    console.warn("[Gemini Autoreply] Could not fetch history:", err);
  }

  // Ensure current message is in contents
  if (
    historyContents.length === 0 ||
    historyContents[historyContents.length - 1].parts[0].text !== visitorMessage
  ) {
    historyContents.push({
      role: "user",
      parts: [{ text: visitorMessage }],
    });
  }

  // 3. System instruction
  const systemInstruction = `You are the official Ofia AI Support Assistant (powered by Gemini 3.8 Flash) for the Ofia Business Operating System (ofia.ng).
Our platform provides unified multi-tenant infrastructure for African commerce and enterprises:
- 10 Industry-specific storefronts (.ofia.shop) with vertical workflows and milestone escrow
- Enterprise ERP Suite (General Ledger, FIRS 7.5% VAT, 360 appraisals, offline POS)
- Mobility & Transport OS (interstate, shuttles, charters, school & staff transport)
- Logistics & Fulfillment dispatch with courier APIs and rider GPS tracking
- Ofia Voice Agent for PSTN telephony qualification, CRM, and customer support

Instructions:
- Be polite, professional, concise, and helpful.
- Reference the Knowledge Base context when available.
- Mention that human support staff is currently offline, but you are here to assist with platform information, tenant onboarding, and pricing.
- If the visitor's request requires human staff action (e.g., account unlock, custom enterprise contract), advise them to leave their email or phone number and assure them an agent will follow up.${kbContext}`;

  // If no API key configured or if key is empty
  if (!apiKey || apiKey.trim() === "") {
    return {
      text: "Hello! Thank you for reaching out to Ofia Support. Our human support agents are currently offline, but our AI assistant has logged your inquiry. Please feel free to ask questions about our platform, or leave your email so an agent can follow up with you.",
      model: "local-fallback",
      success: false,
      error: "GEMINI_API_KEY is not configured.",
    };
  }

  // Models to attempt: primary Gemini 3.8 Flash followed by fallbacks
  const candidateModels = [DEFAULT_MODEL, ...FALLBACK_MODELS.filter((m) => m !== DEFAULT_MODEL)];

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const payload = {
        contents: historyContents,
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data?.candidates?.[0];
        const generatedText = candidate?.content?.parts?.[0]?.text;

        if (generatedText && generatedText.trim()) {
          return {
            text: generatedText.trim(),
            model,
            success: true,
          };
        }
      } else {
        const errorBody = await response.text();
        console.warn(`[Gemini Autoreply] Model ${model} returned ${response.status}:`, errorBody);

        if (response.status === 403) {
          return {
            text: "Hello! Thank you for contacting Ofia Support. Our human operators are currently offline, and your inquiry has been queued at high priority. Please leave your email or phone number and an operator will contact you as soon as they are back online.",
            model,
            success: false,
            error: `Gemini API 403 Permission Denied: ${errorBody}`,
          };
        }
      }
    } catch (err: any) {
      console.error(`[Gemini Autoreply] Exception calling model ${model}:`, err);
    }
  }

  return {
    text: "Thank you for reaching out to Ofia Support! Our human support staff is currently offline. Your inquiry has been safely logged in our support queue, and our team will get back to you as soon as they are back online.",
    model: "local-fallback",
    success: false,
    error: "All Gemini API model candidates failed or timed out.",
  };
}
