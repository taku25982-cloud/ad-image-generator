// ========================================
// Firebase 認証ユーティリティ
// ========================================

import {
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile,
    type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { User as UserDocument, PlanType } from '@/types';

const googleProvider = new GoogleAuthProvider();

// Googleでログイン
export const signInWithGoogle = async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);

    // 新規ユーザーの場合、Firestoreにドキュメントを作成
    await createUserDocumentIfNotExists(result.user);

    return result.user;
};

// メールアドレスでログイン
export const signInWithEmail = async (email: string, password: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
};

// メールアドレスで新規登録
export const signUpWithEmail = async (email: string, password: string, displayName?: string): Promise<User> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    // 表示名を設定
    if (displayName) {
        await updateProfile(result.user, { displayName });
    }

    // Firestoreにドキュメントを作成
    await createUserDocumentIfNotExists(result.user);

    return result.user;
};

// ログアウト
export const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
};

// 認証状態の監視
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// 現在のユーザーを取得
export const getCurrentUser = (): User | null => {
    return auth.currentUser;
};

// ユーザードキュメントが存在しない場合は作成
export const createUserDocumentIfNotExists = async (user: User): Promise<void> => {
    if (!db) return;

    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const newUser: Omit<UserDocument, 'createdAt' | 'updatedAt'> & {
            createdAt: ReturnType<typeof serverTimestamp>;
            updatedAt: ReturnType<typeof serverTimestamp>;
        } = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoUrl: user.photoURL,
            credits: 3, // 初期クレジット
            subscription: {
                plan: 'free' as PlanType,
                status: 'active',
                stripeCustomerId: null,
                stripeSubscriptionId: null,
                currentPeriodStart: null,
                currentPeriodEnd: null,
                cancelAtPeriodEnd: false,
            },
            usage: {
                totalGenerations: 0,
                monthlyGenerations: 0,
                lastGenerationAt: null,
                usageResetAt: serverTimestamp() as any,
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(userRef, newUser);
    }
};

// ユーザードキュメントを取得
export const getUserDocument = async (uid: string): Promise<UserDocument | null> => {
    if (!db) return null;

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        return userSnap.data() as UserDocument;
    }

    return null;
};
