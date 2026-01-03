import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// データエクスポート（CSV）
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
    const format = searchParams.get('format') || 'csv';

    if (!clinicId || !startDate || !endDate) {
      return NextResponse.json({ error: 'clinicId, startDate, endDate は必須です' }, { status: 400 });
    }

    // クリニックの所有権確認
    const clinic = await prisma.clinic.findFirst({
      where: { id: clinicId, userId: session.user.id },
    });

    if (!clinic) {
      return NextResponse.json({ error: 'クリニックが見つかりません' }, { status: 404 });
    }

    // データ取得
    const dailyMetrics = await prisma.dailyMetric.findMany({
      where: {
        clinicId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: {
        item: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [{ date: 'asc' }, { item: { category: { sortOrder: 'asc' } } }, { item: { sortOrder: 'asc' } }],
    });

    if (format === 'csv') {
      // CSV形式でエクスポート
      const headers = ['日付', 'カテゴリ', '項目', '値', '単位', 'メモ'];
      const rows = dailyMetrics.map((metric) => [
        metric.date.toISOString().split('T')[0],
        metric.item.category.name,
        metric.item.name,
        metric.value.toString(),
        metric.item.unit,
        metric.note || '',
      ]);

      const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

      // BOM付きUTF-8で返す
      const bom = '\uFEFF';
      const csvWithBom = bom + csvContent;

      return new NextResponse(csvWithBom, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="metrics_${startDate}_${endDate}.csv"`,
        },
      });
    } else if (format === 'json') {
      // JSON形式でエクスポート
      return NextResponse.json({
        clinic: {
          id: clinic.id,
          name: clinic.name,
        },
        period: {
          startDate,
          endDate,
        },
        data: dailyMetrics.map((metric) => ({
          date: metric.date.toISOString().split('T')[0],
          category: metric.item.category.name,
          item: metric.item.name,
          value: parseFloat(metric.value.toString()),
          unit: metric.item.unit,
          note: metric.note,
        })),
      });
    }

    return NextResponse.json({ error: '無効な format です' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'データのエクスポートに失敗しました' }, { status: 500 });
  }
}
