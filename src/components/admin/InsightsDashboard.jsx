import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { Users, Crown, TrendingUp, Globe2, Search, Star, BookOpen, BarChart3, Activity, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { PLANS } from "@/lib/plans";

const ChartComponents = lazy(() => import("./ChartComponents"));
const ChartFallback = () => (
  <div className="flex items-center justify-center" style={{ height: 200 }}>
    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
  </div>
);

const PLAN_PRICE = { free: 0, starter: 1000, pro: 10000, elite: 100000 };
const CHART_COLORS = ["#a78bfa", "#22d3ee", "#34d399", "#fbbf24", "#f472b6", "#60a5fa", "#f87171", "#c084fc"];

function countBy(arr, keyFn) {
  const m = {};
  for (const it of arr) {
    const k = keyFn(it);
    if (!k) continue;
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}
function topEntries(map, n = 8) {
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, n);
}

function Kpi({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl p-5 bg-card/60 border border-border">
      <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
        <Icon className={`w-4 h-4 ${accent}`} /> {label}
      </div>
      <div className="font-display text-2xl font-bold text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground/80 mt-1">{sub}</div>}
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl p-5 bg-card/60 border border-border">
      <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground mb-4">
        <Icon className="w-4 h-4 text-violet-400" /> {title}
      </h3>
      {children}
    </div>
  );
}

function RankList({ items, unit }) {
  if (!items.length) return <div className="text-muted-foreground/80 text-sm py-4 text-center">データなし</div>;
  const max = items[0][1];
  return (
    <div className="space-y-2">
      {items.map(([k, v], i) => (
        <div key={k} className="flex items-center gap-3">
          <span className="w-6 text-muted-foreground/80 text-sm font-mono">{i + 1}</span>
          <span className="w-40 truncate text-foreground text-sm">{k}</span>
          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-400" style={{ width: `${(v / max) * 100}%` }} />
          </div>
          <span className="w-10 text-right text-muted-foreground text-sm font-mono">{v}{unit || ""}</span>
        </div>
      ))}
    </div>
  );
}

