import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { checkQuota, logCall } from '../../shared/aiQuota.ts';

// Collect Trace Radar — auto-aggregates PRIMARY information at speed.
// US: real EDGAR Atom feed (no API key, just a descriptive User-Agent).
// JP: LLM with web search over timely disclosures (TDnet) + press, real source URLs only.
// Output is structured, sourced RadarItem records — not generated content.

const SEC_UA = "Collect Trace Radar research@collecttrace.app";

function parseAtom(xml: string, formType: string) {
  const out: any[] = [];
  const re = /<entry>([\s\S]*?)<\/entry>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) {
    const e = m[1];
    const title = (e.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim();
    const link = (e.match(/<link[^>]*href="([^"]+)"/) || [])[1];
    const updated = (e.match(/<updated>([^<]+)<\/updated>/) || [])[1];
    if (!title || !link) continue;
    // EDGAR atom title looks like "8-K - Apple Inc. (0000320193)"
    let company = title;
    const dash = title.indexOf(" - ");
    if (dash >= 0) company = title.slice(dash + 3);
    company = company.replace(/\s*\([^)]*\)\s*/g, "").trim();
    const headline = title.replace(/\s*\(Filer\)\s*/g, "").replace(/\s*\([^)]*\)\s*$/, "").trim();
    out.push({
      source: "edgar",
      region: "us",
      form_type: formType,
      headline: headline || title.trim(),
      company_name: company,
      source_url: link,
      published_at: updated || new Date().toISOString(),
      sector: "",
      summary: "",
      content: "",
      sentiment: "neutral",
      language: "jp"
    });
  }
  return out;
}

async function fetchEdgar(formType: string, count: number) {
  try {
    const url = `https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=${formType}&count=${count}&output=atom`;
    const res = await fetch(url, { headers: { "User-Agent": SEC_UA, "Accept": "application/xml" } });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseAtom(xml, formType);
  } catch (e) {
    console.error("radar edgar fetch error:", e?.message || e);
    return [];
  }
}

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const language = body?.language === "en" ? "en" : "jp";

    const quota = await checkQuota(base44, req, "refreshRadar");
    if (!quota.allowed) return Response.json({ error: "quota_exceeded", limit: quota.limit, used: quota.used, tier: quota.identity.tier }, { status: 429 });

    // 1. Real EDGAR fetch (US primary source)
    const [ks8, ks10] = await Promise.all([fetchEdgar("8-K", 20), fetchEdgar("10-K", 8)]);
    const usItems = [...ks8, ...ks10].slice(0, 25);

    // 2. Japan TDnet / press via LLM web search (real source URLs only)
    const langLabel = language === "en" ? "English (keep company names)" : "日本語";
    const jpPrompt = `You are the "Collect Trace Radar" engine. List the most recent (roughly last 24 hours) notable Japanese listed-company timely disclosures (TDnet / 適時開示) and major press releases.
Return ONLY real, verifiable items with real source URLs (TDnet, an exchange, or a reputable news outlet). Never fabricate URLs.
Write everything in ${langLabel}.
Return JSON with this shape: { "items": [ { "headline": string, "company_name": string, "ticker": string, "sector": string, "summary": string (1-2 sentences), "source_url": string, "published_at": ISO string, "form_type": string, "sentiment": "bullish|neutral|bearish" } ] } (up to 12 items).`;

    let jpItems: any[] = [];
    try {
      const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: jpPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  company_name: { type: "string" },
                  ticker: { type: "string" },
                  sector: { type: "string" },
                  summary: { type: "string" },
                  source_url: { type: "string" },
                  published_at: { type: "string" },
                  form_type: { type: "string" },
                  sentiment: { type: "string" }
                },
                required: ["headline", "source_url"]
              }
            }
          },
          required: ["items"]
        }
      });
      jpItems = (llm.items || []).map((it: any) => ({
        source: "tdnet",
        region: "jp",
        form_type: it.form_type || "適時開示",
        headline: String(it.headline || ""),
        company_name: String(it.company_name || ""),
        ticker: String(it.ticker || ""),
        sector: String(it.sector || ""),
        summary: String(it.summary || ""),
        content: "",
        source_url: String(it.source_url || ""),
        published_at: it.published_at || new Date().toISOString(),
        sentiment: ["bullish", "neutral", "bearish"].includes(it.sentiment) ? it.sentiment : "neutral",
        language
      })).filter((it: any) => it.source_url);
    } catch (e) {
      console.error("radar JP LLM error:", e?.message || e);
    }

    await logCall(base44, quota.identity, "refreshRadar");

    // 3. Dedup against recent items by source_url
    const recent = await base44.asServiceRole.entities.RadarItem.list("-created_date", 200);
    const seen = new Set(recent.map((r: any) => r.source_url).filter(Boolean));
    const fresh = [...usItems, ...jpItems].filter((it: any) => it.source_url && !seen.has(it.source_url));

    // 4. Save new items
    let added = 0;
    if (fresh.length > 0) {
      const created = await base44.asServiceRole.entities.RadarItem.bulkCreate(fresh);
      added = Array.isArray(created) ? created.length : 0;
    }

    const latest = await base44.asServiceRole.entities.RadarItem.list("-published_at", 50);
    return Response.json({ added, total: recent.length + added, items: latest });
  } catch (error) {
    console.error("refreshRadar error:", error?.message || error);
    return Response.json({ error: error?.message || "internal error" }, { status: 500 });
  }
}