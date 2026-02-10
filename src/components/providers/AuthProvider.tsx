// ========================================
// 認証コンテキスト
// ========================================

'use client';

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import { onAuthChange, getUserDocument } from '@/lib/firebase/auth';
import type { User as UserDocument } from '@/types';

interface AuthContextType {
    user: User | null;
    userDoc: UserDocument | null;
    loading: boolean;
    refreshUserDoc: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userDoc: null,
    loading: true,
    refreshUserDoc: async () => { },
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshUserDoc = async () => {
        if (user) {
            const doc = await getUserDocument(user.uid);
            setUserDoc(doc);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthChange(async (firebaseUser) => {
            setUser(firebaseUser);

            if (firebaseUser) {
                const doc = await getUserDocument(firebaseUser.uid);
                setUserDoc(doc);
            } else {
                setUserDoc(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, userDoc, loading, refreshUserDoc }}>
            {children}
        </AuthContext.Provider>
    );
}
