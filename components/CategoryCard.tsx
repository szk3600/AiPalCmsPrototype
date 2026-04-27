import React from 'react';
import { getCategory } from '@/domain/category/loader';
import { CategoryCardView } from './CategoryCardView';

interface CategoryCardProps {
  id: string;
}

/**
 * カテゴリーカード (Server Component)
 * ------------------------------------------------------------
 * 役割: ID から自分のデータをロードし、表示用コンポーネントへ渡す。
 */
export async function CategoryCard({ id }: CategoryCardProps) {
  const category = await getCategory(id);
  if (!category) return null;

  // 画像 URL の解決もサーバー側で行う
  const resolvedUrl = await getAssetUrl(category.imagePath);

  return (
    <CategoryCardView 
      category={category} 
      resolvedImageUrl={resolvedUrl} 
    />
  );
}