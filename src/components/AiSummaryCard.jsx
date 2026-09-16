import React from "react";
import { TrendingUp, TrendingDown, Minus, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { ja, enUS } from "date-fns/locale";

const safeParse = (s, fallback) => {
  try { return JSON.parse(s); } catch { return fallback; }
};

export default function AiSummaryCard({ snapshot }) {
  const { t, lang } = useI18n();
  if (!snapshot) return null;

  const keyPoints = safeParse(snapshot.key_points, []);
  const metrics = safeParse(snapshot.metrics, {});
  const locale = lang === "en" ? enUS : ja;
  const sent = snapshot.sentiment || "neutral";
  const sentConfig = {
    bullish: { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-400/30", label: t("air.bullish") },
    bearish: { icon: TrendingDown, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-400/30", label: t("air.bearish") },
    neutral: { icon: Minus, color: "text-muted-foreground", bg: "bg-slate-500/10 border-slate-400/30", label: t("air.neutral") }
  }[sent];

  return (
    <article className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
          <Sparkles className="w-3.5 h-3.5" /> {t("air.summary_label")}
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${sentConfig.bg} ${sentConfig.color} text-sm font-semibold`}>
          <sentConfig.icon className="w-4 h-4" /> {sentConfig.label}
        </div>
      </div>

      <h2 className="font-display text-2xl font-bold text-foreground mb-1">{snapshot.query}</h2>
      <p className="text-xs text-muted-foreground/70 mb-4">
        {snapshot.created_date ? formatDistanceToNow(new Date(snapshot.created_date), { addSuffix: true, locale }) : ""} · v{snapshot.version}
      </p>

      {snapshot.summary && (
        <p className="text-foreground text-base leading-relaxed border-l-2 border-cyan-400 pl-4 mb-5">{snapshot.summary}</p>
      )}

      {Object.keys(metrics).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-5">
          {Object.entries(metrics).slice(0, 6).map(([k, v]) => (
            <div key={k} className="rounded-lg px-3 py-2 bg-card/50 border border-white/5">
              <div className="text-[10px] text-muted-foreground/70 uppercase tracking-wide">{k.replace(/_/g, " ")}</div>
              <div className="font-display text-base font-bold text-foreground">{String(v)}</div>
            </div>
          ))}
        </div>
      )}

      {keyPoints.length > 0 && (
        <ul className="space-y-1.5">
          {keyPoints.map((p, i) => (
            <li key={i} className="flex gap-2 text-muted-foreground text-sm leading-relaxed">
              <span className="mt-1.5 w-1 h-1 rounded-full bg-cyan-400 shrink-0" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}