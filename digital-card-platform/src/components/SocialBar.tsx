'use client';

import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Github,
  Globe,
  Mail,
  CodepenIcon,
  Music2,
  Youtube,
  UserCircle,
  Undo2,
} from 'lucide-react';
import styles from '@/styles/business-card.module.css';
import { SocialLinks } from '@/types';

interface SocialBarProps {
  socialLinks?: SocialLinks | null;
  email?: string | null;
  website?: string | null;
  iconColor: string;
  hoverColor: string;
  isBack?: boolean;
  onFlip: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SOCIAL_ICONS: Record<string, React.ComponentType<any>> = {
  facebook: Facebook,
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  github: Github,
  codepen: CodepenIcon,
  tiktok: Music2,
  youtube: Youtube,
};

export default function SocialBar({
  socialLinks,
  email,
  website,
  iconColor,
  hoverColor,
  isBack = false,
  onFlip,
}: SocialBarProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const links: { url: string; icon: React.ComponentType<any> }[] = [];

  if (socialLinks) {
    for (const [key, value] of Object.entries(socialLinks)) {
      if (value && SOCIAL_ICONS[key]) {
        links.push({ url: value, icon: SOCIAL_ICONS[key] });
      }
    }
  }

  if (website) links.push({ url: website, icon: Globe });
  if (email) links.push({ url: `mailto:${email}`, icon: Mail });

  return (
    <div className={styles.socialBar}>
      {links.map((link, i) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.socialIcon} ${isBack ? styles.socialIconBack : ''}`}
          style={{ color: iconColor }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = hoverColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = iconColor;
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <link.icon size={18} />
        </a>
      ))}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onFlip();
        }}
        className={`${styles.socialIcon} ${styles.moreInfo} ${isBack ? styles.socialIconBack : ''}`}
        style={{ color: iconColor }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = hoverColor;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = iconColor;
        }}
      >
        {isBack ? <Undo2 size={18} /> : <UserCircle size={18} />}
      </button>
    </div>
  );
}
