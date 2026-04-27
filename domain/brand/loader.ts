import { cache } from 'react';
import { ContentStorage } from '@/lib/content-storage';
import { BrandModel } from './model';
import { BrandViewModel } from './view-model';

/**
 * [Transform] 生データを UI/SEO 用の ViewModel に変換
 */
const transform = (model: BrandModel): BrandViewModel => ({
  siteName: model.name,
  fullTitle: `${model.name} | ${model.tagline}`,
  description: model.description,
  logo: {
    main: model.assets.logoUrl,
    square: model.assets.logoSqUrl,
  },
  socialLinks: model.socialLinks || [],
  metadata: {
    title: {
      default: `${model.name} | ${model.tagline}`,
      template: `%s | ${model.name}`,
    },
    description: model.description,
    keywords: model.keywords,
    alternates: {
      canonical: model.seo.canonicalUrl,
    },
    openGraph: {
      title: model.name,
      description: model.description,
      url: model.seo.canonicalUrl,
      siteName: model.name,
      images: [
        {
          url: model.assets.ogpImageUrl,
          width: 1200,
          height: 630,
          alt: model.name,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: model.name,
      description: model.description,
      site: model.seo.xHandle, // model.ts の変更に追従
      images: [model.assets.ogpImageUrl],
    },
    icons: {
      icon: model.assets.faviconUrl,
      apple: model.assets.logoSqUrl,
    },
    verification: {
      google: model.seo.googleSiteVerification,
    },
  },
});

/**
 * [Fetcher] ブランド情報を取得 (React cache によりリクエスト内メモ化)
 */
export const getBrand = cache(async (id: string): Promise<BrandViewModel | null> => {
  try {
    const storage = new ContentStorage();
    // 規約に基づきパスを解決してフェッチ
    const data = await storage.fetchJson<BrandModel>(`brand/${id}.json`);
    return transform(data);
  } catch (error) {
    console.error(`[BrandLoader] Load failed for ID: ${id}`, error);
    return null;
  }
});