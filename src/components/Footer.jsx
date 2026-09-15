import React from "react";
import { TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();
  return (
    <footer className="mt-24 border-t border-white/10 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 via-violet-500 to-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-slate-950" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-white">Collect Trace</span>
          </div>
          <p className="text-slate-400 leading-relaxed">{t("footer.tagline")}</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">{t("footer.contents")}</h4>
          <ul className="space-y-2 text-slate-400">
            <li>{t("footer.c1")}</li>
            <li>{t("footer.c2")}</li>
            <li>{t("footer.c3")}</li>
            <li>{t("footer.c4")}</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">{t("footer.notice_h")}</h4>
          <p className="text-slate-400 leading-relaxed">{t("footer.notice")}</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © 2026 Collect Trace. All rights reserved.
      </div>
    </footer>
  );
}