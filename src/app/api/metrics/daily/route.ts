import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 日次データ取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const date = searchParams.get('date');
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
    let dateFilter: { date?: Date | { gte: Date; lte: Date } } = {};
    if (date) {
      dateFilter = { date: new Date(date) };
    } else if (startDate && endDate) {
      dateFilter = {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      };
    }

    const dailyMetrics = await prisma.dailyMetric.findMany({
      where: {
        clinicId,
        ...dateFilter,
      },
      include: {
        item: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [{ date: 'desc' }, { item: { category: { sortOrder: 'asc' } } }, { item: { sortOrder: 'asc' } }],
    });

    // 日次メモも取得
    const dailyNotes = await prisma.dailyNote.findMany({
      where: {
        clinicId,
        ...dateFilter,
      },
      orderBy: { date: 'desc' },
    });

    // 日付ごとにグループ化
    const groupedByDate = dailyMetrics.reduce((acc, metric) => {
      const dateStr = metric.date.toISOString().split('T')[0];
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          metrics: [],
          note: dailyNotes.find((n) => n.date.toISOString().split('T')[0] === dateStr)?.note || null,
        };
      }
      acc[dateStr].metrics.push({
        id: metric.id,
        itemId: metric.itemId,
        itemName: metric.item.name,
        categoryId: metric.item.categoryId,
        categoryName: metric.item.category.name,
        categoryColor: metric.item.category.color,
        value: metric.value,
        unit: metric.item.unit,
        type: metric.item.type,
        note: metric.note,
      });
      return acc;
    }, {} as Record<string, { date: string; metrics: unknown[]; note: string | null }>);

    return NextResponse.json(Object.values(groupedByDate));
  } catch (error) {
    console.error('Error fetching daily metrics:', error);
    return NextResponse.json({ error: '日次データの取得に失敗しました' }, { status: 500 });
  }
}

// 日次データ保存（一括）
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { clinicId, date, entries, dailyNote } = body;

    if (!clinicId || !date) {
      return NextResponse.json({ error: 'clinicId, date は必須です' }, { status: 400 });
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
      await tx.dailyMetric.deleteMany({
        where: { clinicId, date: dateObj },
      });

      // 新しいデータを挿入
      if (entries && entries.length > 0) {
        await tx.dailyMetric.createMany({
          data: entries.map((entry: { itemId: string; value: number; note?: string }) => ({
            clinicId,
            date: dateObj,
            itemId: entry.itemId,
            value: entry.value,
            note: entry.note || null,
            createdBy: session.user!.id,
          })),
        });
      }

      // 日次メモを更新
      if (dailyNote !== undefined) {
        await tx.dailyNote.upsert({
          where: {
            clinicId_date: { clinicId, date: dateObj },
          },
          update: {
            note: dailyNote,
            createdBy: session.user!.id,
          },
          create: {
            clinicId,
            date: dateObj,
            note: dailyNote,
            createdBy: session.user!.id,
          },
        });
      }
    });

    return NextResponse.json({ success: true, date });
  } catch (error) {
    console.error('Error saving daily metrics:', error);
    return NextResponse.json({ error: '日次データの保存に失敗しました' }, { status: 500 });
  }
}
