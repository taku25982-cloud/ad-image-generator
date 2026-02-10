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
import { authClient } from '@/lib/auth-client';
import type { User as UserDocument } from '@/types';

interface AuthContextType {
    user: any; // Backward compatibility
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
    const { data: session, isPending, error } = authClient.useSession();
    const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
    const [refreshFlag, setRefreshFlag] = useState(0);

    const refreshUserDoc = async () => {
        setRefreshFlag(prev => prev + 1);
    };

    useEffect(() => {
        if (session?.user) {
            // セッションからユーザー情報をマッピング
            const u = session.user;
            setUserDoc({
                uid: u.id,
                email: u.email,
                displayName: u.name,
                photoUrl: u.image || undefined,
                credits: (u as any).credits ?? 0,
                subscription: {
                    plan: (u as any).plan || 'free',
                    status: (u as any).subscriptionStatus || 'none',
                    stripeCustomerId: (u as any).stripeCustomerId,
                    stripeSubscriptionId: (u as any).stripeSubscriptionId,
                },
                usage: {
                    totalGenerations: (u as any).usageTotalGenerations ?? 0,
                    monthlyGenerations: (u as any).usageMonthlyGenerations ?? 0,
                    lastGenerationAt: (u as any).usageLastGenerationAt ? new Date((u as any).usageLastGenerationAt) : null,
                    usageResetAt: (u as any).usageResetAt ? new Date((u as any).usageResetAt) : undefined,
                },
                createdAt: (u as any).createdAt ? new Date((u as any).createdAt) : undefined,
                updatedAt: (u as any).updatedAt ? new Date((u as any).updatedAt) : undefined,
            } as UserDocument);
        } else {
            setUserDoc(null);
        }
    }, [session, refreshFlag]);

    return (
        <AuthContext.Provider value={{
            user: session?.user || null,
            userDoc,
            loading: isPending,
            refreshUserDoc
        }}>
            {children}
        </AuthContext.Provider>
    );
}
