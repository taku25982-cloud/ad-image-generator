import { describe, expect, it } from 'vitest';
import { DEFAULT_FORM_DATA } from './ad-config/types';
import { applyInitialQueryPreset, getTemplateMappedPresetFormData } from './create-page';

describe('getTemplateMappedPresetFormData', () => {
    it('maps sale campaign template presets into unified form data', () => {
        const result = getTemplateMappedPresetFormData({
            objective: 'sale-campaign',
            presets: {
                catchCopy: '50% OFF',
                description: '春のキャンペーン',
                tone: 'bold',
                primaryColor: '#111111',
                secondaryColor: '#222222',
            },
        });

        expect(result.objective).toBe('sale-campaign');
        expect(result.discountInfo).toBe('50% OFF');
        expect(result.campaignTargets).toBe('春のキャンペーン');
        expect(result.tone).toBe('bold');
        expect(result.primaryColor).toBe('#111111');
        expect(result.secondaryColor).toBe('#222222');
    });
});

describe('applyInitialQueryPreset', () => {
    it('returns null when no preset data is present', () => {
        expect(applyInitialQueryPreset(DEFAULT_FORM_DATA, {})).toBeNull();
    });

    it('merges query values into form data and selection state', () => {
        const result = applyInitialQueryPreset(DEFAULT_FORM_DATA, {
            format: 'instagram-feed',
            brandKitId: 'brand-1',
            projectId: 'project-1',
            sourceGenerationId: 'generation-1',
            originType: 'variation',
            catchCopy: '期間限定',
            tone: 'luxury',
        });

        expect(result).toMatchObject({
            selectedFormat: 'instagram-feed',
            selectedBrandKitId: 'brand-1',
            selectedProjectId: 'project-1',
            sourceGenerationId: 'generation-1',
            originType: 'variation',
        });
        expect(result?.formData.catchCopy).toBe('期間限定');
        expect(result?.formData.tone).toBe('luxury');
        expect(result?.formData.autoColor).toBe(false);
    });
});
