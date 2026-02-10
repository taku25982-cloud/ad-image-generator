// ========================================
// 広告生成関連の型定義
// ========================================

import type { Timestamp } from 'firebase/firestore';

// 広告フォーマット
export interface AdFormat {
    type: string;
    name: string;
    category: FormatCategory;
    platform: string;
    width: number;
    height: number;
    aspectRatio: string;
    description?: string;
}

export type FormatCategory = 'sns' | 'ec' | 'banner' | 'other';

// テンプレート
export interface Template {
    templateId: string;
    name: string;
    description: string;
    category: TemplateCategory;
    thumbnailUrl: string;
    previewUrls: string[];
    supportedFormats: string[];
    promptTemplate: string;
    styleKeywords: string[];
    isActive: boolean;
    order: number;
}

export type TemplateCategory = 'modern' | 'pop' | 'luxury' | 'minimal' | 'natural' | 'tech';

// 生成コンテンツ入力
export interface GenerationContent {
    productName: string;
    catchphrase: string;
    description?: string;
    targetAudience?: string;
    tone?: ToneType;
    cta?: string;
    price?: string;
}

export type ToneType = 'premium' | 'casual' | 'professional' | 'playful' | 'elegant' | 'bold';

// ブランディング入力
export interface Branding {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
}

// 生成リクエスト
export interface GenerationRequest {
    templateId: string;
    format: AdFormat;
    content: GenerationContent;
    branding?: Branding;
    productImageUrl?: string;
}

// 生成結果（Firestoreドキュメント）
export interface Generation {
    generationId: string;
    userId: string;
    imageUrl: string;
    thumbnailUrl: string;
    format: AdFormat;
    templateId: string;
    templateName: string;
    content: GenerationContent;
    branding?: Branding;
    productImageUrl?: string;
    prompt: string;
    editHistory: EditHistoryItem[];
    status: GenerationStatus;
    creditsUsed: number;
    expiresAt: Timestamp | null;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface EditHistoryItem {
    editId: string;
    editType: EditType;
    instruction: string;
    resultImageUrl: string;
    createdAt: Timestamp;
}

export type EditType = 'text_change' | 'color_adjust' | 'style_change' | 'element_remove';
export type GenerationStatus = 'processing' | 'completed' | 'failed';

// 編集リクエスト
export interface EditRequest {
    generationId: string;
    editType: EditType;
    instruction: string;
}
