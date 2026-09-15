import React from "react";
import { Link } from "react-router-dom";
import { Lock, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { getPlan, canAccess } from "@/lib/plans";
import { useI18n } from "@/lib/i18n";

export default function ResearchCard({ research, userTier = "free" }) {
  const { t, lang } = useI18n();
  const plan = getPlan(research.plan_tier);
  const access = canAccess(userTier, research.plan_tier);
  const isBuy = research.rating === "Strong Buy" || research.rating === "Buy";
  const upside = research.upside ?? (research.target_price && research.current_price
    ? Math.round(((research.target_price - research.current_price) / research.current_price) * 100)
    : 0);

  return (
    <Link
      to={`/research/${research.id}`}
      className="group relative rounded-2xl p-5 bg-gradient-to-br from-slate-900 to-slate-900/40 border border-white/10 hover:border-white/25 transition-all hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-slate-300">{research.ticker}</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r ${plan.accent} text-slate-950`}>
              {plan.name[lang]}
            </span>
          </div>
          <h3 className="font-display font-bold text-white leading-tight line-clamp-2">{research.title}</h3>
        </div>
        {!access ? (
          <div className="shrink-0 w-8 h-8 rounded-full bg-slate-950/60 flex items-center justify-center border border-white/15">
            <Lock className="w-4 h-4 text-amber-300" />
          </div>
        ) : (
          <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
        )}
      </div>
      <p className="text-slate-400 text-sm line-clamp-2 mb-4">{research.summary}</p>
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-lg font-bold text-white font-mono">
            {isBuy ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
            ¥{research.current_price?.toLocaleString() ?? "—"}
          </div>
          <div className="text-xs text-slate-500">{t("rc.current")}</div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold font-mono ${upside >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {upside >= 0 ? "+" : ""}{upside}%
          </div>
          <div className="text-xs text-slate-500">{t("rc.upside")}</div>
        </div>
      </div>
    </Link>
  );
}