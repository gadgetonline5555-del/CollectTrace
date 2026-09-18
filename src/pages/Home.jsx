import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Filter, BarChart3, TrendingUp, Sparkles, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import ResearchCard from "@/components/ResearchCard";
import LatestResearch from "@/components/LatestResearch";
import PullToRefresh from "@/components/PullToRefresh";

export default function Home() {
  const { t } = useI18n();
  const { data: reports = [], refetch: refetchResearch } = useQuery({ queryKey: ["home", "research", "featured"], queryFn: () => base44.entities.Research.list("-published_date", 3).catch(() => []) });

  const STAT_TILES = [
    { label: t("stat.screener.label"), value: t("stat.screener.value"), sub: t("stat.screener.sub"), icon: Filter, accent: "text-cyan-400" },
    { label: t("stat.reports.label"), value: "480", sub: t("stat.reports.sub"), icon: BarChart3, accent: "text-violet-400" },
    { label: t("stat.upside.label"), value: "+34%", sub: t("stat.upside.sub"), icon: TrendingUp, accent: "text-emerald-400" },
    { label: t("stat.cadence.label"), value: t("stat.cadence.value"), sub: t("stat.cadence.sub"), icon: Zap, accent: "text-amber-400" },
  ];

  return (
    <PullToRefresh onRefresh={async () => { await refetchResearch(); }}>
    <div>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-foreground/5 backdrop-blur text-xs text-muted-foreground mb-6">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          {t("hero.badge")}
        </div>
        <h1 className="font-display font-bold text-foreground tracking-tight text-5xl sm:text-6xl md:text-7xl leading-[1.05]">
          {t("hero.h1Pre")}<span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-amber-300 bg-clip-text text-transparent">{t("hero.h1Hi1")}</span>{t("hero.h1Mid")}<span className="bg-gradient-to-r from-amber-300 via-fuchsia-400 to-violet-500 bg-clip-text text-transparent">{t("hero.h1Hi2")}</span>{t("hero.h1Post")}
        </h1>
        <p className="mt-6 text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">{t("hero.p")}</p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/screener" className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 hover:opacity-90 transition-opacity flex items-center gap-2">
            {t("hero.cta1")} <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/research" className="px-6 py-3 rounded-xl font-semibold border border-border text-foreground hover:bg-foreground/5 transition-colors">
            {t("hero.cta2")}
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STAT_TILES.map((s) => (
            <div key={s.label} className="rounded-2xl p-5 bg-card/50 border border-border backdrop-blur">
              <s.icon className={`w-6 h-6 mb-3 ${s.accent}`} />
              <div className="font-display text-3xl font-bold text-foreground">{s.value}</div>
              <div className="text-muted-foreground text-sm font-medium">{s.label}</div>
              <div className="text-muted-foreground/80 text-xs">{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="relative rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-cyan-900/30 via-slate-900 to-violet-900/30 p-8 sm:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold mb-4">
                <Filter className="w-3.5 h-3.5" /> {t("screen.badge")}
              </div>
              <h2 className="font-display text-3xl font-bold text-foreground">{t("screen.promo_h")}</h2>
              <p className="text-muted-foreground mt-2">{t("screen.promo_p")}</p>
            </div>
            <Link to="/screener" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 hover:opacity-90 transition-opacity shrink-0">
              {t("screen.promo_btn")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground">{t("home.research_h")}</h2>
            <p className="text-muted-foreground mt-1">{t("home.research_p")}</p>
          </div>
          <Link to="/research" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            {t("home.see_all")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reports.map((r) => <ResearchCard key={r.id} research={r} />)}
        </div>
      </section>

      <LatestResearch />

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-24">
        <div className="relative rounded-3xl overflow-hidden border border-border bg-gradient-to-br from-violet-900/40 via-slate-900 to-cyan-900/30 p-10 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground">{t("home.cta_h")}</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">{t("home.cta_p")}</p>
          <Link to="/pricing" className="inline-flex mt-6 px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-300 to-orange-500 text-slate-950 hover:opacity-90 transition-opacity items-center gap-2">
            {t("home.cta_btn")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
    </PullToRefresh>
  );
}