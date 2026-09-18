import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Filter, Loader2, RotateCcw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { useUserTier } from "@/hooks/useUserTier";
import TierGate from "@/components/TierGate";
import PullToRefresh from "@/components/PullToRefresh";
import { track } from "@/lib/track";

const RATINGS = ["Strong Buy", "Buy", "Hold", "Sell"];
const RATING_COLOR = {
  "Strong Buy": "text-emerald-400",
  "Buy": "text-emerald-300",
  "Hold": "text-muted-foreground",
  "Sell": "text-rose-400",
};

const upsideOf = (r) =>
  r.upside ?? (r.target_price && r.current_price
    ? Math.round(((r.target_price - r.current_price) / r.current_price) * 100)
    : 0);

export default function Screener() {
  const { t } = useI18n();
  const { can } = useUserTier();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sector, setSector] = useState("");
  const [rating, setRating] = useState("");
  const [minUpside, setMinUpside] = useState("");
  const [sort, setSort] = useState("upside");

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Research.list("-published_date", 200);
      setItems(list || []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    track("research_search", { keyword: "screener" });
    load();
  }, []);

  const sectors = useMemo(() => {
    const set = new Set();
    items.forEach((r) => { if (r.sector) set.add(r.sector); });
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    let res = items.slice();
    if (sector) res = res.filter((r) => r.sector === sector);
    if (rating) res = res.filter((r) => r.rating === rating);
    const min = minUpside === "" ? null : Number(minUpside);
    if (min != null) res = res.filter((r) => upsideOf(r) >= min);
    res.sort((a, b) => {
      if (sort === "upside") return upsideOf(b) - upsideOf(a);
      if (sort === "current_price") return (b.current_price || 0) - (a.current_price || 0);
      if (sort === "target_price") return (b.target_price || 0) - (a.target_price || 0);
      return 0;
    });
    return res;
  }, [items, sector, rating, minUpside, sort]);

  const reset = () => { setSector(""); setRating(""); setMinUpside(""); setSort("upside"); };
  const selectCls = "w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm min-h-11";

  return (
    <TierGate requiredTier="starter" title={t("screen.locked_h")} description={t("screen.locked_p")}>
      <PullToRefresh onRefresh={load}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="mb-8">
            <h1 className="font-display text-4xl font-bold text-foreground flex items-center gap-3">
              <Filter className="w-8 h-8 text-violet-400" /> {t("screen.h")}
            </h1>
            <p className="text-muted-foreground mt-2">{t("screen.p")}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 p-5 rounded-2xl bg-card/60 border border-border">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("screen.filter_sector")}</label>
              <select value={sector} onChange={(e) => setSector(e.target.value)} className={selectCls}>
                <option value="">{t("screen.all")}</option>
                {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("screen.filter_rating")}</label>
              <select value={rating} onChange={(e) => setRating(e.target.value)} className={selectCls}>
                <option value="">{t("screen.all")}</option>
                {RATINGS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("screen.filter_upside")}</label>
              <input type="number" value={minUpside} onChange={(e) => setMinUpside(e.target.value)} placeholder="0" className={selectCls} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("screen.sort")}</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className={selectCls}>
                <option value="upside">{t("screen.sort_upside")}</option>
                <option value="current_price">{t("screen.sort_current")}</option>
                <option value="target_price">{t("screen.sort_target")}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{t("screen.results", { n: filtered.length })}</p>
            <button onClick={reset} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground min-h-11 px-3">
              <RotateCcw className="w-3.5 h-3.5" /> {t("screen.reset")}
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> {t("screen.loading")}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground/80">{t("screen.empty")}</div>
          ) : (
            <div className="overflow-x-auto overscroll-x-contain -mx-4 sm:mx-0 rounded-2xl border border-border bg-card/40">
              <table className="w-full min-w-[40rem] md:min-w-0 text-sm">
                <thead className="bg-card/80 text-muted-foreground/80 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">{t("screen.col_ticker")}</th>
                    <th className="text-left px-4 py-3 font-medium">{t("screen.col_title")}</th>
                    <th className="text-left px-4 py-3 font-medium">{t("screen.col_sector")}</th>
                    <th className="text-left px-4 py-3 font-medium">{t("screen.col_rating")}</th>
                    <th className="text-right px-4 py-3 font-medium">{t("screen.col_current")}</th>
                    <th className="text-right px-4 py-3 font-medium">{t("screen.col_target")}</th>
                    <th className="text-right px-4 py-3 font-medium">{t("screen.col_upside")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((r) => {
                    const up = upsideOf(r);
                    return (
                      <tr key={r.id} className="hover:bg-foreground/5">
                        <td className="px-4 py-3 font-mono font-bold text-foreground">{r.ticker || "—"}</td>
                        <td className="px-4 py-3 text-foreground">
                          <Link to={`/research/${r.id}`} className="hover:text-cyan-300 line-clamp-1">{r.title}</Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{r.sector || "—"}</td>
                        <td className={`px-4 py-3 font-semibold ${RATING_COLOR[r.rating] || "text-muted-foreground"}`}>{r.rating || "—"}</td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">{r.current_price != null ? `¥${r.current_price.toLocaleString()}` : "—"}</td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">{r.target_price != null ? `¥${r.target_price.toLocaleString()}` : "—"}</td>
                        <td className={`px-4 py-3 text-right font-mono font-bold ${up >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{up >= 0 ? "+" : ""}{up}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </PullToRefresh>
    </TierGate>
  );
}