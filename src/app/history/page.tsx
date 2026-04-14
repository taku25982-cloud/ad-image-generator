import HistoryPageClient from '@/components/history/HistoryPageClient';
import { getAdHistoriesByUserId } from '@/lib/history';
import { verifySession } from '@/lib/dal';
import { serializeAdHistories } from '@/lib/page-data/ad-history';

export default async function HistoryPage() {
    await verifySession();

    const histories = await getAdHistoriesByUserId();
    const initialHistories = serializeAdHistories(histories);

    return <HistoryPageClient initialHistories={initialHistories} />;
}
