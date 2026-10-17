import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { isAdminEmail } from '@/lib/admin';
import { cleanText, INQUIRY_PLANS, isEmail } from '@/lib/fields';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: 'Not available.' }, { status: 403 });
  }

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(inquiries);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Send JSON.' }, { status: 400 });
  }

  if (cleanText(body.website_url, 200)) {
    return NextResponse.json({ ok: true });
  }

  const name = cleanText(body.name, 80);
  const email = cleanText(body.email, 120);
  const phone = cleanText(body.phone, 40);
  const company = cleanText(body.company, 80);
  const country = cleanText(body.country, 60);
  const message = cleanText(body.message, 1000);
  const plan = cleanText(body.plan, 20) || 'free';

  if (name.length < 2) {
    return NextResponse.json({ error: 'Add your name.' }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: 'Add a real email.' }, { status: 400 });
  }
  if (!INQUIRY_PLANS.includes(plan as (typeof INQUIRY_PLANS)[number])) {
    return NextResponse.json({ error: 'Pick a plan.' }, { status: 400 });
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      name,
      email,
      phone: phone || null,
      company: company || null,
      country: country || null,
      plan,
      message: message || null,
      source: 'site',
    },
  });

  return NextResponse.json({ ok: true, id: inquiry.id });
}
