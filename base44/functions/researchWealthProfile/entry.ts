import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const query = String(body?.query || "").trim();
    const language = body?.language === "en" ? "en" : "jp";
    const profile_type = ["individual", "company", "institution", "fund", "sovereign"].includes(body?.profile_type) ? body.profile_type : "individual";
    if (!query) return Response.json({ error: "query required" }, { status: 400 });
    if (query.length > 160) return Response.json({ error: "query too long" }, { status: 400 });

    const prev = await base44.asServiceRole.entities.WealthProfile.filter({ query }, "-created_date", 1);
    const previous = prev[0];
    const version = ((previous?.version as number) || 0) + 1;

    const langLabel = language === "en" ? "English" : "日本語";
    const prompt = `You are the global wealth-intelligence engine for "Collect Trace", a real-time investment & world-intelligence platform.
Research the following subject comprehensively using the LATEST public web information (Forbes/Bloomberg billionaires lists, company filings, proxy statements, ownership disclosures, news, philanthropy trackers).

Subject: "${query}"
Profile type: ${profile_type}

Write the ENTIRE response in ${langLabel}.

ABSOLUTE CONSTRAINTS:
- Strictly NEUTRAL, factual, third-party reporting. NO investment advice, NO buy/sell recommendations, NO speculation presented as fact.
- Only state figures backed by public sources. If a figure is estimated or unavailable, say so plainly ("推定", "公開情報なし").
- No inflaming, no sexual, no religious, no politically biased content.
- Cite real source URLs only — never invent URLs.

Return JSON with this exact shape:
{
  "summary": "2-3 sentence overview of who/what this is and current standing.",
  "net_worth": "Current net worth or AUM with currency and source basis (e.g. '約$230B (Forbes 2025実時間長者番付)'). For companies/institutions use market cap or AUM.",
  "annual_income": "Estimated annual income / revenue where publicly known, with basis. '非公開' if unknown.",
  "compensation": "Executive compensation, dividends received, or fund fees — concrete figures with year if available.",
  "holdings": [
    { "name": "holder or holding name", "stake": "ownership % or amount", "type": "individual|corporate|institutional|sovereign", "note": "short context (optional)" }
  ],
  "philanthropy": "Philanthropic activities, foundations, focus areas (climate, education, health, etc.). What causes/businesses they pay attention to.",
  "lifestyle": "Notable assets: cars, real estate/houses, yachts, aircraft, art collections — only publicly reported.",
  "recent_activity": "What they have been doing recently (last ~1-2 years): deals, statements, investments, public moves.",
  "history": "Past background and history: origin, how wealth was built, career arc, major milestones.",
  "key_points": ["...up to 6 bullets"],
  "content": "A full multi-paragraph writeup (400-700 words) synthesizing all of the above with specific figures and dates.",
  "sources": ["...up to 6 real source URLs"]
}
For holdings: if the subject is a COMPANY, list major shareholders (individual, corporate, institutional, sovereign). If the subject is an INDIVIDUAL, list major companies/stakes they own. Always include the holder type so the platform can classify individual vs corporate vs institutional vs sovereign.`;

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          net_worth: { type: "string" },
          annual_income: { type: "string" },
          compensation: { type: "string" },
          holdings: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                stake: { type: "string" },
                type: { type: "string" },
                note: { type: "string" }
              },
              required: ["name", "type"]
            }
          },
          philanthropy: { type: "string" },
          lifestyle: { type: "string" },
          recent_activity: { type: "string" },
          history: { type: "string" },
          key_points: { type: "array", items: { type: "string" } },
          content: { type: "string" },
          sources: { type: "array", items: { type: "string" } }
        },
        required: ["summary", "content"]
      }
    });

    const snapshot = await base44.asServiceRole.entities.WealthProfile.create({
      query,
      profile_type,
      language,
      summary: String(llm.summary || ""),
      net_worth: String(llm.net_worth || ""),
      annual_income: String(llm.annual_income || ""),
      compensation: String(llm.compensation || ""),
      holdings: JSON.stringify(llm.holdings || []),
      philanthropy: String(llm.philanthropy || ""),
      lifestyle: String(llm.lifestyle || ""),
      recent_activity: String(llm.recent_activity || ""),
      history: String(llm.history || ""),
      key_points: JSON.stringify(llm.key_points || []),
      content: String(llm.content || ""),
      sources: JSON.stringify(llm.sources || []),
      version,
      previous_version_id: previous?.id || null
    });

    return Response.json({ snapshot });
  } catch (error) {
    console.error("researchWealthProfile error:", error?.message || error);
    return Response.json({ error: error?.message || "internal error" }, { status: 500 });
  }
}