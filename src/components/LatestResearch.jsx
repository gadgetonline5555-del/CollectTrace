import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { ja, enUS } from "date-fns/locale";

// Auto-updating "latest research" feed for the homepage. Pulls the most recent
// AI snapshots across all four research types and links to their public pages.
// Gives the homepage fresh content for SEO + internal links, with zero admin work.
export default function LatestResearch() {
  const { t, lang } = useI18n();
  const locale = lang === "en" ? enUS : ja;
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [ai, wealth, intel, ipo] = await Promise.allSettled([
          base44.entities.AiResearchSnapshot.list("-created_date", 6),
          base44.entities.WealthProfile.list("-created_date", 6),
          base44.entities.CompanyIntel.list("-created_date", 6),
          base44.entities.IpoProfile.list("-created_date", 6),
        ]);
        const pick = (r) => (r.status === "fulfilled" && Array.isArray(r.value) ? r.value : []);
        const merged = [
          ...pick(ai).map((x) => ({ ...x, _type: "ai" })),
          ...pick(wealth).map((x) => ({ ...x, _type: "wealth" })),
          ...pick(intel).map((x) => ({ ...x, _type: "intel" })),
          ...pick(ipo).map((x) => ({ ...x, _type: "ipo" })),
        ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 8);
        setItems(merged);
      } catch { /* non-fatal */ }
    })();
  }, []);

  if (items.length === 0) return null;
  const typeColor = {
    ai: "text-cyan-300", wealth: "text-amber-300", intel: "text-emerald-300", ipo: "text-violet-300"
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 mb-1">
          <Sparkles className="w-3.5 h-3.5" /> {t("home.live_badge")}
        </div>
        <h2 className="font-display text-3xl font-bold text-white">{t("home.live_h")}</h2>
        <p className="text-slate-400 mt-1">{t("home.live_p")}</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it) => {
          const title = it.company_name || it.query || "—";
          const sub = it.summary || "";
          return (
            <Link key={it.id} to={`/s/${it.id}`} className="group rounded-2xl border border-white/10 bg-slate-900/50 hover:bg-slate-900 hover:border-cyan-400/30 p-5 transition-colors flex flex-col">
              <span className={`text-[10px] font-semibold uppercase tracking-wider mb-2 ${typeColor[it._type]}`}>{t(`snap.type_${it._type}`)}</span>
              <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">{title}</h3>
              {sub && <p className="text-sm text-slate-400 mt-1.5 line-clamp-3 leading-relaxed">{sub}</p>}
              <div className="mt-auto pt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{formatDistanceToNow(new Date(it.created_date), { addSuffix: true, locale })}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}