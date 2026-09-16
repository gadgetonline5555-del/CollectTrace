import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ShieldCheck, Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { PLANS } from "@/lib/plans";
import PricingTiers from "@/components/PricingTiers";
import { track } from "@/lib/track";
import { isNativeMobileApp, openExternal } from "@/lib/platform";

export default function Pricing() {
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const [current, setCurrent] = useState("free");
  const [busy, setBusy] = useState(null);
  const native = isNativeMobileApp();

  useEffect(() => { track("pricing_view"); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "success") toast({ title: t("pt.success"), description: t("pt.success_desc") });
    else if (status === "cancelled") toast({ title: t("pt.cancelled"), variant: "destructive" });
  }, [toast, t]);

  const handleUpgrade = async (planId) => {
    if (planId === "free") { setCurrent("free"); return; }
    if (native) {
      openExternal(`${window.location.origin}/pricing`);
      toast({ title: t("pt.native_title"), description: t("pt.native_desc") });
      return;
    }
    if (window.top !== window.self) {
      toast({ title: t("pt.iframe_title"), description: t("pt.iframe_desc"), variant: "destructive" });
      return;
    }
    track("plan_upgrade", { content_tier: planId });
    setBusy(planId);
    try {
      const res = await base44.functions.invoke("createCheckout", { plan_tier: planId });
      if (res.data?.url) window.location.href = res.data.url;
      else toast({ title: t("pt.fail"), variant: "destructive" });
    } catch (e) {
      toast({ title: t("pt.error"), description: e.message, variant: "destructive" });
    } finally {
      setBusy(null);
    }
  };

  const ROWS = [
    { label: t("cmp.row1"), values: [t("cmp.row1_free"), t("cmp.unlimited"), t("cmp.unlimited"), t("cmp.unlimited")] },
    { label: t("cmp.row2"), values: ["no", t("cmp.basic"), t("cmp.detailed"), t("cmp.institutional")] },
    { label: t("cmp.row3"), values: ["no", t("cmp.beginner"), t("cmp.detailed"), t("cmp.deep")] },
    { label: t("cmp.row4"), values: ["no", "no", "yes", t("cmp.highfreq")] },
    { label: t("cmp.row5"), values: ["no", "no", "no", "yes"] },
  ];

  const cell = (v) => v === "yes" ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : v === "no" ? <X className="w-4 h-4 text-slate-600 mx-auto" /> : v;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-5xl font-bold text-foreground">{t("pricing.h1")}</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-lg">{t("pricing.p")}</p>
        <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-card border border-border text-sm text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          {t("pricing.disclaimer")}
        </div>
        {native && (
          <div className="mt-4 mx-auto max-w-2xl rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-left">
            <p className="text-sm text-amber-200">{t("pt.native_banner")}</p>
            <button
              onClick={() => openExternal(`${window.location.origin}/pricing`)}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-white text-slate-950 min-h-11"
            >
              {t("pt.native_cta")}
            </button>
          </div>
        )}
      </div>

      <PricingTiers currentTier={current} onUpgrade={handleUpgrade} busy={busy} />

      <div className="mt-20">
        <h2 className="font-display text-2xl font-bold text-foreground text-center mb-8">{t("pricing.compare_h")}</h2>
        <div className="hidden md:block">
        <div className="relative overflow-x-auto overscroll-x-auto touch-pan-x rounded-2xl border border-border">
          <div aria-hidden className="pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-slate-950/90 to-transparent" />
          <div aria-hidden className="pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-slate-950/90 to-transparent" />
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-card/80 text-muted-foreground">
                <th className="text-left p-4 font-medium">{t("cmp.feature")}</th>
                {PLANS.map((p) => <th key={p.id} className="p-4 font-medium">{p.name[lang]}</th>)}
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              {ROWS.map((row) => (
                <tr key={row.label} className="border-t border-border">
                  <td className="p-4 text-foreground font-medium">{row.label}</td>
                  {row.values.map((v, i) => <td key={i} className="p-4 text-center">{cell(v)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
        <div className="md:hidden -mx-4 px-4 space-y-4">
          {PLANS.map((p, pi) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card/60 overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-card/80">
                <h3 className="font-display text-lg font-bold text-foreground">{p.name[lang]}</h3>
              </div>
              <div className="divide-y divide-white/5">
                {ROWS.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                    <span className="text-muted-foreground">{row.label}</span>
                    <span className="text-foreground font-medium text-right">{cell(row.values[pi])}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}