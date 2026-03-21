// ========================================
// 広告テンプレート定義
// ========================================


export interface AdTemplate {
    objective?: string;

    id: string;
    name: string;
    description: string;
    category: TemplateCategory;
    thumbnail: string; // グラデーションCSS or 画像URL
    icon: string;
    format: string; // adFormatsのid
    isPremium: boolean; // trueの場合は有料プランのみ利用可能
    customInstructions: string;
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

export interface TemplateFieldPreview {
    label: string;
    value: string;
    kind?: 'text' | 'textarea' | 'helper';
}

export interface TemplateSampleInput {
    productName?: string;
    price?: string;
    campaignName?: string;
    discountInfo?: string;
    campaignPeriod?: string;
    campaignTargets?: string;
    eventName?: string;
    eventDateTime?: string;
    eventLocation?: string;
    eventContent?: string;
    jobTitle?: string;
    companyName?: string;
    jobBenefits?: string;
    jobRequirements?: string;
    brandName?: string;
    brandMessage?: string;
    brandCoreValue?: string;
    appName?: string;
    appFeatures?: string;
    appTargetUser?: string;
    appDownloadBenefit?: string;
    materialName?: string;
    materialBenefits?: string;
    leadCallToAction?: string;
    targetAudience?: string;
    storeName?: string;
    storeLocation?: string;
    signatureMenu?: string;
    specialOffer?: string;
    customInstructions?: string;
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

type AdTemplateSeed = Omit<AdTemplate, 'customInstructions'>;

type TemplateCreativeProfile = {
    hero: string;
    scene: string;
    composition: string;
    textPlacement: string;
    avoid: string;
};

const OBJECTIVE_DIRECTIVES: Record<string, string> = {
    'new-product': '新しさと魅力の初速を作る広告として、商品またはサービスの価値が3秒以内に伝わる構図にする。説明は詰め込みすぎず、第一印象で欲しくなる見せ方を優先する。',
    'sale-campaign': '割引率・期間限定感・今行動する理由を明確にし、迷う余地を減らす。価格訴求や特典の優先度を高くして、緊急性を視覚化する。',
    'event-seminar': '開催情報を見やすく整理しつつ、参加するメリットが先に伝わる構成にする。日時や場所は情報ブロックとして視認しやすくまとめる。',
    'recruitment': '企業の雰囲気と条件の魅力を両立させ、応募後の働くイメージが浮かぶ見せ方にする。信頼感と前向きな勢いを同時に出す。',
    'brand-awareness': '短期的な刈り取りではなく、世界観と記憶定着を目的にする。コピー、ビジュアル、余白でブランドらしさを丁寧に伝える。',
    'app-install': 'ダウンロード後の体験が想像できるように、機能より便益を優先して見せる。アプリ画面の雰囲気やスマートさを感じさせることを重視する。',
    'lead-generation': '無料資料や特典を受け取る合理性を強く見せ、CTAまでの心理的障壁を低くする。専門性とわかりやすさの両立を意識する。',
    'store-visit': '実際に足を運んだときの魅力や空気感が伝わるように、店舗体験を想起させる。アクセス性や特典があれば行動に結びつく見せ方にする。',
};

const CATEGORY_DIRECTIVES: Record<TemplateCategory, string> = {
    ec: 'EC向けなので、商品価値・価格メリット・購買導線の3点を明快に整理し、一覧面でも比較されやすい視認性を意識する。',
    food: '食の温度感や香りが想像できるように、シズル感・湯気・質感・照りを重視する。食欲を削ぐ寒色の使いすぎは避ける。',
    lifestyle: '暮らしに溶け込む空気感と上質な情緒を優先し、押し売り感よりも共感で惹きつけるビジュアルにする。',
    tech: '先進性、信頼感、スマートさを出しながら、情報整理は冷静に行う。UIやデバイスの表現は未来感があっても読みやすさを崩さない。',
    fashion: 'シルエット、素材感、ムードを主役にし、余白やトリミングでブランド感を強く出す。安っぽい大量装飾は避ける。',
    beauty: '肌・質感・光のコントロールを丁寧に行い、清潔感と憧れを両立する。彩度は高くても濁らせない。',
    fitness: '身体の動きや達成感を感じる構図にし、エネルギーと信頼感を同時に出す。アクション感を持たせつつ煩雑にはしない。',
    education: '学習後の変化や獲得できる価値が伝わるように、知的で整理されたトーンにする。CTAは安心して踏める信頼設計にする。',
    travel: 'その場の空気感や非日常の魅力を大きく見せ、行きたくなる情景を優先する。文字が景色を壊さないようレイアウトする。',
    business: '信頼感、専門性、意思決定しやすい情報整理を最優先にし、BtoBでも硬すぎず洗練された印象に仕上げる。',
};

const TEMPLATE_CREATIVE_PROFILES: Record<string, TemplateCreativeProfile> = {
    'ec-flash-sale': {
        hero: 'セール対象を象徴する商品群を一つの世界観でまとめたヒーロービジュアル',
        scene: '値引きの勢いが伝わる高コントラスト背景の前に、主役商品を大きく1群だけ見せる',
        composition: '割引情報を最上位、商品群を中央主役、期間とCTAを終点にまとめる',
        textPlacement: '割引率は最も目立つ位置、期間はその近く、CTAは画面終端に固定する',
        avoid: '複数テイストの商品を雑多にコラージュしない。値札やバッジを乱立させない。',
    },
    'ec-new-arrival': {
        hero: '新作商品単体または同シリーズ1点を主役にしたクリーンな商品ビジュアル',
        scene: '新作の質感が読み取れる明快な背景と柔らかな光',
        composition: '商品を主役面の中心に置き、新作感を出すコピーを周辺の余白に整理する',
        textPlacement: '商品名かキャッチコピーを主見出し、価格と短い補足を下位にまとめる',
        avoid: '旧作比較のような複数商品並列や、背景小物の置きすぎを避ける。',
    },
    'ec-review-highlight': {
        hero: '高評価レビューの対象商品1点を信頼感ある角度で見せたビジュアル',
        scene: '余計な装飾を抑えたクリーン背景に、満足感が伝わるハイライト処理',
        composition: '商品主役、評価やレビュー要約を補助情報として近接配置する',
        textPlacement: '評価・信頼指標は商品近くにまとめ、ブランド名は主張しすぎず添える',
        avoid: 'レビューカードの乱立、星の過剰装飾、複数ユーザー写真のコラージュを避ける。',
    },
    'ec-bundle-deal': {
        hero: 'セット販売の価値がひと目で分かる関連商品3点以内のまとまり',
        scene: '同一世界観でそろえた商品セットを整然と並べたビジュアル',
        composition: 'セット商品を中央に、まとめ買いメリットを大見出しで上位に置く',
        textPlacement: '割引訴求を主見出し、セット内容の補足は短く1ブロックにまとめる',
        avoid: '商品点数を増やしすぎて散漫にしない。関係ない小物を混ぜない。',
    },
    'ec-premium-product': {
        hero: '高単価商品の素材感と存在感が伝わる単体ヒーローショット',
        scene: '暗部と繊細なハイライトで質感を際立たせる上質な背景',
        composition: '商品輪郭を最大の見せ場にし、文字は周辺余白に控えめに置く',
        textPlacement: '商品名を主見出し、価格は格を保ちながら近くに添える',
        avoid: '安っぽいセール装飾、過剰な光彩、複数商品の混在を避ける。',
    },
    'food-menu-promo': {
        hero: '看板メニュー1品を食欲が最も湧く角度で切り取ったシズル写真',
        scene: '湯気、照り、ソースの質感が伝わる寄り気味のフードビジュアル',
        composition: '料理を画面の大半に使い、料理名や価格は読みやすく寄せて配置する',
        textPlacement: '新登場訴求を上位、商品名を最も大きく、価格は近接配置する',
        avoid: '料理を複数皿並べすぎない。不要な食器や背景小物で視線を散らさない。',
    },
    'food-delivery': {
        hero: '配達される人気メニュー1セットを清潔感高く見せるフードビジュアル',
        scene: 'デリバリーの利便性が伝わる整頓された食卓またはボックス周辺',
        composition: '料理を主役、初回特典を上位、配達エリアや補足を下位に整理する',
        textPlacement: 'オファーは大きく、店名と対応エリアは短いブロックでまとめる',
        avoid: 'アプリ画面、マップ、料理写真を同時に詰め込まない。',
    },
    'food-cafe': {
        hero: '代表ドリンクとスイーツ1セットを雰囲気込みで見せるカフェシーン',
        scene: '自然光ややわらかな影で、居心地のよさが伝わる空間',
        composition: 'メニュー主役、店の空気感を後景、来店理由を文字で補う',
        textPlacement: '店名か訴求コピーを上位、特典やアクセスは下位にコンパクトに置く',
        avoid: '店内の情報量を増やしすぎて、肝心のメニュー主役が弱くならないようにする。',
    },
    'food-healthy': {
        hero: 'ヘルシーさとおいしさが同時に伝わる料理または素材中心のビジュアル',
        scene: '自然素材、みずみずしさ、清潔感が伝わる明るい食卓シーン',
        composition: '主役料理または素材を中央に、ブランドメッセージを余白に乗せる',
        textPlacement: 'ブランドメッセージを上位、価値訴求は短い補足に絞る',
        avoid: 'サプリ広告のような無機質表現や、健康情報の文字詰め込みを避ける。',
    },
    'tech-saas-launch': {
        hero: 'SaaSの主要画面を核にした洗練されたプロダクトヒーロー',
        scene: 'ダッシュボードやUIカードを1つの主役画面として見せる近未来的背景',
        composition: 'プロダクト画面を主役、便益コピーを対向配置、価格やCTAを終点に置く',
        textPlacement: '便益見出しを最上位、サービス名と価格はその近くに整然と並べる',
        avoid: '複数UIをモザイク状に並べない。細かな表や数字だらけにしない。',
    },
    'tech-app-download': {
        hero: 'スマホ画面1枚と利用イメージ1つで成立するアプリ体験ビジュアル',
        scene: 'アプリ画面が読み取れる近景と、軽い発光表現のあるクリーン背景',
        composition: 'スマホ画面を中央主役、便益見出しを周辺余白、CTAを終点に置く',
        textPlacement: 'DLメリットを主見出し、アプリ名を第2階層、補足は最小限にする',
        avoid: '複数端末の乱立、機能箇条書きの羅列、アプリアイコンの多用を避ける。',
    },
    'tech-ai-product': {
        hero: 'AIらしさよりも実用価値が伝わる1画面または1デバイスの主役表現',
        scene: '先進感のある光やグリッドを後景に、UIやデバイスを明確に見せる',
        composition: '主役となる画面またはデバイスを大きく1つ、説明は周辺に整理する',
        textPlacement: '便益訴求を主見出し、商品名や価格は近接配置して整理する',
        avoid: '抽象的なAIイメージばかりで実体が見えない表現を避ける。',
    },
    'fashion-seasonal': {
        hero: 'シーズン感が伝わるスタイリング1体または1コーデ',
        scene: '季節の光や空気感がわかる上品な背景の中で衣服のシルエットを見せる',
        composition: 'コーデ全体を主役、コピーは余白に乗せ、情報は最小限に整理する',
        textPlacement: 'シーズンコピーを主見出し、ブランドや価格は小さく添える',
        avoid: 'モデルを複数人入れすぎない。背景演出で服の輪郭を埋もれさせない。',
    },
    'fashion-sale': {
        hero: 'セール対象の主力アイテム1〜2点または1スタイリング',
        scene: '高コントラスト背景で値引きの強さが映えるファッションビジュアル',
        composition: 'セール訴求を最上位、商品またはモデルを中央主役に据える',
        textPlacement: 'OFF率やSALE訴求を最も大きく、補足は短く一箇所にまとめる',
        avoid: '価格札、ステッカー、装飾文字を大量に重ねない。',
    },
    'fashion-streetwear': {
        hero: 'ブランドムードを象徴する1スタイルの人物またはアイテム',
        scene: '都会的でエッジのある背景の中に、1つの強い存在感を立てる',
        composition: '主役人物かアイテムを大胆にトリミングし、文字は片側に寄せる',
        textPlacement: 'ブランドネームまたは主コピーを大きく1塊で置く',
        avoid: 'ストリート小物の盛り込みすぎ、複数人物の雑多な配置を避ける。',
    },
    'beauty-skincare': {
        hero: 'スキンケア商品1本または1セットを肌感とともに見せるビジュアル',
        scene: '透明感、うるおい、清潔感が伝わる明るい背景と柔らかな反射',
        composition: '商品を明確な主役にし、コピーは余白に繊細に配置する',
        textPlacement: '便益コピーを上位、商品名や価格はその周辺に整えて置く',
        avoid: '成分アイコンや説明テキストを詰め込みすぎない。',
    },
    'beauty-makeup': {
        hero: '代表色が伝わるコスメ1点または使用イメージ1つ',
        scene: '発色と質感が美しく出る近景、鏡面やパウダー感を活かした背景',
        composition: 'コスメ主役、色の魅力を視覚中心に見せ、文字は端に整理する',
        textPlacement: '商品名や訴求コピーを主見出し、価格は控えめに添える',
        avoid: '多色を全部見せようとして散漫にしない。複数商品を乱雑に置かない。',
    },
    'beauty-salon': {
        hero: '施術後の上質感が伝わる人物またはサロン空間の主役カット',
        scene: '清潔感と高級感のあるサロン空間、やわらかな光、落ち着いた背景',
        composition: '人物または空間を主役、店名と来店メリットを整然と置く',
        textPlacement: 'サロン名または来店訴求を上位、特典や場所は下位に置く',
        avoid: '情報カードを増やしすぎない。施術前後比較の強すぎる演出を避ける。',
    },
    'fitness-gym': {
        hero: '運動中の躍動感が出る1人の人物または主要マシンと人物の組み合わせ',
        scene: '強い光と陰影でエネルギーが出るジム空間',
        composition: '人物を主役、成果や入会訴求を太い見出しで支える',
        textPlacement: '主訴求を上位、ジム名や特典は下位にコンパクトに置く',
        avoid: '複数マシンや複数人物を詰め込んで雑然とさせない。',
    },
    'fitness-yoga': {
        hero: '静かな集中や伸びやかさが伝わる1ポーズの人物',
        scene: '自然光やニュートラル背景で心地よさが伝わるスタジオ空間',
        composition: '人物を大きく1人だけ見せ、コピーは呼吸できる余白に置く',
        textPlacement: '体験価値を上位、スタジオ名や補足を小さく整える',
        avoid: 'フィットネスジム風の激しい装飾や、複数ポーズの並列を避ける。',
    },
    'fitness-supplement': {
        hero: 'サプリ商品1点とトレーニング文脈が自然につながるビジュアル',
        scene: '商品パッケージの質感が読める近景に、軽い運動文脈を後景で添える',
        composition: '商品を主役にし、効能感ではなく成果イメージを文字で補う',
        textPlacement: '商品名や便益を上位、価格や購入動機を下位に整理する',
        avoid: '医薬品的な過剰表現、成分表の羅列、人物と商品の主役競合を避ける。',
    },
    'education-online-course': {
        hero: '受講後の成長イメージが伝わるPC画面や学習シーン1つ',
        scene: '知的で整然としたワークスペース、ノートPCや教材を最小限に見せる',
        composition: '得られる成果を最上位、講座名を補強し、CTAを終点に置く',
        textPlacement: 'メリット見出しを最大、講座名と補足は近接配置する',
        avoid: '教材やアイコンを大量に並べない。情報商材感の強すぎる装飾を避ける。',
    },
    'education-language': {
        hero: '語学学習の前向きさが伝わる人物1人または学習画面1つ',
        scene: '明るく親しみやすい学習環境、会話や発話を想起させる軽い動き',
        composition: '人物か画面を主役、学習メリットを大きく、補足を最小限にする',
        textPlacement: '始めやすさや成果を主見出し、講座名は第2階層に置く',
        avoid: '国旗やアイコンを多用しすぎて子どもっぽくしない。',
    },
    'education-programming': {
        hero: '成長やキャリア変化が想像できるPC画面と人物1人の学習シーン',
        scene: 'モダンなデスク環境で、コード画面は情報過多にせず雰囲気程度に見せる',
        composition: '成果訴求を最上位、講座名やロードマップ名を補完情報にする',
        textPlacement: '転職や成長メリットを主見出し、講座名はその近くに置く',
        avoid: 'コードを細かく読ませる構成、画面要素の詰め込みを避ける。',
    },
    'travel-resort': {
        hero: '泊まりたくなる主景観またはリゾート空間1つのヒーローショット',
        scene: '空、海、建築、光が美しく調和する非日常の情景',
        composition: '景観を主役に広く見せ、文字は景色を邪魔しない余白帯に置く',
        textPlacement: 'リゾート名や訴求コピーを上位、補足は最小限にする',
        avoid: '観光地写真のコラージュや、情報過多な旅程案内を避ける。',
    },
    'travel-domestic': {
        hero: '国内旅行の季節感や気軽さが伝わる景色または旅体験1シーン',
        scene: '日本らしい情景や季節の魅力が伝わる明るい風景',
        composition: '景色を主役に、キャンペーン訴求を視認しやすく重ねる',
        textPlacement: 'キャンペーン名を上位、特典や時期は短く下位にまとめる',
        avoid: '複数の観光地写真を並べてパンフレット調にしない。',
    },
    'business-seminar': {
        hero: '登壇や学びの価値が伝わるビジネスイベントの象徴的シーン1つ',
        scene: 'ステージ、会場、スライド、参加者の熱量が伝わる洗練背景',
        composition: '参加メリットを主見出し、イベント名と開催情報を整理ブロック化する',
        textPlacement: 'メリット見出しを最大、日時場所は1ブロックに集約する',
        avoid: '登壇者写真やロゴを多数並べて雑誌面のようにしない。',
    },
    'business-recruitment': {
        hero: '働く姿が前向きに見える人物1人または少人数チームの自然なシーン',
        scene: '清潔でモダンなオフィス、前向きな表情、現代的な業務空間',
        composition: '職種訴求を上位、働く雰囲気を主役画として見せる',
        textPlacement: '募集職種を主見出し、会社名や魅力を下位に整理する',
        avoid: '社員集合写真の詰め込み、福利厚生文言の羅列を避ける。',
    },
    'business-consulting': {
        hero: '課題整理と解決の信頼感が伝わるBtoB向け資料・相談イメージ',
        scene: 'シンプルなチャートや会議資料を背景にした落ち着いたビジネス空間',
        composition: '得られる価値を最上位、資料名や無料訴求を支える構成にする',
        textPlacement: 'メリット見出しを最大、資料名とCTAを明確に分けて置く',
        avoid: 'グラフや数表を細かく詰め込み、読む前提のデザインにしない。',
    },
    'lifestyle-subscription': {
        hero: '定期便で届く代表アイテム1箱または1セットの開封体験ビジュアル',
        scene: '暮らしの中で箱を開ける喜びが伝わる、明るく整った生活空間',
        composition: 'ボックスまたはセット商品を主役、ワクワク感をコピーで支える',
        textPlacement: '体験価値を上位、初回特典や補足は下位にまとめる',
        avoid: 'アイテム点数を増やしすぎて福袋のように散らかさない。',
    },
    'lifestyle-interior': {
        hero: '家具1点または空間の主役になる1コーナーの完成ビジュアル',
        scene: '余白を活かした整った室内で、素材感やフォルムが映える光',
        composition: '家具を主役に広く見せ、文字は上下いずれかの余白帯に置く',
        textPlacement: '暮らしの提案コピーを上位、商品名や価格は控えめに置く',
        avoid: '生活小物を増やしすぎて家具の輪郭を埋もれさせない。',
    },
    'lifestyle-pet': {
        hero: 'ペットと商品またはペット単体の愛着が伝わる主役カット',
        scene: '清潔であたたかな家庭空間の中で、安心感があるライフスタイルシーン',
        composition: 'ペットの表情か商品を主役にし、愛情訴求をやさしく支える',
        textPlacement: '価値訴求を上位、商品名や価格は下位にやわらかく整理する',
        avoid: 'ペット用品や小物を散らかして画面を雑然とさせない。',
    },
};

const AD_CREATIVE_BEST_PRACTICES = [
    '広告として最初の1秒で理解できるよう、主役は一つに絞り、複数の主役候補を競合させない。',
    '文字量は必要最小限に抑え、主見出し、補助説明、CTAの3階層以内で整理する。',
    '画像はコラージュ感のない一体感ある1シーンとして仕上げ、無関係な複数写真の寄せ集めにしない。',
    'ブランド、商品、オファーのうち何を主役にするかを明確にし、その役割がひと目で分かる構図にする。',
    '完成画は毎回同じテンプレート言語で再現できるよう、光、角度、余白、文字位置のルールを安定させる。',
];

function toneDirective(tone: string): string {
    const directives: Record<string, string> = {
        bold: 'タイポグラフィは太め、コントラストは強め、視線誘導は一直線で構築する。勢いと即時理解を最優先にする。',
        modern: '余白と整列をきれいに使い、滑らかで洗練されたUIライクな印象を作る。情報は整理されていて未来感がある状態にする。',
        minimal: '要素数を絞り、余白で高級感を作る。色数も抑え、視線が散らない静かな強さを出す。',
        warm: '温度を感じる色の重なりとやわらかな光で親近感を出す。安心感のある優しい階調を選ぶ。',
        pop: '明るい配色、はっきりした形、大きめのアクセントで楽しさを出す。ただし子どもっぽくなりすぎないよう整理する。',
        clean: '清潔感を損なわない明度管理を行い、白場や薄い面を活かしてすっきり見せる。',
        professional: '信頼感のある整然とした組版にし、情報の強弱が論理的に見えるようにする。',
        elegant: '線を細く、余白を広めに取り、上品な階調と落ち着いたコントラストでまとめる。',
        friendly: 'やわらかい形状、親しみやすい見出し、読みやすい余白設計で心理的距離を縮める。',
        luxury: '暗部または深みのあるベースに金属感やハイライトを丁寧に差し込み、派手すぎない高級感を作る。',
        energetic: '動きのある斜線やリズム感のあるレイアウトで、活力を感じる画面にする。',
        trustworthy: '青系や整列感を活かし、誇張しすぎず誠実で安定した印象にまとめる。',
        natural: '自然光のような柔らかさ、オーガニックな色調、素材感の残る表現でまとめる。',
    };

    return directives[tone] || '要素の整理と可読性を優先し、意図の伝わる広告として完成度高く仕上げる。';
}

function strictLayoutDirective(format: string): string {
    void format;
    return '選択されたフォーマットの縦横比に合わせて主役、コピー、補助情報、CTAの領域を再配分し、どの媒体でも主役が最初に伝わる構図にする。要素を中央に漫然と並べず、視線の入口、情報理解、行動喚起の順に流れる設計を守る。';
}

function textHierarchyDirective(objective: string, format: string): string {
    void format;
    const base = '文字は最大でも3階層までに制限し、見出し、補助説明、CTAの順に明確な強弱をつける。小さな枠でも成立するよう、主見出し1塊、補助1塊、CTA1塊を基本に情報を整理する。';

    const byObjective: Record<string, string> = {
        'new-product': '新商品系は商品名またはサービス名を最上位、キャッチコピーを第2階層、価格や説明を第3階層にする。説明文は1〜2文相当までに抑え、商品の魅力が先に伝わるようにする。',
        'sale-campaign': 'セール系は割引情報を最上位、期間を第2階層、対象商品や備考を第3階層にする。見出しよりも割引率や特典が弱く見えないようにする。',
        'event-seminar': 'イベント系は参加メリットを最上位、イベント名を第2階層、日時・場所を整理情報として第3階層に置く。日時と場所は別々に散らさず一つの情報ブロックにまとめる。',
        'recruitment': '採用系は職種名を最上位、働く魅力を第2階層、条件やスキルを第3階層にする。文字が多くなりやすいので箇条書き風の短い塊で処理する。',
        'brand-awareness': 'ブランド系はブランドメッセージを最上位、ブランド名を第2階層、価値観や補足を第3階層にする。情報量より余韻と記憶定着を優先する。',
        'app-install': 'アプリ系は体験便益を最上位、アプリ名を第2階層、主要機能やDL特典を第3階層にする。機能一覧を長文で並べず、体験イメージを損なわない密度にする。',
        'lead-generation': 'リード獲得系は得られる価値を最上位、資料名や特典名を第2階層、CTAを第3階層ではなく視線導線の終点として独立させる。',
        'store-visit': '来店促進系は来店理由または看板訴求を最上位、店舗名を第2階層、アクセスと特典を第3階層にする。店舗名よりも行きたくなる理由が弱くならないようにする。',
    };

    return `${base} ${byObjective[objective] || '情報の優先順位を明確にし、同じ強さの文字要素を複数並べない。'}`;
}

function colorControlDirective(primaryColor: string, secondaryColor: string, tone: string): string {
    const toneModifier: Record<string, string> = {
        luxury: '暗部を深く保ち、ハイライトは細く鋭く使う。',
        minimal: '白場や無彩色の呼吸を残し、色面を増やしすぎない。',
        pop: '高彩度でも面数を増やしすぎず、主色と差し色の役割を厳密に分ける。',
        bold: '明暗差を強め、見出し周りのコントラストを最優先する。',
    };

    return `色は ${primaryColor} を主役面・見出し強調・大きな背景面に、${secondaryColor} を補助面・CTA・アクセントに限定して使う。第三の強い色は追加せず、白・淡色・黒系の中立色で呼吸を作る。${toneModifier[tone] || '色の役割を混在させず、どの面が主役か一目で分かる配色にする。'}`;
}

function spacingDirective(format: string): string {
    void format;
    return 'ブロック間の余白量を揃え、詰まった箇所とスカスカな箇所を作らない。フォーマットが変わっても、文字塊と主役ビジュアルの間には十分な抜けを残し、端ギリギリまで重要要素を押し込まない。';
}

function getTemplateCreativeProfile(template: AdTemplateSeed): TemplateCreativeProfile {
    return TEMPLATE_CREATIVE_PROFILES[template.id] || {
        hero: '訴求の中心になる主役要素を1つに絞ったヒーロービジュアル',
        scene: '商品や便益の魅力が最も伝わる一貫した背景とライティング',
        composition: '主役、見出し、補助説明、CTAが競合しない整理された構図',
        textPlacement: '主見出しを最も目立たせ、補助説明とCTAを階層的に配置する',
        avoid: '複数主役の競合、コラージュ感、過密な情報配置を避ける。',
    };
}

function buildTemplateCustomInstructions(template: AdTemplateSeed): string {
    const { presets } = template;
    const profile = getTemplateCreativeProfile(template);

    return [
        `テンプレート「${template.name}」専用のビジュアル設計として扱う。${template.description}`,
        `メインコピーは「${presets.catchCopy}」。説明文は「${presets.description}」の要旨だけを抽出し、詰め込みすぎず視認性を守る。`,
        '特定の媒体名に引っ張られず、現在選択されているフォーマットの縦横比と表示環境に最適化したレイアウトにする。媒体が変わっても訴求の核と世界観が崩れない設計を優先する。',
        OBJECTIVE_DIRECTIVES[template.objective || 'new-product'] || '目的に合った訴求順で情報を整理する。',
        CATEGORY_DIRECTIVES[template.category],
        toneDirective(presets.tone),
        strictLayoutDirective(template.format),
        textHierarchyDirective(template.objective || 'new-product', template.format),
        `このテンプレートの主役は「${profile.hero}」。背景や演出は「${profile.scene}」を基準に組み立てる。`,
        `構図は「${profile.composition}」を必ず守る。テキスト配置は「${profile.textPlacement}」を基準にし、毎回大きく方向を変えない。`,
        `フォント設計は見出しを最も太く大きく、補助説明はその60〜70%程度、注意書きや条件はさらに小さくする。見出しは最大2行、補助説明は最大3行までを目安にし、極端な長文組みは避ける。`,
        colorControlDirective(presets.primaryColor, presets.secondaryColor, presets.tone),
        `背景は単色で終わらせず、${presets.primaryColor} と ${presets.secondaryColor} のグラデーション、ぼかし面、光のにじみ、薄いハイライトで奥行きを作る。ただし背景演出は主役と文字の可読性を邪魔しない後景として扱う。`,
        spacingDirective(template.format),
        `主役ビジュアルは画面の55〜70%程度を占める存在感で見せる。主役が人物なら顔や視線の方向、商品なら輪郭と質感、風景なら奥行きが一目で伝わる角度を選び、複数の主役候補を並立させない。`,
        `広告クリエイティブの共通原則として、${AD_CREATIVE_BEST_PRACTICES.join(' ')}`,
        `テンプレートの想定ターゲットは「${presets.targetAudience}」。この層が好む質感、言葉づかい、色の温度感、情報密度に合わせて最終トーンを微調整する。`,
        `CTAや訴求バッジを置く場合は、必ず視線導線の終点にまとめる。CTAを中央付近に浮かせず、見出しと同じ強さにしない。セール系は緊急性、ブランド系は世界観、リード系は信頼感を優先する。`,
        `禁止事項として、安っぽいストック感、読めない極細文字、色数過多、要素の過密配置、中央寄せしすぎによる単調な構図、コントラスト不足、影のかけすぎ、テンプレートの世界観を壊す過剰装飾は避ける。特に「${profile.avoid}」は厳守する。`,
    ].join('\n');
}

export function getTemplateFieldPreviews(template: AdTemplate): TemplateFieldPreview[] {
    const objective = template.objective;
    const { catchCopy, description, targetAudience } = template.presets;

    switch (objective) {
        case 'new-product':
            return [
                { label: 'キャッチコピー', value: catchCopy },
                { label: '商品説明', value: description, kind: 'textarea' },
                { label: 'ターゲット層', value: targetAudience, kind: 'helper' },
            ];
        case 'sale-campaign':
            return [
                { label: '特典・割引内容', value: catchCopy },
                { label: '対象商品・備考', value: description, kind: 'textarea' },
                { label: 'ターゲット層の参考', value: targetAudience, kind: 'helper' },
            ];
        case 'event-seminar':
            return [
                { label: 'イベント訴求コピー', value: catchCopy },
                { label: 'イベントの内容・対象者', value: description, kind: 'textarea' },
                { label: '想定参加者の参考', value: targetAudience, kind: 'helper' },
            ];
        case 'recruitment':
            return [
                { label: '福利厚生・アピールポイント', value: `${catchCopy} ${description}`.trim(), kind: 'textarea' },
                { label: '想定候補者の参考', value: targetAudience, kind: 'helper' },
            ];
        case 'brand-awareness':
            return [
                { label: 'ブランドメッセージ', value: catchCopy },
                { label: 'コアバリュー・アピールポイント', value: description, kind: 'textarea' },
                { label: 'ターゲット層の参考', value: targetAudience, kind: 'helper' },
            ];
        case 'app-install':
            return [
                { label: 'ダウンロード特典・始めやすさ', value: catchCopy },
                { label: '主要な機能・メリット', value: description, kind: 'textarea' },
                { label: '想定ユーザー', value: targetAudience },
            ];
        case 'lead-generation':
            return [
                { label: '行動喚起', value: catchCopy },
                { label: '得られるメリット・内容', value: description, kind: 'textarea' },
                { label: 'ターゲット（参考）', value: targetAudience, kind: 'helper' },
            ];
        case 'store-visit':
            return [
                { label: '来店特典', value: catchCopy },
                { label: '看板メニュー・目玉商品', value: description, kind: 'textarea' },
                { label: 'ターゲット層の参考', value: targetAudience, kind: 'helper' },
            ];
        default:
            return [
                { label: 'キャッチコピー', value: catchCopy },
                { label: '説明文', value: description, kind: 'textarea' },
                { label: '想定ターゲット', value: targetAudience, kind: 'helper' },
            ];
    }
}

export function getTemplateSampleInput(templateId: string): TemplateSampleInput {
    switch (templateId) {
        case 'ec-flash-sale':
            return {
                campaignName: 'Spring Flash Sale 2026',
                discountInfo: '全品最大50%OFF',
                campaignPeriod: '3/25〜3/31限定',
                campaignTargets: '新生活向け雑貨・収納用品・デスク周辺アイテム',
                targetAudience: 'お得な買い物を求めるオンラインショッピングユーザー',
            };
        case 'ec-new-arrival':
            return {
                productName: 'Aster Linen Set',
                price: '14,800円',
                catchCopy: '待望の新作、ついに登場',
                description: '軽やかな質感と洗練されたシルエットが魅力の新作セットアップ。',
                targetAudience: 'トレンドに敏感な20〜30代',
            };
        case 'ec-review-highlight':
            return {
                brandName: 'Sonic Nest Audio',
                brandMessage: 'お客様のリアルな声',
                brandCoreValue: 'レビュー4.8の高評価。音質、装着感、デザインの満足度を訴求。',
                targetAudience: '品質重視で口コミを参考にする消費者',
            };
        case 'ec-bundle-deal':
            return {
                campaignName: 'Family Bundle Weeks',
                discountInfo: 'まとめ買いで30%OFF',
                campaignPeriod: '今週末まで',
                campaignTargets: '人気のキッチン家電3点セット。数量限定。',
                targetAudience: 'まとめ買いや家族用アイテムを探している消費者',
            };
        case 'ec-premium-product':
            return {
                productName: 'Noir Atelier Watch',
                price: '128,000円',
                catchCopy: '本物だけが持つ、圧倒的な質感',
                description: '精密な仕上げと端正な存在感が際立つプレミアムウォッチ。',
                targetAudience: '品質にこだわる30〜50代の富裕層',
            };
        case 'food-menu-promo':
            return {
                productName: '黒トリュフ和牛バーガー',
                price: '1,680円',
                catchCopy: '新メニュー登場！',
                description: '黒トリュフソースと肉厚パティで仕上げた期間限定バーガー。',
                targetAudience: 'グルメに興味がある20〜40代',
            };
        case 'food-delivery':
            return {
                storeName: 'Urban Bowl Kitchen',
                storeLocation: '渋谷・新宿エリア配達対応',
                signatureMenu: '彩りデリボウルとグリルチキンプレート',
                specialOffer: '初回注文15%OFF＆送料無料',
                targetAudience: '忙しいビジネスパーソンや子育て世代',
            };
        case 'food-cafe':
            return {
                storeName: 'Roast Atelier Kissa',
                storeLocation: '中目黒駅から徒歩4分',
                signatureMenu: 'シングルオリジンラテと季節のバスクチーズケーキ',
                specialOffer: 'ランチタイムはドリンク無料',
                targetAudience: 'コーヒー好きな20〜40代のビジネスパーソン・学生',
            };
        case 'food-healthy':
            return {
                brandName: 'Green Table Organic',
                brandMessage: '体が喜ぶ、自然のおいしさ',
                brandCoreValue: '農薬不使用の素材とやさしい調理法で、毎日の食事を健やかに。',
                targetAudience: '健康や美容に関心の高い20〜40代女性',
            };
        case 'tech-saas-launch':
            return {
                productName: 'FlowPilot Workspace',
                price: '月額9,800円',
                catchCopy: 'ワークフローを次のレベルへ',
                description: 'プロジェクト管理と自動化を一つにまとめた次世代SaaS。',
                targetAudience: 'スタートアップ創業者やプロダクトマネージャー',
            };
        case 'tech-app-download':
            return {
                appName: 'Focus Loop',
                appFeatures: '集中タイマー、習慣ログ、AIによる毎日の振り返り提案。',
                appTargetUser: '勉強や仕事の集中力を高めたいスマホユーザー',
                appDownloadBenefit: '無料ダウンロード。初回登録でプレミアム機能を7日間体験。',
                targetAudience: 'スマートフォンユーザー全般',
            };
        case 'tech-ai-product':
            return {
                productName: 'AIVA Desk',
                price: '月額29,800円',
                catchCopy: 'AIがあなたの仕事を10倍速くする',
                description: '議事録整理、提案書作成、タスク抽出を自動化するAI業務アシスタント。',
                targetAudience: 'DX推進担当者・エンジニア・スタートアップ',
            };
        case 'fashion-seasonal':
            return {
                productName: 'Lueur Spring Edit',
                price: '22,000円',
                catchCopy: 'NEW SEASON COLLECTION',
                description: '軽やかな素材とモダンシルエットで魅せる春の新作コレクション。',
                targetAudience: 'ファッションに関心の高い20〜30代女性',
            };
        case 'fashion-sale':
            return {
                campaignName: 'FINAL SALE 2026',
                discountInfo: '最大70%OFF',
                campaignPeriod: '在庫限り・3日間限定',
                campaignTargets: '人気アウター、シューズ、バッグが対象',
                targetAudience: 'お得にブランドアイテムを購入したい消費者',
            };
        case 'fashion-streetwear':
            return {
                brandName: 'SIDEWAVE',
                brandMessage: 'BE BOLD. BE YOURSELF.',
                brandCoreValue: 'グラフィック、オーバーサイズ、都会的なムードで自分らしさを更新する。',
                targetAudience: 'カルチャーに敏感な15〜25代のZ世代',
            };
        case 'beauty-skincare':
            return {
                productName: 'Lumiere Barrier Serum',
                price: '4,980円',
                catchCopy: '潤い満ちる新感覚スキンケア',
                description: '敏感肌にも寄り添う保湿美容液。しっとり軽やかな使用感。',
                targetAudience: '美容に関心の高い20〜40代女性',
            };
        case 'beauty-makeup':
            return {
                productName: 'Velvet Prism Palette',
                price: '5,200円',
                catchCopy: 'あなたらしい色で、世界を魅了しよう',
                description: '発色と透明感を両立した12色アイシャドウパレット。',
                targetAudience: 'メイクアップに情熱を持つ15〜35代女性',
            };
        case 'beauty-salon':
            return {
                storeName: 'Maison de Clair',
                storeLocation: '表参道駅から徒歩2分',
                signatureMenu: '似合わせカットと透明感カラー',
                specialOffer: '初回来店20%OFF',
                targetAudience: '美容・自己投資に積極的な20〜40代',
            };
        case 'fitness-gym':
            return {
                storeName: 'Core Shift Gym',
                storeLocation: '池袋駅東口から徒歩5分',
                signatureMenu: 'パーソナルトレーニングと24時間ジム利用',
                specialOffer: '入会金無料＆初月月会費0円',
                targetAudience: '健康志向の20〜40代',
            };
        case 'fitness-yoga':
            return {
                storeName: 'CALM Studio',
                storeLocation: '自由が丘駅から徒歩3分',
                signatureMenu: '朝ヨガ・ピラティス・姿勢改善クラス',
                specialOffer: '無料体験レッスン開催中',
                targetAudience: 'ストレス解消・柔軟性向上を望む30〜50代',
            };
        case 'fitness-supplement':
            return {
                productName: 'Peak Fuel Protein',
                price: '6,480円',
                catchCopy: '理想のボディへの最短ルート',
                description: '高たんぱく・低糖質でトレーニング後の回復を支えるプレミアムプロテイン。',
                targetAudience: 'アクティブに身体づくりをしている20〜35代男性',
            };
        case 'education-online-course':
            return {
                materialName: 'SNS広告運用マスター講座',
                materialBenefits: '広告設計、改善フロー、実例解説まで学べる特別講義。',
                leadCallToAction: '無料で講義資料を受け取る',
                targetAudience: 'スキルアップを目指す社会人や学生',
            };
        case 'education-language':
            return {
                materialName: '英会話スタートガイド',
                materialBenefits: '初級者が3か月で話し始めるための学習法を収録。',
                leadCallToAction: '無料体験レッスンを予約する',
                targetAudience: '英語力向上を目指す10〜40代',
            };
        case 'education-programming':
            return {
                materialName: 'エンジニア転職ロードマップ2026',
                materialBenefits: '学習順序、ポートフォリオ、転職成功事例を1冊に整理。',
                leadCallToAction: '無料でロードマップをダウンロード',
                targetAudience: '異業種からIT転職を目指す20〜35代',
            };
        case 'travel-resort':
            return {
                brandName: 'Azure Cove Resort',
                brandMessage: '特別な場所で、特別な時間を',
                brandCoreValue: '海、光、プライベート感を贅沢に味わえる大人のリゾート体験。',
                targetAudience: '旅行好きな20〜50代',
            };
        case 'travel-domestic':
            return {
                campaignName: '秋の旅応援キャンペーン',
                discountInfo: '最大30%OFF',
                campaignPeriod: '10月出発分まで',
                campaignTargets: '温泉旅館、紅葉スポット、観光列車プランが対象',
                targetAudience: '国内旅行を楽しむ30〜60代',
            };
        case 'business-seminar':
            return {
                eventName: 'BtoB Growth Summit 2026',
                eventDateTime: '2026年4月18日(土) 13:00〜14:30',
                eventLocation: 'オンライン開催（Zoom）',
                eventContent: '最新のリード獲得戦略とCRM活用法を90分で学べる限定ウェビナー。',
                targetAudience: '経営者・マーケティング担当者',
            };
        case 'business-recruitment':
            return {
                jobTitle: 'プロダクトデザイナー',
                companyName: 'BrightArc Inc.',
                jobBenefits: 'フルリモート、フレックス、年間休日125日、デザイン予算あり。',
                jobRequirements: 'WebサービスのUI/UX設計経験3年以上。Figma実務経験歓迎。',
                targetAudience: '転職・就活中のエンジニア・デザイナー・マーケター',
            };
        case 'business-consulting':
            return {
                materialName: '経営課題診断シート',
                materialBenefits: '売上、組織、集客のボトルネックを整理できる実務向けテンプレート。',
                leadCallToAction: '無料で診断シートを受け取る',
                targetAudience: '経営課題を抱える中小企業の経営者・役員',
            };
        case 'lifestyle-subscription':
            return {
                materialName: 'Bloom Box Starter Set',
                materialBenefits: '毎月届くセルフケアアイテムの中身と楽しみ方を紹介。',
                leadCallToAction: '初月50%OFFで始める',
                targetAudience: 'サブスクリプションサービスに興味がある20〜30代',
            };
        case 'lifestyle-interior':
            return {
                productName: 'Nord Fold Shelf',
                price: '32,000円',
                catchCopy: '暮らしに、上質なリズムを',
                description: '木の温もりと機能美を両立した北欧スタイルの収納シェルフ。',
                targetAudience: '住空間にこだわるライフスタイル志向の30〜50代',
            };
        case 'lifestyle-pet':
            return {
                productName: 'Tailor Pet Wellness',
                price: '5,980円',
                catchCopy: '大切な家族に、最高のものを',
                description: '獣医師監修のグレインフリーフードで、愛犬愛猫の毎日を健やかに。',
                targetAudience: 'ペットを家族として大切にしている飼い主世代',
            };
        default:
            return {};
    }
}

const AD_TEMPLATES_SEED: AdTemplateSeed[] = [
    // ─── ECサイト ───
    {
        id: 'ec-flash-sale',
        objective: 'sale-campaign',
        name: 'タイムセール',
        description: '在庫限りで終了となります。お見逃しなく！',
        category: 'ec',
        thumbnail: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=800&auto=format&fit=crop',
        icon: '⚡',
        format: 'instagram-story',
        isPremium: false,
        presets: {
            tone: 'bold',
            primaryColor: '#FF416C',
            secondaryColor: '#FF4B2B',
            catchCopy: '全品最大50%OFF',
            description: '今だけの特別価格でお得にゲット。見逃すな！',
            targetAudience: 'お得な買い物を求めるオンラインショッピングユーザー',
        },
        tags: ['セール', '期間限定', 'EC'],
        popular: true,
    },
    {
        id: 'ec-new-arrival',
        objective: 'new-product',
        name: '新商品発売',
        description: '最新トレンドを取り入れたコレクション。',
        category: 'ec',
        thumbnail: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800&auto=format&fit=crop',
        icon: '🆕',
        format: 'instagram-feed',
        isPremium: false,
        presets: {
            tone: 'modern',
            primaryColor: '#667eea',
            secondaryColor: '#764ba2',
            catchCopy: '待望の新作、ついに登場',
            description: '全く新しい体験を。最新コレクションをチェックしよう。',
            targetAudience: 'トレンドに敏感な20〜30代',
        },
        tags: ['新商品', 'ローンチ', 'EC'],
    },
    {
        id: 'ec-review-highlight',
        objective: 'brand-awareness',
        name: 'レビュー訴求',
        description: '1万人以上に選ばれた、確かな品質と信頼。',
        category: 'ec',
        thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
        icon: '⭐',
        format: 'facebook-ad',
        isPremium: true,
        presets: {
            tone: 'minimal',
            primaryColor: '#11998e',
            secondaryColor: '#38ef7d',
            catchCopy: 'お客様のリアルな声',
            description: '10,000人以上に選ばれた理由がここにあります。',
            targetAudience: '品質重視で口コミを参考にする消費者',
        },
        tags: ['レビュー', '口コミ', 'EC'],
    },
    {
        id: 'ec-bundle-deal',
        objective: 'sale-campaign',
        name: 'セット販売',
        description: '人気商品をセットにした限定パック。',
        category: 'ec',
        thumbnail: 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?q=80&w=800&auto=format&fit=crop',
        icon: '🎁',
        format: 'instagram-feed',
        isPremium: true,
        presets: {
            tone: 'bold',
            primaryColor: '#f7971e',
            secondaryColor: '#ffd200',
            catchCopy: 'まとめ買いで30%OFF',
            description: '人気商品をセットにした限定パック。単品より断然お得。',
            targetAudience: 'まとめ買いや家族用アイテムを探している消費者',
        },
        tags: ['セット販売', 'まとめ買い', 'お得', 'EC'],
        isNew: true,
    },
    {
        id: 'ec-premium-product',
        objective: 'new-product',
        name: 'プレミアム商品',
        description: '職人が丹念に仕上げたプレミアムコレクション。',
        category: 'ec',
        thumbnail: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=800&auto=format&fit=crop',
        icon: '💎',
        format: 'instagram-feed',
        isPremium: true,
        presets: {
            tone: 'luxury',
            primaryColor: '#1a1a2e',
            secondaryColor: '#C9A84C',
            catchCopy: '本物だけが持つ、圧倒的な質感',
            description: '職人が一点一点仕上げた、こだわりのプレミアムコレクション。',
            targetAudience: '品質にこだわる30〜50代の富裕層',
        },
        tags: ['プレミアム', '高品質', 'ラグジュアリー', 'EC'],
    },

    // ─── フード・飲料 ───
    {
        id: 'food-menu-promo',
        objective: 'new-product',
        name: '新メニュー告知',
        description: '厳選素材で仕上げた自慢の一品。',
        category: 'food',
        thumbnail: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=800&auto=format&fit=crop',
        icon: '🍔',
        format: 'instagram-feed',
        isPremium: false,
        presets: {
            tone: 'pop',
            primaryColor: '#f5af19',
            secondaryColor: '#f12711',
            catchCopy: '新メニュー登場！',
            description: '厳選素材で仕上げた、自慢の一品をぜひお試しください。',
            targetAudience: 'グルメに興味がある20〜40代',
        },
        tags: ['フード', '新メニュー', 'レストラン'],
        popular: true,
    },
    {
        id: 'food-delivery',
        objective: 'store-visit',
        name: 'デリバリー',
        description: 'アプリからのご注文ですぐにお届け！',
        category: 'food',
        thumbnail: 'https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=800&auto=format&fit=crop',
        icon: '🛵',
        format: 'instagram-story',
        isPremium: true,
        presets: {
            tone: 'modern',
            primaryColor: '#00b09b',
            secondaryColor: '#96c93d',
            catchCopy: '初回注文15%OFF＆送料無料',
            description: 'お家にいながら、お店の味を楽しめます。初回注文15%OFF！',
            targetAudience: '忙しいビジネスパーソンや子育て世代',
        },
        tags: ['デリバリー', 'フード', 'クーポン'],
    },
    {
        id: 'food-cafe',
        objective: 'store-visit',
        name: 'カフェ・コーヒー',
        description: '静かな時間と、最高の一杯をお届けします。',
        category: 'food',
        thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
        icon: '☕',
        format: 'instagram-feed',
        isPremium: false,
        presets: {
            tone: 'minimal',
            primaryColor: '#6F4E37',
            secondaryColor: '#C4A882',
            catchCopy: 'ランチタイムはドリンク無料',
            description: '厳選されたシングルオリジンコーヒーを、最高の一杯で。静かな時間を、あなたと。',
            targetAudience: 'コーヒー好きな20〜40代のビジネスパーソン・学生',
        },
        tags: ['カフェ', 'コーヒー', 'ドリンク'],
    },
    {
        id: 'food-healthy',
        objective: 'brand-awareness',
        name: 'ヘルシー・オーガニック',
        description: '農薬不使用。体の中からきれいになる食事を。',
        category: 'food',
        thumbnail: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop',
        icon: '🥗',
        format: 'instagram-feed',
        isPremium: true,
        presets: {
            tone: 'natural',
            primaryColor: '#56ab2f',
            secondaryColor: '#a8e063',
            catchCopy: '体が喜ぶ、自然のおいしさ',
            description: '農薬不使用のオーガニック素材だけを使用。体の中からきれいになる食事を。',
            targetAudience: '健康や美容に関心の高い20〜40代女性',
        },
        tags: ['ヘルシー', 'オーガニック', '健康食'],
        isNew: true,
    },

    // ─── テクノロジー ───
    {
        id: 'tech-saas-launch',
        objective: 'new-product',
        name: 'SaaSプロダクト',
        description: 'チームの生産性を最大200%向上させます。',
        category: 'tech',
        thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
        icon: '🚀',
        format: 'twitter-post',
        isPremium: true,
        presets: {
            tone: 'modern',
            primaryColor: '#2C5364',
            secondaryColor: '#0F2027',
            catchCopy: 'ワークフローを次のレベルへ',
            description: 'クラウドベースの次世代ツールで生産性を最大200%向上。',
            targetAudience: 'スタートアップ創業者やプロダクトマネージャー',
        },
        tags: ['SaaS', 'テック', 'B2B'],
        popular: true,
    },
    {
        id: 'tech-app-download',
        objective: 'app-install',
        name: 'アプリダウンロード',
        description: '毎日の習慣を変えるスマートな機能が満載。',
        category: 'tech',
        thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop',
        icon: '📲',
        format: 'instagram-story',
        isPremium: false,
        presets: {
            tone: 'modern',
            primaryColor: '#4facfe',
            secondaryColor: '#00f2fe',
            catchCopy: '無料ダウンロード！今すぐ始めよう',
            description: '累計100万ダウンロード突破。App Store & Google Playで配信中。',
            targetAudience: 'スマートフォンユーザー全般',
        },
        tags: ['アプリ', 'ダウンロード', 'モバイル'],
    },
    {
        id: 'tech-ai-product',
        objective: 'new-product',
        name: 'AIプロダクト',
        description: '最先端技術で繰り返し作業を自動化。',
        category: 'tech',
        thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?q=80&w=800&auto=format&fit=crop',
        icon: '🤖',
        format: 'twitter-post',
        isPremium: true,
        presets: {
            tone: 'modern',
            primaryColor: '#6366f1',
            secondaryColor: '#8b5cf6',
            catchCopy: 'AIがあなたの仕事を10倍速くする',
            description: '最先端のAI技術で繰り返し作業を自動化。チームの生産性を劇的に改善します。',
            targetAudience: 'DX推進担当者・エンジニア・スタートアップ',
        },
        tags: ['AI', 'テクノロジー', '自動化', 'DX'],
        isNew: true,
    },

    // ─── ファッション ───
    {
        id: 'fashion-seasonal',
        objective: 'new-product',
        name: 'シーズンコレクション',
        description: 'この季節だけの特別なスタイルを提案します。',
        category: 'fashion',
        thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800&auto=format&fit=crop',
        icon: '👗',
        format: 'instagram-feed',
        isPremium: true,
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
        objective: 'sale-campaign',
        name: 'ファッションセール',
        description: 'マストバイアイテムが驚きの価格に。',
        category: 'fashion',
        thumbnail: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=800&auto=format&fit=crop',
        icon: '🏷️',
        format: 'instagram-story',
        isPremium: false,
        presets: {
            tone: 'bold',
            primaryColor: '#000000',
            secondaryColor: '#D4AF37',
            catchCopy: 'FINAL SALE！最大70%OFF',
            description: '人気アイテムが驚きの価格に。お見逃しなく。',
            targetAudience: 'お得にブランドアイテムを購入したい消費者',
        },
        tags: ['セール', 'ファッション', 'EC'],
    },
    {
        id: 'fashion-streetwear',
        objective: 'brand-awareness',
        name: 'ストリートウェア',
        description: '型にはまらない、自分だけのスタイルを。',
        category: 'fashion',
        thumbnail: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?q=80&w=800&auto=format&fit=crop',
        icon: '🧢',
        format: 'instagram-story',
        isPremium: true,
        presets: {
            tone: 'bold',
            primaryColor: '#1a1a1a',
            secondaryColor: '#e63946',
            catchCopy: 'BE BOLD. BE YOURSELF.',
            description: '型にはまるな。自分だけのスタイルを貫け。新コレクション、今すぐチェック。',
            targetAudience: 'カルチャーに敏感な15〜25代のZ世代',
        },
        tags: ['ストリート', 'ファッション', 'ブランド', 'Z世代'],
        isNew: true,
    },

    // ─── ビューティー ───
    {
        id: 'beauty-skincare',
        objective: 'new-product',
        name: 'スキンケア',
        description: '敏感肌にもやさしい処方で本来の美しさを。',
        category: 'beauty',
        thumbnail: 'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop',
        icon: '✨',
        format: 'instagram-feed',
        isPremium: false,
        presets: {
            tone: 'minimal',
            primaryColor: '#fbc2eb',
            secondaryColor: '#a6c1ee',
            catchCopy: '潤い満ちる新感覚スキンケア',
            description: '天然由来成分95%配合。敏感肌にもやさしい処方のスキンケアシリーズ。',
            targetAudience: '美容に関心の高い20〜40代女性',
        },
        tags: ['スキンケア', 'ビューティー', 'コスメ'],
    },
    {
        id: 'beauty-makeup',
        objective: 'new-product',
        name: 'メイクアップ',
        description: '個性を最大限に引き出す新コスメライン。',
        category: 'beauty',
        thumbnail: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?q=80&w=800&auto=format&fit=crop',
        icon: '💄',
        format: 'instagram-story',
        isPremium: true,
        presets: {
            tone: 'bold',
            primaryColor: '#e91e63',
            secondaryColor: '#9c27b0',
            catchCopy: 'あなたらしい色で、世界を魅了しよう',
            description: '140色以上のカラーバリエーション。あなたの個性を最大限に引き出す新コスメライン。',
            targetAudience: 'メイクアップに情熱を持つ15〜35代女性',
        },
        tags: ['メイク', 'コスメ', 'ビューティー'],
        popular: true,
    },
    {
        id: 'beauty-salon',
        objective: 'store-visit',
        name: '美容サロン',
        description: '最高の技術で、あなたをもっと美しく。',
        category: 'beauty',
        thumbnail: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800&auto=format&fit=crop',
        icon: '💇',
        format: 'instagram-feed',
        isPremium: true,
        presets: {
            tone: 'elegant',
            primaryColor: '#d4a574',
            secondaryColor: '#3d2b1f',
            catchCopy: '全メニュー20%OFF',
            description: 'こだわりの施術と居心地のよい空間。ご予約はDMまたはWEBから。初回カット20%OFF。',
            targetAudience: '美容・自己投資に積極的な20〜40代',
        },
        tags: ['美容院', 'サロン', 'エステ'],
    },

    // ─── フィットネス ───
    {
        id: 'fitness-gym',
        objective: 'store-visit',
        name: 'ジム入会キャンペーン',
        description: 'プロトレーナーが目標達成を徹底サポート。',
        category: 'fitness',
        thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
        icon: '🏋️',
        format: 'instagram-story',
        isPremium: false,
        presets: {
            tone: 'bold',
            primaryColor: '#f7971e',
            secondaryColor: '#ffd200',
            catchCopy: '入会金無料＆初月月会費0円',
            description: '入会金無料キャンペーン実施中！ プロトレーナーがあなたの目標達成をサポート。',
            targetAudience: '健康志向の20〜40代',
        },
        tags: ['フィットネス', 'ジム', 'キャンペーン'],
    },
    {
        id: 'fitness-yoga',
        objective: 'store-visit',
        name: 'ヨガ・ピラティス',
        description: '体を整え、心を解放する時間を。',
        category: 'fitness',
        thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=800&auto=format&fit=crop',
        icon: '🧘',
        format: 'instagram-feed',
        isPremium: true,
        presets: {
            tone: 'natural',
            primaryColor: '#667eea',
            secondaryColor: '#f5a623',
            catchCopy: '無料体験レッスン開催中',
            description: '初心者から上級者まで。あなたのペースで始められるヨガクラス。無料体験レッスン開催中。',
            targetAudience: 'ストレス解消・柔軟性向上を望む30〜50代',
        },
        tags: ['ヨガ', 'ピラティス', 'ウェルネス'],
    },
    {
        id: 'fitness-supplement',
        objective: 'new-product',
        name: 'サプリメント・プロテイン',
        description: '高品質プロテインでパフォーマンスを最大化。',
        category: 'fitness',
        thumbnail: 'https://images.unsplash.com/photo-1584466977773-e625c37cdd50?q=80&w=800&auto=format&fit=crop',
        icon: '💊',
        format: 'instagram-feed',
        isPremium: true,
        presets: {
            tone: 'bold',
            primaryColor: '#11998e',
            secondaryColor: '#38ef7d',
            catchCopy: '理想のボディへの最短ルート',
            description: 'トップアスリートも愛用。高品質プロテイン&栄養素でパフォーマンスを最大化。',
            targetAudience: 'アクティブに身体づくりをしている20〜35代男性',
        },
        tags: ['サプリ', 'プロテイン', 'フィットネス', '健康'],
        isNew: true,
    },

    // ─── 教育 ───
    {
        id: 'education-online-course',
        objective: 'lead-generation',
        name: 'オンラインコース',
        description: 'プロの講師による実践的なカリキュラム。',
        category: 'education',
        thumbnail: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?q=80&w=800&auto=format&fit=crop',
        icon: '📖',
        format: 'facebook-ad',
        isPremium: false,
        presets: {
            tone: 'modern',
            primaryColor: '#5f72bd',
            secondaryColor: '#9b23ea',
            catchCopy: '【無料公開中】特別講義',
            description: 'プロの講師による実践的なカリキュラム。いつでもどこでも学べるオンラインスクール。',
            targetAudience: 'スキルアップを目指す社会人や学生',
        },
        tags: ['教育', 'オンライン学習', 'スクール'],
    },
    {
        id: 'education-language',
        objective: 'lead-generation',
        name: '語学・英会話',
        description: 'ネイティブ講師とマンツーマンで学ぶ英会話。',
        category: 'education',
        thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=800&auto=format&fit=crop',
        icon: '🌐',
        format: 'instagram-story',
        isPremium: false,
        presets: {
            tone: 'friendly',
            primaryColor: '#4facfe',
            secondaryColor: '#00f2fe',
            catchCopy: '英語が話せると、世界が変わる',
            description: 'ネイティブ講師とマンツーマンで学ぶオンライン英会話。初回レッスン無料。今すぐ始めよう！',
            targetAudience: '英語力向上を目指す10〜40代',
        },
        tags: ['英会話', '語学', '英語', '教育'],
    },
    {
        id: 'education-programming',
        objective: 'lead-generation',
        name: 'プログラミングスクール',
        description: '確実にスキルを身につけるための学習ステップ。',
        category: 'education',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
        icon: '💻',
        format: 'facebook-ad',
        isPremium: true,
        presets: {
            tone: 'modern',
            primaryColor: '#0f3460',
            secondaryColor: '#e94560',
            catchCopy: 'エンジニア転職ロードマップ',
            description: '転職成功率93%。3,000人以上の転職を支援した実績あるプログラミングスクール。',
            targetAudience: '異業種からIT転職を目指す20〜35代',
        },
        tags: ['プログラミング', '転職', 'エンジニア', '教育'],
        isNew: true,
    },

    // ─── 旅行 ───
    {
        id: 'travel-resort',
        objective: 'brand-awareness',
        name: 'リゾート',
        description: '日常を忘れさせる極上のリゾート体験を。',
        category: 'travel',
        thumbnail: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800&auto=format&fit=crop',
        icon: '🏝️',
        format: 'instagram-story',
        isPremium: true,
        presets: {
            tone: 'luxury',
            primaryColor: '#00c6fb',
            secondaryColor: '#005bea',
            catchCopy: '特別な場所で、特別な時間を',
            description: '見たことのない青い海が待っている。今シーズンのベストリゾートをご紹介。',
            targetAudience: '旅行好きな20〜50代',
        },
        tags: ['旅行', 'リゾート', 'バカンス'],
    },
    {
        id: 'travel-domestic',
        objective: 'sale-campaign',
        name: '国内旅行・観光',
        description: '絶景と心温まるおもてなし。非日常の癒しを。',
        category: 'travel',
        thumbnail: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=800&auto=format&fit=crop',
        icon: '🗾',
        format: 'instagram-feed',
        isPremium: true,
        presets: {
            tone: 'warm',
            primaryColor: '#f45b69',
            secondaryColor: '#ee9b00',
            catchCopy: '【秋の旅行応援】最大30%OFF',
            description: '四季折々の絶景と、心温まるおもてなし。憧れの旅先があなたを待っています。',
            targetAudience: '国内旅行を楽しむ30〜60代',
        },
        tags: ['国内旅行', '観光', '日本', '旅'],
    },

    // ─── ビジネス ───
    {
        id: 'business-seminar',
        objective: 'event-seminar',
        name: 'セミナー・ウェビナー',
        description: 'マーケティングの最先端を学べる90分。',
        category: 'business',
        thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
        icon: '🎤',
        format: 'facebook-ad',
        isPremium: false,
        presets: {
            tone: 'modern',
            primaryColor: '#1a2a6c',
            secondaryColor: '#fdbb2d',
            catchCopy: '業界のトップが語る最新戦略',
            description: '限定100名。マーケティングの最先端を今すぐキャッチアップ。',
            targetAudience: '経営者・マーケティング担当者',
        },
        tags: ['セミナー', 'ウェビナー', 'B2B'],
    },
    {
        id: 'business-recruitment',
        objective: 'recruitment',
        name: '採用・求人',
        description: '新しい価値を創造し、共に成長できる仲間を。',
        category: 'business',
        thumbnail: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=800&auto=format&fit=crop',
        icon: '🤝',
        format: 'facebook-ad',
        isPremium: true,
        presets: {
            tone: 'trustworthy',
            primaryColor: '#0072b1',
            secondaryColor: '#00a0dc',
            catchCopy: 'フルリモート・年間休日125日',
            description: 'チャレンジを楽しめる人を求めています。フルフレックス・フルリモート対応。カジュアル面談から。',
            targetAudience: '転職・就活中のエンジニア・デザイナー・マーケター',
        },
        tags: ['採用', '求人', '人材', '転職'],
    },
    {
        id: 'business-consulting',
        objective: 'lead-generation',
        name: 'コンサルティング',
        description: 'ビジネス課題を可視化するチェックリスト。',
        category: 'business',
        thumbnail: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=800&auto=format&fit=crop',
        icon: '📊',
        format: 'google-display',
        isPremium: true,
        presets: {
            tone: 'professional',
            primaryColor: '#1a3a5c',
            secondaryColor: '#2d6a9f',
            catchCopy: '【無料診断シート】課題を最速で解決へ',
            description: '業界トップクラスのコンサルタントが、あなたのビジネス課題に向き合います。初回相談無料。',
            targetAudience: '経営課題を抱える中小企業の経営者・役員',
        },
        tags: ['コンサル', 'B2B', 'ビジネス', '課題解決'],
        isNew: true,
    },

    // ─── ライフスタイル ───
    {
        id: 'lifestyle-subscription',
        objective: 'lead-generation',
        name: 'サブスクリプション',
        description: 'プロが厳選したアイテムが毎月届きます。',
        category: 'lifestyle',
        thumbnail: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?q=80&w=800&auto=format&fit=crop',
        icon: '📦',
        format: 'instagram-feed',
        isPremium: false,
        presets: {
            tone: 'cute',
            primaryColor: '#f093fb',
            secondaryColor: '#f5576c',
            catchCopy: '毎月届くワクワク体験',
            description: 'プロが厳選したアイテムが毎月届く、新しいライフスタイル体験。初月50%OFF。',
            targetAudience: 'サブスクリプションサービスに興味がある20〜30代',
        },
        tags: ['サブスク', 'ライフスタイル', '定期購入'],
    },
    {
        id: 'lifestyle-interior',
        objective: 'new-product',
        name: 'インテリア・家具',
        description: 'シンプルで機能的な、理想の空間を。',
        category: 'lifestyle',
        thumbnail: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop',
        icon: '🛋️',
        format: 'instagram-feed',
        isPremium: true,
        presets: {
            tone: 'minimal',
            primaryColor: '#d4a574',
            secondaryColor: '#f5efe6',
            catchCopy: '暮らしに、上質なリズムを',
            description: '北欧デザインにインスパイアされた家具コレクション。シンプルで機能的な、理想の空間を。',
            targetAudience: '住空間にこだわるライフスタイル志向の30〜50代',
        },
        tags: ['インテリア', '家具', 'ライフスタイル', '北欧'],
        isNew: true,
    },
    {
        id: 'lifestyle-pet',
        objective: 'new-product',
        name: 'ペット用品',
        description: '獣医師監修のプレミアムペットフード。',
        category: 'lifestyle',
        thumbnail: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=800&auto=format&fit=crop',
        icon: '🐾',
        format: 'instagram-feed',
        isPremium: true,
        presets: {
            tone: 'warm',
            primaryColor: '#ff6b6b',
            secondaryColor: '#feca57',
            catchCopy: '大切な家族に、最高のものを',
            description: '獣医師監修のプレミアムペットフード。愛するペットの健康と幸せのために。',
            targetAudience: 'ペットを家族として大切にしている飼い主世代',
        },
        tags: ['ペット', '動物', 'ライフスタイル'],
    },
];

export const AD_TEMPLATES: AdTemplate[] = AD_TEMPLATES_SEED.map((template) => ({
    ...template,
    customInstructions: buildTemplateCustomInstructions(template),
}));
