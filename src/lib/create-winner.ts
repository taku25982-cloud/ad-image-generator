import type { AdHistory } from '@/lib/history';
import type { GeneratedImageItem } from './create-generation';

export function getWinnerToggleErrorMessage() {
    return '勝ち案の保存に失敗しました。時間をおいて再度お試しください。';
}

export function toggleGeneratedImageFavorite(
    items: GeneratedImageItem[],
    generationId: string,
    nextValue: boolean,
) {
    return items.map((item) => (
        item.generationId === generationId
            ? { ...item, isFavorite: nextValue }
            : item
    ));
}

export function toWinnerToggleState(image: GeneratedImageItem | null) {
    if (!image) {
        return null;
    }

    return {
        generationId: image.generationId,
        nextValue: !image.isFavorite,
    };
}

export function replaceHistories(nextHistories: AdHistory[]) {
    return nextHistories;
}
