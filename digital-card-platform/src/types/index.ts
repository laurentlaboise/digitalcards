export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  github?: string;
  codepen?: string;
  tiktok?: string;
  youtube?: string;
}

export interface CardData {
  id: string;
  slug: string;
  fullName: string;
  jobTitle?: string | null;
  company?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  address?: string | null;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  socialLinks?: SocialLinks | null;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  viewCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CardFormData {
  fullName: string;
  jobTitle: string;
  company: string;
  bio: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  socialLinks: SocialLinks;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  slug: string;
  isPublished: boolean;
}

export interface CardTheme {
  name: string;
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
}

export const CARD_THEMES: CardTheme[] = [
  { name: 'Classic Red', primaryColor: '#c8261d', accentColor: '#6b0500', backgroundColor: '#220200' },
  { name: 'Ocean Blue', primaryColor: '#1d6fc8', accentColor: '#002f6b', backgroundColor: '#001222' },
  { name: 'Forest Green', primaryColor: '#1dc84a', accentColor: '#006b1a', backgroundColor: '#002208' },
  { name: 'Midnight Purple', primaryColor: '#7b1dc8', accentColor: '#35006b', backgroundColor: '#120022' },
  { name: 'Sunset Gold', primaryColor: '#c8a01d', accentColor: '#6b5200', backgroundColor: '#221a00' },
  { name: 'Monochrome', primaryColor: '#555555', accentColor: '#222222', backgroundColor: '#111111' },
];
