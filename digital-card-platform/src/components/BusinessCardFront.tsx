'use client';

import styles from '@/styles/business-card.module.css';
import SocialBar from './SocialBar';
import { CardData } from '@/types';
import { hexToRgba } from '@/lib/utils';

interface BusinessCardFrontProps {
  card: CardData;
  showArrow: boolean;
  onFlip: () => void;
}

export default function BusinessCardFront({ card, showArrow, onFlip }: BusinessCardFrontProps) {
  const bannerStyle = card.bannerUrl
    ? { backgroundImage: `url(${card.bannerUrl})` }
    : { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };

  const avatarStyle = card.avatarUrl
    ? { backgroundImage: `url(${card.avatarUrl})` }
    : { background: '#ccc' };

  return (
    <div className={styles.front}>
      {/* Banner Image */}
      <div className={styles.topPic} style={bannerStyle} />

      {/* Avatar */}
      <div className={styles.avatar} style={avatarStyle} />

      {/* Info Box */}
      <div
        className={styles.infoBox}
        style={{ background: hexToRgba(card.primaryColor, 0.7) }}
      >
        <div className={styles.info}>
          <h1>{card.fullName}</h1>
          <h2 style={{ color: card.accentColor }}>
            {card.jobTitle}
            {card.jobTitle && card.company ? ' — ' : ''}
            {card.company}
          </h2>
        </div>
      </div>

      {/* Social Bar */}
      <SocialBar
        socialLinks={card.socialLinks}
        email={card.email}
        website={card.website}
        iconColor="#951009"
        hoverColor="#450300"
        onFlip={onFlip}
      />

      {/* Arrow Hint */}
      {showArrow && (
        <div className={styles.arrow}>
          ←
        </div>
      )}
    </div>
  );
}
