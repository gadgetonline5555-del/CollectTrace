import React, { useState } from "react";
import { Radar as RadarIcon, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { useUserTier } from "@/hooks/useUserTier";
import { track } from "@/lib/track";
import PullToRefresh from "@/components/PullToRefresh";
import RadarCard from "@/components/RadarCard";
import CompetitiveEdge from "@/components/CompetitiveEdge";
import QuotaNotice from "@/components/QuotaNotice";

const REGIONS = [
  { value: "all", key: "radar.region_all" },
  { value: "jp", key: "radar.region_jp" },
  { value: "us", key: "radar.region_us" },
];

export default function Radar() {
  const { t, lang } = useI18n();
  const { can } = useUserTier();
  const [region, setRegion] = useState("all");
  const [primaryOnly, setPrimaryOnly] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [quota, setQuota] = useState(null);

  const { data: items = [], isFetching: loading, refetch } = useQuery({
    queryKey: ["radar"],
    queryFn: () => base44.entities.RadarItem.list("-published_at", 80),
  });

  const refresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    setError(null);
    setQuota(null);
    try {
      const res = await base44.functions.invoke("refreshRadar", { language: lang });
      if (res.data?.error === "quota_exceeded") {
        setQuota({ used: res.data.used ?? 0, limit: res.data.limit ?? 0 });
      } else if (res.data?.error) {
        setError(res.data.error);
      } else {
        track("research_search", { keyword: "radar_refresh", category: "radar" });
        refetch();
      }
    } catch (err) {
      if (err?.data?.error === "quota_exceeded") {
        setQuota({ used: err?.data?.used ?? 0, limit: err?.data?.limit ?? 0 });
      } else {
        setError(err?.message || t("radar.err_refresh"));
      }
    } finally {
      setRefreshing(false);
    }
  };

  const defaultRegion = lang === "en" ? "us" : "jp";
  const canFullAll = can("pro");
  const canFullOne = can("starter");

  // Which region buttons are locked for this user
  const regionLocked = (val) => {
    if (canFullAll) return false;
    if (canFullOne) return val !== "all" && val !== defaultRegion;
    return val !== "all"; // free: only "all" (headlines, locked detail)
  };
  // Whether a given item's full detail is locked
  const itemLocked = (it) => {
    if (canFullAll) return false;
    if (canFullOne) return it.region !== defaultRegion;
    return true;
  };

  const tierOf = (it) => it.source_tier || (it.source === "press" ? "secondary" : "primary");
  const filtered = items.filter((it) => (region === "all" ? true : it.region === region) && (!primaryOnly || tierOf(it) === "primary"));

  return (
    <PullToRefresh onRefresh={refresh}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold mb-4">
            <RadarIcon className="w-3.5 h-3.5" /> {t("radar.badge")}
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground">{t("radar.h")}</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">{t("radar.p")}</p>
        </div>

        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => {
              const locked = regionLocked(r.value);
              return (
                <button
                  key={r.value}
                  onClick={() => !locked && setRegion(r.value)}
                  disabled={locked}
                  aria-disabled={locked}
                  className={`min-h-11 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${region === r.value ? "bg-foreground text-background" : "bg-card text-muted-foreground border border-border hover:bg-foreground/5"} ${locked ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {t(r.key)}{locked ? " 🔒" : ""}
                </button>
              );
            })}
          <button onClick={() => setPrimaryOnly((v) => !v)} className={`min-h-11 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${primaryOnly ? "bg-emerald-500/15 border border-emerald-400/40 text-emerald-300" : "bg-card text-muted-foreground border border-border hover:bg-foreground/5"}`}>{t("radar.filter_primary")}</button>
          </div>
          <button
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 hover:opacity-90 disabled:opacity-50 transition-opacity min-h-11"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? t("radar.refreshing") : t("radar.refresh")}
          </button>
        </div>

        {quota && <div className="mb-5"><QuotaNotice used={quota.used} limit={quota.limit} /></div>}
        {error && <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-300 text-sm mb-5">{error}</div>}

        {refreshing && items.length === 0 ? (
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 rounded-2xl bg-card animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground/70">{t("radar.empty")}</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map((it) => (
              <RadarCard key={it.id} item={it} locked={itemLocked(it)} />
            ))}
          </div>
        )}

        <CompetitiveEdge />
      </div>
    </PullToRefresh>
  );
}