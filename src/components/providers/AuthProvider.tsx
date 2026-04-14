// ========================================
// 認証コンテキスト
// ========================================

'use client';


import {
    createContext,
    useContext,
    useMemo,
    type ReactNode,
} from 'react';
import { authClient } from '@/lib/auth-client';
import type { User as UserDocument } from '@/types';
import type { PlanType, SubscriptionStatus } from '@/types/auth';

interface AuthSessionUser {
    id: string;
    email: string;
    name: string;
    displayName?: string | null;
    image?: string | null;
    photoURL?: string | null;
    credits?: number;
    plan?: PlanType;
    stripeCustomerId?: string | null;
    stripeSubscriptionId?: string | null;
    subscriptionStatus?: SubscriptionStatus | 'cancelled';
    currentPeriodStart?: string | number | Date | null;
    currentPeriodEnd?: string | number | Date | null;
    cancelAtPeriodEnd?: boolean;
    usageTotalGenerations?: number;
    usageMonthlyGenerations?: number;
    usageLastGenerationAt?: string | number | Date | null;
    usageResetAt?: string | number | Date | null;
    createdAt?: string | number | Date;
    updatedAt?: string | number | Date;
}

interface AuthContextType {
    user: AuthSessionUser | null; // Backward compatibility
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
    const { data: session, isPending, refetch } = authClient.useSession();

    const refreshUserDoc = async () => {
        await refetch();
    };

    const userDoc = useMemo<UserDocument | null>(() => {
        if (!session?.user) {
            return null;
        }

        const u = session.user as AuthSessionUser;
        const normalizedSubscriptionStatus = u.subscriptionStatus === 'cancelled'
            ? 'canceled'
            : (u.subscriptionStatus || 'none');

        return {
            uid: u.id,
            email: u.email,
            displayName: u.name,
            photoUrl: u.image || undefined,
            credits: u.credits ?? 0,
            subscription: {
                plan: u.plan || 'free',
                status: normalizedSubscriptionStatus,
                stripeCustomerId: u.stripeCustomerId || null,
                stripeSubscriptionId: u.stripeSubscriptionId || null,
                currentPeriodStart: u.currentPeriodStart ? new Date(u.currentPeriodStart) : null,
                currentPeriodEnd: u.currentPeriodEnd ? new Date(u.currentPeriodEnd) : null,
                cancelAtPeriodEnd: Boolean(u.cancelAtPeriodEnd),
            },
            usage: {
                totalGenerations: u.usageTotalGenerations ?? 0,
                monthlyGenerations: u.usageMonthlyGenerations ?? 0,
                lastGenerationAt: u.usageLastGenerationAt ? new Date(u.usageLastGenerationAt) : null,
                usageResetAt: u.usageResetAt ? new Date(u.usageResetAt) : undefined,
            },
            createdAt: u.createdAt ? new Date(u.createdAt) : undefined,
            updatedAt: u.updatedAt ? new Date(u.updatedAt) : undefined,
        } as UserDocument;
    }, [session]);

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


