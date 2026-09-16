import React from "react";
import { ExternalLink, TrendingUp, TrendingDown, Minus, Building2, Clock, Lock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { ja, enUS } from "date-fns/locale";

const REGION_LABEL = {
  us: { jp: "米国 EDGAR", en: "US EDGAR" },
  jp: { jp: "日本 適時開示", en: "Japan TDnet" },
  global: { jp: "全世界", en: "Global" },
};

export default function RadarCard({ item, locked }) {
  const { t, lang } = useI18n();
  const locale = lang === "en" ? enUS : ja;
  const SentIcon = item.sentiment === "bullish" ? TrendingUp : item.sentiment === "bearish" ? TrendingDown : Minus;
  const sentColor = item.sentiment === "bullish" ? "text-emerald-400" : item.sentiment === "bearish" ? "text-rose-400" : "text-muted-foreground";
  const region = REGION_LABEL[item.region]?.[lang] || item.region;

  return (
    <article className="rounded-2xl border border-border bg-card/60 p-5 flex flex-col gap-3 hover:bg-card transition-colors">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-foreground/5 border border-border text-muted-foreground">{region}</span>
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

      {locked ? (
        <p className="text-sm text-muted-foreground/70 line-clamp-2">{item.summary || item.headline}</p>
      ) : (
        item.summary && <p className="text-sm text-muted-foreground leading-relaxed">{item.summary}</p>
      )}

      <div className="flex items-center justify-between mt-1">
        <SentIcon className={`w-4 h-4 ${sentColor}`} />
        <div className="flex items-center gap-3">
          {locked && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-300">
              <Lock className="w-3.5 h-3.5" /> {t("radar.locked")}
            </span>
          )}
          {item.source_url && (
            <a href={item.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded">
              <ExternalLink className="w-3.5 h-3.5" /> {t("radar.source")}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}