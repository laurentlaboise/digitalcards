import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const card = await prisma.card.findFirst({
    where: { id: params.id, userId },
  });

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  return NextResponse.json(card);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const userId = (session.user as { id: string }).id;
    const data = await req.json();

    const existing = await prisma.card.findFirst({
      where: { id: params.id, userId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const card = await prisma.card.update({
      where: { id: params.id },
      data: {
        fullName: data.fullName,
        jobTitle: data.jobTitle ?? null,
        company: data.company ?? null,
        bio: data.bio ?? null,
        email: data.email ?? null,
        phone: data.phone ?? null,
        website: data.website ?? null,
        address: data.address ?? null,
        socialLinks: data.socialLinks ?? null,
        primaryColor: data.primaryColor,
        accentColor: data.accentColor,
        backgroundColor: data.backgroundColor,
        slug: data.slug || existing.slug,
        isPublished: data.isPublished ?? existing.isPublished,
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error('Update card error:', error);
    return NextResponse.json({ error: 'Failed to update card' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;

  const existing = await prisma.card.findFirst({
    where: { id: params.id, userId },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  await prisma.card.delete({ where: { id: params.id } });

  return NextResponse.json({ success: true });
}
