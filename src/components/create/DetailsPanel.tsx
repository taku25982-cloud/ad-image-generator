'use client';

import Image from 'next/image';
import { DynamicFormFields } from '@/components/ad-config/DynamicFormFields';
import { type AdObjectiveId, type UnifiedFormData } from '@/lib/ad-config/types';

interface DetailsPanelProps {
    objective: AdObjectiveId;
    formData: UnifiedFormData;
    onFormChange: (changes: Partial<UnifiedFormData>) => void;
    referenceImage: string | null;
    referenceImageFileName?: string;
    isDragging: boolean;
    onDragOver: (e: React.DragEvent<HTMLLabelElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLLabelElement>) => void;
    onDrop: (e: React.DragEvent<HTMLLabelElement>) => void;
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: () => void;
}

export function DetailsPanel({
    objective,
    formData,
    onFormChange,
    referenceImage,
    referenceImageFileName,
    isDragging,
    onDragOver,
    onDragLeave,
    onDrop,
    onImageUpload,
    onRemoveImage,
}: DetailsPanelProps) {
    return (
        <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 hover:border-gray-200 overflow-hidden transition-all duration-300">
            <div className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">3</div>
                    <div className="text-left">
                        <h2 className="font-bold text-gray-900">詳細情報</h2>
                        <p className="text-xs text-gray-500 mt-0.5">目的ごとの情報を入力・抽出</p>
                    </div>
                </div>
            </div>
            <div className="px-6 py-6 space-y-5 animate-fade-in">
                <DynamicFormFields
                    objective={objective}
                    formData={formData}
                    onChange={onFormChange}
                />

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        参考画像（任意）
                    </label>

                    {referenceImage ? (
                        <div className="relative">
                            <div className="relative rounded-xl overflow-hidden border-2 border-purple-300 bg-gray-50">
                                <Image
                                    src={referenceImage}
                                    alt="参考画像プレビュー"
                                    width={512}
                                    height={512}
                                    unoptimized
                                    className="w-full h-auto max-h-32 object-contain"
                                />
                                <button
                                    onClick={onRemoveImage}
                                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1 text-center">{referenceImageFileName}</p>
                        </div>
                    ) : (
                        <label
                            onDragOver={onDragOver}
                            onDragLeave={onDragLeave}
                            onDrop={onDrop}
                            className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                                isDragging
                                    ? 'border-purple-500 bg-purple-50 shadow-inner scale-[0.98]'
                                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/50'
                            }`}
                        >
                            <div className="flex items-center gap-2 py-3">
                                <svg className={`w-6 h-6 ${isDragging ? 'text-purple-600 animate-bounce' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            <input
                                type="file"
                                accept="image/*"
                                onChange={onImageUpload}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            </div>
        </section>
    );
}
