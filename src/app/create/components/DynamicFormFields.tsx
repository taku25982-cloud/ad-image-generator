'use client';

import { UnifiedFormData, AdObjectiveId } from '../types';

interface Props {
    objective: AdObjectiveId;
    formData: UnifiedFormData;
    onChange: (changes: Partial<UnifiedFormData>) => void;
}

export function DynamicFormFields({ objective, formData, onChange }: Props) {
    const handleChange = (field: keyof UnifiedFormData, value: string) => {
        onChange({ [field]: value });
    };

    switch (objective) {
        case 'new-product':
            return (
                <div className="space-y-4">
                    <Field
                        label="商品名・サービス名"
                        required
                        value={formData.productName}
                        onChange={(v) => handleChange('productName', v)}
                        placeholder="例：プレミアムヘッドフォン Pro X"
                    />
                    <Field
                        label="キャッチコピー"
                        value={formData.catchCopy}
                        onChange={(v) => handleChange('catchCopy', v)}
                        placeholder="例：音楽の新しい体験を。"
                    />
                    <TextAreaField
                        label="商品説明"
                        value={formData.description}
                        onChange={(v) => handleChange('description', v)}
                        placeholder="商品やサービスの特徴、アピールポイント"
                    />
                    <Field
                        label="ターゲット層"
                        value={formData.targetAudience}
                        onChange={(v) => handleChange('targetAudience', v)}
                        placeholder="例：20〜30代の音楽好きな女性"
                    />
                </div>
            );

        case 'sale-campaign':
            return (
                <div className="space-y-4">
                    <Field
                        label="セール名・キャンペーン名"
                        required
                        value={formData.campaignName}
                        onChange={(v) => handleChange('campaignName', v)}
                        placeholder="例：スプリングセール 2024"
                    />
                    <Field
                        label="特典・割引内容"
                        required
                        value={formData.discountInfo}
                        onChange={(v) => handleChange('discountInfo', v)}
                        placeholder="例：全品最大50%OFF"
                    />
                    <Field
                        label="期間"
                        value={formData.campaignPeriod}
                        onChange={(v) => handleChange('campaignPeriod', v)}
                        placeholder="例：4/1〜4/30まで"
                    />
                    <TextAreaField
                        label="対象商品・備考"
                        value={formData.campaignTargets}
                        onChange={(v) => handleChange('campaignTargets', v)}
                        placeholder="例：新作アパレル、アクセサリー全品（一部除外あり）"
                    />
                </div>
            );

        case 'event-seminar':
            return (
                <div className="space-y-4">
                    <Field
                        label="イベント名・セミナー名"
                        required
                        value={formData.eventName}
                        onChange={(v) => handleChange('eventName', v)}
                        placeholder="例：SNSマーケティング完全攻略セミナー"
                    />
                    <Field
                        label="開催日時"
                        value={formData.eventDateTime}
                        onChange={(v) => handleChange('eventDateTime', v)}
                        placeholder="例：2024年5月15日(水) 14:00〜16:00"
                    />
                    <Field
                        label="開催場所（またはURL）"
                        value={formData.eventLocation}
                        onChange={(v) => handleChange('eventLocation', v)}
                        placeholder="例：Zoomによるオンライン開催"
                    />
                    <TextAreaField
                        label="イベントの内容・対象者"
                        value={formData.eventContent}
                        onChange={(v) => handleChange('eventContent', v)}
                        placeholder="例：フォロワーを顧客に変える3つの戦略。SNS担当者必見。"
                    />
                </div>
            );

        case 'recruitment':
            return (
                <div className="space-y-4">
                    <Field
                        label="募集職種"
                        required
                        value={formData.jobTitle}
                        onChange={(v) => handleChange('jobTitle', v)}
                        placeholder="例：フロントエンドエンジニア"
                    />
                    <Field
                        label="会社名"
                        value={formData.companyName}
                        onChange={(v) => handleChange('companyName', v)}
                        placeholder="例：株式会社テックイノベーション"
                    />
                    <TextAreaField
                        label="福利厚生・アピールポイント"
                        value={formData.jobBenefits}
                        onChange={(v) => handleChange('jobBenefits', v)}
                        placeholder="例：フルリモート可、フレックス制、年間休日125日"
                    />
                    <TextAreaField
                        label="必須スキル・求める人物像"
                        value={formData.jobRequirements}
                        onChange={(v) => handleChange('jobRequirements', v)}
                        placeholder="例：Reactの実務経験3年以上"
                    />
                </div>
            );

        case 'brand-awareness':
            return (
                <div className="space-y-4">
                    <Field
                        label="ブランド名・企業名"
                        required
                        value={formData.brandName}
                        onChange={(v) => handleChange('brandName', v)}
                        placeholder="例：Natura Cosmetics"
                    />
                    <Field
                        label="ブランドメッセージ（キャッチコピー）"
                        value={formData.brandMessage}
                        onChange={(v) => handleChange('brandMessage', v)}
                        placeholder="例：自然の力で、あなたの本来の美しさを。"
                    />
                    <TextAreaField
                        label="コアバリュー・アピールポイント"
                        value={formData.brandCoreValue}
                        onChange={(v) => handleChange('brandCoreValue', v)}
                        placeholder="例：100%オーガニック成分、動物実験不参加のクルエルティフリー"
                    />
                </div>
            );

        case 'app-install':
            return (
                <div className="space-y-4">
                    <Field
                        label="アプリ名"
                        required
                        value={formData.appName}
                        onChange={(v) => handleChange('appName', v)}
                        placeholder="例：DietTracker Pro"
                    />
                    <TextAreaField
                        label="主要な機能・メリット"
                        value={formData.appFeatures}
                        onChange={(v) => handleChange('appFeatures', v)}
                        placeholder="例：簡単食事記録、AIカロリー計算、専属コーチのフィードバック"
                    />
                    <Field
                        label="ターゲットOS・端末"
                        value={formData.targetOS}
                        onChange={(v) => handleChange('targetOS', v)}
                        placeholder="例：iOS / Android 対応"
                    />
                </div>
            );

        case 'lead-generation':
            return (
                <div className="space-y-4">
                    <Field
                        label="資料名・特典名"
                        required
                        value={formData.materialName}
                        onChange={(v) => handleChange('materialName', v)}
                        placeholder="例：BtoB営業DX虎の巻 2024年版"
                    />
                    <TextAreaField
                        label="得られるメリット・内容"
                        value={formData.materialBenefits}
                        onChange={(v) => handleChange('materialBenefits', v)}
                        placeholder="例：商談化率を3倍にする最新ツールの活用法を大公開"
                    />
                    <Field
                        label="ターゲット（おすすめの対象者）"
                        value={formData.targetAudience}
                        onChange={(v) => handleChange('targetAudience', v)}
                        placeholder="例：営業責任者、マーケティング担当者"
                    />
                </div>
            );

        case 'store-visit':
            return (
                <div className="space-y-4">
                    <Field
                        label="店舗名"
                        required
                        value={formData.storeName}
                        onChange={(v) => handleChange('storeName', v)}
                        placeholder="例：Cafe & Roastery 恵比寿"
                    />
                    <Field
                        label="店舗の場所・アクセス"
                        value={formData.storeLocation}
                        onChange={(v) => handleChange('storeLocation', v)}
                        placeholder="例：恵比寿駅西口から徒歩3分"
                    />
                    <Field
                        label="看板メニュー・目玉商品"
                        value={formData.signatureMenu}
                        onChange={(v) => handleChange('signatureMenu', v)}
                        placeholder="例：自家焙煎のスペシャリティコーヒーと季節のタルト"
                    />
                    <Field
                        label="来店特典（任意）"
                        value={formData.specialOffer}
                        onChange={(v) => handleChange('specialOffer', v)}
                        placeholder="例：Instagram見たでドリンクサイズアップ無料！"
                    />
                </div>
            );

        // フォールバック
        default:
            return (
                <p className="text-sm text-gray-500">
                    目的を選択してください
                </p>
            );
    }
}

// ----------------------------------------------------
// UI Components
// ----------------------------------------------------

function Field({
    label,
    required,
    value,
    onChange,
    placeholder
}: {
    label: string;
    required?: boolean;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                required={required}
            />
        </div>
    );
}

function TextAreaField({
    label,
    required,
    value,
    onChange,
    placeholder
}: {
    label: string;
    required?: boolean;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <textarea
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none"
                required={required}
            />
        </div>
    );
}
