import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, BarChart3, TrendingUp, Sparkles, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import MangaCard from "@/components/MangaCard";
import ResearchCard from "@/components/ResearchCard";
import LatestResearch from "@/components/LatestResearch";

export default function Home() {
  const { t } = useI18n();
  const [mangas, setMangas] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    base44.entities.Manga.list("-rating", 4).then(setMangas).catch(() => {});
    base44.entities.Research.list("-published_date", 3).then(setReports).catch(() => {});
  }, []);

  const STAT_TILES = [
    { label: t("stat.manga.label"), value: "120+", sub: t("stat.manga.sub"), icon: BookOpen, accent: "text-cyan-400" },
    { label: t("stat.reports.label"), value: "480", sub: t("stat.reports.sub"), icon: BarChart3, accent: "text-violet-400" },
    { label: t("stat.upside.label"), value: "+34%", sub: t("stat.upside.sub"), icon: TrendingUp, accent: "text-emerald-400" },
    { label: t("stat.cadence.label"), value: t("stat.cadence.value"), sub: t("stat.cadence.sub"), icon: Zap, accent: "text-amber-400" },
  ];

  return (
    <div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur text-xs text-slate-300 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          {t("hero.badge")}
        </div>
        <h1 className="font-display font-bold text-white tracking-tight text-5xl sm:text-6xl md:text-7xl leading-[1.05]">
          {t("hero.h1Pre")}<span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-amber-300 bg-clip-text text-transparent">{t("hero.h1Hi1")}</span>{t("hero.h1Mid")}<span className="bg-gradient-to-r from-amber-300 via-fuchsia-400 to-violet-500 bg-clip-text text-transparent">{t("hero.h1Hi2")}</span>{t("hero.h1Post")}
        </h1>
        <p className="mt-6 text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">{t("hero.p")}</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/manga" className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 hover:opacity-90 transition-opacity flex items-center gap-2">
            {t("hero.cta1")} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/research" className="px-6 py-3 rounded-xl font-semibold border border-white/15 text-white hover:bg-white/5 transition-colors">
            {t("hero.cta2")}
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
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

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl font-bold text-white">{t("home.featured_h")}</h2>
            <p className="text-slate-400 mt-1">{t("home.featured_p")}</p>
          </div>
          <Link to="/manga" className="text-sm text-slate-300 hover:text-white flex items-center gap-1">
            {t("home.see_all")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {mangas.map((m) => <MangaCard key={m.id} manga={m} />)}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl font-bold text-white">{t("home.research_h")}</h2>
            <p className="text-slate-400 mt-1">{t("home.research_p")}</p>
          </div>
          <Link to="/research" className="text-sm text-slate-300 hover:text-white flex items-center gap-1">
            {t("home.see_all")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((r) => <ResearchCard key={r.id} research={r} />)}
        </div>
      </section>

      <LatestResearch />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-violet-900/40 via-slate-900 to-cyan-900/30 p-10 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">{t("home.cta_h")}</h2>
          <p className="text-slate-300 mt-3 max-w-xl mx-auto">{t("home.cta_p")}</p>
          <Link to="/pricing" className="inline-flex mt-6 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-300 to-orange-500 text-slate-950 hover:opacity-90 transition-opacity items-center gap-2">
            {t("home.cta_btn")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}