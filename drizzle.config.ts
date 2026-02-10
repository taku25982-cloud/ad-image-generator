
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
import path from 'path';

// .env.local を明示的に読み込む
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle/migrations",
    dialect: "turso",
    dbCredentials: {
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
    },
});
