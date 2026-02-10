// ========================================
// 広告テンプレート定義
// ========================================

export interface AdTemplate {
    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    thumbnail: string; // グラデーションCSS or 画像URL
    icon: string;
    format: string; // adFormatsのid
    presets: {
        tone: string;
        primaryColor: string;
        secondaryColor: string;
        catchCopy: string;
        description: string;
        targetAudience: string;
    };
    tags: string[];
    popular?: boolean;
    isNew?: boolean;
}

export type TemplateCategory =
    | 'ec'
    | 'food'
    | 'lifestyle'
    | 'tech'
    | 'fashion'
    | 'beauty'
    | 'fitness'
    | 'education'
    | 'travel'
    | 'business';

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string; icon: string }[] = [
    { id: 'ec', label: 'ECサイト', icon: '🛒' },
    { id: 'food', label: 'フード・飲料', icon: '🍽️' },
    { id: 'lifestyle', label: 'ライフスタイル', icon: '🏠' },
    { id: 'tech', label: 'テクノロジー', icon: '💻' },
    { id: 'fashion', label: 'ファッション', icon: '👗' },
    { id: 'beauty', label: 'ビューティー', icon: '💄' },
    { id: 'fitness', label: 'フィットネス', icon: '💪' },
    { id: 'education', label: '教育', icon: '📚' },
    { id: 'travel', label: '旅行', icon: '✈️' },
    { id: 'business', label: 'ビジネス', icon: '💼' },
];

