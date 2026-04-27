import React from 'react';

/**
 * ページ全体を包むフレーム
 */
export const PageFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-white">{children}</div>
);

/**
 * ヒーローセクション（タイトルと説明文）
 */
interface HeroSectionProps {
  title: string;
  description: string;
}

export const HeroSection = ({ title, description }: HeroSectionProps) => (
  <section className="w-full pt-20 pb-16 px-4 bg-gradient-to-b from-slate-50 to-white">
    <div className="max-w-7xl mx-auto text-left">
      <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
        {title}
      </h1>
      <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
        {description}
      </p>
    </div>
  </section>
);

/**
 * メインコンテンツを包むフレーム
 */
export const MainFrame = ({ children }: { children: React.ReactNode }) => (
  <section className="max-w-7xl mx-auto px-4 pb-24">
    {children}
  </section>
);