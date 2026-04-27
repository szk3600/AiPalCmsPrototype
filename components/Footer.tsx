import React from 'react';
import Link from 'next/link';
import { Mail, ExternalLink, Globe } from 'lucide-react';
import { getBrand } from '@/domain/brand/loader';

/**
 * [Static Assets] 公式ブランドロゴ (SVG)
 * ------------------------------------------------------------
 * 役割: 外部アイコンライブラリに依存せず、正確なブランドロゴをインラインで保持。
 */
const BrandIcons: Record<string, React.FC<{ size?: number }>> = {
  x: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298l13.312 17.404Z" />
    </svg>
  ),
  github: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  facebook: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  ),
  instagram: ({ size = 18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  ),
  email: ({ size = 18 }) => <Mail size={size} />,
};

/**
 * [Domain Component] Footer (Self-loading / Server Component)
 * ------------------------------------------------------------
 * 役割: 自律的にブランドデータをロードし、フッターをレンダリングします。
 * プロパティとしてデータを受け取らないため、どのレイアウトでも即座に使用可能です。
 */
export async function Footer() {
  // 1. 自律的にブランドデータをロード
  // React cache により、Header や Layout での呼び出しと統合されます。
  const brand = await getBrand('brandModel');

  if (!brand) return null;

  return (
    <footer className="bg-slate-900 text-slate-400 pt-20 pb-10 overflow-hidden relative">
      {/* 背景の装飾光 */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] -mb-48 -mr-48 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-20">
          
          {/* 左側: ブランド紹介 */}
          <div className="md:col-span-5 flex flex-col items-start">
            <Link href="/" className="flex items-center gap-2 mb-6 text-white group">
              <div className="w-6 h-6 bg-white/10 rounded flex items-center justify-center border border-white/10 group-hover:bg-white/20 transition-colors">
                <img src={brand.logo.square} alt="" className="w-4 h-4" />
              </div>
              <span className="font-black text-lg tracking-tight">{brand.siteName}</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-8">
              {brand.description}
            </p>

            {/* ソーシャルリンク生成 */}
            <div className="flex items-center gap-4">
              {brand.socialLinks.map((link) => {
                const IconComponent = BrandIcons[link.platform] || ExternalLink;
                return (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label={link.label}
                  >
                    <IconComponent size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* 右側: ナビゲーション */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-widest mb-6">Learn</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><Link href="/categories" className="hover:text-white transition-colors">カテゴリー</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">学習ガイド</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-widest mb-6">Support</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-400">
                <li><Link href="#" className="hover:text-white transition-colors">利用規約</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">お問い合わせ</Link></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-black text-[10px] text-slate-500 uppercase tracking-widest mb-6">Language</h4>
              <button className="flex items-center gap-2 text-sm font-bold bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-all text-white/80">
                <Globe size={14} />
                <span>日本語</span>
              </button>
            </div>
          </div>
        </div>

        {/* コピーライトエリア */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-500 text-[11px] font-bold">
          <p>&copy; {new Date().getFullYear()} {brand.siteName}. Educational CMS Prototype.</p>
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest leading-none">
              Next.js 15 + Firebase
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}