import React from "react";
import { ExternalLink, Clock, Crown, DollarSign, Briefcase, Heart, Car, Activity, BookOpen, Landmark, Building2, User, Users, Globe, PieChart } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatDistanceToNow } from "date-fns";
import { ja, enUS } from "date-fns/locale";

const safeParse = (s, fallback) => {
  try { return JSON.parse(s); } catch { return fallback; }
};

const HOLDER_ICON = {
  individual: User,
  corporate: Building2,
  institutional: Landmark,
  sovereign: Globe,
  fund: Briefcase
};

const HOLDER_COLOR = {
  individual: "text-cyan-300 bg-cyan-500/10 border-cyan-400/30",
  corporate: "text-violet-300 bg-violet-500/10 border-violet-400/30",
  institutional: "text-amber-300 bg-amber-500/10 border-amber-400/30",
  sovereign: "text-emerald-300 bg-emerald-500/10 border-emerald-400/30",
  fund: "text-rose-300 bg-rose-500/10 border-rose-400/30"
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

export default function WealthProfileCard({ profile, live = false }) {
  const { t, lang } = useI18n();
  if (!profile) return null;

  const keyPoints = safeParse(profile.key_points, []);
  const holdings = safeParse(profile.holdings, []);
  const portfolio = safeParse(profile.portfolio, []);
  const sectors = safeParse(profile.sector_allocation, []);
  const sources = safeParse(profile.sources, []);
  const locale = lang === "en" ? enUS : ja;

  const hasPortfolio = portfolio.length > 0 || !!profile.portfolio_summary;
  const maxAlloc = Math.max(100, ...portfolio.map((p) => Number(p.allocation_pct) || 0));

  return (
    <article className="rounded-3xl border border-amber-400/20 bg-gradient-to-br from-amber-500/5 to-violet-500/5 overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-border text-muted-foreground capitalize">{profile.profile_type}</span>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 border border-border text-muted-foreground">v{profile.version}</span>
          {live && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-400/30 text-amber-300">
              <Crown className="w-3 h-3" /> {t("wealth.just_now")}
            </span>
          )}
        </div>
        <h2 className="font-display text-3xl font-bold text-foreground">{profile.query}</h2>
        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground/80">
          <Clock className="w-3.5 h-3.5" />
          {profile.created_date ? formatDistanceToNow(new Date(profile.created_date), { addSuffix: true, locale }) : ""}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {profile.summary && (
          <p className="text-foreground text-lg leading-relaxed border-l-2 border-amber-400 pl-4 italic">{profile.summary}</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {profile.net_worth && (
            <div className="rounded-xl p-4 bg-card/60 border border-amber-400/20">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 uppercase tracking-wide"><Crown className="w-3.5 h-3.5" /> {t("wealth.net_worth")}</div>
              <div className="font-display text-xl font-bold text-amber-300 mt-1">{profile.net_worth}</div>
            </div>
          )}
          {profile.annual_income && (
            <div className="rounded-xl p-4 bg-card/60 border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 uppercase tracking-wide"><DollarSign className="w-3.5 h-3.5" /> {t("wealth.annual_income")}</div>
              <div className="font-display text-base font-bold text-foreground mt-1">{profile.annual_income}</div>
            </div>
          )}
          {profile.compensation && (
            <div className="rounded-xl p-4 bg-card/60 border border-white/5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 uppercase tracking-wide"><Briefcase className="w-3.5 h-3.5" /> {t("wealth.compensation")}</div>
              <div className="font-display text-base font-bold text-foreground mt-1">{profile.compensation}</div>
            </div>
          )}
        </div>

        {holdings.length > 0 && (
          <Section icon={Users} title={t("wealth.holdings")}>
            <div className="rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-card/80 text-muted-foreground/80 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left px-4 py-2.5 font-medium">{lang === "en" ? "Name" : "名前"}</th>
                    <th className="text-left px-4 py-2.5 font-medium">{lang === "en" ? "Type" : "種別"}</th>
                    <th className="text-right px-4 py-2.5 font-medium">{lang === "en" ? "Stake" : "保有割合"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {holdings.map((h, i) => {
                    const Icon = HOLDER_ICON[h.type] || User;
                    const color = HOLDER_COLOR[h.type] || HOLDER_COLOR.individual;
                    return (
                      <tr key={i} className="hover:bg-foreground/5">
                        <td className="px-4 py-3 text-foreground">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                            <div className="min-w-0">
                              <div className="truncate">{h.name}</div>
                              {h.note && <div className="text-sm text-muted-foreground/80 truncate">{h.note}</div>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${color}`}>{h.type}</span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-muted-foreground">{h.stake || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {hasPortfolio && (
          <div className="rounded-2xl border border-amber-400/30 bg-amber-500/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-amber-300" />
              <h3 className="text-sm font-semibold text-amber-200">{t("wealth.portfolio")}</h3>
            </div>
            {profile.portfolio_summary && (
              <p className="text-foreground leading-relaxed whitespace-pre-line mb-4">{profile.portfolio_summary}</p>
            )}
            {portfolio.length > 0 && (
              <div className="space-y-2.5">
                {portfolio.map((p, i) => {
                  const w = Math.min(100, ((Number(p.allocation_pct) || 0) / maxAlloc) * 100);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-foreground truncate flex items-center gap-2">
                          <span className="truncate">{p.name}</span>
                          {p.ticker && <span className="text-xs font-mono text-muted-foreground/80">{p.ticker}</span>}
                          {p.sector && <span className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-muted-foreground">{p.sector}</span>}
                        </span>
                        <span className="font-mono text-muted-foreground shrink-0 ml-2">{Number(p.allocation_pct) || 0}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500" style={{ width: `${w}%` }} />
                      </div>
                      {p.value && <div className="text-sm text-muted-foreground/80 mt-0.5">{p.value}{p.note ? ` — ${p.note}` : ""}</div>}
                    </div>
                  );
                })}
              </div>
            )}
            {sectors.length > 0 && (
              <div className="mt-5 pt-4 border-t border-amber-400/20">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 mb-3">{t("wealth.sector_alloc")}</h4>
                <div className="flex h-3 rounded-full overflow-hidden bg-slate-800">
                  {sectors.map((s, i) => {
                    const palette = ["bg-amber-400", "bg-orange-500", "bg-rose-400", "bg-violet-400", "bg-cyan-400", "bg-emerald-400", "bg-slate-400"];
                    const w = Math.max(0.5, Number(s.allocation_pct) || 0);
                    return <div key={i} className={palette[i % palette.length]} style={{ width: `${w}%` }} title={`${s.sector}: ${s.allocation_pct}%`} />;
                  })}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                  {sectors.map((s, i) => {
                    const palette = ["bg-amber-400", "bg-orange-500", "bg-rose-400", "bg-violet-400", "bg-cyan-400", "bg-emerald-400", "bg-slate-400"];
                    return (
                      <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className={`w-2 h-2 rounded-full ${palette[i % palette.length]}`} /> {s.sector} <span className="font-mono text-muted-foreground">{Number(s.allocation_pct) || 0}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <Section icon={Heart} title={t("wealth.philanthropy")}>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{profile.philanthropy}</p>
        </Section>

        <Section icon={Car} title={t("wealth.lifestyle")}>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{profile.lifestyle}</p>
        </Section>

        <Section icon={Activity} title={t("wealth.recent_activity")}>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{profile.recent_activity}</p>
        </Section>

        <Section icon={BookOpen} title={t("wealth.history_sec")}>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{profile.history}</p>
        </Section>

        {keyPoints.length > 0 && (
          <Section icon={Crown} title={t("wealth.key_points")}>
            <ul className="space-y-2">
              {keyPoints.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-muted-foreground leading-relaxed">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {profile.content && (
          <Section icon={BookOpen} title={t("wealth.full_analysis")}>
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line">{profile.content}</div>
          </Section>
        )}

        {sources.length > 0 && (
          <Section icon={ExternalLink} title={t("wealth.sources")}>
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