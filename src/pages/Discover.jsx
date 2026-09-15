import React, { useEffect, useState, useCallback } from "react";
import { Sparkles, RefreshCw, Compass, ShieldCheck } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/track";
import TopicCard from "@/components/TopicCard";

export default function Discover() {
  const { t, lang } = useI18n();
  const [mode, setMode] = useState("personalized");
  const [feed, setFeed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = useCallback(async (m) => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("generateDiscoverFeed", { mode: m, language: lang });
      if (res.data?.error) throw new Error(res.data.error);
      setFeed(res.data);
      track("research_view", { target_type: "discover", category: m, title: res.data?.rationale?.slice(0, 80) || "" });
    } catch (e) {
      setError(e.message || t("disc.err"));
    } finally {
      setLoading(false);
    }
  }, [lang, t]);

  useEffect(() => { generate(mode); /* generate on mount */ }, []);

  const switchMode = (m) => {
    if (m === mode) return;
    setMode(m);
    generate(m);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-300 text-xs font-semibold mb-4">
          <Compass className="w-3.5 h-3.5" /> {t("disc.badge")}
        </div>
        <h1 className="font-display text-4xl font-bold text-white">{t("disc.h")}</h1>
        <p className="text-slate-400 mt-2 max-w-3xl">{t("disc.p")}</p>
        <div className="inline-flex items-center gap-1.5 mt-3 text-xs text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {t("disc.safety")}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="inline-flex rounded-xl bg-slate-900 border border-white/10 p-1">
          <button onClick={() => switchMode("personalized")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${mode === "personalized" ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"}`}>
            {t("disc.mode_personalized")}
          </button>
          <button onClick={() => switchMode("default")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${mode === "default" ? "bg-white text-slate-950" : "text-slate-300 hover:text-white"}`}>
            {t("disc.mode_default")}
          </button>
        </div>
        <button onClick={() => generate(mode)} disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 hover:opacity-90 disabled:opacity-50 transition-opacity">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? t("disc.generating") : t("disc.refresh")}
        </button>
        <p className="text-xs text-slate-500 sm:ml-auto max-w-md">
          {mode === "personalized" ? t("disc.mode_desc_p") : t("disc.mode_desc_d")}
        </p>
      </div>

      {error && <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-4 text-rose-300 text-sm mb-6">{error}</div>}

      {loading && !feed ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 rounded-2xl bg-slate-900 animate-pulse" />)}
        </div>
      ) : feed?.topics?.length ? (
        <>
          {feed.rationale && (
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 mb-6 text-sm text-slate-300 italic">
              <span className="font-semibold text-slate-200 not-italic">{t("disc.rationale")}: </span>{feed.rationale}
            </div>
          )}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {feed.topics.map((topic, i) => <TopicCard key={i} topic={topic} />)}
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-slate-500">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          {t("disc.empty")}
        </div>
      )}
    </div>
  );
}