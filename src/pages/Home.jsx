import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, BarChart3, TrendingUp, Sparkles, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MangaCard from "@/components/MangaCard";
import ResearchCard from "@/components/ResearchCard";

const STAT_TILES = [
  { label: "投資漫画", value: "120+", sub: "話数配信中", icon: BookOpen, accent: "text-cyan-400" },
  { label: "調査レポート", value: "480", sub: "銘柄カバー", icon: BarChart3, accent: "text-violet-400" },
  { label: "上値余地 平均", value: "+34%", sub: "プロプラン銘柄", icon: TrendingUp, accent: "text-emerald-400" },
  { label: "配信頻度", value: "毎日", sub: "市場データ更新", icon: Zap, accent: "text-amber-400" },
];

export default function Home() {
  const [mangas, setMangas] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    base44.entities.Manga.list("-rating", 4).then(setMangas).catch(() => {});
    base44.entities.Research.list("-published_date", 3).then(setReports).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur text-xs text-slate-300 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          漫画で学ぶ × 調査で勝つ — 次世代投資プラットフォーム
        </div>
        <h1 className="font-display font-bold text-white tracking-tight text-5xl sm:text-6xl md:text-7xl leading-[1.05]">
          投資を<span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-amber-300 bg-clip-text text-transparent">読む</span>、
          <br className="hidden sm:block" />投資を<span className="bg-gradient-to-r from-amber-300 via-fuchsia-400 to-violet-500 bg-clip-text text-transparent">解く</span>。
        </h1>
        <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
          初心者は漫画で投資の本質を直感し、プロは機関レベルの調査レポートで銘柄を深掘り。
          4つのプラン階層で、学びと分析をシームレスに繋ぐ。
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/manga" className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 hover:opacity-90 transition-opacity flex items-center gap-2">
            漫画を読み始める <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/research" className="px-6 py-3 rounded-xl font-semibold border border-white/15 text-white hover:bg-white/5 transition-colors">
            調査を見る
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_TILES.map((s) => (
            <div key={s.label} className="rounded-2xl p-5 bg-slate-900/50 border border-white/10 backdrop-blur">
              <s.icon className={`w-6 h-6 mb-3 ${s.accent}`} />
              <div className="font-display text-3xl font-bold text-white">{s.value}</div>
              <div className="text-slate-300 text-sm font-medium">{s.label}</div>
              <div className="text-slate-500 text-xs">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured manga */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl font-bold text-white">話題の投資漫画</h2>
            <p className="text-slate-400 mt-1">知識が物語になる</p>
          </div>
          <Link to="/manga" className="text-sm text-slate-300 hover:text-white flex items-center gap-1">
            すべて見る <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {mangas.map((m) => <MangaCard key={m.id} manga={m} />)}
        </div>
      </section>

      {/* Research */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl font-bold text-white">最新の調査レポート</h2>
            <p className="text-slate-400 mt-1">データが物語を裏付ける</p>
          </div>
          <Link to="/research" className="text-sm text-slate-300 hover:text-white flex items-center gap-1">
            すべて見る <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((r) => <ResearchCard key={r.id} research={r} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-violet-900/40 via-slate-900 to-cyan-900/30 p-10 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">プランを比べて、最適な一歩を</h2>
          <p className="text-slate-300 mt-3 max-w-xl mx-auto">
            価格ごとに何が違うか一目でわかる。あなたの投資ステージに合った情報を選べます。
          </p>
          <Link to="/pricing" className="inline-flex mt-6 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-300 to-orange-500 text-slate-950 hover:opacity-90 transition-opacity items-center gap-2">
            プランを見る <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}