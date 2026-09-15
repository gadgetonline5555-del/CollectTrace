import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Legal() {
  const { lang } = useI18n();
  const jp = lang !== "en";

  const privacy = jp
    ? [
        "Collect Trace（以下「本サービス」）は、ユーザーのプライバシーを尊重し、適切に保護します。",
        "1. 収集する情報：メールアドレス、認証情報（Google / Apple 連携時の識別子を含む）、利用状況ログ（検索キーワード・閲覧・ウォッチリスト・ポートフォリオ等）、IPアドレス・端末情報。",
        "2. 利用目的：サービスの提供、本人確認、利便性向上のための分析、不正利用の防止。",
        "3. 第三者提供：法令に基づく場合を除き、事前の同意なく第三者に個人情報を提供しません。決済代行業者（Stripe）には決済処理に必要な範囲で情報を渡します。",
        "4. データ保持・削除：アカウントはアプリ内の「設定」から削除でき、関連データは削除されます。",
        "5. 13歳未満のお客様：本サービスは13歳未満の方を対象としません。",
        "6. ポリシーの変更：本ポリシーを変更する場合は、本ページにて通知します。",
        "7. お問い合わせ：アプリ内のお問い合わせからご連絡ください。",
      ]
    : [
        "Collect Trace (the \"Service\") respects and protects your privacy.",
        "1. Information we collect: email address, authentication identifiers (including Google / Apple IDs when linked), usage logs (search keywords, views, watchlist, portfolio, etc.), IP address and device information.",
        "2. Use: to provide and improve the Service, verify identity, analyze usage, and prevent abuse.",
        "3. Third-party sharing: We do not share personal data with third parties without consent except as required by law. Payment processor (Stripe) receives data strictly for payment handling.",
        "4. Retention & deletion: You can delete your account in Settings; related data is removed.",
        "5. Children: The Service is not intended for users under 13.",
        "6. Changes: Updates to this policy will be posted on this page.",
        "7. Contact: Reach us via in-app contact.",
      ];

  const terms = jp
    ? [
        "1. サービスの性質：本サービスは投資に関する情報提供のみを目的とし、投資助言・個別相談・勧誘を一切行いません。",
        "2. 免責：本サービスの情報に基づく投資判断はすべてご自身の責任となります。本サービスは一切の損害について責任を負いません。",
        "3. アカウント：正確な情報を登録し、アカウントを第三者に譲渡・共有しないでください。",
        "4. 課金・サブスクリプション：有料プランは決済システムにより自動更新されます。解約は次回更新日前にお手続きください。",
        "5. 禁止行為：不正アクセス、bot・スクレイピング、リバースエンジニアリング、他者へのなりすましを禁じます。",
        "6. 知的財産：本サービスのコンテンツの権利は当社に帰属します。無断での複製・転載を禁じます。",
        "7. サービス変更・停止：やむを得ない場合、サービスの一部を変更・停止することがあります。",
        "8. 準拠法：本規約は日本法に準拠します。",
      ]
    : [
        "1. Nature of service: The Service provides investment information only and does not offer investment advice, personalized consultation, or solicitation.",
        "2. Disclaimer: All investment decisions based on the Service are your own responsibility. We are not liable for any damages.",
        "3. Account: Provide accurate information and do not transfer or share your account with third parties.",
        "4. Billing & subscriptions: Paid plans auto-renew via the payment system. Cancel before the next renewal date.",
        "5. Prohibited acts: No unauthorized access, bots, scraping, reverse engineering, or impersonation.",
        "6. Intellectual property: Rights to the Service content belong to us. Unauthorized copying or reproduction is prohibited.",
        "7. Changes & discontinuation: We may modify or discontinue parts of the Service when necessary.",
        "8. Governing law: These Terms are governed by the laws of Japan.",
      ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <Link to="/settings" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" /> {jp ? "設定に戻る" : "Back to settings"}
      </Link>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 mb-4">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> {jp ? "情報提供のみ・投資助言ではありません" : "Informational only · not investment advice"}
      </div>

      <section id="privacy" className="rounded-2xl border border-white/10 bg-slate-900/60 p-6 mb-6">
        <h1 className="font-display text-2xl font-bold text-white mb-4">{jp ? "プライバシーポリシー" : "Privacy Policy"}</h1>
        <div className="space-y-3">
          {privacy.map((p, i) => (
            <p key={i} className="text-sm text-slate-300 leading-relaxed">{p}</p>
          ))}
        </div>
      </section>

      <section id="terms" className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <h1 className="font-display text-2xl font-bold text-white mb-4">{jp ? "利用規約" : "Terms of Service"}</h1>
        <div className="space-y-3">
          {terms.map((p, i) => (
            <p key={i} className="text-sm text-slate-300 leading-relaxed">{p}</p>
          ))}
        </div>
      </section>
    </div>
  );
}