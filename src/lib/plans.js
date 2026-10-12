export const PLANS = [
  {
    id: "free",
    price: 0,
    accent: "from-slate-400 to-slate-600",
    ring: "ring-slate-500/40",
    name: { jp: "フリー", en: "Free" },
    audience: { jp: "初心者", en: "Beginner" },
    tagline: { jp: "AI調査で投資を始める", en: "Start investing with AI research" },
    priceLabel: { jp: "無料", en: "Free" },
    features: {
      jp: ["企業調査 1日10回まで（広告あり）", "情報レーダー速報（ヘッドライン）", "用語集・発見フィード", "資産・企業・IPO調査の閲覧", "紹介で無料枠を拡大"],
      en: ["Company research (10/day, with ads)", "Radar headlines", "Glossary & Discover feed", "Browse wealth, company & IPO research", "Grow your quota by inviting friends"]
    },
    ads: true,
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
    tagline: { jp: "調査を無制限で、データに触れる", en: "Unlimited research, touch the data" },
    priceLabel: { jp: "¥1,000/月", en: "¥1,000/mo" },
    features: {
      jp: ["企業調査 無制限", "情報レーダー 1地域の詳細", "基礎スクリーニング機能", "初心者向け調査レポート閲覧", "銘柄ウォッチリスト"],
      en: ["Unlimited company research", "Radar: 1 region detail", "Basic screening", "Beginner-level reports", "Watchlist"]
    },
    locked: {
      jp: ["詳細財務分析", "プロ級レポート"],
      en: ["Detailed financial analysis", "Pro-level reports"]
    },
    ads: false
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
      jp: ["情報レーダー 両地域＋フィルタ", "中級スクリーニング & 財務分析", "詳細個別調査レポート", "テーマ別調査レポート", "市場センチメント可視化"],
      en: ["Radar: both regions + filters", "Advanced screening & financials", "Detailed research reports", "Thematic research", "Market sentiment visuals"]
    },
    locked: {
      jp: ["機関級データ", "専属レポート"],
      en: ["Institutional data", "Dedicated reports"]
    },
    ads: false
  },
  {
    id: "elite",
    price: 100000,
    accent: "from-amber-300 to-orange-500",
    ring: "ring-amber-400/50",
    name: { jp: "エリート", en: "Elite" },
    audience: { jp: "プロフェッショナル", en: "Professional" },
    tagline: { jp: "深い比較と継続調査", en: "Deep comparison and continuous research" },
    priceLabel: { jp: "¥100,000/月", en: "¥100,000/mo" },
    features: {
      jp: ["情報レーダー API・過去アーカイブ", "機関級市場データ & API", "ディープ個別調査レポート", "独自アルゴ指標へのアクセス", "優先配信 & アーカイブ"],
      en: ["Radar API + archive", "Institutional market data & API", "Deep-dive research reports", "Proprietary algo indicators", "Priority feed & archive"]
    },
    locked: { jp: [], en: [] },
    ads: false
  }
];

export const PLAN_TIER_ORDER = ["free", "starter", "pro", "elite"];
export const tierRank = (tier) => PLAN_TIER_ORDER.indexOf(tier);
export const canAccess = (userTier, contentTier) => tierRank(userTier) >= tierRank(contentTier);
export const getPlan = (id) => PLANS.find((p) => p.id === id) || PLANS[0];