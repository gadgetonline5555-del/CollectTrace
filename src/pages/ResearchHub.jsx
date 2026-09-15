import React, { useEffect, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import ResearchCard from "@/components/ResearchCard";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/track";
import PullToRefresh from "@/components/PullToRefresh";

const SECTORS = [
  { value: "すべて", key: "sec.all" },
  { value: "テクノロジー", key: "sec.tech" },
  { value: "ヘルスケア", key: "sec.health" },
  { value: "エネルギー", key: "sec.energy" },
  { value: "金融", key: "sec.fin" },
  { value: "消費財", key: "sec.consumer" },
  { value: "半導体", key: "sec.semi" },
];

export default function ResearchHub() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [sector, setSector] = useState("すべて");

  const { data: reports = [], isFetching: loading, refetch } = useQuery({
    queryKey: ["research", "hub"],
    queryFn: () => base44.entities.Research.list("-published_date", 60),
  });
  const load = () => refetch();

  useEffect(() => {
    if (!q && sector === "すべて") return;
    const id = setTimeout(() => track("research_search", { keyword: q, category: sector }), 900);
    return () => clearTimeout(id);
  }, [q, sector]);

  const filtered = reports.filter((r) => {
    const matchS = sector === "すべて" || r.sector === sector;
    const matchQ = !q || (r.title + r.ticker + r.summary).toLowerCase().includes(q.toLowerCase());
    return matchS && matchQ;
  });

  return (
    <PullToRefresh onRefresh={load}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-white">{t("hub.h")}</h1>
        <p className="text-slate-400 mt-2">{t("hub.p")}</p>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("hub.search")} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-400/50" />
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-sm">
          <SlidersHorizontal className="w-4 h-4" /> {t("hub.sector")}
        </div>
        <div className="flex flex-wrap gap-2">
          {SECTORS.map((s) => (
            <button key={s.value} onClick={() => setSector(s.value)} className={`min-h-11 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${sector === s.value ? "bg-white text-slate-950" : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-white/10"}`}>
              {t(s.key)}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-52 rounded-2xl bg-slate-900 animate-pulse" />))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">{t("hub.empty")}</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((r) => <ResearchCard key={r.id} research={r} />)}
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}