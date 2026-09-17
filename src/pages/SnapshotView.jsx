import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import AiSnapshotCard from "@/components/AiSnapshotCard";
import WealthProfileCard from "@/components/WealthProfileCard";
import CompanyIntelCard from "@/components/CompanyIntelCard";
import IpoProfileCard from "@/components/IpoProfileCard";
import ShareBar from "@/components/ShareBar";
import PullToRefresh from "@/components/PullToRefresh";

// Public, indexable snapshot page. Every AI research any visitor runs is
// stored server-side; this route turns each one into a permanent shareable
// URL — the core of the zero-cost programmatic-SEO acquisition engine.
export default function SnapshotView() {
  const { id } = useParams();
  const { t } = useI18n();
  const [data, setData] = useState(null);
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchSnapshot = async () => {
    const tries = [
      { type: "ai", fn: () => base44.entities.AiResearchSnapshot.get(id) },
      { type: "wealth", fn: () => base44.entities.WealthProfile.get(id) },
      { type: "intel", fn: () => base44.entities.CompanyIntel.get(id) },
      { type: "ipo", fn: () => base44.entities.IpoProfile.get(id) },
    ];
    let found = null, foundType = null;
    for (const tr of tries) {
      try {
        const r = await tr.fn();
        if (r) { found = r; foundType = tr.type; break; }
      } catch { /* not this entity, try next */ }
    }
    if (found) { setData(found); setType(foundType); } else { setError(true); }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true); setError(false); setData(null); setType(null);
    fetchSnapshot();
  }, [id]);

  const reload = async () => {
    setLoading(true); setError(false);
    await fetchSnapshot();
  };

  // Dynamic SEO: update <title> + meta description per snapshot (helps modern
  // crawlers + link-previews). Reverts when navigating away.
  useEffect(() => {
    if (!data) return;
    const prevTitle = document.title;
    const title = `${data.query || "調査レポート"} — Collect Trace`;
    document.title = title;
    const desc = (data.summary || "").slice(0, 150);
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) { meta = document.createElement("meta"); meta.setAttribute("name", "description"); document.head.appendChild(meta); }
    const prevDesc = meta.getAttribute("content");
    meta.setAttribute("content", desc);
    let og = document.querySelector('meta[property="og:title"]');
    if (og) og.setAttribute("content", title);
    return () => { document.title = prevTitle; if (meta) meta.setAttribute("content", prevDesc || ""); };
  }, [data]);

  const url = typeof window !== "undefined" ? `${window.location.origin}/s/${id}` : "";
  const shareText = data?.query ? t("share.research", { q: data.query }) : "";

  return (
    <PullToRefresh onRefresh={reload}>
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      {loading ? (
        <div className="rounded-3xl border border-border bg-card/60 p-12 text-center">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-cyan-400 rounded-full animate-spin mx-auto" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-border bg-card/60 p-12 text-center">
          <Sparkles className="w-10 h-10 text-muted-foreground/80 mx-auto mb-4" />
          <p className="text-muted-foreground">{t("snap.notfound")}</p>
        </div>
      ) : (
        <>
          {type === "ai" && <AiSnapshotCard snapshot={data} />}
          {type === "wealth" && <WealthProfileCard profile={data} />}
          {type === "intel" && <CompanyIntelCard intel={data} />}
          {type === "ipo" && <IpoProfileCard ipo={data} />}
          <div className="mt-6"><ShareBar url={url} text={shareText} /></div>
        </>
      )}
    </div>
    </PullToRefresh>
  );
}