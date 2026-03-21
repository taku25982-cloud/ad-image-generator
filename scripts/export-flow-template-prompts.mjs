import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const workspaceRoot = 'C:/Projects/gemini-cli-company-demo/apps/ad-image-generator';
const templatesModuleUrl = pathToFileURL(path.join(workspaceRoot, 'src/lib/templates.ts')).href;
const { AD_TEMPLATES, getTemplateSampleInput } = await import(templatesModuleUrl);

const formatDimensions = {
  'instagram-story': { width: 1080, height: 1920 },
  'instagram-feed': { width: 1080, height: 1080 },
  'facebook-ad': { width: 1200, height: 628 },
  'twitter-post': { width: 1200, height: 675 },
  'youtube-thumbnail': { width: 1280, height: 720 },
  'google-display': { width: 300, height: 250 },
  'ec-banner': { width: 728, height: 90 },
  'product-image': { width: 800, height: 800 },
};

const toneDescriptions = {
  modern: 'モダンで洗練された現代的なスタイル、クリーンなライン、ミニマルな装飾',
  cute: '可愛らしく親しみやすいスタイル、柔らかい色調、丸みのある要素',
  luxury: '高級感のある上品なスタイル、ゴールドやダークカラー、エレガントなタイポグラフィ',
  pop: '明るく元気なポップスタイル、ビビッドカラー、遊び心のある要素',
  minimal: 'シンプルで洗練されたミニマルスタイル、余白を活かしたデザイン',
  bold: '大胆でインパクトのあるスタイル、強いコントラスト、目を引く構図',
};

