import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp,
    doc,
    deleteDoc,
    Timestamp
} from 'firebase/firestore';
import { db } from './config';

export interface AdHistory {
    id: string;
    userId: string;
    imageUrl: string;
    format: string;
    productName: string;
    catchCopy?: string;
    description?: string;
    targetAudience?: string;
    tone: string;
    primaryColor: string;
    secondaryColor: string;
    createdAt: Timestamp;
}

const COLLECTION_NAME = 'ad_histories';

/**
 * 広告生成履歴を保存する
 */
export const saveAdHistory = async (data: Omit<AdHistory, 'id' | 'createdAt'>) => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...data,
            createdAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error saving ad history:', error);
        throw error;
    }
};

/**
 * ユーザーの広告生成履歴を取得する
 */
export const getAdHistoriesByUserId = async (userId: string) => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const histories: AdHistory[] = [];

        querySnapshot.forEach((doc) => {
            histories.push({
                id: doc.id,
                ...doc.data()
            } as AdHistory);
        });

        return histories;
    } catch (error) {
        console.error('Error getting ad histories:', error);
        throw error;
    }
};

/**
 * 履歴を削除する
 */
export const deleteAdHistory = async (id: string) => {
    try {
        await deleteDoc(doc(db, COLLECTION_NAME, id));
    } catch (error) {
        console.error('Error deleting ad history:', error);
        throw error;
    }
};
