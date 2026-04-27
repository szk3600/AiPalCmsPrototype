import React from 'react';
import * as LucideIcons from 'lucide-react';
import { getCategoryDetail } from './loader';
import { getAssetUrl } from '@/lib/content-storage';

interface CategoryViewProps {
  id: string;
}

/**
 * [Domain Component] CategoryView (Self-loading)
 * ------------------------------------------------------------
 * 役割: 特定の ID に基づき、カテゴリーの全詳細情報を自律的にロードしてレンダリングします。
 */
export async function CategoryView({ id }: CategoryViewProps) {
  // 1. 自律的に詳細データをロード
  const category = await getCategoryDetail(id);
  
  if (!category) {
    return (
      <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        <p className="text-slate-400 font-bold">指定されたカテゴリーが見つかりませんでした。</p>
      </div>
    );
  }

  // 2. 画像アセットの解決
  const resolvedImageUrl = await getAssetUrl(category.imagePath);

  // 3. Lucide アイコンの動的解決 (iconName に基づく)
  const IconComponent = (LucideIcons as any)[category.iconName] || LucideIcons.BookOpen;

  return (
    <div className="w-full bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* ビジュアルエリア */}
        <div className="lg:w-1/2 aspect-video lg:aspect-auto relative bg-slate-100 overflow-hidden">
          <img 
            src={resolvedImageUrl} 
            alt={category.title}
            className="w-full h-full object-cover"
          />
          {category.isNew && (
            <div className="absolute top-6 left-6 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              NEW CONTENT
            </div>
          )}
        </div>

        {/* テキストエリア */}
        <div className="lg:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-inner"
            style={{ backgroundColor: `${category.accentColor}15`, color: category.accentColor }}
          >
            <IconComponent size={32} />
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
            {category.title}
          </h2>

          <p className="text-slate-500 text-lg leading-relaxed mb-10">
            {category.description}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-8 border-t border-slate-50">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Content</p>
              <p className="text-xl font-bold text-slate-800">{category.displayContentCount}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Update</p>
              <p className="text-xl font-bold text-slate-800">{category.lastUpdatedLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}