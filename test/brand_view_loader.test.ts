import { describe, it, expect } from 'vitest';
import { loadBrand } from '@/domain/brand/loader';
import { BrandModel } from '@/domain/brand/model';
import brandMockData from './data/brandModel.json';

describe('Brand Loader', () => {
    // テストデータの準備
    const mockModel = brandMockData as BrandModel;

    it('Model から ViewModel へ正しく変換されること', () => {
        const viewModel = loadBrand(mockModel);

        // 基本情報の検証
        expect(viewModel.siteName).toBe(mockModel.name);
        expect(viewModel.fullTitle).toBe(`${mockModel.name} | ${mockModel.tagline}`);
        expect(viewModel.description).toBe(mockModel.description);

        // ロゴアセットの検証
        expect(viewModel.logo.main).toBe(mockModel.assets.logoUrl);
        expect(viewModel.logo.square).toBe(mockModel.assets.logoSqUrl);
    });

    it('SEO用メタデータが Next.js の形式で正しく生成されること', () => {
        const viewModel = loadBrand(mockModel);
        const meta = viewModel.metadata;

        // 基本メタデータの検証
        expect(meta.title).toMatchObject({
            default: `${mockModel.name} | ${mockModel.tagline}`,
            template: `%s | ${mockModel.name}`,
        });
        expect(meta.description).toBe(mockModel.description);
        expect(meta.keywords).toEqual(mockModel.keywords);

        // OGP の検証
        expect(meta.openGraph?.title).toBe(mockModel.name);
        expect(meta.openGraph?.images).toContainEqual(
            expect.objectContaining({ url: mockModel.assets.ogpImageUrl })
        );

        // アイコンの検証
        expect(meta.icons).toMatchObject({
            icon: mockModel.assets.faviconUrl,
            apple: mockModel.assets.logoSqUrl,
        });
    });

    it('正規URL（Canonical）が正しく設定されていること', () => {
        const viewModel = loadBrand(mockModel);
        // 修正: meta 変数の代わりに viewModel.metadata を直接参照
        expect(viewModel.metadata.alternates?.canonical).toBe(mockModel.seo.canonicalUrl);
    });
});