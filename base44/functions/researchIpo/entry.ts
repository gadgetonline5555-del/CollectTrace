import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const query = String(body?.query || "").trim();
    const language = body?.language === "en" ? "en" : "jp";
    const region = ["jp", "us", "global"].includes(body?.region) ? body.region : "global";
    if (!query) return Response.json({ error: "query required" }, { status: 400 });
    if (query.length > 160) return Response.json({ error: "query too long" }, { status: 400 });

    const prev = await base44.asServiceRole.entities.IpoProfile.filter({ query }, "-created_date", 1);
    const previous = prev[0];
    const version = ((previous?.version as number) || 0) + 1;

    const regionLabel = region === "jp" ? "Japan (東京証券取引所 プライム/グロース/スタンダード)"
      : region === "us" ? "United States (NYSE / Nasdaq)"
      : "Global (all world exchanges, excluding JP/US if not specifically requested)";
    const langLabel = language === "en" ? "English" : "日本語";

    const prompt = `You are the IPO-intelligence engine for "Collect Trace", a real-time investment research platform.
Research the following IPO comprehensively using the LATEST public web information (SEC EDGAR, JPX disclosure, prospectus filings, underwriter announcements, IPO calendars from Rakuten Securities 楽天証券, SBI証券, 松井証券, マネックス証券, moomoo証券, ウィブル証券/Webull, Robinhood, BlackRock, JPモルガン/Morgan Chase, Credit Suisse/UBS, and global financial media).

Target: "${query}"
Region focus: ${regionLabel}

Write the ENTIRE response in ${langLabel}.

ABSOLUTE CONSTRAINTS:
- Strictly NEUTRAL, factual, third-party. NO investment advice, NO buy/sell recommendation, NO "should subscribe" framing. An IPO is an event to analyze, not a product to sell.
- Only state figures backed by public sources/prospectus. Mark estimates as "推定"/"estimated". If a field is unknown or not yet disclosed, say "未開示"/"not disclosed" — never invent.
- No inflaming, no speculation presented as fact, no sexual, religious, or politically biased content.
- Cite real source URLs only.

Return JSON with this exact shape:
{
  "company_name": "Official company name.",
  "ticker": "Ticker symbol if assigned, else ''",
  "exchange": "Listing exchange (e.g. 東証プライム, Nasdaq Global Select Market). '' if unknown.",
  "ipo_date": "Expected or actual listing/IPO date. Mark '予定' if expected.",
  "status": "One of: 申請中/申請済 (filed), 予備審査中, 予定/ 近日 (upcoming), 価格決定 (priced), 上場済 (debuted), 中止/撤回 (withdrawn). Use English equivalents if language is English.",
  "offering_price": "Offer price or price range with currency. '未定' if not yet set.",
  "offering_size": "Total offering size / funds raised with currency and shares if known.",
  "valuation": "Implied market cap / valuation at IPO with currency. '非公開' if unknown.",
  "sector": "Sector/industry.",
  "use_of_proceeds": "Planned use of proceeds (R&D, capex, debt repayment, acquisitions, working capital). From prospectus.",
  "underwriters": ["lead underwriter / bookrunner names — Nomura, SMBC Nikko, Daiwa, Mizuho for JP; Goldman Sachs, Morgan Stanley, JP Morgan, etc. for US"],
  "subscription_demand": "Subscription/oversubscription level if known (e.g. '初値決定時の需要倍率'). '未開示' if unknown.",
  "growth_story": "How the company grows — business model, market position, expansion path, the '泥臭い' operational reality behind the growth.",
  "risks": "Key risk factors from the prospectus (competition, profitability, customer concentration, regulatory, etc.).",
  "comparables": ["comparable listed peers with their tickers"],
  "recent_activity": "Recent IPO-related news (last ~1 year): filing updates, pricing, delays, cornerstone investors.",
  "summary": "2-3 sentence overview of the IPO and why it matters.",
  "key_points": ["...up to 6 bullets"],
  "content": "A full multi-paragraph writeup (400-700 words) synthesizing all of the above with specific figures, dates, and the prospectus-based analysis.",
  "sources": ["...up to 6 real source URLs"]
}
If the query is a broad term (e.g. "日本のIPO 2025", "US upcoming IPOs", "global IPO calendar"), focus on the most notable/relevant recent or upcoming IPOs in that region and summarize the overall market context in summary/content, with company_name set to the aggregate term.`;

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          company_name: { type: "string" },
          ticker: { type: "string" },
          exchange: { type: "string" },
          ipo_date: { type: "string" },
          status: { type: "string" },
          offering_price: { type: "string" },
          offering_size: { type: "string" },
          valuation: { type: "string" },
          sector: { type: "string" },
          use_of_proceeds: { type: "string" },
          underwriters: { type: "array", items: { type: "string" } },
          subscription_demand: { type: "string" },
          growth_story: { type: "string" },
          risks: { type: "string" },
          comparables: { type: "array", items: { type: "string" } },
          recent_activity: { type: "string" },
          summary: { type: "string" },
          key_points: { type: "array", items: { type: "string" } },
          content: { type: "string" },
          sources: { type: "array", items: { type: "string" } }
        },
        required: ["summary", "content"]
      }
    });

    const snapshot = await base44.asServiceRole.entities.IpoProfile.create({
      query,
      region,
      language,
      company_name: String(llm.company_name || ""),
      ticker: String(llm.ticker || ""),
      exchange: String(llm.exchange || ""),
      ipo_date: String(llm.ipo_date || ""),
      status: String(llm.status || ""),
      offering_price: String(llm.offering_price || ""),
      offering_size: String(llm.offering_size || ""),
      valuation: String(llm.valuation || ""),
      sector: String(llm.sector || ""),
      use_of_proceeds: String(llm.use_of_proceeds || ""),
      underwriters: JSON.stringify(llm.underwriters || []),
      subscription_demand: String(llm.subscription_demand || ""),
      growth_story: String(llm.growth_story || ""),
      risks: String(llm.risks || ""),
      comparables: JSON.stringify(llm.comparables || []),
      recent_activity: String(llm.recent_activity || ""),
      summary: String(llm.summary || ""),
      key_points: JSON.stringify(llm.key_points || []),
      content: String(llm.content || ""),
      sources: JSON.stringify(llm.sources || []),
      version,
      previous_version_id: previous?.id || null
    });

    return Response.json({ snapshot });
  } catch (error) {
    console.error("researchIpo error:", error?.message || error);
    return Response.json({ error: error?.message || "internal error" }, { status: 500 });
  }
}