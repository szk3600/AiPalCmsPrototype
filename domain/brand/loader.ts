import { BrandModel } from './model';
import { BrandViewModel } from './view_model';

/**
 * Model を UI/SEO 用の ViewModel に変換する純粋関数
 */
export const loadBrand = (model: BrandModel): BrandViewModel => {
    return {
        siteName: model.name,
        fullTitle: `${model.name} | ${model.tagline}`,
        description: model.description,
        logo: {
            main: model.assets.logoUrl,
            square: model.assets.logoSqUrl,
        },
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
                site: model.seo.twitterHandle,
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
    };
};