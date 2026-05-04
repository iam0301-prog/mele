# MELE Agent Handoff

This repository is a closed-beta divination platform. Work in small, verified steps and keep the user-facing Traditional Chinese experience polished.

## Do not scan

Avoid broad recursive reads over these paths unless the task explicitly requires them:

- `node_modules/`
- `apps/web/node_modules/`
- `apps/web/.next/`
- `.py312-packages/`
- `python_api/venv/`
- `.tmp/`
- `tmp/`
- `test-results/`

Use `rg` / `rg --files` with ignores instead of full directory crawls.

## 封測優先順序

1. **登入 / 註冊 / Email / Google / LINE**
   - Keep Email signup, resend confirmation, password reset, Google OAuth, LINE OAuth, and `/auth/callback` working.
   - External provider settings still require Supabase / Google / LINE dashboards, but the app should explain failures clearly.

2. **會員點數**
   - Daily claim is 200 points.
   - Each unlock costs 100 points.
   - `deep_reading`, `transit_day`, `transit_month`, and `transit_year` must use backend RPCs, not frontend-only state.
   - Main files: `apps/web/lib/member-unlocks.ts`, `apps/web/components/ToolResult.tsx`, `supabase/migrations/0009_member_points_unlocks.sql`.

3. **老師後台**
   - Members see beginner/simple explanations first.
   - Teachers should see booked members' questions, chart context, and useful detail briefs before a session.
   - Main file: `apps/web/app/teacher-portal/page.tsx`.

4. **海底之星品牌**
   - Header branding should use the Sea Star mark, not text-only `MELE`.
   - Main files: `apps/web/components/SeaStarLogo.tsx`, `apps/web/components/Header.tsx`, `apps/web/app/globals.css`.

5. **2D 精緻視覺與互動**
   - Each calculator should offer a readable 2D result, beginner explanation, member action path, point unlock panel, and next step.
   - Avoid unfinished 3D as the primary interface.

## Verification

Run focused checks while editing:

```powershell
npm.cmd run test:structure
npm.cmd run type-check
```

Before pushing important work:

```powershell
npm.cmd run release:check
```

If build needs the local API URL:

```powershell
$env:MELE_API_URL='http://127.0.0.1:8015'; npm.cmd run build
```

## Safety

- Do not commit `.env`, Supabase `.temp`, local caches, virtualenvs, or build output.
- Do not rewrite migrations that were already pushed to Supabase; add a new migration instead.
- Do not bypass RLS or direct-update sensitive booking/payment/member point tables from the frontend.
- Keep copy in Traditional Chinese for user-facing UI.
