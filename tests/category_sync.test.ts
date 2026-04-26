import { describe, it, expect } from 'vitest';
import { uploadAdminJson, getAssetUrl } from '../lib/content_storage';
import categoryDataRaw from './data/_cms/categoryModel.json';

/**
 * モジュール解決の差異を吸収（JSONインポート対策）
 */
const categoryData = (categoryDataRaw as any).default || categoryDataRaw;

describe('Category Data Sync Test', () => {
    const remotePath = '_cms/categoryModel.json';

    it('カテゴリーのマスターデータを Storage にアップロードできること', async () => {
        console.log('[Sync] Starting upload for categoryModel.json...');

        // Admin SDK を使用して特権書き込みを実行
        const success = await uploadAdminJson(remotePath, categoryData);

        expect(success).toBe(true);
        console.log('[Sync] ✅ Upload successful to:', remotePath);
    });

    it('アップロードしたカテゴリーデータを署名付きURLで取得し、内容を検証できること', async () => {
        // 書き込み直後の反映を確実にするため、わずかに待機
        await new Promise(r => setTimeout(r, 1000));

        // 署名付きURLを取得
        const url = await getAssetUrl(remotePath);
        console.log('[Sync] Generated Signed URL:', url);

        // キャッシュを回避して Storage から直接データをフェッチ
        const response = await fetch(`${url}&t=${Date.now()}`, {
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Fetch failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();

        // 取得したデータの整合性チェック
        expect(data.categories).toBeDefined();
        expect(data.categories.length).toBe(categoryData.categories.length);

        // 最初の要素の内容が一致するか検証
        const firstCategory = data.categories[0];
        expect(firstCategory.id).toBe(categoryData.categories[0].id);
        expect(firstCategory.title).toBe(categoryData.categories[0].title);

        console.log(`[Sync] ✅ Success: Verified ${data.categories.length} categories from Storage.`);
        console.log(`[Sync] Sample: ${firstCategory.title} (${firstCategory.slug})`);
    });
});