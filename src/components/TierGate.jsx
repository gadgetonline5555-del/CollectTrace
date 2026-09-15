import React from "react";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { useUserTier } from "@/hooks/useUserTier";
import { getPlan } from "@/lib/plans";
import { useI18n } from "@/lib/i18n";

export default function TierGate({ requiredTier, title, description, children }) {
  const { can } = useUserTier();
  const { t, lang } = useI18n();
  if (can(requiredTier)) return <>{children}</>;
  const plan = getPlan(requiredTier);
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <Lock className="w-12 h-12 text-amber-300 mx-auto mb-4" />
      <h1 className="font-display text-3xl font-bold text-white mb-3">{title}</h1>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">{description}</p>
      <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full bg-slate-900 border border-white/10 text-sm text-slate-300">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${plan.accent} text-slate-950`}>{plan.name[lang]}</span>
        <span>{plan.priceLabel[lang]}</span>
      </div>
      <div>
        <Link to="/pricing" className="inline-flex px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-amber-300 to-orange-500 text-slate-950 hover:opacity-90">
          {t("reader.view_plans")}
        </Link>
      </div>
    </div>
  );
}