import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// クリニック一覧取得
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const clinics = await prisma.clinic.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        scores: {
          orderBy: { date: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      clinics: clinics.map((clinic: typeof clinics[number]) => ({
        id: clinic.id,
        name: clinic.name,
        website: clinic.website,
        latestScore: clinic.scores[0] || null,
        createdAt: clinic.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching clinics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// クリニック作成
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, website, address, phone, directorName, specialties } = body;

    if (!name) {
      return NextResponse.json({ error: 'Clinic name is required' }, { status: 400 });
    }

    const clinic = await prisma.clinic.create({
      data: {
        name,
        website: website || null,
        address: address || null,
        phone: phone || null,
        directorName: directorName || null,
        specialties: specialties || [],
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      clinic: {
        id: clinic.id,
        name: clinic.name,
        website: clinic.website,
      },
    });
  } catch (error) {
    console.error('Error creating clinic:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
