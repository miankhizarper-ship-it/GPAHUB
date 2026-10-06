# GPAHub

**Calculate • Learn • Achieve**

Your University GPA & CGPA Calculator — a free, fast, mobile-first GPA/CGPA
calculator platform for Pakistani university students.

---

## Project purpose

GPAHub will eventually host:

- University-specific GPA calculators
- University-specific CGPA calculators
- A generic GPA calculator
- A generic CGPA calculator
- CGPA ↔ percentage conversion tools
- University information pages
- University-specific grading scales
- A blog
- A contact form
- SEO landing pages
- A protected admin panel for university/content management

Public users do **not** need to authenticate. Administrators will, in a
later phase. All calculations run client-side whenever possible; user
calculation data is never sent to the server unnecessarily.

The site is built for **Vercel** serverless deployment and uses
**MongoDB Atlas** as its data store (wired up in a later phase).

---

## Tech stack

| Layer | Choice |
|------|--------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui (New York) |
| Theming | `next-themes` (class strategy, system + manual) |
| Font | Poppins (400 / 500 / 600 / 700) |
| Database | MongoDB Atlas (future phase) |
| ORM | TBD when MongoDB phase lands (Prisma scaffold present but unused for GPAHub) |
| Validation | Zod (future phase) |
| Testing | Vitest |
| Package manager | Bun |
| Deployment | Vercel (serverless) |

---

## High-level architecture

```
src/
  app/                      Next.js App Router (routes, layouts, metadata)
    layout.tsx              Root layout — Poppins font, ThemeProvider, metadata
    page.tsx                Homepage (Server Component, sticky-footer pattern)
    globals.css             GPAHub design tokens (semantic, light + dark)
  components/
    layout/                 SiteHeader, SiteFooter
    theme/                  ThemeProvider, ThemeToggle (client island)
    ui/                     shadcn/ui component kit
  config/
    site.ts                 Brand name, tagline, description, keywords, URL
  domain/                   Pure calculation logic (future phase) — README only
  repositories/             MongoDB data access (future phase) — README only
  validation/               Zod schemas (future phase) — README only
  lib/                      cn() helper + scaffold db client (unused for GPAHub)
  types/                    Shared TypeScript types
tests/                      Vitest test files
scripts/                    Seed / migration scripts (future phase) — README only
docs/                       Project documentation (phase worklogs, ADRs)
```

**Layering contract (for future phases):**

- `app/` and `components/` may import from `config/`, `types/`, `lib/`, `validation/`.
- `app/api/` handlers may import from `repositories/` and `validation/`.
- `repositories/` may import from `domain/` and `types/` — never from `app/` or `components/`.
- `domain/` imports nothing framework-specific. Pure functions only.
- `validation/` imports from `types/` only.

---

## Development commands

```bash
# Install dependencies
bun install

# Start dev server (http://localhost:3000)
bun run dev

# Type-check
bun run typecheck

# Lint
bun run lint

# Run tests (one-shot)
bun run test

# Run tests (watch mode)
bun run test:watch

# Production build
bun run build

# Start production server (after build)
bun run start
```

---

## Environment variables

GPAHub expects the following environment variables. Copy `.env.example`
to `.env.local` and fill in real values for local development.

| Variable | Purpose | Required in Phase 0? |
|----------|---------|----------------------|
| `MONGODB_URI` | MongoDB Atlas connection string (server-side only) | No — future phase |
| `MONGODB_DB_NAME` | Logical database name inside the Atlas cluster | No — future phase |
| `ADMIN_SESSION_SECRET` | Secret used to sign admin session cookies | No — future phase |
| `NEXT_PUBLIC_SITE_URL` | Public site URL for metadata + sitemaps | Optional |

**Never commit real secrets.** `.env*` files are git-ignored (except
`.env.example`).

---

## Current phase status

**Phase 0 — Project Foundation & Architecture** ✅ Complete
**Phase 1 — Calculator Domain Engine** ✅ Complete
**Phase 2 — MongoDB University Data Layer** ✅ Complete
**Phase 3 — Public University Routes & Calculator UI** ✅ Complete
**Phase 4 — Admin Authentication & University Management** ✅ Complete
**Phase 5 — SEO, Content Foundation, Blog & Contact** ✅ Complete
**Phase 6 — Admin Blog CMS & Message Inbox** ✅ Complete
**Phase 7 — Production Hardening & Deployment Readiness** ✅ Complete
**Phase 8 — Content, Data & UX Polish** ✅ Complete
**Phase 9 — Production Data, Deployment Readiness & Final QA** ✅ Complete
**Phase 10 — Production Deployment, Live Data & Final QA** ✅ Complete

