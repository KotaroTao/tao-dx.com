'use client';

import { useState } from 'react';
import { SEO_QUESTIONS, SEOScoreResult, getScoreLevel, SCORE_LEVEL_COLORS } from '@/types/scoring';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle, HelpCircle, Loader2 } from 'lucide-react';

interface SEOScoreDetailProps {
  scoreResult: SEOScoreResult | null;
  onCalculate?: () => Promise<void>;
  isCalculating?: boolean;
}

export function SEOScoreDetail({ scoreResult, onCalculate, isCalculating }: SEOScoreDetailProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'technical', name: 'テクニカルSEO', questions: [1, 2, 3], maxScore: 30 },
    { id: 'content', name: 'コンテンツSEO', questions: [4, 5, 6], maxScore: 30 },
    { id: 'internal', name: '内部対策', questions: [7, 8], maxScore: 20 },
    { id: 'performance', name: '検索パフォーマンス', questions: [9, 10], maxScore: 20 },
  ];

  const getQuestionScore = (questionId: number): number => {
    if (!scoreResult) return 0;
    const scoreKey = `q${questionId}${getScoreFieldName(questionId)}` as keyof typeof scoreResult.scores;
    return scoreResult.scores[scoreKey] || 0;
  };

  const getCategoryScore = (categoryId: string): number => {
    const category = categories.find(c => c.id === categoryId);
    if (!category || !scoreResult) return 0;
    return category.questions.reduce((sum, qId) => sum + getQuestionScore(qId), 0);
  };

  const getScoreIcon = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (percentage >= 40) return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    return <HelpCircle className="w-4 h-4 text-red-400" />;
  };

  return (
    <div className="space-y-6">
      {/* 総合スコア */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">SEOスコア</h3>
          {onCalculate && (
            <button
              onClick={onCalculate}
              disabled={isCalculating}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  分析中...
                </>
              ) : (
                '自動分析を実行'
              )}
            </button>
          )}
        </div>

        <div className="flex items-end gap-4">
          <div className="flex items-end gap-2">
            <span className={`text-5xl font-bold ${SCORE_LEVEL_COLORS[getScoreLevel(scoreResult?.totalScore ?? null)]}`}>
              {scoreResult?.totalScore ?? '-'}
            </span>
            <span className="text-white/50 text-lg mb-1">/ 100点</span>
          </div>

          {scoreResult?.evaluatedAt && (
            <span className="text-white/40 text-sm mb-1">
              最終評価: {new Date(scoreResult.evaluatedAt).toLocaleDateString('ja-JP')}
            </span>
          )}
        </div>

        {/* プログレスバー */}
        <div className="mt-4 h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              getScoreLevel(scoreResult?.totalScore ?? null) === 'excellent' ? 'bg-green-500' :
              getScoreLevel(scoreResult?.totalScore ?? null) === 'good' ? 'bg-blue-500' :
              getScoreLevel(scoreResult?.totalScore ?? null) === 'fair' ? 'bg-yellow-500' :
              getScoreLevel(scoreResult?.totalScore ?? null) === 'poor' ? 'bg-red-500' : 'bg-gray-500'
            }`}
            style={{ width: `${scoreResult?.totalScore ?? 0}%` }}
          />
        </div>
      </div>

      {/* カテゴリ別詳細 */}
      <div className="space-y-3">
        {categories.map((category) => {
          const categoryScore = getCategoryScore(category.id);
          const isExpanded = expandedCategory === category.id;

          return (
            <div key={category.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {/* カテゴリヘッダー */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getScoreIcon(categoryScore, category.maxScore)}
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className={`font-bold ${
                      categoryScore / category.maxScore >= 0.7 ? 'text-green-400' :
                      categoryScore / category.maxScore >= 0.4 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {categoryScore}
                    </span>
                    <span className="text-white/50">/{category.maxScore}点</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-white/50" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-white/50" />
                  )}
                </div>
              </button>

              {/* 展開コンテンツ */}
              {isExpanded && (
                <div className="border-t border-white/10 p-4 space-y-3">
                  {category.questions.map((qId) => {
                    const question = SEO_QUESTIONS.find(q => q.id === qId);
                    const score = getQuestionScore(qId);

                    if (!question) return null;

                    return (
                      <div key={qId} className="flex items-center justify-between py-2">
                        <div>
                          <p className="text-sm text-white/80">
                            設問{qId}: {question.questionJa}
                          </p>
                          <p className="text-xs text-white/40 mt-1">
                            {question.options.find(o => o.score === score)?.labelJa || '未評価'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${
                            score >= 7 ? 'text-green-400' :
                            score >= 4 ? 'text-yellow-400' : 'text-red-400'
                          }`}>
                            {score}
                          </span>
                          <span className="text-white/50">/10</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI分析結果 */}
      {scoreResult?.aiAnalysis && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-primary-400">AI</span> 分析結果
          </h4>
          <p className="text-white/70 text-sm whitespace-pre-wrap">{scoreResult.aiAnalysis}</p>
        </div>
      )}

      {/* AI改善提案 */}
      {scoreResult?.aiSuggestions && scoreResult.aiSuggestions.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <span className="text-primary-400">AI</span> 改善提案
          </h4>
          <div className="space-y-4">
            {scoreResult.aiSuggestions.map((suggestion, index) => (
              <div key={index} className="border-l-2 border-primary-500 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {suggestion.priority === 'high' ? '優先度：高' :
                     suggestion.priority === 'medium' ? '優先度：中' : '優先度：低'}
                  </span>
                </div>
                <h5 className="font-medium text-white/90">{suggestion.title}</h5>
                <p className="text-sm text-white/60 mt-1">{suggestion.description}</p>
                <p className="text-xs text-primary-400 mt-2">
                  期待効果: {suggestion.expectedImpact}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// スコアフィールド名を取得
function getScoreFieldName(questionId: number): string {
  const fieldNames: Record<number, string> = {
    1: 'SslMobile',
    2: 'CoreWebVitals',
    3: 'Crawlability',
    4: 'TitleTag',
    5: 'MetaDesc',
    6: 'HeadingEeat',
    7: 'InternalLinks',
    8: 'UrlCanonical',
    9: 'KeywordRank',
    10: 'IndexCtr',
  };
  return fieldNames[questionId] || '';
}
