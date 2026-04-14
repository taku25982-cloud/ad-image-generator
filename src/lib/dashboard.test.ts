import { describe, expect, it } from 'vitest';
import { hasSuccessfulPayment, PAYMENT_REFRESH_DELAYS_MS } from './dashboard';

describe('dashboard helpers', () => {
    it('detects successful payment query params', () => {
        expect(hasSuccessfulPayment('?payment=success')).toBe(true);
        expect(hasSuccessfulPayment('?payment=failed')).toBe(false);
        expect(hasSuccessfulPayment('')).toBe(false);
    });

    it('keeps payment refresh delays stable', () => {
        expect(PAYMENT_REFRESH_DELAYS_MS).toEqual([1500, 4000, 8000]);
    });
});
