import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const leads = await prisma.lead.findMany({
    where: { card: { userId } },
    include: { card: { select: { slug: true, fullName: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(leads);
}
