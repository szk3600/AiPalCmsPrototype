/**
 * [Model] ブランドの生データ定義
 * ------------------------------------------------------------
 * 役割: ストレージ (JSON) 上の物理構造を定義します。
 */
export interface SocialLink {
  platform: 'x' | 'github' | 'email' | 'facebook' | 'instagram' | 'youtube';
  url: string;
  label: string;
}

export interface BrandModel {
  id: string;
  name: string;
  tagline: string;
  description: string;
  keywords: string[];
  
  assets: {
    logoUrl: string;
    logoSqUrl: string;
    faviconUrl: string;
    ogpImageUrl: string;
  };

  socialLinks: SocialLink[];

  seo: {
    canonicalUrl: string;
    xHandle: string; // JSON のフィールド名に合わせ更新
    googleSiteVerification?: string;
  };

  contact: {
    email: string;
    supportUrl?: string;
  };

  updatedAt: string;
}