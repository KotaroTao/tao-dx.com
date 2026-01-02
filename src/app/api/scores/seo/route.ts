import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { SEO_QUESTIONS } from '@/types/scoring';

// SEOスコア一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId is required' }, { status: 400 });
    }

    // クリニックの所有者確認
    const clinic = await prisma.clinic.findFirst({
      where: {
        id: clinicId,
        userId: session.user.id,
      },
    });

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // 最新のSEOスコア詳細を取得
    const latestScore = await prisma.sEOScoreDetail.findFirst({
      where: { clinicId },
      orderBy: { evaluatedAt: 'desc' },
    });

    // スコア履歴を取得（最新10件）
    const scoreHistory = await prisma.sEOScoreDetail.findMany({
      where: { clinicId },
      orderBy: { evaluatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        evaluatedAt: true,
        totalScore: true,
        q1SslMobile: true,
        q2CoreWebVitals: true,
        q3Crawlability: true,
        q4TitleTag: true,
        q5MetaDesc: true,
        q6HeadingEeat: true,
        q7InternalLinks: true,
        q8UrlCanonical: true,
        q9KeywordRank: true,
        q10IndexCtr: true,
      },
    });

    return NextResponse.json({
      clinic: {
        id: clinic.id,
        name: clinic.name,
        website: clinic.website,
      },
      latestScore: latestScore ? {
        id: latestScore.id,
        evaluatedAt: latestScore.evaluatedAt,
        scores: {
          q1SslMobile: latestScore.q1SslMobile,
          q2CoreWebVitals: latestScore.q2CoreWebVitals,
          q3Crawlability: latestScore.q3Crawlability,
          q4TitleTag: latestScore.q4TitleTag,
          q5MetaDesc: latestScore.q5MetaDesc,
          q6HeadingEeat: latestScore.q6HeadingEeat,
          q7InternalLinks: latestScore.q7InternalLinks,
          q8UrlCanonical: latestScore.q8UrlCanonical,
          q9KeywordRank: latestScore.q9KeywordRank,
          q10IndexCtr: latestScore.q10IndexCtr,
        },
        totalScore: latestScore.totalScore,
        categoryScores: {
          technical: latestScore.q1SslMobile + latestScore.q2CoreWebVitals + latestScore.q3Crawlability,
          content: latestScore.q4TitleTag + latestScore.q5MetaDesc + latestScore.q6HeadingEeat,
          internal: latestScore.q7InternalLinks + latestScore.q8UrlCanonical,
          performance: latestScore.q9KeywordRank + latestScore.q10IndexCtr,
        },
        aiAnalysis: latestScore.aiAnalysis,
        aiSuggestions: latestScore.aiSuggestions,
      } : null,
      scoreHistory,
      questions: SEO_QUESTIONS,
    });
  } catch (error) {
    console.error('Error fetching SEO scores:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// SEOスコア手動入力
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { clinicId, scores } = body;

    if (!clinicId || !scores) {
      return NextResponse.json({ error: 'clinicId and scores are required' }, { status: 400 });
    }

    // クリニックの所有者確認
    const clinic = await prisma.clinic.findFirst({
      where: {
        id: clinicId,
        userId: session.user.id,
      },
    });

    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }

    // スコアの検証（各スコアは0-10の範囲）
    const scoreFields = [
      'q1SslMobile', 'q2CoreWebVitals', 'q3Crawlability',
      'q4TitleTag', 'q5MetaDesc', 'q6HeadingEeat',
      'q7InternalLinks', 'q8UrlCanonical',
      'q9KeywordRank', 'q10IndexCtr'
    ];

    for (const field of scoreFields) {
      const value = scores[field];
      if (typeof value !== 'number' || value < 0 || value > 10) {
        return NextResponse.json({
          error: `Invalid score for ${field}: must be a number between 0 and 10`
        }, { status: 400 });
      }
    }

    // 合計スコアを計算
    const totalScore = scoreFields.reduce((sum, field) => sum + (scores[field] || 0), 0);

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
        evaluationData: scores.evaluationData || null,
      },
    });

    // Scoreテーブルも更新（最新のスコアを反映）
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
      },
    });
  } catch (error) {
    console.error('Error saving SEO score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
