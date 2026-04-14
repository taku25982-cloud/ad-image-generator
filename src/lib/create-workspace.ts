export interface BrandKitDraft {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    preferredTone: string;
}

export interface ProjectDraft {
    name: string;
    description: string;
}

export function buildBrandKitRequestPayload(draft: BrandKitDraft, isDefault: boolean) {
    return {
        name: draft.name,
        primaryColor: draft.primaryColor,
        secondaryColor: draft.secondaryColor,
        preferredTone: draft.preferredTone,
        isDefault,
    };
}

export function buildProjectRequestPayload(draft: ProjectDraft, selectedBrandKitId: string) {
    return {
        name: draft.name,
        description: draft.description,
        brandKitId: selectedBrandKitId || null,
    };
}

export function getWorkspaceErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

export function buildGeneratedAssetFileName(format: string, now = Date.now()) {
    return `ad-${format}-${now}.png`;
}
