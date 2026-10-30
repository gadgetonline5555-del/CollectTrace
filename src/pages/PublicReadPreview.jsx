import { useLocation } from "react-router-dom";
import { verifiedResearch as report } from "@/data/verifiedResearch";

const sectionClass = "scroll-mt-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8";
const linkClass = "rounded-md underline decoration-slate-300 underline-offset-4 hover:text-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700";

export default function PublicReadPreview() {
  const { pathname, search } = useLocation();
  const limitedEntry = !["/", "/preview"].includes(pathname) || Boolean(search);

  return (
    <div className="min-h-screen bg-[#f5f7f8] text-slate-900">
      <a href="#content" className="sr-only focus:not-sr-only focus:block focus:bg-white focus:p-4">本文へ移動</a>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
          <a href="/" aria-label="Collect Trace ホーム" className="flex items-center gap-3 font-semibold tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700">
            <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">CT</span>
            <span className="text-xl">Collect Trace</span>
          </a>
          <span className="rounded-full border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-800">無料・限定プレビュー</span>
        </div>
      </header>
      <main id="content" className="mx-auto max-w-6xl px-5 pb-16 pt-10 sm:px-8 sm:pt-16">
        <div className="mb-10 max-w-3xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-teal-700">Verified company brief / 001</p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">出典から確かめる、<br className="hidden sm:block" />企業の数字。</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
            まずは NVIDIA 1社の過去決算の一部を、公式資料と照合して公開します。
            確認できた事実・資料の日付・版の記録を一緒に読める、閲覧専用の初版です。
          </p>
          <p className="mt-3 text-sm font-medium text-amber-800">最新決算やリアルタイム情報ではありません。対象は FY2025 です。</p>
        </div>

        {limitedEntry && (
          <div role="status" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
            この入口では限定プレビューのみを公開しています。URL の検索条件や旧レポート ID は実行・表示せず、下記の確認済み版1だけを表示します。
          </div>
        )}

        <nav aria-label="ページ内ナビゲーション" className="mb-7 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium">
          <a className={linkClass} href="#company">企業情報</a>
          <a className={linkClass} href="#sources">出典と日付</a>
          <a className={linkClass} href="#versions">版の記録</a>
          <a className={linkClass} href="#scope">公開範囲</a>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          <article id="company" aria-labelledby="company-heading" className={sectionClass}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-wider text-slate-500">{report.ticker}</p>
                <h2 id="company-heading" className="mt-2 text-3xl font-semibold">{report.company}</h2>
              </div>
              <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold">確認済み版 {report.version}</span>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-600">2025会計年度（{report.periodEnd} 終了）の通期売上高。会社が公表した実績値であり、将来の予測ではありません。</p>
            <div className="my-7 border-y border-slate-200 py-7">
              <p className="text-sm font-medium text-slate-600">通期売上高 / 米ドル</p>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-3"><span className="text-5xl font-semibold tracking-tight sm:text-6xl">{report.revenueBillionUsd}</span><span className="text-lg text-slate-500">billion USD</span></p>
              <p className="mt-3 text-sm text-slate-600">約1,305億米ドル · 前年比 <strong className="text-slate-900">+{report.revenueGrowthPercent}%</strong></p>
            </div>
            <p className="text-sm leading-7 text-slate-600">公式表の値は {report.revenueMillionUsd} million USD。上の 130.5 billion USD は発表本文に合わせた丸め表記です。前年比も公式発表の丸め値です。</p>
            <a href="#sources" className={`mt-5 inline-block text-sm font-semibold ${linkClass}`}>出典・対象期間を確認する ↓</a>
          </article>

          <section id="sources" aria-labelledby="sources-heading" className={sectionClass}>
            <p className="text-xs font-semibold tracking-wider text-teal-700">SOURCE & DATES</p>
            <h2 id="sources-heading" className="mt-2 text-xl font-semibold">出典と日付</h2>
            <dl className="mt-6 space-y-5 text-sm">
              <div><dt className="text-slate-500">資料の対象期末</dt><dd className="mt-1 font-medium"><time dateTime={report.periodEnd}>{report.periodEnd}</time> / FY2025</dd></div>
              <div><dt className="text-slate-500">公式資料の公表日</dt><dd className="mt-1 font-medium"><time dateTime={report.sourcePublished}>{report.sourcePublished}</time></dd></div>
              <div><dt className="text-slate-500">この要約の出典照合日</dt><dd className="mt-1 font-medium"><time dateTime={report.verifiedOn}>{report.verifiedOn}</time></dd></div>
            </dl>
            <p className="mt-6 text-xs leading-6 text-slate-500">照合日が新しくても、決算の対象期間は変わりません。保存・生成日時を「最新決算の日付」として扱っていません。</p>
            <a href={report.sourceUrl} target="_blank" rel="noopener noreferrer" className={`mt-6 block break-words text-sm font-semibold leading-7 ${linkClass}`}>
              {report.sourceTitle}<span className="block text-xs font-normal text-slate-500">investor.nvidia.com · 別タブで開きます ↗</span>
            </a>
            <p className="mt-3 text-xs leading-6 text-slate-500">参照箇所：発表本文の通期売上高と Fiscal 2025 Summary の Revenue 行。</p>
          </section>

          <section id="versions" aria-labelledby="versions-heading" className={sectionClass}>
            <p className="text-xs font-semibold tracking-wider text-teal-700">VERSION RECORD</p>
            <h2 id="versions-heading" className="mt-2 text-xl font-semibold">版の記録</h2>
            <ol className="mt-6 border-l-2 border-teal-200 pl-5">
              <li>
                <div className="flex flex-wrap items-center gap-3"><h3 className="font-semibold">確認済み版1</h3><span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">現在の版</span></div>
                <p className="mt-2 text-sm text-slate-500"><time dateTime={report.verifiedOn}>{report.verifiedOn}</time> · 初回の内容照合</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">公式決算資料から通期売上高・前年比・対象期間を確認。出典と日付を分けて記載しました。</p>
              </li>
            </ol>
            <p className="mt-5 text-xs leading-6 text-slate-500">この確認済みシリーズの公開版は1件です。旧AI生成結果を検証済みの過去版として表示していません。</p>
          </section>

          <section id="scope" aria-labelledby="scope-heading" className={sectionClass}>
            <p className="text-xs font-semibold tracking-wider text-teal-700">PREVIEW SCOPE</p>
            <h2 id="scope-heading" className="mt-2 text-xl font-semibold">今回できること</h2>
            <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
              <li>公開済みの企業情報を読む</li>
              <li>公式出典と対象期間を確かめる</li>
              <li>確認済み版の記録を見る</li>
            </ul>
            <div className="mt-6 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
              このプレビューには自由検索、AI生成、個人保存、購入機能はありません。ログインせずに閲覧できます。
            </div>
            <p className="mt-4 text-xs leading-6 text-slate-500">情報提供用の限定プレビューです。投資判断の推奨・株価予測・収益保証は行いません。対応企業や更新時期は未定です。</p>
          </section>
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-5 py-7 text-xs leading-6 text-slate-500 sm:px-8">
          <p>Collect Trace · 閲覧専用の限定プレビュー</p>
          <div className="max-w-2xl">
            <p>この画面に個人情報の入力欄はありません。既存の配信基盤によるアクセス解析・認証確認の通信は残っています。</p>
            <details className="mt-3">
              <summary className="cursor-pointer rounded text-slate-700 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700">閲覧時の通信について</summary>
              <p className="mt-3">アクセス解析には閲覧ページ、時刻、セッション識別子、参照元などが含まれます。保存済みのログイン情報がある場合、認証状態の確認やユーザー識別子を伴う解析が行われることがあります。「入力欄がない」ことは、情報が一切送信されないという意味ではありません。</p>
              <p className="mt-2">この限定画面からAI生成・調査結果の個人保存・購入は行いません。既存サービス全体のAPIや課金を停止したものではありません。</p>
            </details>
          </div>
        </div>
      </footer>
    </div>
  );
}
/** Static fallback: do not reflect unknown paths or perform a separate auth query. */
export function PublicPreviewNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f8] px-5 py-12 text-slate-900">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 sm:p-10">
        <p className="text-xs font-semibold tracking-wider text-teal-700">Collect Trace · 限定プレビュー</p>
        <h1 className="mt-4 text-2xl font-semibold">このページは公開範囲に含まれていません</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">現在の限定プレビューは、NVIDIA 1社のFY2025決算の一部が対象です。指定されたURLから企業情報の検索や旧レポートの取得は行いません。</p>
        <a href="/" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700">限定プレビューへ戻る</a>
      </div>
    </main>
  );
}

