import React, { useEffect, useState } from "react";
import { Trash2, Plus, TrendingUp, TrendingDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { useUserTier } from "@/hooks/useUserTier";
import TierGate from "@/components/TierGate";
import { track } from "@/lib/track";
import { useToast } from "@/components/ui/use-toast";

export default function Portfolio() {
  const { t } = useI18n();
  const { can } = useUserTier();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ticker: "", shares: "", buy_price: "" });

  const load = async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Portfolio.list("-created_date", 100);
      setItems(list);
      const tickers = [...new Set(list.map((p) => p.ticker))];
      const results = await Promise.all(
        tickers.map((tk) =>
          base44.entities.Research.filter({ ticker: tk }, "-published_date", 1)
            .then((r) => (r && r[0] && r[0].current_price ? [tk, r[0].current_price] : null))
            .catch(() => null)
        )
      );
      const priceMap = {};
      for (const res of results) if (res) priceMap[res[0]] = res[1];
      setPrices(priceMap);
    } catch {}
    setLoading(false);
  };
  useEffect(() => { if (can("pro")) load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.ticker || !form.shares) return;
    const payload = {
      ticker: form.ticker.toUpperCase(),
      shares: Number(form.shares),
      buy_price: form.buy_price ? Number(form.buy_price) : null,
    };
    const tempId = `temp_${Date.now()}`;
    setItems((prev) => [{ id: tempId, ...payload }, ...prev]);
    setForm({ ticker: "", shares: "", buy_price: "" });
    track("portfolio_add", { ticker: payload.ticker });
    try {
      const created = await base44.entities.Portfolio.create(payload);
      setItems((prev) => prev.map((it) => (it.id === tempId ? created : it)));
    } catch (err) {
      setItems((prev) => prev.filter((it) => it.id !== tempId));
      toast({ title: t("pf.err"), variant: "destructive" });
    }
  };
  const remove = async (id) => {
    const prev = items;
    setItems((cur) => cur.filter((it) => it.id !== id));
    try {
      await base44.entities.Portfolio.delete(id);
    } catch (err) {
      setItems(prev);
      toast({ title: t("pf.err"), variant: "destructive" });
    }
  };

  const rows = items.map((p) => {
    const cur = prices[p.ticker] ?? null;
    const value = cur ? cur * p.shares : null;
    const cost = p.buy_price ? p.buy_price * p.shares : null;
    const pnl = value != null && cost != null ? value - cost : null;
    return { ...p, cur, value, cost, pnl };
  });
  const totalValue = rows.reduce((s, r) => s + (r.value || 0), 0);
  const totalCost = rows.reduce((s, r) => s + (r.cost || 0), 0);
  const totalPnl = totalValue - totalCost;

  return (
    <TierGate requiredTier="pro" title={t("pf.locked_h")} description={t("pf.locked_p")}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-white">{t("pf.h")}</h1>
          <p className="text-slate-400 mt-2">{t("pf.p")}</p>
        </div>
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="rounded-2xl p-5 bg-slate-900/60 border border-white/10">
              <div className="text-sm text-slate-500 mb-1">{t("pf.value")}</div>
              <div className="font-display text-2xl font-bold text-white">¥{totalValue.toLocaleString()}</div>
            </div>
            <div className="rounded-2xl p-5 bg-slate-900/60 border border-white/10">
              <div className="text-sm text-slate-500 mb-1">{t("pf.cost")}</div>
              <div className="font-display text-2xl font-bold text-white">¥{totalCost.toLocaleString()}</div>
            </div>
            <div className="rounded-2xl p-5 bg-slate-900/60 border border-white/10">
              <div className="text-sm text-slate-500 mb-1">{t("pf.pnl")}</div>
              <div className={`font-display text-2xl font-bold flex items-center gap-1 ${totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {totalPnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                ¥{totalPnl.toLocaleString()}
              </div>
            </div>
          </div>
        )}
        <form onSubmit={add} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <input value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value })} placeholder={t("pf.ticker")} className="px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-sm" />
          <input value={form.shares} onChange={(e) => setForm({ ...form, shares: e.target.value })} placeholder={t("pf.shares")} type="number" className="px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-sm" />
          <div className="flex gap-2">
            <input value={form.buy_price} onChange={(e) => setForm({ ...form, buy_price: e.target.value })} placeholder={t("pf.buyprice")} type="number" className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-sm" />
            <button type="submit" className="px-3 py-2 rounded-lg bg-gradient-to-r from-violet-400 to-fuchsia-600 text-slate-950 font-semibold text-sm flex items-center gap-1"><Plus className="w-4 h-4" />{t("pf.add")}</button>
          </div>
        </form>
        {loading ? (
          <div className="text-slate-500 py-12 text-center">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-slate-500">{t("pf.empty")}</div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-5 gap-2 px-4 text-xs text-slate-500 uppercase tracking-wide">
              <span>{t("pf.ticker")}</span><span>{t("pf.shares")}</span><span>{t("pf.current")}</span><span>{t("pf.value")}</span><span>{t("pf.pnl")}</span>
            </div>
            {rows.map((r) => (
              <div key={r.id} className="grid grid-cols-5 gap-2 items-center p-4 rounded-xl bg-slate-900/60 border border-white/10 text-sm">
                <span className="font-mono font-bold text-white">{r.ticker}</span>
                <span className="text-slate-300">{r.shares}</span>
                <span className="text-slate-300">{r.cur ? `¥${r.cur.toLocaleString()}` : t("pf.noprice")}</span>
                <span className="text-white font-semibold">{r.value != null ? `¥${r.value.toLocaleString()}` : "—"}</span>
                <div className="flex items-center gap-2">
                  <span className={r.pnl != null ? (r.pnl >= 0 ? "text-emerald-400" : "text-rose-400") : "text-slate-500"}>
                    {r.pnl != null ? `${r.pnl >= 0 ? "+" : ""}¥${r.pnl.toLocaleString()}` : "—"}
                  </span>
                  <button onClick={() => remove(r.id)} aria-label={t("pf.remove")} className="ml-auto min-h-11 min-w-11 inline-flex items-center justify-center text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </TierGate>
  );
}