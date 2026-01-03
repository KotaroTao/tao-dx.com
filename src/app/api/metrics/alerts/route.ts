import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AlertSeverity, NotificationChannel } from '@prisma/client';

// アラート設定一覧取得
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    const includeHistory = searchParams.get('includeHistory') === 'true';

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

    const alertSettings = await prisma.alertSetting.findMany({
      where: { clinicId },
      orderBy: { createdAt: 'desc' },
    });

    let alertHistory: unknown[] = [];
    if (includeHistory) {
      alertHistory = await prisma.alertHistory.findMany({
        where: { clinicId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }

    return NextResponse.json({ settings: alertSettings, history: alertHistory });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'アラート設定の取得に失敗しました' }, { status: 500 });
  }
}

// アラート設定作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { clinicId, name, description, conditionType, conditionValue, severity, channels } = body;

    if (!clinicId || !name || !conditionType || !conditionValue) {
      return NextResponse.json({ error: '必須項目が不足しています' }, { status: 400 });
    }

    // クリニックの所有権確認
    const clinic = await prisma.clinic.findFirst({
      where: { id: clinicId, userId: session.user.id },
    });

    if (!clinic) {
      return NextResponse.json({ error: 'クリニックが見つかりません' }, { status: 404 });
    }

    const alertSetting = await prisma.alertSetting.create({
      data: {
        clinicId,
        name,
        description,
        conditionType,
        conditionValue,
        severity: severity || AlertSeverity.WARNING,
        channels: channels || [NotificationChannel.APP],
        isActive: true,
      },
    });

    return NextResponse.json(alertSetting, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'アラート設定の作成に失敗しました' }, { status: 500 });
  }
}

// アラート履歴を既読にする
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { alertHistoryIds } = body;

    if (!alertHistoryIds || !Array.isArray(alertHistoryIds)) {
      return NextResponse.json({ error: 'alertHistoryIds は必須です' }, { status: 400 });
    }

    await prisma.alertHistory.updateMany({
      where: { id: { in: alertHistoryIds } },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating alert history:', error);
    return NextResponse.json({ error: 'アラート履歴の更新に失敗しました' }, { status: 500 });
  }
}
