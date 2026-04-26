'use client';

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { CategoryViewModel } from '@/domain/category/view_model';

interface CategoryCardProps {
    category: CategoryViewModel;
    resolvedImageUrl: string; // サーバー側で解決済みの署名付きURL
}

/**
 * カテゴリーを表示するカードコンポーネント
 * 物理的な配置ロジックは持たず、ViewModel のデータのみを忠実に表示します。
 */
export const CategoryCard: React.FC<CategoryCardProps> = ({ category, resolvedImageUrl }) => {
    // Lucideアイコンを動的に取得
    const IconComponent = (LucideIcons as any)[category.iconName] || LucideIcons.HelpCircle;

    return (
        <div className="group relative w-full max-w-md mx-auto bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-slate-100 flex flex-col">
            {/* 画像セクション */}
            <div className="relative h-48 w-full bg-slate-200 overflow-hidden">
                <img
                    src={resolvedImageUrl}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* バッジ・アイコン */}
                <div className="absolute top-4 left-4">
                    {category.isNew && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-lg">
                            New
                        </span>
                    )}
                </div>

                <div
                    className="absolute bottom-4 left-4 p-2 rounded-xl backdrop-blur-md border border-white/20"
                    style={{ backgroundColor: `${category.accentColor}44` }}
                >
                    <IconComponent className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* コンテンツセクション */}
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">
                        {category.title}
                    </h3>
                </div>

                <p className="text-sm text-slate-500 line-clamp-2 mb-6 flex-grow">
                    {category.description}
                </p>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-tight">Contents</span>
                        <span className="text-sm font-semibold text-slate-700">{category.displayContentCount}</span>
                    </div>

                    <button
                        className="flex items-center gap-2 text-sm font-bold transition-all"
                        style={{ color: category.accentColor }}
                    >
                        <span>学習をはじめる</span>
                        <LucideIcons.ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </div>
            </div>

            {/* ホバー時のアクセントバー */}
            <div
                className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-300"
                style={{ backgroundColor: category.accentColor }}
            />
        </div>
    );
};