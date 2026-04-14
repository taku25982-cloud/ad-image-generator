import { describe, expect, it } from 'vitest';
import {
    getWinnerToggleErrorMessage,
    replaceHistories,
    toggleGeneratedImageFavorite,
    toWinnerToggleState,
} from './create-winner';

describe('create winner helpers', () => {
    it('builds winner toggle state from the selected image', () => {
        expect(toWinnerToggleState({
            generationId: 'gen-1',
            imageUrl: 'https://example.com/image.png',
            format: 'instagram-feed',
            isFavorite: false,
        })).toEqual({
            generationId: 'gen-1',
            nextValue: true,
        });
        expect(toWinnerToggleState(null)).toBeNull();
    });

    it('toggles only the targeted generated image', () => {
        expect(toggleGeneratedImageFavorite([
            { generationId: 'gen-1', imageUrl: 'a', format: 'x', isFavorite: false },
            { generationId: 'gen-2', imageUrl: 'b', format: 'y', isFavorite: false },
        ], 'gen-2', true)).toEqual([
            { generationId: 'gen-1', imageUrl: 'a', format: 'x', isFavorite: false },
            { generationId: 'gen-2', imageUrl: 'b', format: 'y', isFavorite: true },
        ]);
    });

    it('keeps winner error copy stable', () => {
        expect(getWinnerToggleErrorMessage()).toBe('勝ち案の保存に失敗しました。時間をおいて再度お試しください。');
    });

    it('passes histories through for state replacement', () => {
        const histories = [{ id: 'history-1' }] as never[];
        expect(replaceHistories(histories)).toBe(histories);
    });
});
