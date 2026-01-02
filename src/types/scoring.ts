// T.A.O スコアリングシステム 型定義

// スコアカテゴリ
export type ScoreCategory =
  | 'homepage'
  | 'seo'
  | 'meo'
  | 'llmo'
  | 'ad'
  | 'sns'
  | 'review'
  | 'offline';

// スコアカテゴリ情報
export const SCORE_CATEGORIES: Record<ScoreCategory, {
  name: string;
  nameJa: string;
  icon: string;
  color: string;
}> = {
  homepage: { name: 'Homepage', nameJa: 'ホームページ', icon: 'Globe', color: 'blue' },
  seo: { name: 'SEO', nameJa: 'SEO', icon: 'Search', color: 'green' },
  meo: { name: 'MEO', nameJa: 'MEO', icon: 'MapPin', color: 'orange' },
  llmo: { name: 'LLMO', nameJa: 'LLMO', icon: 'Bot', color: 'purple' },
  ad: { name: 'WEB Ads', nameJa: 'WEB広告', icon: 'Megaphone', color: 'red' },
  sns: { name: 'SNS', nameJa: 'SNS', icon: 'Share2', color: 'pink' },
  review: { name: 'Reviews', nameJa: '口コミ・評判', icon: 'Star', color: 'yellow' },
  offline: { name: 'Offline', nameJa: 'オフライン', icon: 'Building', color: 'gray' },
};

// SEO設問定義
export interface SEOQuestion {
  id: number;
  category: 'technical' | 'content' | 'internal' | 'performance';
  categoryJa: string;
  question: string;
  questionJa: string;
  options: SEOQuestionOption[];
}

export interface SEOQuestionOption {
  score: number;
  label: string;
  labelJa: string;
}

