# TapCard

A multi-tenant SaaS platform for digital NFC business cards. Enables professionals and organizations to create, share, and manage smart contact profiles with physical NFC hardware, analytics, and lead capture.

**Product:** TapCard · **Site:** tapcard.asia · **Repo:** `laurentlaboise/digitalcards`

## Tech Stack

- **API**: NestJS / Node.js / TypeScript
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Queue**: BullMQ (email, processing, fulfillment, sync)
- **Storage**: AWS S3
- **Payments**: Stripe (Checkout, Billing, webhooks)
- **Email**: Resend
- **SMS**: Twilio
- **Shipping**: Shippo
- **Edge**: Cloudflare Workers

## Architecture

```
src/
├── config/              # Environment configuration
├── entities/            # 19 TypeORM entities (PostgreSQL schema)
├── common/
│   ├── guards/          # JWT, RBAC, admin, subscription tier
│   ├── decorators/      # @CurrentUser, @Roles, @Public, @RequireTier
│   ├── filters/         # Global HTTP exception filter
│   ├── interceptors/    # Logging, response transform
│   ├── pipes/           # UUID validation
│   ├── constants/       # Tier quotas
│   ├── interfaces/      # Pagination
│   └── utils/           # AES-256 encryption
├── modules/
│   ├── auth/            # JWT auth, passkey, register/login/refresh
│   ├── users/           # User profile, subscription, usage
│   ├── organizations/   # Multi-tenant orgs, RBAC, branding
│   ├── profiles/        # Digital business cards, social links, media
│   ├── sharing/         # QR codes, short links, email/SMS sharing
│   ├── nfc/             # NFC device provisioning and scanning
│   ├── analytics/       # Event tracking, timeseries, WebSocket
│   ├── leads/           # Lead forms, submissions, enrichment
│   ├── ecommerce/       # Stripe checkout, orders, subscriptions
│   ├── teams/           # Team directory, templates, bulk ops
│   ├── integrations/    # Zapier, Salesforce, HubSpot, directory sync
│   ├── admin/           # Platform admin, feature flags
│   ├── shared/          # BullMQ processors (email, fulfillment, sync)
│   └── health/          # Liveness, readiness, metrics
├── app.module.ts        # Root module wiring
└── main.ts              # Bootstrap with Swagger, CORS, validation
```

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start infrastructure (PostgreSQL + Redis)
docker-compose up -d postgres redis

# 3. Copy environment config
cp .env.example .env

# 4. Start development server
npm run start:dev
```

API docs available at `http://localhost:3000/docs` (Swagger UI).

## Docker

```bash
# Full stack (app + workers + postgres + redis)
docker-compose up

# Build only
docker build -t digitalcards-api .
```

## API Modules

| Module | Prefix | Endpoints |
|--------|--------|-----------|
| Auth | `/auth` | register, login, refresh, logout, verify-email, reset-password |
| Users | `/users/me` | profile, subscription, usage |
| Organizations | `/organizations` | CRUD, members, branding, audit logs |
| Profiles | `/profiles` | CRUD, social links, media, themes, duplicate |
| Sharing | `/profiles/:id/qr`, `/s/:code`, `/p/:id` | QR codes, short links, email/SMS |
| NFC | `/nfc` | provision, scan, link/unlink profile |
| Analytics | `/profiles/:id/analytics` | summary, timeseries, geography, devices, export |
| Leads | `/profiles/:id/leads` | forms, submissions, followup, enrichment, export |
| E-commerce | `/products`, `/orders`, `/subscriptions` | Stripe checkout, webhooks |
| Teams | `/teams/:orgId` | directory, templates, bulk create, export |
| Integrations | `/integrations` | Zapier, Salesforce, HubSpot, directory sync |
| Admin | `/admin` | users, platform analytics, orders, feature flags |
| Health | `/health` | liveness, readiness, metrics |

## Subscription Tiers

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Profiles | 3 | Unlimited | Unlimited |
| Analytics Retention | 30 days | 1 year | 1 year |
| Storage | 1 GB | 10 GB | 100 GB |
| Lead Forms | - | Yes | Yes |
| CRM Integrations | - | Yes | Yes |
| Custom Domains | - | 1 | Unlimited |
| Directory Sync | - | - | Yes |
| Audit Logs | - | - | Yes |
| Bulk Operations | - | - | Yes |

## Background Jobs (BullMQ)

- **Email**: welcome, lead followup, team invite, order confirmation, shipping
- **Processing**: QR generation, analytics aggregation, media optimization, bulk import
- **Fulfillment**: NFC provisioning, shipment creation, license provisioning
- **Sync**: directory sync, CRM sync, webhook delivery

## Environment Variables

See `.env.example` for all required configuration.

## License

MIT