const defaultFormData = {
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

function getObjectiveLabel(objective) {
  return {
    'new-product': '新商品・サービス紹介',
    'sale-campaign': 'セール・キャンペーン告知',
    'event-seminar': 'イベント・セミナー集客',
    recruitment: '採用・求人募集',
    'brand-awareness': 'ブランド認知・PR',
    'app-install': 'アプリインストール促進',
    'lead-generation': 'リード獲得・資料請求',
    'store-visit': '実店舗への来店促進',
  }[objective] ?? objective;
}

function detailLine(label, value) {
  return value ? `- ${label}: ${value}` : '';
}

function exactCopyLine(label, value) {
  return value ? `- ${label}は画像に載せる場合、文言を一字一句そのまま使用する: 「${value}」` : '';
}

function buildObjectiveDetails(formData) {
  const linesByObjective = {
    'new-product': [
      detailLine('商品名', formData.productName),
      detailLine('価格', formData.price),
      detailLine('キャッチコピー', formData.catchCopy),
      detailLine('商品説明', formData.description),
      detailLine('ターゲット層', formData.targetAudience),
    ],
    'sale-campaign': [
      detailLine('セール名・キャンペーン名', formData.campaignName),
      detailLine('特典・割引内容', formData.discountInfo),
      detailLine('期間', formData.campaignPeriod),
      detailLine('対象商品・備考', formData.campaignTargets),
    ],
    'event-seminar': [
      detailLine('イベント名・セミナー名', formData.eventName),
      detailLine('開催日時', formData.eventDateTime),
      detailLine('開催場所', formData.eventLocation),
      detailLine('イベント内容・対象者', formData.eventContent),
    ],
    recruitment: [
      detailLine('募集職種', formData.jobTitle),
      detailLine('会社名', formData.companyName),
      detailLine('福利厚生・アピールポイント', formData.jobBenefits),
      detailLine('必須スキル・求める人物像', formData.jobRequirements),
    ],
    'brand-awareness': [
      detailLine('ブランド名・企業名', formData.brandName),
      detailLine('ブランドメッセージ', formData.brandMessage),
      detailLine('コアバリュー・アピールポイント', formData.brandCoreValue),
    ],
    'app-install': [
      detailLine('アプリ名', formData.appName),
      detailLine('主要な機能・メリット', formData.appFeatures),
      detailLine('想定ユーザー', formData.appTargetUser),
      detailLine('ダウンロード特典・始めやすさ', formData.appDownloadBenefit),
    ],
    'lead-generation': [
      detailLine('資料名・特典名', formData.materialName),
      detailLine('得られるメリット・内容', formData.materialBenefits),
      detailLine('行動喚起', formData.leadCallToAction),
    ],
    'store-visit': [
      detailLine('店舗名', formData.storeName),
      detailLine('店舗の場所・アクセス', formData.storeLocation),
      detailLine('看板メニュー・目玉商品', formData.signatureMenu),
      detailLine('来店特典', formData.specialOffer),
    ],
  };

  return (linesByObjective[formData.objective] ?? []).filter(Boolean).join('\n');
}

function buildExactCopyRules(formData) {
  const linesByObjective = {
    'new-product': [
      exactCopyLine('商品名', formData.productName),
      exactCopyLine('価格', formData.price),
      exactCopyLine('キャッチコピー', formData.catchCopy),
    ],
    'sale-campaign': [
      exactCopyLine('セール名・キャンペーン名', formData.campaignName),
      exactCopyLine('特典・割引内容', formData.discountInfo),
      exactCopyLine('期間', formData.campaignPeriod),
    ],
    'event-seminar': [
      exactCopyLine('イベント名・セミナー名', formData.eventName),
      exactCopyLine('開催日時', formData.eventDateTime),
      exactCopyLine('開催場所', formData.eventLocation),
    ],
    recruitment: [
      exactCopyLine('募集職種', formData.jobTitle),
    ],
    'brand-awareness': [
      exactCopyLine('ブランド名・企業名', formData.brandName),
      exactCopyLine('ブランドメッセージ', formData.brandMessage),
    ],
    'app-install': [
      exactCopyLine('アプリ名', formData.appName),
    ],
    'lead-generation': [
      exactCopyLine('資料名・特典名', formData.materialName),
      exactCopyLine('行動喚起', formData.leadCallToAction),
    ],
    'store-visit': [
      exactCopyLine('店舗名', formData.storeName),
      exactCopyLine('来店特典', formData.specialOffer),
    ],
  };

  const baseRules = [
    '上記の固定対象テキストは、誤字修正、要約、言い換え、翻訳、語尾変更、句読点変更、記号変更、半角全角の勝手な置換をしない。',
    '文字数が多い場合は短く書き換えるのではなく、改行やサイズ調整で対応する。',
    '固定対象以外の補助説明を追加する場合も、固定対象テキストと意味が衝突しないようにする。',
  ];

  const lines = (linesByObjective[formData.objective] ?? []).filter(Boolean);
  if (lines.length === 0) {
    return '';
  }

  return [...lines, ...baseRules].join('\n');
}

function getMappedPresets(template) {
  switch (template.objective) {
    case 'new-product':
      return { productName: '', catchCopy: template.presets.catchCopy, description: template.presets.description };
    case 'sale-campaign':
      return { campaignName: '', discountInfo: template.presets.catchCopy, campaignTargets: template.presets.description };
    case 'event-seminar':
      return { eventName: '', eventDateTime: '', eventLocation: '', eventContent: template.presets.description };
    case 'recruitment':
      return {
        jobTitle: '',
        companyName: '',
        jobBenefits: `${template.presets.catchCopy} ${template.presets.description}`.trim(),
        jobRequirements: '',
      };
    case 'brand-awareness':
      return { brandName: '', brandMessage: template.presets.catchCopy, brandCoreValue: template.presets.description };
    case 'app-install':
      return {
        appName: '',
        appFeatures: template.presets.description,
        appTargetUser: template.presets.targetAudience || '',
        appDownloadBenefit: template.presets.catchCopy || '',
      };
    case 'lead-generation':
      return {
        materialName: '',
        materialBenefits: template.presets.description,
        leadCallToAction: template.presets.catchCopy || '',
      };
    case 'store-visit':
      return { storeName: '', storeLocation: '', specialOffer: template.presets.catchCopy, signatureMenu: '' };
    default:
      return {};
  }
}

function buildFormData(template) {
  const sampleInput = getTemplateSampleInput(template.id);

  return {
    ...defaultFormData,
    objective: template.objective ?? 'new-product',
    tone: template.presets.tone || 'modern',
    primaryColor: template.presets.primaryColor || '#FF6B35',
    secondaryColor: template.presets.secondaryColor || '#7C3AED',
    targetAudience: template.presets.targetAudience || '',
    customInstructions: template.customInstructions || '',
    ...getMappedPresets(template),
    ...sampleInput,
  };
}

function buildPrompt(template) {
  const formData = buildFormData(template);
  const size = formatDimensions[template.format];
  const toneDesc = toneDescriptions[formData.tone] || toneDescriptions.modern;
  const objectiveLabel = getObjectiveLabel(formData.objective);
  const objectiveDetails = buildObjectiveDetails(formData);
  const exactCopyRules = buildExactCopyRules(formData);

  return `
あなたはプロの広告デザイナーです。以下の条件に基づいて、魅力的な広告画像を生成してください。

【広告の目的】
- ${objectiveLabel}

【入力情報】
${objectiveDetails}
${exactCopyRules ? `\n【テキスト固定ルール】\n${exactCopyRules}\n` : ''}${formData.customInstructions ? `\n【カスタム指示】\n${formData.customInstructions}\n` : ''}
【デザイン要件】
- フォーマット: ${template.format}
- サイズ: ${size.width}x${size.height}px
- デザインスタイル: ${toneDesc}
- メインカラー: ${formData.primaryColor}
- サブカラー: ${formData.secondaryColor}

【重要な指示】
1. 商品の魅力を最大限に引き出す構図
2. ターゲットに訴求する視覚的要素
3. 入力された文言のうち画像内に載せるものは、意味を変えず、要約せず、別表現に言い換えず、そのままの文言で読みやすく配置
4. 指定されたカラースキーム（メインカラー、サブカラー）を効果的に活用
5. プロフェッショナルな広告として完成度の高いデザイン
6. SNSやウェブで映える目を引くビジュアル

広告画像を生成してください。
`.trim();
}

function buildInputLines(formData) {
  return buildObjectiveDetails(formData)
    .split('\n')
    .filter(Boolean)
    .map((line) => `- ${line.replace(/^- /, '')}`)
    .join('\n');
}

const lines = [
  '# Flow Expanded Template Prompts',
  '',
  'このファイルは `scripts/export-flow-template-prompts.mjs` により生成されました。',
  '',
];

AD_TEMPLATES.forEach((template, index) => {
  const formData = buildFormData(template);
  const size = formatDimensions[template.format];
  const toneDesc = toneDescriptions[formData.tone] || toneDescriptions.modern;
  const exactCopyRules = buildExactCopyRules(formData);
  lines.push(`## ${index + 1}. ${template.id}`);
  lines.push('');
  lines.push(`- name: \`${template.name}\``);
  lines.push(`- objective: \`${formData.objective}\` (${getObjectiveLabel(formData.objective)})`);
  lines.push(`- format: \`${template.format}\``);
  lines.push(`- size: \`${size.width}x${size.height}\``);
  lines.push(`- tone: \`${formData.tone}\``);
  lines.push(`- toneDesc: ${toneDesc}`);
  lines.push(`- primaryColor: \`${formData.primaryColor}\``);
  lines.push(`- secondaryColor: \`${formData.secondaryColor}\``);
  lines.push('');
  lines.push('### Input Lines');
  lines.push('');
  lines.push('```text');
  lines.push(buildInputLines(formData));
  lines.push('```');
  lines.push('');
  lines.push('### Exact Copy Rules');
  lines.push('');
  lines.push('```text');
  lines.push(exactCopyRules);
  lines.push('```');
  lines.push('');
  lines.push('### Custom Instructions');
  lines.push('');
  lines.push('```text');
  lines.push(formData.customInstructions);
  lines.push('```');
  lines.push('');
  lines.push('### Full Prompt');
  lines.push('');
  lines.push('```text');
  lines.push(buildPrompt(template));
  lines.push('```');
  lines.push('');
});

const outputPath = path.join(workspaceRoot, 'docs/flow-template-prompts-expanded.md');
fs.writeFileSync(outputPath, lines.join('\n'), 'utf8');
console.log(`Wrote ${outputPath}`);