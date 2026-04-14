import { type AdObjectiveId, type UnifiedFormData, DEFAULT_FORM_DATA } from './ad-config/types';
import type { CreatePageInitialQuery } from './page-data/create';

interface TemplatePresetSource {
    objective?: string | null;
    customInstructions?: string | null;
    presets: {
        catchCopy?: string | null;
        description?: string | null;
        targetAudience?: string | null;
        tone?: string | null;
        primaryColor?: string | null;
        secondaryColor?: string | null;
    };
}

export function getTemplateMappedPresetFormData(template: TemplatePresetSource): UnifiedFormData {
    const objective = (template.objective as AdObjectiveId) || 'new-product';
    let mappedPresets: Partial<UnifiedFormData> = {};

    switch (objective) {
        case 'new-product':
            mappedPresets = { productName: '', catchCopy: template.presets.catchCopy || '', description: template.presets.description || '' };
            break;
        case 'sale-campaign':
            mappedPresets = { campaignName: '', discountInfo: template.presets.catchCopy || '', campaignTargets: template.presets.description || '' };
            break;
        case 'event-seminar':
            mappedPresets = { eventName: '', eventDateTime: '', eventLocation: '', eventContent: template.presets.description || '' };
            break;
        case 'recruitment':
            mappedPresets = { jobTitle: '', companyName: '', jobBenefits: `${template.presets.catchCopy || ''} ${template.presets.description || ''}`.trim(), jobRequirements: '' };
            break;
        case 'brand-awareness':
            mappedPresets = { brandName: '', brandMessage: template.presets.catchCopy || '', brandCoreValue: template.presets.description || '' };
            break;
        case 'app-install':
            mappedPresets = {
                appName: '',
                appFeatures: template.presets.description || '',
                appTargetUser: template.presets.targetAudience || '',
                appDownloadBenefit: template.presets.catchCopy || '',
            };
            break;
        case 'lead-generation':
            mappedPresets = { materialName: '', materialBenefits: template.presets.description || '', leadCallToAction: template.presets.catchCopy || '' };
            break;
        case 'store-visit':
            mappedPresets = { storeName: '', storeLocation: '', specialOffer: template.presets.catchCopy || '', signatureMenu: '' };
            break;
    }

    return {
        ...DEFAULT_FORM_DATA,
        objective,
        tone: template.presets.tone || 'modern',
        primaryColor: template.presets.primaryColor || '#FF6B35',
        secondaryColor: template.presets.secondaryColor || '#7C3AED',
        targetAudience: template.presets.targetAudience || '',
        customInstructions: template.customInstructions || '',
        ...mappedPresets,
    };
}

export function applyInitialQueryPreset(current: UnifiedFormData, initialQuery: CreatePageInitialQuery) {
    const fieldEntries = {
        productName: initialQuery.productName,
        catchCopy: initialQuery.catchCopy,
        description: initialQuery.description,
        targetAudience: initialQuery.targetAudience,
        tone: initialQuery.tone,
        primaryColor: initialQuery.primaryColor,
        secondaryColor: initialQuery.secondaryColor,
    };

    const hasPresetData = Object.values(fieldEntries).some((value) => Boolean(value)) || Boolean(initialQuery.format);
    if (!hasPresetData) {
        return null;
    }

    return {
        selectedFormat: initialQuery.format,
        selectedBrandKitId: initialQuery.brandKitId,
        selectedProjectId: initialQuery.projectId,
        sourceGenerationId: initialQuery.sourceGenerationId,
        originType: initialQuery.originType,
        formData: {
            ...current,
            productName: fieldEntries.productName || current.productName,
            catchCopy: fieldEntries.catchCopy || current.catchCopy,
            description: fieldEntries.description || current.description,
            targetAudience: fieldEntries.targetAudience || current.targetAudience,
            tone: fieldEntries.tone || current.tone,
            primaryColor: fieldEntries.primaryColor || current.primaryColor,
            secondaryColor: fieldEntries.secondaryColor || current.secondaryColor,
            autoColor: false,
        },
    };
}
