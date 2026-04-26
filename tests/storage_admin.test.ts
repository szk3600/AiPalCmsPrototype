import { describe, it, expect } from 'vitest';
import { uploadAdminJson, getAssetUrl } from '../lib/content_storage';
// JSONを確実に読み込むためのインポート
import adminTestDataRaw from './data/admin_test.json';

// インポート結果が default に包まれている場合の対策
const adminTestData = (adminTestDataRaw as any).default || adminTestDataRaw;

describe('Firebase Storage Admin Test', () => {
    const testPath = '_cms/test.json';

    it('保護されたフォルダ (_cms/) にテストデータをアップロードできること', async () => {
        // アップロード前にデータの正当性を確認
        console.log('[Test] Uploading Data:', JSON.stringify(adminTestData));
        expect(adminTestData.testId).toBe('ADMIN-TEST-001');

        const success = await uploadAdminJson(testPath, adminTestData);
        expect(success).toBe(true);
    });

    it('アップロードしたデータのダウンロードURLを取得できること', async () => {
        const url = await getAssetUrl(testPath);

        expect(url).toContain('test.json');
        expect(url).toContain('storage.googleapis.com');

        // 実際にフェッチして中身を確認
        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Fetch failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log('[Test] Fetched Data:', JSON.stringify(data));

        // data が期待通りの構造かチェック
        expect(data).toBeDefined();
        expect(data.testId).toBe(adminTestData.testId);
        expect(data.message).toBe(adminTestData.message);
    });
});