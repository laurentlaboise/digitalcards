# TapCard — Platform Development Plan

**Brand:** TapCard · **Domain:** tapcard.asia (owned) · **Repo:** laurentlaboise/digitalcards
**Positioning:** The first Southeast Asia–native digital business card platform — multilingual, QR-first, regional-payment-ready, relationship-driven, priced for ASEAN MSMEs.

This plan consolidates three sources: the lao.one implementation paper (20-page build brief), the global/SEA market landscape report (12 competitor benchmark), and the current state of this repository. All former lao.one / liao.one branding is superseded by **TapCard / tapcard.asia**.

---

## 1. Executive Summary

- Global digital business card market: $159.4M (2022) → $505.2M (2032), 12.6% CAGR; APAC growing 15%+ with **no regional-native player**.
- Six unaddressed SEA gaps form the moat: (1) multilingual UX (Lao, Thai, Vietnamese, Khmer, Bahasa, Burmese scripts), (2) local payment rails (BCEL One, PromptPay, GrabPay, GoPay, GCash, VietQR, TrueMoney), (3) regional chat/social (LINE, Zalo, WeChat, Viber, TikTok, WhatsApp), (4) QR-first (not NFC-first), (5) $1–3/mo MSME pricing, (6) relationship-first tone, not cold lead capture.
- Composite product blueprint: **Wave Connect's generous free tier + Popl's visual customization + HiHello's multi-card + Switchit's in-card video + KADO's low-price CRM** — localized for ASEAN.
- Existing operation: ~23 live lao.one cards run manually across WordPress (my.lao.one), me-qr.com, and QRCodeChimp with BCEL One QR payment images. TapCard replaces this stitched workflow with one product, and imports those profiles as founding users.

## 2. Brand System (single source of truth)

| Element | Value |
|---|---|
| Name | **TapCard** (never "Tap Card" / "tapcard.asia" as name in UI copy) |
| Domain | tapcard.asia |
| Tagline | "One tap. Every connection." *(working — finalize in Figma brand exploration)* |
| Subtitle | "The Southeast Asia–native digital business card" |
| Primary color | Orange `#FF5722` |
| Secondary | Charcoal `#303942` |
| Neutrals | White `#FFFFFF`, soft gray `#F5F5F5`, charcoal `#303942` |
| Typography | **ITC Bauhaus** (wordmark) + Inter / Satoshi (UI) + **Noto Sans Lao / Thai / Khmer / Myanmar** for scripts |
| Mark | Orange squircle + white scribble; orange period on **TapCard.** |
| Do not use | Gold `#C9A84C`, indigo `#1B2A6B`, or sister lao.services magenta `#D40E54` |
| Shape | Rounded 12–16px radius, smooth micro-animations, 320px min width |
| Modes | Light + dark mode from day one |
| Card footer | "Made with TapCard" — free tier only, subtle |
| Tone | Warm, relationship-driven, multilingual storytelling — not corporate CRM |

**Rebrand cleanup** (T1 product-name + brand lock is in; do not invent DNS/payment/deploy changes):
- Landing, auth, dashboard chrome, README, and `index.html` now say **TapCard** (not Popl / DigitalCards)
- Brand tokens: orange `#FF5722` / charcoal `#303942`; orange squircle + white scribble; orange period on the wordmark
- `CNAME` → izzi.work remains unchanged until a later DNS decision
- Favicons/logo: Next `icon.svg` + landing mark use the orange squircle; QR-center logo can follow later

## 3. Domain & URL Architecture

| Surface | URL | Hosted on |
|---|---|---|
| Marketing site | `tapcard.asia` | Vercel (or GitHub Pages static) |
| Public card profiles | `tapcard.asia/[username]` (canonical), `my.tapcard.asia/[username]` alias | Vercel (SSR for SEO) |
| App / dashboard | `app.tapcard.asia` | Vercel |
| API | `api.tapcard.asia/v1/` | **Railway** |
| QR share deep link | `tapcard.asia/qr/[username]` | Vercel |
| vCard download | `api.tapcard.asia/v1/vcf/[username]` | Railway |
| Media CDN | Cloudinary | Cloudinary |

Legacy: if my.lao.one stays under your control, 301-redirect existing profile URLs to tapcard.asia equivalents; otherwise re-issue QR codes for the ~23 migrated users.

## 4. System Architecture

**Decision: consolidate the repo's two codebases into one product.**

