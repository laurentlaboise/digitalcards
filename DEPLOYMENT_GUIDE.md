# DigitalCards Deployment Guide

## Current Status

Your repository has been updated with a new professional favicon. However, **the actual Next.js frontend application is not yet deployed** to izzi.work. Currently, GitHub Pages is serving the root README.md file.

## What Was Done

✅ Created a modern, professional favicon featuring:
- A stylized business card with NFC wireless signals
- Blue-to-cyan gradient color scheme
- Multiple sizes for different devices (16x16, 32x32, 192x192, 512x512)
- Apple touch icon for iOS devices

✅ Updated files in the repository:
- `digital-card-platform/src/app/favicon.ico` - Multi-resolution favicon
- `digital-card-platform/src/app/apple-touch-icon.png` - iOS home screen icon

✅ Changes committed and pushed to branch: `claude/nfc-card-saas-platform-ZcBwh`

## Next Steps to Deploy the Frontend

### Option 1: Deploy to Vercel (Recommended for Next.js)

1. **Sign up for Vercel** at https://vercel.com
2. **Import your GitHub repository**
3. **Configure the project:**
   - Framework Preset: Next.js
   - Root Directory: `digital-card-platform`
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. **Set environment variables:**
   - `DATABASE_URL` - Your PostgreSQL connection string
   - `NEXTAUTH_URL` - https://izzi.work
   - `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
5. **Configure custom domain:**
   - In Vercel project settings, add `izzi.work` as custom domain
   - Update your DNS records as instructed by Vercel

### Option 2: Deploy to Netlify

1. **Sign up for Netlify** at https://netlify.com
2. **Import your GitHub repository**
3. **Configure build settings:**
   - Base directory: `digital-card-platform`
   - Build command: `npm run build`
   - Publish directory: `.next`
4. **Add environment variables** (same as Vercel)
5. **Configure custom domain** to `izzi.work`

### Option 3: Self-Host with Docker

1. **Set up a VPS** (DigitalOcean, AWS, etc.)
2. **Clone the repository:**
   ```bash
   git clone https://github.com/laurentlaboise/digitalcards.git
   cd digitalcards/digital-card-platform
   ```
3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```
4. **Build and run with Docker:**
   ```bash
   docker-compose up -d
   ```
5. **Configure nginx as reverse proxy** and point `izzi.work` to your server

## Database Setup

Your Next.js app requires a PostgreSQL database. You have several options:

### Cloud Database Providers:
- **Vercel Postgres** (if using Vercel)
- **Supabase** - Free tier available
- **Railway** - PostgreSQL hosting
- **Neon** - Serverless PostgreSQL

### Setup Steps:
1. Create a PostgreSQL database
2. Get the connection string (DATABASE_URL)
3. Run migrations:
   ```bash
   cd digital-card-platform
   npx prisma migrate deploy
   ```
4. Seed demo data (optional):
   ```bash
   npx prisma db seed
   ```

## GitHub Pages Issue

Currently, GitHub Pages is serving your root README.md. To fix this:

1. **Either:** Disable GitHub Pages in repository settings
2. **Or:** Create a proper `index.html` in the root that redirects to your deployed app

## Architecture Overview

Your project has two main components:

1. **Backend API** (NestJS) - `/src` directory
   - Needs separate deployment (Railway, Render, AWS, etc.)
   - Requires PostgreSQL, Redis, and other services

2. **Frontend** (Next.js) - `/digital-card-platform` directory
   - This is what should be deployed to izzi.work
   - Can be deployed to Vercel, Netlify, or self-hosted

## Recommended Deployment Stack

For a production-ready setup:

1. **Frontend:** Vercel (automatic deployments, edge network, Next.js optimized)
2. **Backend API:** Railway or Render (easy Docker deployment)
3. **Database:** Supabase or Neon (managed PostgreSQL)
4. **Redis:** Upstash (serverless Redis)
5. **Storage:** AWS S3 or Cloudflare R2

## Support

If you need help with deployment, consider:
- Vercel's documentation: https://vercel.com/docs
- Next.js deployment guide: https://nextjs.org/docs/deployment
- Your repository's README files for specific setup instructions

---

**Note:** The favicon is now ready and will automatically appear once you deploy the Next.js application to izzi.work.
