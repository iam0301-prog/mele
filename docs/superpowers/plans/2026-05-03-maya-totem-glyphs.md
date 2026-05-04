# Maya Totem Glyphs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable 20-glyph Maya totem system and surface it in Maya readings.

**Architecture:** Create a focused React component that owns totem metadata, lookup helpers, SVG glyph rendering, and the 20-totem gallery. Consume that component from the result cards and visual stage without changing the calculation API.

**Tech Stack:** Next.js App Router, React TSX components, CSS in `apps/web/app/globals.css`, existing Node structure tests.

---

### Task 1: Totem Component

**Files:**
- Create: `apps/web/components/MayaTotemGlyph.tsx`

- [x] Define 20 totems with `idx`, `slug`, `zh`, `en`, `color`, `keywords`, and `summary`.
- [x] Add `getMayaTotemBySeal()` to resolve backend seal objects, names, slugs, or indexes.
- [x] Add `MayaTotemGlyph` for reusable SVG rendering.
- [x] Add `MayaTotemGallery` for the full member-facing index.

### Task 2: Maya Result Integration

**Files:**
- Modify: `apps/web/components/ToolResult.tsx`

- [x] Show `MayaTotemGallery` for Maya results.
- [x] Attach each oracle card to its own seal.
- [x] Replace numeric card markers with mini totem glyphs on Maya oracle cards.

### Task 3: Visual Stage Integration

**Files:**
- Modify: `apps/web/components/ReadingArStage.tsx`

- [x] Resolve the current Maya seal from result data.
- [x] Place the current totem glyph at the center of the Maya 2D visual plate.

### Task 4: Styling

**Files:**
- Modify: `apps/web/app/globals.css`

- [x] Add the gold sigil visual language for glyphs.
- [x] Add responsive gallery cards.
- [x] Add visual-stage placement styles.

### Task 5: Verification

**Files:**
- Modify: `tests/verify-structure.mjs`

- [x] Add structure checks for the 20 totem registry and integrations.
- [x] Run `npm.cmd run type-check`.
- [x] Run `npm.cmd run test:structure`.
- [x] Run build with `MELE_API_URL=http://127.0.0.1:8015`.