- **Frontend (GitHub → Vercel):** the existing **Next.js 14 App Router** app (`digital-card-platform/`) becomes the sole frontend. Strip its internal API routes/Prisma/NextAuth server pieces over Phase 1 and point it at the NestJS API. Public card pages are **SSR for SEO**; dashboard is client-side; **PWA** via next-pwa (installable, offline QR display). Tailwind + Zustand. QR: `qr-code-styling` (center logo). vCard: `vcard-creator`.
- **Backend (Railway):** the existing **NestJS 10** backend (root `src/`) — already structured with 14 modules and 20 TypeORM entities (auth, users, organizations, profiles, sharing, nfc, analytics, leads, ecommerce, teams, integrations, admin) — deploys to Railway from the existing Dockerfile.
- **Railway services:** API (Docker) + **PostgreSQL** + **Redis** (BullMQ queues for analytics aggregation, email/SMS follow-ups, image jobs). Railway env groups per stage (staging/production).
- **Supporting software:** Cloudinary (images/video), Resend (email), Stripe (global billing) + manual BCEL One/local rails initially, Twilio or local SEA SMS provider, Cloudflare (DNS for tapcard.asia, optional worker for redirects), Sentry (errors), Plausible or PostHog (product analytics).
- **CI/CD:** GitHub Actions — lint/test/build on PR; Railway auto-deploy from `main` (backend); Vercel Git integration (frontend). Replace the current Pages workflow that strips server routes.

### Data model (Phase 1 core, extends existing entities)
- `users` — id, email, username, plan (free/pro/business/enterprise), locale
- `cards` — id, user_id, slug, display_name, title, bio (rich text), cover_url, headshot_url, theme (colors), language, mode (card/landing/lead/redirect — Phase 2), is_published
- `card_fields` — id, card_id, type (phone/email/social/payment/link/video/address), platform (line/zalo/whatsapp/wechat/facebook/tiktok/instagram/linkedin/x/bcel/promptpay/grabpay/gcash/…), label, value, sort_order, visible
- `card_views`, `contact_saves`, `link_clicks` — event tables with hashed IP, referrer, timestamp (aggregated nightly via BullMQ)
- Phase 2/3 reuse existing entities: organizations, teams, nfc_devices, lead_forms, orders, subscriptions, integrations.

## 5. Figma Design Workflow

Run design one step ahead of each build phase, in Figma (connected via Figma MCP — designs pull straight into code with `get_design_context` / Code Connect).

1. **File 1 — TapCard Brand Foundations:** logo exploration (wordmark + tap/QR glyph), final palette + accessibility check, type scale with Lao/Thai/Khmer script specimens, iconography, QR code styling, dark mode tokens. Export as Figma **variables/design tokens** → synced to `tailwind.config.ts`.
2. **File 2 — Component Library:** buttons, action-button row, pill tags, field rows, section cards, nav, form inputs, QR modal, toasts — each with light/dark and Latin/Lao script variants. Map to React components via **Code Connect** so the build session generates matching code.
3. **File 3 — MVP Screens (mobile-first, 390px + desktop):**
   - Public card page (the exact 14-block layout: cover → 120px circular headshot → name 24–28px → tag pills → [Call][Email][WhatsApp][Save Contact] → contact info → social/chat links → payment links → collapsible bio → video → portfolio links → floating "Share My Card" QR → vCard CTA → footer)
   - Onboarding (target: first card in under 2 minutes)
   - Dashboard: card list, editor (live phone preview left, sectioned fields right, drag-reorder, show/hide toggles, theme picker), share panel, basic analytics
   - Marketing landing for tapcard.asia
4. **FigJam:** user flows (create → share → save-contact → follow-up) and the Phase 2 payment-link flows per rail.
5. **Prototype** the public card page + onboarding for quick user testing with your existing 23 lao.one users before build hardening.

## 6. Product Phases

### Phase 0 — Foundation & Rebrand (Week 0–1)
- DNS: point tapcard.asia to Vercel; create `api.` subdomain → Railway
- Repo hygiene: create `main` branch (none exists), branch protection, monorepo layout (`apps/web`, `apps/api` or keep current folders), CI rewire
- Rebrand sweep (Section 2 checklist); TapCard favicon/logo placeholder until Figma File 1 lands
- Railway project: API + Postgres + Redis, staging environment, run existing migrations
- Figma File 1 (Brand Foundations)

