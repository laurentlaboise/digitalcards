import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const card = await prisma.card.findUnique({
    where: { slug: params.slug },
  });

  if (!card) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  await Promise.all([
    prisma.contactScan.create({
      data: {
        cardId: card.id,
        ipAddress,
        userAgent,
      },
    }),
    prisma.card.update({
      where: { id: card.id },
      data: {
        viewCount: { increment: 1 },
        lastViewedAt: new Date(),
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