export const AD_TEMPLATES: AdTemplate[] = [
    // ─── ECサイト ───
    {
        id: 'ec-flash-sale',
        name: 'タイムセール',
        description: '期間限定セールの緊急感を演出する広告テンプレート',
        category: 'ec',
        thumbnail: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)',
        icon: '⚡',
        format: 'instagram-story',
        presets: {
            tone: 'bold',
            primaryColor: '#FF416C',
            secondaryColor: '#FF4B2B',
            catchCopy: '【期間限定】タイムセール開催中！',
            description: '今だけの特別価格でお得にゲット。見逃すな！',
            targetAudience: 'お得な買い物を求めるオンラインショッピングユーザー',
        },
        tags: ['セール', '期間限定', 'EC'],
        popular: true,
    },
    {
        id: 'ec-new-arrival',
        name: '新商品発売',
        description: '新商品のローンチを華やかに告知するテンプレート',
        category: 'ec',
        thumbnail: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        icon: '🆕',
        format: 'instagram-feed',
        presets: {
            tone: 'modern',
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
            catchCopy: '「NEW ARRIVAL」ついに登場！',
            description: '全く新しい体験を。最新コレクションをチェックしよう。',
            targetAudience: 'トレンドに敏感な20〜30代',
        },
        tags: ['新商品', 'ローンチ', 'EC'],
        isNew: true,
    },
    {
        id: 'ec-review-highlight',
        name: 'レビュー訴求',
        description: 'お客様の声を活用した信頼性の高い広告テンプレート',
        category: 'ec',
        thumbnail: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        icon: '⭐',
        format: 'facebook-ad',
        presets: {
            tone: 'minimal',
            primaryColor: '#11998e',
            secondaryColor: '#38ef7d',
            catchCopy: '★4.8の高評価！ お客様のリアルな声',
            description: '10,000人以上に選ばれた理由がここにあります。',
            targetAudience: '品質重視で口コミを参考にする消費者',
        },
        tags: ['レビュー', '口コミ', 'EC'],
    },

    // ─── フード・飲料 ───
    {
        id: 'food-menu-promo',
        name: '新メニュー告知',
        description: '新メニューを美味しそうに紹介するテンプレート',
        category: 'food',
        thumbnail: 'linear-gradient(135deg, #f5af19 0%, #f12711 100%)',
        icon: '🍔',
        format: 'instagram-feed',
        presets: {
            tone: 'pop',
            primaryColor: '#f5af19',
            secondaryColor: '#f12711',
            catchCopy: '新メニュー登場！ この美味しさ、体験して',
            description: '厳選素材で仕上げた、自慢の一品をぜひお試しください。',
            targetAudience: 'グルメに興味がある20〜40代',
        },
        tags: ['フード', '新メニュー', 'レストラン'],
        popular: true,
    },
    {
        id: 'food-delivery',
        name: 'デリバリー',
        description: 'デリバリーサービスの利便性を訴求するテンプレート',
        category: 'food',
        thumbnail: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)',
        icon: '🛵',
        format: 'instagram-story',
        presets: {
            tone: 'modern',
            primaryColor: '#00b09b',
            secondaryColor: '#96c93d',
            catchCopy: '今すぐ注文、すぐにお届け！',
            description: 'お家にいながら、お店の味を楽しめます。初回注文15%OFF！',
            targetAudience: '忙しいビジネスパーソンや子育て世代',
        },
        tags: ['デリバリー', 'フード', 'クーポン'],
    },

    // ─── テクノロジー ───
    {
        id: 'tech-saas-launch',
        name: 'SaaSプロダクト',
        description: 'テック系プロダクトの洗練されたプロモーション',
        category: 'tech',
        thumbnail: 'linear-gradient(135deg, #0F2027 0%, #203A43 50%, #2C5364 100%)',
        icon: '🚀',
        format: 'twitter-post',
        presets: {
            tone: 'modern',
            primaryColor: '#2C5364',
            secondaryColor: '#0F2027',
            catchCopy: '業務を革新する。あなたのワークフローを次のレベルへ',
            description: 'クラウドベースの次世代ツールで生産性を最大200%向上。',
            targetAudience: 'スタートアップ創業者やプロダクトマネージャー',
        },
        tags: ['SaaS', 'テック', 'B2B'],
        popular: true,
    },
    {
        id: 'tech-app-download',
        name: 'アプリダウンロード',
        description: 'モバイルアプリのDL促進テンプレート',
        category: 'tech',
        thumbnail: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        icon: '📲',
        format: 'instagram-story',
        presets: {
            tone: 'modern',
            primaryColor: '#4facfe',
            secondaryColor: '#00f2fe',
            catchCopy: '無料ダウンロード！ 今すぐはじめよう',
            description: '累計100万ダウンロード突破。App Store & Google Playで配信中。',
            targetAudience: 'スマートフォンユーザー全般',
        },
        tags: ['アプリ', 'ダウンロード', 'モバイル'],
        isNew: true,
    },

    // ─── ファッション ───
    {
        id: 'fashion-seasonal',
        name: 'シーズンコレクション',
        description: '季節の新作コレクションを美しく演出するテンプレート',
        category: 'fashion',
        thumbnail: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
        icon: '👗',
        format: 'instagram-feed',
        presets: {
            tone: 'luxury',
            primaryColor: '#c471f5',
            secondaryColor: '#fa71cd',
            catchCopy: 'NEW SEASON COLLECTION',
            description: '最新トレンドを纏う。この季節だけの特別なスタイルを提案します。',
            targetAudience: 'ファッションに関心の高い20〜30代女性',
        },
        tags: ['ファッション', 'コレクション', 'シーズン'],
        popular: true,
    },
    {
        id: 'fashion-sale',
        name: 'ファッションセール',
        description: '最大70%OFFなどの大型セールを訴求するテンプレート',
        category: 'fashion',
        thumbnail: 'linear-gradient(135deg, #000000 0%, #434343 100%)',
        icon: '🏷️',
        format: 'instagram-story',
        presets: {
            tone: 'bold',
            primaryColor: '#000000',
            secondaryColor: '#D4AF37',
            catchCopy: 'FINAL SALE ─ 最大70%OFF',
            description: '人気アイテムが驚きの価格に。お見逃しなく。',
            targetAudience: 'お得にブランドアイテムを購入したい消費者',
        },
        tags: ['セール', 'ファッション', 'EC'],
    },

    // ─── ビューティー ───
    {
        id: 'beauty-skincare',
        name: 'スキンケア',
        description: '清潔感のあるスキンケア商品のプロモーション',
        category: 'beauty',
        thumbnail: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
        icon: '✨',
        format: 'instagram-feed',
        presets: {
            tone: 'minimal',
            primaryColor: '#fbc2eb',
            secondaryColor: '#a6c1ee',
            catchCopy: '素肌に自信を。',
            description: '天然由来成分95%配合。敏感肌にもやさしい処方のスキンケアシリーズ。',
            targetAudience: '美容に関心の高い20〜40代女性',
        },
        tags: ['スキンケア', 'ビューティー', 'コスメ'],
    },

    // ─── フィットネス ───
    {
        id: 'fitness-gym',
        name: 'ジム入会キャンペーン',
        description: 'パワフルでモチベーションを高めるジム広告',
        category: 'fitness',
        thumbnail: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
        icon: '🏋️',
        format: 'instagram-story',
        presets: {
            tone: 'bold',
            primaryColor: '#f7971e',
            secondaryColor: '#ffd200',
            catchCopy: '今日から変わる。新しい自分に会いに行こう',
            description: '入会金無料キャンペーン実施中！ プロトレーナーがあなたの目標達成をサポート。',
            targetAudience: '健康志向の20〜40代',
        },
        tags: ['フィットネス', 'ジム', 'キャンペーン'],
    },

    // ─── 教育 ───
    {
        id: 'education-online-course',
        name: 'オンラインコース',
        description: 'オンライン学習サービスの受講者募集テンプレート',
        category: 'education',
        thumbnail: 'linear-gradient(135deg, #5f72bd 0%, #9b23ea 100%)',
        icon: '📖',
        format: 'facebook-ad',
        presets: {
            tone: 'modern',
            primaryColor: '#5f72bd',
            secondaryColor: '#9b23ea',
            catchCopy: '今日から始める、未来への投資',
            description: 'プロの講師による実践的なカリキュラム。いつでもどこでも学べるオンラインスクール。',
            targetAudience: 'スキルアップを目指す社会人や学生',
        },
        tags: ['教育', 'オンライン学習', 'スクール'],
    },

    // ─── 旅行 ───
    {
        id: 'travel-resort',
        name: 'リゾート',
        description: '夢のような旅先を訴求する旅行広告テンプレート',
        category: 'travel',
        thumbnail: 'linear-gradient(135deg, #00c6fb 0%, #005bea 100%)',
        icon: '🏝️',
        format: 'instagram-story',
        presets: {
            tone: 'luxury',
            primaryColor: '#00c6fb',
            secondaryColor: '#005bea',
            catchCopy: '特別な場所で、特別な時間を。',
            description: '見たことのない青い海が待っている。今シーズンのベストリゾートをご紹介。',
            targetAudience: '旅行好きな20〜50代',
        },
        tags: ['旅行', 'リゾート', 'バカンス'],
        isNew: true,
    },

    // ─── ビジネス ───
    {
        id: 'business-seminar',
        name: 'セミナー・ウェビナー',
        description: 'ビジネスセミナーの集客用テンプレート',
        category: 'business',
        thumbnail: 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)',
        icon: '🎤',
        format: 'facebook-ad',
        presets: {
            tone: 'modern',
            primaryColor: '#1a2a6c',
            secondaryColor: '#fdbb2d',
            catchCopy: '無料ウェビナー開催！ 業界のトップが語る最新戦略',
            description: '限定100名。マーケティングの最先端を今すぐキャッチアップ。',
            targetAudience: '経営者・マーケティング担当者',
        },
        tags: ['セミナー', 'ウェビナー', 'B2B'],
    },

    // ─── ライフスタイル ───
    {
        id: 'lifestyle-subscription',
        name: 'サブスクリプション',
        description: '定期購入サービスの魅力を伝えるテンプレート',
        category: 'lifestyle',
        thumbnail: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        icon: '📦',
        format: 'instagram-feed',
        presets: {
            tone: 'cute',
            primaryColor: '#f093fb',
            secondaryColor: '#f5576c',
            catchCopy: '毎月届くワクワク。あなただけのキュレーション',
            description: 'プロが厳選したアイテムが毎月届く、新しいライフスタイル体験。初月50%OFF。',
            targetAudience: 'サブスクリプションサービスに興味がある20〜30代',
        },
        tags: ['サブスク', 'ライフスタイル', '定期購入'],
    },
];
