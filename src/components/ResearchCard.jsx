import React from "react";
import { Link } from "react-router-dom";
import { Lock, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { getPlan } from "@/lib/plans";
import { useI18n } from "@/lib/i18n";
import { useUserTier } from "@/hooks/useUserTier";

export default function ResearchCard({ research }) {
  const { t, lang } = useI18n();
  const { can } = useUserTier();
  const plan = getPlan(research.plan_tier);
  const access = can(research.plan_tier);
  const isBuy = research.rating === "Strong Buy" || research.rating === "Buy";
  const upside = research.upside ?? (research.target_price && research.current_price
    ? Math.round(((research.target_price - research.current_price) / research.current_price) * 100)
    : 0);

  return (
    <Link
      to={`/research/${research.id}`}
      className="group relative rounded-2xl p-5 bg-gradient-to-br from-slate-900 to-slate-900/40 border border-border hover:border-white/25 transition-all hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-muted-foreground">{research.ticker}</span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r ${plan.accent} text-slate-950`}>
              {plan.name[lang]}
            </span>
          </div>
          <h3 className="font-display font-bold text-foreground leading-tight line-clamp-2">{research.title}</h3>
        </div>
        {!access ? (
          <div aria-hidden="true" className="shrink-0 w-8 h-8 rounded-full bg-background/60 flex items-center justify-center border border-border">
            <Lock className="w-4 h-4 text-amber-300" />
          </div>
        ) : (
          <ArrowUpRight className="w-5 h-5 text-muted-foreground/70 group-hover:text-foreground transition-colors" />
        )}
      </div>
      <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{research.summary}</p>
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-lg font-bold text-foreground font-mono">
            {isBuy ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
            ¥{research.current_price?.toLocaleString() ?? "—"}
          </div>
          <div className="text-xs text-muted-foreground/70">{t("rc.current")}</div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold font-mono ${upside >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {upside >= 0 ? "+" : ""}{upside}%
          </div>
          <div className="text-xs text-muted-foreground/70">{t("rc.upside")}</div>
        </div>
      </div>
    </Link>
  );
}