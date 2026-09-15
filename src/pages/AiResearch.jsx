import React, { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, History, Sparkles, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/track";
import AiSnapshotCard from "@/components/AiSnapshotCard";
import AiSummaryCard from "@/components/AiSummaryCard";
import QuotaNotice from "@/components/QuotaNotice";
import ShareBar from "@/components/ShareBar";
import { useSearchParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ja, enUS } from "date-fns/locale";

const SUGGESTIONS = [
  "Apple", "NVIDIA", "トヨタ自動車", "半導体セクター", "AI銘柄", "メタンハイドレート",
  "TSMC", "マイクロソフト", "薬機法セクター", "EV銘柄", "ソフトバンクグループ", "決算発表"
];

const QTYPES = [
  { id: "company", key: "air.qt_company" },
  { id: "sector", key: "air.qt_sector" },
  { id: "market", key: "air.qt_market" },
  { id: "theme", key: "air.qt_theme" }
];

export default function AiResearch() {
  const { t, lang } = useI18n();
  const locale = lang === "en" ? enUS : ja;
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [queryType, setQueryType] = useState("company");
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [compact, setCompact] = useState(false);
  const [quota, setQuota] = useState(null);

  const loadQuery = useCallback((q) => {
    if (!q) return;
    setLoading(true);
    setError(null);
    setViewing(null);
    base44.entities.AiResearchSnapshot.filter({ query: q }, "-created_date", 30)
      .then((res) => {
        setHistory(res);
        setLatest(res[0] || null);
        track("research_search", { keyword: q, category: "ai" });
      })
      .catch(() => setError(t("air.err_load")))
      .finally(() => setLoading(false));
  }, [t]);

  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("query");
  const urlType = searchParams.get("type");
  useEffect(() => {
    if (urlQuery) { setInput(urlQuery); setQuery(urlQuery); }
    if (urlType && ["company", "sector", "market", "theme"].includes(urlType)) setQueryType(urlType);
  }, [urlQuery, urlType]);

  useEffect(() => { if (query) loadQuery(query); }, [query, loadQuery]);

  const handleSearch = (e) => {
    e?.preventDefault();
    const q = input.trim();
    if (!q) return;
    setQuery(q);
  };

  const handleRefresh = async () => {
    if (!query || refreshing) return;
    setRefreshing(true);
    setError(null);
    setQuota(null);
    try {
      const res = await base44.functions.invoke("refreshAiResearch", { query, language: lang, query_type: queryType });
      if (res.data?.error === "quota_exceeded") { setQuota({ used: res.data.used ?? 0, limit: res.data.limit ?? 0 }); return; }
      const snap = res.data?.snapshot;
      if (!snap) throw new Error(res.data?.error || "no snapshot");
      setLatest(snap);
      setViewing(null);
      setHistory((h) => [snap, ...h.filter((x) => x.id !== snap.id)]);
      track("research_view", { target_id: snap.id, target_type: "ai_research", title: query, content_tier: "ai" });
    } catch (err) {
      if (err?.data?.error === "quota_exceeded" || (typeof err?.message === "string" && err.message.includes("quota_exceeded"))) {
        setQuota({ used: err?.data?.used ?? 0, limit: err?.data?.limit ?? 0 });
      } else {
        setError(err.message || t("air.err_refresh"));
      }
    } finally {
      setRefreshing(false);
    }
  };

  const shown = viewing || latest;
  const stale = latest ? Date.now() - new Date(latest.created_date).getTime() > 30 * 60 * 1000 : true;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" /> {t("air.badge")}
        </div>
        <h1 className="font-display text-4xl font-bold text-white">{t("air.h")}</h1>
        <p className="text-slate-400 mt-2 max-w-2xl">{t("air.p")}</p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {QTYPES.map((qt) => (
            <button key={qt.id} type="button" onClick={() => setQueryType(qt.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${queryType === qt.id ? "bg-white text-slate-950" : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-white/10"}`}>
              {t(qt.key)}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("air.search_ph")}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400/50 text-lg" />
        </div>
      </form>

      {!query && (
        <div className="mb-8">
          <p className="text-sm text-slate-500 mb-3">{t("air.suggest")}</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => { setInput(s); setQuery(s); }}
                className="px-3.5 py-2 rounded-lg text-sm font-medium bg-slate-900 text-slate-300 hover:bg-slate-800 border border-white/10 transition-colors">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {query && (
        <>
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <div className="flex items-center gap-2">
              <button onClick={handleRefresh} disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 hover:opacity-90 disabled:opacity-50 transition-opacity">
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? t("air.refreshing") : t("air.refresh")}
              </button>
              {latest && !refreshing && stale && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-300">
                  <Zap className="w-3.5 h-3.5" /> {t("air.stale")}
                </span>
              )}
            </div>
            {latest && !refreshing && (
              <span className="text-xs text-slate-500">
                {t("air.last_update")}: {formatDistanceToNow(new Date(latest.created_date), { addSuffix: true, locale })}
              </span>
            )}
            {latest && (
              <div className="inline-flex rounded-lg bg-slate-900 border border-white/10 p-0.5 ml-auto">
                <button onClick={() => setCompact(false)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${!compact ? "bg-white text-slate-950" : "text-slate-400"}`}>{t("air.view_full")}</button>
                <button onClick={() => setCompact(true)} className={`px-3 py-1.5 rounded-md text-xs font-medium ${compact ? "bg-white text-slate-950" : "text-slate-400"}`}>{t("air.view_summary")}</button>
              </div>
            )}
          </div>

          {query && !refreshing && !loading && <div className="mb-5"><ShareBar url={`${window.location.origin}/ai-research?query=${encodeURIComponent(query)}`} text={t("share.research", { q: query })} /></div>}
          {quota ? <div className="mb-5"><QuotaNotice used={quota.used} limit={quota.limit} /></div> : error ? <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-300 text-sm mb-5">{error}</div> : null}

          {refreshing ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center">
              <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400">{t("air.generating")}</p>
              <p className="text-xs text-slate-600 mt-1">{t("air.generating_p")}</p>
            </div>
          ) : loading ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center">
              <div className="w-8 h-8 border-4 border-slate-700 border-t-violet-400 rounded-full animate-spin mx-auto" />
            </div>
          ) : shown ? (
            compact ? <AiSummaryCard snapshot={shown} /> : <AiSnapshotCard snapshot={shown} live={!!viewing && viewing.id === latest?.id} />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center">
              <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300 font-medium">{t("air.no_snapshot")}</p>
              <p className="text-slate-500 text-sm mt-1 mb-6">{t("air.no_snapshot_p")}</p>
              <button onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 hover:opacity-90">
                <Sparkles className="w-4 h-4" /> {t("air.generate_first")}
              </button>
            </div>
          )}

          {history.length > 1 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-300">{t("air.history")}</h3>
                <span className="text-xs text-slate-500">({history.length})</span>
              </div>
              <div className="space-y-2">
                {history.map((h) => (
                  <button key={h.id} onClick={() => setViewing(h)}
                    className={`w-full text-left flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-colors ${viewing?.id === h.id ? "border-cyan-400/40 bg-cyan-500/10" : "border-white/10 bg-slate-900/50 hover:bg-slate-800/50"}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">v{h.version}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${h.sentiment === "bullish" ? "text-emerald-300" : h.sentiment === "bearish" ? "text-rose-300" : "text-slate-400"}`}>{h.sentiment}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">{h.summary}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">
                      {formatDistanceToNow(new Date(h.created_date), { addSuffix: true, locale })}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}