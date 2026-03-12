/**
 * クライアントサイドでの画像リサイズ・圧縮ユーティリティ
 */

export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_DIMENSION = 1536; // Gemini API等への送信に最適な最大長辺サイズ

export async function resizeAndCompressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        // 1. ファイルサイズと形式のチェック
        if (!file.type.startsWith('image/')) {
            reject(new Error('画像ファイルを選択してください'));
            return;
        }

        if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
            reject(new Error(`画像サイズは${MAX_IMAGE_SIZE_MB}MB以下にしてください`));
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;

            img.onload = () => {
                // 2. リサイズ計算
                let width = img.width;
                let height = img.height;

                if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                    if (width > height) {
                        height = Math.round((height * MAX_DIMENSION) / width);
                        width = MAX_DIMENSION;
                    } else {
                        width = Math.round((width * MAX_DIMENSION) / height);
                        height = MAX_DIMENSION;
                    }
                }

                // 3. Canvasに描画して圧縮
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas context could not be initialized'));
                    return;
                }

                // 背景を白で塗りつぶす（透過PNG対策、JPEG変換時用）
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);

                // 画像を描画
                ctx.drawImage(img, 0, 0, width, height);

                // WebP（またはJPEG）で圧縮してBase64化
                // 透過が必要なPNGの場合はWebPを使用することでアルファチャンネルを保持しつつ圧縮可能
                const quality = 0.85; 
                let dataUrl = canvas.toDataURL('image/webp', quality);
                
                // もしブラウザがWebP出力をサポートしていない場合（古いSafari等）はJPEGにフォールバック
                if (!dataUrl.startsWith('data:image/webp')) {
                    dataUrl = canvas.toDataURL('image/jpeg', quality);
                }

                resolve(dataUrl);
            };

            img.onerror = () => {
                reject(new Error('画像の読み込みに失敗しました'));
            };
        };

        reader.onerror = () => {
            reject(new Error('ファイルの読み込みに失敗しました'));
        };
    });
}
