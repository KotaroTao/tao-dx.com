import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 項目更新
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
    const { name, type, unit, description, sortOrder, isActive } = body;

    // 項目の存在確認と所有権確認
    const item = await prisma.metricItem.findFirst({
      where: { id },
      include: { category: { include: { clinic: true } } },
    });

    if (!item) {
      return NextResponse.json({ error: '項目が見つかりません' }, { status: 404 });
    }

    if (item.category.clinic.userId !== session.user.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    const updatedItem = await prisma.metricItem.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(type !== undefined && { type }),
        ...(unit !== undefined && { unit }),
        ...(description !== undefined && { description }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: '項目の更新に失敗しました' }, { status: 500 });
  }
}

// 項目削除（論理削除）
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

    // 項目の存在確認と所有権確認
    const item = await prisma.metricItem.findFirst({
      where: { id },
      include: { category: { include: { clinic: true } } },
    });

    if (!item) {
      return NextResponse.json({ error: '項目が見つかりません' }, { status: 404 });
    }

    if (item.category.clinic.userId !== session.user.id) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    // 論理削除
    await prisma.metricItem.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: '項目の削除に失敗しました' }, { status: 500 });
  }
}
