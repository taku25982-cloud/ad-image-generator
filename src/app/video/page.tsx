"use client";

import { useState } from "react";
import { Player } from "@remotion/player";
import { AdVideo } from "@/remotion/AdVideo";
import { Settings2, Download, TriangleAlert, Video, Image as ImageIcon, FileText, Palette, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import React from "react";

export default function VideoGeneratorPage() {
  const [titleText, setTitleText] = useState("NEW ITEM\nLUMINOUS V2");
  const [subText, setSubText] = useState("Experience the next generation.");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1550009158-9effb64fda70?q=80&w=2670&auto=format&fit=crop");
  const [bgColors, setBgColors] = useState(["#1e1b4b", "#4c1d95"]);
  
  // States
  const [instruction, setInstruction] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderStatus, setRenderStatus] = useState<string | null>(null);
  
  // Size options
  const sizes = [
    { label: "16:9 (横長)", width: 1920, height: 1080 },
    { label: "9:16 (縦長)", width: 1080, height: 1920 },
    { label: "1:1 (正方形)", width: 1080, height: 1080 },
  ];
  const [activeSize, setActiveSize] = useState(0);

  // Duration
  const [duration, setDuration] = useState(15);
  const fps = 30;

  const currentSize = sizes[activeSize];

  const handleAIGenerate = async () => {
    if (!instruction.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/video/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instruction,
          imageUrl: imageUrl || undefined, // Provide current image as context if available
        }),
      });

      if (!res.ok) {
        throw new Error('AI生成に失敗しました');
      }

      const data = await res.json();
      if (data.success && data.data) {
        const d = data.data;
        if (d.titleText) setTitleText(d.titleText);
        if (d.subText) setSubText(d.subText);
        if (d.bgColors && d.bgColors.length === 2) setBgColors(d.bgColors);
        if (typeof d.formatIndex === 'number' && sizes[d.formatIndex]) setActiveSize(d.formatIndex);
        if (typeof d.duration === 'number') setDuration(Math.max(3, Math.min(30, d.duration)));
      }
    } catch (e) {
      alert("AIからの提案の取得に失敗しました。時間をおいて再試行してください。");
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // MP4 レンダリング & ダウンロード処理
  const handleDownload = async () => {
    setIsRendering(true);
    setRenderStatus("サーバー接続中...");
    
    try {
      // 本来は本番環境のRender.comなどのエンドポイントを叩く
      // 今回はAPIルート経由でプロキシする想定
      const res = await fetch('/api/video/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputProps: { titleText, subText, imageUrl, bgColors },
          config: {
            width: currentSize.width,
            height: currentSize.height,
            fps,
            durationInFrames: duration * fps,
          }
        }),
      });

      if (!res.ok) {
        let errorMsg = 'レンダリングに失敗しました';
        try {
          const err = await res.json();
          errorMsg = err.error || errorMsg;
        } catch(e) {}
        throw new Error(errorMsg);
      }

      setRenderStatus("動画データをダウンロード中...");
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ad-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      setRenderStatus("完了！");
      setTimeout(() => setRenderStatus(null), 3000);

    } catch (e: any) {
      console.error(e);
      alert(`エラー: ${e.message}`);
      setRenderStatus(null);
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-purple-50/30 to-indigo-50/50 relative">
      {/* 背景デコレーション */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-orange-200/20 to-transparent rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full blur-[100px]" />
      </div>

      {/* 共通ヘッダー */}
      <AppHeader />

      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
              <Video className="w-5 h-5" />
            </span>
            動画広告の生成 (Beta)
          </h1>
          <span className="px-3 py-1 text-xs font-bold rounded-full bg-purple-100 text-purple-700 border border-purple-200">
            Remotion Studio
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 左カラム: 入力フォーム */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* AI提案セクション */}
            <section className="bg-gradient-to-br from-indigo-50 to-purple-50/50 rounded-2xl border border-indigo-100 overflow-hidden shadow-sm relative">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-purple-200/40 to-transparent rounded-full blur-3xl pointer-events-none" />
              <div className="w-full px-6 py-4 flex items-center justify-between border-b border-indigo-100/50 bg-white/40 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                          <h2 className="font-bold text-gray-900 leading-tight">AIにお任せ (ジェネレート)</h2>
                          <p className="text-[11px] text-gray-500 mt-0.5">作りたい動画のイメージを伝えてください</p>
                      </div>
                  </div>
              </div>

              <div className="px-6 py-5 relative z-10 space-y-4">
                <textarea
                  className="w-full bg-white/80 backdrop-blur-sm border border-indigo-200/60 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-inner h-24 resize-none"
                  placeholder="例: この靴の画像を使って、春の10代向けポップなセール広告を作って！"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                />
                
                <button
                  onClick={handleAIGenerate}
                  disabled={!instruction.trim() || isGenerating}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      最適な構成を考え中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      AIに動画を構成してもらう
                    </>
                  )}
                </button>
              </div>
            </section>

            {/* 設定セクション */}
            <section className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 hover:border-gray-200 overflow-hidden transition-all duration-300 shadow-[0_0_40px_rgba(0,0,0,0.02)]">
              <div className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-50 bg-gray-50/20">
                  <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        <Settings2 className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                          <h2 className="font-bold text-gray-900">構成パラメータ</h2>
                          <p className="text-xs text-gray-500 mt-0.5">動画のテキストやサイズを設定</p>
                      </div>
                  </div>
              </div>

              <div className="px-6 py-6 space-y-8 animate-fade-in">
                {/* Text Controls */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-500" /> テキスト設定
                  </label>
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm"
                      placeholder="メインのキャッチコピー (例: NEW ARRIVAL)"
                      value={titleText}
                      onChange={(e) => setTitleText(e.target.value)}
                    />
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm"
                      placeholder="サブテキスト (例: 全品30%OFFの特別セール開催中)"
                      value={subText}
                      onChange={(e) => setSubText(e.target.value)}
                    />
                  </div>
                </div>

                {/* Media Controls */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-500" /> メディアアセット URL
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all shadow-sm"
                    placeholder="画像のURLを入力"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 ml-1">AIで生成した画像のURLを貼り付けることも可能です。</p>
                </div>

                {/* Video Format */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-purple-500" /> 動画フォーマット
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {sizes.map((s, idx) => (
                      <button
                        key={s.label}
                        onClick={() => setActiveSize(idx)}
                        className={`py-3 px-2 rounded-xl text-sm font-bold transition-all ${
                          activeSize === idx
                            ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/20 ring-1 ring-purple-400"
                            : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-white hover:border-purple-300"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Duration */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-gray-700">尺（秒数）</label>
                    <span className="text-sm font-bold text-purple-600 bg-purple-50 border border-purple-100 px-3 py-1 rounded-lg">
                      {duration} 秒
                    </span>
                  </div>
                  <input
                    type="range"
                    min={3}
                    max={30}
                    step={1}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 font-medium px-1">
                    <span>3s</span>
                    <span>15s</span>
                    <span>30s</span>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* 右カラム: プレビュー & 結果 */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 space-y-6">

              {/* Warning Message */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800 text-sm flex gap-3 shadow-sm">
                <TriangleAlert className="w-5 h-5 shrink-0 text-amber-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-900">Render Server (Beta)</p>
                  <p className="text-xs leading-relaxed text-amber-800">
                    無料枠の外部サーバーでレンダリングを行うため、初回起動に<strong>50秒以上</strong>かかる場合があります。
                  </p>
                </div>
              </div>

              {/* Player Canvas */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 p-6 shadow-lg relative overflow-hidden">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Loader2 className={`w-4 h-4 text-purple-500 ${isRendering ? 'animate-spin' : ''}`} />
                  リアルタイムプレビュー
                </h3>

                <div className="w-full flex items-center justify-center bg-gray-100/50 rounded-xl p-4 border border-gray-200 overflow-hidden relative">
                  
                  {/* Checkerboard Pattern for transparency illustration */}
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />

                  {/* The Player container bounding box */}
                  <div 
                    className="relative z-10 shadow-2xl rounded-md overflow-hidden ring-1 ring-black/5 bg-black transition-all duration-500 ease-out"
                    style={{
                      maxHeight: "360px",
                      maxWidth: "100%",
                      aspectRatio: `${currentSize.width} / ${currentSize.height}`,
                    }}
                  >
                    <Player
                      component={AdVideo}
                      inputProps={{
                        titleText,
                        subText,
                        imageUrl,
                        // AI-generated or default colors
                        bgColors, 
                      }}
                      durationInFrames={duration * fps}
                      fps={fps}
                      compositionWidth={currentSize.width}
                      compositionHeight={currentSize.height}
                      style={{
                        width: "100%",
                        height: "100%",
                      }}
                      controls
                      loop
                      autoPlay
                    />
                  </div>
                </div>
              </div>

              {/* Render Button */}
              <button 
                onClick={handleDownload}
                disabled={isRendering || isGenerating}
                className={`w-full py-4 bg-gradient-to-r from-orange-500 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRendering ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>{renderStatus}</span>
                  </>
                ) : renderStatus === "完了！" ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    <span>完了！</span>
                  </>
                ) : (
                  <>
                    <Download className="w-6 h-6" />
                    <span>MP4を生成してダウンロード</span>
                  </>
                )}
              </button>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
