import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

// サマリーデータ取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const periodType = searchParams.get('periodType') || 'MONTHLY';
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!) : new Date().getMonth() + 1;

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

    // 期間の開始日・終了日を計算
    let startDate: Date;
    let endDate: Date;

    if (periodType === 'MONTHLY') {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else if (periodType === 'YEARLY') {
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    } else {
      return NextResponse.json({ error: '無効な periodType です' }, { status: 400 });
    }

    // 日次データを取得
    const dailyMetrics = await prisma.dailyMetric.findMany({
      where: {
        clinicId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        item: {
          include: {
            category: true,
          },
        },
      },
    });

    // 目標を取得
    const goals = await prisma.metricGoal.findMany({
      where: {
        clinicId,
        year,
        ...(periodType === 'MONTHLY' && { period: 'MONTHLY', month }),
        ...(periodType === 'YEARLY' && { period: 'YEARLY' }),
      },
      include: {
        item: true,
      },
    });

    // カテゴリごとに集計
    const categoryTotals: Record<
      string,
      {
        categoryId: string;
        categoryName: string;
        categoryColor: string;
        items: Record<
          string,
          {
            itemId: string;
            itemName: string;
            unit: string;
            type: string;
            sum: number;
            count: number;
            avg: number;
            target?: number;
            achievementRate?: number;
          }
        >;
        totalRevenue: number;
        totalPatients: number;
      }
    > = {};

    dailyMetrics.forEach((metric) => {
      const categoryId = metric.item.categoryId;
      const itemId = metric.itemId;

      if (!categoryTotals[categoryId]) {
        categoryTotals[categoryId] = {
          categoryId,
          categoryName: metric.item.category.name,
          categoryColor: metric.item.category.color,
          items: {},
          totalRevenue: 0,
          totalPatients: 0,
        };
      }

      if (!categoryTotals[categoryId].items[itemId]) {
        categoryTotals[categoryId].items[itemId] = {
          itemId,
          itemName: metric.item.name,
          unit: metric.item.unit,
          type: metric.item.type,
          sum: 0,
          count: 0,
          avg: 0,
        };
      }

      const value = parseFloat(metric.value.toString());
      categoryTotals[categoryId].items[itemId].sum += value;
      categoryTotals[categoryId].items[itemId].count += 1;

      // 売上と患者数の合計を計算
      if (metric.item.name === '売上') {
        categoryTotals[categoryId].totalRevenue += value;
      }
      if (metric.item.name === '患者数') {
        categoryTotals[categoryId].totalPatients += value;
      }
    });

    // 平均を計算し、目標達成率を追加
    Object.values(categoryTotals).forEach((category) => {
      Object.values(category.items).forEach((item) => {
        item.avg = item.count > 0 ? item.sum / item.count : 0;

        // 目標達成率を計算
        const goal = goals.find((g) => g.itemId === item.itemId);
        if (goal) {
          item.target = parseFloat(goal.targetValue.toString());
          item.achievementRate = item.target > 0 ? (item.sum / item.target) * 100 : 0;
        }
      });
    });

    // 全体サマリーを計算
    let totalRevenue = 0;
    let totalPatients = 0;
    let totalNewPatients = 0;

    Object.values(categoryTotals).forEach((category) => {
      totalRevenue += category.totalRevenue;
      totalPatients += category.totalPatients;

      Object.values(category.items).forEach((item) => {
        if (item.itemName === '新患数') {
          totalNewPatients += item.sum;
        }
      });
    });

    // 前月比較データを取得
    let prevStartDate: Date;
    let prevEndDate: Date;

    if (periodType === 'MONTHLY') {
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      prevStartDate = new Date(prevYear, prevMonth - 1, 1);
      prevEndDate = new Date(prevYear, prevMonth, 0);
    } else {
      prevStartDate = new Date(year - 1, 0, 1);
      prevEndDate = new Date(year - 1, 11, 31);
    }

    const prevDailyMetrics = await prisma.dailyMetric.findMany({
      where: {
        clinicId,
        date: {
          gte: prevStartDate,
          lte: prevEndDate,
        },
      },
      include: {
        item: true,
      },
    });

    let prevTotalRevenue = 0;
    let prevTotalPatients = 0;
    let prevTotalNewPatients = 0;

    prevDailyMetrics.forEach((metric) => {
      const value = parseFloat(metric.value.toString());
      if (metric.item.name === '売上') {
        prevTotalRevenue += value;
      }
      if (metric.item.name === '患者数') {
        prevTotalPatients += value;
      }
      if (metric.item.name === '新患数') {
        prevTotalNewPatients += value;
      }
    });

    // 変化率を計算
    const revenueChange = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0;
    const patientsChange = prevTotalPatients > 0 ? ((totalPatients - prevTotalPatients) / prevTotalPatients) * 100 : 0;
    const newPatientsChange =
      prevTotalNewPatients > 0 ? ((totalNewPatients - prevTotalNewPatients) / prevTotalNewPatients) * 100 : 0;

    // 自費率を計算
    const selfPayCategories = ['自費診療（矯正）', '自費診療（インプラント）', '自費診療（審美）'];
    let selfPayRevenue = 0;
    Object.values(categoryTotals).forEach((category) => {
      if (selfPayCategories.includes(category.categoryName)) {
        selfPayRevenue += category.totalRevenue;
      }
    });
    const selfPayRatio = totalRevenue > 0 ? (selfPayRevenue / totalRevenue) * 100 : 0;

    return NextResponse.json({
      period: {
        type: periodType,
        year,
        month: periodType === 'MONTHLY' ? month : null,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
      },
      summary: {
        totalRevenue,
        totalPatients,
        totalNewPatients,
        selfPayRatio,
        avgRevenuePerPatient: totalPatients > 0 ? totalRevenue / totalPatients : 0,
      },
      comparison: {
        revenueChange,
        patientsChange,
        newPatientsChange,
        prevTotalRevenue,
        prevTotalPatients,
        prevTotalNewPatients,
      },
      byCategory: Object.values(categoryTotals).map((category) => ({
        ...category,
        items: Object.values(category.items),
      })),
      goals: goals.map((g) => ({
        itemId: g.itemId,
        itemName: g.item.name,
        targetValue: parseFloat(g.targetValue.toString()),
        actualValue:
          Object.values(categoryTotals)
            .flatMap((c) => Object.values(c.items))
            .find((i) => i.itemId === g.itemId)?.sum || 0,
      })),
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json({ error: 'サマリーの取得に失敗しました' }, { status: 500 });
  }
}
