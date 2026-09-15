import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const query = String(body?.query || "").trim();
    const language = body?.language === "en" ? "en" : "jp";
    const query_type = ["company", "sector", "market", "theme"].includes(body?.query_type) ? body.query_type : "company";
    if (!query) return Response.json({ error: "query required" }, { status: 400 });
    if (query.length > 120) return Response.json({ error: "query too long" }, { status: 400 });

    // Chain onto the most recent snapshot for this query (versioning + history)
    const prev = await base44.asServiceRole.entities.AiResearchSnapshot.filter({ query }, "-created_date", 1);
    const previous = prev[0];
    const version = ((previous?.version as number) || 0) + 1;

    const langLabel = language === "en" ? "English" : "日本語";
    const prompt = `You are a real-time investment research assistant for the "Collect Trace" platform.
Research the following ${query_type}: "${query}".

Using the LATEST information available from the web (recent news, earnings, filings, price action, sector trends), produce a structured research brief that serves investors from beginners to professionals.

Write the ENTIRE response in ${langLabel}.

Return JSON with this exact shape:
{
  "summary": "2-3 sentence overview of what this is and why it matters RIGHT NOW",
  "key_points": ["...up to 6 bullets: business model, recent developments, competitive position, customer/fan trends, key risks"],
  "metrics": { "...3 to 6 key metrics with units as strings, e.g. current_price, market_cap, pe_ratio, revenue_growth, dividend_yield, upside" },
  "content": "A full multi-paragraph analysis (400-700 words): what it does and how it makes money, recent earnings/news/moves, competitive comparison, customer/fan trends, key risks, and outlook. Cite specific figures and dates where available.",
  "sources": ["...up to 5 source URLs actually used"],
  "sentiment": "bullish | neutral | bearish"
}
If information is insufficient or the query is ambiguous, still return the JSON with best-effort content and note the limitation in summary. Never invent fake URLs.`;

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          key_points: { type: "array", items: { type: "string" } },
          metrics: { type: "object", additionalProperties: true },
          content: { type: "string" },
          sources: { type: "array", items: { type: "string" } },
          sentiment: { type: "string" }
        },
        required: ["summary", "key_points", "content"]
      }
    });

    const snapshot = await base44.asServiceRole.entities.AiResearchSnapshot.create({
      query,
      query_type,
      language,
      summary: String(llm.summary || ""),
      key_points: JSON.stringify(llm.key_points || []),
      metrics: JSON.stringify(llm.metrics || {}),
      content: String(llm.content || ""),
      sources: JSON.stringify(llm.sources || []),
      sentiment: ["bullish", "neutral", "bearish"].includes(llm.sentiment) ? llm.sentiment : "neutral",
      version,
      previous_version_id: previous?.id || null
    });

    return Response.json({ snapshot });
  } catch (error) {
    console.error("refreshAiResearch error:", error?.message || error);
    return Response.json({ error: error?.message || "internal error" }, { status: 500 });
  }
}