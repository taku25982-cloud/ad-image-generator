export interface CreatePageInitialQuery {
    templateId?: string;
    templateFormat?: string;
    format?: string;
    brandKitId?: string;
    projectId?: string;
    originType?: string;
    sourceGenerationId?: string;
    productName?: string;
    catchCopy?: string;
    description?: string;
    targetAudience?: string;
    tone?: string;
    primaryColor?: string;
    secondaryColor?: string;
}

export interface CreatePageBrandKitItem {
    id: string;
    name: string;
    description?: string | null;
    primaryColor?: string | null;
    secondaryColor?: string | null;
    accentColor?: string | null;
    preferredTone?: string | null;
    defaultCopyRules?: string[] | null;
    negativeRules?: string[] | null;
    fontPreferences?: string[] | null;
    isDefault?: boolean;
}

export interface CreatePageProjectItem {
    id: string;
    name: string;
    description?: string | null;
    brandKitId?: string | null;
    status?: string;
    tags?: string[] | null;
}

type SearchParamValue = string | string[] | undefined;
type SearchParamRecord = Record<string, SearchParamValue>;

type BrandKitSource = Omit<CreatePageBrandKitItem, 'defaultCopyRules' | 'negativeRules' | 'fontPreferences'> & {
    defaultCopyRules?: unknown;
    negativeRules?: unknown;
    fontPreferences?: unknown;
};

type ProjectSource = Omit<CreatePageProjectItem, 'tags'> & {
    tags?: unknown;
};

export function getSingleValue(value: SearchParamValue) {
    return Array.isArray(value) ? value[0] : value;
}

export function normalizeStringArray(value: unknown): string[] | null {
    if (!Array.isArray(value)) {
        return null;
    }

    const normalized = value.filter((item): item is string => typeof item === 'string');
    return normalized.length > 0 ? normalized : null;
}

export function buildCreateInitialQuery(searchParams: SearchParamRecord): CreatePageInitialQuery {
    return {
        templateId: getSingleValue(searchParams.templateId),
        templateFormat: getSingleValue(searchParams.templateFormat),
        format: getSingleValue(searchParams.format),
        brandKitId: getSingleValue(searchParams.brandKitId),
        projectId: getSingleValue(searchParams.projectId),
        originType: getSingleValue(searchParams.originType),
        sourceGenerationId: getSingleValue(searchParams.sourceGenerationId),
        productName: getSingleValue(searchParams.productName),
        catchCopy: getSingleValue(searchParams.catchCopy),
        description: getSingleValue(searchParams.description),
        targetAudience: getSingleValue(searchParams.targetAudience),
        tone: getSingleValue(searchParams.tone),
        primaryColor: getSingleValue(searchParams.primaryColor),
        secondaryColor: getSingleValue(searchParams.secondaryColor),
    };
}

export function serializeBrandKits(items: BrandKitSource[]): CreatePageBrandKitItem[] {
    return items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        primaryColor: item.primaryColor,
        secondaryColor: item.secondaryColor,
        accentColor: item.accentColor,
        preferredTone: item.preferredTone,
        defaultCopyRules: normalizeStringArray(item.defaultCopyRules),
        negativeRules: normalizeStringArray(item.negativeRules),
        fontPreferences: normalizeStringArray(item.fontPreferences),
        isDefault: item.isDefault,
    }));
}

export function serializeProjects(items: ProjectSource[]): CreatePageProjectItem[] {
    return items.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        brandKitId: item.brandKitId,
        status: item.status,
        tags: normalizeStringArray(item.tags),
    }));
}
