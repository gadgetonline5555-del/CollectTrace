import React from "react";
import { TrendingUp } from "lucide-react";

export default function Footer() {
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
          <p className="text-slate-400 leading-relaxed">
            投資漫画で学び、投資調査で深める。次世代の投資情報プラットフォーム。
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">提供内容</h4>
          <ul className="space-y-2 text-slate-400">
            <li>投資漫画コンテンツ</li>
            <li>銘柄スクリーニング</li>
            <li>調査レポート</li>
            <li>市場データ API</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">注意事項</h4>
          <p className="text-slate-400 leading-relaxed">
            本サービスは情報提供のみを目的とし、投資助言・個別相談は行いません。投資は自己責任でご判断ください。
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-500">
        © 2026 Collect Trace. All rights reserved.
      </div>
    </footer>
  );
}