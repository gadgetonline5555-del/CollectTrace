export const PLANS = [
  {
    id: "free",
    price: 0,
    accent: "from-slate-400 to-slate-600",
    ring: "ring-slate-500/40",
    name: { jp: "フリー", en: "Free" },
    audience: { jp: "初心者", en: "Beginner" },
    tagline: { jp: "投資の第一歩を漫画で", en: "Your first step into investing, through manga" },
    priceLabel: { jp: "無料", en: "Free" },
    features: {
      jp: ["投資基礎漫画 12作品", "週1話の新作配信", "コミュニティ閲覧", "広告付き配信"],
      en: ["12 foundational manga", "New episode weekly", "Community read-only", "Ad-supported streaming"]
    },
    locked: {
      jp: ["銘柄スクリーニング", "個別銘柄レポート", "市場データAPI"],
      en: ["Stock screening", "Stock reports", "Market data API"]
    }
  },
  {
    id: "starter",
    price: 1000,
    accent: "from-cyan-400 to-blue-600",
    ring: "ring-cyan-400/50",
    name: { jp: "スターター", en: "Starter" },
    audience: { jp: "初中級者", en: "Beginner+" },
    tagline: { jp: "漫画で学び、データに触れる", en: "Learn through manga, touch the data" },
    priceLabel: { jp: "¥1,000/月", en: "¥1,000/mo" },
    features: {
      jp: ["全漫画コンテンツ広告なし", "基礎スクリーニング機能", "初心者向けレポート閲覧", "銘柄ウォッチリスト"],
      en: ["Ad-free manga library", "Basic stock screening", "Beginner-level reports", "Stock watchlist"]
    },
    locked: {
      jp: ["詳細財務分析", "プロ級レポート"],
      en: ["Detailed financial analysis", "Pro-level reports"]
    }
  },
  {
    id: "pro",
    price: 10000,
    accent: "from-violet-400 to-fuchsia-600",
    ring: "ring-violet-400/50",
    name: { jp: "プロ", en: "Pro" },
    audience: { jp: "中級者", en: "Intermediate" },
    tagline: { jp: "本格的な調査と分析", en: "Serious research and analysis" },
    priceLabel: { jp: "¥10,000/月", en: "¥10,000/mo" },
    features: {
      jp: ["中級スクリーニング & 財務分析", "詳細個別銘柄レポート", "テーマ別調査レポート", "市場センチメント可視化"],
      en: ["Advanced screening & financials", "Detailed stock reports", "Thematic research", "Market sentiment visuals"]
    },
    locked: {
      jp: ["機関級データ", "専属レポート"],
      en: ["Institutional data", "Dedicated reports"]
    }
  },
  {
    id: "elite",
    price: 100000,
    accent: "from-amber-300 to-orange-500",
    ring: "ring-amber-400/50",
    name: { jp: "エリート", en: "Elite" },
    audience: { jp: "プロフェッショナル", en: "Professional" },
    tagline: { jp: "機関投資家レベルの情報", en: "Institution-grade intelligence" },
    priceLabel: { jp: "¥100,000/月", en: "¥100,000/mo" },
    features: {
      jp: ["機関級市場データ & API", "ディープ個別銘柄レポート", "独自アルゴ指標へのアクセス", "優先配信 & アーカイブ"],
      en: ["Institutional market data & API", "Deep-dive stock reports", "Proprietary algo indicators", "Priority feed & archive"]
    },
    locked: { jp: [], en: [] }
  }
];

export const PLAN_TIER_ORDER = ["free", "starter", "pro", "elite"];
export const tierRank = (tier) => PLAN_TIER_ORDER.indexOf(tier);
export const canAccess = (userTier, contentTier) => tierRank(userTier) >= tierRank(contentTier);
export const getPlan = (id) => PLANS.find((p) => p.id === id) || PLANS[0];