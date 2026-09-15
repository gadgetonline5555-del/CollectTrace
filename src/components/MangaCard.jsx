import React from "react";
import { Link } from "react-router-dom";
import { Lock, Star, BookOpen } from "lucide-react";
import { getPlan } from "@/lib/plans";
import { useI18n } from "@/lib/i18n";
import { useUserTier } from "@/hooks/useUserTier";

export default function MangaCard({ manga }) {
  const { t, lang } = useI18n();
  const { can } = useUserTier();
  const plan = getPlan(manga.plan_tier);
  const access = can(manga.plan_tier);
  return (
    <Link
      to={`/manga/${manga.id}`}
      className="group relative rounded-2xl overflow-hidden bg-slate-900 border border-white/10 hover:border-white/25 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-violet-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-br opacity-90 transition-transform group-hover:scale-105"
          style={{ backgroundImage: manga.cover_url }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur text-[11px] font-semibold text-white border border-white/15">
          <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${plan.accent}`} />
          {plan.name[lang]}
        </div>
        {!access && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 backdrop-blur flex items-center justify-center border border-white/15">
            <Lock className="w-4 h-4 text-amber-300" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center gap-1 text-amber-300 text-xs mb-1">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="font-semibold">{manga.rating?.toFixed(1) ?? "4.5"}</span>
            <span className="text-slate-400 ml-2 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" />{manga.episodes}{t("mc.ep")}</span>
          </div>
          <h3 className="font-display font-bold text-white text-lg leading-tight line-clamp-2">{manga.title}</h3>
          <p className="text-slate-400 text-sm mt-0.5">{manga.author}</p>
        </div>
      </div>
    </Link>
  );
}