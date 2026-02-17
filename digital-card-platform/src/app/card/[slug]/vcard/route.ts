import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateVCardString } from '@/lib/vcard';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const card = await prisma.card.findUnique({
    where: { slug: params.slug },
  });

  if (!card || !card.isPublished) {
    return NextResponse.json({ error: 'Card not found' }, { status: 404 });
  }

  const vCardString = generateVCardString({
    fullName: card.fullName,
    jobTitle: card.jobTitle,
    company: card.company,
    phone: card.phone,
    email: card.email,
    website: card.website,
    address: card.address,
  });

  return new NextResponse(vCardString, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${card.slug}.vcf"`,
    },
  });
}
