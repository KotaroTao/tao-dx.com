import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

// PageSpeed Insights API を使用してSEOスコアを自動計算
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clinicId } = body;

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    // クリニックの所有者確認とウェブサイトURL取得
    const clinic = await prisma.clinic.findFirst({
      where: {
        id: clinicId,
        userId: session.user.id,
      },
    });

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    if (!clinic.website) {
      return NextResponse.json({ error: 'Clinic website URL is not set' }, { status: 400 });
    }

    // PageSpeed Insights APIでデータ取得
    const pageSpeedData = await fetchPageSpeedInsights(clinic.website);

    // スコアを計算
    const scores = calculateSEOScores(pageSpeedData);

    // 合計スコアを計算
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

    // SEOスコア詳細を保存
    const seoScore = await prisma.sEOScoreDetail.create({
      data: {
        clinicId,
        q1SslMobile: scores.q1SslMobile,
        q2CoreWebVitals: scores.q2CoreWebVitals,
        q3Crawlability: scores.q3Crawlability,
        q4TitleTag: scores.q4TitleTag,
        q5MetaDesc: scores.q5MetaDesc,
        q6HeadingEeat: scores.q6HeadingEeat,
        q7InternalLinks: scores.q7InternalLinks,
        q8UrlCanonical: scores.q8UrlCanonical,
        q9KeywordRank: scores.q9KeywordRank,
        q10IndexCtr: scores.q10IndexCtr,
        totalScore,
        evaluationData: pageSpeedData as Prisma.InputJsonValue,
      },
    });

    // Scoreテーブルも更新
    const existingScore = await prisma.score.findFirst({
      where: { clinicId },
      orderBy: { date: 'desc' },
    });

    if (existingScore) {
      await prisma.score.update({
        where: { id: existingScore.id },
        data: { seoScore: totalScore },
      });
    } else {
      await prisma.score.create({
        data: {
          clinicId,
          seoScore: totalScore,
        },
      });
    }

    return NextResponse.json({
      success: true,
      seoScore: {
        id: seoScore.id,
        totalScore: seoScore.totalScore,
        evaluatedAt: seoScore.evaluatedAt,
        scores,
        categoryScores: {
          technical: scores.q1SslMobile + scores.q2CoreWebVitals + scores.q3Crawlability,
          content: scores.q4TitleTag + scores.q5MetaDesc + scores.q6HeadingEeat,
          internal: scores.q7InternalLinks + scores.q8UrlCanonical,
          performance: scores.q9KeywordRank + scores.q10IndexCtr,
        },
      },
      evaluationData: pageSpeedData,
    });
  } catch (error) {
    console.error('Error calculating SEO score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PageSpeed Insights API からデータ取得
async function fetchPageSpeedInsights(url: string): Promise<Record<string, unknown>> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;

  // モバイルとデスクトップ両方のデータを取得
  const strategies = ['mobile', 'desktop'] as const;
  const results: Record<string, unknown> = {};

  for (const strategy of strategies) {
    const apiUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    apiUrl.searchParams.set('url', url);
    apiUrl.searchParams.set('strategy', strategy);
    apiUrl.searchParams.set('category', 'performance');
    apiUrl.searchParams.set('category', 'seo');
    apiUrl.searchParams.set('category', 'accessibility');
    apiUrl.searchParams.set('category', 'best-practices');

    if (apiKey) {
      apiUrl.searchParams.set('key', apiKey);
    }

    try {
      const response = await fetch(apiUrl.toString(), {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        results[strategy] = {
          categories: data.lighthouseResult?.categories,
          audits: {
            'largest-contentful-paint': data.lighthouseResult?.audits?.['largest-contentful-paint'],
            'cumulative-layout-shift': data.lighthouseResult?.audits?.['cumulative-layout-shift'],
            'interaction-to-next-paint': data.lighthouseResult?.audits?.['interaction-to-next-paint'],
            'first-input-delay': data.lighthouseResult?.audits?.['first-input-delay'],
            'is-crawlable': data.lighthouseResult?.audits?.['is-crawlable'],
            'robots-txt': data.lighthouseResult?.audits?.['robots-txt'],
            'meta-description': data.lighthouseResult?.audits?.['meta-description'],
            'document-title': data.lighthouseResult?.audits?.['document-title'],
            'canonical': data.lighthouseResult?.audits?.['canonical'],
            'http-status-code': data.lighthouseResult?.audits?.['http-status-code'],
            'heading-order': data.lighthouseResult?.audits?.['heading-order'],
            'link-text': data.lighthouseResult?.audits?.['link-text'],
            'crawlable-anchors': data.lighthouseResult?.audits?.['crawlable-anchors'],
          },
          loadingExperience: data.loadingExperience,
        };
      }
    } catch (error) {
      console.error(`Error fetching PageSpeed data for ${strategy}:`, error);
    }
  }

  // URLがHTTPSかどうかをチェック
  results.isHttps = url.startsWith('https://');

  return results;
}

// PageSpeedデータからSEOスコアを計算
function calculateSEOScores(data: Record<string, unknown>): Record<string, number> {
  const mobile = data.mobile as Record<string, unknown> | undefined;
  const mobileCategories = mobile?.categories as Record<string, { score: number }> | undefined;
  const mobileAudits = mobile?.audits as Record<string, { score?: number; numericValue?: number }> | undefined;
  const mobileLoadingExp = mobile?.loadingExperience as { metrics?: Record<string, { category?: string }> } | undefined;

  // 設問1: SSL/HTTPS + モバイル対応
  let q1SslMobile = 0;
  if (data.isHttps) {
    q1SslMobile += 3; // HTTPS対応

    // モバイル対応（SEOスコアから判定）
    const seoScore = mobileCategories?.seo?.score ?? 0;
    if (seoScore >= 0.9) {
      q1SslMobile = 10; // 完全最適化
    } else if (seoScore >= 0.7) {
      q1SslMobile = 7; // +レスポンシブ
    } else if (seoScore >= 0.5) {
      q1SslMobile = 5; // +レスポンシブ
    }
  }

  // 設問2: Core Web Vitals
  let q2CoreWebVitals = 0;
  const cwvMetrics = mobileLoadingExp?.metrics;
  if (cwvMetrics) {
    let goodCount = 0;
    const metricKeys = ['LARGEST_CONTENTFUL_PAINT_MS', 'INTERACTION_TO_NEXT_PAINT', 'CUMULATIVE_LAYOUT_SHIFT'];

    for (const key of metricKeys) {
      const metric = cwvMetrics[key];
      if (metric?.category === 'FAST') {
        goodCount++;
      }
    }

    if (goodCount === 3) {
      // パフォーマンススコアも考慮
      const perfScore = mobileCategories?.performance?.score ?? 0;
      q2CoreWebVitals = perfScore >= 0.9 ? 10 : 7;
    } else if (goodCount === 2) {
      q2CoreWebVitals = 5;
    } else if (goodCount === 1) {
      q2CoreWebVitals = 3;
    }
  } else {
    // loadingExperienceがない場合はLighthouseの結果から推定
    const perfScore = mobileCategories?.performance?.score ?? 0;
    if (perfScore >= 0.9) q2CoreWebVitals = 10;
    else if (perfScore >= 0.7) q2CoreWebVitals = 7;
    else if (perfScore >= 0.5) q2CoreWebVitals = 5;
    else if (perfScore >= 0.3) q2CoreWebVitals = 3;
  }

  // 設問3: クローラビリティ
  let q3Crawlability = 0;
  const isCrawlable = mobileAudits?.['is-crawlable']?.score ?? 0;
  const robotsTxt = mobileAudits?.['robots-txt']?.score ?? 0;
  const canonical = mobileAudits?.['canonical']?.score ?? 0;

  if (isCrawlable === 1 && robotsTxt === 1 && canonical === 1) {
    q3Crawlability = 10;
  } else if (isCrawlable === 1 && robotsTxt === 1) {
    q3Crawlability = 7;
  } else if (isCrawlable === 1) {
    q3Crawlability = 5;
  } else if (robotsTxt === 1) {
    q3Crawlability = 3;
  }

  // 設問4: タイトルタグ最適化
  let q4TitleTag = 0;
  const documentTitle = mobileAudits?.['document-title']?.score ?? 0;
  if (documentTitle === 1) {
    q4TitleTag = 5; // 基本設定あり（詳細は手動確認が必要）
  }

  // 設問5: メタディスクリプション
  let q5MetaDesc = 0;
  const metaDescription = mobileAudits?.['meta-description']?.score ?? 0;
  if (metaDescription === 1) {
    q5MetaDesc = 5; // 設定あり（詳細は手動確認が必要）
  }

  // 設問6: 見出し構造 + E-E-A-T
  let q6HeadingEeat = 0;
  const headingOrder = mobileAudits?.['heading-order']?.score ?? 0;
  if (headingOrder === 1) {
    q6HeadingEeat = 5; // h1-h2適切（E-E-A-Tは手動確認が必要）
  } else if (headingOrder === 0.5) {
    q6HeadingEeat = 3;
  }

  // 設問7: 内部リンク + サイト構造
  let q7InternalLinks = 0;
  const linkText = mobileAudits?.['link-text']?.score ?? 0;
  const crawlableAnchors = mobileAudits?.['crawlable-anchors']?.score ?? 0;

  if (linkText === 1 && crawlableAnchors === 1) {
    q7InternalLinks = 5; // 基本設定（詳細は手動確認が必要）
  } else if (linkText === 1 || crawlableAnchors === 1) {
    q7InternalLinks = 3;
  }

  // 設問8: URL正規化 + 重複対策
  let q8UrlCanonical = 0;
  if (canonical === 1) {
    q8UrlCanonical = 5; // canonical設定あり
  }

  // 設問9: 主要KW検索順位（手動入力が必要）
  const q9KeywordRank = 0; // Search Console連携後に自動取得

  // 設問10: インデックス率 + CTR（手動入力が必要）
  const q10IndexCtr = 0; // Search Console連携後に自動取得

  return {
    q1SslMobile,
    q2CoreWebVitals,
    q3Crawlability,
    q4TitleTag,
    q5MetaDesc,
    q6HeadingEeat,
    q7InternalLinks,
    q8UrlCanonical,
    q9KeywordRank,
    q10IndexCtr,
  };
}
