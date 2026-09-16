import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Lock, TrendingUp, TrendingDown, BarChart3, Target, Calendar, User } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getPlan } from "@/lib/plans";
import { useI18n } from "@/lib/i18n";
import { useUserTier } from "@/hooks/useUserTier";
import { track } from "@/lib/track";

export default function ResearchDetail() {
  const { t, lang } = useI18n();
  const { can } = useUserTier();
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Research.get(id).then((r) => { setReport(r); setLoading(false); track("research_view", { target_id: r?.id, target_type: "research", title: r?.title, category: r?.sector, ticker: r?.ticker, content_tier: r?.plan_tier }); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center text-muted-foreground">{t("rd.loading")}</div>;
  if (!report) return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center text-muted-foreground">{t("rd.notfound")}</div>;

  const plan = getPlan(report.plan_tier);
  const access = can(report.plan_tier);
  const upside = report.upside ?? (report.target_price && report.current_price
    ? Math.round(((report.target_price - report.current_price) / report.current_price) * 100) : 0);

  const METRICS = [
    { id: "current", label: t("rd.current"), value: report.current_price ? `¥${report.current_price.toLocaleString()}` : "—", icon: BarChart3 },
    { id: "target", label: t("rd.target"), value: report.target_price ? `¥${report.target_price.toLocaleString()}` : "—", icon: Target },
    { id: "upside", label: t("rd.upside"), value: `${upside >= 0 ? "+" : ""}${upside}%`, icon: upside >= 0 ? TrendingUp : TrendingDown },
    { id: "rating", label: t("rd.rating"), value: report.rating ?? "—", icon: Target },
  ];

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/research" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> {t("rd.back")}
      </Link>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-mono font-bold text-muted-foreground">{report.ticker}</span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${plan.accent} text-slate-950`}>{plan.name[lang]}</span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-card border border-border text-muted-foreground">{report.sector}</span>
      </div>
      <h1 className="font-display text-4xl font-bold text-foreground leading-tight">{report.title}</h1>
      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
        {report.author && <span className="flex items-center gap-1"><User className="w-4 h-4" />{report.author}</span>}
        {report.published_date && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{report.published_date}</span>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
        {METRICS.map((m) => (
          <div key={m.id} className="rounded-2xl p-5 bg-card/60 border border-border">
            <m.icon className="w-5 h-5 text-muted-foreground mb-2" />
            <div className={`font-display text-2xl font-bold ${m.id === "upside" ? (upside >= 0 ? "text-emerald-400" : "text-rose-400") : "text-foreground"}`}>
              {m.value}
            </div>
            <div className="text-xs text-muted-foreground/70">{m.label}</div>
          </div>
        ))}
      </div>
      {report.summary && <p className="mt-8 text-lg text-muted-foreground leading-relaxed border-l-2 border-violet-400 pl-4 italic">{report.summary}</p>}
      <div className="mt-8">
        {!access ? (
          <div className="rounded-3xl border border-amber-400/30 bg-amber-500/5 p-8 text-center">
            <Lock className="w-10 h-10 text-amber-300 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground">{t("rd.lock_h", { plan: plan.name[lang] })}</h2>
            <p className="text-muted-foreground mt-2 mb-6">{t("rd.lock_p", { price: plan.priceLabel[lang] })}</p>
            <Link to="/pricing" className="inline-flex px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-300 to-orange-500 text-slate-950 hover:opacity-90">
              {t("rd.view_plans")}
            </Link>
          </div>
        ) : (
          <div className="space-y-5 text-muted-foreground leading-relaxed whitespace-pre-line">
            {report.content || t("rd.empty")}
          </div>
        )}
      </div>
    </article>
  );
}