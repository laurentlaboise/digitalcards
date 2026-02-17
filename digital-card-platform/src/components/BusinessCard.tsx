'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from '@/styles/business-card.module.css';
import BusinessCardFront from './BusinessCardFront';
import BusinessCardBack from './BusinessCardBack';
import { CardData } from '@/types';

interface BusinessCardProps {
  card: CardData;
  isPreview?: boolean;
}

export default function BusinessCard({ card, isPreview = false }: BusinessCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showArrow, setShowArrow] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    if (showArrow) setShowArrow(false);
  }, [showArrow]);

  const handleBackgroundClick = useCallback(() => {
    if (isFlipped) setIsFlipped(false);
  }, [isFlipped]);

  if (isPreview) {
    return (
      <div style={{ position: 'relative' }}>
        <div className={styles.cardContainer} style={{ minHeight: 'auto', padding: '20px 0' }}>
          <div className={`${styles.card} ${isFlipped ? styles.cardFlipped : ''}`}>
            <BusinessCardFront card={card} showArrow={false} onFlip={handleFlip} />
            <BusinessCardBack card={card} onFlip={handleFlip} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${styles.wrapper} ${loaded ? styles.wrapperLoaded : ''}`}
      style={{ background: card.backgroundColor }}
    >
      {/* Blurred Background */}
      <div
        className={styles.backgroundBlur}
        style={{
          backgroundImage: card.bannerUrl ? `url(${card.bannerUrl})` : undefined,
          backgroundColor: card.bannerUrl ? undefined : card.backgroundColor,
        }}
      />
      <div
        className={styles.backgroundOverlay}
        style={{ background: `${card.backgroundColor}66` }}
        onClick={handleBackgroundClick}
      />

      {/* Card */}
      <div className={styles.cardContainer}>
        <div className={`${styles.card} ${isFlipped ? styles.cardFlipped : ''}`}>
          <BusinessCardFront card={card} showArrow={showArrow} onFlip={handleFlip} />
          <BusinessCardBack card={card} onFlip={handleFlip} />
        </div>
      </div>
    </div>
  );
}
