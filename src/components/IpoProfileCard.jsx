import React from "react";
import { ExternalLink, Clock, CalendarDays, Building2, DollarSign, Landmark, TrendingUp, AlertTriangle, Users, Activity, LineChart, Sprout, Tag, Rocket } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { ja, enUS } from "date-fns/locale";

const safeParse = (s, fallback) => {
  try { return JSON.parse(s); } catch { return fallback; }
};

const REGION_LABEL = {
  jp: { jp: "日本", en: "Japan" },
  us: { jp: "米国", en: "United States" },
  global: { jp: "全世界", en: "Global" }
};

function Section({ icon: Icon, title, children }) {
  if (!children) return null;
  return (
    <div>
      <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
        <Icon className="w-3.5 h-3.5" /> {title}
      </h3>
      {children}
    </div>
  );
}

export default function IpoProfileCard({ ipo, live = false }) {
  const { t, lang } = useI18n();
  if (!ipo) return null;

  const keyPoints = safeParse(ipo.key_points, []);
  const underwriters = safeParse(ipo.underwriters, []);
  const comparables = safeParse(ipo.comparables, []);
  const sources = safeParse(ipo.sources, []);
  const locale = lang === "en" ? enUS : ja;
  const regionLabel = REGION_LABEL[ipo.region]?.[lang] || ipo.region;

  return (
    <article className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-500/5 to-fuchsia-500/5 overflow-hidden">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-white/10 text-slate-300">
            <Rocket className="w-3 h-3" /> {t("ipo.badge")}
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-white/10 text-slate-300">{regionLabel}</span>
          {ipo.status && <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/15 border border-violet-400/30 text-violet-300">{ipo.status}</span>}
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-white/10 text-slate-400">v{ipo.version}</span>
          {live && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-500/15 border border-violet-400/30 text-violet-300">
              <Activity className="w-3 h-3" /> {t("ipo.just_now")}
            </span>
          )}
        </div>
        <h2 className="font-display text-3xl font-bold text-white">{ipo.company_name || ipo.query}</h2>
        {(ipo.ticker || ipo.exchange) && (
          <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
            {ipo.ticker && <span className="font-mono">{ipo.ticker}</span>}
            {ipo.exchange && <span className="text-slate-500">{ipo.exchange}</span>}
          </div>
        )}
        <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          {ipo.created_date ? formatDistanceToNow(new Date(ipo.created_date), { addSuffix: true, locale }) : ""}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {ipo.summary && (
          <p className="text-slate-200 text-lg leading-relaxed border-l-2 border-violet-400 pl-4 italic">{ipo.summary}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ipo.ipo_date && (
            <div className="rounded-xl p-4 bg-slate-900/60 border border-white/5">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 uppercase tracking-wide"><CalendarDays className="w-3.5 h-3.5" /> {t("ipo.ipo_date")}</div>
              <div className="font-display text-base font-bold text-white mt-1">{ipo.ipo_date}</div>
            </div>
          )}
          {ipo.offering_price && (
            <div className="rounded-xl p-4 bg-slate-900/60 border border-white/5">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 uppercase tracking-wide"><DollarSign className="w-3.5 h-3.5" /> {t("ipo.offering_price")}</div>
              <div className="font-display text-base font-bold text-white mt-1">{ipo.offering_price}</div>
            </div>
          )}
          {ipo.offering_size && (
            <div className="rounded-xl p-4 bg-slate-900/60 border border-white/5">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 uppercase tracking-wide"><Landmark className="w-3.5 h-3.5" /> {t("ipo.offering_size")}</div>
              <div className="font-display text-base font-bold text-white mt-1">{ipo.offering_size}</div>
            </div>
          )}
          {ipo.valuation && (
            <div className="rounded-xl p-4 bg-slate-900/60 border border-violet-400/20">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 uppercase tracking-wide"><TrendingUp className="w-3.5 h-3.5" /> {t("ipo.valuation")}</div>
              <div className="font-display text-base font-bold text-violet-300 mt-1">{ipo.valuation}</div>
            </div>
          )}
        </div>

        {ipo.sector && (
          <div className="flex items-center gap-2 text-sm">
            <Tag className="w-4 h-4 text-slate-500" />
            <span className="text-slate-400">{t("ipo.sector")}:</span>
            <span className="text-slate-200">{ipo.sector}</span>
          </div>
        )}

        {ipo.use_of_proceeds && (
          <Section icon={DollarSign} title={t("ipo.use_of_proceeds")}>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">{ipo.use_of_proceeds}</p>
          </Section>
        )}

        {underwriters.length > 0 && (
          <Section icon={Users} title={t("ipo.underwriters")}>
            <div className="flex flex-wrap gap-2">
              {underwriters.map((u, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-sm bg-slate-900 border border-white/10 text-slate-300">{u}</span>
              ))}
            </div>
          </Section>
        )}

        {ipo.subscription_demand && (
          <Section icon={Activity} title={t("ipo.subscription_demand")}>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">{ipo.subscription_demand}</p>
          </Section>
        )}

        <Section icon={Sprout} title={t("ipo.growth_story")}>
          <p className="text-slate-300 leading-relaxed whitespace-pre-line">{ipo.growth_story}</p>
        </Section>

        {ipo.risks && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-rose-300" />
              <h3 className="text-sm font-semibold text-rose-200">{t("ipo.risks")}</h3>
            </div>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line">{ipo.risks}</p>
          </div>
        )}

        {comparables.length > 0 && (
          <Section icon={LineChart} title={t("ipo.comparables")}>
            <div className="flex flex-wrap gap-2">
              {comparables.map((c, i) => (
                <span key={i} className="px-3 py-1.5 rounded-lg text-sm bg-slate-900 border border-white/10 text-slate-300">{c}</span>
              ))}
            </div>
          </Section>
        )}

        <Section icon={Activity} title={t("ipo.recent_activity")}>
          <p className="text-slate-300 leading-relaxed whitespace-pre-line">{ipo.recent_activity}</p>
        </Section>

        {keyPoints.length > 0 && (
          <Section icon={Rocket} title={t("ipo.key_points")}>
            <ul className="space-y-2">
              {keyPoints.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-slate-300 leading-relaxed">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {ipo.content && (
          <Section icon={Building2} title={t("ipo.full_analysis")}>
            <div className="text-slate-300 leading-relaxed whitespace-pre-line">{ipo.content}</div>
          </Section>
        )}

        {sources.length > 0 && (
          <Section icon={ExternalLink} title={t("ipo.sources")}>
            <div className="flex flex-col gap-1.5">
              {sources.map((s, i) => (
                <a key={i} href={s} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-cyan-300 hover:text-cyan-200 truncate">
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{s}</span>
                </a>
              ))}
            </div>
          </Section>
        )}
      </div>
    </article>
  );
}