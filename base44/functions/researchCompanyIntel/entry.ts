import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const query = String(body?.query || "").trim();
    const language = body?.language === "en" ? "en" : "jp";
    const company_type = ["listed", "private", "subsidiary"].includes(body?.company_type) ? body.company_type : "listed";
    if (!query) return Response.json({ error: "query required" }, { status: 400 });
    if (query.length > 160) return Response.json({ error: "query too long" }, { status: 400 });

    const prev = await base44.asServiceRole.entities.CompanyIntel.filter({ query }, "-created_date", 1);
    const previous = prev[0];
    const version = ((previous?.version as number) || 0) + 1;

    const langLabel = language === "en" ? "English" : "日本語";
    const prompt = `You are the corporate-intelligence engine for "Collect Trace", a real-time investment research platform.
Research the following company comprehensively using the LATEST public web information (filings, Crunchbase/PitchBook-style funding data, M&A databases, ownership disclosures, earnings, index data).

Subject: "${query}"
Company type: ${company_type}

Write the ENTIRE response in ${langLabel}.

ABSOLUTE CONSTRAINTS:
- Strictly NEUTRAL, factual, third-party. NO investment advice, NO buy/sell, NO target prices as advice. Frame valuations as observation, not recommendation.
- Only state figures backed by public sources. Mark estimates as "推定" / "estimated". If unavailable, say so plainly.
- No inflaming, no sexual, no religious, no politically biased content.
- Cite real source URLs only — never invent URLs.

Return JSON with this exact shape:
{
  "summary": "2-3 sentence overview: what the company is, its scale, and current standing.",
  "market_cap": "Current market cap / valuation with currency and date. For private companies use latest funding valuation. '非公開' if unknown.",
  "intrinsic_value": "A fundamental assessment of the company's REAL value based on earnings, cash flows, assets, growth — NOT just market price. Compare to market cap and state whether the stock looks richly valued, fairly valued, or undervalued on fundamentals. Be specific with reasoning.",
  "index_lift": "How much of the current market price is driven by passive/index flows (S&P 500, All-Country World Index, Nasdaq-100 inclusion, etc.) vs company-specific fundamentals. For Magnificent-7 / mega-caps, quantify the index-passive contribution where possible.",
  "growth_rate": "Revenue/earnings growth rate (YoY, recent) with context. For private companies use key metric growth (users, ARR, GMV).",
  "investors": [
    { "name": "investor name", "type": "vc|pe|corporate|sovereign|angel|public_market", "stage": "round/series or 'public'", "amount": "amount invested or stake", "note": "optional context" }
  ],
  "investments": [
    { "name": "company/asset this subject invested in or acquired", "type": "acquisition|stake|fund|jv", "stake": "ownership or deal size", "note": "optional context" }
  ],
  "partnerships": [
    { "name": "partner name", "nature": "alliance|JV|supplier|customer|tech", "note": "what the relationship is" }
  ],
  "corporate_structure": "Group structure: parent, major subsidiaries, holdco structure, listed/unlisted entities within the group, cross-shareholdings. The corporate web / 構図.",
  "growth_story": "How the company actually grows — business model mechanics, expansion path, moat, and the '泥臭い' (unglamorous) operational reality behind the growth.",
  "key_points": ["...up to 6 bullets"],
  "content": "A full multi-paragraph writeup (400-700 words) synthesizing all of the above with specific figures, dates, and the real-value vs market-price analysis.",
  "sources": ["...up to 6 real source URLs"]
}
Cover both listed and private/unlisted companies. For the Magnificent 7 (Google/Alphabet, Amazon, Meta, Microsoft, Apple, Nvidia, Tesla) and similar mega-caps, be especially concrete about index-passive vs fundamental value.`;

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          market_cap: { type: "string" },
          intrinsic_value: { type: "string" },
          index_lift: { type: "string" },
          growth_rate: { type: "string" },
          investors: {
            type: "array",
            items: {
              type: "object",
              properties: { name: { type: "string" }, type: { type: "string" }, stage: { type: "string" }, amount: { type: "string" }, note: { type: "string" } },
              required: ["name"]
            }
          },
          investments: {
            type: "array",
            items: {
              type: "object",
              properties: { name: { type: "string" }, type: { type: "string" }, stake: { type: "string" }, note: { type: "string" } },
              required: ["name"]
            }
          },
          partnerships: {
            type: "array",
            items: {
              type: "object",
              properties: { name: { type: "string" }, nature: { type: "string" }, note: { type: "string" } },
              required: ["name"]
            }
          },
          corporate_structure: { type: "string" },
          growth_story: { type: "string" },
          key_points: { type: "array", items: { type: "string" } },
          content: { type: "string" },
          sources: { type: "array", items: { type: "string" } }
        },
        required: ["summary", "content"]
      }
    });

    const snapshot = await base44.asServiceRole.entities.CompanyIntel.create({
      query,
      company_type,
      language,
      summary: String(llm.summary || ""),
      market_cap: String(llm.market_cap || ""),
      intrinsic_value: String(llm.intrinsic_value || ""),
      index_lift: String(llm.index_lift || ""),
      growth_rate: String(llm.growth_rate || ""),
      investors: JSON.stringify(llm.investors || []),
      investments: JSON.stringify(llm.investments || []),
      partnerships: JSON.stringify(llm.partnerships || []),
      corporate_structure: String(llm.corporate_structure || ""),
      growth_story: String(llm.growth_story || ""),
      key_points: JSON.stringify(llm.key_points || []),
      content: String(llm.content || ""),
      sources: JSON.stringify(llm.sources || []),
      version,
      previous_version_id: previous?.id || null
    });

    return Response.json({ snapshot });
  } catch (error) {
    console.error("researchCompanyIntel error:", error?.message || error);
    return Response.json({ error: error?.message || "internal error" }, { status: 500 });
  }
}