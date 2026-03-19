'use client';

import { useState } from 'react';
import { Star, X, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useFeedbackModalStore } from '@/store/useFeedbackModalStore';

export function FeedbackModal() {
  const { isOpen, closeFeedback } = useFeedbackModalStore();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    
    setStatus('loading');
    
    // シミュレーション（実際はAPIを叩く想定）
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setStatus('success');
    
    // 3秒後にリセットして閉じる
    setTimeout(() => {
      closeFeedback();
      // 少し遅らせて状態を戻す（アニメーション用）
      setTimeout(() => {
        setStatus('idle');
        setRating(0);
        setComment('');
      }, 300);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 背景オーバーレイ */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={status === 'loading' ? undefined : closeFeedback}
      />
      
      {/* モーダル本体 */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up border border-gray-100">
        {status !== 'success' && (
          <button 
            onClick={closeFeedback}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors z-10"
            disabled={status === 'loading'}
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-8">
          {status === 'success' ? (
            <div className="py-8 text-center animate-fade-in-up">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 text-green-500 mb-6 mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">ありがとうございます！</h3>
              <p className="text-gray-500">いただいたフィードバックを元に、<br />さらなるサービス向上に努めてまいります。</p>
              <div className="mt-8">
                <div className="h-1.5 w-32 bg-gray-100 rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-green-500 animate-[progress_2s_ease-in-out_forwards]" style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">フィードバック</h2>
                <p className="text-sm text-gray-500 mt-1">サービスをより良くするために、ご意見をお聞かせください。</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 星評価選定 */}
                <div className="text-center bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <p className="text-sm font-bold text-gray-700 mb-4">満足度はいかがですか？</p>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="p-1 transition-transform active:scale-90 hover:scale-110"
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(star)}
                      >
                        <Star 
                          className={`w-10 h-10 ${
                            (hover || rating) >= star 
                              ? 'fill-orange-400 text-orange-400' 
                              : 'text-gray-300'
                          } transition-colors duration-200`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 text-xs font-medium text-gray-400 h-4">
                    {rating === 1 && '改善の余地が大きい'}
                    {rating === 2 && '少し不満がある'}
                    {rating === 3 && '普通'}
                    {rating === 4 && '満足している'}
                    {rating === 5 && '素晴らしい！'}
                  </div>
                </div>

                {/* コメント入力 */}
                <div className="space-y-2">
                  <label htmlFor="feedback-comment" className="text-sm font-black text-gray-900 ml-1">
                    詳細なコメント（任意）
                  </label>
                  <textarea
                    id="feedback-comment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none resize-none placeholder:text-gray-400"
                    placeholder="不便な点、追加してほしい機能、良かった点などを教えてください。"
                    disabled={status === 'loading'}
                  />
                </div>

                {/* 送信ボタン */}
                <button
                  type="submit"
                  disabled={rating === 0 || status === 'loading'}
                  className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl ${
                    rating > 0 
                      ? 'bg-gradient-to-r from-orange-500 to-violet-600 text-white hover:scale-[1.02] shadow-orange-200 active:scale-95' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      送信中...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      フィードバックを送る
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes progress {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
