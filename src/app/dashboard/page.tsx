import DashboardHomeClient from '@/components/dashboard/DashboardHomeClient';
import { getAdHistoriesByUserId } from '@/lib/history';
import { verifySession } from '@/lib/dal';
import { serializeAdHistories } from '@/lib/page-data/ad-history';

export default async function DashboardPage() {
    await verifySession();

    const histories = await getAdHistoriesByUserId();
    const initialRecentProjects = serializeAdHistories(histories.slice(0, 6));

    return <DashboardHomeClient initialRecentProjects={initialRecentProjects} />;
}
