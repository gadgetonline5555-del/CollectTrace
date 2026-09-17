import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Lock, Star, BookOpen, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { getPlan } from "@/lib/plans";
import { useI18n } from "@/lib/i18n";
import { useUserTier } from "@/hooks/useUserTier";
import { track } from "@/lib/track";

export default function MangaReader() {
  const { t, lang } = useI18n();
  const { can } = useUserTier();
  const { id } = useParams();
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Manga.get(id).then((m) => { setManga(m); setLoading(false); track("manga_view", { target_id: m?.id, target_type: "manga", title: m?.title, category: m?.category, content_tier: m?.plan_tier }); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center text-muted-foreground">{t("reader.loading")}</div>;
  if (!manga) return <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center text-muted-foreground">{t("reader.notfound")}</div>;

  const plan = getPlan(manga.plan_tier);
  const access = can(manga.plan_tier);

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${plan.accent} text-slate-950`}>{plan.name[lang]}</span>
        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-card border border-border text-muted-foreground">{manga.category}</span>
      </div>
      <h1 className="font-display text-4xl font-bold text-foreground leading-tight">{manga.title}</h1>
      {manga.subtitle && <p className="text-muted-foreground text-lg mt-2">{manga.subtitle}</p>}
      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
        <span>{manga.author}</span>
        <span className="flex items-center gap-1 text-amber-300"><Star className="w-4 h-4 fill-current" />{manga.rating?.toFixed(1)}</span>
        <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{manga.episodes}{t("reader.ep")}</span>
      </div>
      {manga.cover_url && (
        <div className="mt-8 rounded-3xl overflow-hidden aspect-video bg-card">
          <div className="w-full h-full bg-gradient-to-br from-violet-900/40 to-cyan-900/30" style={{ backgroundImage: manga.cover_url, backgroundSize: "cover", backgroundPosition: "center" }} />
        </div>
      )}
      <div className="mt-8">
        {!access ? (
          <div className="rounded-3xl border border-amber-400/30 bg-amber-500/5 p-8 text-center">
            <Lock className="w-10 h-10 text-amber-300 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground">{t("reader.lock_h", { plan: plan.name[lang] })}</h2>
            <p className="text-muted-foreground mt-2 mb-6">{t("reader.lock_p", { price: plan.priceLabel[lang] })}</p>
            <Link to="/pricing" className="inline-flex px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-300 to-orange-500 text-slate-950 hover:opacity-90">
              {t("reader.view_plans")}
            </Link>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none">
            {manga.summary && <p className="text-muted-foreground text-lg leading-relaxed border-l-2 border-violet-400 pl-4 italic">{manga.summary}</p>}
            <div className="mt-6 space-y-5 text-muted-foreground leading-relaxed whitespace-pre-line">
              {manga.content || t("reader.empty")}
            </div>
            <div className="mt-10 flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle2 className="w-4 h-4" /> {t("reader.done")}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}