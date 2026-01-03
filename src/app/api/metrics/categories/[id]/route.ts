import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// カテゴリ更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, color, icon, sortOrder, isActive } = body;

    // カテゴリの存在確認と所有権確認
    const category = await prisma.metricCategory.findFirst({
      where: { id },
      include: { clinic: true },
    });

    if (!category) {
      return NextResponse.json({ error: 'カテゴリが見つかりません' }, { status: 404 });
    }

    if (category.clinic.userId !== session.user.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    const updatedCategory = await prisma.metricCategory.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: 'カテゴリの更新に失敗しました' }, { status: 500 });
  }
}

// カテゴリ削除（論理削除）
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { id } = await params;

    // カテゴリの存在確認と所有権確認
    const category = await prisma.metricCategory.findFirst({
      where: { id },
      include: { clinic: true },
    });

    if (!category) {
      return NextResponse.json({ error: 'カテゴリが見つかりません' }, { status: 404 });
    }

    if (category.clinic.userId !== session.user.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    // 論理削除
    await prisma.metricCategory.update({
      where: { id },
      data: { isActive: false },
    });

    // 関連する項目も論理削除
    await prisma.metricItem.updateMany({
      where: { categoryId: id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'カテゴリの削除に失敗しました' }, { status: 500 });
  }
}
