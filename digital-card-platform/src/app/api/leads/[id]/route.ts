import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { LEAD_STATUSES } from '@/lib/fields';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Sign in first.' }, { status: 401 });
  }

  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Send JSON.' }, { status: 400 });
  }

  if (!body.status || !LEAD_STATUSES.includes(body.status as (typeof LEAD_STATUSES)[number])) {
    return NextResponse.json({ error: 'Unknown status.' }, { status: 400 });
  }

  const userId = (session.user as { id: string }).id;
  const lead = await prisma.lead.findFirst({
    where: { id: params.id, card: { userId } },
  });
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
  }

  const updated = await prisma.lead.update({
    where: { id: lead.id },
    data: { status: body.status },
  });

  return NextResponse.json(updated);
}
