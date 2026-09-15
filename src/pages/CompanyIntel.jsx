import React, { useEffect, useState, useCallback } from "react";
import { Search, RefreshCw, History, Network, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import CompanyIntelCard from "@/components/CompanyIntelCard";
import QuotaNotice from "@/components/QuotaNotice";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/track";
import { useSearchParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ja, enUS } from "date-fns/locale";

const SUGGESTIONS = [
  "Alphabet (Google)", "Amazon", "Meta", "Microsoft", "Apple", "NVIDIA", "Tesla",
  "Magnificent 7 実質価値", "OpenAI", "Stripe", "SpaceX", "トヨタ自動車", "ソニーグループ"
];

const CTYPES = [
  { id: "listed", key: "intel.ct_listed" },
  { id: "private", key: "intel.ct_private" },
  { id: "subsidiary", key: "intel.ct_subsidiary" }
];

export default function CompanyIntel() {
  const { t, lang } = useI18n();
  const locale = lang === "en" ? enUS : ja;
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [companyType, setCompanyType] = useState("listed");
  const [latest, setLatest] = useState(null);
  const [history, setHistory] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [quota, setQuota] = useState(null);

  const loadQuery = useCallback((q) => {
    if (!q) return;
    setLoading(true);
    setError(null);
    setViewing(null);
    base44.entities.CompanyIntel.filter({ query: q }, "-created_date", 30)
      .then((res) => {
        setHistory(res);
        setLatest(res[0] || null);
        track("research_search", { keyword: q, category: "company_intel" });
      })
      .catch(() => setError(t("intel.err_load")))
      .finally(() => setLoading(false));
  }, [t]);

  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("query");
  const urlType = searchParams.get("type");
  useEffect(() => {
    if (urlQuery) { setInput(urlQuery); setQuery(urlQuery); }
    if (urlType && CTYPES.some((c) => c.id === urlType)) setCompanyType(urlType);
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
      const res = await base44.functions.invoke("researchCompanyIntel", { query, language: lang, company_type: companyType });
      if (res.data?.error === "quota_exceeded") { setQuota({ used: res.data.used ?? 0, limit: res.data.limit ?? 0 }); return; }
      const snap = res.data?.snapshot;
      if (!snap) throw new Error(res.data?.error || "no intel");
      setLatest(snap);
      setViewing(null);
      setHistory((h) => [snap, ...h.filter((x) => x.id !== snap.id)]);
      track("research_view", { target_id: snap.id, target_type: "company_intel", title: query, content_tier: "company_intel" });
    } catch (err) {
      if (err?.data?.error === "quota_exceeded" || (typeof err?.message === "string" && err.message.includes("quota_exceeded"))) {
        setQuota({ used: err?.data?.used ?? 0, limit: err?.data?.limit ?? 0 });
      } else {
        setError(err.message || t("intel.err_refresh"));
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
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-4">
          <Network className="w-3.5 h-3.5" /> {t("intel.badge")}
        </div>
        <h1 className="font-display text-4xl font-bold text-white">{t("intel.h")}</h1>
        <p className="text-slate-400 mt-2 max-w-2xl">{t("intel.p")}</p>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {CTYPES.map((ct) => (
            <button key={ct.id} type="button" onClick={() => setCompanyType(ct.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${companyType === ct.id ? "bg-white text-slate-950" : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-white/10"}`}>
              {t(ct.key)}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t("intel.search_ph")}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400/50 text-lg" />
        </div>
      </form>

      {!query && (
        <div className="mb-8">
          <p className="text-sm text-slate-500 mb-3">{t("intel.suggest")}</p>
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
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 hover:opacity-90 disabled:opacity-50 transition-opacity">
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? t("intel.refreshing") : t("intel.refresh")}
              </button>
              {latest && !refreshing && stale && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-300">
                  <Zap className="w-3.5 h-3.5" /> {t("intel.stale")}
                </span>
              )}
            </div>
            {latest && !refreshing && (
              <span className="text-xs text-slate-500">
                {t("intel.last_update")}: {formatDistanceToNow(new Date(latest.created_date), { addSuffix: true, locale })}
              </span>
            )}
          </div>

          {quota ? <div className="mb-5"><QuotaNotice used={quota.used} limit={quota.limit} /></div> : error ? <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-300 text-sm mb-5">{error}</div> : null}

          {refreshing ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center">
              <div className="w-8 h-8 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-400">{t("intel.generating")}</p>
              <p className="text-xs text-slate-600 mt-1">{t("intel.generating_p")}</p>
            </div>
          ) : loading ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center">
              <div className="w-8 h-8 border-4 border-slate-700 border-t-violet-400 rounded-full animate-spin mx-auto" />
            </div>
          ) : shown ? (
            <CompanyIntelCard intel={shown} live={!!viewing && viewing.id === latest?.id} />
          ) : (
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-12 text-center">
              <Network className="w-10 h-10 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300 font-medium">{t("intel.no_intel")}</p>
              <p className="text-slate-500 text-sm mt-1 mb-6">{t("intel.no_intel_p")}</p>
              <button onClick={handleRefresh}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 hover:opacity-90">
                <Network className="w-4 h-4" /> {t("intel.generate_first")}
              </button>
            </div>
          )}

          {history.length > 1 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-300">{t("intel.history")}</h3>
                <span className="text-xs text-slate-500">({history.length})</span>
              </div>
              <div className="space-y-2">
                {history.map((h) => (
                  <button key={h.id} onClick={() => setViewing(h)}
                    className={`w-full text-left flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-colors ${viewing?.id === h.id ? "border-emerald-400/40 bg-emerald-500/10" : "border-white/10 bg-slate-900/50 hover:bg-slate-800/50"}`}>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">v{h.version}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 capitalize">{h.company_type}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 truncate">{h.summary || h.market_cap}</p>
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