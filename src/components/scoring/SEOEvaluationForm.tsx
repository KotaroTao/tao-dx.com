'use client';

import { useState } from 'react';
import { SEO_QUESTIONS } from '@/types/scoring';
import { Loader2, Save, RotateCcw } from 'lucide-react';

interface SEOEvaluationFormProps {
  clinicId: string;
  initialScores?: Record<string, number>;
  onSubmit: (scores: Record<string, number>) => Promise<void>;
  onCancel?: () => void;
}

export function SEOEvaluationForm({ clinicId, initialScores, onSubmit, onCancel }: SEOEvaluationFormProps) {
  const [scores, setScores] = useState<Record<string, number>>(() => {
    if (initialScores) return initialScores;

    const initial: Record<string, number> = {};
    for (let i = 1; i <= 10; i++) {
      initial[`q${i}`] = 0;
    }
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { id: 'technical', name: 'テクニカルSEO', description: 'クローラビリティ・インデックス・ページエクスペリエンス', questions: [1, 2, 3] },
    { id: 'content', name: 'コンテンツSEO', description: 'E-E-A-T（経験・専門性・権威性・信頼性）', questions: [4, 5, 6] },
    { id: 'internal', name: '内部対策', description: 'サイト構造・内部リンク・ユーザビリティ', questions: [7, 8] },
    { id: 'performance', name: '検索パフォーマンス', description: '実際の検索結果における成果指標', questions: [9, 10] },
  ];

  const handleScoreChange = (questionId: number, score: number) => {
    setScores(prev => ({
      ...prev,
      [`q${questionId}`]: score,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submitData: Record<string, number> = {
        q1SslMobile: scores.q1,
        q2CoreWebVitals: scores.q2,
        q3Crawlability: scores.q3,
        q4TitleTag: scores.q4,
        q5MetaDesc: scores.q5,
        q6HeadingEeat: scores.q6,
        q7InternalLinks: scores.q7,
        q8UrlCanonical: scores.q8,
        q9KeywordRank: scores.q9,
        q10IndexCtr: scores.q10,
      };
      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    const initial: Record<string, number> = {};
    for (let i = 1; i <= 10; i++) {
      initial[`q${i}`] = 0;
    }
    setScores(initial);
  };

  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">SEO評価入力</h3>
          <p className="text-sm text-white/60">各設問に対して0〜10点で評価してください</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm text-white/60">合計スコア</div>
            <div className="text-2xl font-bold text-primary-400">{totalScore}<span className="text-sm text-white/50">/100</span></div>
          </div>
        </div>
      </div>

      {/* カテゴリ別フォーム */}
      <div className="space-y-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="mb-4">
              <h4 className="font-semibold text-white/90">{category.name}</h4>
              <p className="text-xs text-white/50 mt-1">{category.description}</p>
            </div>

            <div className="space-y-4">
              {category.questions.map((qId) => {
                const question = SEO_QUESTIONS.find(q => q.id === qId);
                if (!question) return null;

                return (
                  <div key={qId} className="space-y-2">
                    <label className="block">
                      <span className="text-sm text-white/80">
                        設問{qId}: {question.questionJa}
                      </span>
                    </label>

                    {/* スコア選択ボタン */}
                    <div className="flex flex-wrap gap-2">
                      {question.options.map((option) => (
                        <button
                          key={option.score}
                          type="button"
                          onClick={() => handleScoreChange(qId, option.score)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all ${
                            scores[`q${qId}`] === option.score
                              ? 'bg-primary-500 text-white'
                              : 'bg-white/5 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          <span className="font-medium">{option.score}点</span>
                          <span className="text-xs ml-1 opacity-80">{option.labelJa}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* アクションボタン */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          リセット
        </button>

        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              キャンセル
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                評価を保存
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
