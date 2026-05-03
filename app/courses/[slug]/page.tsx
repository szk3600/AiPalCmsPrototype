import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Play, Lock, CheckCircle2 } from 'lucide-react';
import { getCategoryIdList, getCategoryDetail } from '@/domain/category/loader';
import { PageFrame, HeroSection, MainFrame } from '@/components/Layouts';

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * 講座詳細ページ（集客用 LP）
 * ------------------------------------------------------------
 * 配信戦略: SSG (Static Site Generation)
 * 役割: 検索エンジンにインデックスされ、未ログインユーザーに価値を伝えます。
 */
export default async function CourseLandingPage({ params }: PageProps) {
  const { slug } = await params;
  
  // 本来は slug から ID を引く処理が入ります
  const categoryId = "cat-001"; 
  const category = await getCategoryDetail(categoryId);

  if (!category) return null;

  return (
    <PageFrame>
      <div className="bg-slate-900 text-white py-20">
        <MainFrame>
          <Link href="/categories" className="text-slate-400 hover:text-white flex items-center gap-2 mb-8 text-sm font-bold">
            <ChevronLeft size={16} />
            カテゴリーへ戻る
          </Link>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              {category.title}
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed mb-10">
              {category.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href={`/learning/${category.id}`} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black text-lg flex items-center gap-2 transition-all shadow-xl shadow-blue-900/20"
              >
                <Play size={20} fill="currentColor" />
                今すぐ学習を始める
              </Link>
              <div className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-bold">
                <Lock size={18} />
                一部のコンテンツは有料です
              </div>
            </div>
          </div>
        </MainFrame>
      </div>

      <MainFrame>
        <div className="py-20 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-black mb-8">このコースで学べること</h2>
            <div className="space-y-4">
              {["AIの基本概念", "実践的なプロンプト設計", "API連携の基礎"].map((item, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-slate-700">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 h-fit sticky top-24">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Course Preview</p>
            <div className="aspect-video rounded-2xl bg-slate-100 mb-6 overflow-hidden flex items-center justify-center">
               <img src={category.imageUrl} alt="" className="w-full h-full object-cover opacity-50 grayscale" />
               <Play className="absolute text-slate-400" size={48} />
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6">
              ログインすると、最初の 3 レッスンを無料で視聴できます。
            </p>
            <button className="w-full py-4 border-2 border-slate-900 rounded-2xl font-black hover:bg-slate-900 hover:text-white transition-all">
              サンプルを視聴
            </button>
          </div>
        </div>
      </MainFrame>
    </PageFrame>
  );
}

/**
 * 静的パスの生成 (SSG 用)
 */
export async function generateStaticParams() {
  const ids = await getCategoryIdList();
  // スラグを解決してパスを生成するロジックが必要
  return [{ slug: 'ai-basics' }, { slug: 'business-automation' }];
}