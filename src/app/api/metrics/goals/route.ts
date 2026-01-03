import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { GoalPeriod } from '@prisma/client';

// 目標一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const year = searchParams.get('year');
    const period = searchParams.get('period') as GoalPeriod | null;

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

    const goals = await prisma.metricGoal.findMany({
      where: {
        clinicId,
        ...(year && { year: parseInt(year) }),
        ...(period && { period }),
      },
      include: {
        item: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'asc' }, { item: { category: { sortOrder: 'asc' } } }],
    });

    return NextResponse.json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({ error: '目標の取得に失敗しました' }, { status: 500 });
  }
}

// 目標設定（一括更新）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { clinicId, goals } = body;

    if (!clinicId || !goals || !Array.isArray(goals)) {
      return NextResponse.json({ error: 'clinicId, goals は必須です' }, { status: 400 });
    }

    // クリニックの所有権確認
    const clinic = await prisma.clinic.findFirst({
      where: { id: clinicId, userId: session.user.id },
    });

    if (!clinic) {
      return NextResponse.json({ error: 'クリニックが見つかりません' }, { status: 404 });
    }

    // トランザクションで一括更新
    const results = await prisma.$transaction(
      goals.map((goal: { itemId: string; period: GoalPeriod; year: number; month?: number; targetValue: number }) =>
        prisma.metricGoal.upsert({
          where: {
            clinicId_itemId_period_year_month: {
              clinicId,
              itemId: goal.itemId,
              period: goal.period,
              year: goal.year,
              month: goal.month || null,
            },
          },
          update: {
            targetValue: goal.targetValue,
          },
          create: {
            clinicId,
            itemId: goal.itemId,
            period: goal.period,
            year: goal.year,
            month: goal.month || null,
            targetValue: goal.targetValue,
          },
        })
      )
    );

    return NextResponse.json({ success: true, count: results.length });
  } catch (error) {
    console.error('Error saving goals:', error);
    return NextResponse.json({ error: '目標の保存に失敗しました' }, { status: 500 });
  }
}
