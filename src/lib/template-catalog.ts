import { AD_FORMATS, type AdFormatId } from '@/lib/ad-formats';
import {
    AD_TEMPLATES,
    TEMPLATE_CATEGORIES,
    type AdTemplate,
    type TemplateCategory,
    type TemplateFieldPreview,
    type TemplateSampleInput,
} from '@/lib/templates';

export type TemplateUseCase =
    | 'new-arrival'
    | 'sale'
    | 'campaign'
    | 'lead-gen'
    | 'event'
    | 'recruitment'
    | 'branding'
    | 'app-growth'
    | 'store-visit';

export interface TemplateEditProfile {
    score: number;
    textSwap: boolean;
    colorSwap: boolean;
    imageSwap: boolean;
    layoutAdjustment: boolean;
    label: string;
}

export interface EnrichedAdTemplate extends AdTemplate {
    industries: string[];
    useCases: TemplateUseCase[];
    recommendedInputs: string[];
    supportedFormats: AdFormatId[];
    editProfile: TemplateEditProfile;
    sampleInput: TemplateSampleInput;
    searchTokens: string[];
    performanceSeed: number;
    createdFromTemplateId?: string;
    isCustom?: boolean;
}

export interface TemplateLibraryStats {
    opens: number;
    creates: number;
    favorites: number;
    customizations: number;
    engagedUsers?: number;
    conversionRate?: number;
    favoriteRate?: number;
    momentumScore?: number;
    lastUsedAt?: string;
}

export const USE_CASE_LABELS: Record<TemplateUseCase, string> = {
    'new-arrival': '新商品告知',
    sale: 'セール',
    campaign: 'キャンペーン',
    'lead-gen': '資料請求・CV',
    event: 'イベント',
    recruitment: '採用',
    branding: 'ブランド訴求',
    'app-growth': 'アプリ訴求',
    'store-visit': '来店促進',
};

const CATEGORY_INDUSTRIES: Record<TemplateCategory, string[]> = {
    ec: ['EC', 'D2C', '小売'],
    food: ['飲食', '食品', '外食'],
    lifestyle: ['ライフスタイル', 'インテリア', '日用品'],
    tech: ['SaaS', 'IT', 'アプリ'],
    fashion: ['ファッション', 'アパレル', 'ブランド'],
    beauty: ['美容', 'コスメ', 'サロン'],
    fitness: ['フィットネス', '健康', 'ジム'],
    education: ['教育', 'スクール', '講座'],
    travel: ['旅行', '観光', 'ホテル'],
    business: ['B2B', 'セミナー', '採用'],
};

const OBJECTIVE_USE_CASES: Record<string, TemplateUseCase[]> = {
    'new-product': ['new-arrival'],
    'sale-campaign': ['sale', 'campaign'],
    'event-seminar': ['event'],
    recruitment: ['recruitment'],
    'brand-awareness': ['branding'],
    'app-install': ['app-growth'],
    'lead-generation': ['lead-gen'],
    'store-visit': ['store-visit'],
};

const OBJECTIVE_INPUTS: Record<string, string[]> = {
    'new-product': ['商品名', 'キャッチコピー', '商品の魅力'],
    'sale-campaign': ['キャンペーン名', '割引情報', '訴求ポイント'],
    'event-seminar': ['イベント名', '日時', '開催場所'],
    recruitment: ['募集職種', '会社名', '求人メリット'],
    'brand-awareness': ['ブランド名', 'メッセージ', '世界観'],
    'app-install': ['アプリ名', '機能の魅力', 'DLする理由'],
    'lead-generation': ['資料名', '提供価値', 'CTA'],
    'store-visit': ['店舗名', '場所', '来店特典'],
};

