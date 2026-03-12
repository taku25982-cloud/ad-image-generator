'use client';

import { useLoginModalStore } from '@/store/useLoginModalStore';
import React from 'react';

export function LoginButton({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    const { openModal } = useLoginModalStore();

    return (
        <button onClick={openModal} className={className}>
            {children}
        </button>
    );
}
