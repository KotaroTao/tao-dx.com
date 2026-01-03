import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { MetricType } from '@prisma/client';

// 項目一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const categoryId = searchParams.get('categoryId');

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

    const items = await prisma.metricItem.findMany({
      where: {
        clinicId,
        isActive: true,
        ...(categoryId && { categoryId }),
      },
      include: {
        category: true,
      },
      orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json({ error: '項目の取得に失敗しました' }, { status: 500 });
  }
}

// 項目作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { clinicId, categoryId, name, type, unit, description } = body;

    if (!clinicId || !categoryId || !name) {
      return NextResponse.json({ error: 'clinicId, categoryId, name は必須です' }, { status: 400 });
    }

    // カテゴリの存在確認と所有権確認
    const category = await prisma.metricCategory.findFirst({
      where: { id: categoryId },
      include: { clinic: true },
    });

    if (!category) {
      return NextResponse.json({ error: 'カテゴリが見つかりません' }, { status: 404 });
    }

    if (category.clinic.userId !== session.user.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    // 最大sortOrderを取得
    const maxSortOrder = await prisma.metricItem.aggregate({
      where: { categoryId },
      _max: { sortOrder: true },
    });

    const item = await prisma.metricItem.create({
      data: {
        clinicId,
        categoryId,
        name,
        type: type || MetricType.COUNT,
        unit: unit || '',
        description,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
        isDefault: false,
        isActive: true,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: '項目の作成に失敗しました' }, { status: 500 });
  }
}
