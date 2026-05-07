# Beta Entry Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished closed-beta entry flow that lets the owner invite testers to a clear landing page before signup.

**Architecture:** Add localized `/[locale]/beta` and legacy `/beta` routes, keep public copy in locale dictionaries, route invite CTAs through `/account/login?mode=signup&invite=closed-beta`, and update admin tester invite links to point at the beta page. Verify with structure/deployment checks plus Next build.

**Tech Stack:** Next.js App Router, TypeScript, locale JSON dictionaries, existing MELE CSS components, Supabase-backed beta tester RPCs.

---

### Task 1: Add Beta Copy And Route

**Files:**
- Modify: `apps/web/lib/i18n/dictionaries.ts`
- Modify: `locales/*/common.json`
- Create: `apps/web/app/[locale]/beta/page.tsx`
- Create: `apps/web/app/beta/page.tsx`

- [ ] Add a `beta` dictionary section with hero, steps, quests, point rules, feedback, CTA, and SEO copy.
- [ ] Create a localized beta page that reads `dict.beta` and links to localized tools plus invite signup.
- [ ] Create `/beta` as a server redirect to `/zh-TW/beta`.

### Task 2: Wire Navigation And Invite Links

**Files:**
- Modify: `apps/web/components/Header.tsx`
- Modify: `apps/web/app/[locale]/page.tsx`
- Modify: `apps/web/app/admin/testers/page.tsx`

- [ ] Add `dict.nav.beta` to the header menu and mobile drawer.
- [ ] Add a beta CTA on localized home.
- [ ] Change admin tester invite URL generation from `/account/login` to `/beta` with invite params.

### Task 3: Verify Release Surface

**Files:**
- Modify: `apps/web/app/sitemap.ts`
- Modify: `tests/verify-structure.mjs`
- Modify: `tests/verify-deployment-readiness.mjs`

- [ ] Include `/beta` in localized sitemap.
- [ ] Assert beta route exists, dictionary has beta copy, header links to beta, and admin invite links route through beta.
- [ ] Run `npm.cmd run test:structure`, `npm.cmd run test:deployment`, `npm.cmd run type-check`, and `$env:MELE_API_URL='http://127.0.0.1:8015'; npm.cmd run build`.
