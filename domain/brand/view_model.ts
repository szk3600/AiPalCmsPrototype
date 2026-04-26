import { Metadata } from 'next';

/**
 * UI と SEO（Next.js Metadata API）に最適化されたビューモデル
 */
export interface BrandViewModel {
    siteName: string;
    fullTitle: string;           // 「サイト名 | キャッチコピー」
    description: string;
    logo: {
        main: string;
        square: string;
    };

    // Next.js の Metadata オブジェクトとしてそのまま返せる形式
    metadata: Metadata;
}