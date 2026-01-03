import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { SourceType } from '@prisma/client';

// 問い合わせ経路データ取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!clinicId) {
      return NextResponse.json({ error: 'clinicId は必須です' }, { status: 400 });
    }

    // クリニックの所有権確認
    const clinic = await prisma.clinic.findFirst({
      where: { id: clinicId, userId: session.user.id },
    });

    if (!clinic) {
      return NextResponse.json({ error: 'クリニックが見つかりません' }, { status: 404 });
    }

    // 日付フィルタ
    let dateFilter: { date?: { gte: Date; lte: Date } } = {};
    if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    }

    const inquirySources = await prisma.inquirySource.findMany({
      where: {
        clinicId,
        ...dateFilter,
      },
      orderBy: [{ date: 'desc' }, { source: 'asc' }],
    });

    // 経路ごとに集計
    const sourceLabels: Record<SourceType, string> = {
      WEBSITE: 'ホームページ',
      GOOGLE_SEARCH: 'Google検索',
      GOOGLE_MAPS: 'Googleマップ',
      REFERRAL: '紹介',
      SIGNAGE: '看板',
      LEAFLET: 'チラシ・DM',
      SNS_INSTAGRAM: 'Instagram',
      SNS_LINE: 'LINE',
      SNS_OTHER: 'その他SNS',
      PORTAL_EPARK: 'EPARK',
      PORTAL_OTHER: 'その他ポータル',
      WALK_IN: '飛び込み',
      OTHER: 'その他',
    };

    const summary = Object.values(SourceType).reduce(
      (acc, source) => {
        const sourceData = inquirySources.filter((s) => s.source === source);
        acc[source] = {
          source,
          label: sourceLabels[source],
          totalInquiries: sourceData.reduce((sum, s) => sum + s.inquiryCount, 0),
          totalNewPatients: sourceData.reduce((sum, s) => sum + s.newPatientCount, 0),
          totalRevenue: sourceData.reduce((sum, s) => sum + parseFloat(s.revenue?.toString() || '0'), 0),
        };
        return acc;
      },
      {} as Record<
        SourceType,
        { source: SourceType; label: string; totalInquiries: number; totalNewPatients: number; totalRevenue: number }
      >
    );

    return NextResponse.json({
      data: inquirySources,
      summary: Object.values(summary).filter((s) => s.totalInquiries > 0 || s.totalNewPatients > 0),
    });
  } catch (error) {
    console.error('Error fetching inquiry sources:', error);
    return NextResponse.json({ error: '問い合わせ経路データの取得に失敗しました' }, { status: 500 });
  }
}

// 問い合わせ経路データ保存
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { clinicId, date, entries } = body;

    if (!clinicId || !date || !entries) {
      return NextResponse.json({ error: 'clinicId, date, entries は必須です' }, { status: 400 });
    }

    // クリニックの所有権確認
    const clinic = await prisma.clinic.findFirst({
      where: { id: clinicId, userId: session.user.id },
    });

    if (!clinic) {
      return NextResponse.json({ error: 'クリニックが見つかりません' }, { status: 404 });
    }

    const dateObj = new Date(date);

    // トランザクションで一括更新
    await prisma.$transaction(async (tx) => {
      // 既存のデータを削除
      await tx.inquirySource.deleteMany({
        where: { clinicId, date: dateObj },
      });

      // 新しいデータを挿入
      if (entries.length > 0) {
        await tx.inquirySource.createMany({
          data: entries.map(
            (entry: { source: SourceType; inquiryCount: number; newPatientCount: number; revenue?: number; note?: string }) => ({
              clinicId,
              date: dateObj,
              source: entry.source,
              inquiryCount: entry.inquiryCount || 0,
              newPatientCount: entry.newPatientCount || 0,
              revenue: entry.revenue || null,
              note: entry.note || null,
            })
          ),
        });
      }
    });

    return NextResponse.json({ success: true, date });
  } catch (error) {
    console.error('Error saving inquiry sources:', error);
    return NextResponse.json({ error: '問い合わせ経路データの保存に失敗しました' }, { status: 500 });
  }
}
