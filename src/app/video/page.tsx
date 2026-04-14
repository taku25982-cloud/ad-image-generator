"use client";

import Image from "next/image";
import { Suspense, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Clapperboard,
  Download,
  ImagePlus,
  Loader2,
  Lock,
  PlayCircle,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAuth } from "@/components/providers/AuthProvider";
import { canUseVeo, getVeoCreditCost } from "@/lib/video-billing";
import { getVeoAspectRatioFromFormat } from "@/lib/veo";

const videoFormats = [
  {
    id: "instagram-story",
    name: "Vertical Ad",
    label: "Instagram Story / TikTok",
    size: "1080 x 1920",
    ratio: "9:16",
    accent: "from-orange-400 to-rose-500",
  },
  {
    id: "instagram-feed",
    name: "Square Spot",
    label: "Instagram Feed",
    size: "1080 x 1080",
    ratio: "1:1 preview / 9:16 generation",
    accent: "from-fuchsia-400 to-violet-500",
  },
  {
    id: "youtube-landscape",
    name: "Wide Trailer",
    label: "YouTube / LP Hero",
    size: "1920 x 1080",
    ratio: "16:9",
    accent: "from-sky-400 to-cyan-500",
  },
  {
    id: "facebook-portrait",
    name: "Portrait Promo",
    label: "Facebook Portrait",
    size: "1080 x 1350",
    ratio: "9:16 generation",
    accent: "from-emerald-400 to-teal-500",
  },
] as const;

const veoDurations = [
  { value: "4", label: "4秒", note: "最短で試す" },
  { value: "6", label: "6秒", note: "標準" },
  { value: "8", label: "8秒", note: "表現を伸ばす" },
] as const;

const promptStarterChips = [
  "高級感あるスキンケア広告。ガラス瓶に朝の光、繊細な水滴、静かな高揚感。",
  "D2C食品ブランドの短尺広告。テンポ良く素材を見せ、最後に購入意欲を強くする。",
  "SaaSの採用動画。都会的なオフィス、信頼感のある人物描写、未来志向の音。",
  "アプリ訴求動画。スマホUIを主役に、軽快で洗練されたモーション、CV重視。",
] as const;

