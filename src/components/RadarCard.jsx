import React, { useState } from "react";
import { ExternalLink, TrendingUp, TrendingDown, Minus, Building2, Clock, Lock, Zap, Network } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { ja, enUS } from "date-fns/locale";

const REGION_LABEL = {
  us: { jp: "米国 EDGAR", en: "US EDGAR" },
  jp: { jp: "日本 適時開示", en: "Japan TDnet" },
  global: { jp: "全世界", en: "Global" },
};

const parseList = (s) => {
  if (!s) return [];
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
};

export default function RadarCard({ item, locked }) {
  const { t, lang } = useI18n();
  const [mode, setMode] = useState("beginner");
  const locale = lang === "en" ? enUS : ja;
  const SentIcon = item.sentiment === "bullish" ? TrendingUp : item.sentiment === "bearish" ? TrendingDown : Minus;
  const sentColor = item.sentiment === "bullish" ? "text-emerald-400" : item.sentiment === "bearish" ? "text-rose-400" : "text-muted-foreground";
  const region = REGION_LABEL[item.region]?.[lang] || item.region;
  const tier = item.source_tier || (item.source === "press" ? "secondary" : "primary");
  const proPoints = parseList(item.pro_points);
  const impactSectors = parseList(item.impact_sectors);
  const impactRelated = parseList(item.impact_related);

  return (
    <article className="rounded-2xl border border-border bg-card/60 p-5 flex flex-col gap-3 hover:bg-card transition-colors">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-foreground/5 border border-border text-muted-foreground">{region}</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${tier === "primary" ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-300" : "bg-foreground/5 border-border text-muted-foreground"}`}>{t(tier === "primary" ? "radar.tier_primary" : "radar.tier_secondary")}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
          <Clock className="w-3 h-3" />
          {item.published_at ? formatDistanceToNow(new Date(item.published_at), { addSuffix: true, locale }) : ""}
        </div>
      </div>

      <h3 className="font-display font-bold text-foreground leading-snug">{item.headline}</h3>

      {(item.company_name || item.ticker) && (
        <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          {item.company_name && <span>{item.company_name}</span>}
          {item.ticker && <span className="font-mono">{item.ticker}</span>}
          {item.form_type && <span className="px-1.5 py-0.5 rounded bg-foreground/5 border border-border">{item.form_type}</span>}
        </div>
      )}

      <div className="inline-flex rounded-lg border border-border p-0.5 self-start text-xs font-medium">
        <button onClick={() => setMode("beginner")} className={`px-3 py-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${mode === "beginner" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>{t("radar.beginner")}</button>
        <button onClick={() => setMode("pro")} className={`px-3 py-1.5 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${mode === "pro" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>{t("radar.pro")}</button>
      </div>

      {mode === "beginner" ? (
        <p className="text-sm text-muted-foreground leading-relaxed">{item.beginner_note || item.summary || item.headline}</p>
      ) : locked ? (
        <div className="flex items-center gap-2 text-sm text-amber-300">
          <Lock className="w-4 h-4" /> {t("radar.pro_locked")}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {item.summary && <p className="text-sm text-muted-foreground leading-relaxed">{item.summary}</p>}
          {proPoints.length > 0 && (
            <ul className="text-sm text-foreground/90 space-y-1 list-disc list-inside">
              {proPoints.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          )}
          {(impactSectors.length > 0 || impactRelated.length > 0) && (
            <div className="rounded-lg border border-border bg-background/40 p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider"><Zap className="w-3.5 h-3.5" /> {t("radar.impact")}</div>
              {impactSectors.length > 0 && (
                <div className="flex items-center flex-wrap gap-1.5 text-xs">
                  <span className="text-muted-foreground">{t("radar.impact_sectors")}:</span>
                  {impactSectors.map((s, i) => <span key={i} className="px-1.5 py-0.5 rounded bg-foreground/5 border border-border text-foreground">{s}</span>)}
                </div>
              )}
              {impactRelated.length > 0 && (
                <div className="flex items-center flex-wrap gap-1.5 text-xs">
                  <Network className="w-3.5 h-3.5 text-muted-foreground" />
                  {impactRelated.map((s, i) => <span key={i} className="px-1.5 py-0.5 rounded bg-foreground/5 border border-border text-foreground">{s}</span>)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-1">
        <SentIcon className={`w-4 h-4 ${sentColor}`} />
        {item.source_url && (
          <a href={item.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
            <ExternalLink className="w-3.5 h-3.5" /> {t("radar.source")}
          </a>
        )}
      </div>
    </article>
  );
}