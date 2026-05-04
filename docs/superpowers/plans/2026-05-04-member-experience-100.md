# Member Experience 100 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete closed-beta member loop for points, unlocks, daily return, and account archive.

**Architecture:** Add a focused member unlock library, update result and account surfaces to consume it, and lock the behavior with structure tests. Keep database schema from migration `0009` and avoid broad refactors.

**Tech Stack:** Next.js App Router, React client components, Supabase RPC/PostgREST, TypeScript, project structure verification scripts.

---

### Task 1: Member Unlock Contract Test

**Files:**
- Modify: `tests/verify-structure.mjs`

- [ ] Add checks for `apps/web/lib/member-unlocks.ts`, `buildUnlockedReadingContent`, `MEMBER_UNLOCK_OPTIONS`, point constants, account wallet copy, and absence of placeholder wording in the unlock panel.
- [ ] Run `npm.cmd run test:structure` and confirm it fails before production code exists.

### Task 2: Member Unlock Library

**Files:**
- Create: `apps/web/lib/member-unlocks.ts`
- Modify: `apps/web/components/ToolResult.tsx`

- [ ] Move point constants and unlock option copy into the library.
- [ ] Add deterministic `buildUnlockedReadingContent(result, type)` for deep reading, daily transit, monthly transit, and yearly transit.
- [ ] Replace placeholder unlocked copy in `PointUnlockPanel` with generated content sections.
- [ ] Run `npm.cmd run test:structure` and `npm.cmd run type-check`.

### Task 3: Member Archive Surface

**Files:**
- Modify: `apps/web/app/account/charts/page.tsx`
- Modify: `apps/web/app/globals.css`
- Modify: `apps/web/types/db.ts`

- [ ] Load `member_wallets` and recent `content_unlocks`.
- [ ] Render member balance, daily point rule, unlock history, and chart history as card surfaces.
- [ ] Keep local test auth readable and useful.
- [ ] Run `npm.cmd run test:structure` and `npm.cmd run type-check`.

### Task 4: Full Verification

**Files:**
- No production file changes expected.

- [ ] Run `npm.cmd run test:structure`.
- [ ] Run `npm.cmd run test:sql`.
- [ ] Run `npm.cmd run type-check`.
- [ ] Run `npm.cmd test`.
- [ ] Run `$env:MELE_API_URL='http://127.0.0.1:8015'; npm.cmd run build`.
- [ ] Restart local services with `npm.cmd run ops:restart`.
