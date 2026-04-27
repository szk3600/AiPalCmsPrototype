import React from 'react';
import { getCategoryList } from '@/domain/category/oader';
import { CategoryCard } from '@/components/CategoryCard';

/**
 * カテゴリー一覧ページ (Server Component)
 * ------------------------------------------------------------
 * 役割: ID のリストを取得し、自律型コンポーネントを並べるだけのシンプルな View。
 * 修正内容: ストレージの登録や複雑な fetch ロジックを排除。
 */
export default async function CategoriesPage() {
  // 1. ローダー経由で全カテゴリー（または ID リスト）を取得
  const categories = await getCategoryList();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-16 text-center">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          学習カテゴリー
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          自律型コンポーネントにより、上位ページは構造の定義に専念します。
        </p>
      </header>

      {/* 2. ID だけを下位コンポーネントに渡す */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} id={cat.id} />
        ))}
      </div>
      
      {categories.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
          <p className="text-slate-400">公開中のコンテンツは準備中です。</p>
        </div>
      )}
    </div>
  );
}