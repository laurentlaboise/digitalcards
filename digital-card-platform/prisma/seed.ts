import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const password = await hash('demo1234', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@digitalcard.io' },
    update: {},
    create: {
      email: 'demo@digitalcard.io',
      password,
      name: 'Demo User',
    },
  });

  // Card 1: Jesse Couch - the original CodePen inspiration
  await prisma.card.upsert({
    where: { slug: 'jesse-couch' },
    update: {},
    create: {
      slug: 'jesse-couch',
      userId: user.id,
      fullName: 'Jesse Couch',
      jobTitle: 'Digital Creative',
      company: 'DesignCouch',
      bio: 'Designer, developer, and creative thinker building beautiful digital experiences.',
      email: 'jesse@designcouch.com',
      phone: '+1 (555) 234-5678',
      website: 'https://designcouch.com',
      address: 'San Francisco, CA',
      socialLinks: {
        twitter: 'https://twitter.com/designcouch',
        linkedin: 'https://linkedin.com/in/jessecouch',
        github: 'https://github.com/designcouch',
        codepen: 'https://codepen.io/designcouch',
        instagram: 'https://instagram.com/designcouch',
      },
      primaryColor: '#c8261d',
      accentColor: '#6b0500',
      backgroundColor: '#220200',
      viewCount: 142,
      isPublished: true,
    },
  });

  // Card 2: Ocean Blue theme
  await prisma.card.upsert({
    where: { slug: 'sarah-chen' },
    update: {},
    create: {
      slug: 'sarah-chen',
      userId: user.id,
      fullName: 'Sarah Chen',
      jobTitle: 'Product Manager',
      company: 'TechFlow',
      bio: 'Building products that people love. Passionate about user experience and data-driven decisions.',
      email: 'sarah@techflow.io',
      phone: '+1 (555) 987-6543',
      website: 'https://sarahchen.dev',
      address: 'New York, NY',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/sarahchen',
        twitter: 'https://twitter.com/sarahchen',
        github: 'https://github.com/sarahchen',
      },
      primaryColor: '#1d6fc8',
      accentColor: '#002f6b',
      backgroundColor: '#001222',
      viewCount: 89,
      isPublished: true,
    },
  });

  // Card 3: Forest Green theme
  await prisma.card.upsert({
    where: { slug: 'marcus-green' },
    update: {},
    create: {
      slug: 'marcus-green',
      userId: user.id,
      fullName: 'Marcus Green',
      jobTitle: 'Sustainability Consultant',
      company: 'EcoVentures',
      bio: 'Helping businesses go green. Speaker, writer, and environmental advocate.',
      email: 'marcus@ecoventures.co',
      phone: '+1 (555) 321-0987',
      website: 'https://ecoventures.co',
      address: 'Portland, OR',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/marcusgreen',
        instagram: 'https://instagram.com/marcusgreen',
        youtube: 'https://youtube.com/@marcusgreen',
      },
      primaryColor: '#1dc84a',
      accentColor: '#006b1a',
      backgroundColor: '#002208',
      viewCount: 56,
      isPublished: true,
    },
  });

  console.log('Seed data created successfully!');
  console.log('Demo login: demo@digitalcard.io / demo1234');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
