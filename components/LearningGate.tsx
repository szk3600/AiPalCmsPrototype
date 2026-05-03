import React from 'react';
import { LogIn, CreditCard, PlayCircle, Lock } from 'lucide-react';
import { getPlaylistDetail } from '@/domain/playlist/loader';

interface LearningGateProps {
  playlistId: string;
}

/**
 * [Domain Component] LearningGate (Self-loading)
 * ------------------------------------------------------------
 * 役割: 
 * 1. ユーザーの認証状態と購入履歴を確認。
 * 2. 権限があれば本編コンテンツを、なければ「ペイウォール」を表示。
 */
export async function LearningGate({ playlistId }: LearningGateProps) {
  // 本来はここで Firebase Auth / Firestore の購入履歴をチェックします
  const user = null; // ダミー: 未ログイン状態
  const hasAccess = false;

  const playlist = await getPlaylistDetail(playlistId);

  // 1. 未ログインの場合
  if (!user) {
    return (
      <div className="w-full bg-white rounded-[3rem] p-12 md:p-20 border border-slate-100 shadow-2xl shadow-slate-200/50 text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <LogIn size={40} />
        </div>
        <h2 className="text-3xl font-black mb-4">学習を再開しましょう</h2>
        <p className="text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
          このコンテンツを視聴するにはログインが必要です。無料アカウントを作成して、最初のレッスンを体験しましょう。
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-lg shadow-slate-200 hover:scale-105 transition-transform">
            ログイン / 新規登録
          </button>
        </div>
      </div>
    );
  }

  // 2. ログイン済みだが、購入が必要な場合
  if (!hasAccess) {
    return (
      <div className="w-full bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white text-center overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 bg-white/10 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20">
            <Lock size={40} />
          </div>
          <h2 className="text-3xl font-black mb-4">プレミアム・ライセンス</h2>
          <p className="text-slate-400 mb-10 max-w-md mx-auto leading-relaxed">
            「{playlist?.title}」の全 12 レッスンをアンロックして、全ての資料とハンズオン環境を手に入れましょう。
          </p>
          <button className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-blue-500 transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-3 mx-auto">
            <CreditCard />
            コースを購入する (¥2,800)
          </button>
        </div>
      </div>
    );
  }

  // 3. 権限がある場合（コンテンツ表示）
  return (
    <div className="w-full bg-black rounded-[3rem] aspect-video flex items-center justify-center group cursor-pointer overflow-hidden border-8 border-white shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
      <div className="relative z-20 flex flex-col items-center gap-6">
        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/40 group-hover:scale-110 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
          <PlayCircle size={48} fill="currentColor" />
        </div>
        <p className="text-white font-black text-xl tracking-wide">動画を再生する</p>
      </div>
      {/* 実際にはここに署名付きURLを解決した Video プレイヤーが入ります */}
    </div>
  );
}