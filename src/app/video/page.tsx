"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  CheckCircle2,
  Download,
  Image as ImageIcon,
  Layers,
  Loader2,
  Sparkles,
  TriangleAlert,
  Video,
  Wand2,
  X,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { DEFAULT_FORM_DATA, type AdObjectiveId, AD_OBJECTIVES, type UnifiedFormData } from "@/lib/ad-config/types";
import { ObjectiveSelector } from "@/components/ad-config/ObjectiveSelector";
import { DynamicFormFields } from "@/components/ad-config/DynamicFormFields";
import type { VideoConcept } from "@/types/video";

const videoFormats = [
  { id: "instagram-story", name: "Instagram ストーリー / TikTok", size: "1080×1920", width: 1080, height: 1920, icon: "📱" },
  { id: "instagram-feed", name: "Instagram フィード / 正方形", size: "1080×1080", width: 1080, height: 1080, icon: "📸" },
  { id: "youtube-landscape", name: "YouTube / ワイド広告", size: "1920×1080", width: 1920, height: 1080, icon: "📺" },
  { id: "facebook-portrait", name: "Facebook ポートレート", size: "1080×1350", width: 1080, height: 1350, icon: "👥" },
] as const;

const VideoPreview = dynamic(() => import("@/components/video/VideoPlayer"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center gap-3 rounded-md bg-gray-900 text-white">
      <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
      <span className="text-sm font-medium text-gray-400">Loading Preview...</span>
    </div>
  ),
});

const purposeLabels: Record<string, string> = {
  hook: "冒頭フック",
  problem: "課題提示",
  benefit: "価値訴求",
  proof: "信頼補強",
  offer: "オファー",
  cta: "CTA",
};

function getPrimaryHeadline(formData: UnifiedFormData) {
  return (
    formData.productName ||
    formData.campaignName ||
    formData.eventName ||
    formData.jobTitle ||
    formData.brandName ||
    formData.appName ||
    formData.materialName ||
    formData.storeName ||
    "広告タイトル"
  );
}

function getPrimarySupport(formData: UnifiedFormData) {
  return (
    formData.catchCopy ||
    formData.description ||
    formData.discountInfo ||
    formData.eventContent ||
    formData.brandMessage ||
    formData.appFeatures ||
    formData.materialBenefits ||
    formData.storeLocation ||
    "ここに訴求ポイントが入ります"
  );
}

function getObjectiveName(objective: string) {
  return AD_OBJECTIVES.find((item) => item.id === objective)?.name || "動画広告";
}

function buildDraftConcept(params: {
  formData: UnifiedFormData;
  selectedFormat: string;
  duration: number;
}): VideoConcept {
  const { formData, selectedFormat, duration } = params;
  const headline = getPrimaryHeadline(formData);
  const support = getPrimarySupport(formData);
  const cta = formData.leadCallToAction || formData.specialOffer || formData.appDownloadBenefit || "詳しくはこちら";
  const colors = [formData.primaryColor, formData.secondaryColor] as [string, string];
  const first = Math.max(3, Math.floor(duration * 0.3));
  const second = Math.max(3, Math.floor(duration * 0.35));
  const third = Math.max(3, duration - first - second);

  return {
    title: `${headline} の動画構成`,
    objective: formData.objective,
    formatId: selectedFormat,
    totalDuration: duration,
    bgmMood: "upbeat-modern",
    globalCtaText: cta,
    scenes: [
      {
        id: "scene-hook",
        purpose: "hook",
        headline,
        subcopy: support,
        badgeText: formData.price || formData.discountInfo || "NEW",
        ctaText: undefined,
        durationSeconds: first,
        imagePrompt: `${headline}, premium advertising visual, hero shot, high contrast, clean composition`,
        visualDirection: "商品やサービスを大きく見せるヒーロー構図",
        bgColors: colors,
        layout: "split-hero" as const,
        textAlign: "left" as const,
        motionPreset: "snappy-product" as const,
      },
      {
        id: "scene-benefit",
        purpose: "benefit",
        headline: formData.targetAudience || formData.brandCoreValue || "価値をわかりやすく訴求",
        subcopy: support,
        badgeText: undefined,
        ctaText: undefined,
        durationSeconds: second,
        imagePrompt: `${headline}, lifestyle commercial visual, premium brand ad, editorial composition`,
        visualDirection: "利用シーンや価値が伝わる中盤カット",
        bgColors: colors,
        layout: "editorial-center" as const,
        textAlign: "center" as const,
        motionPreset: "calm-editorial" as const,
      },
      {
        id: "scene-cta",
        purpose: "cta",
        headline: "今すぐチェック",
        subcopy: cta,
        badgeText: undefined,
        ctaText: cta,
        durationSeconds: third,
        imagePrompt: "final call to action advertising visual, bold premium composition, conversion focused",
        visualDirection: "CTAを中央に据えた締めのカット",
        bgColors: colors,
        layout: "floating-product" as const,
        textAlign: "center" as const,
        motionPreset: "bold-promo" as const,
      },
    ],
  };
}

