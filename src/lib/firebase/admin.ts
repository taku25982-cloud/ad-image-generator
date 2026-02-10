import * as admin from 'firebase-admin';

// Firebase Admin SDKの遅延初期化
// ビルド時に環境変数が未定義でもエラーにならないようにする
function getFirebaseAdmin() {
    if (!admin.apps.length) {
        let projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        let clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
        const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

        if (projectId && projectId.startsWith('"') && projectId.endsWith('"')) {
            projectId = projectId.slice(1, -1);
        }

        if (clientEmail && clientEmail.startsWith('"') && clientEmail.endsWith('"')) {
            clientEmail = clientEmail.slice(1, -1);
        }

        let privateKey: string | undefined = undefined;

        if (rawKey) {
            try {
                // まずJSON文字列としてパースを試みる（二重エスケープなどに対応）
                // 前後にダブルクォートがない場合は付与してパース
                const keyToParse = rawKey.startsWith('"') ? rawKey : `"${rawKey}"`;
                privateKey = JSON.parse(keyToParse);
            } catch {
                // JSONパースに失敗した場合は手動置換
                let key = rawKey;
                if (key.startsWith('"') && key.endsWith('"')) {
                    key = key.slice(1, -1);
                }
                privateKey = key.replace(/\\n/g, '\n');
            }
        }

        if (!projectId || !clientEmail || !privateKey) {
            console.warn('Firebase Admin SDK: 必要な環境変数が設定されていません。');
            return null;
        }

        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
                storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            });
        } catch (error) {
            console.error('Firebase Admin SDK初期化エラー:', error);
            return null;
        }
    }
    return admin;
}

// 遅延初期化ヘルパー（API Route内で呼び出す）
export function getAdminAuth() {
    const app = getFirebaseAdmin();
    if (!app) throw new Error('Firebase Admin SDKが初期化されていません。環境変数を確認してください。');
    return app.auth();
}

export function getAdminDb() {
    const app = getFirebaseAdmin();
    if (!app) throw new Error('Firebase Admin SDKが初期化されていません。環境変数を確認してください。');
    return app.firestore();
}

export function getAdminStorage() {
    const app = getFirebaseAdmin();
    if (!app) throw new Error('Firebase Admin SDKが初期化されていません。環境変数を確認してください。');
    return app.storage();
}

export { admin };
