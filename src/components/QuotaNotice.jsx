import React from "react";
import { Link } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useUserTier } from "@/hooks/useUserTier";

export default function QuotaNotice({ used = 0, limit = 0 }) {
  const { t } = useI18n();
  const { tier } = useUserTier();
  if (tier !== "free" && tier !== "anonymous") return null;

  return (
    <div className="rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-6 text-center">
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 mb-3">
        <Sparkles className="w-3.5 h-3.5" /> {t("quota.badge")}
      </div>
      <h3 className="font-display text-xl font-bold text-foreground mb-2">{t("quota.title")}</h3>
      <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
        {t("quota.body", { used, limit })}
      </p>
      <Link to="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 hover:opacity-90 transition-opacity">
        <Lock className="w-4 h-4" /> {t("quota.cta")}
      </Link>
    </div>
  );
}