import { existsSync } from 'node:fs';
import { join } from 'node:path';

interface Check {
  label: string;
  ok: boolean;
  detail: string;
  level: 'P0' | 'P1';
  owner: '工程' | '營運' | '金流' | '設計';
}

function hasEnv(name: string) {
  return Boolean(process.env[name]);
}

function isProductionUrl(name: string) {
  const value = process.env[name] || '';
  return Boolean(value && !value.includes('localhost') && !value.includes('127.0.0.1'));
}

function arExists(file: string) {
  return existsSync(join(process.cwd(), 'public', 'ar', file));
}

function migrationExists(file: string) {
  return existsSync(join(process.cwd(), '..', '..', 'supabase', 'migrations', file));
}

export default function LaunchChecklistPage() {
  const migrations = [
    '0001_initial_schema.sql',
    '0002_rls_policies.sql',
    '0003_workflow_functions.sql',
    '0004_p0_fixes.sql',
    '0005_daily_ritual_center.sql',
    '0006_match_sessions.sql',
    '0007_auth_signup_mirror.sql',
    '0008_teacher_website_application.sql',
    '0009_member_points_unlocks.sql',
    '0010_kyc_auto_purge_cron.sql',
    '0011_admin_member_ops.sql',
  ];

  const checks: Check[] = [
    {
      label: 'Supabase 基礎環境',
      ok: hasEnv('NEXT_PUBLIC_SUPABASE_URL') && hasEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
      detail: 'Next.js 已取得 Supabase URL 與 anon key。正式發布前仍需到 Supabase Dashboard 確認 Auth、RLS、Storage、Edge Functions 都在同一個 project。',
      level: 'P0',
      owner: '工程',
    },
    {
      label: 'Auth 驗證信與 Redirect URLs',
      ok: false,
      detail: '需在 Supabase Dashboard 確認 Email provider、SMTP/寄信紀錄、Site URL、Redirect URLs，並用真實信箱完成註冊驗證信、重新寄送驗證信與忘記密碼信。可先跑 npm run ops:check-auth 做公開設定診斷。',
      level: 'P0',
      owner: '工程',
    },
    {
      label: 'Google / LINE OAuth 登入',
      ok: hasEnv('NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN') && hasEnv('NEXT_PUBLIC_ENABLE_LINE_LOGIN'),
      detail: '前端已支援 Supabase OAuth callback。仍需在 Supabase Auth Providers 啟用 Google，並建立 custom:line provider；設定好後再把 NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN、NEXT_PUBLIC_ENABLE_LINE_LOGIN 設為 true 並跑 npm run ops:check-auth。',
      level: 'P0',
      owner: '工程',
    },
    {
      label: 'SQL migrations 檔案完整',
      ok: migrations.every(migrationExists),
      detail: '本機 migrations 檔案齊全。正式 project 必須實際執行 0001-0011，並確認 profiles、teachers、bookings、daily_draws、line_user_links、match_sessions、teacher_applications.website、member_wallets、content_unlocks、daily_point_claims、admin_adjust_member_points、admin_update_member_profile 與 KYC 自動清除設定都存在。',
      level: 'P0',
      owner: '工程',
    },
    {
      label: '遠端 migration baseline',
      ok: false,
      detail: '遠端曾出現 profiles already exists，代表資料表已存在但 migration history 可能未標記。請先跑 npx supabase migration list，再用 migration repair 標記已存在版本，確認 dry-run 不再重建已存在資料表。',
      level: 'P0',
      owner: '工程',
    },
    {
      label: '初期免費測試模式',
      ok: process.env.NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE === 'true',
      detail: '封閉測試不收費時可以保持免費模式，預約流程會跳過 ECPay 並標示免費測試；公開收費前再關閉並跑 ECPay sandbox 全流程。',
      level: 'P1',
      owner: '營運',
    },
    {
      label: '正式網站 URL',
      ok: isProductionUrl('NEXT_PUBLIC_SITE_URL'),
      detail: '正式網域會影響 OAuth redirect、PWA metadata、LINE LIFF 與付款回跳。發布前不要使用 localhost。',
      level: 'P0',
      owner: '工程',
    },
    {
      label: 'Python API URL',
      ok: isProductionUrl('MELE_API_URL'),
      detail: 'Next.js /api/calc 需要代理到正式 HTTPS FastAPI，不應指向本機 8015。',
      level: 'P0',
      owner: '工程',
    },
    {
      label: 'ECPay checkout secrets',
      ok: ['ECPAY_MERCHANT_ID', 'ECPAY_HASH_KEY', 'ECPAY_HASH_IV', 'ECPAY_RETURN_URL', 'MELE_WEB_URL'].every(hasEnv),
      detail: 'checkout 與 webhook 都需要完整 secrets。發布前請先用綠界 sandbox 完成建立訂單、付款成功、webhook 入帳與回跳結果頁。',
      level: 'P0',
      owner: '金流',
    },
    {
      label: '封閉公測名單',
      ok: false,
      detail: '正式公開前建議先找 30-50 位封閉測試者，覆蓋 iPhone、Android、LINE 內建瀏覽器、信用卡付款、每日儀式與預約流程。',
      level: 'P1',
      owner: '營運',
    },
    {
      label: 'LINE LIFF 與 Daily Push',
      ok: hasEnv('NEXT_PUBLIC_LIFF_ID'),
      detail: 'LIFF ID 只代表前端登入入口已設定；Daily Push 仍需在 Supabase secrets 設定 LINE_CHANNEL_ACCESS_TOKEN，並用真機測推播。',
      level: 'P1',
      owner: '營運',
    },
    {
      label: 'Android / Web AR GLB',
      ok: ['tarot-card.glb', 'rune-stone.glb', 'astral-plate.glb', 'human-design-bodygraph.glb'].every(arExists),
      detail: 'GLB 是 Android Chrome 與 Web 3D 預覽的核心素材。正式發布前需確認載入速度、模型大小與低階手機效能。',
      level: 'P0',
      owner: '設計',
    },
    {
      label: 'iPhone AR fallback',
      ok: false,
      detail: 'iPhone 真正進入 AR Quick Look 通常需要 USDZ / Reality 檔案。現在 Web 3D 可預覽，但 iOS AR 仍需真機確認 fallback 或補 USDZ。',
      level: 'P1',
      owner: '設計',
    },
    {
      label: '手機全流程驗收',
      ok: false,
      detail: '請用 iPhone Safari、LINE 內建瀏覽器、Android Chrome 各測一輪：登入、每日抽卡、排盤、預約、付款、AR、錯誤恢復與字體可讀性。',
      level: 'P1',
      owner: '設計',
    },
  ];

  const p0Open = checks.filter((check) => check.level === 'P0' && !check.ok).length;
  const p1Open = checks.filter((check) => check.level === 'P1' && !check.ok).length;

  return (
    <div className="space-y-6">
      <section className={p0Open === 0 ? 'launch-alert launch-alert--ok' : 'launch-alert launch-alert--warning'}>
        <strong>{p0Open === 0 ? 'P0 已完成，可以進入封閉公測' : `還有 ${p0Open} 個 P0 必須完成`}</strong>
        <p>
          這份檢查表用來判斷是否能發布。P0 是公開前必要條件；P1 可以在封閉公測期間補齊，但不能拖到大量導流之後才處理。
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="launch-metric">
          <span>P0 未完成</span>
          <strong>{p0Open}</strong>
        </div>
        <div className="launch-metric">
          <span>P1 未完成</span>
          <strong>{p1Open}</strong>
        </div>
        <div className="launch-metric">
          <span>檢查項目</span>
          <strong>{checks.length}</strong>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {checks.map((check) => (
          <article key={check.label} className="launch-check-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs tracking-[0.25em] text-accent">{check.level} / {check.owner}</div>
                <h2>{check.label}</h2>
              </div>
              <span className={check.ok ? 'launch-status is-ok' : 'launch-status is-missing'}>
                {check.ok ? 'OK' : '待完成'}
              </span>
            </div>
            <p>{check.detail}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
