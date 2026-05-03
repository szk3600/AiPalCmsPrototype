import React, { Suspense } from 'react';
import { PlayCircle, ShieldOff } from 'lucide-react';
import { PageFrame, MainFrame } from '@/components/Layouts';
import { LearningGate } from '@/components/LearningGate';

export const dynamic = 'force-dynamic'; // リクエスト毎に権限チェックを行う

interface PageProps {
  params: Promise<{ id: string }>;
}

/**
 * 学習本編ページ
 * ------------------------------------------------------------
 * 配信戦略: Dynamic Rendering (SSR)
 * 役割: ユーザー個別の権限をチェックし、コンテンツを配信します。
 */
export default async function LearningPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <PageFrame>
      <div className="bg-slate-50 min-h-screen">
        <MainFrame>
          <div className="pt-12 pb-8">
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <PlayCircle className="text-blue-600" />
              学習コンソール
            </h1>
          </div>

          {/* 権限チェックを含む「ゲート」部分を Suspense で囲むことで、
              認証チェックを待っている間もヘッダーや枠組みを即座に表示（ストリーミング）します。
          */}
          <Suspense fallback={<LoadingSkeleton />}>
            <LearningGate playlistId={id} />
          </Suspense>
        </MainFrame>
      </div>
    </PageFrame>
  );
}

const LoadingSkeleton = () => (
  <div className="w-full aspect-video bg-white rounded-[3rem] animate-pulse flex items-center justify-center border border-slate-100">
    <div className="flex flex-col items-center gap-4">
      <ShieldOff className="text-slate-200" size={64} />
      <div className="h-4 w-32 bg-slate-100 rounded-full" />
    </div>
  </div>
);