### Phase 1 — MVP (Weeks 1–6) · ship completely before Phase 2
- Auth: email/password + Google OAuth (JWT via NestJS)
- Card creation in **English, Lao, Thai, Vietnamese, Bahasa Indonesia** (UI i18n via next-intl)
- Public SSR card page per the 14-block spec; username slugs `tapcard.asia/[username]`
- QR generation (PNG/SVG, TapCard center logo), one-tap **vCard .vcf** download
- Social/chat links: LINE, Zalo, Facebook, TikTok, WhatsApp, WeChat, Instagram, LinkedIn, X
- Action buttons: Call / Email / WhatsApp / Save Contact
- Cover image + headshot upload (Cloudinary, crop tool); theme color picker
- Free tier rules (from competitor failure analysis): **unlimited contacts, no branding-removal paywall, custom background on free, never solicit card recipients to sign up**
- Basic analytics: views, saves (7d/30d/all-time)
- PWA install + offline QR
- **Data migration:** import the ~23 lao.one profiles from the inventory/profiles sheets as seeded TapCard accounts; regenerate their QR codes and vCards

### Phase 2 — Differentiators (Weeks 7–16)
- **Regional payment links:** BCEL One (Laos) first, then PromptPay, GrabPay, GoPay, GCash, VietQR — rendered as scannable QR blocks on the card
- Multi-card: 4 free / 16 Pro; **4 card modes** (Business Card / Landing Page / Lead Capture / Link Redirect)
- **In-card video player** (the #1 differentiator — only Switchit has it)
- Card auto-displays in the viewer's device language
- Full analytics dashboard: link clicks by type, QR scans, referrers, location heatmap
- Apple/Google Wallet passes; WhatsApp/LINE follow-up automation; AI OCR paper-card scanner (Asian scripts)
- Billing: Stripe subscriptions + manual/local payment fallback for LAK

### Phase 3 — Enterprise & Scale (Weeks 17–28)
- Teams: admin dashboard, bulk provisioning (CSV), brand-consistency controls, SSO
- CRM sync (HubSpot, Salesforce, Zapier) — entities already exist in the NestJS backend
- **White-label multi-tenant module** — resell to SEA agencies at $5–10/user/mo (custom domain, logo, colors per tenant)
- NFC hardware partnership (Laos/Thailand manufacturers) as optional upsell
- Public API + docs (`api.tapcard.asia/v1`, Swagger already wired)

## 7. Pricing

| Plan | Price | Includes |
|---|---|---|
| Free | $0 | 1 card, unlimited contacts, QR, vCard, custom background, no forced branding removal fee |
| Pro | **$2.50/mo** (~52,000 LAK) | 4 cards, analytics, in-card video, payment links, multilingual display |
| Business | **$5/mo** (~104,000 LAK) | 16 cards, team features, CRM sync, 4 card modes |
| Enterprise / White-label | Custom | SSO, bulk provisioning, API, full tenant rebrand |

Display prices in local currency by locale (LAK, THB, VND, IDR, PHP, USD). Never copy Popl's mistakes: no 5-contact cap, no $14.99 branding-removal tier.

## 8. Feature Checklist (from FAQs sheet — traceability)

Mobile web app (iOS/Android PWA) · multi-language · contact info · personal + professional social media · profile picture · industry/expertise · QR sharing · link sharing · customizable URL · CSV contact export · contact tags/notes/groups · work-experience intro · five company cards · SEO integration · blog/article publishing (preserves the lao.one storytelling DNA) · service listing & booking (Calendly integration) · product catalog · file sharing · brand consistency controls · bulk card creation · calendar scheduling.

## 9. Risks & Open Decisions

1. **Frontend hosting:** SSR card pages need a server — Vercel recommended; GitHub Pages can only host the static marketing site. (Repo stays on GitHub either way.)
2. **my.lao.one migration:** redirects vs. QR re-issuance for existing users — depends on whether lao.one DNS remains under your control.
3. **BCEL One integration depth:** Phase 1 = static QR image upload per user (as today); true API integration is a Phase 2+ investigation.
4. **NestJS backend is aspirational in places** — modules exist but need endpoint-by-endpoint verification against the MVP scope before trusting them.
5. Stripe doesn't settle to Laos — billing entity/settlement route needs deciding before Phase 2 monetization.

## 10. Kickoff Prompt for the Build Session

> Read TAPCARD_PLAN.md in laurentlaboise/digitalcards. Execute Phase 0 + Phase 1: rebrand the repo to TapCard (tapcard.asia), consolidate the Next.js app as the sole frontend calling the NestJS API, deploy the backend + Postgres + Redis to Railway, deploy the frontend to Vercel with SSR card pages, implement the MVP feature list exactly as specified (14-block card layout, QR + vCard, 9 social platforms, 5 languages, free-tier rules), and import the 23 lao.one profiles from my Google Sheets as seed users. Design each screen in Figma first using the Brand Foundations tokens (orange #FF5722 / charcoal #303942, ITC Bauhaus wordmark + Inter / Noto Sans), then implement from the Figma designs. Use agents to parallelize.
