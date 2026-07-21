# DealVault

## Project Overview
DealVault is a membership shopping deals platform that aggregates and surfaces the best deals across major retailers. Users can browse deals, save favorites, set price alerts, and access premium features via subscription.

## Architecture
- **Framework**: Next.js 14 App Router (TypeScript)
- **Database & Auth**: Supabase (PostgreSQL + Auth + Row Level Security)
- **Payments**: Stripe (Subscriptions, Customer Portal, Webhooks)
- **3D Graphics**: Three.js via React Three Fiber (R3F) + Drei
- **Styling**: Tailwind CSS with custom dark theme design system
- **Deployment**: Vercel

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript (strict) |
| Styling | Tailwind CSS, CSS custom properties |
| 3D | @react-three/fiber, @react-three/drei, @react-spring/three, three |
| Auth | Supabase Auth (cookie-based via @supabase/ssr) |
| Database | Supabase PostgreSQL with RLS |
| Payments | Stripe subscriptions + webhooks |
| Utils | clsx, tailwind-merge |

## Key Commands
```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint
```

## Database Schema Overview
- **users** — Extends `auth.users` with `is_admin`, `trial_starts_at`, `trial_ends_at`
- **customers** — Maps Supabase user_id to Stripe customer_id
- **subscriptions** — Synced from Stripe, with `subscription_status` enum
- **products** — Stripe products (membership tiers)
- **prices** — Stripe prices tied to products, with billing interval
- **retailers** — Retailer info (Amazon, BestBuy, Walmart, etc.)
- **deals** — Core deal data with auto-calculated `discount_percent` (generated column), `source_hash` for dedup, full-text search via GIN index
- **saved_deals** — User's bookmarked deals
- **deal_alerts** — Keyword/discount alerts with frequency (instant/daily/weekly)
- **deal_clicks** — Click analytics for deal engagement tracking

RLS is enabled on all tables. Public read for deals/products/prices/retailers; user-scoped for saved_deals/deal_alerts/deal_clicks; admin-only for mutations on catalog tables.

## Auth Pattern
- Cookie-based session management via `@supabase/ssr`
- `lib/supabase/server.ts` — Server Components and Route Handlers
- `lib/supabase/client.ts` — Client Components
- `lib/supabase/middleware.ts` — Session refresh + route protection (redirects unauthenticated users from `/dashboard`, redirects authenticated users from `/login`/`/signup`)
- `lib/supabase/admin.ts` — Service-role client for webhooks only (bypasses RLS)
- `middleware.ts` — Calls `updateSession`, matcher excludes static files
- `handle_new_user()` trigger auto-creates a `public.users` row on signup with a 7-day trial period

## Stripe Webhook Events
Handled in `app/api/stripe/webhook/route.ts`:
- `checkout.session.completed` — Upserts customer + subscription
- `customer.subscription.created` — Syncs subscription
- `customer.subscription.updated` — Syncs subscription
- `customer.subscription.deleted` — Marks subscription canceled
- `product.created` / `product.updated` — Upserts product
- `product.deleted` — Deletes product
- `price.created` / `price.updated` — Upserts price
- `price.deleted` — Deletes price

Webhook signature is verified via `STRIPE_WEBHOOK_SECRET`. All DB writes use the service-role admin client.

## 3D Design Approach
- **Landing Hero**: React Three Fiber (`@react-three/fiber`) with Drei helpers for a 3D animated scene — floating deal cards, particle effects, or a vault motif. Uses `@react-spring/three` for smooth spring-based animations.
- **Dashboard**: CSS 3D transforms for card hover effects, perspective tilts, and depth layering. Lightweight — no WebGL context in the dashboard.
- **Performance**: R3F only loads on the landing page (dynamic import with `ssr: false` where needed). Dashboard uses pure CSS for 3D effects to keep it fast.

## Design System
Dark theme with CSS custom properties:
- `--color-bg: #0A0A0F` — App background
- `--color-surface: #111118` — Cards/panels
- `--color-accent: #0066FF` — Primary blue (CTAs, links)
- `--color-deal: #00FF88` — Deal green (prices, discounts)
- `--color-gold: #F5A623` — Featured/gold tier
- `--color-urgent: #FF4444` — Expiring deals
- `--color-text: #E8E8F0` — Primary text
- `--color-text-muted: #666680` — Secondary text
- `--color-border: #1A1A2E` — Borders

Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (prices/code)

