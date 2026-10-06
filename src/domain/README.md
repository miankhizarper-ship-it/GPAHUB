# src/domain

**Phase:** 1 (calculator engine live) — UI lands in a later phase.

The **domain layer** holds pure, framework-agnostic business logic for
GPAHub — the calculation engine itself. It is safe to import from
Client Components, Server Components, API routes, tests, and CLI
scripts alike.

## Module map

```
src/domain/
├── index.ts              Public barrel — import from here
├── errors/               DomainError + DomainErrorCode (stable discriminator)
├── precision/            Round-half-up policy; RESULT_DECIMALS = 2
├── grading/              GradingScale type + validate + resolveGrade (case-insensitive)
├── gpa/                  calculateGpa(scale, subjects) → GpaResult
├── cgpa/                 calculateCgpa(scale, semesters) → CgpaResult (weighted)
├── conversion/           cgpaToPercentage + percentageToCgpa (strategy model)
└── __tests__/            Vitest unit tests, grouped per module
```

## Rules of this layer

- No imports from `next`, `react`, `@prisma/client`, or any I/O module.
- No `Date.now()`, no `Math.random()`, no side effects.
- All functions are pure: same inputs → same outputs.
- Errors are always `DomainError` instances carrying a stable `code`.
- No hardcoded grading scale — every function receives the scale as input.
- No `eval`, no `new Function`, no arbitrary JS execution.

## Precision policy

- Intermediate math uses raw IEEE-754 doubles (no rounding mid-calc).
- Result fields (`gpa`, `cgpa`, `percentage`, `totalCredits`,
  `totalQualityPoints`) are rounded to **2 decimals** with "round half up".
- See `src/domain/precision/index.ts` for the full rationale.

## UI contract (for the future calculator UI)

```
User input
    ↓  (form state, client-side)
typed SubjectInput[] / SemesterInput[]
    ↓
calculateGpa / calculateCgpa  (in a try/catch)
    ↓
GpaResult / CgpaResult        ← success path
    ↓
display

DomainError (caught)          ← failure path
    ↓  (switch on error.code)
field-level error messages
```

The domain never imports React. The UI imports the domain.
