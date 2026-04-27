/**
 * [Infrastructure Layer] ContentStorage (Server-side Only)
 * ------------------------------------------------------------
 * 役割: 渡されたパスに対して、環境変数に応じた場所から生データを取ってくるだけの純粋なエンジン。
 * 重複ロード防止: React の cache を使用し、同一リクエスト内での重複フェッチを抑制します。
 */
import { getApps, initializeApp, App, cert } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";
import { getPrivateKey } from "./env-guard";
import { cache } from "react";
import fs from "fs";
import path from "path";

export class ContentStorage {
    private app?: App;
    private storage?: Storage;
    private isLocal: boolean;
    private dataRoot: string;

    constructor() {
        // DATA_SOURCE=local の場合はローカルファイルを参照
        this.isLocal = process.env.DATA_SOURCE === "local";
        this.dataRoot = path.join(process.cwd(), "tests/data");

        if (this.isLocal) return;

        // Remote Mode (Firebase Admin SDK) の初期化
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = getPrivateKey();

        if (getApps().length === 0) {
            this.app = initializeApp({
                credential: privateKey && clientEmail ? cert({ projectId, clientEmail, privateKey }) : undefined,
                storageBucket: bucketName,
            });
        } else {
            this.app = getApps()[0];
        }
        this.storage = getStorage(this.app);
    }

    /**
     * Storage パスをローカルの物理パスに変換
     */
    private resolveLocalPath(remotePath: string): string {
        return path.join(this.dataRoot, remotePath.replace(/\\/g, '/'));
    }

    /**
     * 指定されたパスから JSON データを取得する（リクエスト内メモ化対応）
     * @param remotePath ストレージ上の相対パス (例: 'brand/brandModel.json')
     */
    public async fetchJson<T>(remotePath: string): Promise<T> {
        // メソッド自体ではなく、内部でメモ化された関数を呼び出すことで
        // 同一リクエスト内での物理的なアクセスを1回に制限します。
        return this.loadCachedData(remotePath) as Promise<T>;
    }

    /**
     * React の cache を使用した内部フェッチャー
     * これにより、同一パスへのアクセスがリクエスト内で重複した場合、2回目以降は即座に結果を返します。
     */
    private loadCachedData = cache(async (remotePath: string): Promise<unknown> => {
        if (this.isLocal) {
            const localFilePath = this.resolveLocalPath(remotePath);
            try {
                const content = fs.readFileSync(localFilePath, "utf-8");
                return JSON.parse(content);
            } catch (e) {
                throw new Error(`[ContentStorage] ❌ Local Load Failed: ${localFilePath}`);
            }
        }

        // Remote Mode: Admin SDK 経由で取得
        try {
            const bucket = this.storage!.bucket();
            const [content] = await bucket.file(remotePath).download();
            return JSON.parse(content.toString());
        } catch (e) {
            throw new Error(`[ContentStorage] ❌ Remote Load Failed: ${remotePath}`);
        }
    });

    /**
     * 同期スクリプト等で使用するための Bucket インスタンス取得
     */
    public getBucket() {
        if (this.isLocal || !this.storage) {
            throw new Error("[ContentStorage] Cannot access Bucket in Local mode.");
        }
        return this.storage.bucket();
    }
}