## Code Standards
- **TypeScript strict mode** — No `any` types, use `unknown` + narrowing if needed
- **Server Components by default** — Add `'use client'` only when interactivity or browser APIs are required
- **Tailwind for styling** — Use custom theme colors (`text-deal`, `bg-surface`, etc.), avoid inline styles
- **Import alias** — Use `@/*` for all imports pointing to project root
- **Supabase types** — Database types in `@/types/database` (generated via `supabase gen types`)
- **Error handling** — Route handlers return `NextResponse.json()` with appropriate status codes
- **Naming** — `camelCase` for variables/functions, `PascalCase` for components/types, `snake_case` only for SQL/DB columns

## Environment Variables
See `.env.local` for template. Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — Server only, never exposed to client
- `STRIPE_SECRET_KEY` — Server only
- `STRIPE_WEBHOOK_SECRET` — Webhook route only
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## Security Audit Status (2026-06-30)

### ✅ FIXED (Previous Rounds)
- OAuth path traversal (`middleware.ts` + `lib/utils.ts:normalizePath()`)
- Checkout CSRF exact origin match
- Stripe webhook secret validation at startup
- Permissions-Policy header
- CSP `fonts.gstatic.com` for `font-src` + `connect-src`
- 7-day → 3-day trial copy everywhere
- Dev test account + dev-mode auth bypass (secure: NODE_ENV=development only)
- Scroll indicator overlap removed
- Deal cards moved out of hero (no overlap)
- Webhook idempotency (`webhook_events` table + unique constraint)
- Price ID validation against DB (active prices only)
- `client_reference_id` validation (checks user exists)
- Auth callback route (`/auth/callback`)
- Dashboard route (`/dashboard`)
- Logout route (`/api/auth/logout`)
- Rate limiting on checkout + portal endpoints
- Security headers (HSTS, CSP, X-Frame-Options, Referrer-Policy)

### 🔴 OPEN — From Audit Reference + New Findings

| ID | Severity | File | Issue | Fix |
|----|----------|------|-------|-----|
| M1 | High | `middleware.ts` | Matcher includes `/api/*` — blocks/impacts webhooks | ✅ FIXED: Added `api` to matcher exclusion |
| M2 | Medium | `lib/utils.ts:formatPrice` | Hardcodes 2 decimals — fails for JPY/KRW (zero-decimal) | ✅ FIXED: Uses `Intl.NumberFormat` with proper zero-decimal handling |
| M3 | Medium | `lib/utils.ts:generateSourceHash` | 32-bit djb2 — collision risk for deal dedup | ✅ FIXED: Uses SHA-256 via `crypto.subtle.digest` |
| M4 | Medium | `lib/rate-limit.ts` | In-memory only — breaks in multi-instance/Vercel | Open: Migrate to Redis (`@upstash/redis` or `ioredis`) |
| M5 | Low | `lib/utils.ts:formatDiscount` | Allows negative percentages | ✅ FIXED: Clamps to 0-100 |
| M6 | Low | `lib/supabase/admin.ts` | Service role client exposed to client bundle risk | Ensure `createAdminClient` only imported in server routes |
| L1 | Low | `app/api/stripe/checkout/route.ts:66,86` | `@typescript-eslint/no-explicit-any` | ✅ FIXED: Proper typing with error handling |
| L2 | Low | `app/deals/page.tsx:53` | `prefer-const` + `no-explicit-any` | ✅ FIXED: Uses `const`, implicit typing |
| L3 | Low | `components/deals/DealGrid.tsx:41` | React hooks purity: `Date.now()` in render | ✅ FIXED: Uses `useState(() => Date.now())` + `useEffect` interval |
| L4 | Low | `app/login/page.tsx:149` | Unescaped apostrophe in JSX | ✅ FIXED: `Don&apos;t` |

### 🟡 NEEDS VERIFICATION (Not Yet Confirmed Fixed)
- `deal_alerts` validators: `retailer_id` EXISTS + `keyword <> ''` constraints missing
