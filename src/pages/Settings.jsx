import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "next-themes";
import { base44 } from "@/api/base44Client";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Sun, Moon, Monitor, Trash2 } from "lucide-react";

const THEMES = [
  { id: "light", icon: Sun, key: "set.theme_light" },
  { id: "dark", icon: Moon, key: "set.theme_dark" },
  { id: "system", icon: Monitor, key: "set.theme_system" },
];

export default function Settings() {
  const { lang, setLang, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleDelete = async () => {
    setDeleting(true);
    setErr(null);
    try {
      await base44.functions.invoke("deleteAccount");
      await base44.auth.logout();
    } catch (e) {
      setErr(e?.message || "error");
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-8">
      <h1 className="font-display text-2xl font-bold text-white mb-6">{t("set.h")}</h1>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-400 mb-3">{t("set.language")}</h2>
        <div className="flex gap-2">
          {[
            { id: "jp", label: "日本語" },
            { id: "en", label: "English" },
          ].map((o) => (
            <button
              key={o.id}
              onClick={() => setLang(o.id)}
              className={`flex-1 py-3 rounded-xl text-sm font-medium min-h-11 ${
                lang === o.id ? "bg-white text-slate-950" : "bg-slate-900 text-slate-300 border border-white/10"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-400 mb-3">{t("set.theme")}</h2>
        <div className="flex gap-2">
          {THEMES.map(({ id, icon: Icon, key }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              aria-label={t(key)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-medium min-h-11 ${
                theme === id ? "bg-white text-slate-950" : "bg-slate-900 text-slate-300 border border-white/10"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{t(key)}</span>
            </button>
          ))}
        </div>
      </section>

      {user && (
        <section>
          <h2 className="text-sm font-semibold text-rose-400 mb-3">{t("set.delete")}</h2>
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/5 p-4">
            <p className="text-sm text-slate-300 mb-4">{t("set.delete_desc")}</p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-50 min-h-11"
                >
                  <Trash2 className="w-4 h-4" /> {t("set.delete_btn")}
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-950 border-white/10 text-slate-100">
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("set.delete_confirm_t")}</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400">
                    {t("set.delete_confirm_d")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                {err && <p className="text-xs text-rose-400">{err}</p>}
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>{t("set.cancel")}</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-rose-500 hover:bg-rose-600 text-white"
                  >
                    {deleting ? t("set.deleting") : t("set.delete_confirm")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </section>
      )}
    </div>
  );
}