# src/validation

**Phase:** 2 (university schema live) — calculator + contact + blog schemas land in their phases.

The **validation layer** contains Zod schemas that guard every API route
handler and every repository write. It is the single source of truth for
"what is a valid GPAHub request".

## Module map

```
src/validation/
└── university.ts     University record + grading-scale + FAQ + SEO + status schemas
```

## University schema

`universitySchema` validates the full university record shape. Key rules:

- `slug` — lowercase, URL-safe, hyphenated, 2–60 chars, regex-validated
- `type` — enum `public | private`
- `status` — enum `draft | published | archived`
- `lastVerified` — `YYYY-MM-DD` format + calendar-valid (rejects Feb 31 via component comparison)
- `scale` — structurally compatible with the Phase 1 domain `GradingScale`
- `maxScale` — must equal `scale.maxPoints` (superRefine)
- `passingCGPA` — required for published records with maxScale ≥ 4.0
- `faqs[]` — each q 3–300 chars, a 3–2000 chars; max 20
- `seo` — optional title (10–70) + metaDescription (50–170)
- `.strict()` on every object — unknown fields are rejected

## Rules of this layer

- Every schema is a `z.object(...)` exported as a named const.
- Each schema ships a matching `z.infer` type so callers stay typed.
- API routes parse incoming bodies with `safeParse` and never trust raw `request.json()`.
- The repository write methods call `universitySchema.parse()` — invalid input throws `ZodError`.
- Grading-scale rules intentionally mirror the domain `validateGradingScale` (documented duplication: Zod needs to be self-describing for error messaging; the domain validator must stay framework-agnostic).

## Relationship to the domain layer

The Zod `gradingScaleSchema` and the domain `validateGradingScale` enforce
the same rules. The repository runs Zod first (shape + rules). A future
hardening pass can add the domain validator as a second gate.
