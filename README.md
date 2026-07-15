# RigNova

**Build Beyond Limits** — A premium gaming hardware e-commerce platform.

RigNova is a production-ready gaming hardware marketplace featuring custom PC building, used GPU trading, warranty services, and full e-commerce capabilities.

## Tech Stack

- **Framework:** Next.js 15+ (App Router) with React 19
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui components
- **Animation:** Framer Motion
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Better Auth (Google, OTP, Email)
- **Payments:** Razorpay
- **State:** Redux Toolkit + React Query
- **Media:** Cloudinary + UploadThing
- **Email:** Resend + Nodemailer

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)
- npm

### 1. Clone & Install

```bash
cd rignova
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Database Setup

**Option A: Docker (recommended)**

```bash
docker compose up postgres -d
```

**Option B: Local PostgreSQL**

Create a database named `rignova` and update `DATABASE_URL` in `.env`.

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (shop)/            # Shop routes
│   ├── admin/             # Admin panel
│   ├── vendor/            # Vendor panel
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui primitives
│   ├── layout/            # Header, Footer
│   ├── home/              # Home page sections
│   └── shared/            # Reusable components
├── features/              # Feature modules
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities, DB, auth, constants
├── store/                 # Redux store & slices
└── types/                 # TypeScript types
prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Seed script
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## Docker Deployment

```bash
# Start database only
docker compose up postgres -d

# Full production stack
docker compose --profile production up -d
```

## Deployment (Vercel)

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables from `.env.example`
4. Add PostgreSQL (Vercel Postgres or Neon)
5. Deploy

```bash
# Run migrations on deploy
npx prisma migrate deploy
```

## Feature Roadmap

### Phase 1 — Foundation ✅
- [x] Project setup & design system
- [x] Database schema (Prisma)
- [x] Home page (all sections)
- [x] Core layout (Header, Footer)
- [x] Redux store (cart, wishlist, compare)
- [x] SEO (sitemap, robots, metadata)
- [x] Docker setup

### Phase 2 — Shop & Products (Next)
- [ ] Shop page with filters & infinite scroll
- [ ] Product detail page
- [ ] Search functionality
- [ ] Wishlist & Compare pages

### Phase 3 — PC Builder
- [ ] Interactive configurator
- [ ] Compatibility engine
- [ ] Save & share builds

### Phase 4 — Auth & Checkout
- [ ] Better Auth integration
- [ ] Cart & Checkout flow
- [ ] Razorpay payments
- [ ] Order management

### Phase 5 — Admin & Vendor
- [ ] Admin dashboard
- [ ] Product management
- [ ] Order processing
- [ ] Analytics

### Phase 6 — Advanced Features
- [ ] Used GPU marketplace
- [ ] Trade-in program
- [ ] Warranty claims
- [ ] Blog & CMS

## Design System

| Token | Value |
|-------|-------|
| Background | `#0B0F19` |
| Surface | `#111827` |
| Cyan (Primary) | `#00E5FF` |
| Blue (Secondary) | `#5B8CFF` |
| Green (Accent) | `#00FF88` |
| Font Display | Syne |
| Font Body | DM Sans |

## License

Proprietary — All rights reserved.
