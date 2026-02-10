import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// R2 (S3 Compatible) Client
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // e.g. https://pub-xxx.r2.dev

const s3Client = (R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY)
    ? new S3Client({
        region: 'us-east-1',
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
    })
    : null;

/**
 * Base64形式の画像データをR2にアップロードし、公開URLを返す
 * @param base64Image data:image/png;base64,... 形式の文字列
 * @param path 保存先のパス (例: ads/user123/image.png)
 */
export async function uploadImageToR2(base64Image: string, path: string): Promise<string> {
    if (!s3Client || !R2_BUCKET_NAME) {
        throw new Error('R2 Storage configuration is missing');
    }

    // Base64からBufferへの変換
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 string');
    }

    const contentType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    try {
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: path,
            Body: buffer,
            ContentType: contentType,
            // ACL: 'public-read', // R2ではACLは通常不要（バケットポリシーで制御）
        });

        await s3Client.send(command);

        // 公開URLの構築
        if (R2_PUBLIC_URL) {
            // 末尾のスラッシュ処理
            const baseUrl = R2_PUBLIC_URL.endsWith('/') ? R2_PUBLIC_URL.slice(0, -1) : R2_PUBLIC_URL;
            // 先頭のスラッシュ処理
            const cleanPath = path.startsWith('/') ? path.slice(1) : path;
            const fullUrl = `${baseUrl}/${cleanPath}`;
            return fullUrl;
        }

        // フォールバック: default R2 dev URL (ただし動作保証なし)
        return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${path}`;

    } catch (error) {
        console.error('=== R2 Upload Debug Info ===');
        console.error('Bucket:', R2_BUCKET_NAME);
        console.error('Key:', path);
        console.error('Content Type:', contentType);
        console.error('Endpoint:', `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
        console.error('Error Details:', error);
        throw new Error(`Failed to upload image to storage: ${error instanceof Error ? error.message : String(error)}`);
    }
}
