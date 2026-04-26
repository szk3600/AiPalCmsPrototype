import { CategoryModel } from './model';
import { CategoryViewModel } from './view_model';

/**
 * Model を UI 用の ViewModel に変換する純粋関数
 * ※ getAssetUrl は非同期のため、コンポーネントまたは上位層で解決する設計にします。
 */
export const loadCategory = (model: CategoryModel): CategoryViewModel => {
    const updatedAt = new Date(model.stats.updatedAt);
    const now = new Date();

    // 7日以内なら "New" フラグを立てる
    const isNew = (now.getTime() - updatedAt.getTime()) < 7 * 24 * 60 * 60 * 1000;

    return {
        id: model.id,
        slug: model.slug,
        title: model.title,
        description: model.description,

        iconName: model.assets.iconName,
        accentColor: model.assets.accentColor,
        imagePath: model.assets.imageUrl,

        displayContentCount: `${model.stats.contentCount} Lessons`,
        lastUpdatedLabel: updatedAt.toLocaleDateString('ja-JP'),

        isNew,
    };
};

/**
 * 複数のカテゴリーを一括変換する
 */
export const loadCategories = (models: CategoryModel[]): CategoryViewModel[] => {
    return models
        .filter(m => m.isPublic) // 公開設定のもののみ
        .sort((a, b) => a.order - b.order) // 並び順通り
        .map(loadCategory);
};