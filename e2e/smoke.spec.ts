import { expect, test } from '@playwright/test';

test('home page shows primary navigation', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'AI Generator' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: '料金' })).toBeVisible();
    await expect(page.getByRole('button', { name: /無料で始める/ }).first()).toBeVisible();
});

test('pricing page shows paid plans', async ({ page }) => {
    await page.goto('/pricing');

    await expect(page.getByRole('heading', { name: 'Pro' })).toBeVisible();
    await expect(page.getByText('¥1,980')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Starter' })).toBeVisible();
});

test('login page toggles signup mode from query', async ({ page }) => {
    await page.goto('/login?mode=signup');

    await expect(page.getByRole('heading', { name: '新規登録' })).toBeVisible();
    await expect(page.getByLabel('表示名（任意）')).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
});

test('signup redirects authenticated user to dashboard', async ({ page }) => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const email = `codex-e2e-${uniqueId}@example.com`;

    await page.goto('/login?mode=signup');
    await page.getByLabel('表示名（任意）').fill('Codex E2E');
    await page.getByLabel('メールアドレス').fill(email);
    await page.getByLabel('パスワード').fill('password123');
    const signupResponsePromise = page.waitForResponse((response) => (
        response.request().method() === 'POST'
        && response.url().includes('/api/auth')
    ));
    await page.getByRole('button', { name: '無料で登録' }).click();
    await signupResponsePromise;

    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: /こんにちは、/ })).toBeVisible();
});

test.describe('protected pages', () => {
    test('redirects unauthenticated users away from dashboard', async ({ page }) => {
        await page.goto('/dashboard');

        await expect(page).toHaveURL(/\/$/);
        await expect(page.getByRole('link', { name: 'AI Generator' }).first()).toBeVisible();
    });

    test('redirects unauthenticated users away from create', async ({ page }) => {
        await page.goto('/create');

        await expect(page).toHaveURL(/\/$/);
    });

    test('redirects unauthenticated users away from history', async ({ page }) => {
        await page.goto('/history');

        await expect(page).toHaveURL(/\/$/);
    });
});
