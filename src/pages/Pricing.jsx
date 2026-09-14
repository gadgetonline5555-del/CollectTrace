import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { ShieldCheck, X } from "lucide-react";
import PricingTiers from "@/components/PricingTiers";

export default function Pricing() {
  const { toast } = useToast();
  const [current, setCurrent] = useState("free");

  const handleUpgrade = (planId) => {
    setCurrent(planId);
    toast({
      title: "プランを切り替えました（デモ）",
      description: "実際の決済は行われません。現在のプラン表示が更新されました。",
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="font-display text-5xl font-bold text-white">価格ごとに、情報が変わる。</h1>
        <p className="text-slate-400 mt-4 max-w-2xl mx-auto text-lg">
          「何が違うのか分からない」を終わらせる。各プランで提供されるコンテンツ・データ・レポートを明確に定義しています。
        </p>
        <div className="inline-flex items-center gap-2 mt-6 px-4 py-2 rounded-full bg-slate-900 border border-white/10 text-sm text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          投資助言・個別相談は一切行いません。情報提供のみのサービスです。
        </div>
      </div>

      <PricingTiers currentTier={current} onUpgrade={handleUpgrade} />

      {/* Comparison */}
      <div className="mt-20">
        <h2 className="font-display text-2xl font-bold text-white text-center mb-8">プラン比較一覧</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-900/80 text-slate-300">
                <th className="text-left p-4 font-medium">提供内容</th>
                <th className="p-4 font-medium">フリー</th>
                <th className="p-4 font-medium">スターター</th>
                <th className="p-4 font-medium">プロ</th>
                <th className="p-4 font-medium">エリート</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {[
                ["投資漫画（全作品）", "広告あり", "○", "○", "○"],
                ["銘柄スクリーニング", "×", "基礎", "詳細", "機関級"],
                ["個別銘柄レポート", "×", "初心者向け", "詳細", "ディープ"],
                ["市場データ API", "×", "×", "○", "○（高頻度）"],
                ["アルゴ指標アクセス", "×", "×", "×", "○"],
              ].map((row) => (
                <tr key={row[0]} className="border-t border-white/10">
                  <td className="p-4 text-white font-medium">{row[0]}</td>
                  {row.slice(1).map((v, i) => (
                    <td key={i} className="p-4 text-center">
                      {v === "×" ? <X className="w-4 h-4 text-slate-600 mx-auto" /> : v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}