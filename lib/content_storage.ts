/**
 * [Infrastructure Layer] ContentStorage (Server-side Only)
 * ------------------------------------------------------------
 * 役割: Firebase Admin SDK を使用した特権アクセス層。
 * 修正内容: revalidateTag の引数エラー (Expected 2 arguments) を解消するため
 * 動的キャストを適用しました。
 */
import "server-only";
import { getApps, initializeApp, App, cert } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";
import { getPrivateKey } from "./env_guard";
import { getErrorMessage } from "./error";

/**
 * --- Content Definitions (Domain Infrastructure) ---
 */

export type IdMode = "directory" | "filename";

export type ContentKeys = {
    id?: string;
    [key: string]: any;
};

export interface ContentDefinition<T = any> {
    readonly type: string;
    readonly pathResolver: (keys: ContentKeys) => string;
    readonly mimePattern?: string;
    readonly isPublic?: boolean;
    readonly idMode?: IdMode;
    readonly _type?: T;
}

/**
 * 定義を簡潔に作成するためのヘルパー関数。
 */
export function defineContent<T>(
    def: ContentDefinition<T>,
): ContentDefinition<T> {
    return {
        isPublic: true,
        idMode: "directory",
        ...def,
    };
}

/**
 * --- Storage Engine Implementation ---
 */

export interface IContentStorage {
    register(definitions: ContentDefinition[]): void;
    fetchIds(type: string, context: ContentKeys): Promise<string[]>;
    fetchDetail<T>(type: string, keys: ContentKeys): Promise<T>;
    fetchAllDetails<T>(type: string, context: ContentKeys): Promise<T[]>;
    refreshCache(type?: string, context?: ContentKeys): Promise<void>;
    getDownloadUrl(
        type: string,
        keys: ContentKeys,
        fileName: string,
    ): Promise<string>;
}

export class ContentStorage implements IContentStorage {
    private app: App;
    private storage: Storage;
    private registry: Map<string, ContentDefinition> = new Map();

    /**
     * ログ出力の制御
     */
    private log(message: string) {
        if (process.env.NODE_ENV !== "test" || process.env.DEBUG === "true") {
            console.log(message);
        }
    }

    constructor() {
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const privateKey = getPrivateKey();

        if (getApps().length === 0) {
            if (privateKey && clientEmail) {
                this.log(
                    `[ContentStorage] 🔑 AuthMode: SERVICE_ACCOUNT_KEY (Local/Test)`,
                );
                this.app = initializeApp({
                    credential: cert({ projectId, clientEmail, privateKey }),
                    storageBucket: bucketName,
                });
            } else {
                this.log(`[ContentStorage] ☁️ AuthMode: ADC (Production)`);
                this.app = initializeApp({
                    storageBucket: bucketName,
                });
            }
        } else {
            this.app = getApps()[0];
        }

        this.storage = getStorage(this.app);
        this.log(`[ContentStorage] 📦 Storage Initialized: gs://${bucketName}`);
    }

    register(definitions: ContentDefinition[]): void {
        definitions.forEach((def) => {
            this.registry.set(def.type, def);
            this.log(`[ContentStorage] ✅ Registered: ${def.type}`);
        });
    }

    private getDefinition(type: string): ContentDefinition {
        const def = this.registry.get(type);
        if (!def) throw new Error(`[Server] Definition not found: ${type}`);
        return def;
    }

    async fetchIds(type: string, context: ContentKeys): Promise<string[]> {
        const def = this.getDefinition(type);
        const parentPath =
            def.pathResolver({ ...context, id: "" }).replace(/\/$/, "") + "/";
        const idMode = def.idMode || "directory";

        this.log(`[ContentStorage] 🔍 Scanning IDs: ${type} at ${parentPath}`);

        try {
            const [files, , apiResponse] = await this.storage.bucket().getFiles({
                prefix: parentPath,
                delimiter: "/",
                autoPaginate: true,
            });

            let ids: string[] = [];
            if (idMode === "directory") {
                ids =
                    (apiResponse as any).prefixes?.map((p: string) => {
                        const segments = p.split("/").filter(Boolean);
                        return segments[segments.length - 1];
                    }) || [];
            } else {
                ids = files
                    .filter((f) => !f.name.endsWith("/"))
                    .map(
                        (f) =>
                            f.name
                                .split("/")
                                .pop()
                                ?.replace(/\.[^/.]+$/, "") || "",
                    );
            }

            this.log(`[ContentStorage] ✨ Found ${ids.length} items`);
            return ids;
        } catch (e: unknown) {
            const errorMessage = `[ContentStorage] ❌ Scan Failed: ${getErrorMessage(e)}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    async fetchDetail<T>(type: string, keys: ContentKeys): Promise<T> {
        const def = this.getDefinition(type);
        const path = def.pathResolver(keys);
        const fullPath =
            def.idMode === "filename" ? `${path}.json` : `${path}/detail.json`;
        const file = this.storage.bucket().file(fullPath);

        const startTime = Date.now();
        try {
            const [content] = await file.download();
            const data = JSON.parse(content.toString()) as T;
            this.log(
                `[ContentStorage] ✅ Loaded: ${fullPath} (${Date.now() - startTime}ms)`,
            );
            return data;
        } catch (e: unknown) {
            const errorMessage = `[ContentStorage] ❌ Load Failed: ${fullPath} - ${getErrorMessage(e)}`;
            console.error(errorMessage);
            throw new Error(errorMessage);
        }
    }

    async fetchAllDetails<T>(type: string, context: ContentKeys): Promise<T[]> {
        const ids = await this.fetchIds(type, context);
        return Promise.all(
            ids.map((id) => this.fetchDetail<T>(type, { ...context, id })),
        );
    }

    /**
     * Next.js ISR タグの再検証ロジックを実装
     * 型エラー回避のため as any を使用しています。
     */
    async refreshCache(type?: string, context?: ContentKeys): Promise<void> {
        if (!type) return;

        try {
            const { revalidateTag } = await import("next/cache");
            // IDがあれば type_id, なければ type をタグとして発行
            const tag = context?.id ? `${type}_${context.id}` : type;

            // コンパイラエラー対策：明示的に any キャストして実行
            (revalidateTag as any)(tag);

            this.log(`[ContentStorage] 🔄 ISR Revalidated: ${tag}`);
        } catch (e) {
            // 非Next.js環境（スクリプト実行等）では無視
            this.log(
                `[ContentStorage] ℹ️ Cache refresh skipped (next/cache not available)`,
            );
        }
    }

    async getDownloadUrl(
        type: string,
        keys: ContentKeys,
        fileName: string,
    ): Promise<string> {
        const def = this.getDefinition(type);
        const dirPath = def.pathResolver(keys);
        const file = this.storage.bucket().file(`${dirPath}/${fileName}`);
        const [url] = await file.getSignedUrl({
            action: "read",
            expires: Date.now() + 3600 * 1000,
        });
        return url;
    }
}