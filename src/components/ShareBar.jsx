import React, { useState } from "react";
import { Twitter, Link2, Check, Share2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

// LINE has no lucide icon — use a safe text badge glyph instead of an SVG path
function LineIcon({ className }) {
  return (
    <span className={className + " inline-flex items-center justify-center font-extrabold leading-none select-none"} style={{ fontSize: "0.55em", letterSpacing: "-0.04em" }} aria-hidden="true">LINE</span>
  );
}

export default function ShareBar({ url, title, text, compact = false }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = text || title || "";

  const full = encodeURIComponent(shareText ? `${shareText} ${shareUrl}` : shareUrl);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  };

  const btn = "inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-slate-900 text-slate-200 hover:bg-slate-800 transition-colors font-medium";

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <a href={`https://twitter.com/intent/tweet?text=${full}`} target="_blank" rel="noreferrer" className={`${btn} px-2.5 py-2`} aria-label="Xでシェア"><Twitter className="w-4 h-4" /></a>
        <a href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" className={`${btn} px-2.5 py-2 text-[#06C755]`} aria-label="LINEでシェア"><LineIcon className="w-4 h-4" /></a>
        <button onClick={onCopy} className={`${btn} px-2.5 py-2`} aria-label="リンクをコピー">{copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}</button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div className="flex items-center gap-2 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <Share2 className="w-3.5 h-3.5" /> {t("share.label")}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <a href={`https://twitter.com/intent/tweet?text=${full}`} target="_blank" rel="noreferrer" className={`${btn} px-4 py-2 text-sm`}>
          <Twitter className="w-4 h-4" /> X
        </a>
        <a href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noreferrer" className={`${btn} px-4 py-2 text-sm text-[#06C755]`}>
          <LineIcon className="w-4 h-4" /> LINE
        </a>
        <button onClick={onCopy} className={`${btn} px-4 py-2 text-sm`}>
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />} {copied ? t("share.copied") : t("share.copy")}
        </button>
      </div>
    </div>
  );
}