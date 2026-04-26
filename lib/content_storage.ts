/**
 * [Infrastructure Layer] ContentStorage (Server-side Only)
 * ------------------------------------------------------------
 * 役割: Firebase Admin SDK を使用した特権アクセス層。
 * 修正内容: 
 * 1. Admin SDK 環境への統一 (firebase/storage の依存を排除)
 * 2. uploadAdminJson を Admin SDK の file.save() を使用するように修正
 */
import { getApps, initializeApp, App, cert } from "firebase-admin/app";
import { getStorage, Storage } from "firebase-admin/storage";
import { getPrivateKey } from "./env_guard"; // 環境変数から秘密鍵を取得する想定
import { getErrorMessage } from "./error";     // エラーメッセージの共通処理想定

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
                this.log(`[ContentStorage] 🔑 AuthMode: SERVICE_ACCOUNT_KEY`);
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
    }

    /**
     * 内部利用・外部公開用のバケット参照
     */
    public getBucket() {
        return this.storage.bucket();
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
            return ids;
        } catch (e: unknown) {
            throw new Error(`[ContentStorage] ❌ Scan Failed: ${getErrorMessage(e)}`);
        }
    }

    async fetchDetail<T>(type: string, keys: ContentKeys): Promise<T> {
        const def = this.getDefinition(type);
        const path = def.pathResolver(keys);
        const fullPath =
            def.idMode === "filename" ? `${path}.json` : `${path}/detail.json`;
        const file = this.storage.bucket().file(fullPath);

        try {
            const [content] = await file.download();
            return JSON.parse(content.toString()) as T;
        } catch (e: unknown) {
            throw new Error(`[ContentStorage] ❌ Load Failed: ${fullPath} - ${getErrorMessage(e)}`);
        }
    }

    async fetchAllDetails<T>(type: string, context: ContentKeys): Promise<T[]> {
        const ids = await this.fetchIds(type, context);
        return Promise.all(
            ids.map((id) => this.fetchDetail<T>(type, { ...context, id })),
        );
    }

    async refreshCache(type?: string, context?: ContentKeys): Promise<void> {
        if (!type) return;
        try {
            const { revalidateTag } = await import("next/cache");
            const tag = context?.id ? `${type}_${context.id}` : type;
            (revalidateTag as any)(tag);
            this.log(`[ContentStorage] 🔄 ISR Revalidated: ${tag}`);
        } catch (e) {
            this.log(`[ContentStorage] ℹ️ Cache refresh skipped`);
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

/**
 * 汎用：Firebase Storage からアセットの署名付きURLを取得する（Server-side）
 * @param path Storage 内のフルパス (例: 'brand/logo.png')
 * @returns Promise<string> 1時間有効な署名付きURL
 */
export async function getAssetUrl(path: string): Promise<string> {
    if (!path) return '';

    try {
        const storageInstance = new ContentStorage();
        const bucket = storageInstance.getBucket();
        const file = bucket.file(path);

        // 署名付きURLを生成（デフォルト1時間有効）
        const [url] = await file.getSignedUrl({
            action: 'read',
            expires: Date.now() + 3600 * 1000,
        });

        return url;
    } catch (error) {
        console.warn(`[ContentStorage] ⚠️ Failed to get URL for: ${path}`, error);
        return '/images/placeholder.png';
    }
}

/**
 * 管理者用：JSONデータを Storage にアップロードする (Admin SDK 版)
 * 特権操作のため、API Route や Server Actions で使用されることを想定しています。
 */
export async function uploadAdminJson(path: string, data: any): Promise<boolean> {
    try {
        const storageInstance = new ContentStorage();
        const bucket = storageInstance.getBucket();
        const file = bucket.file(path);

        const jsonString = JSON.stringify(data, null, 2);

        await file.save(jsonString, {
            contentType: 'application/json',
            metadata: {
                cacheControl: 'no-cache',
            }
        });

        console.log(`[ContentStorage] 📤 Admin Upload Success: ${path}`);
        return true;
    } catch (error) {
        console.error(`[ContentStorage] ❌ Admin Upload Failed: ${path}`, error);
        return false;
    }
}