// SEO設問マスタ
export const SEO_QUESTIONS: SEOQuestion[] = [
  // 【テクニカルSEO】設問1-3
  {
    id: 1,
    category: 'technical',
    categoryJa: 'テクニカルSEO',
    question: 'SSL/HTTPS + Mobile Support',
    questionJa: 'SSL/HTTPS + モバイル対応',
    options: [
      { score: 0, label: 'Not supported', labelJa: '非対応' },
      { score: 3, label: 'HTTPS only', labelJa: 'HTTPSのみ' },
      { score: 5, label: '+ Responsive', labelJa: '+レスポンシブ' },
      { score: 7, label: '+ AMP support', labelJa: '+AMP対応' },
      { score: 10, label: 'Fully optimized', labelJa: '完全最適化' },
    ],
  },
  {
    id: 2,
    category: 'technical',
    categoryJa: 'テクニカルSEO',
    question: 'Core Web Vitals (LCP/INP/CLS)',
    questionJa: 'Core Web Vitals（LCP/INP/CLS）',
    options: [
      { score: 0, label: 'All poor', labelJa: '全て不良' },
      { score: 3, label: '1 good', labelJa: '1項目良好' },
      { score: 5, label: '2 good', labelJa: '2項目良好' },
      { score: 7, label: 'All good', labelJa: '全て良好' },
      { score: 10, label: 'All excellent', labelJa: '全て優秀' },
    ],
  },
  {
    id: 3,
    category: 'technical',
    categoryJa: 'テクニカルSEO',
    question: 'Crawlability (sitemap/robots.txt)',
    questionJa: 'クローラビリティ（sitemap/robots.txt）',
    options: [
      { score: 0, label: 'Not configured', labelJa: '未設定' },
      { score: 3, label: 'Partial', labelJa: '一部設定' },
      { score: 5, label: 'Basic setup', labelJa: '基本設定' },
      { score: 7, label: 'Optimized', labelJa: '最適化済み' },
      { score: 10, label: 'Fully configured', labelJa: '完全対応' },
    ],
  },
  // 【コンテンツSEO】設問4-6
  {
    id: 4,
    category: 'content',
    categoryJa: 'コンテンツSEO',
    question: 'Title Tag Optimization',
    questionJa: 'タイトルタグ最適化',
    options: [
      { score: 0, label: 'None/Improper', labelJa: 'なし/不適切' },
      { score: 3, label: 'Clinic name only', labelJa: '医院名のみ' },
      { score: 5, label: '+ Location', labelJa: '+地域名' },
      { score: 7, label: '+ Services', labelJa: '+診療科目' },
      { score: 10, label: 'Location+Service+CTA', labelJa: '地域+診療+CTA' },
    ],
  },
  {
    id: 5,
    category: 'content',
    categoryJa: 'コンテンツSEO',
    question: 'Meta Description',
    questionJa: 'メタディスクリプション',
    options: [
      { score: 0, label: 'None', labelJa: 'なし' },
      { score: 3, label: 'Auto-generated', labelJa: '自動生成' },
      { score: 5, label: 'Set', labelJa: '設定あり' },
      { score: 7, label: 'Optimized+KW', labelJa: '最適化+KW' },
      { score: 10, label: 'CTA+Differentiation', labelJa: 'CTA+差別化' },
    ],
  },
  {
    id: 6,
    category: 'content',
    categoryJa: 'コンテンツSEO',
    question: 'Heading Structure + E-E-A-T',
    questionJa: '見出し構造（h1-h6）+ E-E-A-T',
    options: [
      { score: 0, label: 'Improper', labelJa: '不適切' },
      { score: 3, label: 'h1 only', labelJa: 'h1のみ' },
      { score: 5, label: 'h1-h2 proper', labelJa: 'h1-h2適切' },
      { score: 7, label: '+ Expertise', labelJa: '+専門性表現' },
      { score: 10, label: '+ Experience', labelJa: '+経験・実績' },
    ],
  },
  // 【内部対策】設問7-8
  {
    id: 7,
    category: 'internal',
    categoryJa: '内部対策',
    question: 'Internal Links + Site Structure',
    questionJa: '内部リンク + サイト構造',
    options: [
      { score: 0, label: 'None', labelJa: 'なし' },
      { score: 3, label: 'Few links', labelJa: 'リンク少' },
      { score: 5, label: '3 levels or less', labelJa: '3階層以内' },
      { score: 7, label: '+ Breadcrumb', labelJa: '+パンくず' },
      { score: 10, label: 'Strategic design', labelJa: '戦略的設計' },
    ],
  },
  {
    id: 8,
    category: 'internal',
    categoryJa: '内部対策',
    question: 'URL Canonicalization + Duplicate Prevention',
    questionJa: 'URL正規化 + 重複対策',
    options: [
      { score: 0, label: 'Not addressed', labelJa: '未対策' },
      { score: 3, label: 'Partial', labelJa: '一部対応' },
      { score: 5, label: 'Canonical set', labelJa: 'canonical設定' },
      { score: 7, label: '+ Redirects', labelJa: '+リダイレクト' },
      { score: 10, label: 'Fully normalized', labelJa: '完全正規化' },
    ],
  },
  // 【検索パフォーマンス】設問9-10
  {
    id: 9,
    category: 'performance',
    categoryJa: '検索パフォーマンス',
    question: 'Main KW Search Ranking (Location + Dentist)',
    questionJa: '主要KW検索順位（地域名+歯医者/歯科）',
    options: [
      { score: 0, label: 'Not ranked', labelJa: '圏外' },
      { score: 3, label: 'Rank 31-50', labelJa: '31-50位' },
      { score: 5, label: 'Rank 11-30', labelJa: '11-30位' },
      { score: 7, label: 'Rank 4-10', labelJa: '4-10位' },
      { score: 10, label: 'Rank 1-3', labelJa: '1-3位' },
    ],
  },
  {
    id: 10,
    category: 'performance',
    categoryJa: '検索パフォーマンス',
    question: 'Index Rate + CTR',
    questionJa: 'インデックス率 + CTR',
    options: [
      { score: 0, label: '<50% / <1%', labelJa: '50%未満/1%未満' },
      { score: 3, label: '50-70% / 1-2%', labelJa: '50-70%/1-2%' },
      { score: 5, label: '70-85% / 2-3%', labelJa: '70-85%/2-3%' },
      { score: 7, label: '85-95% / 3-5%', labelJa: '85-95%/3-5%' },
      { score: 10, label: '>95% / >5%', labelJa: '95%以上/5%以上' },
    ],
  },
];

