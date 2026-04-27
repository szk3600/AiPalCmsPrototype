import React from 'react';
import { getCategoryIdList, getCategoryListItem } from './loader';
import { GenericListView } from '@/components/GenericListView';
import { ListViewModel } from '@/domain/common/view-model';

/**
 * [Domain Component] CategoryListView (Self-loading)
 * ------------------------------------------------------------
 * 役割: 自律的に全カテゴリーの ID リストを取得し、リスト表示用データをロードしてレンダリングします。
 * 利用側（CategoriesPage等）はこのコンポーネントを配置するだけで、表示が完結します。
 */
export async function CategoryListView() {
  // 1. 自律的に ID のリストを取得
  const categoryIds = await getCategoryIdList();

  // 2. 各 ID に対して「リスト用 ViewModel」を個別にロード (React cache により最適化済み)
  const listItems = (await Promise.all(
    categoryIds.map(id => getCategoryListItem(id))
  )).filter((item): item is ListViewModel => item !== null);

  // 3. 汎用的なリスト表示 View に流し込む
  return (
    <div className="w-full">
      <GenericListView items={listItems} />
      
      {listItems.length === 0 && (
        <div className="text-center py-40 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
          <p className="text-slate-400 font-bold">公開中のカテゴリーはありません。</p>
        </div>
      )}
    </div>
  );
}