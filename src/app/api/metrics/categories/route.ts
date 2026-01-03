import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { createDefaultMetricCategories } from '../../../../../prisma/seed-metrics';

// カテゴリ一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

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

    const categories = await prisma.metricCategory.findMany({
      where: { clinicId, isActive: true },
      include: {
        items: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'カテゴリの取得に失敗しました' }, { status: 500 });
  }
}

// カテゴリ作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { clinicId, name, color, icon, createDefaults } = body;

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

    // デフォルトカテゴリを作成する場合
    if (createDefaults) {
      // 既存のカテゴリがあるか確認
      const existingCategories = await prisma.metricCategory.findMany({
        where: { clinicId },
      });

      if (existingCategories.length > 0) {
        return NextResponse.json({ error: 'すでにカテゴリが存在します' }, { status: 400 });
      }

      await createDefaultMetricCategories(clinicId);

      const categories = await prisma.metricCategory.findMany({
        where: { clinicId },
        include: { items: true },
        orderBy: { sortOrder: 'asc' },
      });

      return NextResponse.json(categories, { status: 201 });
    }

    // 個別カテゴリ作成
    if (!name) {
      return NextResponse.json({ error: 'name は必須です' }, { status: 400 });
    }

    // 最大sortOrderを取得
    const maxSortOrder = await prisma.metricCategory.aggregate({
      where: { clinicId },
      _max: { sortOrder: true },
    });

    const category = await prisma.metricCategory.create({
      data: {
        clinicId,
        name,
        color: color || '#6366f1',
        icon,
        sortOrder: (maxSortOrder._max.sortOrder || 0) + 1,
        isDefault: false,
        isActive: true,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'カテゴリの作成に失敗しました' }, { status: 500 });
  }
}
