import { vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { loadEnvConfig } from "@next/env";
import path from "path";
import fs from "fs";
// 0. 環境変数の強制ロード
// process.cwd() ではなく、このファイルからの相対パスでルートを特定します
const projectRoot = process.cwd();
const result = loadEnvConfig(projectRoot, true);

console.log("[Vitest Setup] Root path:", projectRoot);
const envLocalPath = path.join(projectRoot, ".env.local");
const envLocalExists = fs.existsSync(envLocalPath);

console.log(
    "[Vitest Setup] .env.local exists:",
    envLocalExists,
    "at",
    envLocalPath,
);
console.log(
    "[Vitest Setup] Loaded Env Files (Next.js):",
    result.loadedEnvFiles.map((f) => f.path),
);

console.log("[Vitest Setup] Environment Variables Check:");
console.log(
    "  - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:",
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
);
console.log(
    "  - NEXT_PUBLIC_FIREBASE_PROJECT_ID:",
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
);

// ユニットテスト用のフォールバック (バケット名未設定エラーの回避)
if (!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
    console.warn(
        "[Vitest Setup] NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is missing, using dummy-bucket",
    );
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = "dummy-bucket";
}

// ユニットテスト用の環境変数フォールバック (validateEnv 対策)
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||= "dummy-project";
process.env.FIREBASE_CLIENT_EMAIL ||= "dummy@example.com";
process.env.FIREBASE_PRIVATE_KEY ||= "dummy-private-key";

/**
 * [Testing Layer] Vitest Setup
 * 役割: テスト環境に必要なポリフィルと、外部依存のモックを定義します。
 */

// 1. server-only のガードを無効化
// テスト実行環境（Node.js/jsdom）でエラーが発生するのを防ぎます
vi.mock("server-only", () => ({}));

// 2. TextEncoder/Decoder のポリフィル
if (typeof TextEncoder === "undefined") {
    const { TextEncoder, TextDecoder } = require("util");
    global.TextEncoder = TextEncoder;
    global.TextDecoder = TextDecoder;
}

// 3. LocalStorage のモック
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value.toString();
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        key: vi.fn((index: number) => Object.keys(store)[index] || null),
        get length() {
            return Object.keys(store).length;
        },
    };
})();

vi.stubGlobal("localStorage", localStorageMock);

vi.mock("firebase/app", () => ({
    initializeApp: vi.fn(),
    getApps: vi.fn(() => []),
    getApp: vi.fn(),
}));