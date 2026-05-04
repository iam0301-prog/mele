// 用 PGlite 起一個記憶體 PostgreSQL，套用全部 migration，
// 然後跑「完整預約 → 取消 → 退款 → 評價」流程驗證 P0 SQL 是否正確
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'fs';

const db = new PGlite();
let passed = 0, failed = 0;
const log = (n, ok, d) => {
  if (ok) { passed++; console.log(`  \x1b[32m✓\x1b[0m ${n}${d ? ' — ' + d : ''}`); }
  else { failed++; console.log(`  \x1b[31m✗\x1b[0m ${n}${d ? ' — ' + d : ''}`); }
};

console.log('\n=== P0 SQL 邏輯驗證（PGlite in-memory） ===\n');

// PGlite 沒有 auth schema，要先 stub
await db.exec(`
  create schema if not exists auth;
  create table if not exists auth.users (
    id uuid primary key,
    email text unique,
    instance_id uuid,
    aud text, role text,
    encrypted_password text,
    email_confirmed_at timestamptz,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );
  create or replace function auth.uid() returns uuid as $$
    select current_setting('request.jwt.claim.sub', true)::uuid
  $$ language sql stable;
  create role authenticated;
  create role anon;
`);

// 套用 migration（按版號順序）
const migrations = [
  'supabase/migrations/0001_initial_schema.sql',
  'supabase/migrations/0002_rls_policies.sql',
  'supabase/migrations/0003_workflow_functions.sql',
  'supabase/migrations/0004_p0_fixes.sql',
  'supabase/migrations/0005_daily_ritual_center.sql',
  'supabase/migrations/0007_auth_signup_mirror.sql',
  'supabase/migrations/0009_member_points_unlocks.sql',
  'supabase/migrations/0010_kyc_auto_purge_cron.sql',
];

function pgliteCompat(sql) {
  return sql
    // PGlite already exposes gen_random_uuid(), but does not ship uuid-ossp.
    .replace(/create extension if not exists "uuid-ossp";/gi, '-- skipped in PGlite: uuid-ossp')
    .replace(/create extension if not exists "pgcrypto";/gi, '-- skipped in PGlite: pgcrypto')
    // pg_cron is Supabase Cloud only; the 0010 migration's exception block tolerates absence,
    // but the bare CREATE EXTENSION on PGlite errors before the DO block — so strip it here.
    .replace(/create extension if not exists pg_cron;/gi, '-- skipped in PGlite: pg_cron')
    .replace(/uuid_generate_v4\(\)/gi, 'gen_random_uuid()');
}

for (const m of migrations) {
  try {
    const sql = pgliteCompat(readFileSync(m, 'utf-8'));
    await db.exec(sql);
    log(`migration ${m.split('/').pop()}`, true);
  } catch (e) {
    log(`migration ${m.split('/').pop()}`, false, e.message.split('\n')[0]);
  }
}

// 建測試 fixtures
const cust = '11111111-1111-1111-1111-111111111111';
const teacherUser = '22222222-2222-2222-2222-222222222222';
const adminUser = '33333333-3333-3333-3333-333333333333';

await db.exec(`
  insert into auth.users (id, email, aud, role) values
    ('${cust}', 'cust@test', 'authenticated', 'authenticated'),
    ('${teacherUser}', 'teacher@test', 'authenticated', 'authenticated'),
    ('${adminUser}', 'admin@test', 'authenticated', 'authenticated');

  insert into public.admins (user_id, role) values ('${adminUser}', 'super');

  insert into public.profiles (id, display_name) values
    ('${cust}', '客戶 A'), ('${teacherUser}', '老師 B')
  on conflict (id) do update set display_name = excluded.display_name;

  insert into public.teachers (id, user_id, status, display_name, specialties, commission_rate, approved_at)
  values ('44444444-4444-4444-4444-444444444444', '${teacherUser}', 'active', '林老師',
    array['八字'], 0.20, now());

  insert into public.teacher_services (id, teacher_id, name, duration_minutes, price_ntd)
  values ('55555555-5555-5555-5555-555555555555',
          '44444444-4444-4444-4444-444444444444', '八字快問', 60, 2000);
`);