const OBJECTIVE_SAMPLE_INPUTS: Record<string, TemplateSampleInput> = {
    'new-product': {
        productName: '新商品名',
        price: '¥2,980',
        catchCopy: 'いま注目の新作を体験',
        description: '特徴がひと目で伝わる説明文',
    },
    'sale-campaign': {
        campaignName: '春の限定セール',
        discountInfo: '最大30%OFF',
        campaignTargets: '人気商品を今だけ特別価格で',
    },
    'event-seminar': {
        eventName: '無料ウェビナー',
        eventDateTime: '4/25 19:00〜',
        eventLocation: 'オンライン開催',
        eventContent: '90分で最新事例を学べます',
    },
    recruitment: {
        jobTitle: 'UIデザイナー募集',
        companyName: 'Sample Inc.',
        jobBenefits: 'フルリモート・副業可',
    },
    'brand-awareness': {
        brandName: 'ブランド名',
        brandMessage: 'この一言で世界観を伝える',
        brandCoreValue: 'らしさを短く説明する文章',
    },
    'app-install': {
        appName: 'AppName',
        appFeatures: '最短3分で使い始められる',
        appDownloadBenefit: '今すぐ無料で体験',
    },
    'lead-generation': {
        materialName: '無料チェックリスト',
        materialBenefits: '5分で課題が整理できる',
        leadCallToAction: '今すぐ受け取る',
    },
    'store-visit': {
        storeName: '店舗名',
        storeLocation: '渋谷駅から徒歩3分',
        specialOffer: '来店で1品無料',
    },
};

const CATEGORY_SUPPORTED_FORMATS: Record<TemplateCategory, AdFormatId[]> = {
    ec: ['instagram-feed', 'instagram-story', 'ec-banner', 'product-image'],
    food: ['instagram-feed', 'instagram-story', 'facebook-ad'],
    lifestyle: ['instagram-feed', 'instagram-story', 'facebook-ad'],
    tech: ['instagram-feed', 'facebook-ad', 'google-display', 'youtube-thumbnail'],
    fashion: ['instagram-feed', 'instagram-story', 'facebook-ad'],
    beauty: ['instagram-feed', 'instagram-story', 'facebook-ad'],
    fitness: ['instagram-feed', 'instagram-story', 'facebook-ad'],
    education: ['facebook-ad', 'instagram-story', 'google-display'],
    travel: ['instagram-feed', 'instagram-story', 'facebook-ad'],
    business: ['facebook-ad', 'google-display', 'instagram-feed'],
};

const CATEGORY_EDIT_PROFILE: Record<TemplateCategory, TemplateEditProfile> = {
    ec: { score: 88, textSwap: true, colorSwap: true, imageSwap: true, layoutAdjustment: false, label: '差し替えに強い' },
    food: { score: 72, textSwap: true, colorSwap: true, imageSwap: true, layoutAdjustment: true, label: '微調整向き' },
    lifestyle: { score: 76, textSwap: true, colorSwap: true, imageSwap: true, layoutAdjustment: true, label: '雰囲気維持型' },
    tech: { score: 84, textSwap: true, colorSwap: true, imageSwap: false, layoutAdjustment: false, label: 'テキスト変更に強い' },
    fashion: { score: 68, textSwap: true, colorSwap: true, imageSwap: true, layoutAdjustment: true, label: 'ビジュアル重視' },
    beauty: { score: 70, textSwap: true, colorSwap: true, imageSwap: true, layoutAdjustment: true, label: '色替えしやすい' },
    fitness: { score: 74, textSwap: true, colorSwap: true, imageSwap: true, layoutAdjustment: true, label: '訴求替え向き' },
    education: { score: 90, textSwap: true, colorSwap: true, imageSwap: false, layoutAdjustment: false, label: '量産向き' },
    travel: { score: 66, textSwap: true, colorSwap: true, imageSwap: true, layoutAdjustment: true, label: '写真差し替え向き' },
    business: { score: 92, textSwap: true, colorSwap: true, imageSwap: false, layoutAdjustment: false, label: '編集耐性が高い' },
};

export const INDUSTRY_OPTIONS = Array.from(
    new Set(AD_TEMPLATES.flatMap((template) => CATEGORY_INDUSTRIES[template.category]))
).sort((a, b) => a.localeCompare(b, 'ja'));

export const USE_CASE_OPTIONS = Object.entries(USE_CASE_LABELS).map(([id, label]) => ({
    id: id as TemplateUseCase,
    label,
}));

