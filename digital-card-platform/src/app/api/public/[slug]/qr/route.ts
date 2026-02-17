import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateVCardString } from '@/lib/vcard';
import { generateQRCodeBuffer } from '@/lib/qrcode';

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

  const buffer = await generateQRCodeBuffer(vCardString);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="${card.slug}-qr.png"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