export default function VideoGeneratorPage() {
  const [formData, setFormData] = useState<UnifiedFormData>(DEFAULT_FORM_DATA);
  const [selectedFormat, setSelectedFormat] = useState<string>(videoFormats[1].id);
  const [imageUrl, setImageUrl] = useState("");
  const [instruction, setInstruction] = useState("");
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderStatus, setRenderStatus] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(15);
  const [suggestedConcept, setSuggestedConcept] = useState<VideoConcept | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fps = 30;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const currentFormat = videoFormats.find((format) => format.id === selectedFormat) || videoFormats[1];

  const draftConcept = useMemo(
    () => buildDraftConcept({ formData, selectedFormat, duration }),
    [formData, selectedFormat, duration]
  );

  const activeConcept = suggestedConcept ?? draftConcept;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert("ファイルサイズは5MB以下にしてください。");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUploadingImage(base64);
      setImageUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleAIGenerate = async () => {
    if (!instruction.trim()) {
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/video/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction,
          imageUrl: uploadingImage || imageUrl || undefined,
          objective: formData.objective,
          selectedFormat,
          duration,
          formData,
        }),
      });

      if (!res.ok) {
        throw new Error("AI生成に失敗しました");
      }

      const data = await res.json();
      if (data.success && data.data) {
        const concept = data.data as VideoConcept;
        setSuggestedConcept(concept);
        setDuration(concept.totalDuration);
        if (concept.formatId && videoFormats.some((format) => format.id === concept.formatId)) {
          setSelectedFormat(concept.formatId);
        }
      }
    } catch (error) {
      console.error(error);
      alert("AIからの構成案取得に失敗しました。");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    setIsRendering(true);
    setRenderStatus("サーバー接続中...");
    setPreviewUrl(null);

    try {
      const res = await fetch("/api/video/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputProps: {
            ...activeConcept,
            imageUrl,
          },
          config: {
            width: currentFormat.width,
            height: currentFormat.height,
            fps,
            durationInFrames: activeConcept.scenes.reduce(
              (sum, scene) => sum + Math.round(scene.durationSeconds * fps),
              0
            ),
          },
        }),
      });

      if (!res.ok) {
        throw new Error("レンダリングに失敗しました");
      }

      setRenderStatus("動画データを生成中...");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      setPreviewUrl(url);
      setRenderStatus("生成完了！");
      window.setTimeout(() => setRenderStatus(null), 2000);
    } catch (error) {
      console.error(error);
      alert("動画レンダリングに失敗しました。");
      setRenderStatus(null);
    } finally {
      setIsRendering(false);
    }
  };

  const downloadFile = () => {
    if (!previewUrl) {
      return;
    }
    const anchor = document.createElement("a");
    anchor.href = previewUrl;
    anchor.download = `ad-video-${Date.now()}.mp4`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-orange-50/50 via-purple-50/30 to-indigo-50/50">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-orange-200/20 to-transparent blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-purple-200/20 to-transparent blur-[100px]" />
      </div>

      <AppHeader />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-gray-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md">
              <Video className="h-5 w-5" />
            </span>
            動画広告の生成
          </h1>
          <span className="rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-purple-700">
            Scene Planner
          </span>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50/50 shadow-sm">
              <div className="pointer-events-none absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-gradient-to-bl from-purple-200/40 to-transparent blur-3xl" />
              <div className="flex items-center justify-between border-b border-indigo-100/50 bg-white/40 px-6 py-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-sm font-bold leading-tight text-gray-900">AIにお任せ構成生成</h2>
                    <p className="text-[11px] text-gray-500">Geminiがシーン構成、コピー、画像プロンプトをまとめて提案します</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 space-y-4 px-6 py-5">
                <textarea
                  className="h-24 w-full resize-none rounded-xl border border-indigo-200/60 bg-white/80 px-4 py-3 text-sm text-gray-900 placeholder-indigo-300 shadow-inner backdrop-blur-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="例: 新作スキンケア商品の高級感ある15秒広告。最初の3秒で惹きつけて、最後は購入導線を強めたい"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                />

                <button
                  onClick={handleAIGenerate}
                  disabled={!instruction.trim() || isGenerating}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  {isGenerating ? "構成を考え中..." : "AI構成案を生成"}
                </button>
              </div>
            </section>

            <ObjectiveSelector
              selectedObjective={formData.objective as AdObjectiveId}
              onChange={(id) => {
                setFormData((prev) => ({ ...prev, objective: id }));
                setSuggestedConcept(null);
              }}
            />

            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white/70 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/20 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 text-sm font-bold text-white shadow-sm">2</div>
                  <h2 className="font-bold text-gray-900">フォーマット選択</h2>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 px-6 py-6 md:grid-cols-4">
                {videoFormats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => {
                      setSelectedFormat(format.id);
                      setSuggestedConcept(null);
                    }}
                    className={`rounded-xl border-2 p-3 text-left transition-all ${
                      selectedFormat === format.id ? "border-purple-500 bg-purple-50 shadow-sm" : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    <span className="mb-1 block text-xl">{format.icon}</span>
                    <h3 className="text-[11px] font-bold leading-tight text-gray-800">{format.name}</h3>
                    <p className="text-[10px] text-gray-500">{format.size}</p>
                  </button>
                ))}
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white/70 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/20 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-sm font-bold text-white shadow-sm">3</div>
                  <h2 className="text-sm font-bold text-gray-900">詳細情報と素材アップロード</h2>
                </div>
              </div>
              <div className="space-y-6 px-6 py-6">
                <DynamicFormFields
                  objective={formData.objective as AdObjectiveId}
                  formData={formData}
                  onChange={(changes) => {
                    setFormData((prev) => ({ ...prev, ...changes }));
                    setSuggestedConcept(null);
                  }}
                />
                <div className="border-t border-gray-50 pt-4">
                  <label className="mb-3 block text-[11px] font-black uppercase tracking-widest text-gray-400">
                    商品・背景画像素材
                  </label>

                  {imageUrl ? (
                    <div className="group relative">
                      <div className="relative overflow-hidden rounded-2xl border-2 border-purple-500 bg-gray-50 shadow-lg">
                        <div className="relative h-40 w-full">
                          <Image
                            src={imageUrl}
                            alt="Uploaded Ad Asset"
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            unoptimized
                            className="object-contain"
                          />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 backdrop-blur-[2px] transition-all group-hover:opacity-100">
                          <button
                            onClick={() => {
                              setImageUrl("");
                              setUploadingImage(null);
                            }}
                            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-xs font-bold text-white shadow-xl hover:bg-red-600"
                          >
                            <X className="h-4 w-4" />
                            素材を削除
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <label
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-300 ${
                        isDragging ? "border-purple-500 bg-purple-50/80 shadow-inner" : "border-indigo-100 shadow-sm hover:border-purple-300 hover:bg-purple-50"
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className={`rounded-xl p-3 transition-colors ${isDragging ? "bg-purple-100" : "bg-gray-50"}`}>
                          <ImageIcon className={`h-6 w-6 transition-all ${isDragging ? "scale-110 text-purple-600" : "text-indigo-300"}`} />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-gray-700">{isDragging ? "ここにドロップ" : "クリックして素材をアップロード"}</p>
                          <p className="mt-0.5 text-[10px] text-gray-400">ドラッグ＆ドロップにも対応 (最大5MB)</p>
                        </div>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white/70 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/20 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-sm font-bold text-white shadow-sm">4</div>
                  <h2 className="text-sm font-bold tracking-tight text-gray-900">スタイル & カラー</h2>
                </div>
                <button
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, autoColor: !prev.autoColor }));
                    setSuggestedConcept(null);
                  }}
                  className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                    formData.autoColor ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                  }`}
                >
                  {formData.autoColor ? <Sparkles className="h-3 w-3" /> : <Layers className="h-3 w-3" />}
                  {formData.autoColor ? "自動（最適化）" : "手動設定"}
                </button>
              </div>
              <div className="space-y-6 px-6 py-6">
                {formData.autoColor ? (
                  <div className="rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-indigo-50 p-4">
                    <div className="flex items-center gap-3">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      <div>
                        <p className="text-[11px] font-bold text-gray-800">AIによる自動配色・スタイル最適化</p>
                        <p className="text-[10px] text-gray-500">画像と訴求内容に合わせて、構成案ごとに色を最適化します。</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400">Main Color</label>
                      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2">
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, primaryColor: e.target.value, autoColor: false }));
                            setSuggestedConcept(null);
                          }}
                          className="h-8 w-8 cursor-pointer rounded-lg border-none bg-transparent"
                        />
                        <span className="text-[10px] font-bold leading-none tracking-tight text-gray-600">{formData.primaryColor}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-gray-400">Accent Color</label>
                      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-2">
                        <input
                          type="color"
                          value={formData.secondaryColor}
                          onChange={(e) => {
                            setFormData((prev) => ({ ...prev, secondaryColor: e.target.value, autoColor: false }));
                            setSuggestedConcept(null);
                          }}
                          className="h-8 w-8 cursor-pointer rounded-lg border-none bg-transparent"
                        />
                        <span className="text-[10px] font-bold leading-none tracking-tight text-gray-600">{formData.secondaryColor}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400">再生時間 (Duration)</label>
                    <span className="rounded-md border border-purple-100 bg-purple-50 px-2 py-1 text-xs font-black text-purple-600">{duration}s</span>
                  </div>
                  <div className="px-1">
                    <input
                      type="range"
                      min="3"
                      max="30"
                      step="1"
                      value={duration}
                      onChange={(e) => {
                        setDuration(Number.parseInt(e.target.value, 10));
                        setSuggestedConcept(null);
                      }}
                      className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-100 accent-purple-600"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-gray-50 bg-gray-50/20 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-sm font-bold text-white shadow-sm">5</div>
                  <h2 className="text-sm font-bold text-gray-900">構成プラン</h2>
                </div>
                <span className="text-[11px] font-bold text-gray-500">{getObjectiveName(activeConcept.objective)}</span>
              </div>
              <div className="space-y-4 px-6 py-6">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <p className="text-xs font-bold text-emerald-700">{activeConcept.title}</p>
                  <p className="mt-1 text-[11px] text-emerald-900/70">
                    想定尺 {activeConcept.totalDuration}秒 / BGMムード {activeConcept.bgmMood} / CTA {activeConcept.globalCtaText}
                  </p>
                </div>

                <div className="space-y-3">
                  {activeConcept.scenes.map((scene, index) => (
                    <div key={scene.id} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-xs font-black text-white">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{purposeLabels[scene.purpose] || scene.purpose}</p>
                            <p className="text-[10px] text-gray-500">{scene.durationSeconds}秒</p>
                          </div>
                        </div>
                        {scene.badgeText ? (
                          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold text-orange-700">{scene.badgeText}</span>
                        ) : null}
                      </div>
                      <div className="mt-4 space-y-2">
                        <p className="text-lg font-black tracking-tight text-gray-900">{scene.headline}</p>
                        <p className="text-sm leading-relaxed text-gray-600">{scene.subcopy}</p>
                        <div className="rounded-xl bg-gray-50 p-3">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">Visual Direction</p>
                          <p className="text-xs text-gray-700">{scene.visualDirection}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                            layout: {scene.layout}
                          </span>
                          <span className="rounded-full bg-violet-100 px-2.5 py-1 text-[10px] font-bold text-violet-700">
                            motion: {scene.motionPreset}
                          </span>
                          <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-bold text-sky-700">
                            text: {scene.textAlign}
                          </span>
                        </div>
                        <div className="rounded-xl bg-indigo-50/70 p-3">
                          <p className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
                            <Wand2 className="h-3 w-3" />
                            Image Prompt
                          </p>
                          <p className="text-xs leading-relaxed text-indigo-900/80">{scene.imagePrompt}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-4 lg:sticky lg:top-24">
              <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-xl ring-1 ring-black/5 backdrop-blur-md">
                <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />

                <div className="mb-5 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 font-bold text-gray-900">
                    <Video className="h-4 w-4 text-purple-500" />
                    リアルタイム・プレビュー
                  </h3>
                </div>

                <div
                  className="group/player relative mx-auto overflow-hidden rounded-xl border border-gray-800 bg-black shadow-2xl"
                  style={{ aspectRatio: `${currentFormat.width} / ${currentFormat.height}`, maxHeight: "60vh" }}
                >
                  <VideoPreview
                    concept={activeConcept}
                    imageUrl={imageUrl}
                    width={currentFormat.width}
                    height={currentFormat.height}
                    fps={fps}
                  />

                  {isRendering ? (
                    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/70 px-6 text-center text-white backdrop-blur-md">
                      <Loader2 className="mb-4 h-12 w-12 animate-spin text-purple-400" />
                      <p className="mb-1 text-sm font-black uppercase tracking-widest">{renderStatus}</p>
                      <p className="text-[10px] italic text-gray-400">サーバーで動画を組み立てています...</p>
                    </div>
                  ) : null}
                </div>

                <div className="mt-8 space-y-3">
                  <button
                    onClick={handleGenerate}
                    disabled={isRendering || isGenerating}
                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-4 text-lg font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-50"
                  >
                    {isRendering ? <Loader2 className="h-5 w-5 animate-spin" /> : <Video className="h-5 w-5" />}
                    {isRendering ? "レンダリング中..." : "MP4動画として出力"}
                  </button>

                  {previewUrl ? (
                    <div className="animate-in slide-in-from-top-2 space-y-2 duration-300">
                      <button
                        onClick={downloadFile}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-green-600"
                      >
                        <Download className="h-4 w-4" />
                        動画をダウンロード
                      </button>
                      <div className="flex items-center justify-center gap-2 rounded-lg border border-green-100 bg-green-50 py-1.5 text-[10px] font-bold text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        プレビュー準備完了
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-dashed border-gray-100 bg-white/40 p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <TriangleAlert className="mt-0.5 h-5 w-5 text-orange-400" />
                  <div>
                    <p className="mb-1 text-[11px] font-black uppercase tracking-tight text-gray-700">レンダリングに関する制限</p>
                    <p className="text-[10px] font-medium leading-relaxed text-gray-500">
                      高品質画像を各シーンに割り当てると、さらに見栄えが上がります。現状は1枚の素材を全シーンに流用します。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {previewUrl ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl md:flex-row">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-hidden bg-black">
              <video src={previewUrl} controls autoPlay loop className="h-full w-full object-contain" />
            </div>

            <div className="flex w-full flex-col justify-between border-l border-gray-100 bg-white p-8 md:w-80">
              <div className="space-y-6">
                <div>
                  <h2 className="mb-2 text-2xl font-black text-gray-900">COMPLETE!</h2>
                  <p className="text-sm text-gray-500">動画の生成が完了しました。内容を確認して保存してください。</p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl border border-indigo-100/50 bg-indigo-50/50 p-4">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-indigo-600">Format</p>
                    <p className="text-sm font-bold text-gray-800">{currentFormat.name}</p>
                  </div>
                  <div className="rounded-xl border border-purple-100/50 bg-purple-50/50 p-4">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-purple-600">Scenes</p>
                    <p className="text-sm font-bold text-gray-800">
                      {activeConcept.scenes.length} scenes / {activeConcept.totalDuration} seconds
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 space-y-3">
                <button
                  onClick={downloadFile}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-4 font-black text-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
                >
                  <Download className="h-5 w-5" />
                  動画を保存する
                </button>
                <button onClick={() => setPreviewUrl(null)} className="w-full py-3 text-sm font-bold text-gray-400 transition-colors hover:text-gray-600">
                  編集に戻る
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