const SEARCH_SYNONYMS: Record<string, string[]> = {
    飲食: ['フード', '食品', '外食', 'カフェ', 'レストラン', '居酒屋', 'グルメ'],
    美容: ['コスメ', 'サロン', 'スキンケア', 'メイク', '美容室'],
    ファッション: ['アパレル', '服', 'コーデ', 'ブランド'],
    教育: ['スクール', '講座', '学習', '教材', 'セミナー'],
    旅行: ['観光', 'ホテル', '旅', '宿泊'],
    ビジネス: ['b2b', '法人', '会社向け', '採用', '営業'],
    ec: ['通販', 'ネットショップ', 'オンライン販売', 'd2c'],
    sale: ['セール', '割引', 'キャンペーン', '期間限定', 'off', '特価'],
    branding: ['ブランディング', '世界観', '認知', 'ブランド訴求'],
    'lead-gen': ['資料請求', '問い合わせ', 'cv', 'コンバージョン', 'リード'],
    pop: ['ポップ', 'カジュアル', '元気', '明るい'],
    luxury: ['高級感', 'ラグジュアリー', '上品', 'リッチ'],
    minimal: ['ミニマル', 'シンプル', 'すっきり'],
    modern: ['モダン', 'スタイリッシュ', '都会的'],
    bold: ['ボールド', '大胆', 'インパクト', '強め'],
    warm: ['温かい', 'あたたかみ', 'やわらかい', '親しみ'],
    red: ['赤', '赤系', 'レッド'],
    blue: ['青', '青系', 'ブルー'],
    yellow: ['黄色', '黄', 'イエロー'],
    green: ['緑', '緑系', 'グリーン', 'ナチュラル'],
    purple: ['紫', 'パープル'],
    orange: ['オレンジ', '橙'],
    textswap: ['文字差し替え', 'テキスト差し替え', '文言変更', 'コピー変更'],
    colorswap: ['色替え', 'カラー変更', '配色変更'],
    imageswap: ['画像差し替え', '写真差し替え', '商品画像変更'],
    layoutadjustment: ['レイアウト調整', '微調整', '配置変更'],
};

const SEARCH_CANONICAL_MAP = Object.entries(SEARCH_SYNONYMS).reduce<Record<string, string>>((acc, [canonical, synonyms]) => {
    acc[canonical.toLowerCase()] = canonical.toLowerCase();
    for (const synonym of synonyms) {
        acc[synonym.toLowerCase()] = canonical.toLowerCase();
    }
    return acc;
}, {});

function unique<T>(values: T[]): T[] {
    return Array.from(new Set(values));
}

function tokenizeQuery(value: string): string[] {
    return value
        .toLowerCase()
        .replace(/[、。,.!?:/\\()[\]{}]/g, ' ')
        .split(/\s+/)
        .filter(Boolean);
}

function normalizeSearchToken(token: string) {
    return SEARCH_CANONICAL_MAP[token.toLowerCase()] || token.toLowerCase();
}

function expandSearchTokens(tokens: string[]) {
    const expanded = new Set<string>();

    for (const token of tokens) {
        const normalized = normalizeSearchToken(token);
        expanded.add(normalized);

        const synonyms = SEARCH_SYNONYMS[normalized];
        if (synonyms) {
            synonyms.forEach((synonym) => expanded.add(synonym.toLowerCase()));
        }
    }

    return Array.from(expanded);
}

function getColorFamilyTokens(hex: string) {
    const normalized = hex.trim().toLowerCase();
    if (!/^#?[0-9a-f]{6}$/.test(normalized)) {
        return [];
    }

    const value = normalized.replace('#', '');
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);

    if (r >= g && r >= b) {
        if (g > 150) return ['orange', 'yellow'];
        if (b > 120) return ['purple'];
        return ['red'];
    }
    if (g >= r && g >= b) {
        if (r > 160) return ['yellow', 'green'];
        return ['green'];
    }
    if (b >= r && b >= g) {
        if (r > 140) return ['purple'];
        return ['blue'];
    }

    return [];
}

