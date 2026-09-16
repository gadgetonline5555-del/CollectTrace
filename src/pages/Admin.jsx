import React, { useState, lazy, Suspense } from "react";
import ResourceManager from "@/components/admin/ResourceManager";
const InsightsDashboard = lazy(() => import("@/components/admin/InsightsDashboard"));
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const MANGA_FIELDS = [
  { key: "title", label: "タイトル", type: "text", required: true },
  { key: "subtitle", label: "サブタイトル", type: "text" },
  { key: "author", label: "著者", type: "text" },
  { key: "category", label: "カテゴリ", type: "select", options: ["基礎知識", "銘柄分析", "相場心理", "戦略", "失敗談"] },
  { key: "plan_tier", label: "プラン", type: "select", options: ["free", "starter", "pro", "elite"] },
  { key: "episodes", label: "話数", type: "number" },
  { key: "rating", label: "評価", type: "number" },
  { key: "cover_url", label: "カバーCSS", type: "text" },
  { key: "summary", label: "要約", type: "textarea" },
  { key: "content", label: "本文", type: "textarea" },
];

const RESEARCH_FIELDS = [
  { key: "title", label: "タイトル", type: "text", required: true },
  { key: "ticker", label: "ティッカー", type: "text" },
  { key: "sector", label: "セクター", type: "text", required: true },
  { key: "plan_tier", label: "プラン", type: "select", options: ["starter", "pro", "elite"] },
  { key: "rating", label: "格付け", type: "select", options: ["Strong Buy", "Buy", "Hold", "Sell"] },
  { key: "current_price", label: "現在値", type: "number" },
  { key: "target_price", label: "目標株価", type: "number" },
  { key: "upside", label: "上値余地(%)", type: "number" },
  { key: "author", label: "著者", type: "text" },
  { key: "published_date", label: "公開日", type: "date" },
  { key: "summary", label: "要約", type: "textarea" },
  { key: "content", label: "本文", type: "textarea" },
];

const GLOSSARY_FIELDS = [
  { key: "term", label: "用語", type: "text", required: true },
  { key: "definition", label: "定義", type: "textarea", required: true },
  { key: "category", label: "カテゴリ", type: "select", options: ["基礎用語", "テクニカル指標", "ファンダメンタル", "戦略", "心理"] },
];

export default function Admin() {
  const [tab, setTab] = useState("manga");
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-foreground mb-2">管理画面</h1>
      <p className="text-muted-foreground mb-8">漫画・調査レポートのコンテンツを管理します。</p>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="manga">漫画</TabsTrigger>
          <TabsTrigger value="research">調査レポート</TabsTrigger>
          <TabsTrigger value="glossary">用語集</TabsTrigger>
          <TabsTrigger value="insights">ユーザー分析</TabsTrigger>
        </TabsList>
        <TabsContent value="manga" className="mt-6"><ResourceManager entityName="Manga" fields={MANGA_FIELDS} /></TabsContent>
        <TabsContent value="research" className="mt-6"><ResourceManager entityName="Research" fields={RESEARCH_FIELDS} /></TabsContent>
        <TabsContent value="glossary" className="mt-6"><ResourceManager entityName="Glossary" fields={GLOSSARY_FIELDS} /></TabsContent>
        <TabsContent value="insights" className="mt-6"><Suspense fallback={<div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-slate-700 border-t-violet-400 rounded-full animate-spin" /></div>}><InsightsDashboard /></Suspense></TabsContent>
      </Tabs>
    </div>
  );
}