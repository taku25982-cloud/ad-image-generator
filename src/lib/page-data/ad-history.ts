import type { AdHistory } from '@/lib/history';

export type SerializedAdHistory = Omit<AdHistory, 'createdAt'> & {
    createdAt: string;
};

function toSafeIsoString(value: Date) {
    return Number.isNaN(value.getTime()) ? new Date(0).toISOString() : value.toISOString();
}

export function serializeAdHistories(items: AdHistory[]): SerializedAdHistory[] {
    return items.map((item) => ({
        ...item,
        createdAt: toSafeIsoString(item.createdAt),
    }));
}
