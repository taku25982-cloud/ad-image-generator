'use client';

export function GenerationProgressOverlay({
    progress,
    statusMessage,
}: {
    progress: number;
    statusMessage: string;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
                <div className="relative mx-auto mb-5 h-20 w-20">
                    <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
                    <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center text-lg font-black text-purple-600">
                        {progress}%
                    </div>
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">AIが画像を生成中...</h3>
                <p className="mb-4 text-sm text-gray-500">{statusMessage}</p>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 via-purple-500 to-indigo-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <p className="mt-3 text-xs leading-relaxed text-gray-400">
                    通信状況や画像の複雑さによって、完了までの時間は前後します。
                </p>
            </div>
        </div>
    );
}