### Phase 0 — what's live
- GPAHub brand system (Poppins font, sage palette, semantic design tokens)
- Light/dark theme with system preference + manual toggle (FOUC-free)
- Server Component homepage with sticky-footer layout
- Architecture skeleton (`domain/`, `repositories/`, `validation/` dirs
  with contracts documented)
- Environment variable conventions (`.env.example`)
- Vitest testing foundation with a passing smoke test
- TypeScript strict typecheck, ESLint, production build all green

### Phase 1 — what's live
- Pure, framework-agnostic calculation engine in `src/domain/`:
  - `calculateGpa(scale, subjects)` — weighted GPA with empty-row support
  - `calculateCgpa(scale, semesters)` — weighted CGPA (NOT avg of GPAs)
  - `cgpaToPercentage(cgpa, config)` + `percentageToCgpa(pct, config)` —
    strategy-based conversion (Phase 1 ships `"linear"` only)
  - `GradingScale` validation + `resolveGrade` (case-insensitive)
  - `DomainError` with stable `code` discriminator for UI branching
  - Precision policy: round to 2 decimals at boundaries only

### Phase 2 — what's live
- MongoDB Atlas data layer using the official `mongodb` driver (no Mongoose):
  - Cached connection (`src/lib/mongo.ts`) for Vercel serverless + dev hot-reload
  - `University` model with slug, type, grading scale, FAQs, SEO, verification, status
  - Zod validation (`src/validation/university.ts`) — strict schemas, calendar-validated dates
  - University repository (`src/repositories/universities.repository.ts`) — read + write, server-only
  - Idempotent indexes (`uniq_slug`, `idx_status`)
  - Idempotent seed runner (`scripts/seed-universities.ts`) with 10 verified Pakistani universities
  - Server/client boundary enforced via `"server-only"` — no MongoDB code in client bundles
- TypeScript build hardening: `ignoreBuildErrors` removed; build now fails on type errors

### Phase 3 — what's live
- 7 public routes, all mobile-first, all theme-aware:
  - `/universities` — listing with ISR, empty state, university cards
  - `/universities/[slug]` — detail page (SSG + ISR, 404, grading table, FAQs, source/verification)
  - `/gpa-calculator` — generic GPA (Client Component, university selector)
  - `/gpa-cal/[slug]` — university-specific GPA (SSG + ISR)
  - `/cgpa-calculator` — generic CGPA (weighted, not averaged)
  - `/cgpa-cal/[slug]` — university-specific CGPA (SSG + ISR)
  - `/cgpa-to-percentage` — two-way converter with configurable max GPA
- Server/Client boundary: Server Components fetch data, Client Components run calculations
- All calculations client-side via the Phase 1 domain engine — no API calls, no server roundtrips
- Domain errors translated to user-friendly messages via `describeAnyError()`
- 214 passing tests (33 new component + integration tests, 181 preserved)

### Phase 4 — what's live
- Secure admin panel at `/admin` (NextAuth v4 + bcrypt + JWT sessions)
- Admin login at `/admin/login` (credentials provider, no public signup)
- Protected admin layout with server-side session check (`requireAdmin()`)
- Dashboard with overview cards (total / published / draft / archived)
- Universities table with search, status badges, and actions:
  - Edit, Preview, Publish/Unpublish, Archive, Delete (with confirm dialogs)
- Create + Edit university forms with dynamic grading scale rows + FAQ editor
- Admin preview page (shows draft/unpublished data, admin-only)
- 6 server actions with auth gate + Zod validation + ISR revalidation
- Admin validation schema (loose for drafts, strict for published)
- 251 passing tests (39 new admin/auth tests, 212 preserved)

