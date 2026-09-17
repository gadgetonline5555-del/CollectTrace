import React, { useMemo } from "react";
import { Activity, Flame } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// Sector Pulse — auto-detects disclosure spikes by sector over the last 24h.
// Runs client-side from the loaded RadarItem list; no extra backend call.
export default function SectorPulse({ items }) {
  const { t } = useI18n();
  const sectors = useMemo(() => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const counts = {};
    for (const it of items) {
      const s = (it.sector || "").trim();
      if (!s) continue;
      const ts = it.published_at ? new Date(it.published_at).getTime() : new Date(it.created_date).getTime();
      if (!ts || ts < cutoff) continue;
      counts[s] = (counts[s] || 0) + 1;
    }
    const arr = Object.entries(counts)
      .map(([name, n]) => ({ name, n }))
      .sort((a, b) => b.n - a.n)
      .slice(0, 6);
    if (arr.length === 0) return [];
    const avg = arr.reduce((s, x) => s + x.n, 0) / arr.length;
    return arr.map((x) => ({ ...x, spike: x.n >= avg * 1.5 }));
  }, [items]);

  if (sectors.length === 0) return null;
  const max = Math.max(...sectors.map((s) => s.n));

  return (
    <div className="mb-6 rounded-2xl border border-border bg-card/40 p-5">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-300 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5" /> {t("pulse.badge")}
        </div>
        <span className="text-xs text-muted-foreground">{t("pulse.h")}</span>
      </div>
      <div className="space-y-2">
        {sectors.map((s) => (
          <div key={s.name} className="flex items-center gap-3">
            <span className="text-sm text-foreground w-28 sm:w-36 shrink-0 truncate">{s.name}</span>
            <div className="flex-1 h-2.5 rounded-full bg-foreground/5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${s.spike ? "bg-gradient-to-r from-amber-400 to-rose-500" : "bg-gradient-to-r from-cyan-400 to-violet-500"}`}
                style={{ width: `${(s.n / max) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground w-7 text-right">{s.n}</span>
            {s.spike && <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-label={t("pulse.spike")} />}
          </div>
        ))}
      </div>
    </div>
  );
}