// === 測試 1: 預約建立 + 自動算分潤 ===
console.log('\n[Test 1] 預約建立 → 自動分潤計算');
{
  const future = new Date(Date.now() + 48 * 3600 * 1000).toISOString(); // 48h 後
  await db.exec(`
    insert into public.bookings (id, customer_id, teacher_id, service_id, scheduled_at, duration_minutes, amount_ntd, platform_fee_ntd, teacher_amount_ntd)
    values ('66666666-6666-6666-6666-666666666666', '${cust}',
            '44444444-4444-4444-4444-444444444444',
            '55555555-5555-5555-5555-555555555555',
            '${future}', 60, 2000, 0, 0);
  `);
  const r = await db.query(`select platform_fee_ntd, teacher_amount_ntd from public.bookings where id='66666666-6666-6666-6666-666666666666'`);
  log('platform_fee_ntd = 400 (20%)', r.rows[0].platform_fee_ntd === 400, `got ${r.rows[0].platform_fee_ntd}`);
  log('teacher_amount_ntd = 1600', r.rows[0].teacher_amount_ntd === 1600, `got ${r.rows[0].teacher_amount_ntd}`);
}

// === 測試 2: 雙重預約防護 ===
console.log('\n[Test 2] 雙重預約 unique constraint');
try {
  const sameTime = (await db.query(`select scheduled_at from public.bookings where id='66666666-6666-6666-6666-666666666666'`)).rows[0].scheduled_at;
  await db.exec(`
    insert into public.bookings (customer_id, teacher_id, service_id, scheduled_at, duration_minutes, amount_ntd, platform_fee_ntd, teacher_amount_ntd)
    values ('${cust}', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555',
            '${sameTime.toISOString ? sameTime.toISOString() : sameTime}', 60, 2000, 0, 0);
  `);
  log('同時段第二筆 booking 應被拒', false, '居然成功插入');
} catch (e) {
  log('同時段第二筆 booking 應被拒', e.message.toLowerCase().includes('uniq') || e.message.toLowerCase().includes('duplicate'), e.message.substring(0, 80));
}

// === 測試 3: confirm_payment ===
console.log('\n[Test 3] confirm_payment（金流回呼）');
await db.exec(`select set_config('request.jwt.claim.sub', '${adminUser}', false);`);
{
  await db.exec(`select public.confirm_payment('66666666-6666-6666-6666-666666666666', 'ecpay', 'TEST123', 2000);`);
  const r = await db.query(`select status, payment_provider, payment_id, paid_at from public.bookings where id='66666666-6666-6666-6666-666666666666'`);
  log('status → paid', r.rows[0].status === 'paid');
  log('payment_provider = ecpay', r.rows[0].payment_provider === 'ecpay');
  log('payment_id 已寫入', r.rows[0].payment_id === 'TEST123');
  log('paid_at 已寫入', !!r.rows[0].paid_at);

  // 通知有發
  const n = await db.query(`select count(*)::int as c from public.notifications where type='booking_paid' and user_id='${cust}'`);
  log('客戶收到付款成功通知', n.rows[0].c === 1);
  const nt = await db.query(`select count(*)::int as c from public.notifications where type='booking_new' and user_id='${teacherUser}'`);
  log('老師收到新預約通知', nt.rows[0].c === 1);
}

// === 測試 4: confirm_payment 金額不符應 raise ===
console.log('\n[Test 4] confirm_payment 金額不符 → 拒絕');
{
  // 開新 booking
  const f2 = new Date(Date.now() + 72 * 3600 * 1000).toISOString();
  await db.exec(`
    insert into public.bookings (id, customer_id, teacher_id, service_id, scheduled_at, duration_minutes, amount_ntd, platform_fee_ntd, teacher_amount_ntd)
    values ('77777777-7777-7777-7777-777777777777', '${cust}',
            '44444444-4444-4444-4444-444444444444',
            '55555555-5555-5555-5555-555555555555',
            '${f2}', 60, 2000, 0, 0);
  `);
  try {
    await db.exec(`select public.confirm_payment('77777777-7777-7777-7777-777777777777', 'ecpay', 'X', 999);`);
    log('金額不符應拋錯', false, '居然成功');
  } catch (e) {
    log('金額不符應拋錯', e.message.includes('amount'), e.message.substring(0,80));
  }
}

