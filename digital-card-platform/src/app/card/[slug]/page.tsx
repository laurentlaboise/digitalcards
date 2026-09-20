import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import CardViewClient from './CardViewClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const card = await prisma.card.findUnique({
    where: { slug: params.slug },
  });

  if (!card || !card.isPublished) {
    return { title: 'Card Not Found' };
  }

  const title = `${card.fullName}${card.jobTitle ? ` — ${card.jobTitle}` : ''} | TapCard`;
  const description = card.bio || `${card.fullName}'s digital business card. Scan the QR code to save contact.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'profile',
      siteName: 'TapCard',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    other: {
      'viewport': 'width=device-width, initial-scale=1, maximum-scale=1',
    },
  };
}

export default async function CardPage({ params }: Props) {
  const card = await prisma.card.findUnique({
    where: { slug: params.slug },
  });

  if (!card || !card.isPublished) {
    notFound();
  }

  // Track view server-side
  await prisma.card.update({
    where: { id: card.id },
    data: {
      viewCount: { increment: 1 },
      lastViewedAt: new Date(),
    },
  });

  const cardData = {
    ...card,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
    socialLinks: card.socialLinks as Record<string, string> | null,
  };

  return <CardViewClient card={cardData} />;
}
