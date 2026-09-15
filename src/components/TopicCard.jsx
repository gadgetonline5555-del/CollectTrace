import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

const CATS = {
  stock: { key: "disc.cat_stock", color: "from-amber-300 to-orange-500", chip: "bg-amber-500/15 text-amber-300 border-amber-400/30" },
  weather: { key: "disc.cat_weather", color: "from-cyan-400 to-blue-500", chip: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30" },
  geopolitics: { key: "disc.cat_geopolitics", color: "from-rose-400 to-red-500", chip: "bg-rose-500/15 text-rose-300 border-rose-400/30" },
  science: { key: "disc.cat_science", color: "from-violet-400 to-fuchsia-500", chip: "bg-violet-500/15 text-violet-300 border-violet-400/30" },
  market: { key: "disc.cat_market", color: "from-emerald-400 to-teal-500", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30" }
};

const FRESH = {
  breaking: { key: "disc.fresh_breaking", dot: "bg-rose-400" },
  "this week": { key: "disc.fresh_week", dot: "bg-amber-400" },
  ongoing: { key: "disc.fresh_ongoing", dot: "bg-slate-400" }
};

export default function TopicCard({ topic }) {
  const { t } = useI18n();
  const cat = CATS[topic.category] || CATS.market;
  const fresh = FRESH[topic.freshness] || FRESH.ongoing;
  const drillType = ["company", "sector", "market", "theme"].includes(topic.drill_type) ? topic.drill_type : "theme";

  return (
    <div className="group rounded-2xl border border-white/10 bg-slate-900/60 p-5 hover:border-white/20 hover:bg-slate-900 transition-colors flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${cat.chip}`}>{t(cat.key)}</span>
        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
          <span className={`w-1.5 h-1.5 rounded-full ${fresh.dot}`} /> {t(fresh.key)}
        </span>
      </div>
      <h3 className="font-display text-lg font-bold text-white leading-snug">{topic.title}</h3>
      {topic.hook && <p className="text-slate-300 text-sm leading-relaxed mt-2">{topic.hook}</p>}
      {topic.angle && <p className="text-slate-500 text-xs leading-relaxed mt-2 italic">{topic.angle}</p>}
      <div className="mt-4 pt-4 border-t border-white/5">
        <Link to={`/ai-research?query=${encodeURIComponent(topic.drill_query || topic.title)}&type=${drillType}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-300 hover:text-cyan-200">
          {t("disc.deep_dive")} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}