import {
    initializeTestEnvironment,
    RulesTestEnvironment,
    assertSucceeds,
    assertFails,
} from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';
import { describe, it, beforeAll, beforeEach, afterAll } from 'vitest';

/**
 * Storage セキュリティルールの検証テスト
 * 実行には Firebase Emulator が必要です。
 */
describe('Storage Security Rules', () => {
    let testEnv: RulesTestEnvironment;
    const PROJECT_ID = 'aipalcmsprototype';

    beforeAll(async () => {
        // テスト環境の初期化（ローカルの storage.rules を読み込む）
        testEnv = await initializeTestEnvironment({
            projectId: PROJECT_ID,
            storage: {
                rules: readFileSync('storage.rules', 'utf8'),
                host: '127.0.0.1',
                port: 9199,
            },
        });
    });

    beforeEach(async () => {
        // 各テスト前にストレージをクリーンアップ
        await testEnv.clearStorage();
    });

    afterAll(async () => {
        await testEnv.cleanup();
    });

    describe('1. 公開フォルダ (no _ prefix)', () => {
        it('未認証ユーザーでも読み取りができること', async () => {
            const unauth = testEnv.unauthenticatedContext();
            await assertSucceeds(
                unauth.storage().ref('brand/logo.png').getDownloadURL()
            );
        });

        it('未認証ユーザーは書き込みができないこと', async () => {
            const unauth = testEnv.unauthenticatedContext();
            await assertFails(
                unauth.storage().ref('brand/logo.png').put(new Uint8Array())
            );
        });
    });

    describe('2. _cms フォルダ (コンテンツ管理)', () => {
        it('未認証ユーザーは読み取りができないこと', async () => {
            const unauth = testEnv.unauthenticatedContext();
            await assertFails(
                unauth.storage().ref('_cms/categories.json').getMetadata()
            );
        });

        it('認証済みユーザーなら読み取りができること', async () => {
            const auth = testEnv.authenticatedContext('user_001');
            await assertSucceeds(
                auth.storage().ref('_cms/categories.json').getMetadata()
            );
        });
    });

    describe('3. _users フォルダ (所有者限定)', () => {
        it('自分のフォルダ内のファイルは読み書きできること', async () => {
            const alice = testEnv.authenticatedContext('alice');
            const ref = alice.storage().ref('_users/alice/profile.jpg');
            await assertSucceeds(ref.put(new Uint8Array()));
            await assertSucceeds(ref.getMetadata());
        });

        it('他人のフォルダ内は読み取りできないこと', async () => {
            const alice = testEnv.authenticatedContext('alice');
            const bobRef = alice.storage().ref('_users/bob/secret.jpg');
            await assertFails(bobRef.getMetadata());
        });
    });

    describe('4. _system フォルダ (管理者限定)', () => {
        it('一般ユーザーはアクセスできないこと', async () => {
            const user = testEnv.authenticatedContext('user_001');
            await assertFails(
                user.storage().ref('_system/backup.zip').getMetadata()
            );
        });

        it('admin クレームを持つユーザーはアクセスできること', async () => {
            // カスタムクレーム { admin: true } をシミュレート
            const admin = testEnv.authenticatedContext('admin_001', { admin: true });
            await assertSucceeds(
                admin.storage().ref('_system/backup.zip').getMetadata()
            );
        });
    });
});