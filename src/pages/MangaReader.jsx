import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Lock, Star, BookOpen, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getPlan, canAccess } from "@/lib/plans";

export default function MangaReader() {
  const { id } = useParams();
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Manga.get(id).then((m) => { setManga(m); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto px-6 py-20 text-center text-slate-400">読み込み中…</div>;
  if (!manga) return <div className="max-w-3xl mx-auto px-6 py-20 text-center text-slate-400">漫画が見つかりません。</div>;

  const plan = getPlan(manga.plan_tier);
  const access = canAccess("free", manga.plan_tier);

  return (
    <article className="max-w-3xl mx-auto px-6 py-12">
      <Link to="/manga" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> ライブラリに戻る
      </Link>

      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${plan.accent} text-slate-950`}>{plan.name}</span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 border border-white/10 text-slate-300">{manga.category}</span>
      </div>

      <h1 className="font-display text-4xl font-bold text-white leading-tight">{manga.title}</h1>
      {manga.subtitle && <p className="text-slate-400 text-lg mt-2">{manga.subtitle}</p>}
      <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
        <span>{manga.author}</span>
        <span className="flex items-center gap-1 text-amber-300"><Star className="w-4 h-4 fill-current" />{manga.rating?.toFixed(1)}</span>
        <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{manga.episodes}話</span>
      </div>

      {manga.cover_url && (
        <div className="mt-8 rounded-3xl overflow-hidden aspect-video bg-slate-900">
          <div className="w-full h-full bg-gradient-to-br from-violet-900/40 to-cyan-900/30" style={{ backgroundImage: manga.cover_url, backgroundSize: "cover", backgroundPosition: "center" }} />
        </div>
      )}

      <div className="mt-8">
        {!access ? (
          <div className="rounded-3xl border border-amber-400/30 bg-amber-500/5 p-8 text-center">
            <Lock className="w-10 h-10 text-amber-300 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-white">この作品は「{plan.name}」プラン以上</h2>
            <p className="text-slate-400 mt-2 mb-6">{plan.priceLabel}のプランで、この作品の全エピソードをお楽しみいただけます。</p>
            <Link to="/pricing" className="inline-flex px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-300 to-orange-500 text-slate-950 hover:opacity-90">
              {plan.priceLabel === "無料" ? "無料で始める" : "アップグレード"}
            </Link>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            {manga.summary && <p className="text-slate-300 text-lg leading-relaxed border-l-2 border-violet-400 pl-4 italic">{manga.summary}</p>}
            <div className="mt-6 space-y-5 text-slate-300 leading-relaxed whitespace-pre-line">
              {manga.content || "本文を準備中です。近日公開予定。"}
            </div>
            <div className="mt-10 flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4" /> この話を読み終えました — 次のエピソードへ進む
            </div>
          </div>
        )}
      </div>
    </article>
  );
}