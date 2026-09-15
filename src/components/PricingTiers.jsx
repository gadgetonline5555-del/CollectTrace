import React, { useState } from "react";
import { Check, Lock, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/plans";
import { useI18n } from "@/lib/i18n";

export default function PricingTiers({ currentTier = "free", onUpgrade, compact = false, busy = null }) {
  const [annual, setAnnual] = useState(false);
  const { t, lang } = useI18n();

  return (
    <div>
      <div className="flex items-center justify-center gap-3 mb-8">
        <span className={`text-sm ${!annual ? "text-white font-semibold" : "text-slate-500"}`}>{t("pt.monthly")}</span>
        <button onClick={() => setAnnual((a) => !a)} className={`relative w-14 h-7 rounded-full transition-colors ${annual ? "bg-gradient-to-r from-cyan-400 to-violet-500" : "bg-slate-700"}`}>
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform ${annual ? "translate-x-8" : "translate-x-1"}`} />
        </button>
        <span className={`text-sm ${annual ? "text-white font-semibold" : "text-slate-500"}`}>{t("pt.annual")} <span className="text-emerald-400 text-xs">{t("pt.annual_hint")}</span></span>
      </div>

      <div className={`grid gap-5 ${compact ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-2 xl:grid-cols-4"}`}>
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentTier;
          const isBusy = busy === plan.id;
          const price = annual ? Math.round(plan.price * 10) : plan.price;
          return (
            <div key={plan.id} className={`relative rounded-3xl p-6 bg-slate-900/60 backdrop-blur border ${plan.ring} ring-1 flex flex-col ${plan.id === "pro" ? "lg:scale-105 shadow-2xl shadow-violet-500/10" : ""}`}>
              {plan.id === "pro" && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-violet-400 to-fuchsia-500 text-slate-950 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> {t("pt.popular")}
                </div>
              )}
              <div className={`inline-flex w-fit px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${plan.accent} text-slate-950 mb-3`}>
                {plan.audience[lang]}
              </div>
              <h3 className="font-display text-2xl font-bold text-white">{plan.name[lang]}</h3>
              <p className="text-slate-400 text-sm mb-4">{plan.tagline[lang]}</p>
              <div className="mb-5">
                <span className="font-display text-4xl font-bold text-white">{price === 0 ? t("pt.free_display") : `¥${price.toLocaleString()}`}</span>
                <span className="text-slate-500 text-sm ml-1">{price === 0 ? "" : annual ? t("pt.yr") : t("pt.mo")}</span>
              </div>
              <ul className="space-y-2.5 mb-5 flex-1">
                {plan.features[lang].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 mt-0.5 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
                {plan.locked[lang].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Lock className="w-4 h-4 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button disabled={isCurrent || isBusy} onClick={() => onUpgrade?.(plan.id)} className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${isCurrent ? "bg-slate-800 text-slate-500 cursor-default" : `bg-gradient-to-r ${plan.accent} text-slate-950 hover:opacity-90 hover:shadow-lg ${isBusy ? "opacity-60 cursor-wait" : ""}`}`}>
                {isBusy ? t("pt.loading") : isCurrent ? t("pt.current") : price === 0 ? t("pt.startfree") : t("pt.upgrade")}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}