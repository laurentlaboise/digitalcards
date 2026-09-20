# TapCard

The TapCard web app — a Next.js 14 digital business card application with 3D flip cards and QR codes so anyone can save your contact info with a single scan.

## Features

- **3D Flip Business Cards** — Stunning card component with front/back flip animation, inspired by Jesse Couch's CodePen design
- **QR Code Contact Sharing** — Auto-generated QR codes encode vCard data; scan to save contact instantly
- **Live Card Editor** — Rich editor with real-time preview, image uploads, and social link management
- **Custom Themes** — 6 pre-built color themes plus custom color pickers
- **Analytics Dashboard** — Track card views and scans per card
- **Responsive Design** — Mobile-first, works on all screen sizes
- **Share via Link or QR** — Web Share API on mobile, clipboard copy on desktop
- **vCard Downloads** — Direct `.vcf` file downloads for contact saving

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS Modules (card animations)
- **Database:** PostgreSQL via Prisma ORM
- **Authentication:** NextAuth.js (credentials)
- **QR Codes:** `qrcode` npm package
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Local Development

1. **Clone and install:**
   ```bash
   cd digital-card-platform
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and secrets
   ```

3. **Set up the database:**
   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed demo data:**
   ```bash
   npx prisma db seed
   ```

5. **Start the dev server:**
   ```bash
   npm run dev
   ```

6. **Open** [http://localhost:3000](http://localhost:3000)

### Demo Login

After seeding, you can log in with:
- **Email:** `demo@digitalcard.io`
- **Password:** `demo1234`

### Docker

```bash
docker-compose up -d
```

This starts PostgreSQL and the app. Access at [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `NEXTAUTH_URL` | App URL for NextAuth | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | - |

## Project Structure

```
digital-card-platform/
├── prisma/
│   ├── schema.prisma          # Database models
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── card/[slug]/       # Public card view
│   │   ├── dashboard/         # Protected dashboard
│   │   ├── login/             # Auth pages
│   │   └── register/
│   ├── components/            # React components
│   │   ├── BusinessCard.tsx   # Main card component
│   │   ├── CardEditor.tsx     # Card creation/editing form
│   │   └── ...
│   ├── lib/                   # Utilities
│   │   ├── auth.ts            # NextAuth configuration
│   │   ├── prisma.ts          # Prisma client
│   │   ├── qrcode.ts          # QR code generation
│   │   └── vcard.ts           # vCard string generation
│   ├── styles/
│   │   └── business-card.module.css
│   └── types/
├── docker-compose.yml
├── Dockerfile
└── package.json
```

## Creating Your First Card

1. Register at `/register`
2. Go to Dashboard and click "New Card"
3. Fill in your details (name, title, contact info)
4. Toggle social links you want to display
5. Upload avatar and banner images
6. Pick a theme or customize colors
7. Click "Create Card"
8. Share the public URL `/card/your-slug`

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth handlers |
| GET | `/api/cards` | List user's cards |
| POST | `/api/cards` | Create card |
| GET | `/api/cards/[id]` | Get card for editing |
| PUT | `/api/cards/[id]` | Update card |
| DELETE | `/api/cards/[id]` | Delete card |
| POST | `/api/cards/[id]/upload-avatar` | Upload avatar |
| POST | `/api/cards/[id]/upload-banner` | Upload banner |
| GET | `/api/public/[slug]/qr` | Download QR code PNG |
| POST | `/api/public/[slug]/track` | Track card view |
| GET | `/card/[slug]/vcard` | Download vCard file |
