import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Lock, TrendingUp, TrendingDown, BarChart3, Target, Calendar, User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getPlan, canAccess } from "@/lib/plans";

export default function ResearchDetail() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Research.get(id).then((r) => { setReport(r); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-6 py-20 text-center text-slate-400">読み込み中…</div>;
  if (!report) return <div className="max-w-4xl mx-auto px-6 py-20 text-center text-slate-400">レポートが見つかりません。</div>;

  const plan = getPlan(report.plan_tier);
  const access = canAccess("free", report.plan_tier);
  const isBuy = report.rating === "Strong Buy" || report.rating === "Buy";
  const upside = report.upside ?? (report.target_price && report.current_price
    ? Math.round(((report.target_price - report.current_price) / report.current_price) * 100) : 0);

  const METRICS = [
    { label: "現在値", value: report.current_price ? `¥${report.current_price.toLocaleString()}` : "—", icon: BarChart3 },
    { label: "目標株価", value: report.target_price ? `¥${report.target_price.toLocaleString()}` : "—", icon: Target },
    { label: "上値余地", value: `${upside >= 0 ? "+" : ""}${upside}%`, icon: upside >= 0 ? TrendingUp : TrendingDown },
    { label: "格付け", value: report.rating ?? "—", icon: Target },
  ];

  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      <Link to="/research" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> ハブに戻る
      </Link>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-mono font-bold text-slate-300">{report.ticker}</span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${plan.accent} text-slate-950`}>{plan.name}</span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 border border-white/10 text-slate-300">{report.sector}</span>
      </div>

      <h1 className="font-display text-4xl font-bold text-white leading-tight">{report.title}</h1>
      <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
        {report.author && <span className="flex items-center gap-1"><User className="w-4 h-4" />{report.author}</span>}
        {report.published_date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{report.published_date}</span>}
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {METRICS.map((m) => (
          <div key={m.label} className="rounded-2xl p-5 bg-slate-900/60 border border-white/10">
            <m.icon className="w-5 h-5 text-slate-400 mb-2" />
            <div className={`font-display text-2xl font-bold ${m.label === "上値余地" ? (upside >= 0 ? "text-emerald-400" : "text-rose-400") : "text-white"}`}>
              {m.value}
            </div>
            <div className="text-xs text-slate-500">{m.label}</div>
          </div>
        ))}
      </div>

      {report.summary && (
        <p className="mt-8 text-lg text-slate-300 leading-relaxed border-l-2 border-violet-400 pl-4 italic">{report.summary}</p>
      )}

      <div className="mt-8">
        {!access ? (
          <div className="rounded-3xl border border-amber-400/30 bg-amber-500/5 p-8 text-center">
            <Lock className="w-10 h-10 text-amber-300 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-white">このレポートは「{plan.name}」プラン以上</h2>
            <p className="text-slate-400 mt-2 mb-6">{plan.priceLabel}で、詳細分析・財務データ・格付けのすべてにアクセスできます。</p>
            <Link to="/pricing" className="inline-flex px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-300 to-orange-500 text-slate-950 hover:opacity-90">
              プランを見る
            </Link>
          </div>
        ) : (
          <div className="space-y-5 text-slate-300 leading-relaxed whitespace-pre-line">
            {report.content || "本文を準備中です。近日公開予定。"}
          </div>
        )}
      </div>
    </article>
  );
}