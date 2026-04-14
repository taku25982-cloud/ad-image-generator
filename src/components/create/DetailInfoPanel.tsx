'use client';

import Image from 'next/image';
import { DynamicFormFields } from '@/components/ad-config/DynamicFormFields';
import type { AdObjectiveId, UnifiedFormData } from '@/lib/ad-config/types';

export function DetailInfoPanel({
    objective,
    formData,
    onFormChange,
    referenceImage,
    referenceImageFileName,
    isDragging,
    onRemoveImage,
    onDragOver,
    onDragLeave,
    onDrop,
    onImageUpload,
}: {
    objective: AdObjectiveId;
    formData: UnifiedFormData;
    onFormChange: (changes: Partial<UnifiedFormData>) => void;
    referenceImage: string | null;
    referenceImageFileName?: string;
    isDragging: boolean;
    onRemoveImage: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-gray-200">
            <div className="flex w-full items-center justify-between border-b border-gray-50 bg-gray-50/20 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 text-sm font-bold text-white shadow-sm">3</div>
                    <div className="text-left">
                        <h2 className="font-bold text-gray-900">詳細情報</h2>
                        <p className="mt-0.5 text-xs text-gray-500">目的ごとの情報を入力・抽出</p>
                    </div>
                </div>
            </div>
            <div className="animate-fade-in space-y-5 px-6 py-6">
                <DynamicFormFields
                    objective={objective}
                    formData={formData}
                    onChange={onFormChange}
                />

                <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">参考画像（任意）</label>

                    {referenceImage ? (
                        <div className="relative">
                            <div className="relative overflow-hidden rounded-xl border-2 border-purple-300 bg-gray-50">
                                <Image
                                    src={referenceImage}
                                    alt="参考画像プレビュー"
                                    width={512}
                                    height={512}
                                    unoptimized
                                    className="h-auto max-h-32 w-full object-contain"
                                />
                                <button
                                    type="button"
                                    onClick={onRemoveImage}
                                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-colors hover:bg-red-600"
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="mt-1 text-center text-xs text-gray-400">{referenceImageFileName}</p>
                        </div>
                    ) : (
                        <label
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            className={`flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
                                isDragging
                                    ? 'scale-[0.98] border-purple-500 bg-purple-50 shadow-inner'
                                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                            }`}
                        >
                            <div className="flex items-center gap-2 py-3">
                                <svg className={`h-6 w-6 ${isDragging ? 'animate-bounce text-purple-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-sm text-gray-500">
                                    {isDragging ? (
                                        <span className="font-bold text-purple-600">ここにドロップしてアップロード</span>
                                    ) : (
                                        <><span className="font-semibold text-purple-600">クリック</span> または <span className="font-semibold text-purple-600">ドラッグ＆ドロップ</span> (最大5MB)</>
                                    )}
                                </span>
                            </div>
                            <input type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
                        </label>
                    )}
                </div>
            </div>
        </section>
    );
}