### Phase 5 — what's live
- Blog: `/blog` listing + `/blog/[slug]` article pages with safe Markdown rendering
- Contact: `/contact` form with server-side Zod validation, honeypot, MongoDB-backed rate limiting
- Legal: `/about`, `/disclaimer`, `/privacy-policy`, `/terms` with original copy (no false claims)
- SEO: `sitemap.xml` (dynamic from DB), `robots.txt`, canonical URLs, Open Graph, JSON-LD (WebSite, WebApplication, BreadcrumbList, FAQPage, Article)
- Internal linking: homepage → blog, footer with all routes, cross-links between calculators/universities/blog
- Loading + error states for content-heavy routes
- 293 passing tests (42 new Phase 5 tests, 251 preserved)

### Phase 6 — what's live
- Admin blog CMS: `/admin/blog` list + create + edit + preview (Markdown editor with live preview)
- 6 blog server actions (create/update/publish/unpublish/archive/delete) with auth + Zod validation + ISR revalidation
- Admin message inbox: `/admin/messages` list + `/admin/messages/[id]` detail with mark read/unread + delete
- 3 message server actions with auth + safe error handling
- Enhanced dashboard: university + blog + message stats, recent posts + messages
- Admin nav with Blog + Messages (unread badge)
- Blog seed data: 6 original articles + idempotent seed script
- Dynamic OG images: `/blog/opengraph-image` + `/blog/[slug]/opengraph-image` (next/og, GPAHub branding)
- 328 passing tests (35 new Phase 6 tests, 293 preserved)

### What's not yet live (by design)
- No production deployment configuration (Phase 7)
- No analytics or error monitoring
- No blog cover image upload (URL-only)
- No message search

### Phase 7 — what's live
- Server-side login rate limiting (MongoDB TTL, 5 attempts / 15 min, IP hashed)
- Admin audit log: all 15 mutations recorded with admin email + timestamp
- `/admin/audit` page with searchable event table
- Environment validation with Zod (fails fast in production)
- Global error boundary + custom 404 page
- Privacy-friendly analytics foundation (server-side, no cookies/PII)
- Message CSV export with formula injection protection
- Vercel deployment configuration (`vercel.json`)
- Production deployment checklist (`docs/PRODUCTION-CHECKLIST.md`)
- 360 passing tests (32 new Phase 7 tests, 328 preserved)

### What's not yet live (by design)
- No production deployment (requires Atlas + Vercel setup)
- No error monitoring service (Sentry, etc.)
- No university OG images
- No blog cover image upload

### Phase 8 — what's live
- 15 universities seeded (5 new: GIKI, UET Lahore, KU, BUITMS, Szabist)
- 10 blog posts seeded (4 new: improving GPA, academic probation, calculation mistakes, required GPA)
- University directory with client-side search + city filter
- Improved university cards (max GPA, grade count, passing CGPA stats)
- Blog reading time on cards + article pages
- Blog article breadcrumbs, related articles, prev/next navigation
- Loading skeletons for university detail, blog detail, and admin routes
- 369 passing tests (9 new Phase 8 tests, 360 preserved)

### Phase 9 — what's live
- 20 universities seeded (5 new: NED, GCU Lahore, Sukkur IBA, UoS, CUI Sahiwal)
- University OG images: `/universities/[slug]`, `/gpa-cal/[slug]`, `/cgpa-cal/[slug]`
- Blog slug redirect system (post_redirects collection with loop detection)
- Message search in admin inbox (server-side, URL-based, shareable)
- Image optimization config for remote cover images
- Seed scripts: `bun run seed:universities`, `bun run seed:posts`, `bun run hash-password`
- 381 passing tests (12 new Phase 9 tests, 369 preserved)

### Phase 10 — what's live
- Automatic blog slug redirects: admin slug changes create old→new redirect, old URL continues working
- `updateWithSlugChange` repository method for safe slug migration (delete-old + insert-new)
- Slug field unlocked in blog editor (with redirect-creation hint)
- 382 passing tests (1 new slug-change test, 381 preserved)

### What's not yet live (by design)
- No production deployment (requires Atlas + Vercel setup)
- No error monitoring service (Sentry)
- No blog cover image upload (URL-only)
- No Lighthouse audit (requires production URL)

See `docs/PHASE_0_WORKLOG.md` through `docs/PHASE_10_WORKLOG.md` for the
full records. See `docs/PRODUCTION-CHECKLIST.md` for deployment instructions.

---

## License

All rights reserved. © GPAHub.
