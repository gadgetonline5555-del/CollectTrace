import React from "react";
import { TrendingUp, TrendingDown, Minus, ExternalLink, Clock, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { ja, enUS } from "date-fns/locale";

const safeParse = (s, fallback) => {
  try { return JSON.parse(s); } catch { return fallback; }
};

export default function AiSnapshotCard({ snapshot, live = false }) {
  const { t, lang } = useI18n();
  if (!snapshot) return null;

  const keyPoints = safeParse(snapshot.key_points, []);
  const metrics = safeParse(snapshot.metrics, {});
  const sources = safeParse(snapshot.sources, []);
  const locale = lang === "en" ? enUS : ja;

  const sent = snapshot.sentiment || "neutral";
  const sentConfig = {
    bullish: { icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-400/30", label: t("air.bullish") },
    bearish: { icon: TrendingDown, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-400/30", label: t("air.bearish") },
    neutral: { icon: Minus, color: "text-slate-300", bg: "bg-slate-500/10 border-slate-400/30", label: t("air.neutral") }
  }[sent];

  return (
    <article className="rounded-3xl border border-white/10 bg-slate-900/60 overflow-hidden">
      <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-white/10 text-slate-300 capitalize">{snapshot.query_type}</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-white/10 text-slate-400">v{snapshot.version}</span>
            {live && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/15 border border-cyan-400/30 text-cyan-300">
                <Sparkles className="w-3 h-3" /> {t("air.just_now")}
              </span>
            )}
          </div>
          <h2 className="font-display text-2xl font-bold text-white">{snapshot.query}</h2>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            {snapshot.created_date ? formatDistanceToNow(new Date(snapshot.created_date), { addSuffix: true, locale }) : ""}
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border ${sentConfig.bg} ${sentConfig.color} font-semibold`}>
          <sentConfig.icon className="w-4 h-4" /> {sentConfig.label}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {snapshot.summary && (
          <p className="text-slate-300 text-lg leading-relaxed border-l-2 border-violet-400 pl-4 italic">{snapshot.summary}</p>
        )}

        {Object.keys(metrics).length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{t("air.metrics")}</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(metrics).slice(0, 6).map(([k, v]) => (
                <div key={k} className="rounded-xl p-3 bg-slate-800/60 border border-white/5">
                  <div className="text-[11px] text-slate-500 uppercase tracking-wide">{k.replace(/_/g, " ")}</div>
                  <div className="font-display text-lg font-bold text-white mt-0.5">{String(v)}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {keyPoints.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{t("air.key_points")}</h3>
            <ul className="space-y-2">
              {keyPoints.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-slate-300 leading-relaxed">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {snapshot.content && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{t("air.full_analysis")}</h3>
            <div className="text-slate-300 leading-relaxed whitespace-pre-line">{snapshot.content}</div>
          </div>
        )}

        {sources.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">{t("air.sources")}</h3>
            <div className="flex flex-col gap-1.5">
              {sources.map((s, i) => (
                <a key={i} href={s} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-cyan-300 hover:text-cyan-200 truncate">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{s}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}