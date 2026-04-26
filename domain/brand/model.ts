/**
 * ブランドの生データ定義（Firestore のスキーマ）
 * SEO に必要なメタ情報とアセット情報を集約
 */
export interface BrandModel {
    id: string;
    name: string;                // サイト名 (例: AiPal)
    tagline: string;             // キャッチコピー
    description: string;         // サイトの説明（メタディスクリプション）
    keywords: string[];          // キーワード（SEO用）

    assets: {
        logoUrl: string;           // メインロゴ (logo.png)
        logoSqUrl: string;         // 正方形ロゴ (Logo_SQ.png)
        faviconUrl: string;        // ファビコン
        ogpImageUrl: string;       // OGP用の代表画像
    };

    seo: {
        canonicalUrl: string;      // 正規URL
        twitterHandle: string;     // Twitter アカウント (@...)
        googleSiteVerification?: string; // Google Search Console 連携用
    };

    contact: {
        email: string;
        supportUrl?: string;
    };

    updatedAt: string;           // ISO 8601 形式
}