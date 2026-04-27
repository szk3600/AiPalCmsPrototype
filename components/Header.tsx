import React from 'react';
import Link from 'next/link';
import { Menu, X, User, LogIn, Sparkles } from 'lucide-react';
import { getBrand } from '@/domain/brand/loader';

/**
 * [Domain Component] Header (Self-loading / Server Component Only)
 * ------------------------------------------------------------
 * 役割: 自律的にブランドデータをロードし、単一ファイルで表示まで完結させます。
 * 特徴: 
 * 1. サーバーサイドでデータをフェッチするため、初期表示が高速で SEO に強い。
 * 2. クライアントサイドの JS (useState) を使わず、CSS の :checked と peer 
 * を利用してモバイルメニューの開閉を制御します。
 */
export async function Header() {
  // 1. 自律的にデータをロード
  // React cache により、Metadata 生成時などの重複呼び出しは最適化されます。
  const brand = await getBrand('brandModel');
  if (!brand) return null;

  return (
    <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* モバイルメニュー制御用の隠しチェックボックス（JS不要のトグル） */}
        <input type="checkbox" id="mobile-menu-toggle" className="hidden peer" />

        {/* ロゴ・ブランド名 */}
        <Link href="/" className="flex items-center gap-3 group transition-transform active:scale-95 z-20">
          <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 overflow-hidden text-white font-black text-[10px]">
            {brand.logo.square ? (
              <img 
                src={brand.logo.square} 
                alt="" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span>AI</span>
            )}
          </div>
          <span className="font-black text-xl tracking-tighter text-slate-900 hidden xs:inline">
            {brand.siteName}
          </span>
        </Link>

        {/* デスクトップ用ナビゲーション */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-500">
          <Link href="/categories" className="hover:text-blue-600 transition-colors">カテゴリー</Link>
          <Link href="#" className="hover:text-blue-600 transition-colors flex items-center gap-1.5 font-bold">
            <Sparkles size={14} className="text-amber-400" />
            <span>学習パス</span>
          </Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">法人向け</Link>
        </nav>

        {/* 右側アクションエリア */}
        <div className="flex items-center gap-3 z-20">
          {/* ログインボタン（デスクトップ） */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group border border-transparent hover:border-slate-100">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
              <User size={16} />
            </div>
            <span className="text-sm font-bold text-slate-700">ログイン</span>
          </div>

          {/* 会員登録ボタン */}
          <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm shadow-slate-200">
            無料登録
          </button>

          {/* モバイルメニューボタン（Labelを使用してチェックボックスを操作） */}
          <label 
            htmlFor="mobile-menu-toggle" 
            className="p-2 text-slate-500 md:hidden hover:bg-slate-50 rounded-lg transition-colors cursor-pointer block relative h-10 w-10"
          >
            {/* チェックの状態によってアイコンを切り替える（CSS制御） */}
            <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 peer-checked:rotate-90 peer-checked:opacity-0">
              <Menu size={24} />
            </div>
            {/* ※実際には兄弟要素の peer-checked を使うため、ここではアイコン1つで表現するか、
                グローバルCSSまたはインラインスタイルでより詳細に制御します */}
          </label>
        </div>

        {/* モバイルメニュー（peer-checked によって表示を制御） */}
        <div className="hidden peer-checked:block md:hidden bg-white border-b border-slate-100 absolute w-full top-full left-0 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 z-10">
          <nav className="flex flex-col p-6 space-y-5 font-bold text-slate-600">
            <Link href="/categories" className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <span>カテゴリー一覧</span>
              <div className="w-6 h-6 bg-slate-50 rounded flex items-center justify-center text-slate-300">→</div>
            </Link>
            <Link href="#" className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors">
              <span>プレミアム学習パス</span>
              <Sparkles size={16} className="text-amber-400" />
            </Link>
            <hr className="border-slate-50" />
            <Link href="#" className="flex items-center gap-3 text-slate-400 p-2" >
              <LogIn size={18} />
              <span>ログインして再開</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}