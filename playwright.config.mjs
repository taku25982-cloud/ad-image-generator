import { defineConfig, devices } from '@playwright/test';

const port = 3100;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
    testDir: './e2e',
    timeout: 30_000,
    fullyParallel: true,
    use: {
        baseURL,
        trace: 'on-first-retry',
    },
    webServer: {
        command: `npx next start --port ${port}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
        env: {
            BETTER_AUTH_URL: baseURL,
            NEXT_PUBLIC_APP_URL: baseURL,
        },
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
