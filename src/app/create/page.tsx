import CreatePageClient from '@/components/create/CreatePageClient';
import { verifySession } from '@/lib/dal';
import { getAdHistoriesByUserId } from '@/lib/history';
import {
    buildCreateInitialQuery,
    serializeBrandKits,
    serializeProjects,
} from '@/lib/page-data/create';
import { serializeAdHistories } from '@/lib/page-data/ad-history';
import { listBrandKitsForUser, listProjectsForUser } from '@/lib/phase1-server';

type CreatePageProps = {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CreatePage({ searchParams }: CreatePageProps) {
    const session = await verifySession();
    const userId = session.user.id;
    const resolvedSearchParams = searchParams ? await searchParams : {};

    const [brandKits, projects, histories] = await Promise.all([
        listBrandKitsForUser(userId),
        listProjectsForUser(userId),
        getAdHistoriesByUserId(),
    ]);

    const initialBrandKits = serializeBrandKits(brandKits);
    const initialProjects = serializeProjects(projects);
    const initialHistories = serializeAdHistories(histories);
    const initialQuery = buildCreateInitialQuery(resolvedSearchParams);

    return (
        <CreatePageClient
            initialBrandKits={initialBrandKits}
            initialProjects={initialProjects}
            initialHistories={initialHistories}
            initialQuery={initialQuery}
        />
    );
}
