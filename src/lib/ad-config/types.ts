// ==========================================
// 広告の目的（カテゴリ）の定義
// ==========================================
export const AD_OBJECTIVES = [
    {
        id: 'new-product',
        category: 'product',
        name: '新商品・サービス紹介',
        icon: '✨',
        description: '新しくリリースする商品やサービスの特徴をアピールします。',
    },
    {
        id: 'sale-campaign',
        category: 'campaign',
        name: 'セール・キャンペーン告知',
        icon: '🎉',
        description: '期間限定のセールや割引キャンペーンでお得感を訴求します。',
    },
    {
        id: 'event-seminar',
        category: 'event',
        name: 'イベント・セミナー集客',
        icon: '📅',
        description: 'ウェビナーやオフラインイベントへの参加を促します。',
    },
    {
        id: 'recruitment',
        category: 'hr',
        name: '採用・求人募集',
        icon: '🤝',
        description: '一緒に働く仲間を募集するための広告を作成します。',
    },
    {
        id: 'brand-awareness',
        category: 'brand',
        name: 'ブランド認知・PR',
        icon: '💎',
        description: '企業のビジョンやブランド価値を伝え、ファンを増やします。',
    },
    {
        id: 'app-install',
        category: 'app',
        name: 'アプリインストール促進',
        icon: '📱',
        description: 'スマートフォンアプリのダウンロードを促します。',
    },
    {
        id: 'lead-generation',
        category: 'b2b',
        name: 'リード獲得・資料請求',
        icon: '📝',
        description: 'BtoB向けのホワイトペーパーや資料ダウンロードを促します。',
    },
    {
        id: 'store-visit',
        category: 'local',
        name: '実店舗への来店促進',
        icon: '🏪',
        description: 'カフェや美容室、アパレルなど、実店舗への来店を促します。',
    }
] as const;

export type AdObjectiveId = typeof AD_OBJECTIVES[number]['id'];

// ==========================================
// 入力フォームの共通型定義 (Unified)
// 全オブジェクトに対応するためのプロパティをすべてオプショナルで持たせる
// ==========================================
export type UnifiedFormData = {
    objective: string;

    // --- 各目的に対応するフィールド ---

    // A. 新商品・サービス紹介
    productName: string;
    price: string;
    catchCopy: string;
    description: string;
    targetAudience: string;

    // B. セール・キャンペーン告知
    campaignName: string;      // (ex: ProductName の代わり/併用)
    discountInfo: string;      // 特典・割引内容 (ex: 50%OFF)
    campaignPeriod: string;    // 期間
    campaignTargets: string;   // 対象商品

    // C. イベント・セミナー集客
    eventName: string;         // イベント名
    eventDateTime: string;     // 開催日時
    eventLocation: string;     // 開催場所
    eventContent: string;      // イベント内容

    // D. 採用・求人募集
    jobTitle: string;          // 募集職種
    companyName: string;       // 会社名
    jobBenefits: string;       // 福利厚生/アピールポイント
    jobRequirements: string;   // 必須スキル

    // E. ブランド認知・PR
    brandName: string;         // ブランド/企業名
    brandMessage: string;      // ブランドメッセージ
    brandCoreValue: string;    // コアバリュー

    // F. アプリインストール促進
    appName: string;           // アプリ名
    appFeatures: string;       // 主要機能
    appTargetUser: string;     // 想定ユーザー
    appDownloadBenefit: string;// DL促進ポイント

    // G. リード獲得・資料請求
    materialName: string;      // 資料名
    materialBenefits: string;  // 得られるメリット
    leadCallToAction: string;  // 行動喚起

    // H. 実店舗への来店促進
    storeName: string;         // 店舗名
    storeLocation: string;     // 店舗の場所・アクセス
    signatureMenu: string;     // 看板メニュー/サービス
    specialOffer: string;      // 来店特典

    // --- スタイル共通 ---
    customInstructions: string;
    tone: string;
    primaryColor: string;
    secondaryColor: string;
    autoColor: boolean;
};

// ==========================================
// デフォルト値
// ==========================================
export const DEFAULT_FORM_DATA: UnifiedFormData = {
    objective: 'new-product',

    productName: '',
    price: '',
    catchCopy: '',
    description: '',
    targetAudience: '',

    campaignName: '',
    discountInfo: '',
    campaignPeriod: '',
    campaignTargets: '',

    eventName: '',
    eventDateTime: '',
    eventLocation: '',
    eventContent: '',

    jobTitle: '',
    companyName: '',
    jobBenefits: '',
    jobRequirements: '',

    brandName: '',
    brandMessage: '',
    brandCoreValue: '',

    appName: '',
    appFeatures: '',
    appTargetUser: '',
    appDownloadBenefit: '',

    materialName: '',
    materialBenefits: '',
    leadCallToAction: '',

    storeName: '',
    storeLocation: '',
    signatureMenu: '',
    specialOffer: '',

    customInstructions: '',
    tone: 'modern',
    primaryColor: '#FF6B35',
    secondaryColor: '#7C3AED',
    autoColor: true,
};
