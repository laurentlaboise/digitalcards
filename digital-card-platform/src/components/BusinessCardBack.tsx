'use client';

import styles from '@/styles/business-card.module.css';
import SocialBar from './SocialBar';
import QRCodeDisplay from './QRCodeDisplay';
import { CardData } from '@/types';
import { generateVCardString } from '@/lib/vcard';

interface BusinessCardBackProps {
  card: CardData;
  onFlip: () => void;
}

export default function BusinessCardBack({ card, onFlip }: BusinessCardBackProps) {
  const vCardString = generateVCardString({
    fullName: card.fullName,
    jobTitle: card.jobTitle,
    company: card.company,
    phone: card.phone,
    email: card.email,
    website: card.website,
    address: card.address,
  });

  return (
    <div className={styles.back}>
      <QRCodeDisplay vCardString={vCardString} accentColor={card.accentColor} />

      <SocialBar
        socialLinks={card.socialLinks}
        email={card.email}
        website={card.website}
        iconColor="#951009"
        hoverColor="#450300"
        isBack
        onFlip={onFlip}
      />
    </div>
  );
}
