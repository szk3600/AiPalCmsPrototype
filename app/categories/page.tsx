import React from 'react';
import { ContentStorage, defineContent } from '@/lib/content_storage';
import { loadCategories } from '@/domain/category/loader';
import { CategoryModel } from '@/domain/category/model';
import { CategoryCard } from '@/components/CategoryCard';
import { getAssetUrl } from '@/lib/content_storage';

/**
 * カテゴリー一覧ページ (Server Component)
 * Storage からデータを取得し、ViewModel への変換とアセットURLの解決を行います。
 */
export default async function CategoriesPage() {
  const storage = new ContentStorage();

  // --- [重要] カテゴリーの保存ルールを登録 ---
  // これにより、storage.fetchDetail('category', ...) がどこを見ればいいか判明します。
  storage.register([
    defineContent({
      type: 'category',
      pathResolver: (keys) => `_cms/${keys.id}`,
      idMode: 'filename', // categoryModel.json という「ファイル」を指定するため
    })
  ]);

  // 1. Storage からマスターデータを取得 (Admin権限)
  // 登録した 'category' タイプを使用して、_cms/categoryModel.json を取得します。
  const data = await storage.fetchDetail<{ categories: CategoryModel[] }>(
    'category',
    { id: 'categoryModel' }
  );

  // 2. ViewModel に変換 (UI用の表示形式に整形)
  const viewModels = loadCategories(data.categories);

  // 3. 各カテゴリーの画像URLを非同期で解決 (Signed URL)
  // 非公開フォルダ (_cms/) の画像を表示するために、一時的な閲覧URLを発行します。
  const categoriesWithUrls = await Promise.all(
    viewModels.map(async (cat) => ({
      viewModel: cat,
      url: await getAssetUrl(cat.imagePath)
    }))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4 sm:text-4xl">
          学習カテゴリー
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          あなたのキャリアを次のステージへ導くための、厳選された学習パスをご用意しました。
          最新のAIテクノロジーを駆使した実践的なスキルを習得しましょう。
        </p>
      </header>

      {/* グリッドレイアウト */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categoriesWithUrls.map(({ viewModel, url }) => (
          <CategoryCard
            key={viewModel.id}
            category={viewModel}
            resolvedImageUrl={url}
          />
        ))}
      </div>

      {/* ゼロ状態 (データがない場合) */}
      {viewModels.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400">現在公開中のカテゴリーはありません。</p>
        </div>
      )}
    </div>
  );
}