export default function InsightsDashboard() {
  const [acts, setActs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.UserActivity.list("-created_date", 500).catch(() => []),
      base44.entities.User.list().catch(() => []),
    ]).then(([a, u]) => { setActs(a || []); setUsers(u || []); setLoading(false); });
  }, []);

  // Activity-derived stats depend only on the activity log.
  const activityStats = useMemo(() => {
    const byType = countBy(acts, (a) => a.event_type);
    const mangaViews = acts.filter((a) => a.event_type === "manga_view");
    const researchViews = acts.filter((a) => a.event_type === "research_view");
    const searches = acts.filter((a) => a.event_type?.endsWith("_search"));
    const tickerActs = acts.filter((a) => (a.event_type === "watchlist_add" || a.event_type === "portfolio_add") && a.ticker);

    const mangaCat = countBy(mangaViews, (a) => a.category);
    const researchSec = countBy(researchViews, (a) => a.category);
    const kwMap = {};
    for (const a of searches) {
      const k = (a.keyword || "").toLowerCase().trim();
      if (k.length >= 2) kwMap[k] = (kwMap[k] || 0) + 1;
    }
    const tickerMap = countBy(tickerActs, (a) => a.ticker);
    const langMap = countBy(acts, (a) => a.language || "unknown");

    return { byType, mangaCat, researchSec, kwMap, tickerMap, langMap };
  }, [acts]);

  // User/plan-derived stats depend only on the user list.
  const stats = useMemo(() => {
    const planMap = countBy(users, (u) => u.subscription_tier || "free");
    const totalUsers = users.length;
    const payingUsers = (planMap.starter || 0) + (planMap.pro || 0) + (planMap.elite || 0);
    const mrr = (planMap.starter || 0) * PLAN_PRICE.starter + (planMap.pro || 0) * PLAN_PRICE.pro + (planMap.elite || 0) * PLAN_PRICE.elite;
    const arpu = payingUsers > 0 ? Math.round(mrr / payingUsers) : 0;
    const convRate = totalUsers > 0 ? (payingUsers / totalUsers * 100).toFixed(1) : "0.0";

    // projection: if 5% of free convert at current plan-mix ARPU
    const freeUsers = planMap.free || 0;
    const projectedConv5 = Math.round(freeUsers * 0.05 * arpu);
    const projected1000 = Math.round(1000 * (payingUsers / Math.max(totalUsers, 1)) * arpu);

    return { planMap, totalUsers, payingUsers, mrr, arpu, convRate, projectedConv5, projected1000 };
  }, [users]);

  // Chart datasets: each recomputed only when its source changes.
  const planData = useMemo(() => PLANS.map((p) => ({ name: p.name.jp, users: stats.planMap[p.id] || 0, id: p.id })), [stats]);
  const mangaCatData = useMemo(() => topEntries(activityStats.mangaCat).map(([k, v]) => ({ name: k, count: v })), [activityStats]);
  const researchSecData = useMemo(() => topEntries(activityStats.researchSec).map(([k, v]) => ({ name: k, count: v })), [activityStats]);
  const kwData = useMemo(() => topEntries(activityStats.kwMap, 10), [activityStats]);
  const tickerData = useMemo(() => topEntries(activityStats.tickerMap, 10), [activityStats]);
  const langData = useMemo(() => topEntries(activityStats.langMap), [activityStats]);
  const recent = useMemo(() => acts.slice(0, 12), [acts]);

  if (loading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mr-2" /> 分析データを取得中…</div>;
  }

  const evtLabel = {
    manga_view: "漫画閲覧", research_view: "レポート閲覧", manga_search: "漫画検索",
    research_search: "レポート検索", glossary_search: "用語検索", watchlist_add: "ウォッチリスト追加",
    portfolio_add: "ポートフォリオ追加", pricing_view: "料金ページ閲覧", plan_upgrade: "アップグレード試行",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi icon={Users} label="総ユーザー数" value={stats.totalUsers} accent="text-cyan-400" />
        <Kpi icon={Crown} label="有料ユーザー数" value={stats.payingUsers} sub={`転換率 ${stats.convRate}%`} accent="text-amber-400" />
        <Kpi icon={TrendingUp} label="現在の月次売上 (MRR)" value={`¥${stats.mrr.toLocaleString()}`} sub={`ARPU ¥${stats.arpu.toLocaleString()}`} accent="text-emerald-400" />
        <Kpi icon={Activity} label="記録された行動数" value={acts.length} sub={`直近500件`} accent="text-violet-400" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="プラン別ユーザー分布" icon={Crown}>
          {stats.totalUsers === 0 ? <div className="text-muted-foreground/80 text-sm py-8 text-center">ユーザーなし</div> : (
            <Suspense fallback={<ChartFallback />}>
              <ChartComponents variant="plan" data={planData} />
            </Suspense>
          )}
        </Section>

        <Section title="収益予測" icon={TrendingUp}>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-3 rounded-xl bg-background/60 border border-white/5">
              <span className="text-muted-foreground">現在のMRR</span>
              <span className="font-display font-bold text-foreground">¥{stats.mrr.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-background/60 border border-white/5">
              <span className="text-muted-foreground">無料ユーザーの5%が転換した場合の追加MRR</span>
              <span className="font-display font-bold text-emerald-400">+¥{stats.projectedConv5.toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-background/60 border border-white/5">
              <span className="text-muted-foreground">ユーザー1,000人到達時の予想MRR（現轉換率維持）</span>
              <span className="font-display font-bold text-cyan-400">¥{stats.projected1000.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground/80 pt-1">※ 現在のプラン構成比率とARPUから試算。公開後の集客次第で変動します。</p>
          </div>
        </Section>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="漫画カテゴリ別 閲覧興味" icon={BookOpen}>
          {mangaCatData.length === 0 ? <div className="text-muted-foreground/80 text-sm py-8 text-center">データなし</div> : (
            <Suspense fallback={<ChartFallback />}>
              <ChartComponents variant="manga" data={mangaCatData} />
            </Suspense>
          )}
        </Section>

        <Section title="調査レポート セクター別 閲覧興味" icon={BarChart3}>
          {researchSecData.length === 0 ? <div className="text-muted-foreground/80 text-sm py-8 text-center">データなし</div> : (
            <Suspense fallback={<ChartFallback />}>
              <ChartComponents variant="research" data={researchSecData} />
            </Suspense>
          )}
        </Section>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="検索キーワード ランキング" icon={Search}>
          <RankList items={kwData} />
        </Section>
        <Section title="注目銘柄 ランキング（ウォッチリスト+ポートフォリオ）" icon={Star}>
          <RankList items={tickerData} unit="回" />
        </Section>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="言語別アクセス分布" icon={Globe2}>
          <div className="flex flex-wrap gap-3">
            {langData.map(([k, v], i) => (
              <div key={k} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-background/60 border border-white/5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                <span className="text-foreground text-sm font-medium uppercase">{k}</span>
                <span className="text-muted-foreground text-sm">{v}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="アクション別発生数" icon={Activity}>
          <div className="space-y-2">
            {Object.entries(activityStats.byType).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{evtLabel[k] || k}</span>
                <span className="text-muted-foreground font-mono">{v}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <Section title="最近のアクティビティ" icon={Activity}>
        {recent.length === 0 ? <div className="text-muted-foreground/80 text-sm py-4 text-center">記録なし</div> : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {recent.map((a) => (
              <div key={a.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-white/5">
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-muted-foreground text-xs whitespace-nowrap">{evtLabel[a.event_type] || a.event_type}</span>
                <span className="text-foreground truncate flex-1">{a.title || a.keyword || a.ticker || a.category || "—"}</span>
                <span className="text-muted-foreground/80 text-xs uppercase">{a.language || ""}</span>
                <span className="text-muted-foreground/80 text-xs">{new Date(a.created_date).toLocaleString("ja-JP")}</span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}