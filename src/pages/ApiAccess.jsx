import React, { useState } from "react";
import { Copy, Check, KeyRound, Code } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useUserTier } from "@/hooks/useUserTier";
import TierGate from "@/components/TierGate";

export default function ApiAccess() {
  const { t } = useI18n();
  const { can, user } = useUserTier();
  const [copied, setCopied] = useState(false);
  const baseUrl = "https://investra-manga-insight.base44.app/api/v1";
  const apiKey = can("elite") ? `ct_live_${(user?.id || "").slice(0, 24)}` : null;
  const example = `curl ${baseUrl}/research?ticker=7203 \\\n  -H "Authorization: Bearer ${apiKey || "<YOUR_KEY>"}"`;

  const copy = () => { navigator.clipboard?.writeText(example); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <TierGate requiredTier="elite" title={t("api.locked_h")} description={t("api.locked_p")}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-foreground">{t("api.h")}</h1>
          <p className="text-muted-foreground mt-2">{t("api.p")}</p>
        </div>
        <div className="space-y-5">
          <div className="rounded-2xl p-5 bg-card/60 border border-border">
            <div className="text-xs text-muted-foreground/80 mb-1">{t("api.base")}</div>
            <code className="text-cyan-300 font-mono text-sm break-all">{baseUrl}</code>
          </div>
          <div className="rounded-2xl p-5 bg-card/60 border border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mb-2"><KeyRound className="w-3.5 h-3.5" />{t("api.key")}</div>
            {apiKey ? (
              <code className="text-amber-300 font-mono text-sm break-all">{apiKey}</code>
            ) : (
              <p className="text-muted-foreground/80 text-sm">{t("api.pending")}</p>
            )}
            <p className="text-muted-foreground/80 text-sm mt-2">{t("api.key_desc")}</p>
          </div>
          <div className="rounded-2xl p-5 bg-background border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground/80"><Code className="w-3.5 h-3.5" />{t("api.example")}</div>
              <button onClick={copy} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">{copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" />{t("api.copied")}</> : <><Copy className="w-3.5 h-3.5" />{t("api.copy")}</>}</button>
            </div>
            <pre className="text-muted-foreground font-mono text-xs whitespace-pre-wrap break-all">{example}</pre>
          </div>
        </div>
      </div>
    </TierGate>
  );
}