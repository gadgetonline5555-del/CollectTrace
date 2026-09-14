export const PLANS = [
  {
    id: "free",
    name: "フリー",
    price: 0,
    priceLabel: "無料",
    accent: "from-slate-400 to-slate-600",
    ring: "ring-slate-500/40",
    tagline: "投資の第一歩を漫画で",
    audience: "初心者",
    features: [
      "投資基礎漫画 12作品",
      "週1話の新作配信",
      "コミュニティ閲覧",
      "広告付き配信"
    ],
    locked: ["銘柄スクリーニング", "個別銘柄レポート", "市場データAPI"]
  },
  {
    id: "starter",
    name: "スターター",
    price: 1000,
    priceLabel: "¥1,000/月",
    accent: "from-cyan-400 to-blue-600",
    ring: "ring-cyan-400/50",
    tagline: "漫画で学び、データに触れる",
    audience: "初中級者",
    features: [
      "全漫画コンテンツ広告なし",
      "基礎スクリーニング機能",
      "初心者向けレポート閲覧",
      "銘柄ウォッチリスト"
    ],
    locked: ["詳細財務分析", "プロ級レポート"]
  },
  {
    id: "pro",
    name: "プロ",
    price: 10000,
    priceLabel: "¥10,000/月",
    accent: "from-violet-400 to-fuchsia-600",
    ring: "ring-violet-400/50",
    tagline: "本格的な調査と分析",
    audience: "中級者",
    features: [
      "中級スクリーニング & 財務分析",
      "詳細個別銘柄レポート",
      "テーマ別調査レポート",
      "市場センチメント可視化"
    ],
    locked: ["機関級データ", "専属レポート"]
  },
  {
    id: "elite",
    name: "エリート",
    price: 100000,
    priceLabel: "¥100,000/月",
    accent: "from-amber-300 to-orange-500",
    ring: "ring-amber-400/50",
    tagline: "機関投資家レベルの情報",
    audience: "プロフェッショナル",
    features: [
      "機関級市場データ & API",
      "ディープ個別銘柄レポート",
      "独自アルゴ指標へのアクセス",
      "優先配信 & アーカイブ"
    ],
    locked: []
  }
];

export const PLAN_TIER_ORDER = ["free", "starter", "pro", "elite"];

export const tierRank = (tier) => PLAN_TIER_ORDER.indexOf(tier);

export const canAccess = (userTier, contentTier) => tierRank(userTier) >= tierRank(contentTier);

export const getPlan = (id) => PLANS.find((p) => p.id === id) || PLANS[0];