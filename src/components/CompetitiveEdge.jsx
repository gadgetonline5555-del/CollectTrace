import React from "react";
import { Check, Minus, X, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// Competitive differentiation module — auto-renders on the Radar page.
// Contrasts Collect Trace vs Bloomberg-type terminals and generative-AI finance tools.
const ROWS = [
  { key: "edge.row_source", ct: "yes", bb: "partial", ai: "no" },
  { key: "edge.row_sourcing", ct: "yes", bb: "no", ai: "partial" },
  { key: "edge.row_manga", ct: "yes", bb: "no", ai: "no" },
  { key: "edge.row_retail", ct: "yes", bb: "no", ai: "partial" },
  { key: "edge.row_neutral", ct: "yes", bb: "yes", ai: "partial" },
  { key: "edge.row_referral", ct: "yes", bb: "no", ai: "no" },
];

function Cell({ state }) {
  if (state === "yes") return <span className="inline-flex items-center justify-center"><Check className="w-4 h-4 text-emerald-400" /></span>;
  if (state === "partial") return <span className="inline-flex items-center justify-center"><Minus className="w-4 h-4 text-muted-foreground" /></span>;
  return <span className="inline-flex items-center justify-center"><X className="w-4 h-4 text-rose-400/70" /></span>;
}

export default function CompetitiveEdge() {
  const { t } = useI18n();
  return (
    <section className="mt-12">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-400/30 text-violet-300 text-xs font-semibold mb-4">
        <Sparkles className="w-3.5 h-3.5" /> {t("edge.badge")}
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground">{t("edge.h")}</h2>
      <p className="text-muted-foreground mt-2 mb-5 max-w-2xl text-sm">{t("edge.p")}</p>
      <div className="overflow-x-auto overscroll-x-contain -mx-4 sm:mx-0 rounded-2xl border border-border bg-card/40">
        <table className="w-full min-w-[560px] md:min-w-0 border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 px-3">{t("cmp.feature")}</th>
              <th className="text-center text-sm font-bold text-cyan-300 py-3 px-3">{t("edge.col_ct")}</th>
              <th className="text-center text-sm font-semibold text-muted-foreground py-3 px-3">{t("edge.col_bb")}</th>
              <th className="text-center text-sm font-semibold text-muted-foreground py-3 px-3">{t("edge.col_ai")}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.key} className="border-b border-border/60 last:border-0">
                <td className="py-3 px-3 text-sm text-foreground">{t(r.key)}</td>
                <td className="py-3 px-3 text-center"><Cell state={r.ct} /></td>
                <td className="py-3 px-3 text-center"><Cell state={r.bb} /></td>
                <td className="py-3 px-3 text-center"><Cell state={r.ai} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}