// SEOスコア結果
export interface SEOScoreResult {
  id: string;
  clinicId: string;
  evaluatedAt: Date;
  scores: {
    q1SslMobile: number;
    q2CoreWebVitals: number;
    q3Crawlability: number;
    q4TitleTag: number;
    q5MetaDesc: number;
    q6HeadingEeat: number;
    q7InternalLinks: number;
    q8UrlCanonical: number;
    q9KeywordRank: number;
    q10IndexCtr: number;
  };
  totalScore: number;
  categoryScores: {
    technical: number; // 設問1-3
    content: number;   // 設問4-6
    internal: number;  // 設問7-8
    performance: number; // 設問9-10
  };
  evaluationData?: Record<string, unknown>;
  aiAnalysis?: string;
  aiSuggestions?: SEOSuggestion[];
}

// AI改善提案
export interface SEOSuggestion {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'technical' | 'content' | 'internal' | 'performance';
  title: string;
  description: string;
  expectedImpact: string;
  difficulty: 'easy' | 'medium' | 'hard';
  currentScore: number;
  targetScore: number;
}

// PageSpeed Insights APIレスポンス型
export interface PageSpeedResult {
  lighthouseResult: {
    categories: {
      performance: { score: number };
      accessibility: { score: number };
      'best-practices': { score: number };
      seo: { score: number };
    };
    audits: {
      'largest-contentful-paint': { numericValue: number };
      'cumulative-layout-shift': { numericValue: number };
      'interaction-to-next-paint'?: { numericValue: number };
      'first-input-delay'?: { numericValue: number };
      'is-crawlable': { score: number };
      'robots-txt': { score: number };
      'meta-description': { score: number };
      'document-title': { score: number };
      'hreflang': { score: number };
      'canonical': { score: number };
      'http-status-code': { score: number };
    };
  };
  loadingExperience?: {
    metrics: {
      LARGEST_CONTENTFUL_PAINT_MS?: { percentile: number; category: string };
      INTERACTION_TO_NEXT_PAINT?: { percentile: number; category: string };
      CUMULATIVE_LAYOUT_SHIFT?: { percentile: number; category: string };
    };
  };
}

// スコアダッシュボード表示用
export interface ScoreDashboardData {
  clinic: {
    id: string;
    name: string;
    website: string;
  };
  latestScores: {
    homepage: number | null;
    seo: number | null;
    meo: number | null;
    llmo: number | null;
    ad: number | null;
    sns: number | null;
    review: number | null;
    offline: number | null;
  };
  totalScore: number | null;
  lastUpdated: Date | null;
  scoreHistory: {
    date: Date;
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
  }[];
}

// スコアレベル判定
export function getScoreLevel(score: number | null): 'excellent' | 'good' | 'fair' | 'poor' | 'none' {
  if (score === null) return 'none';
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

// スコアレベルの色
export const SCORE_LEVEL_COLORS: Record<ReturnType<typeof getScoreLevel>, string> = {
  excellent: 'text-green-400',
  good: 'text-blue-400',
  fair: 'text-yellow-400',
  poor: 'text-red-400',
  none: 'text-gray-500',
};

// スコアレベルの背景色
export const SCORE_LEVEL_BG_COLORS: Record<ReturnType<typeof getScoreLevel>, string> = {
  excellent: 'bg-green-500/20',
  good: 'bg-blue-500/20',
  fair: 'bg-yellow-500/20',
  poor: 'bg-red-500/20',
  none: 'bg-gray-500/20',
};
