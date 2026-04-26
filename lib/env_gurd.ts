/**
 * [Library Layer] Environment Variable Guard
 * ------------------------------------------------------------
 * 役割: サーバーサイド実行に必要な環境変数の整合性をチェックし、
 * Firebase Admin SDK が要求する形式にデータを加工します。
 */

const REQUIRED_VARS = [
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
] as const;

export function validateEnv() {
    const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `[環境変数エラー] 以下の必須変数が不足しています: ${missing.join(", ")}\n` +
            `scripts/generate_env.ts を実行して設定を同期してください。`,
        );
    }
}

/**
 * FIREBASE_PRIVATE_KEY のパース
 * .env ファイル経由で読み込まれた際のエスケープ文字 (\\n) を
 * 実際の改行コード (\n) に変換し、不要な引用符を除去します。
 */
export function getPrivateKey(): string {
    const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
    return rawKey
        .replace(/^["']|["']$/g, "") // 前後の引用符を削除
        .replace(/\\n/g, "\n") // 文字列としての \n を実際の改行に変換
        .trim();
}