// === 測試 5: cancel_booking 24h 全退 ===
console.log('\n[Test 5] cancel_booking 客戶 24h 前取消 → 全退');
await db.exec(`select set_config('request.jwt.claim.sub', '${cust}', false);`);
{
  const r = await db.query(`select public.cancel_booking('66666666-6666-6666-6666-666666666666', '臨時有事') as result`);
  const result = r.rows[0].result;
  log('回傳 refund_amount_ntd = 2000 (全退)', result.refund_amount_ntd === 2000, `got ${result.refund_amount_ntd}`);
  log('refund_pct = 1', Number(result.refund_pct) === 1, `got ${result.refund_pct}`);
  log('new_status = refunded', result.new_status === 'refunded');

  const b = await db.query(`select status, refund_amount_ntd, refunded_at from public.bookings where id='66666666-6666-6666-6666-666666666666'`);
  log('booking.status = refunded', b.rows[0].status === 'refunded');
  log('refunded_at 有寫入', !!b.rows[0].refunded_at);
}

// === 測試 6: 24h 內取消 → 50% 退款 ===
console.log('\n[Test 6] cancel_booking 24h 內 → 50% 退');
{
  const near = new Date(Date.now() + 12 * 3600 * 1000).toISOString(); // 12h 後
  await db.exec(`
    insert into public.bookings (id, customer_id, teacher_id, service_id, scheduled_at, duration_minutes, amount_ntd, status, paid_at)
    values ('88888888-8888-8888-8888-888888888888', '${cust}',
            '44444444-4444-4444-4444-444444444444',
            '55555555-5555-5555-5555-555555555555',
            '${near}', 60, 2000, 'paid', now());
  `);
  await db.exec(`select set_config('request.jwt.claim.sub', '${cust}', false);`);
  const r = await db.query(`select public.cancel_booking('88888888-8888-8888-8888-888888888888', '突然不能來') as result`);
  log('refund_amount_ntd = 1000 (50%)', r.rows[0].result.refund_amount_ntd === 1000, `got ${r.rows[0].result.refund_amount_ntd}`);
}

// === 測試 7: 老師取消 → 100% 退 ===
console.log('\n[Test 7] cancel_booking 老師取消 → 100% 退');
{
  const near = new Date(Date.now() + 12 * 3600 * 1000).toISOString();
  await db.exec(`
    insert into public.bookings (id, customer_id, teacher_id, service_id, scheduled_at, duration_minutes, amount_ntd, status, paid_at)
    values ('99999999-9999-9999-9999-999999999999', '${cust}',
            '44444444-4444-4444-4444-444444444444',
            '55555555-5555-5555-5555-555555555555',
            '${near}', 60, 2000, 'paid', now());
  `);
  await db.exec(`select set_config('request.jwt.claim.sub', '${teacherUser}', false);`);
  const r = await db.query(`select public.cancel_booking('99999999-9999-9999-9999-999999999999', '老師生病') as result`);
  log('老師取消 24h 內仍全退', r.rows[0].result.refund_amount_ntd === 2000, `got ${r.rows[0].result.refund_amount_ntd}`);
}

// === 測試 8: complete_booking → 自動發評價邀請 ===
console.log('\n[Test 8] complete_booking → 自動評價邀請通知');
{
  const past = new Date(Date.now() + 1000).toISOString();
  await db.exec(`
    insert into public.bookings (id, customer_id, teacher_id, service_id, scheduled_at, duration_minutes, amount_ntd, status, paid_at)
    values ('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '${cust}',
            '44444444-4444-4444-4444-444444444444',
            '55555555-5555-5555-5555-555555555555',
            '${past}', 60, 2000, 'paid', now());
  `);
  await db.exec(`select set_config('request.jwt.claim.sub', '${teacherUser}', false);`);
  await db.exec(`select public.complete_booking('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa');`);
  const b = await db.query(`select status, completed_at from public.bookings where id='aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'`);
  log('status = completed', b.rows[0].status === 'completed');
  log('completed_at 已寫入', !!b.rows[0].completed_at);
  const n = await db.query(`select count(*)::int as c from public.notifications where type='review_request' and user_id='${cust}'`);
  log('客戶收到評價邀請通知', n.rows[0].c === 1);

  // cases_count +1
  const t = await db.query(`select cases_count from public.teachers where id='44444444-4444-4444-4444-444444444444'`);
  log('老師 cases_count +1', t.rows[0].cases_count === 1, `got ${t.rows[0].cases_count}`);
}

