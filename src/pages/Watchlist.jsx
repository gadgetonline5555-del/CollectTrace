import React, { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useI18n } from "@/lib/i18n";
import { useUserTier } from "@/hooks/useUserTier";
import TierGate from "@/components/TierGate";
import { track } from "@/lib/track";
import { useToast } from "@/components/ui/use-toast";

export default function Watchlist() {
  const { t } = useI18n();
  const { can } = useUserTier();
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ticker: "", title: "", target_price: "", note: "" });

  const load = () => {
    setLoading(true);
    base44.entities.Watchlist.list("-created_date", 100).then((r) => { setItems(r); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { if (can("starter")) load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.ticker) return;
    const payload = {
      ticker: form.ticker.toUpperCase(),
      title: form.title || form.ticker.toUpperCase(),
      target_price: form.target_price ? Number(form.target_price) : null,
      note: form.note,
    };
    const tempId = `temp_${Date.now()}`;
    setItems((prev) => [{ id: tempId, ...payload }, ...prev]);
    setForm({ ticker: "", title: "", target_price: "", note: "" });
    track("watchlist_add", { ticker: payload.ticker, title: payload.title });
    try {
      const created = await base44.entities.Watchlist.create(payload);
      setItems((prev) => prev.map((it) => (it.id === tempId ? created : it)));
    } catch (err) {
      setItems((prev) => prev.filter((it) => it.id !== tempId));
      toast({ title: t("wl.err"), description: err?.message, variant: "destructive" });
    }
  };
  const remove = async (id) => {
    const prev = items;
    setItems((cur) => cur.filter((it) => it.id !== id));
    try {
      await base44.entities.Watchlist.delete(id);
    } catch (err) {
      setItems(prev);
      toast({ title: t("wl.err"), variant: "destructive" });
    }
  };

  return (
    <TierGate requiredTier="starter" title={t("wl.locked_h")} description={t("wl.locked_p")}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-white">{t("wl.h")}</h1>
          <p className="text-slate-400 mt-2">{t("wl.p")}</p>
        </div>
        <form onSubmit={add} className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8 p-5 rounded-2xl bg-slate-900/60 border border-white/10">
          <input value={form.ticker} onChange={(e) => setForm({ ...form, ticker: e.target.value })} placeholder={t("wl.ticker")} className="px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-sm" />
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t("wl.title")} className="px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-sm" />
          <input value={form.target_price} onChange={(e) => setForm({ ...form, target_price: e.target.value })} placeholder={t("wl.target")} type="number" className="px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-sm" />
          <div className="flex gap-2">
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder={t("wl.note")} className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-white/10 text-white text-sm" />
            <button type="submit" className="px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-400 to-violet-500 text-slate-950 font-semibold text-sm flex items-center gap-1"><Plus className="w-4 h-4" />{t("wl.add")}</button>
          </div>
        </form>
        {loading ? (
          <div className="text-slate-500 py-12 text-center">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-slate-500">{t("wl.empty")}</div>
        ) : (
          <div className="space-y-3">
            {items.map((it) => (
              <div key={it.id} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-white/10">
                <span className="font-mono font-bold text-white">{it.ticker}</span>
                <span className="text-slate-300 flex-1">{it.title}</span>
                {it.target_price != null && <span className="text-sm text-slate-400">¥{Number(it.target_price).toLocaleString()}</span>}
                {it.note && <span className="text-sm text-slate-500 hidden md:block max-w-xs truncate">{it.note}</span>}
                <button onClick={() => remove(it.id)} aria-label={t("wl.remove")} className="text-slate-500 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </TierGate>
  );
}