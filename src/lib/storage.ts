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
 * Base64文字列をUint8Arrayに変換（Node.js Buffer非依存）
 */
function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

/**
 * Base64形式の画像データをR2にアップロードし、公開URLを返す
 * @param base64Image data:image/png;base64,... 形式の文字列
 * @param path 保存先のパス (例: ads/user123/image.png)
 */
export async function uploadImageToR2(base64Image: string, path: string): Promise<string> {
    if (!s3Client || !R2_BUCKET_NAME) {
        throw new Error('R2 Storage configuration is missing');
    }

    // Base64からUint8Arrayへの変換（Buffer不使用）
    const matches = base64Image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 string');
    }

    const contentType = matches[1];
    const body = base64ToUint8Array(matches[2]);

    try {
        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: path,
            Body: body,
            ContentType: contentType,
        });

        await s3Client.send(command);

        // 公開URLの構築
        if (R2_PUBLIC_URL) {
            const baseUrl = R2_PUBLIC_URL.endsWith('/') ? R2_PUBLIC_URL.slice(0, -1) : R2_PUBLIC_URL;
            const cleanPath = path.startsWith('/') ? path.slice(1) : path;
            return `${baseUrl}/${cleanPath}`;
        }

        // フォールバック
        return `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${path}`;

    } catch (error) {
        console.error('R2 Upload Error:', error);
        throw new Error(`Failed to upload image to storage: ${error instanceof Error ? error.message : String(error)}`);
    }
}
