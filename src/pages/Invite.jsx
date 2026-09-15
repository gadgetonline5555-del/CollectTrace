import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Gift, Users, Sparkles, Copy, Check, TrendingUp, Rocket } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useI18n } from "@/lib/i18n";
import { base44 } from "@/api/base44Client";
import ShareBar from "@/components/ShareBar";

export default function Invite() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState({ count: 0, bonus: 0, authenticated: false });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const link = user?.id ? `${window.location.origin}/?ref=${user.id}` : "";

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    base44.functions.invoke("getReferralStats", {})
      .then((res) => setStats(res.data || { count: 0, bonus: 0 }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-4">
        <Gift className="w-3.5 h-3.5" /> {t("invite.badge")}
      </div>
      <h1 className="font-display text-4xl font-bold text-white">{t("invite.h")}</h1>
      <p className="text-slate-400 mt-2 max-w-2xl">{t("invite.p")}</p>

      <div className="mt-8 rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 p-6">
        <div className="flex items-center gap-2 text-emerald-300 font-semibold mb-4">
          <Sparkles className="w-5 h-5" /> {t("invite.reward_title")}
        </div>
        <ul className="space-y-2.5 text-slate-200">
          {[t("invite.reward1"), t("invite.reward2"), t("invite.reward3")].map((r, i) => (
            <li key={i} className="flex gap-2.5 leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {!user?.id ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-8 text-center">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-300 font-medium mb-2">{t("invite.login_h")}</p>
          <p className="text-slate-500 text-sm mb-6">{t("invite.login_p")}</p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/register" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-400 to-cyan-500 text-slate-950 hover:opacity-90">
              <Rocket className="w-4 h-4" /> {t("invite.register")}
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold bg-slate-800 text-slate-200 border border-white/10 hover:bg-slate-700">
              {t("invite.login")}
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-6">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">{t("invite.your_link")}</label>
            <div className="mt-2 flex items-center gap-2">
              <input readOnly value={link} className="flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-slate-200 font-mono text-sm truncate" />
              <button onClick={copy} className="inline-flex items-center gap-2 px-4 py-3 rounded-xl font-semibold bg-white text-slate-950 hover:opacity-90">
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                {copied ? t("invite.copied") : t("invite.copy")}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-2">{t("invite.link_hint")}</p>

            <div className="mt-4">
              <ShareBar url={link} text={t("invite.share_text")} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wide"><Users className="w-3.5 h-3.5" /> {t("invite.invited")}</div>
              <div className="font-display text-3xl font-bold text-white mt-1">{loading ? "…" : stats.count}</div>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/5 p-5">
              <div className="flex items-center gap-1.5 text-xs text-emerald-300/70 uppercase tracking-wide"><TrendingUp className="w-3.5 h-3.5" /> {t("invite.bonus")}</div>
              <div className="font-display text-3xl font-bold text-emerald-300 mt-1">+{loading ? "…" : stats.bonus}<span className="text-base text-emerald-400/60 ml-1">{t("invite.per_day")}</span></div>
            </div>
          </div>
        </>
      )}

      <p className="mt-8 text-xs text-slate-600 leading-relaxed">{t("invite.disclaimer")}</p>
    </div>
  );
}