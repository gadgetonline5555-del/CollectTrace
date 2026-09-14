import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { base44 } from "@/api/base44Client";
import MangaCard from "@/components/MangaCard";
import { PLANS } from "@/lib/plans";

const CATEGORIES = ["すべて", "基礎知識", "銘柄分析", "相場心理", "戦略", "失敗談"];

export default function MangaLibrary() {
  const [mangas, setMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("すべて");

  useEffect(() => {
    base44.entities.Manga.list("-rating", 50)
      .then((res) => { setMangas(res); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = mangas.filter((m) => {
    const matchCat = cat === "すべて" || m.category === cat;
    const matchQ = !q || (m.title + m.author + m.summary).toLowerCase().includes(q.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-white">投資漫画ライブラリ</h1>
        <p className="text-slate-400 mt-2">物語で学ぶ、投資の原理と相場の心理。</p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="タイトル・作者で検索"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-400/50"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                cat === c ? "bg-white text-slate-950" : "bg-slate-900 text-slate-300 hover:bg-slate-800 border border-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-900 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">該当する漫画がありません。</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {filtered.map((m) => <MangaCard key={m.id} manga={m} />)}
        </div>
      )}

      <div className="mt-10 flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-400">プランで絞る:</span>
        {PLANS.map((p) => (
          <span key={p.id} className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 border border-white/10 text-slate-300">
            {p.name}
          </span>
        ))}
      </div>
    </div>
  );
}