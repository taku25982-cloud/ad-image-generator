export const PAYMENT_REFRESH_DELAYS_MS = [1500, 4000, 8000] as const;

export function hasSuccessfulPayment(search: string) {
    return new URLSearchParams(search).get('payment') === 'success';
}