const craftNotes = [
  "冒頭1秒で主役と価値が見えるように書く",
  "被写体、背景、カメラ、音、感情を短く積み上げる",
  "字幕や文字焼き込みが不要なら明示する",
  "広告の最後は CTA の空気感まで指定する",
] as const;

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function VideoGeneratorPageContent() {
  const { userDoc } = useAuth();
  const searchParams = useSearchParams();
  const [selectedFormat, setSelectedFormat] = useState<string>(searchParams.get("format") || videoFormats[0].id);
  const [veoDuration, setVeoDuration] = useState<(typeof veoDurations)[number]["value"]>(
    (searchParams.get("duration") as (typeof veoDurations)[number]["value"]) || "6"
  );
  const [prompt, setPrompt] = useState(searchParams.get("prompt") || "");
  const [brandHint, setBrandHint] = useState(searchParams.get("brandHint") || "");
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isVeoGenerating, setIsVeoGenerating] = useState(false);
  const [veoStatus, setVeoStatus] = useState<string | null>(null);
  const [veoVideoUrl, setVeoVideoUrl] = useState<string | null>(null);
  const [savedHistoryId, setSavedHistoryId] = useState<string | null>(null);

  const currentPlan = userDoc?.subscription?.plan || "free";
  const veoAvailable = canUseVeo(currentPlan);
  const veoCreditsRequired = getVeoCreditCost(veoDuration);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedFormatMeta = useMemo(
    () => videoFormats.find((format) => format.id === selectedFormat) || videoFormats[0],
    [selectedFormat]
  );

  const finalPrompt = useMemo(() => {
    const base = prompt.trim();
    const brand = brandHint.trim();
    const formatHint = `Format preference: ${getVeoAspectRatioFromFormat(selectedFormat)} cinematic advertising video.`;
    const cleanOutputHint = "No subtitles, no burned-in text overlays, polished commercial finish, native audio.";

    return [brand ? `Brand / offer context: ${brand}.` : "", base, formatHint, cleanOutputHint]
      .filter(Boolean)
      .join(" ");
  }, [brandHint, prompt, selectedFormat]);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleVeoGenerate = async () => {
    if (!finalPrompt.trim()) {
      alert("まずは動画プロンプトを入力してください。");
      return;
    }

    setSavedHistoryId(null);
    setIsVeoGenerating(true);
    setVeoStatus("Veo 3.1 Lite にリクエストを送信しています...");

    try {
      const startRes = await fetch("/api/video/veo/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          imageUrl: uploadingImage || imageUrl || undefined,
          durationSeconds: Number(veoDuration),
          aspectRatio: getVeoAspectRatioFromFormat(selectedFormat),
        }),
      });

      const startData = await startRes.json();
      if (!startRes.ok || !startData.operationName) {
        throw new Error(startData.error || "Veo生成の開始に失敗しました。");
      }

      for (let attempt = 0; attempt < 36; attempt += 1) {
        setVeoStatus(`Veoがレンダリング中です... ${attempt + 1} / 36`);
        await sleep(10000);

        const statusRes = await fetch(`/api/video/veo/status?operationName=${encodeURIComponent(startData.operationName)}`);
        const statusData = await statusRes.json();

        if (!statusRes.ok) {
          throw new Error(statusData.error || "Veoの状態取得に失敗しました。");
        }

        if (statusData.state === "failed") {
          throw new Error(statusData.error || "Veo生成が失敗しました。");
        }

        if (statusData.state === "completed" && statusData.fileName) {
          setVeoStatus("保存用に動画を確定しています...");

          const finalizeRes = await fetch("/api/video/veo/finalize", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              operationName: startData.operationName,
              fileName: statusData.fileName,
              fileUri: statusData.fileUri,
              downloadUri: statusData.downloadUri,
              prompt: finalPrompt,
              formatId: selectedFormat,
              durationSeconds: Number(veoDuration),
              aspectRatio: getVeoAspectRatioFromFormat(selectedFormat),
              brandHint,
            }),
          });

          const finalizeData = await finalizeRes.json();
          if (!finalizeRes.ok || !finalizeData.assetUrl) {
            throw new Error(finalizeData.error || "Veo動画の保存に失敗しました。");
          }

          setVeoVideoUrl(finalizeData.assetUrl);
          setSavedHistoryId(finalizeData.historyId || null);
          setVeoStatus("生成完了。履歴にも保存されました。");
          return;
        }
      }

      throw new Error("Veo生成の完了待ちがタイムアウトしました。");
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Veo生成中にエラーが発生しました。");
      setVeoStatus(null);
    } finally {
      setIsVeoGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-purple-50/20 to-indigo-50/50 text-gray-900">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.18),_transparent_26%),radial-gradient(circle_at_82%_18%,_rgba(125,211,252,0.20),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(216,180,254,0.20),_transparent_26%)]" />
        <div className="absolute right-0 top-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-orange-200/30 to-transparent blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-purple-200/25 to-transparent blur-[100px]" />
      </div>

      <AppHeader />

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8 md:px-8 md:py-10">
        <section className="mb-8 overflow-hidden rounded-[32px] border border-white/70 bg-white/75 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="grid gap-8 px-6 py-8 md:grid-cols-[1.2fr_0.8fr] md:px-8 md:py-10">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-700">
                <Sparkles className="h-3.5 w-3.5" />
                Veo Studio
              </div>
              <h1 className="max-w-3xl text-4xl font-black tracking-[-0.04em] text-gray-900 md:text-6xl">
                プロンプトから
                <span className="bg-gradient-to-r from-orange-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent"> 広告動画 </span>
                をそのまま作る
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
                他のページと同じ明るいトーンに合わせた `Veo 3.1 Lite` 専用ページです。複雑な構成編集ではなく、
                クリエイティブ brief を直接入力して短尺広告をすばやく作る流れに絞っています。
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-gray-200 bg-white/75 p-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">Current Plan</p>
                  <p className="mt-2 text-2xl font-black capitalize text-gray-900">{currentPlan}</p>
                  <p className="mt-1 text-xs text-gray-500">{veoAvailable ? "動画生成が利用可能" : "Starter以上で解放"}</p>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white/75 p-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">Credits</p>
                  <p className="mt-2 text-2xl font-black text-gray-900">{userDoc?.credits ?? 0} cr</p>
                  <p className="mt-1 text-xs text-gray-500">今回の生成は {veoCreditsRequired}cr</p>
                </div>
                <div className="rounded-3xl border border-gray-200 bg-white/75 p-4 shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gray-400">Mode</p>
                  <p className="mt-2 text-2xl font-black text-gray-900">{imageUrl ? "Image-to-Video" : "Text-to-Video"}</p>
                  <p className="mt-1 text-xs text-gray-500">{getVeoAspectRatioFromFormat(selectedFormat)} / {veoDuration}秒</p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-gray-200 bg-gradient-to-br from-orange-50 via-white to-cyan-50 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-gray-700">Prompt Craft Notes</p>
                <WandSparkles className="h-4 w-4 text-cyan-500" />
              </div>
              <div className="mt-4 space-y-3">
                {craftNotes.map((note) => (
                  <div key={note} className="rounded-2xl border border-white bg-white/80 px-4 py-3 text-sm leading-6 text-gray-600 shadow-sm">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="space-y-6">
            <div className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-orange-500/80">Creative Brief</p>
                  <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-gray-900">何を見せ、どう売るかを書く</h2>
                </div>
                <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
                  Direct Prompting
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Brand Hint</label>
                  <input
                    value={brandHint}
                    onChange={(event) => setBrandHint(event.target.value)}
                    placeholder="例: プレミアム炭酸美容液 / 初回限定30%OFF / 20代後半女性向け"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200/70"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Main Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder="例: 高級感ある美容液の短尺広告。暗い背景からガラス瓶が現れ、光が液体を通り抜ける。最初の1秒で視線を止め、後半は肌に触れるカットと静かな高揚感。ネイティブ音あり。最後は購入したくなる余韻。"
                    className="h-56 w-full resize-none rounded-[24px] border border-gray-200 bg-white px-5 py-4 text-sm leading-7 text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-200/70"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {promptStarterChips.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => setPrompt(chip)}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-600 transition-all hover:border-cyan-200 hover:bg-cyan-50 hover:text-gray-900"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <div className="mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-orange-500/80">Format</p>
                  <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-gray-900">配信先に合わせる</h3>
                </div>
                <div className="space-y-3">
                  {videoFormats.map((format) => {
                    const active = selectedFormat === format.id;
                    return (
                      <button
                        key={format.id}
                        onClick={() => setSelectedFormat(format.id)}
                        className={`w-full rounded-[24px] border p-4 text-left transition-all ${
                          active
                            ? "border-cyan-200 bg-cyan-50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <div className={`mb-3 h-1.5 rounded-full bg-gradient-to-r ${format.accent}`} />
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-gray-900">{format.name}</p>
                            <p className="mt-1 text-xs text-gray-500">{format.label}</p>
                          </div>
                          <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
                            {format.ratio}
                          </span>
                        </div>
                        <p className="mt-3 text-xs text-gray-400">{format.size}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[30px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur-xl">
                <div className="mb-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-orange-500/80">Source & Duration</p>
                  <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-gray-900">素材と尺を決める</h3>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {veoDurations.map((option) => {
                    const active = veoDuration === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => setVeoDuration(option.value)}
                        className={`rounded-[22px] border px-3 py-4 text-center transition-all ${
                          active
                            ? "border-cyan-200 bg-cyan-50 text-gray-900"
                            : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-900"
                        }`}
                      >
                        <p className="text-lg font-black">{option.label}</p>
                        <p className="mt-1 text-[11px]">{option.note}</p>
                        <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-600">
                          {getVeoCreditCost(option.value)}cr
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Reference Image</label>
                  {imageUrl ? (
                    <div className="rounded-[26px] border border-gray-200 bg-gray-50 p-3">
                      <div className="relative overflow-hidden rounded-[20px] border border-gray-200 bg-white">
                        <div className="relative aspect-[16/10]">
                          <Image
                            src={imageUrl}
                            alt="Reference"
                            fill
                            sizes="(max-width: 768px) 100vw, 600px"
                            unoptimized
                            className="object-contain"
                          />
                        </div>
                        <button
                          onClick={() => {
                            setImageUrl("");
                            setUploadingImage(null);
                          }}
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={(event) => {
                        event.preventDefault();
                        setIsDragging(false);
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        setIsDragging(false);
                        const file = event.dataTransfer.files?.[0];
                        if (file && file.type.startsWith("image/")) {
                          processFile(file);
                        }
                      }}
                      className={`flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-[26px] border border-dashed px-6 py-8 text-center transition-all ${
                        isDragging
                          ? "border-cyan-300 bg-cyan-50"
                          : "border-gray-300 bg-gray-50 hover:border-cyan-200 hover:bg-cyan-50/60"
                      }`}
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                        <ImagePlus className="h-7 w-7 text-cyan-500" />
                      </div>
                      <p className="mt-4 text-sm font-bold text-gray-900">{isDragging ? "ここにドロップ" : "画像をアップロードして image-to-video にする"}</p>
                      <p className="mt-2 max-w-xs text-xs leading-6 text-gray-500">
                        商品写真やブランド素材を入れると、Veoの被写体ブレを減らしやすくなります。最大5MBまで。
                      </p>
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
            </div>
          </section>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/85 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="border-b border-gray-100 px-5 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-orange-500/80">Output Console</p>
                    <h2 className="mt-1 text-2xl font-black tracking-[-0.03em] text-gray-900">生成を実行</h2>
                  </div>
                  <Clapperboard className="h-5 w-5 text-cyan-500" />
                </div>
              </div>

              <div className="space-y-5 px-5 py-5">
                <div className="rounded-[24px] border border-gray-200 bg-gray-50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">Resolved Prompt</p>
                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {finalPrompt || "ここに最終プロンプトが表示されます。Brand Hint と Main Prompt を入力してください。"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-[22px] border border-gray-200 bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">Generation</p>
                    <p className="mt-2 text-lg font-black text-gray-900">{imageUrl ? "Image-to-Video" : "Text-to-Video"}</p>
                    <p className="mt-1 text-xs text-gray-500">{selectedFormatMeta.label}</p>
                  </div>
                  <div className="rounded-[22px] border border-gray-200 bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gray-400">Cost</p>
                    <p className="mt-2 text-lg font-black text-gray-900">{veoCreditsRequired} cr</p>
                    <p className="mt-1 text-xs text-gray-500">残高 {userDoc?.credits ?? 0} cr</p>
                  </div>
                </div>

                {!veoAvailable ? (
                  <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-amber-900">
                    <div className="flex items-center gap-3">
                      <Lock className="h-4 w-4" />
                      <p className="text-sm font-bold">Starter プラン以上で Veo 動画生成を利用できます</p>
                    </div>
                    <p className="mt-2 text-xs leading-6 text-amber-800/80">
                      Freeプランではページ確認まではできますが、生成実行はロックされます。
                    </p>
                  </div>
                ) : null}

                <button
                  onClick={handleVeoGenerate}
                  disabled={isVeoGenerating || !veoAvailable || !finalPrompt.trim()}
                  className="group flex w-full items-center justify-center gap-3 rounded-[24px] bg-gradient-to-r from-orange-500 via-pink-500 to-cyan-500 px-5 py-4 text-sm font-black text-white shadow-[0_16px_32px_rgba(249,115,22,0.22)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(59,130,246,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isVeoGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <PlayCircle className="h-5 w-5 transition-transform group-hover:scale-110" />}
                  {isVeoGenerating ? "Veoで生成中..." : "Veo 3.1 Lite で生成する"}
                </button>

                {veoStatus ? (
                  <div className="rounded-[24px] border border-cyan-200 bg-cyan-50 px-4 py-3">
                    <p className="text-sm font-medium text-cyan-900">{veoStatus}</p>
                  </div>
                ) : null}

                {savedHistoryId ? (
                  <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
                      <CheckCircle2 className="h-4 w-4" />
                      履歴に保存済み
                    </div>
                    <p className="mt-1 text-xs text-emerald-700/80">履歴ページから再利用や比較ができます。</p>
                  </div>
                ) : null}

                <div className="rounded-[26px] border border-gray-200 bg-gray-50 p-3">
                  <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-[20px] border border-gray-200 bg-white">
                    {veoVideoUrl ? (
                      <video src={veoVideoUrl} controls className="h-full w-full" />
                    ) : (
                      <div className="px-8 text-center">
                        <div className="mx-auto flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border border-gray-200 bg-gray-50">
                          <Clapperboard className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="mt-5 text-lg font-black text-gray-800">生成された動画がここに表示されます</p>
                        <p className="mt-2 text-sm leading-7 text-gray-500">
                          今はプレビュー待機状態です。プロンプトを調整して、出力条件を確認してから生成してください。
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {veoVideoUrl ? (
                  <a
                    href={veoVideoUrl}
                    download={`veo-ad-video-${Date.now()}.mp4`}
                    className="flex w-full items-center justify-center gap-2 rounded-[22px] border border-emerald-200 bg-emerald-500 px-5 py-3.5 text-sm font-black text-white transition-colors hover:bg-emerald-400"
                  >
                    <Download className="h-4 w-4" />
                    MP4 をダウンロード
                  </a>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function VideoGeneratorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-purple-50/20 to-indigo-50/50" />}>
      <VideoGeneratorPageContent />
    </Suspense>
  );
}
