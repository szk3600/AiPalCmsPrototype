/**
 * カテゴリーの生データ定義（Firestore のスキーマ）
 */
export interface CategoryModel {
    id: string;           // ユニークID (例: cat-001)
    slug: string;         // URL用スラグ (例: ai-business)
    title: string;        // 表示名 (例: AI ビジネス活用)
    description: string;  // 説明文

    assets: {
        iconName: string;   // Lucide アイコン名 (例: Brain, Rocket, Briefcase)
        imageUrl: string;   // Storage 内のパス (例: _cms/categories/cat-001/bg.jpg)
        accentColor: string; // UIのアクセントカラー (例: #3B82F6)
    };

    stats: {
        contentCount: number; // 含まれるコンテンツ数
        updatedAt: string;    // ISO 8601
    };

    order: number;        // 並び順
    isPublic: boolean;    // 公開フラグ
}

/**
 * カテゴリーリストのラップ型（JSONファイル用）
 */
export interface CategoryListModel {
    categories: CategoryModel[];
    lastUpdated: string;
}