function buildTemplateSearchTokens(template: AdTemplate, industries: string[], useCases: TemplateUseCase[], supportedFormats: AdFormatId[]) {
    const categoryLabel = TEMPLATE_CATEGORIES.find((category) => category.id === template.category)?.label || '';
    const editProfile = CATEGORY_EDIT_PROFILE[template.category];

    return unique([
        template.name,
        template.description,
        ...template.tags,
        ...industries,
        template.objective || '',
        ...useCases,
        ...useCases.map((useCase) => USE_CASE_LABELS[useCase]),
        categoryLabel,
        template.presets.tone,
        template.presets.catchCopy,
        template.presets.targetAudience,
        editProfile.label,
        ...(editProfile.textSwap ? ['textswap'] : []),
        ...(editProfile.colorSwap ? ['colorswap'] : []),
        ...(editProfile.imageSwap ? ['imageswap'] : []),
        ...(editProfile.layoutAdjustment ? ['layoutadjustment'] : []),
        ...getColorFamilyTokens(template.presets.primaryColor),
        ...getColorFamilyTokens(template.presets.secondaryColor),
        ...supportedFormats.map((formatId) => AD_FORMATS.find((format) => format.id === formatId)?.name || formatId),
    ])
        .filter(Boolean)
        .flatMap((token) => {
            const normalized = normalizeSearchToken(token);
            const synonyms = SEARCH_SYNONYMS[normalized] || [];
            return unique([token.toLowerCase(), normalized, ...synonyms.map((item) => item.toLowerCase())]);
        });
}

function buildSampleInput(template: AdTemplate): TemplateSampleInput {
    return {
        ...OBJECTIVE_SAMPLE_INPUTS[template.objective || 'new-product'],
        catchCopy: template.presets.catchCopy,
        description: template.presets.description,
        targetAudience: template.presets.targetAudience,
    };
}

export function enrichTemplate(template: AdTemplate): EnrichedAdTemplate {
    const industries = CATEGORY_INDUSTRIES[template.category];
    const useCases = OBJECTIVE_USE_CASES[template.objective || 'new-product'] || ['new-arrival'];
    const recommendedInputs = OBJECTIVE_INPUTS[template.objective || 'new-product'] || OBJECTIVE_INPUTS['new-product'];
    const supportedFormats = unique([
        template.format as AdFormatId,
        ...(CATEGORY_SUPPORTED_FORMATS[template.category] || []),
    ]);
    const searchTokens = buildTemplateSearchTokens(template, industries, useCases, supportedFormats);

    return {
        ...template,
        industries,
        useCases,
        recommendedInputs,
        supportedFormats,
        editProfile: CATEGORY_EDIT_PROFILE[template.category],
        sampleInput: buildSampleInput(template),
        searchTokens,
        performanceSeed: (template.popular ? 30 : 0) + (template.isNew ? 10 : 0) + (template.isPremium ? 5 : 0),
    };
}

export const TEMPLATE_CATALOG: EnrichedAdTemplate[] = AD_TEMPLATES.map(enrichTemplate);

export function getTemplateById(templateId: string, customTemplates: EnrichedAdTemplate[] = []): EnrichedAdTemplate | null {
    return [...customTemplates, ...TEMPLATE_CATALOG].find((template) => template.id === templateId) || null;
}

