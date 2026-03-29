# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

- `pnpm --filter @workspace/db run seed` — inserts the 51 default products + settings (skips if already seeded)
- `pnpm --filter @workspace/db run setup` — push schema + seed (one command for first-time setup)
- `lib/db/src/seed-data.json` — source of truth for all 51 products (exported from production DB)

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

---

## Lecker – Arabic/Hebrew Candy Store App (ليكير)

### Features Implemented

**Customer Storefront (`artifacts/lecker/src/pages/`)**
- Full bilingual AR/HE support — both RTL; toggle stored in `lecker-lang` localStorage key
- `LanguageProvider` context + `useLang()` hook; `LanguageToggle` in both layouts
- Product browsing with `getProductName(product, lang)` helper (uses `nameHe || nameAr`)
- Cart with toast notification on add; cart key `'lecker-cart-v2'`; cartKey = `"productId"` or `"productId|variantName"`
- Checkout (`Checkout.tsx`): delivery vs pickup toggle, +15 ILS delivery fee, address field, payment method (cash/online)
- Login with OTP via `Login.tsx`; admin login at `/manage/login` (secret path)
- My orders page (`Orders.tsx`)
- Footer: "تصميم وتطوير bene_mansour"

**Admin Dashboard (`artifacts/lecker/src/pages/admin/`)**
- Dashboard with stats (today orders/revenue, pending orders, total products) — bilingual
- Orders (`Orders.tsx`): card-based view with full detail expand, sound alert on new orders via 30s polling, status filter tabs
- Products (`Products.tsx`): table with power-toggle button, edit/delete dialogs
- Revenue pages (daily + monthly charts)
- Settings page (store open/closed, delivery fee, min order, contact info)
- Sessions/Devices (`Sessions.tsx`): real-time active admin session monitoring
  - Heartbeat every 8s, polling every 6s; online = <15s, idle = <5min, offline = older
  - Shows device (UA parser), OS, browser, location (ip-api.com), IP, login time
  - Force-logout button deletes Express session + marks admin_sessions.isActive=false

**Backend (`artifacts/api-server/src/routes/`)**
- `auth.ts`: OTP login with Twilio SMS; records admin session on login (async geo fetch); marks inactive on logout
- `orders.ts`: create order → validates, calculates total + delivery fee, SMS notification
- `admin.ts`: CRUD for products/orders/settings; GET/POST heartbeat/DELETE session endpoints
- `lib/sms.ts`: shared SMS utility (Twilio if configured, else console.log)

**DB Schema (`lib/db/src/schema/`)**
- `orders`: `deliveryType`, `deliveryAddress`, `items` (JSON), `paymentMethod`, `notes`
- `products`: `isActive`, `nameHe` (nullable Hebrew name column)
- `admin_sessions`: tracks admin login sessions (id, sessionId, phone, userAgent, ip, country, city, lastSeen, isActive, loginAt)
- `settings`: key-value store for store config

**i18n Files (`artifacts/lecker/src/i18n/`)**
- `ar.ts` — Arabic translations (source of truth for all keys)
- `he.ts` — Hebrew translations (must mirror all keys from ar.ts)
- `index.tsx` — `LanguageProvider`, `useLang()`, `LanguageToggle`

**Seed Data**
- `lib/db/src/seed-data.json` — 51 products with `name_ar` + `name_he` fields
- `lib/db/src/seed.ts` — maps to DB schema; skips if already seeded
- `pnpm --filter @workspace/db run setup` — push schema + seed (first-time setup)

**Environment Variables Needed**
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` — Twilio SMS (optional; without these, OTP shown in API response)
- `ADMIN_PHONE_NUMBER` — phone to receive new-order SMS notifications
- `SESSION_SECRET` — session signing key (already set)
- `DATABASE_URL` — automatically provided by Replit

**Categories (DB values — always sent to backend in Arabic)**
`['الكل','بانكيك','كريب','وافل','بوظة','أكل','مشروبات ساخنة','مشروبات باردة','بيرا','حلويات خاصة']`

**OpenAPI + Codegen**
- After changing `lib/api-spec/openapi.yaml`, run: `pnpm --filter @workspace/api-spec run codegen`
- After changing DB schema, run: `pnpm --filter @workspace/db run push` (or `push-force`)
