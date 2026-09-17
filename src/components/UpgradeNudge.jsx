import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, X, ArrowRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useUserTier } from "@/hooks/useUserTier";
import { useValueMilestones } from "@/hooks/useValueMilestones";

// Contextual upgrade nudge — shown only to free/anonymous users who have
// accumulated enough value interactions to make an upgrade feel earned
// (endowed progress), not pushed. Quality is identical across tiers; this
// gates depth, not information.
export default function UpgradeNudge() {
  const { t } = useI18n();
  const { tier: userTier } = useUserTier();
  const { shouldShow, tier, reasonKey, dismiss } = useValueMilestones();

  if (userTier !== "free" && userTier !== "anonymous") return null;
  if (!shouldShow) return null;

  return (
    <div className="relative rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 p-5 mt-6">
      <button
        onClick={dismiss}
        aria-label={t("nudge.dismiss")}
        className="absolute top-3 right-3 min-h-11 min-w-11 inline-flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
      >
        <X className="w-4 h-4" />
      </button>
      <div className="flex items-center gap-2 mb-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" /> {t(`nudge.badge_${tier}`)}
        </div>
      </div>
      <h3 className="font-display text-lg font-bold text-foreground mb-1">{t(`nudge.title_${tier}`)}</h3>
      <p className="text-sm text-muted-foreground mb-4 pr-8">{t(reasonKey)}</p>
      <Link
        to="/pricing"
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 hover:opacity-90 transition-opacity text-sm"
      >
        {t(`nudge.cta_${tier}`)} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}