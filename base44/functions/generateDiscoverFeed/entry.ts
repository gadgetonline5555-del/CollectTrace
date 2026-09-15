import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const mode = body?.mode === "personalized" ? "personalized" : "default";
    const language = body?.language === "en" ? "en" : "jp";
    const langLabel = language === "en" ? "English" : "日本語";

    // Gather user signals (personalized mode only). Public app: user may be anonymous.
    let user = null;
    try { user = await base44.auth.me(); } catch { /* anonymous */ }

    let signals = "none — produce a balanced global default feed";
    if (mode === "personalized" && user) {
      try {
        const [activity, watch, port] = await Promise.all([
          base44.asServiceRole.entities.UserActivity.filter({ created_by_id: user.id }, "-created_date", 50),
          base44.asServiceRole.entities.Watchlist.filter({ created_by_id: user.id }, "-created_date", 50),
          base44.asServiceRole.entities.Portfolio.filter({ created_by_id: user.id }, "-created_date", 50)
        ]);
        const kw = activity.map((a) => [a.keyword, a.title, a.category, a.ticker].filter(Boolean).join(" ")).join(" | ");
        const wl = watch.map((w) => `${w.ticker}${w.title ? "(" + w.title + ")" : ""}`).join(", ");
        const pf = port.map((p) => `${p.ticker} x${p.shares || 0}`).join(", ");
        signals = `Recent activity: ${kw || "(none)"}. Watchlist: ${wl || "(none)"}. Holdings: ${pf || "(none)"}.`;
      } catch { /* ignore signal failures, fall back to default-ish */ }
    }

    const prompt = `You are the recommendation engine for "Collect Trace", a global real-time investment & world-intelligence platform serving beginners to professionals, in Japan and worldwide.
Goal: produce a discovery feed of topics the user would find useful RIGHT NOW, across world categories.

Mode: ${mode}
Language for ALL output: ${langLabel}
User signals (personalized mode): ${signals}

CATEGORIES — aim for at least one item each, 8-10 topics total:
1. STOCK — lesser-known Japanese stocks where institutional investors move price, surfaced EARLY before mainstream attention (examples: Kioxia / キオクシア, Metaplanet / メタプラネット, Jiban Net / 地盤ネット, Locondo / ロコンド, and similar low-coverage names). Also major catalyst names tied to national policy / geopolitics (semiconductors, US Trump-era policy, country-linked 仕手株/squeeze plays). Frame as CONTEXT ONLY.
2. WEATHER/DISASTER — current weather forecasts, recent earthquakes, seasonal/disaster risk relevant to markets or daily life.
3. GEOPOLITICS/IMMIGRATION/POPULATION — country tendencies (Japan vs abroad), immigration numbers/issues, demographic shifts, historical-era context.
4. SCIENCE/BIOLOGY/HUMANITY — biodiversity, human history, scientific breakthroughs — anything that shifts perspective.
5. MARKET — broad market themes/moves that frame the above.

ABSOLUTE CONSTRAINTS (must follow, non-negotiable):
- Third-party NEUTRAL perspective only. NO investment advice or agency under Japan's 金融商品取引法: never say buy/sell/hold/should, never give target prices as advice, never recommend timing. Frame everything as observation/context ("what to watch", "context that shifts perspective"), NOT a recommendation.
- NO false info, NO speculation presented as fact, NO inflaming ("火に油を注ぐ"), NO sexual content, NO religious content, NO politically biased or one-sided framing.
- DO include minor / trivial contextual info that alone changes how one sees things — but only within the non-advice bounds above.
- Be "otaku-level early": surface lesser-known institutional-moved Japanese names before mainstream coverage, WITHOUT recommending any action.
- Every fact must come from current web information. If unsure, state the limitation plainly in the hook.

Return JSON:
{
  "rationale": "1-2 sentences: why this feed fits the user (personalized) or why it is a balanced world overview (default). Neutral tone.",
  "topics": [
    {
      "category": "stock" | "weather" | "geopolitics" | "science" | "market",
      "title": "concise topic title",
      "hook": "1-2 sentences: why it matters now / minor contextual info that shifts perspective. Neutral, factual, no advice.",
      "angle": "neutral observation of what to watch — NOT a recommendation",
      "drill_query": "a concrete query to deep-dive via the AI research engine",
      "drill_type": "company" | "sector" | "market" | "theme",
      "freshness": "breaking" | "this week" | "ongoing"
    }
  ]
}
Produce 8 to 10 topics. Write ALL text in ${langLabel}.`;

    const llm = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          rationale: { type: "string" },
          topics: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                title: { type: "string" },
                hook: { type: "string" },
                angle: { type: "string" },
                drill_query: { type: "string" },
                drill_type: { type: "string" },
                freshness: { type: "string" }
              },
              required: ["category", "title", "hook", "drill_query"]
            }
          }
        },
        required: ["rationale", "topics"]
      }
    });

    return Response.json({
      mode,
      personalized: mode === "personalized" && !!user,
      rationale: llm.rationale || "",
      topics: Array.isArray(llm.topics) ? llm.topics.slice(0, 10) : []
    });
  } catch (error) {
    console.error("generateDiscoverFeed error:", error?.message || error);
    return Response.json({ error: error?.message || "internal error" }, { status: 500 });
  }
}