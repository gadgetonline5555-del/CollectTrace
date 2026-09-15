import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ShieldCheck, Check, X } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { PLANS } from "@/lib/plans";
import PricingTiers from "@/components/PricingTiers";
import { track } from "@/lib/track";

export default function Pricing() {
  const { toast } = useToast();
  const { t, lang } = useI18n();
  const [current, setCurrent] = useState("free");
  const [busy, setBusy] = useState(null);

  useEffect(() => { track("pricing_view"); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("status");
    if (status === "success") toast({ title: t("pt.success"), description: t("pt.success_desc") });
    else if (status === "cancelled") toast({ title: t("pt.cancelled"), variant: "destructive" });
  }, [toast, t]);

  const handleUpgrade = async (planId) => {
    if (planId === "free") { setCurrent("free"); return; }
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
    { label: t("cmp.row1"), values: [t("cmp.withAds"), "yes", "yes", "yes"] },
    { label: t("cmp.row2"), values: ["no", t("cmp.basic"), t("cmp.detailed"), t("cmp.institutional")] },
    { label: t("cmp.row3"), values: ["no", t("cmp.beginner"), t("cmp.detailed"), t("cmp.deep")] },
    { label: t("cmp.row4"), values: ["no", "no", "yes", t("cmp.highfreq")] },
    { label: t("cmp.row5"), values: ["no", "no", "no", "yes"] },
  ];

  const cell = (v) => v === "yes" ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : v === "no" ? <X className="w-4 h-4 text-slate-600 mx-auto" /> : v;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-5xl font-bold text-white">{t("pricing.h1")}</h1>
        <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">{t("pricing.p")}</p>
        <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-slate-900 border border-white/10 text-sm text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          {t("pricing.disclaimer")}
        </div>
      </div>

      <PricingTiers currentTier={current} onUpgrade={handleUpgrade} busy={busy} />

      <div className="mt-20">
        <h2 className="font-display text-2xl font-bold text-white text-center mb-8">{t("pricing.compare_h")}</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/80 text-slate-300">
                <th className="text-left p-4 font-medium">{t("cmp.feature")}</th>
                {PLANS.map((p) => <th key={p.id} className="p-4 font-medium">{p.name[lang]}</th>)}
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {ROWS.map((row) => (
                <tr key={row.label} className="border-t border-white/10">
                  <td className="p-4 text-white font-medium">{row.label}</td>
                  {row.values.map((v, i) => <td key={i} className="p-4 text-center">{cell(v)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}