// === Test 8b: update_booking_followup RPC ===
console.log('\n[Test 8b] update_booking_followup RPC');
{
  await db.exec(`select set_config('request.jwt.claim.sub', '${cust}', false);`);
  await db.exec(`select public.update_booking_followup('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '想再確認下一步');`);
  const b = await db.query(`select followup_question, followup_used_at from public.bookings where id='aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'`);
  log('followup_question updated by RPC', b.rows[0].followup_question === '想再確認下一步');
  log('followup_used_at set by RPC', !!b.rows[0].followup_used_at);
}

// === 測試 9: 評價 trigger 自動更新 rating ===
console.log('\n[Test 9] reviews → trigger 自動更新 teacher.rating');
{
  await db.exec(`
    insert into public.reviews (booking_id, customer_id, teacher_id, rating, comment)
    values ('aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '${cust}',
            '44444444-4444-4444-4444-444444444444', 5, '很棒');
  `);
  const t = await db.query(`select rating, total_reviews from public.teachers where id='44444444-4444-4444-4444-444444444444'`);
  log('rating = 5', Number(t.rows[0].rating) === 5);
  log('total_reviews = 1', t.rows[0].total_reviews === 1);
}

// === 測試 10: support_thread 客服工單 ===
console.log('\n[Test 10] create_support_thread');
{
  await db.exec(`select set_config('request.jwt.claim.sub', '${cust}', false);`);
  const r = await db.query(`select public.create_support_thread('payment','付款扣兩次','刷卡扣了 4000 但只預約一次',null) as id`);
  const id = r.rows[0].id;
  log('回傳 thread id', !!id);
  const t = await db.query(`select category, priority, status from public.support_threads where id='${id}'`);
  log('category = payment', t.rows[0].category === 'payment');
  log('priority = high (payment 自動升級)', t.rows[0].priority === 'high');
  log('status = open', t.rows[0].status === 'open');
  // admin 收到通知
  const n = await db.query(`select count(*)::int as c from public.notifications where user_id='${adminUser}' and type='support_new'`);
  log('admin 收到工單通知', n.rows[0].c === 1);
}

// === 測試 11: v_admin_stats view ===
console.log('\n[Test 11] v_admin_stats 後台統計 view');
{
  const r = await db.query(`select * from public.v_admin_stats`);
  const s = r.rows[0];
  log('active_teachers >= 1', s.active_teachers >= 1, `got ${s.active_teachers}`);
  log('open_tickets >= 1', s.open_tickets >= 1, `got ${s.open_tickets}`);
  log('欄位齊備', 'pending_apps' in s && 'total_platform_revenue' in s);
}

// === 測試 12: KYC 文件保留 90 天清除 ===
console.log('\n[Test 12] purge_old_kyc_docs');
{
  await db.exec(`
    insert into public.teacher_applications
      (id, user_id, status, legal_name, display_name, email, phone, specialties,
       intro_short, id_doc_front_url, reviewed_at)
    values ('bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '${cust}', 'rejected', '張三',
            '小三', 'a@b', '0911', array['塔羅'], '短介',
            'https://test/id.jpg', now() - interval '100 days');
  `);
  await db.exec(`select set_config('request.jwt.claim.sub', '${adminUser}', false);`);
  const r = await db.query(`select public.purge_old_kyc_docs() as n`);
  log('清除 1 筆過期 KYC', r.rows[0].n >= 1, `got ${r.rows[0].n}`);
  const a = await db.query(`select id_doc_front_url from public.teacher_applications where id='bbbb2222-bbbb-bbbb-bbbb-bbbbbbbbbbbb'`);
  log('id_doc_front_url 已被 NULL', a.rows[0].id_doc_front_url === null);
}

console.log(`\n============================`);
console.log(`P0 SQL 驗證：\x1b[32m${passed} 通過\x1b[0m / \x1b[31m${failed} 失敗\x1b[0m`);
process.exit(failed > 0 ? 1 : 0);
