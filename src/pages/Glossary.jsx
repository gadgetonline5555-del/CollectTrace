import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import { track } from "@/lib/track";

const CATS = [
  { value: "すべて", key: "gcat.all" },
  { value: "基礎用語", key: "gcat.basics" },
  { value: "テクニカル指標", key: "gcat.tech" },
  { value: "ファンダメンタル", key: "gcat.fund" },
  { value: "戦略", key: "gcat.strat" },
  { value: "心理", key: "gcat.mind" },
];

export default function Glossary() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("すべて");

  const { data: terms = [], isFetching: loading } = useQuery({
    queryKey: ["glossary", "terms"],
    queryFn: () => base44.entities.Glossary.list("term", 200),
  });

  useEffect(() => {
    if (!q && cat === "すべて") return;
    const id = setTimeout(() => track("glossary_search", { keyword: q, category: cat }), 900);
    return () => clearTimeout(id);
  }, [q, cat]);

  const filtered = terms.filter((g) => {
    const matchCat = cat === "すべて" || g.category === cat;
    const matchQ = !q || (g.term + g.definition).toLowerCase().includes(q.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-foreground">{t("glossary.h")}</h1>
        <p className="text-muted-foreground mt-2">{t("glossary.p")}</p>
      </div>
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/80" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("glossary.search")} className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground/80 focus:outline-none focus:border-violet-400/50" />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button key={c.value} onClick={() => setCat(c.value)} className={`min-h-11 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${cat === c.value ? "bg-white text-slate-950" : "bg-card text-muted-foreground hover:bg-slate-800 border border-border"}`}>
              {t(c.key)}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="text-muted-foreground/80 py-20 text-center">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground/80">{t("glossary.empty")}</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((g) => (
            <div key={g.id} className="rounded-2xl p-5 bg-card/60 border border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-display text-lg font-bold text-foreground">{g.term}</h3>
                <span className="text-xs text-muted-foreground/80">{g.category}</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{g.definition}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}