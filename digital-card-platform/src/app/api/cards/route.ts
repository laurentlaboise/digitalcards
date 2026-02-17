import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { generateSlug } from '@/lib/utils';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const cards = await prisma.card.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(cards);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = (session.user as { id: string }).id;
    const data = await req.json();

    let slug = data.slug || generateSlug(data.fullName);

    // Ensure unique slug
    const existing = await prisma.card.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const card = await prisma.card.create({
      data: {
        slug,
        userId,
        fullName: data.fullName,
        jobTitle: data.jobTitle || null,
        company: data.company || null,
        bio: data.bio || null,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        address: data.address || null,
        avatarUrl: data.avatarUrl || null,
        bannerUrl: data.bannerUrl || null,
        socialLinks: data.socialLinks || null,
        primaryColor: data.primaryColor || '#c8261d',
        accentColor: data.accentColor || '#6b0500',
        backgroundColor: data.backgroundColor || '#220200',
        isPublished: data.isPublished ?? true,
      },
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error('Create card error:', error);
    return NextResponse.json({ error: 'Failed to create card' }, { status: 500 });
  }
}
