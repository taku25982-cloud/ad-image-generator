
import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import * as schema from '@/db/schema';

let client: any;
let _db: any;

export const db = new Proxy({} as any, {
    get(target, prop) {
        if (typeof window !== 'undefined') {
            throw new Error('Database access is not allowed in the browser.');
        }
        if (!_db) {
            if (!process.env.TURSO_DATABASE_URL) {
                throw new Error('TURSO_DATABASE_URL is not defined');
            }
            client = createClient({
                url: process.env.TURSO_DATABASE_URL!,
                authToken: process.env.TURSO_AUTH_TOKEN,
            });
            _db = drizzle(client, { schema });
        }
        return _db[prop];
    },
});
