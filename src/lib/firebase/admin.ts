import * as admin from 'firebase-admin';

// Firebase Admin SDKの遅延初期化
// ビルド時に環境変数が未定義でもエラーにならないようにする
function getFirebaseAdmin() {
    if (!admin.apps.length) {
        const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
        const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

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
