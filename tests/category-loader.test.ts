import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadCategory, loadCategories } from '../domain/category/loader';
import { CategoryModel } from '../domain/category/model';
import categoryMockData from './data/_cms/categoryModel.json';

/**
 * カテゴリー・ローダーのテスト
 */
describe('Category Loader', () => {
    // JSONインポートの正規化
    const mockData = (categoryMockData as any).default || categoryMockData;
    const categories = mockData.categories as CategoryModel[];

    beforeEach(() => {
        // 日付に依存する isNew ロジックをテストするため、現在時刻を固定
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-04-26T20:00:00Z'));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('loadCategory (単体変換)', () => {
        it('Model から ViewModel へ各フィールドが正しく変換されること', () => {
            const model = categories[0]; // AI基礎
            const viewModel = loadCategory(model);

            expect(viewModel.id).toBe(model.id);
            expect(viewModel.title).toBe(model.title);
            expect(viewModel.displayContentCount).toBe('12 Lessons');
            expect(viewModel.accentColor).toBe(model.assets.accentColor);
            expect(viewModel.imagePath).toBe(model.assets.imageUrl);
        });

        it('更新日が7日以内の場合、isNew が true になること', () => {
            const recentModel: CategoryModel = {
                ...categories[0],
                stats: {
                    ...categories[0].stats,
                    updatedAt: '2026-04-20T10:00:00Z' // 6日前
                }
            };
            const viewModel = loadCategory(recentModel);
            expect(viewModel.isNew).toBe(true);
        });

        it('更新日が7日以上前の場合、isNew が false になること', () => {
            const oldModel: CategoryModel = {
                ...categories[0],
                stats: {
                    ...categories[0].stats,
                    updatedAt: '2026-04-10T10:00:00Z' // 16日前
                }
            };
            const viewModel = loadCategory(oldModel);
            expect(viewModel.isNew).toBe(false);
        });
    });

    describe('loadCategories (リスト変換)', () => {
        it('非公開 (isPublic: false) のカテゴリーが除外されること', () => {
            const mixedModels: CategoryModel[] = [
                { ...categories[0], id: 'pub-1', isPublic: true },
                { ...categories[1], id: 'priv-1', isPublic: false },
            ];

            const result = loadCategories(mixedModels);
            expect(result).toHaveLength(1);
            expect(result[0].id).toBe('pub-1');
        });

        it('指定された order の昇順でソートされること', () => {
            const unorderedModels: CategoryModel[] = [
                { ...categories[0], id: 'order-3', order: 3 },
                { ...categories[0], id: 'order-1', order: 1 },
                { ...categories[0], id: 'order-2', order: 2 },
            ];

            const result = loadCategories(unorderedModels);
            expect(result[0].id).toBe('order-1');
            expect(result[1].id).toBe('order-2');
            expect(result[2].id).toBe('order-3');
        });
    });
});