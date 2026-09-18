import React from "react";
import { ExternalLink, Clock, Network, TrendingUp, GitFork, Handshake, Building2, Sprout, Activity, DollarSign, Scale } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { ja, enUS } from "date-fns/locale";

const safeParse = (s, fallback) => {
  try { return JSON.parse(s); } catch { return fallback; }
};

function Section({ icon: Icon, title, children }) {
  if (!children) return null;
  return (
    <div>
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground/80 mb-3">
        <Icon className="w-3.5 h-3.5" /> {title}
      </h3>
      {children}
    </div>
  );
}

export default function CompanyIntelCard({ intel, live = false }) {
  const { t, lang } = useI18n();
  if (!intel) return null;

  const keyPoints = safeParse(intel.key_points, []);
  const investors = safeParse(intel.investors, []);
  const investments = safeParse(intel.investments, []);
  const partnerships = safeParse(intel.partnerships, []);
  const sources = safeParse(intel.sources, []);
  const locale = lang === "en" ? enUS : ja;

  const RelTable = ({ rows, cols }) => (
    <div className="rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto overscroll-x-contain">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-white/5">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-foreground/5">
              {cols.map((c) => (
                <td key={c.key} className={`px-4 py-3 ${c.key === "name" ? "text-foreground" : c.key === "stake" || c.key === "amount" ? "text-right font-mono text-muted-foreground" : "text-muted-foreground"}`}>
                  {r[c.key] || "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );

  return (
    <article className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-border text-muted-foreground capitalize">{intel.company_type}</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-border text-muted-foreground">v{intel.version}</span>
          {live && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
              <Network className="w-3 h-3" /> {t("intel.just_now")}
            </span>
          )}
        </div>
        <h2 className="font-display text-3xl font-bold text-foreground">{intel.query}</h2>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground/80">
          <Clock className="w-3.5 h-3.5" />
          {intel.created_date ? formatDistanceToNow(new Date(intel.created_date), { addSuffix: true, locale }) : ""}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {intel.summary && (
          <p className="text-foreground text-lg leading-relaxed border-l-2 border-emerald-400 pl-4 italic">{intel.summary}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {intel.market_cap && (
            <div className="rounded-xl p-4 bg-card/60 border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 uppercase tracking-wide"><DollarSign className="w-3.5 h-3.5" /> {t("intel.market_cap")}</div>
              <div className="font-display text-base font-bold text-foreground mt-1">{intel.market_cap}</div>
            </div>
          )}
          {intel.growth_rate && (
            <div className="rounded-xl p-4 bg-card/60 border border-emerald-400/20">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 uppercase tracking-wide"><TrendingUp className="w-3.5 h-3.5" /> {t("intel.growth_rate")}</div>
              <div className="font-display text-base font-bold text-emerald-300 mt-1">{intel.growth_rate}</div>
            </div>
          )}
        </div>

        {intel.intrinsic_value && (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/5 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-amber-300" />
              <h3 className="text-sm font-semibold text-amber-200">{t("intel.intrinsic_value")}</h3>
            </div>
            <p className="text-foreground leading-relaxed whitespace-pre-line">{intel.intrinsic_value}</p>
            {intel.index_lift && (
              <div className="mt-3 pt-3 border-t border-amber-400/20">
                <div className="flex items-center gap-2 mb-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-xs font-semibold text-amber-200">{t("intel.index_lift")}</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{intel.index_lift}</p>
              </div>
            )}
          </div>
        )}

        {investors.length > 0 && (
          <Section icon={GitFork} title={t("intel.investors")}>
            <RelTable rows={investors} cols={[
              { key: "name", label: lang === "en" ? "Investor" : "出資者" },
              { key: "type", label: lang === "en" ? "Type" : "種別" },
              { key: "stage", label: lang === "en" ? "Stage" : "段階" },
              { key: "amount", label: lang === "en" ? "Amount" : "金額/保有" }
            ]} />
          </Section>
        )}

        {investments.length > 0 && (
          <Section icon={Building2} title={t("intel.investments")}>
            <RelTable rows={investments} cols={[
              { key: "name", label: lang === "en" ? "Target" : "出資先" },
              { key: "type", label: lang === "en" ? "Type" : "種別" },
              { key: "stake", label: lang === "en" ? "Stake" : "保有/規模" }
            ]} />
          </Section>
        )}

        {partnerships.length > 0 && (
          <Section icon={Handshake} title={t("intel.partnerships")}>
            <div className="space-y-2">
              {partnerships.map((p, i) => (
                <div key={i} className="rounded-xl border border-border bg-card/50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{p.name}</span>
                    {p.nature && <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-muted-foreground">{p.nature}</span>}
                  </div>
                  {p.note && <p className="text-xs text-muted-foreground/80 mt-1">{p.note}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section icon={Network} title={t("intel.corporate_structure")}>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{intel.corporate_structure}</p>
        </Section>

        <Section icon={Sprout} title={t("intel.growth_story")}>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{intel.growth_story}</p>
        </Section>

        {keyPoints.length > 0 && (
          <Section icon={Network} title={t("intel.key_points")}>
            <ul className="space-y-2">
              {keyPoints.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-muted-foreground leading-relaxed">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {intel.content && (
          <Section icon={Network} title={t("intel.full_analysis")}>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{intel.content}</div>
          </Section>
        )}

        {sources.length > 0 && (
          <Section icon={ExternalLink} title={t("intel.sources")}>
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