'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Noto_Sans, Noto_Sans_Lao } from 'next/font/google';
import { CardData } from '@/types';
import { generateVCardString } from '@/lib/vcard';

const noto = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const notoLao = Noto_Sans_Lao({
  subsets: ['lao'],
  weight: ['400', '500', '700'],
  display: 'swap',
});

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  const mark = parts.map((part) => part[0] || '').join('');
  return mark || 'TC';
}

function digits(phone: string) {
  return phone.replace(/\D/g, '');
}

const SOCIAL_LABEL: Record<string, string> = {
  facebook: 'Facebook',
  twitter: 'X',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  github: 'GitHub',
  codepen: 'CodePen',
  tiktok: 'TikTok',
  youtube: 'YouTube',
};

function safeHttp(url: string) {
  const trimmed = url.trim();
  if (!trimmed || /^javascript:/i.test(trimmed)) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px]">
      <path
        d={d}
        fill="none"
        stroke="#1B2A6B"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PublicCard({ card }: { card: CardData }) {
  const [qr, setQr] = useState('');
  const [flipped, setFlipped] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const vcard = generateVCardString({
    fullName: card.fullName,
    jobTitle: card.jobTitle,
    company: card.company,
    phone: card.phone,
    email: card.email,
    website: card.website,
    address: card.address,
  });

  useEffect(() => {
    let cancel = false;
    import('qrcode').then(({ default: QRCode }) => {
      QRCode.toString(vcard, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 640,
        color: { dark: '#0C1330', light: '#ffffff' },
      }).then((svg) => {
        if (!cancel) setQr(svg);
      });
    });
    return () => {
      cancel = true;
    };
  }, [vcard]);

  useEffect(() => {
    if (!flipped) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFlipped(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [flipped]);

  const phone = card.phone?.trim() || '';
  const email = card.email?.trim() || '';
  const wa = digits(phone);
  const role = [card.jobTitle, card.company].filter(Boolean).join(' · ');

  const actions = [
    phone
      ? { label: 'Call', href: `tel:${phone}`, icon: 'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z' }
      : null,
    email
      ? { label: 'Email', href: `mailto:${email}`, icon: 'M4 4h16v16H4zM4 6l8 6 8-6' }
      : null,
    wa
      ? { label: 'WhatsApp', href: `https://wa.me/${wa}`, icon: 'M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20.5l1.8-5.2A8.5 8.5 0 1 1 21 11.5z' }
      : null,
    { label: 'Save', href: `/card/${card.slug}/vcard`, icon: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM7 3v6h8' },
  ].filter(Boolean) as { label: string; href: string; icon: string }[];

  const rows = [
    phone ? { k: 'Tel', v: phone } : null,
    email ? { k: 'Mail', v: email } : null,
    card.website ? { k: 'Web', v: card.website.replace(/^https?:\/\//, '') } : null,
    card.address ? { k: 'Pin', v: card.address } : null,
  ].filter(Boolean) as { k: string; v: string }[];

  const socials = Object.entries(card.socialLinks || {})
    .map(([key, value]) => {
      const href = typeof value === 'string' ? safeHttp(value) : '';
      const label = SOCIAL_LABEL[key];
      return href && label ? { key, href, label } : null;
    })
    .filter(Boolean) as { key: string; href: string; label: string }[];

  return (
    <article
      className={`${noto.className} ${notoLao.className} tapcard-face w-full max-w-full overflow-hidden rounded-[22px] bg-white text-[#0C1330] shadow-[0_28px_60px_-28px_rgba(0,0,0,.7)]`}
      style={{ fontFamily: `${noto.style.fontFamily}, ${notoLao.style.fontFamily}, system-ui, sans-serif` }}
    >
      <div
        className="relative h-[104px]"
        style={
          card.bannerUrl
            ? { backgroundImage: `linear-gradient(118deg, rgba(27,42,107,.72), rgba(12,19,48,.45)), url(${card.bannerUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: 'linear-gradient(118deg, #1B2A6B 0%, #111B47 58%, #C9A84C 190%)' }
        }
      >
        <div className="absolute left-1/2 bottom-[-42px] grid h-[84px] w-[84px] -translate-x-1/2 place-items-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-[#E0BE63] to-[#A8863A] text-[1.45rem] font-extrabold tracking-tight text-[#0C1330]">
          {card.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={card.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(card.fullName)
          )}
        </div>
      </div>

      <div className="px-5 pb-5 pt-14 text-center">
        <h1 className="break-words text-[1.35rem] font-extrabold leading-tight tracking-tight sm:text-[1.45rem]">
          {card.fullName}
        </h1>
        {role && <p className="mt-1 break-words text-[0.95rem] text-[#5c6478]">{role}</p>}
        {card.bio && (
          <p className="mx-auto mt-3 max-w-[32ch] text-sm leading-relaxed text-[#3d4558] line-clamp-4">
            {card.bio}
          </p>
        )}
        {(card.company || socials.length > 0) && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {card.company && (
              <span className="rounded-full bg-[#1B2A6B]/10 px-2.5 py-1 text-xs font-semibold text-[#1B2A6B]">
                {card.company}
              </span>
            )}
            {socials.map((social) => (
              <a
                key={social.key}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#1B2A6B]/10 px-2.5 py-1 text-xs font-semibold text-[#1B2A6B]"
              >
                {social.label}
              </a>
            ))}
          </div>
        )}

        <div className={`tapcard-actions mt-5 ${actions.length > 2 ? 'is-four' : ''}`}>
          {actions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="grid min-h-11 min-w-0 place-items-center gap-1 rounded-xl border border-[#e6e2da] bg-[#F5F5F4] px-1 py-2 text-center text-xs font-semibold leading-tight text-[#5c6478] hover:border-[#C9A84C] hover:bg-white"
            >
              <Icon d={action.icon} />
              <span className="max-w-full">{action.label}</span>
            </a>
          ))}
        </div>

        {rows.length > 0 && (
          <ul className="mt-4 border-t border-[#e6e2da] pt-3 text-left">
            {rows.map((row) => (
              <li key={row.k} className="flex items-start gap-2.5 py-1.5 text-sm">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#1B2A6B]/10 text-[0.65rem] font-bold text-[#1B2A6B]">
                  {row.k}
                </span>
                <span className="min-w-0 break-words pt-0.5 text-[#3d4558]">{row.v}</span>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={() => setFlipped(true)}
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#1B2A6B] px-4 py-3 text-sm font-semibold text-white"
        >
          Show QR
        </button>
      </div>
      {flipped && typeof document !== 'undefined' && createPortal(
        <div className="tapcard-qr-screen" role="dialog" aria-modal="true" aria-label={`QR code for ${card.fullName}`}>
          <div className={`${noto.className} ${notoLao.className} tapcard-qr-sheet text-[#0C1330]`}>
            <div className="flex w-full shrink-0">
              <button
                ref={closeRef}
                type="button"
                onClick={() => setFlipped(false)}
                className="min-h-11 rounded-full px-1 text-sm font-semibold text-[#1B2A6B] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B2A6B]"
              >
                Back to card
              </button>
            </div>
            <div className="flex w-full flex-1 flex-col items-center justify-center gap-3">
              <p className="text-center text-lg font-extrabold">{card.fullName}</p>
              <div
                className="aspect-square w-[min(86vw,58vh,560px)] max-w-full [&_svg]:h-auto [&_svg]:w-full"
                dangerouslySetInnerHTML={{ __html: qr }}
              />
              <p className="text-center text-sm font-semibold">Scan to save this contact</p>
              <p className="max-w-[28ch] text-center text-xs text-[#5c6478]">
                The phone will ask to add {card.fullName} to contacts.
              </p>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </article>
  );
}
