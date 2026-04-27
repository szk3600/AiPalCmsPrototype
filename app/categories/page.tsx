import React from 'react';
import { CategoryListView } from '@/domain/category/CategoryListView';
import { getCategoryPageInfo } from '@/domain/category/loader';
import { PageFrame, HeroSection, MainFrame } from '@/components/Layouts';

/**
 * [Page] CategoriesPage (Server Component)
 * ------------------------------------------------------------
 * 役割: カテゴリー一覧の全体レイアウトを定義するオーケストレーター。
 * * 設計のポイント:
 * 1. データ駆動 (Data-driven): 
 * HeroSection のタイトルや説明文も getCategoryPageInfo 経由で JSON から取得します。
 * 2. 共通レイアウトの活用: 
 * PageFrame, HeroSection, MainFrame を使用し、デザインの一貫性とコードの再利用性を担保します。
 * 3. セルフロード (Self-loading): 
 * CategoryListView が自律的にデータを取得・表示するため、このページは中身の構造を知る必要がありません。
 */
export default async function CategoriesPage() {
  // 1. ページ自体の表示情報（見出しや説明文）をマスターデータから取得
  const pageInfo = await getCategoryPageInfo();

  return (
    <PageFrame>
      {/* 2. CMSから取得した情報でヒーローセクションを構築 */}
      <HeroSection
        title={pageInfo.title}
        description={pageInfo.description}
      />
      
      <MainFrame>
        {/* 3. 自律型コンポーネントを配置。これだけでデータ取得から表示までが完結します */}
        <CategoryListView />
      </MainFrame>
    </PageFrame>
  );
}