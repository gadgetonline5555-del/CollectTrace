import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Plus, Trash2 } from "lucide-react";

export default function ResourceManager({ entityName, fields, titleField = "title" }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);

  const load = () => {
    setLoading(true);
    base44.entities[entityName].list("-updated_date", 100).then((r) => { setItems(r); setLoading(false); });
  };
  useEffect(load, [entityName]);

  const startCreate = () => { setEditing({}); setOpen(true); };
  const startEdit = (item) => { setEditing({ ...item }); setOpen(true); };
  const save = async () => {
    if (editing.id) await base44.entities[entityName].update(editing.id, editing);
    else await base44.entities[entityName].create(editing);
    setOpen(false); load();
  };
  const remove = async (id) => { await base44.entities[entityName].delete(id); load(); };
  const set = (k, v) => setEditing((e) => ({ ...e, [k]: v }));

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-slate-400 text-sm">{items.length}件</p>
        <Button onClick={startCreate} size="sm"><Plus className="w-4 h-4 mr-1" />新規追加</Button>
      </div>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="text-left p-3">タイトル</th>
              <th className="text-left p-3">プラン</th>
              <th className="p-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="p-6 text-center text-slate-500">読み込み中…</td></tr>
            ) : items.map((it) => (
              <tr key={it.id} className="border-t border-white/10 text-slate-300">
                <td className="p-3 text-white">{it[titleField]}</td>
                <td className="p-3">{it.plan_tier}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button onClick={() => startEdit(it)} className="p-1.5 hover:text-white"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(it.id)} className="p-1.5 hover:text-rose-400"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-950 border-white/15">
          <DialogHeader><DialogTitle className="text-white">{editing?.id ? "編集" : "新規追加"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="text-xs text-slate-400 mb-1 block">{f.label}{f.required && " *"}</label>
                {f.type === "textarea" ? (
                  <Textarea value={editing?.[f.key] ?? ""} onChange={(e) => set(f.key, e.target.value)} className="bg-slate-900 border-white/10 text-white" rows={6} />
                ) : f.type === "select" ? (
                  <Select value={editing?.[f.key] ?? ""} onValueChange={(v) => set(f.key, v)}>
                    <SelectTrigger className="bg-slate-900 border-white/10 text-white"><SelectValue placeholder="選択…" /></SelectTrigger>
                    <SelectContent>{f.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                ) : (
                  <Input type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"} value={editing?.[f.key] ?? ""} onChange={(e) => set(f.key, f.type === "number" ? Number(e.target.value) : e.target.value)} className="bg-slate-900 border-white/10 text-white" />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>キャンセル</Button>
            <Button onClick={save}>保存</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}