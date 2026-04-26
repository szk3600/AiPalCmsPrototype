/**
 * UI コンポーネント（CategoryCard 等）が表示のために必要とする情報の定義
 */
export interface CategoryViewModel {
    id: string;
    slug: string;
    title: string;
    description: string;

    // 表示用アセット
    iconName: string;     // Lucide アイコン名
    accentColor: string;  // テーマカラー
    imagePath: string;    // Storage 内のパス（View 側で getAssetUrl を通す用）

    // 加工済み統計情報
    displayContentCount: string; // 例: "12 Lessons"
    lastUpdatedLabel: string;    // 例: "2026/04/26"

    // 状態
    isNew: boolean;       // 更新から1週間以内なら true
}