import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cleanText, isEmail } from '@/lib/fields';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Send JSON.' }, { status: 400 });
  }

  // Hidden field. Bots fill it. People do not.
  if (cleanText(body.website_url, 200)) {
    return NextResponse.json({ ok: true });
  }

  const name = cleanText(body.name, 80);
  const email = cleanText(body.email, 120);
  const phone = cleanText(body.phone, 40);
  const company = cleanText(body.company, 80);
  const note = cleanText(body.note, 500);

  if (name.length < 2) {
    return NextResponse.json({ error: 'Add your name.' }, { status: 400 });
  }
  if (!email && !phone) {
    return NextResponse.json({ error: 'Add an email or a phone number.' }, { status: 400 });
  }
  if (email && !isEmail(email)) {
    return NextResponse.json({ error: 'That email does not look valid.' }, { status: 400 });
  }

  const card = await prisma.card.findUnique({ where: { slug: params.slug } });
  if (!card || !card.isPublished) {
    return NextResponse.json({ error: 'This card is not available.' }, { status: 404 });
  }

  const lead = await prisma.lead.create({
    data: {
      cardId: card.id,
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      note: note || null,
      source: 'card',
    },
  });

  return NextResponse.json({ ok: true, id: lead.id });
}
