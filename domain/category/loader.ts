import { cache } from 'react';
import { ContentStorage } from '@/lib/content-storage';
import { CategoryListModel, CategoryModel } from './model';
import { ListViewModel } from '@/domain/common/view-model';

/**
 * [ViewModel] カテゴリー詳細表示用の型定義
 * ------------------------------------------------------------
 * 役割: カテゴリー詳細ページ（DetailPage）が必要とする全ての情報を保持します。
 * 責務の分離: この型は View がインポートして使用し、本ローダーが生成します。
 */
export interface CategoryViewModel {
  id: string;
  slug: string;
  title: string;
  description: string;
  iconName: string;
  accentColor: string;
  imagePath: string;
  displayContentCount: string;
  lastUpdatedLabel: string;
  isNew: boolean;
}

/**
 * [ViewModel] カテゴリー一覧ページ自体の情報
 */
export interface CategoryPageInfo {
  title: string;
  description: string;
}

/**
 * [Fetcher] ページの見出し情報を取得
 * ------------------------------------------------------------
 * 役割: categoryModel.json のルートにある pageTitle / pageDescription を取得します。
 */
export const getCategoryPageInfo = cache(async (): Promise<CategoryPageInfo> => {
  const storage = new ContentStorage();
  // 共有マスターファイルをフェッチ
  const data = await storage.fetchJson<any>('_cms/categoryModel.json');
  return {
    title: data.pageTitle || 'カテゴリー一覧',
    description: data.pageDescription || ''
  };
});

/**
 * [Fetcher] カテゴリー ID のリストを取得
 * ------------------------------------------------------------
 * 役割: 表示対象となる全てのカテゴリー ID を配列で返します。
 * 上位コンポーネント（Page等）は、まずこの ID リストを取得してループを回します。
 */
export const getCategoryIdList = cache(async (): Promise<string[]> => {
  const storage = new ContentStorage();
  const data = await storage.fetchJson<CategoryListModel>('_cms/categoryModel.json');
  
  return data.categories
    .filter(c => c.isPublic)
    .sort((a, b) => a.order - b.order)
    .map(c => c.id);
});

/**
 * [Fetcher] 汎用リスト表示用のデータを取得
 * ------------------------------------------------------------
 * 役割: 指定された ID のカテゴリーを、共通の ListViewModel 形式で返します。
 * GenericListView 等の共通コンポーネントに渡すために使用します。
 */
export const getCategoryListItem = cache(async (id: string): Promise<ListViewModel | null> => {
  const storage = new ContentStorage();
  const data = await storage.fetchJson<CategoryListModel>('_cms/categoryModel.json');
  
  const model = data.categories.find(c => c.id === id);
  if (!model) return null;

  // ビジネスルール: 7日以内なら NEW
  const isNew = (Date.now() - new Date(model.stats.updatedAt).getTime()) < 7 * 24 * 60 * 60 * 1000;

  return {
    id: model.id,
    title: model.title,
    description: model.description,
    keywords: [`${model.stats.contentCount} Lessons`],
    imagePath: model.assets.imageUrl,
    url: `/categories/${model.slug}`,
    badge: isNew ? { text: 'NEW' } : undefined
  };
});

/**
 * [Fetcher] カテゴリー詳細表示用のデータを取得
 * ------------------------------------------------------------
 * 役割: 指定された ID のカテゴリーを、ドメイン特有の CategoryViewModel 形式で返します。
 * 詳細ページや、より深い情報を必要とするコンポーネントで使用します。
 */
export const getCategoryDetail = cache(async (id: string): Promise<CategoryViewModel | null> => {
  const storage = new ContentStorage();
  const data = await storage.fetchJson<CategoryListModel>('_cms/categoryModel.json');
  
  const model = data.categories.find(c => c.id === id);
  if (!model) return null;

  const updatedAt = new Date(model.stats.updatedAt);
  const isNew = (Date.now() - updatedAt.getTime()) < 7 * 24 * 60 * 60 * 1000;

  return {
    id: model.id,
    slug: model.slug,
    title: model.title,
    description: model.description,
    iconName: model.assets.iconName,
    accentColor: model.assets.accentColor,
    imagePath: model.assets.imageUrl,
    displayContentCount: `${model.stats.contentCount} Lessons`,
    lastUpdatedLabel: updatedAt.toLocaleDateString('ja-JP'),
    isNew,
  };
});