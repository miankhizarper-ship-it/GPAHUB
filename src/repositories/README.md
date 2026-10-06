# src/repositories

**Phase:** 2 (university repository live) — admin CRUD endpoints land in Phase 4+.

The **repository layer** is the only place in the codebase that talks to
MongoDB Atlas. Every other layer depends on repository methods, never
on the driver directly.

## Module map

```
src/repositories/
├── collections.ts                    Collection name constants
├── indexes.ts                        Idempotent index creation (uniq_slug, idx_status)
└── universities.repository.ts        University CRUD (read + write, server-only)
```

## University repository API

| Method | Signature | Notes |
|--------|-----------|-------|
| `getBySlug(slug)` | `University \| null` | Any status (admin) |
| `getPublishedBySlug(slug)` | `University \| null` | Published only |
| `getAll()` | `University[]` | Any status, sorted by name |
| `getPublished()` | `University[]` | Published only, sorted by name |
| `create(input)` | `University` | Upserts on slug (idempotent for seed) |
| `update(slug, patch)` | `University` | Patch semantics; re-validates merged record |
| `setStatus(slug, status)` | `University` | Convenience wrapper |
| `archive(slug)` | `University` | Soft-delete (status → "archived") |

## Rules of this layer

- All modules import `"server-only"` — Client Components cannot import them.
- Repositories return plain `University` objects, never driver-specific types.
- Write methods validate input with `universitySchema` (Zod) before touching the database.
- Read paths are ISR/edge-cache friendly (no per-request auth on public routes).
- Write paths are admin-only and live behind authentication (Phase 4+).
- Secrets (`MONGODB_URI`) are read from `process.env` in `src/lib/mongo.ts` — never elsewhere.

## Connection caching

See `src/lib/mongo.ts` — the client + connect promise are stashed on
`globalThis` so they survive Next.js dev hot-reloads and are reused
across warm Vercel serverless invocations.
