import React from 'react';
import Link from 'next/link';
import { ArrowRight, Image as ImageIcon } from 'lucide-react';
import { ListViewModel } from '@/domain/common/view-model';

interface GenericListViewProps {
  items: ListViewModel[];
  gridCols?: string;
}

/**
 * [View Component] GenericListView
 * ------------------------------------------------------------
 * 役割: ListViewModel の形式に従い、ドメインを問わずカードリストを統一されたデザインで表示。
 * 設計方針:
 * 1. 純粋 UI (Pure UI): 
 * インフラ依存（getAssetUrl 等）を完全に排除。解決済みの imageUrl をそのまま利用します。
 * 2. サーバーコンポーネント:
 * 非同期処理を持たない純粋な関数として、最速のレンダリングを提供します。
 */
export function GenericListView({ 
  items, 
  gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
}: GenericListViewProps) {
  
  return (
    <div className={`grid ${gridCols} gap-8`}>
      {items.map((item) => (
        <Link 
          key={item.id} 
          href={item.url}
          className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
        >
          {/* 画像エリア / プレースホルダー */}
          <div className="aspect-video w-full bg-slate-50 relative overflow-hidden flex items-center justify-center">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl} 
                alt="" 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-200 group-hover:text-slate-300 transition-colors">
                <ImageIcon size={48} strokeWidth={1} />
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-300">No Image</span>
              </div>
            )}
            
            {/* バッジ表示 (ViewModel から渡されたテキストを表示) */}
            {item.badge && (
              <div className="absolute top-6 left-6 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                {item.badge.text}
              </div>
            )}
          </div>

          {/* コンテンツエリア */}
          <div className="p-8 flex-grow flex flex-col">
            <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
              {item.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-8 font-medium">
              {item.description}
            </p>
            
            <div className="mt-auto flex items-center justify-between">
              {/* キーワード（レッスン数、時間、レベルなど） */}
              <div className="flex flex-wrap gap-2">
                {item.keywords?.map(kw => (
                  <span key={kw} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
                    {kw}
                  </span>
                ))}
              </div>

              {/* 矢印アイコン */}
              <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all flex-shrink-0 shadow-inner">
                <ArrowRight size={18} />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}