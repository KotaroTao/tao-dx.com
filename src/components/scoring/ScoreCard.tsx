'use client';

import { SCORE_CATEGORIES, ScoreCategory, getScoreLevel, SCORE_LEVEL_COLORS, SCORE_LEVEL_BG_COLORS } from '@/types/scoring';
import {
  Globe,
  Search,
  MapPin,
  Bot,
  Megaphone,
  Share2,
  Star,
  Building,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

interface ScoreCardProps {
  category: ScoreCategory;
  score: number | null;
  previousScore?: number | null;
  onClick?: () => void;
}

const iconMap = {
  Globe,
  Search,
  MapPin,
  Bot,
  Megaphone,
  Share2,
  Star,
  Building,
};

export function ScoreCard({ category, score, previousScore, onClick }: ScoreCardProps) {
  const categoryInfo = SCORE_CATEGORIES[category];
  const level = getScoreLevel(score);
  const levelColor = SCORE_LEVEL_COLORS[level];
  const levelBgColor = SCORE_LEVEL_BG_COLORS[level];

  // トレンド計算
  const trend = score !== null && previousScore !== null && previousScore !== undefined ? score - previousScore : null;

  // アイコンコンポーネント取得
  const IconComponent = iconMap[categoryInfo.icon as keyof typeof iconMap] || Globe;

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 transition-all hover:bg-white/10 cursor-pointer ${onClick ? 'hover:border-primary-500/50' : ''}`}
      onClick={onClick}
    >
      {/* 背景グラデーション */}
      <div className={`absolute inset-0 ${levelBgColor} opacity-30`} />

      {/* コンテンツ */}
      <div className="relative">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${levelBgColor}`}>
              <IconComponent className={`w-4 h-4 ${levelColor}`} />
            </div>
            <span className="text-sm font-medium text-white/70">{categoryInfo.nameJa}</span>
          </div>

          {/* トレンド表示 */}
          {trend !== null && (
            <div className={`flex items-center gap-1 text-xs ${
              trend > 0 ? 'text-green-400' : trend < 0 ? 'text-red-400' : 'text-white/50'
            }`}>
              {trend > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : trend < 0 ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <Minus className="w-3 h-3" />
              )}
              <span>{trend > 0 ? '+' : ''}{trend}</span>
            </div>
          )}
        </div>

        {/* スコア表示 */}
        <div className="flex items-end gap-1">
          <span className={`text-3xl font-bold ${levelColor}`}>
            {score !== null ? score : '-'}
          </span>
          <span className="text-white/50 text-sm mb-1">/ 100</span>
        </div>

        {/* プログレスバー */}
        <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              level === 'excellent' ? 'bg-green-500' :
              level === 'good' ? 'bg-blue-500' :
              level === 'fair' ? 'bg-yellow-500' :
              level === 'poor' ? 'bg-red-500' : 'bg-gray-500'
            }`}
            style={{ width: `${score ?? 0}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// スコアカードグリッド
interface ScoreCardGridProps {
  scores: {
    homepage: number | null;
    seo: number | null;
    meo: number | null;
    llmo: number | null;
    ad: number | null;
    sns: number | null;
    review: number | null;
    offline: number | null;
  };
  previousScores?: {
    homepage: number | null;
    seo: number | null;
    meo: number | null;
    llmo: number | null;
    ad: number | null;
    sns: number | null;
    review: number | null;
    offline: number | null;
  };
  onCardClick?: (category: ScoreCategory) => void;
}

export function ScoreCardGrid({ scores, previousScores, onCardClick }: ScoreCardGridProps) {
  const categories: ScoreCategory[] = ['homepage', 'seo', 'meo', 'llmo', 'ad', 'sns', 'review', 'offline'];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {categories.map((category) => (
        <ScoreCard
          key={category}
          category={category}
          score={scores[category]}
          previousScore={previousScores?.[category]}
          onClick={onCardClick ? () => onCardClick(category) : undefined}
        />
      ))}
    </div>
  );
}
