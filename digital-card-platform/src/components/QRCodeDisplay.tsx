'use client';

import { useEffect, useState } from 'react';
import styles from '@/styles/business-card.module.css';

interface QRCodeDisplayProps {
  vCardString: string;
  accentColor: string;
}

export default function QRCodeDisplay({ vCardString, accentColor }: QRCodeDisplayProps) {
  const [svgHtml, setSvgHtml] = useState<string>('');

  useEffect(() => {
    async function generateQR() {
      try {
        const QRCode = (await import('qrcode')).default;
        const svg = await QRCode.toString(vCardString, {
          type: 'svg',
          errorCorrectionLevel: 'M',
          margin: 2,
          width: 180,
          color: {
            dark: '#000000',
            light: '#00000000',
          },
        });
        setSvgHtml(svg);
      } catch (err) {
        console.error('QR generation error:', err);
      }
    }
    if (vCardString) generateQR();
  }, [vCardString]);

  return (
    <div className={styles.backContent}>
      <div
        className={styles.qrWrapper}
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
      <p className={styles.scanText} style={{ color: accentColor }}>
        Scan to save my contact
      </p>
    </div>
  );
}
