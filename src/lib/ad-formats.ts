export const AD_FORMATS = [
    {
        id: 'instagram-story',
        name: 'Instagram ストーリー',
        size: '1080×1920',
        icon: '📱',
        category: 'SNS',
    },
    {
        id: 'instagram-feed',
        name: 'Instagram 投稿',
        size: '1080×1080',
        icon: '📸',
        category: 'SNS',
    },
    {
        id: 'facebook-ad',
        name: 'Facebook 広告',
        size: '1200×628',
        icon: '👥',
        category: 'SNS',
    },
    {
        id: 'twitter-post',
        name: 'X (Twitter) 投稿',
        size: '1200×675',
        icon: '🐦',
        category: 'SNS',
    },
    {
        id: 'youtube-thumbnail',
        name: 'YouTube サムネイル',
        size: '1280×720',
        icon: '▶️',
        category: 'SNS',
    },
    {
        id: 'google-display',
        name: 'Google ディスプレイ',
        size: '300×250',
        icon: '🌐',
        category: 'バナー',
    },
    {
        id: 'ec-banner',
        name: 'ECバナー',
        size: '728×90',
        icon: '🛒',
        category: 'EC',
    },
    {
        id: 'product-image',
        name: '商品画像',
        size: '800×800',
        icon: '🎁',
        category: 'EC',
    },
] as const;

export type AdFormatId = (typeof AD_FORMATS)[number]['id'];

export const FORMAT_PACKS = [
    {
        id: 'single',
        name: '選択フォーマットのみ',
        description: '今選んだ媒体サイズだけ生成します',
        formatIds: [] as AdFormatId[],
    },
    {
        id: 'social-starter',
        name: 'SNSスターター',
        description: 'Instagram投稿、ストーリー、Facebook広告をまとめて作ります',
        formatIds: ['instagram-feed', 'instagram-story', 'facebook-ad'] as AdFormatId[],
    },
    {
        id: 'social-wide',
        name: 'SNS拡張セット',
        description: 'Instagram、Facebook、X、YouTubeまでまとめて展開します',
        formatIds: ['instagram-feed', 'instagram-story', 'facebook-ad', 'twitter-post', 'youtube-thumbnail'] as AdFormatId[],
    },
    {
        id: 'commerce',
        name: 'EC販促セット',
        description: '商品画像、ECバナー、Instagram投稿をまとめて作ります',
        formatIds: ['product-image', 'ec-banner', 'instagram-feed'] as AdFormatId[],
    },
] as const;

export type FormatPackId = (typeof FORMAT_PACKS)[number]['id'];

export function getAdFormatById(formatId: string | null | undefined) {
    return AD_FORMATS.find((format) => format.id === formatId) || null;
}

export function getFormatPackById(packId: string | null | undefined) {
    return FORMAT_PACKS.find((pack) => pack.id === packId) || FORMAT_PACKS[0];
}
