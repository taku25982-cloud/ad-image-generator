import { redirect } from 'next/navigation';
import HomePageClient from '@/components/home/HomePageClient';
import { getSession } from '@/lib/dal';

export default async function HomePage() {
    const session = await getSession();

    if (session?.user?.id) {
        redirect('/dashboard');
    }

    return <HomePageClient />;
}
