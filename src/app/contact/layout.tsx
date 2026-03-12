import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'お問い合わせ | AI Generator',
    description: 'AI Generatorに関するお問い合わせはこちらから',
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