export function buildTemplatePreviewFields(template: EnrichedAdTemplate, sampleInput: TemplateSampleInput): TemplateFieldPreview[] {
    const input = { ...template.sampleInput, ...sampleInput };

    const objectiveFields: Record<string, TemplateFieldPreview[]> = {
        'new-product': [
            { label: '商品名', value: input.productName || '商品名' },
            { label: 'キャッチコピー', value: input.catchCopy || template.presets.catchCopy },
            { label: '説明', value: input.description || template.presets.description, kind: 'textarea' },
        ],
        'sale-campaign': [
            { label: 'キャンペーン名', value: input.campaignName || 'キャンペーン名' },
            { label: 'オファー', value: input.discountInfo || template.presets.catchCopy },
            { label: '訴求内容', value: input.campaignTargets || template.presets.description, kind: 'textarea' },
        ],
        'event-seminar': [
            { label: 'イベント名', value: input.eventName || 'イベント名' },
            { label: '日時', value: input.eventDateTime || '日時' },
            { label: '場所', value: input.eventLocation || '場所' },
        ],
        recruitment: [
            { label: '募集職種', value: input.jobTitle || '募集職種' },
            { label: '会社名', value: input.companyName || '会社名' },
            { label: 'メリット', value: input.jobBenefits || template.presets.catchCopy, kind: 'textarea' },
        ],
        'brand-awareness': [
            { label: 'ブランド名', value: input.brandName || 'ブランド名' },
            { label: 'メッセージ', value: input.brandMessage || template.presets.catchCopy },
            { label: 'ブランド価値', value: input.brandCoreValue || template.presets.description, kind: 'textarea' },
        ],
        'app-install': [
            { label: 'アプリ名', value: input.appName || 'アプリ名' },
            { label: '便益', value: input.appDownloadBenefit || template.presets.catchCopy },
            { label: '主要機能', value: input.appFeatures || template.presets.description, kind: 'textarea' },
        ],
        'lead-generation': [
            { label: '資料名', value: input.materialName || '資料名' },
            { label: 'CTA', value: input.leadCallToAction || template.presets.catchCopy },
            { label: '受け取る価値', value: input.materialBenefits || template.presets.description, kind: 'textarea' },
        ],
        'store-visit': [
            { label: '店舗名', value: input.storeName || '店舗名' },
            { label: '場所', value: input.storeLocation || '場所' },
            { label: '特典', value: input.specialOffer || template.presets.catchCopy },
        ],
    };

    return objectiveFields[template.objective || 'new-product'] || objectiveFields['new-product'];
}

export function scoreTemplateForQuery(template: EnrichedAdTemplate, query: string): number {
    const tokens = tokenizeQuery(query);
    if (tokens.length === 0) {
        return template.performanceSeed;
    }

    const expandedTokens = expandSearchTokens(tokens);
    const haystack = template.searchTokens.map((token) => token.toLowerCase());
    const normalizedQuery = expandedTokens.join(' ');

    const tokenScore = expandedTokens.reduce((score, token) => {
        const normalized = normalizeSearchToken(token);
        const exact = haystack.some((part) => part === normalized || part === token) ? 12 : 0;
        const partial = haystack.some((part) => part.includes(normalized) || part.includes(token)) ? 5 : 0;
        return score + exact + partial;
    }, template.performanceSeed);

    let intentBonus = 0;
    if (normalizedQuery.includes('textswap') && template.editProfile.textSwap) {
        intentBonus += 14;
    }
    if (normalizedQuery.includes('colorswap') && template.editProfile.colorSwap) {
        intentBonus += 12;
    }
    if (normalizedQuery.includes('imageswap') && template.editProfile.imageSwap) {
        intentBonus += 12;
    }
    if (normalizedQuery.includes('layoutadjustment') && template.editProfile.layoutAdjustment) {
        intentBonus += 10;
    }
    if (normalizedQuery.includes('sale') && template.useCases.includes('sale')) {
        intentBonus += 10;
    }
    if (normalizedQuery.includes('branding') && template.useCases.includes('branding')) {
        intentBonus += 10;
    }
    if (normalizedQuery.includes(normalizeSearchToken(template.presets.tone))) {
        intentBonus += 8;
    }

    return tokenScore + intentBonus;
}

export function getPerformanceScore(template: EnrichedAdTemplate, stats?: TemplateLibraryStats): number {
    if (!stats) {
        return template.performanceSeed;
    }

    const conversionBonus = Math.round((stats.conversionRate || 0) * 40);
    const favoriteBonus = Math.round((stats.favoriteRate || 0) * 30);
    const engagedUserBonus = (stats.engagedUsers || 0) * 3;
    const momentumBonus = stats.momentumScore || 0;

    return template.performanceSeed
        + stats.opens
        + stats.creates * 10
        + stats.favorites * 12
        + stats.customizations * 14
        + conversionBonus
        + favoriteBonus
        + engagedUserBonus
        + momentumBonus;
}
